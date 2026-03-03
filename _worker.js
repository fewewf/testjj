import { connect } from 'cloudflare:sockets';

// ===== 核心配置 =====
const SECRET_PATH = '/tunnel-vip-2026/auth-888999';
const FIXED_UUID = '56892533-7dad-475a-b0e8-51040d0d04ad';
const PROXY_IP = 'ProxyIP.FR.CMLiussss.net';
const PROXY_PORT = 443;

const ROBOT_HTML = `<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="padding:50px;"><h1>404 Not Found</h1><p>The resource could not be found.</p></body></html>`;

export default {
    async fetch(request) {
        const url = new URL(request.url);

        // 路径验证与伪装
        if (url.pathname !== SECRET_PATH) {
            return new Response(ROBOT_HTML, { status: 404, headers: { 'Content-Type': 'text/html' } });
        }

        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response('System Online', { status: 200 });
        }

        const wsPair = new WebSocketPair();
        const [clientWS, serverWS] = Object.values(wsPair);
        
        // 接受 WebSocket 连接
        serverWS.accept();

        // 异步启动处理逻辑，防止 fetch 挂起
        handleWebSocket(serverWS).catch(err => {
            console.error("Critical WS Error:", err.message);
            serverWS.close();
        });

        return new Response(null, { status: 101, webSocket: clientWS });
    }
};

async function handleWebSocket(serverWS) {
    const wsReadable = createWebSocketReadableStream(serverWS);
    let remoteSocket = null;
    let vlessHeaderData = null;
    let clientRawData = null;

    const reader = wsReadable.getReader();

    try {
        // 1. 读取 VLESS 首包并解析
        const { done, value } = await reader.read();
        if (done) return;

        const result = parseVLESSHeader(value);
        if (result.hasError) throw new Error(result.message);

        vlessHeaderData = new Uint8Array([result.vlessVersion[0], 0]);
        clientRawData = value.slice(result.rawDataIndex);

        // 2. 尝试直连目标地址
        try {
            remoteSocket = await connect({
                hostname: result.addressRemote,
                port: result.portRemote
            }, { allowHalfOpen: true });
            
            // 写入初始数据
            const writer = remoteSocket.writable.getWriter();
            await writer.write(clientRawData);
            writer.releaseLock();

        } catch (connErr) {
            console.log(`Direct connect failed, trying fallback: ${connErr.message}`);
            // 3. Fallback: 尝试 ProxyIP
            remoteSocket = await connect({
                hostname: PROXY_IP,
                port: PROXY_PORT
            }, { allowHalfOpen: true });

            const writer = remoteSocket.writable.getWriter();
            await writer.write(clientRawData);
            writer.releaseLock();
        }

        // 4. 建立双向管道
        // 远程 -> WebSocket (使用简洁版转发)
        const remoteToWsPromise = pipeRemoteToWebSocket(remoteSocket, serverWS, vlessHeaderData);
        
        // WebSocket -> 远程 (继续消费剩余的 Reader 数据)
        const wsToRemotePromise = (async () => {
            const writer = remoteSocket.writable.getWriter();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    await writer.write(value);
                }
            } finally {
                writer.releaseLock();
            }
        })();

        // 等待任意一端关闭
        await Promise.race([remoteToWsPromise, wsToRemotePromise]);

    } catch (err) {
        console.error("HandleWS Error:", err.message);
    } finally {
        reader.releaseLock();
        if (remoteSocket) try { remoteSocket.close(); } catch {}
        if (serverWS.readyState === 1) serverWS.close();
    }
}

/**
 * 远程读取并发送至 WebSocket
 * 去掉了高开销的 setInterval 缓冲逻辑，改用系统自动缓冲
 */
async function pipeRemoteToWebSocket(remoteSocket, ws, vlessHeader) {
    const reader = remoteSocket.readable.getReader();
    let headerSent = false;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (ws.readyState !== 1) break;

            if (!headerSent) {
                const combined = new Uint8Array(vlessHeader.byteLength + value.byteLength);
                combined.set(vlessHeader, 0);
                combined.set(value, vlessHeader.byteLength);
                ws.send(combined);
                headerSent = true;
            } else {
                // 自动分片发送
                ws.send(value);
            }
        }
    } finally {
        reader.releaseLock();
    }
}

function createWebSocketReadableStream(ws) {
    return new ReadableStream({
        start(controller) {
            ws.addEventListener('message', e => controller.enqueue(new Uint8Array(e.data)));
            ws.addEventListener('close', () => controller.close());
            ws.addEventListener('error', e => controller.error(e));
        }
    });
}

function parseVLESSHeader(buffer) {
    if (buffer.byteLength < 24) return { hasError: true, message: 'Invalid header' };
    const view = new DataView(buffer.buffer);
    const uuid = Array.from(new Uint8Array(buffer.slice(1, 17))).map(b => b.toString(16).padStart(2, '0')).join('');
    if (uuid !== FIXED_UUID.replace(/-/g, '')) return { hasError: true, message: 'Unauthorized' };

    const optLen = view.getUint8(17);
    let offset = 18 + optLen;
    const cmd = view.getUint8(offset++);
    const port = view.getUint16(offset); offset += 2;
    const addrType = view.getUint8(offset++);
    let address = '';

    if (addrType === 1) {
        address = Array.from(new Uint8Array(buffer.slice(offset, offset + 4))).join('.');
        offset += 4;
    } else if (addrType === 2) {
        const len = view.getUint8(offset++);
        address = new TextDecoder().decode(buffer.slice(offset, offset + len));
        offset += len;
    } else if (addrType === 3) {
        address = Array.from({ length: 8 }, (_, i) => view.getUint16(offset + i * 2).toString(16)).join(':');
        offset += 16;
    }

    return { hasError: false, addressRemote: address, portRemote: port, rawDataIndex: offset, vlessVersion: new Uint8Array(buffer.slice(0, 1)) };
}
