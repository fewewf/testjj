import { connect } from 'cloudflare:sockets';

// 配置：建议通过 Cloudflare Worker 的环境变量（Settings -> Variables）设置
const AUTH_TOKEN = 'your-secret-token'; // 只有匹配此 Token 才建立连接
const DEFAULT_PROXY_IP = '1.2.3.4';     // 你的后端服务器 IP
const DEFAULT_PROXY_PORT = 443;         // 你的后端服务器端口

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const upgradeHeader = request.headers.get('Upgrade');

    // 1. 验证访问权限：如果不是特定的路径或没有 Token，返回伪装页面
    if (upgradeHeader !== 'websocket' || url.pathname !== `/${env.AUTH_TOKEN || AUTH_TOKEN}`) {
      return new Response(generateFakePage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 2. 建立 WebSocket 隧道
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    server.accept();

    // 3. 建立出站 TCP 连接 (Socket)
    // 锁定目标：不要从 URL 动态获取，这样可以极大降低被判定为“开放代理”的风险
    try {
      const tcpSocket = connect({
        hostname: env.PROXY_IP || DEFAULT_PROXY_IP,
        port: parseInt(env.PROXY_PORT || DEFAULT_PROXY_PORT),
      });

      // 双向数据转发逻辑
      handleTunnel(server, tcpSocket);

      return new Response(null, { status: 101, webSocket: client });
    } catch (err) {
      return new Response('Service Unavailable', { status: 503 });
    }
  }
};

/**
 * 管道化处理数据流：将 WebSocket 数据无缝对接到 TCP Socket
 */
async function handleTunnel(ws, socket) {
  // 从 Socket 读取并发送给 WS
  socket.readable.pipeTo(new WritableStream({
    write(chunk) {
      if (ws.readyState === 1) ws.send(chunk);
    },
    close() { ws.close(); },
    abort(err) { ws.close(); }
  })).catch(() => {});

  // 从 WS 读取并发送给 Socket
  const reader = new ReadableStream({
    start(controller) {
      ws.addEventListener('message', e => controller.enqueue(e.data));
      ws.addEventListener('close', () => controller.close());
      ws.addEventListener('error', () => controller.abort());
    }
  });

  reader.pipeTo(socket.writable).catch(() => {});
}

/**
 * 伪装页面内容：看起来像一个正常的个人博客或工具页
 */
function generateFakePage() {
  return `<html><body style="font-family: sans-serif; padding: 2rem;">
    <h1>Personal API Gateway</h1>
    <p>Status: <span style="color: green;">Online</span></p>
    <hr>
    <p>This is a private service endpoint for internal data synchronization.</p>
  </body></html>`;
}
