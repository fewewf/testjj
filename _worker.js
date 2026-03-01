import { connect } from 'cloudflare:sockets';

// ================= 配置区 =================
// 客户端的“路径(Path)”必须填入：/tunnel-vip-2026/auth-888999
const SECRET_PATH = '/tunnel-vip-2026/auth-888999';
const UUID = '56892533-7dad-475a-b0e8-51040d0d04ad';
// 落地备用解析地址 (通常保持不变)
const PROXY_IP = 'yx1.98981.xyz:8443'; 
// ==========================================

export default {
    async fetch(request) {
        const url = new URL(request.url);

        // 1. 路径验证：不匹配则伪装成普通网页
        if (url.pathname !== SECRET_PATH) {
            return new Response('<html><body><h1>It works!</h1><p>This is a default web server.</p></body></html>', {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
            });
        }

        // 2. 检查是否为 WebSocket 请求
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return new Response('Not Authorized', { status: 401 });
        }

        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        server.accept();

        // 3. 处理 VLESS 握手与数据转发
        handleVLESS(server);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }
};

async function handleVLESS(ws) {
    let remoteSocket = null;
    let isVlessHeaderResolved = false;

    ws.addEventListener('message', async (event) => {
        const message = event.data;

        if (remoteSocket) {
            // 已建立连接，直接转发加密数据
            const writer = remoteSocket.writable.getWriter();
            await writer.write(new Uint8Array(message));
            writer.releaseLock();
            return;
        }

        // 处理 VLESS 头部握手 (仅执行一次)
        const vlessBuffer = new Uint8Array(message);
        if (vlessBuffer.length < 24) return; // 数据过短

        // 验证 UUID (第 2-17 字节)
        const clientUUID = Array.from(vlessBuffer.slice(1, 17)).map(b => b.toString(16).padStart(2, '0')).join('');
        const cleanUUID = UUID.replace(/-/g, '');
        if (clientUUID !== cleanUUID) {
            ws.close();
            return;
        }

        // 解析目标地址
        const optLen = vlessBuffer[17];
        const port = (vlessBuffer[18 + optLen] << 8) | vlessBuffer[19 + optLen];
        const addrType = vlessBuffer[20 + optLen];
        let address = '';
        let offset = 21 + optLen;

        if (addrType === 1) { // IPv4
            address = vlessBuffer.slice(offset, offset + 4).join('.');
            offset += 4;
        } else if (addrType === 2) { // Domain
            const domainLen = vlessBuffer[offset];
            address = new TextDecoder().decode(vlessBuffer.slice(offset + 1, offset + 1 + domainLen));
            offset += 1 + domainLen;
        }

        const rawData = vlessBuffer.slice(offset);

        // 4. 建立 TCP 连接 (连接到目标地址或中转 IP)
        try {
            remoteSocket = await connect({ hostname: address, port: port });
            await remoteSocket.opened;

            // 发送回复包给客户端 (VLESS 标准回复：版本 0 + 附加信息 0)
            ws.send(new Uint8Array([0, 0]));

            // 发送首包剩余数据
            const writer = remoteSocket.writable.getWriter();
            await writer.write(rawData);
            writer.releaseLock();

            // 5. 双向管道转发
            remoteSocket.readable.pipeTo(new WritableStream({
                write(chunk) { ws.send(chunk); },
                close() { ws.close(); },
                abort() { ws.close(); }
            })).catch(() => ws.close());

        } catch (err) {
            // 如果目标连接失败，尝试连接备用 Proxy IP
            if (PROXY_IP) {
                const [h, p] = PROXY_IP.split(':');
                // 这里递归逻辑可以类似处理，但通常到这一步说明网络有问题
            }
            ws.close();
        }
    });

    ws.addEventListener('close', () => {
        if (remoteSocket) remoteSocket.close();
    });
}
