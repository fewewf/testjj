import { connect } from 'cloudflare:sockets';

// --- [配置区] ---
const SECRET_PATH = '/tunnel-vip-2026/auth-888999';
const FIXED_UUID = '56892533-7dad-475a-b0e8-51040d0d04ad';
const PROXY_IP = 'ProxyIP.FR.CMLiussss.net'; // 反代IP
const PROXY_PORT = 443;

// --- [伪装内容] ---
const ROBOT_HTML = `<!DOCTYPE html><html><head><title>Edge Tech Services</title></head><body style="font-family:sans-serif;padding:40px;"><h1>404 Not Found</h1><p>The requested resource was not found on this edge node.</p></body></html>`;
const MOCK_API = { status: "healthy", node: "cf-global-edge", version: "2.0.1", region: "auto" };

// --- [全局常量] ---
const WS_READY_STATE_OPEN = 1;

export default {
    async fetch(request) {
        try {
            const url = new URL(request.url);
            const ua = request.headers.get('User-Agent') || '';

            // 1. 路径与伪装逻辑 (防探测)
            if (url.pathname !== SECRET_PATH) {
                // 如果是爬虫，返回伪装 HTML
                if (ua.toLowerCase().includes('bot') || ua.toLowerCase().includes('spider')) {
                    return new Response(ROBOT_HTML, { headers: { "Content-Type": "text/html" } });
                }
                // 普通访问返回模拟 API
                return new Response(JSON.stringify(MOCK_API), { 
                    status: 200, 
                    headers: { "Content-Type": "application/json" } 
                });
            }

            // 2. WebSocket 升级检查
            const upgradeHeader = request.headers.get('Upgrade');
            if (upgradeHeader !== 'websocket') {
                return new Response('Unauthorized', { status: 401 });
            }

            // 3. 进入高性能处理逻辑
            return await handleVLESSWebSocket(request);

        } catch (err) {
            return new Response(err.stack, { status: 500 });
        }
    },
};

async function handleVLESSWebSocket(request) {
    const wsPair = new WebSocketPair();
    const [clientWS, serverWS] = Object.values(wsPair);

    serverWS.accept();

    // 心跳保活 (解决长连接断开)
    let heartbeat = setInterval(() => {
        if (serverWS.readyState === WS_READY_STATE_OPEN) {
            serverWS.send(new Uint8Array(0));
        }
    }, 30000);

    const clearRes = () => {
        clearInterval(heartbeat);
        if (serverWS.readyState === WS_READY_STATE_OPEN) serverWS.close();
    };

    serverWS.addEventListener('close', clearRes);
    serverWS.addEventListener('error', clearRes);

    // 使用 ReadableStream 处理输入流
    const wsReadable = createWebSocketReadableStream(serverWS);
    let remoteSocket = null;

    wsReadable.pipeTo(new WritableStream({
        async write(chunk) {
            if (remoteSocket) {
                const writer = remoteSocket.writable.getWriter();
                await writer.write(chunk);
                writer.releaseLock();
                return;
            }

            // 协议头部解析
            const result = parseVLESSHeader(chunk);
            if (result.hasError) throw new Error(result.message);

            const vlessRespHeader = new Uint8Array([result.vlessVersion[0], 0]);
            const rawClientData = chunk.slice(result.rawDataIndex);

            // 处理 TCP 连接 (带 Fallback 机制)
            try {
                remoteSocket = await connectToRemote(result.addressRemote, result.portRemote);
                const writer = remoteSocket.writable.getWriter();
                await writer.write(rawClientData);
                writer.releaseLock();

                // 启动从远程到客户端的反向管道
                pipeRemoteToWebSocket(remoteSocket, serverWS, vlessRespHeader);
            } catch (err) {
                if (serverWS.readyState === WS_READY_STATE_OPEN) {
                    serverWS.close(1011, 'Remote connection failed');
                }
            }
        },
        close() {
            if (remoteSocket) remoteSocket.close();
        }
    })).catch(err => {
        console.error("Pipeline error:", err);
        clearRes();
    });

    return new Response(null, { status: 101, webSocket: clientWS });
}

async function connectToRemote(address, port) {
    try {
        // 直连尝试
        const socket = connect({ hostname: address, port: port });
        await socket.opened;
        return socket;
    } catch (e) {
        // 失败则通过 ProxyIP 转发 (解决 Telegram 等封锁 IP)
        const socket = connect({ hostname: PROXY_IP, port: PROXY_PORT });
        await socket.opened;
        return socket;
    }
}

// 高性能管道：分片、缓存控制、毫秒级 Flush
async function pipeRemoteToWebSocket(remoteSocket, ws, vlessHeader) {
    const reader = remoteSocket.readable.getReader();
    let headerSent = false;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (ws.readyState !== WS_READY_STATE_OPEN) break;

            if (!headerSent) {
                // --- 修复关键点：分开两次 send，确保协议栈完全识别 ---
                // 第一步：发送 VLESS 协议响应头 (0, 0)
                ws.send(vlessHeader);
                
                // 第二步：紧接着发送真实的远程数据 (TLS 握手包)
                ws.send(value);
                
                headerSent = true;
            } else {
                // 后续数据保持原样，不做任何处理
                ws.send(value);
            }
        }
    } catch (e) {
        console.error("Remote read error:", e);
    } finally {
        reader.releaseLock();
        // 增加延迟关闭，防止最后的数据包还没发完连接就断了
        setTimeout(() => {
            if (ws.readyState === WS_READY_STATE_OPEN) ws.close();
        }, 1000);
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
    const cleanFixedUUID = FIXED_UUID.replace(/-/g, '');
    
    if (uuid !== cleanFixedUUID) return { hasError: true, message: 'Auth failed' };

    let offset = 18 + view.getUint8(17);
    const cmd = view.getUint8(offset++); 
    const port = view.getUint16(offset); offset += 2;
    const addrType = view.getUint8(offset++);
    let address = '';

    if (addrType === 1) {
        address = Array.from(new Uint8Array(buffer.slice(offset, offset + 4))).join('.');
    } else if (addrType === 2) {
        const len = view.getUint8(offset++);
        address = new TextDecoder().decode(buffer.slice(offset, offset + len));
    } else if (addrType === 3) {
        address = Array.from({length:8}, (_,i)=>view.getUint16(offset+i*2).toString(16)).join(':');
    }

    return { hasError: false, addressRemote: address, portRemote: port, rawDataIndex: offset + (addrType === 1 ? 4 : addrType === 2 ? 0 : 16), vlessVersion: new Uint8Array(buffer.slice(0, 1)) };
}
