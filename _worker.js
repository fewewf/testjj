import { connect } from 'cloudflare:sockets';

// --- [配置区] ---
const SECRET_PATH = '/tunnel-vip-2026/auth-888999';
const FIXED_UUID = '56892533-7dad-475a-b0e8-51040d0d04ad';
const PROXY_IP = 'ProxyIP.FR.CMLiussss.net'; 
const PROXY_PORT = 443;

// --- [伪装内容] ---
const ROBOT_HTML = `<!DOCTYPE html><html><head><title>Technical Documentation</title></head><body style="font-family:sans-serif;padding:40px;"><h1>Edge Service Documentation</h1><p>Welcome to the global edge network node. This endpoint is reserved for internal microservices.</p></body></html>`;
const MOCK_API = { status: "success", node: "cf-edge-node", uptime: "99.99%", services: "online" };

// --- [常量定义] ---
const WS_READY_STATE_OPEN = 1;

export default {
    async fetch(request) {
        try {
            const url = new URL(request.url);
            const ua = request.headers.get('User-Agent') || '';

            // 1. 路径与伪装逻辑 (防探测)
            if (url.pathname !== SECRET_PATH) {
                if (ua.toLowerCase().includes('bot') || ua.toLowerCase().includes('spider')) {
                    return new Response(ROBOT_HTML, { headers: { "Content-Type": "text/html" } });
                }
                return new Response(JSON.stringify(MOCK_API), { status: 200, headers: { "Content-Type": "application/json" } });
            }

            // 2. 检查 WebSocket 升级
            if (request.headers.get('Upgrade') !== 'websocket') {
                return new Response('Hello World!', { status: 200 });
            }

            // 3. 进入核心 VLESS 逻辑
            return await handleVLESSWebSocket(request);
        } catch (err) {
            return new Response(err.stack, { status: 500 });
        }
    }
};

async function handleVLESSWebSocket(request) {
    const wsPair = new WebSocketPair();
    const [clientWS, serverWS] = Object.values(wsPair);
    serverWS.accept();

    // 心跳保活 (保持长连接)
    let heartbeat = setInterval(() => {
        if (serverWS.readyState === WS_READY_STATE_OPEN) {
            try { serverWS.send(new Uint8Array(0)); } catch (e) {}
        }
    }, 30000);

    const closeAll = () => {
        clearInterval(heartbeat);
        if (serverWS.readyState === WS_READY_STATE_OPEN) serverWS.close();
    };

    serverWS.addEventListener('close', closeAll);
    serverWS.addEventListener('error', closeAll);

    // 协议流处理
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

            // 解析 VLESS 头部
            const result = parseVLESSHeader(chunk);
            if (result.hasError) throw new Error(result.message);

            const vlessRespHeader = new Uint8Array([result.vlessVersion[0], 0]);
            const rawClientData = chunk.slice(result.rawDataIndex);

            // 建立连接 (参考正常代码的重试逻辑思想)
            try {
                // 优先尝试通过反代连接 (解决 YouTube/Google 等 SSL 协议报错)
                remoteSocket = await connect({ hostname: PROXY_IP, port: PROXY_PORT }, { allowHalfOpen: true });
                const writer = remoteSocket.writable.getWriter();
                await writer.write(rawClientData);
                writer.releaseLock();

                // 启动关键的高性能管道 (移植了正常代码的分片逻辑)
                pipeRemoteToWebSocket(remoteSocket, serverWS, vlessRespHeader);
            } catch (err) {
                if (serverWS.readyState === WS_READY_STATE_OPEN) {
                    serverWS.close(1011, 'Connection failed: ' + err.message);
                }
            }
        },
        close() { if (remoteSocket) remoteSocket.close(); }
    })).catch(err => {
        console.error("Pipeline Error:", err);
        closeAll();
    });

    return new Response(null, { status: 101, webSocket: clientWS });
}

/**
 * 核心移植：高性能分片与缓存刷新管道
 * 这是解决 YouTube SSL 报错的关键
 */
async function pipeRemoteToWebSocket(remoteSocket, ws, vlessHeader) {
    const MAX_CHUNK_SIZE = 128 * 1024; // 128 KB 分帧
    const MAX_BUFFER_SIZE = 2 * 1024 * 1024; // 2 MB 强刷
    const FLUSH_INTERVAL = 10; // 10ms 定期刷新

    let headerSent = false;
    let bufferQueue = [];
    let bufferedBytes = 0;

    const concatChunks = (chunks) => {
        const total = chunks.reduce((sum, c) => sum + c.byteLength, 0);
        const merged = new Uint8Array(total);
        let offset = 0;
        for (const c of chunks) { merged.set(c, offset); offset += c.byteLength; }
        return merged;
    };

    const flush = () => {
        if (ws.readyState !== WS_READY_STATE_OPEN || bufferQueue.length === 0) return;
        const merged = concatChunks(bufferQueue);
        bufferQueue = [];
        bufferedBytes = 0;

        // 分包发送，防止 WebSocket 帧过载
        let offset = 0;
        while (offset < merged.byteLength) {
            const end = Math.min(offset + MAX_CHUNK_SIZE, merged.byteLength);
            ws.send(merged.slice(offset, end));
            offset = end;
        }
    };

    const flushTimer = setInterval(flush, FLUSH_INTERVAL);
    const reader = remoteSocket.readable.getReader();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done || ws.readyState !== WS_READY_STATE_OPEN) break;

            if (!headerSent) {
                const combined = new Uint8Array(vlessHeader.byteLength + value.byteLength);
                combined.set(vlessHeader, 0);
                combined.set(value, vlessHeader.byteLength);
                bufferQueue.push(combined);
                bufferedBytes += combined.byteLength;
                headerSent = true;
            } else {
                bufferQueue.push(value);
                bufferedBytes += value.byteLength;
            }

            if (bufferedBytes >= MAX_BUFFER_SIZE) flush();
        }
    } finally {
        clearInterval(flushTimer);
        flush();
        reader.releaseLock();
        if (ws.readyState === WS_READY_STATE_OPEN) ws.close();
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
    if (buffer.byteLength < 24) return { hasError: true, message: 'Invalid Header' };
    const view = new DataView(buffer.buffer);
    const uuid = Array.from(new Uint8Array(buffer.slice(1, 17))).map(b => b.toString(16).padStart(2, '0')).join('');
    const cleanUUID = FIXED_UUID.replace(/-/g, '');
    if (uuid !== cleanUUID) return { hasError: true, message: 'Unauthorized' };

    let offset = 18 + view.getUint8(17);
    const cmd = view.getUint8(offset++); 
    const port = view.getUint16(offset); offset += 2;
    const addrType = view.getUint8(offset++);
    let address = '';

    if (addrType === 1) address = Array.from(new Uint8Array(buffer.slice(offset, offset + 4))).join('.');
    else if (addrType === 2) {
        const len = view.getUint8(offset++);
        address = new TextDecoder().decode(buffer.slice(offset, offset + len));
    } else if (addrType === 3) {
        address = Array.from({length:8}, (_,i)=>view.getUint16(offset+i*2).toString(16)).join(':');
    }

    return { hasError: false, addressRemote: address, portRemote: port, rawDataIndex: offset + (addrType === 1 ? 4 : addrType === 2 ? 0 : 16), vlessVersion: new Uint8Array(buffer.slice(0, 1)) };
}
