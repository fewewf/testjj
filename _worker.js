import { connect } from 'cloudflare:sockets';

const _cQndIdPFBwdwdfPS = '/t-vip-9026/auth-888999';
const _rcHzgeggsXmfUWrW = '56892533-7dad-324a-b0e8-51040d0d04ad';
// 建议：如果你是为了绕过 CF 环路，这里应该填一个非 CF 的 Proxy IP 或者优选反代 IP
const _JeHxQnQHudDPWbyN = 'yx1.9898981.xyz'; 
const _JsGTkSTJgBtAOVZl = 8443;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== _cQndIdPFBwdwdfPS) return new Response('Not Found', { status: 404 });
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('VLESS Service', { status: 200 });

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    _handleVLESS(server).catch(err => {
        // 忽略流取消等常见网络关闭报错
        if (!err.message.includes("cancelled")) console.error("WS Error:", err.message);
    });

    return new Response(null, { status: 101, webSocket: client });
  }
};

async function _handleVLESS(ws) {
  const wsReader = _getWSReader(ws).getReader();
  let remoteSocket = null;
  let vlessHeader = null;

  try {
    const { done, value } = await wsReader.read();
    if (done) return;

    const header = _parseVLESS(value);
    if (header.hasError) return;

    vlessHeader = new Uint8Array([header.vlessVersion[0], 0]);
    const payload = value.slice(header.rawDataIndex);

    // --- 修复 Fallback 逻辑 ---
    async function tryConnect(isFallback = false) {
        // 如果是直连，用目标的 host/port；如果是 Fallback，强制连接到你的反代节点
        const host = isFallback ? _JeHxQnQHudDPWbyN : header.addressRemote;
        const port = isFallback ? _JsGTkSTJgBtAOVZl : header.portRemote;
        
        const socket = await connect({ hostname: host, port: port }, { allowHalfOpen: true });
        const writer = socket.writable.getWriter();
        await writer.write(payload);
        writer.releaseLock();
        return socket;
    }

    try {
      remoteSocket = await tryConnect(false);
    } catch (e) {
      console.log(`直连失败（可能是CF环路），正在通过反代节点连接...`);
      remoteSocket = await tryConnect(true);
    }

    // 双向流传输
    const remoteToWs = (async () => {
      const reader = remoteSocket.readable.getReader();
      let first = true;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (first) {
            const combined = new Uint8Array(vlessHeader.length + value.length);
            combined.set(vlessHeader);
            combined.set(value, vlessHeader.length);
            if (ws.readyState === 1) ws.send(combined);
            first = false;
          } else {
            if (ws.readyState === 1) ws.send(value);
          }
        }
      } finally {
        reader.releaseLock();
      }
    })();

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
    // 捕获异常但不抛出，防止 Worker 崩溃
  } finally {
    wsReader.releaseLock();
    if (remoteSocket) remoteSocket.close();
    if (ws.readyState === 1) ws.close();
  }
}

// 辅助函数
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
