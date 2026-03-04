import { connect } from 'cloudflare:sockets';

const _cQndIdPFBwdwdfPS = '/t-vip-9026/auth-888999';
const _rcHzgeggsXmfUWrW = '56892533-7dad-324a-b0e8-51040d0d04ad';
// 作为 Fallback 节点（仅在直连失败时启用）
const _JeHxQnQHudDPWbyN = 'yx1.9898981.xyz'; 
const _JsGTkSTJgBtAOVZl = 8443;

export default {
    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname !== _cQndIdPFBwdwdfPS) return new Response('Not Found', { status: 404 });
        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response(JSON.stringify({ status: "UP", version: "2.4.2" }), { status: 200 });
        }

        const wsPair = new WebSocketPair();
        const [client, server] = Object.values(wsPair);
        server.accept();

        handleVLESS(server, request).catch(err => console.error("Critical:", err));

        return new Response(null, { status: 101, webSocket: client });
    }
};

async function handleVLESS(serverWS, request) {
    // 将 WebSocket 转换为 ReadableStream (参考第二份代码的稳定性写法)
    const wsReadable = new ReadableStream({
        start(controller) {
            serverWS.addEventListener('message', e => controller.enqueue(new Uint8Array(e.data)));
            serverWS.addEventListener('close', () => controller.close());
            serverWS.addEventListener('error', e => controller.error(e));
        }
    });

    const reader = wsReadable.getReader();
    let remoteSocket = null;
    let vlessHeader = null;

    try {
        // 1. 解析首包
        const { done, value } = await reader.read();
        if (done) return;

        const header = parseVLESSHeader(value);
        if (header.hasError) throw new Error(header.message);

        vlessHeader = new Uint8Array([header.vlessVersion[0], 0]);
        const firstPayload = value.slice(header.rawDataIndex);

        // 2. 尝试连接逻辑
        async function tryConnect(host, port) {
            const socket = await connect({ hostname: host, port: port }, { allowHalfOpen: true });
            const writer = socket.writable.getWriter();
            await writer.write(firstPayload); // 写入首包数据
            writer.releaseLock();
            return socket;
        }

        // --- 核心修复：优先直连 YouTube/Google ---
        try {
            remoteSocket = await tryConnect(header.addressRemote, header.portRemote);
        } catch (e) {
            // 只有直连失败（如访问 ip.sb）才进入这里
            console.log(`直连失败: ${header.addressRemote}，尝试 Fallback`);
            remoteSocket = await tryConnect(_JeHxQnQHudDPWbyN, _JsGTkSTJgBtAOVZl);
        }

        // 3. 建立双向管道 (完全参考第二份代码的 pipeTo 逻辑，确保 YouTube 不断连)
        const remoteToWs = remoteSocket.readable.pipeTo(new WritableStream({
            start() { /* 不在这里发 header，避免逻辑混乱 */ },
            write(chunk) {
                if (vlessHeader) {
                    const combined = new Uint8Array(vlessHeader.length + chunk.length);
                    combined.set(vlessHeader);
                    combined.set(chunk, vlessHeader.length);
                    serverWS.send(combined);
                    vlessHeader = null; // 发送一次后置空
                } else {
                    serverWS.send(chunk);
                }
            },
            close() { if (serverWS.readyState === 1) serverWS.close(); }
        }));

        const wsToRemote = new WritableStream({
            async write(chunk) {
                const writer = remoteSocket.writable.getWriter();
                await writer.write(chunk);
                writer.releaseLock();
            },
            close() { remoteSocket.close(); }
        });

        // 继续读取 WebSocket 剩余数据并写入远程
        await reader.read().then(function process({ done, value }) {
            if (done) return wsToRemote.close();
            return wsToRemote.getWriter().write(value).then(() => reader.read().then(process));
        });

    } catch (err) {
        console.error("Handler Error:", err);
    } finally {
        if (remoteSocket) remoteSocket.close();
        if (serverWS.readyState === 1) serverWS.close();
    }
}

// 保持不变的解析逻辑
function parseVLESSHeader(buffer) {
    if (buffer.byteLength < 24) return { hasError: true, message: 'Short Header' };
    const view = new DataView(buffer.buffer);
    const uuid = Array.from(new Uint8Array(buffer.slice(1, 17))).map(b => b.toString(16).padStart(2, '0')).join('');
    if (uuid !== _rcHzgeggsXmfUWrW.replace(/-/g, '')) return { hasError: true, message: 'Unauthorized' };

    let offset = 17;
    const addonsLen = view.getUint8(offset);
    offset += 1 + addonsLen + 1; // cmd
    const port = view.getUint16(offset);
    offset += 2;
    const addrType = view.getUint8(offset);
    offset += 1;

    let address = '';
    if (addrType === 1) {
        address = Array.from(new Uint8Array(buffer.slice(offset, offset + 4))).join('.');
        offset += 4;
    } else if (addrType === 2) {
        const len = view.getUint8(offset);
        offset += 1;
        address = new TextDecoder().decode(buffer.slice(offset, offset + len));
        offset += len;
    }
    return { hasError: false, addressRemote: address, portRemote: port, rawDataIndex: offset, vlessVersion: new Uint8Array(buffer.slice(0, 1)) };
}
