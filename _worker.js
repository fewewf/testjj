import { connect } from 'cloudflare:sockets';

const PROXY_IP = 'yx1.98981.xyz:8443'; 

export default {
  async fetch(request, env, ctx) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Worker is running', { status: 200 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    // ctx.waitUntil 确保异步转发不会被提前掐断
    ctx.waitUntil(this.handleWebSocket(server));

    return new Response(null, { status: 101, webSocket: client });
  },

  async handleWebSocket(ws) {
    let remoteConn = null;

    const onClose = () => {
      try { remoteConn?.close(); } catch (e) {}
      try { ws.close(); } catch (e) {}
    };

    ws.addEventListener('close', onClose);
    ws.addEventListener('error', onClose);

    // 处理首包和后续转发
    const reader = new ArrayBufferReader(ws);
    
    try {
      const firstPacket = await reader.readNext();
      if (!firstPacket) return onClose();

      const vless = this.parseVless(new Uint8Array(firstPacket));
      if (!vless) return onClose();

      // 尝试直连 (带 5 秒超时)
      try {
        remoteConn = connect({ hostname: vless.address, port: vless.port });
        await Promise.race([
          remoteConn.opened,
          new Promise((_, reject) => setTimeout(() => reject('Timeout'), 5000))
        ]);
      } catch (e) {
        // 失败则 Fallback 到 Proxy
        remoteConn = await this.connectProxy(vless.address, vless.port);
      }

      if (!remoteConn) return onClose();

      // 发送首包余下的数据
      const writer = remoteConn.writable.getWriter();
      await writer.write(firstPacket.slice(vless.offset));
      writer.releaseLock();

      // 极简双向流转发 (避免挂起的核心)
      const socketToWs = remoteConn.readable.pipeTo(new WritableStream({
        write(chunk) { if (ws.readyState === 1) ws.send(chunk); },
        close() { onClose(); }
      }));

      const wsToSocket = new ReadableStream({
        start(controller) {
          ws.addEventListener('message', e => controller.enqueue(e.data));
          ws.addEventListener('close', () => controller.close());
        }
      }).pipeTo(remoteConn.writable);

      await Promise.all([socketToWs, wsToSocket]);

    } catch (e) {
      onClose();
    }
  },

  async connectProxy(host, port) {
    try {
      const [pHost, pPort] = PROXY_IP.split(':');
      const proxy = connect({ hostname: pHost, port: parseInt(pPort) });
      const writer = proxy.writable.getWriter();
      await writer.write(new TextEncoder().encode(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n\r\n`));
      writer.releaseLock();
      return proxy;
    } catch (e) { return null; }
  },

  parseVless(buffer) {
    try {
      const addonLen = buffer[17];
      const addressIndex = 18 + addonLen;
      const port = (buffer[addressIndex + 1] << 8) | buffer[addressIndex + 2];
      const type = buffer[addressIndex + 3];
      let address = "", offset = addressIndex + 4;
      if (type === 1) { address = buffer.slice(offset, offset + 4).join('.'); offset += 4; }
      else if (type === 2) { 
        const len = buffer[offset]; 
        address = new TextDecoder().decode(buffer.slice(offset + 1, offset + 1 + len)); 
        offset += 1 + len; 
      }
      return { address, port, offset };
    } catch (e) { return null; }
  }
};

// 辅助类：处理 WebSocket 消息读取
class ArrayBufferReader {
  constructor(ws) {
    this.ws = ws;
    this.resolve = null;
    ws.addEventListener('message', e => this.resolve?.(e.data), { once: true });
  }
  readNext() {
    return new Promise(res => { this.resolve = res; });
  }
}
