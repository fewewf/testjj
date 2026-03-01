import { connect } from 'cloudflare:sockets';

const UUID = '9d4f89db-17bf-4158-9e0b-fe82dfeafa94';
const PROXY_IP = 'yx1.98981.xyz:8443'; 

export default {
  async fetch(request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('System Operational', { status: 200 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    // 关键修复：确保异步任务被正确触发且不影响主线程返回
    handleWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }
};

async function handleWebSocket(ws) {
  let remoteConn = null;
  let isFirstPacket = true;

  ws.addEventListener('message', async ({ data }) => {
    try {
      if (isFirstPacket) {
        // 解析 VLESS
        const vlessHeader = parseVlessHeader(new Uint8Array(data));
        if (!vlessHeader.address) {
          ws.close();
          return;
        }

        // 尝试连接
        try {
          remoteConn = connect({ hostname: vlessHeader.address, port: vlessHeader.port });
          await remoteConn.opened;
        } catch (e) {
          // Fallback
          remoteConn = await connectViaProxy(vlessHeader.address, vlessHeader.port);
        }

        if (remoteConn) {
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
  });

  ws.addEventListener('close', () => {
    if (remoteConn) remoteConn.close();
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

    const reader = proxy.readable.getReader();
    await reader.read(); // 跳过响应
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
  // 核心逻辑：直接从端口位置开始计算
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
  } else if (addressType === 3) {
    addressEndIndex += 16;
  }

  return { address, port, headerLength: addressEndIndex };
}
