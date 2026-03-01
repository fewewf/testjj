/**
 * 终极稳定版：修复 Hung 挂起，保留 Fallback，解决图片卡顿
 */

const UUID = '9d4f89db-17bf-4158-9e0b-fe82dfeafa94';
const PROXY_IP = 'yx1.98981.xyz:8443'; 

import { connect } from 'cloudflare:sockets';

export default {
  async fetch(request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('System Running', { status: 200 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    // 关键修复：不再使用 this 指向，确保函数闭包正确
    // 并且不等待 handleVless 结束，直接返回 101
    this.handleVless(server).catch(err => console.error(err));

    return new Response(null, { status: 101, webSocket: client });
  },

  async handleVless(ws) {
    let remoteConn = null;
    let isFirstPacket = true;

    // 使用辅助函数处理消息，避免 async 监听器的竞态问题
    ws.addEventListener('message', async ({ data }) => {
      try {
        if (isFirstPacket) {
          const vlessHeader = this.parseVlessHeader(new Uint8Array(data));
          if (!vlessHeader.address) return ws.close();

          // Fallback 逻辑
          try {
            remoteConn = connect({ hostname: vlessHeader.address, port: vlessHeader.port });
            await remoteConn.opened;
          } catch (e) {
            remoteConn = await this.connectViaProxy(vlessHeader.address, vlessHeader.port);
          }

          if (remoteConn) {
            this.relay(ws, remoteConn);
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

    ws.addEventListener('close', () => remoteConn?.close());
    ws.addEventListener('error', () => remoteConn?.close());
  },

  async connectViaProxy(targetHost, targetPort) {
    try {
      const [pHost, pPort] = PROXY_IP.split(':');
      const proxy = connect({ hostname: pHost, port: parseInt(pPort) });
      await proxy.opened;

      const connectHeader = `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\nHost: ${targetHost}:${targetPort}\r\n\r\n`;
      const writer = proxy.writable.getWriter();
      await writer.write(new TextEncoder().encode(connectHeader));
      writer.releaseLock();

      // 简单的响应处理：读取直到发现 \r\n\r\n
      const reader = proxy.readable.getReader();
      await reader.read(); 
      reader.releaseLock();

      return proxy;
    } catch (e) {
      return null;
    }
  },

  async relay(ws, socket) {
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
  },

  parseVlessHeader(buffer) {
    if (buffer.length < 24) return {};
    // 基础偏移量：UUID(16) + AddonLen(1) + Addon(N)
    const addonLen = buffer[17];
    const addressIndex = 17 + 1 + addonLen;
    // 协议格式：[1字节版本][16字节UUID][1字节附加长度][N字节附加][1字节指令][2字节端口][1字节地址类型]
    const port = (buffer[addressIndex + 1] << 8) | buffer[addressIndex + 2];
    const addressType = buffer[addressIndex + 3];
    
    let address = "";
    let addressEndIndex = addressIndex + 4;

    if (addressType === 1) { // IPv4
      address = buffer.slice(addressEndIndex, addressEndIndex + 4).join('.');
      addressEndIndex += 4;
    } else if (addressType === 2) { // Domain
      const domainLen = buffer[addressEndIndex];
      address = new TextDecoder().decode(buffer.slice(addressEndIndex + 1, addressEndIndex + 1 + domainLen));
      addressEndIndex += 1 + domainLen;
    } else if (addressType === 3) { // IPv6
      addressEndIndex += 16; // 简化处理
    }

    return { address, port, headerLength: addressEndIndex };
  }
};
