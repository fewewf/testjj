import { connect } from 'cloudflare:sockets';

const PROXY_IP = 'yx1.98981.xyz:8443'; 

export default {
  async fetch(request, env, ctx) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('System Running', { status: 200 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    // 关键修复：使用 ctx.waitUntil 延长 Worker 生命周期
    ctx.waitUntil(handleWebSocket(server));

    return new Response(null, { status: 101, webSocket: client });
  }
};

async function handleWebSocket(ws) {
  let remoteConn = null;
  let isFirstPacket = true;

  // 使用 Promise 处理首次握手，防止逻辑悬挂
  const processMessage = async (data) => {
    try {
      if (isFirstPacket) {
        const vlessHeader = parseVlessHeader(new Uint8Array(data));
        if (!vlessHeader.address) return ws.close();

        // 尝试连接目标
        try {
          remoteConn = connect({ hostname: vlessHeader.address, port: vlessHeader.port });
          await remoteConn.opened;
        } catch (e) {
          // Fallback 到代理
          remoteConn = await connectViaProxy(vlessHeader.address, vlessHeader.port);
        }

        if (remoteConn) {
          // 异步启动双向转发
          relayData(ws, remoteConn);
          const writer = remoteConn.writable.getWriter();
          await writer.write(data.slice(vlessHeader.headerLength));
          writer.releaseLock();
        }
        isFirstPacket = false;
      } else if (remoteConn) {
        const writer = remoteConn.writable.getWriter();
        await writer.write(data);
        writer.releaseLock();
      }
    } catch (err) {
      ws.close();
    }
  };

  ws.addEventListener('message', (event) => {
    processMessage(event.data);
  });

  ws.addEventListener('close', () => {
    remoteConn?.close();
  });
}

async function connectViaProxy(targetHost, targetPort) {
  try {
    const [pHost, pPort] = PROXY_IP.split(':');
    const proxy = connect({ hostname: pHost, port: parseInt(pPort) });
    await proxy.opened;

    const connectHeader = `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\nHost: ${targetHost}:${targetPort}\r\n\r\n`;
    const writer = proxy.writable.getWriter();
    await writer.write(new TextEncoder().encode(connectHeader));
    writer.releaseLock();

    // 读取响应头，直到发现双换行
    const reader = proxy.readable.getReader();
    await reader.read(); 
    reader.releaseLock();

    return proxy;
  } catch (e) {
    return null;
  }
}

async function relayData(ws, socket) {
  const reader = socket.readable.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (ws.readyState === 1) {
        ws.send(value);
      } else {
        break;
      }
    }
  } catch (e) {
  } finally {
    reader.releaseLock();
    ws.close();
  }
}

function parseVlessHeader(buffer) {
  if (buffer.length < 24) return {};
  const addonLen = buffer[17];
  const addressIndex = 17 + 1 + addonLen + 1;
  const port = (buffer[addressIndex] << 8) | buffer[addressIndex + 1];
  const addressType = buffer[addressIndex + 2];
  
  let address = "";
  let addressEndIndex = addressIndex + 3;

  if (addressType === 1) {
    address = buffer.slice(addressEndIndex, addressEndIndex + 4).join('.');
    addressEndIndex += 4;
  } else if (addressType === 2) {
    const domainLen = buffer[addressEndIndex];
    address = new TextDecoder().decode(buffer.slice(addressEndIndex + 1, addressEndIndex + 1 + domainLen));
    addressEndIndex += 1 + domainLen;
  }

  return { address, port, headerLength: addressEndIndex };
}
