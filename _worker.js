/**
 * 完整精简版：保留 Fallback，移除卡顿缓冲区
 * 适用于：Telegram 图片加载优化、网页流畅浏览
 */

const UUID = '9d4f89db-17bf-4158-9e0b-fe82dfeafa94';
const PROXY_IP = 'yx1.98981.xyz:8443'; // 你的备用代理地址

import { connect } from 'cloudflare:sockets';

export default {
  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('System Operational', { status: 200 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    this.handleVless(server);

    return new Response(null, { status: 101, webSocket: client });
  },

  async handleVless(ws) {
    let remoteConn = null;
    let isFirstPacket = true;

    ws.addEventListener('message', async ({ data }) => {
      if (isFirstPacket) {
        // 1. 解析 VLESS 头部
        const vlessHeader = this.parseVlessHeader(new Uint8Array(data));
        if (!vlessHeader.address) {
          ws.close();
          return;
        }

        // 2. 尝试连接逻辑 (Fallback 机制)
        try {
          // 优先直连
          remoteConn = connect({
            hostname: vlessHeader.address,
            port: vlessHeader.port,
          });
          await remoteConn.opened;
        } catch (e) {
          // 直连失败，回退到 Proxy IP
          console.log(`Fallback to Proxy: ${vlessHeader.address}`);
          remoteConn = await this.connectViaProxy(vlessHeader.address, vlessHeader.port);
        }

        if (remoteConn) {
          // 启动双向流转发 (不设缓冲)
          this.relay(ws, remoteConn);
          
          // 发送第一个包中除去 Header 后的剩余负载
          const writer = remoteConn.writable.getWriter();
          await writer.write(data.slice(vlessHeader.headerLength));
          writer.releaseLock();
        }
        isFirstPacket = false;
      } else if (remoteConn) {
        // 后续数据直接写入
        const writer = remoteConn.writable.getWriter();
        await writer.write(data);
        writer.releaseLock();
      }
    });

    ws.addEventListener('close', () => {
      remoteConn?.close();
    });
  },

  // 核心：通过 Proxy IP 建立连接 (HTTP CONNECT)
  async connectViaProxy(targetHost, targetPort) {
    try {
      const [pHost, pPort] = PROXY_IP.split(':');
      const proxy = connect({ hostname: pHost, port: parseInt(pPort) });
      await proxy.opened;

      const connectHeader = `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\nHost: ${targetHost}:${targetPort}\r\n\r\n`;
      const writer = proxy.writable.getWriter();
      await writer.write(new TextEncoder().encode(connectHeader));
      writer.releaseLock();

      const reader = proxy.readable.getReader();
      const { value } = await reader.read(); // 跳过 HTTP 响应头
      reader.releaseLock();

      return proxy;
    } catch (e) {
      return null;
    }
  },

  // 零延迟双向转发
  async relay(ws, socket) {
    const reader = socket.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (ws.readyState === 1) {
          ws.send(value); // 收到即发，修复图片卡顿
        }
      }
    } catch (e) {
    } finally {
      ws.close();
    }
  },

  // 简易 VLESS 协议解析
  parseVlessHeader(buffer) {
    if (buffer.length < 24) return {};
    const version = buffer[0];
    const uuid = Array.from(buffer.slice(1, 17)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 处理附加项长度
    const addonLen = buffer[17];
    const addressIndex = 17 + 1 + addonLen + 1;
    const port = (buffer[addressIndex] << 8) | buffer[addressIndex + 1];
    
    const addressType = buffer[addressIndex + 2];
    let address = "";
    let addressEndIndex = addressIndex + 3;

    if (addressType === 1) { // IPv4
      address = buffer.slice(addressEndIndex, addressEndIndex + 4).join('.');
      addressEndIndex += 4;
    } else if (addressType === 2) { // Domain
      const domainLen = buffer[addressEndIndex];
      address = new TextDecoder().decode(buffer.slice(addressEndIndex + 1, addressEndIndex + 1 + domainLen));
      addressEndIndex += 1 + domainLen;
    } else if (addressType === 3) { // IPv6
      address = `[${Array.from({length: 8}, (_, i) => (buffer[addressEndIndex + i*2] << 8 | buffer[addressEndIndex + i*2+1]).toString(16)).join(':')}]`;
      addressEndIndex += 16;
    }

    return {
      address,
      port,
      headerLength: addressEndIndex
    };
  }
};
