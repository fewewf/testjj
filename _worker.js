import { connect } from 'cloudflare:sockets';

const _cQndIdPFBwdwdfPS = '/t-vip-9026/auth-888999';
const _rcHzgeggsXmfUWrW = '56892533-7dad-324a-b0e8-51040d0d04ad';
const _JeHxQnQHudDPWbyN = 'ProxyIP.FR.CMLiussss.net';
const _JsGTkSTJgBtAOVZl = 443;

export default {
    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname !== _cQndIdPFBwdwdfPS) return new Response('Not Found', { status: 404 });
        if (request.headers.get('Upgrade') !== 'websocket') return new Response('UP', { status: 200 });

        const [client, server] = Object.values(new WebSocketPair());
        server.accept();

        _handleVLESS(server).catch(err => console.error("Critical WS Error:", err.message));

        return new Response(null, { status: 101, webSocket: client });
    }
};

async function _handleVLESS(ws) {
    const wsReader = _getWSReader(ws).getReader();
    let remoteSocket = null;
    let vlessRespHeader = null;
    let firstPayload = null;

    try {
        const { done, value } = await wsReader.read();
        if (done) return;

        const header = _parseVLESS(value);
        if (header.hasError) return;

        vlessRespHeader = new Uint8Array([header.vlessVersion[0], 0]);
        firstPayload = value.slice(header.rawDataIndex);

        // 尝试连接函数：封装了首包写入和锁释放
        const connectAndWrite = async (host, port) => {
            const socket = await connect({ hostname: host, port: port }, { allowHalfOpen: true });
            const writer = socket.writable.getWriter();
            await writer.write(firstPayload);
            writer.releaseLock();
            return socket;
        };

        try {
            // 策略 1: 直连 (YouTube, Google等)
            remoteSocket = await connectAndWrite(header.addressRemote, header.portRemote);
        } catch (e) {
            // 策略 2: Fallback (针对 ip.sb 等 CF 环路网站)
            // 注意：这里必须重新获取一个新的 socket，且确保之前的错误不会阻塞流
            console.log(`直连失败，转向反代节点: ${_JeHxQnQHudDPWbyN}`);
            remoteSocket = await connectAndWrite(_JeHxQnQHudDPWbyN, _JsGTkSTJgBtAOVZl);
        }

        // --- 数据转发逻辑 ---
        
        // 远程 -> WebSocket
        const remoteToWs = (async () => {
            const reader = remoteSocket.readable.getReader();
            let isFirst = true;
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (isFirst) {
                        const combined = new Uint8Array(vlessRespHeader.length + value.length);
                        combined.set(vlessRespHeader);
                        combined.set(value, vlessRespHeader.length);
                        if (ws.readyState === 1) ws.send(combined);
                        isFirst = false;
                    } else {
                        if (ws.readyState === 1) ws.send(value);
                    }
                }
            } finally {
                reader.releaseLock();
            }
        })();

        // WebSocket -> 远程
        const wsToRemote = (async () => {
            try {
                while (true) {
                    const { done, value } = await wsReader.read();
                    if (done) break;
                    const writer = remoteSocket.writable.getWriter();
                    await writer.write(value);
                    writer.releaseLock();
                }
            } finally {
                if (remoteSocket) remoteSocket.close();
            }
        })();

        await Promise.race([remoteToWs, wsToRemote]);

    } catch (err) {
        // 这里的捕获能有效防止 internal error 扩散
    } finally {
        wsReader.releaseLock();
        if (remoteSocket) try { remoteSocket.close(); } catch (e) {}
        if (ws.readyState === 1) ws.close();
    }
}

// 基础辅助函数
function _getWSReader(ws) {
    return new ReadableStream({
        start(controller) {
            ws.addEventListener('message', e => controller.enqueue(new Uint8Array(e.data)));
            ws.addEventListener('close', () => controller.close());
            ws.addEventListener('error', e => controller.error(e));
        }
    });
}

function _parseVLESS(data) {
    if (data.byteLength < 24) return { hasError: true };
    const view = new DataView(data.buffer);
    let offset = 17;
    const addonsLen = view.getUint8(offset);
    offset += 1 + addonsLen + 1;
    const port = view.getUint16(offset);
    offset += 2;
    const type = view.getUint8(offset);
    offset += 1;
    let address = '';
    if (type === 1) { address = Array.from(new Uint8Array(data.slice(offset, offset + 4))).join('.'); offset += 4; }
    else if (type === 2) { const len = view.getUint8(offset); offset += 1; address = new TextDecoder().decode(data.slice(offset, offset + len)); offset += len; }
    return { hasError: false, addressRemote: address, portRemote: port, rawDataIndex: offset, vlessVersion: new Uint8Array(data.slice(0, 1)) };
}
