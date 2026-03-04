import { connect } from 'cloudflare:sockets';

// ===== 核心配置 =====
const SECRET_PATH = '/tunnel-vip-2026/auth-888999';
const FIXED_UUID = '56892533-7dad-475a-b0e8-51040d0d04ad';
const PROXY_IP = 'ProxyIP.FR.CMLiussss.net';
const PROXY_PORT = 443;
const CONNECT_TIMEOUT = 5000; // 5秒连接超时

// ===== 高度仿真的 API 错误响应 =====
const API_ERROR_RESPONSE = (url, status = 404) => {
    const errorBody = {
        timestamp: new Date().toISOString(),
        status: status,
        error: status === 404 ? "Not Found" : (status === 403 ? "Forbidden" : "Internal Server Error"),
        message: `No endpoint found for: ${url.pathname}`,
        path: url.pathname,
        requestId: Math.random().toString(36).substring(2, 12).toUpperCase(),
        traceId: `TN-${Math.random().toString(36).substring(2, 10)}`
    };

    return new Response(JSON.stringify(errorBody), {
        status: status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
            'Server': 'nginx/1.24.0', // 伪装成特定版本的 Nginx
            'X-Frame-Options': 'SAMEORIGIN'
        }
    });
};

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const userAgent = request.headers.get('User-Agent') || '';

        // 1. 安全过滤：拦截常见的扫描器特征 (解决日志中出现的 Go-http-client)
        if (userAgent.includes('Go-http-client') || userAgent === '' || userAgent.includes('python-requests')) {
            return API_ERROR_RESPONSE(url, 403);
        }

        // 2. 路径深度验证
        if (url.pathname !== SECRET_PATH) {
            return API_ERROR_RESPONSE(url, 404);
        }

        // 3. 握手验证：非 WS 请求返回动态健康检查 (模拟正常 API 行为)
        if (request.headers.get('Upgrade') !== 'websocket') {
            const uptime = Math.floor(Math.random() * 5000) + 1200;
            return new Response(JSON.stringify({ 
                status: "UP", 
                details: {
                    node: "us-west-api-01",
                    uptime: `${uptime}s`,
                    load: [0.12, 0.05, 0.01]
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 4. 处理 WebSocket
        try {
            const wsPair = new WebSocketPair();
            const [clientWS, serverWS] = Object.values(wsPair);
            
            serverWS.accept();

            // 启动处理逻辑（传入 request 用于日志定位或后续扩展）
            handleWebSocket(serverWS).catch(err => {
                // 内部错误不再向外抛出 Exception，而是静默关闭
                if (serverWS.readyState === 1) serverWS.close();
            });

            return new Response(null, { 
                status: 101, 
                webSocket: clientWS,
                headers: {
                    'Upgrade': 'websocket',
                    'Connection': 'Upgrade'
                }
            });
        } catch (e) {
            return API_ERROR_RESPONSE(url, 500);
        }
    }
};

async function handleWebSocket(serverWS) {
    const wsReadable = createWebSocketReadableStream(serverWS);
    let remoteSocket = null;
    const reader = wsReadable.getReader();

    try {
        const { done, value } = await reader.read();
        if (done) return;

        const result = parseVLESSHeader(value);
        if (result.hasError) {
            serverWS.close();
            return;
        }

        const vlessHeaderData = new Uint8Array([result.vlessVersion[0], 0]);
        const clientRawData = value.slice(result.rawDataIndex);

        // 带有超时机制的连接函数
        const connectWithTimeout = async (host, port) => {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connect Timeout')), CONNECT_TIMEOUT)
            );
            return Promise.race([
                connect({ hostname: host, port: port }, { allowHalfOpen: true }),
                timeoutPromise
            ]);
        };

        // 尝试连接目标
        try {
            remoteSocket = await connectWithTimeout(result.addressRemote, result.portRemote);
        } catch (e) {
            // 直连失败，回退到 ProxyIP
            remoteSocket = await connectWithTimeout(PROXY_IP, PROXY_PORT);
        }

        // 写入初始数据
        const writer = remoteSocket.writable.getWriter();
        await writer.write(clientRawData);
        writer.releaseLock();

        // 建立双向管道
        const remoteToWs = pipeRemoteToWebSocket(remoteSocket, serverWS, vlessHeaderData);
        const wsToRemote = pipeWsToRemote(reader, remoteSocket);

        await Promise.race([remoteToWs, wsToRemote]);

    } catch (err) {
        // 捕获所有错误，防止 Worker Hung
    } finally {
        // 严格清理资源
        try { reader.releaseLock(); } catch {}
        if (remoteSocket) try { remoteSocket.close(); } catch {}
        if (serverWS.readyState === 1) serverWS.close();
    }
}

async function pipeRemoteToWebSocket(remoteSocket, ws, vlessHeader) {
    const reader = remoteSocket.readable.getReader();
    let headerSent = false;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done || ws.readyState !== 1) break;

            if (!headerSent) {
                const combined = new Uint8Array(vlessHeader.byteLength + value.byteLength);
                combined.set(vlessHeader, 0);
                combined.set(value, vlessHeader.byteLength);
                ws.send(combined);
                headerSent = true;
            } else {
                ws.send(value);
            }
        }
    } finally {
        reader.releaseLock();
    }
}

async function pipeWsToRemote(reader, remoteSocket) {
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
}

// 辅助函数保持原样，增加健壮性
function createWebSocketReadableStream(ws) {
    return new ReadableStream({
        start(controller) {
            ws.addEventListener('message', e => controller.enqueue(new Uint8Array(e.data)));
            ws.addEventListener('close', () => controller.close());
            ws.addEventListener('error', () => controller.close());
        }
    });
}

function parseVLESSHeader(buffer) {
    if (buffer.byteLength < 24) return { hasError: true };
    const view = new DataView(buffer.buffer);
    const uuid = Array.from(new Uint8Array(buffer.slice(1, 17))).map(b => b.toString(16).padStart(2, '0')).join('');
    if (uuid !== FIXED_UUID.replace(/-/g, '')) return { hasError: true };

    const optLen = view.getUint8(17);
    let offset = 18 + optLen;
    const cmd = view.getUint8(offset++); // 1: TCP, 2: UDP
    const port = view.getUint16(offset); offset += 2;
    const addrType = view.getUint8(offset++);
    let address = '';

    if (addrType === 1) { // IPv4
        address = Array.from(new Uint8Array(buffer.slice(offset, offset + 4))).join('.');
        offset += 4;
    } else if (addrType === 2) { // Domain
        const len = view.getUint8(offset++);
        address = new TextDecoder().decode(buffer.slice(offset, offset + len));
        offset += len;
    } else if (addrType === 3) { // IPv6
        address = Array.from({ length: 8 }, (_, i) => view.getUint16(offset + i * 2).toString(16)).join(':');
        offset += 16;
    }
    return { hasError: false, addressRemote: address, portRemote: port, rawDataIndex: offset, vlessVersion: new Uint8Array(buffer.slice(0, 1)) };
}
