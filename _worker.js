import { connect } from 'cloudflare:sockets';

// --- 配置区 ---
const SECRET_PATH = '/tunnel-vip-2026/auth-888999';
const UUID = '56892533-7dad-475a-b0e8-51040d0d04ad';
const PROXY_HOST = 'ProxyIP.FR.CMLiussss.net';
const PROXY_PORT = 443;

// --- 伪装内容 ---
const ROBOT_HTML = `<!DOCTYPE html><html><head><title>Technical Documentation</title></head><body style="font-family:sans-serif;padding:40px;"><h1>Edge Service Documentation</h1><p>Welcome to the global edge network node. This endpoint is reserved for internal microservices.</p></body></html>`;
const MOCK_API = { status: "success", node: "cf-edge-node", uptime: "99.99%", services: "online" };

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const ua = request.headers.get('User-Agent') || '';

    // 1. 路径与伪装逻辑
    if (url.pathname !== SECRET_PATH) {
      if (ua.toLowerCase().includes('bot') || ua.toLowerCase().includes('spider')) {
        return new Response(ROBOT_HTML, { headers: { "Content-Type": "text/html" } });
      }
      return new Response(JSON.stringify(MOCK_API), { headers: { "Content-Type": "application/json" } });
    }

    // 2. 检查 WebSocket 协议
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response(JSON.stringify({ error: "Unauthorized", code: 401 }), { status: 401 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    // 启动处理逻辑
    handleVLESS(server);

    return new Response(null, { status: 101, webSocket: client });
  }
};

async function handleVLESS(ws) {
  const cleanUUID = UUID.replace(/-/g, '');
  let remoteSocket = null;
  let writer = null;
  let keepAliveTimer = null;

  const closeAll = () => {
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    if (remoteSocket) remoteSocket.close();
    if (ws.readyState === 1) ws.close();
  };

  ws.addEventListener('message', async (event) => {
    try {
      const buf = new Uint8Array(event.data);

      if (!remoteSocket) {
        // --- VLESS 协议解析 ---
        if (buf.length < 24) return closeAll();
        const clientUUID = Array.from(buf.slice(1, 17)).map(b => b.toString(16).padStart(2, '0')).join('');
        if (clientUUID !== cleanUUID) return closeAll();

        let cursor = 18 + buf[17];
        const command = buf[cursor++]; 
        if (command !== 1) return closeAll(); // 仅支持 TCP

        const port = (buf[cursor] << 8) | buf[cursor + 1];
        cursor += 2;
        const addrType = buf[cursor++];
        let address = '';

        if (addrType === 1) address = buf.slice(cursor, cursor + 4).join('.');
        else if (addrType === 2) {
          const len = buf[cursor];
          address = new TextDecoder().decode(buf.slice(cursor + 1, cursor + 1 + len));
          cursor += 1 + len;
        } else if (addrType === 3) {
          address = Array.from({length:8}, (_,i)=>((buf[cursor+i*2]<<8)|buf[cursor+i*2+1]).toString(16)).join(':');
          cursor += 16;
        }

        const dataToForward = buf.slice(cursor);

        // --- 建立连接 (带超时保护) ---
        remoteSocket = await Promise.race([
          connectWithFallback(address, port),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connect Timeout')), 10000))
        ]);

        writer = remoteSocket.writable.getWriter();
        ws.send(new Uint8Array([0, 0])); 

        // 启动保活 (带抖动)
        keepAliveTimer = setInterval(() => {
          if (ws.readyState === 1) ws.send(new Uint8Array(0));
        }, 30000 + Math.random() * 5000);

        // 启动管道
        pipeTCP2WS(ws, remoteSocket);

        if (dataToForward.length > 0) await writer.write(dataToForward);
        return;
      }

      // 后续数据
      await writer.write(buf);

    } catch (err) {
      console.error(`[Fatal] ${err.message}`);
      closeAll();
    }
  });

  ws.addEventListener('close', closeAll);
  ws.addEventListener('error', closeAll);
}

async function connectWithFallback(address, port) {
  try {
    const socket = connect({ hostname: address, port });
    await socket.opened;
    return socket;
  } catch (e) {
    // 触发 Fallback
    const socket = connect({ hostname: PROXY_HOST, port: PROXY_PORT });
    await socket.opened;
    return socket;
  }
}

/**
 * 核心稳定版管道：彻底修复 Hang 报错
 */
async function pipeTCP2WS(ws, socket) {
  const reader = socket.readable.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done || ws.readyState !== 1) break;

      // --- 背压逃逸控制 ---
      if (ws.bufferedAmount > 1024 * 1024) { // 提高到 1MB 阈值
        let safetyCounter = 0;
        // 最多等待 5 秒，超过则强制继续或跳出，防止 Worker 被判定为 Hang
        while (ws.bufferedAmount > 256 * 1024 && ws.readyState === 1 && safetyCounter < 50) {
          await new Promise(r => setTimeout(r, 100));
          safetyCounter++;
        }
        if (safetyCounter >= 50) {
          console.warn("Buffer clear timeout - safety break triggered");
          break; 
        }
      }

      ws.send(value);
    }
  } catch (e) {
    console.error(`Pipe error: ${e.message}`);
  } finally {
    reader.releaseLock();
    if (ws.readyState === 1) ws.close();
  }
}
