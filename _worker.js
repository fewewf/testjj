import { connect } from 'cloudflare:sockets';

const _cQndIdPFBwdwdfPS = '/t-vip-9026/auth-888999';
const _rcHzgeggsXmfUWrW = '56892533-7dad-324a-b0e8-51040d0d04ad';
const _JeHxQnQHudDPWbyN = 'ProxyIP.FR.CMLiussss.net';
const _JsGTkSTJgBtAOVZl = 443;

const WS_READY_STATE_OPEN = 1;
const CONNECTION_TIMEOUT = 5000; // 5秒超时

const _KtFJDaQcgkFDwTLY = (_yRsSyhpBCxFbqNPU, _HpkuToMJSAvwPNva = 404) => {
  const _XwbeLFBOTVlfgfaV = {
    timestamp: new Date().toISOString(),
    status: _HpkuToMJSAvwPNva,
    error: _HpkuToMJSAvwPNva === 404 ? "Not Found" : "Unauthorized",
    message: `No static resource or API endpoint found for: ${_yRsSyhpBCxFbqNPU.pathname}`,
    path: _yRsSyhpBCxFbqNPU.pathname,
    requestId: Math.random().toString(36).substring(2, 15).toUpperCase(),
    service: "api-gateway-v2"
  };
  return new Response(JSON.stringify(_XwbeLFBOTVlfgfaV), {
    status: _HpkuToMJSAvwPNva,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'DENY',
      'Server': 'nginx'
    }
  });
};

export default {
  async fetch(_gAaPbetxNIakJQKw) {
    const _yRsSyhpBCxFbqNPU = new URL(_gAaPbetxNIakJQKw.url);
    if (_yRsSyhpBCxFbqNPU.pathname !== _cQndIdPFBwdwdfPS) {
      return _KtFJDaQcgkFDwTLY(_yRsSyhpBCxFbqNPU, 404);
    }
    if (_gAaPbetxNIakJQKw.headers.get('Upgrade') !== 'websocket') {
      return new Response(JSON.stringify({
        status: "UP",
        version: "2.4.1-RELEASE",
        uptime: Math.floor(Math.random() * 100000) + "s"
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    const _sdTNvSnQHgfISqwc = new WebSocketPair();
    const [_cIMstliQdZbHDVpr, _zNeFASTClFTonTIr] = Object.values(_sdTNvSnQHgfISqwc);
    _zNeFASTClFTonTIr.accept();
    
    // 直接处理，不等待
    handleWebSocket(_zNeFASTClFTonTIr).catch(err => {
      console.error("WebSocket Error:", err.message);
      try { _zNeFASTClFTonTIr.close(); } catch(e) {}
    });
    
    return new Response(null, {
      status: 101,
      webSocket: _cIMstliQdZbHDVpr,
      headers: {
        'Sec-WebSocket-Protocol': _gAaPbetxNIakJQKw.headers.get('Sec-WebSocket-Protocol') || '',
        'Connection': 'Upgrade',
        'Upgrade': 'websocket'
      }
    });
  }
};

async function handleWebSocket(ws) {
  let targetSocket = null;
  let wsClosed = false;
  
  // 监听关闭事件
  ws.addEventListener('close', () => { wsClosed = true; });
  ws.addEventListener('error', () => { wsClosed = true; });
  
  try {
    // 1. 创建WebSocket可读流
    const wsReader = createWebSocketReader(ws).getReader();
    
    // 2. 读取第一个消息（VLESS头）
    const { value: firstMessage } = await wsReader.read();
    if (!firstMessage || wsClosed) return;
    
    const parsed = parseVLESSHeader(firstMessage);
    if (parsed.hasError) throw new Error(parsed.message);
    
    const vlessHeader = new Uint8Array([parsed.vlessVersion[0], 0]);
    const initialData = firstMessage.slice(parsed.rawDataIndex);
    
    // 3. 先尝试直接连接
    let useProxy = false;
    try {
      console.log(`Attempting direct connection to ${parsed.addressRemote}:${parsed.portRemote}`);
      targetSocket = await connectWithTimeout({
        hostname: parsed.addressRemote,
        port: parsed.portRemote
      }, CONNECTION_TIMEOUT);
    } catch (err) {
      console.log(`Direct connection failed (${err.message}), falling back to proxy IP`);
      useProxy = true;
      targetSocket = await connectWithTimeout({
        hostname: _JeHxQnQHudDPWbyN,
        port: _JsGTkSTJgBtAOVZl
      }, CONNECTION_TIMEOUT);
    }
    
    // 4. 写入初始数据
    const writer = targetSocket.writable.getWriter();
    await writer.write(initialData);
    writer.releaseLock();
    
    // 5. 创建数据流管道
    const pipeResults = await Promise.race([
      // 客户端 -> 远程
      (async () => {
        const w = targetSocket.writable.getWriter();
        try {
          while (!wsClosed) {
            const { done, value } = await wsReader.read();
            if (done || wsClosed) break;
            await w.write(value);
          }
        } finally {
          w.releaseLock();
        }
        return 'clientDone';
      })(),
      
      // 远程 -> 客户端
      (async () => {
        const r = targetSocket.readable.getReader();
        let headerSent = false;
        let dataReceived = false;
        
        try {
          // 设置数据接收超时（3秒）
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Data timeout')), 3000);
          });
          
          while (!wsClosed) {
            const readPromise = r.read();
            const { done, value } = await Promise.race([readPromise, timeoutPromise]);
            
            if (done || wsClosed) break;
            
            dataReceived = true;
            
            if (ws.readyState === WS_READY_STATE_OPEN) {
              if (!headerSent) {
                const combined = new Uint8Array(vlessHeader.byteLength + value.byteLength);
                combined.set(vlessHeader, 0);
                combined.set(value, vlessHeader.byteLength);
                ws.send(combined);
                headerSent = true;
              } else {
                ws.send(value);
              }
            }
          }
        } catch (err) {
          // 如果没有收到数据且还没用过代理IP，尝试重试
          if (!dataReceived && !useProxy && !wsClosed) {
            console.log("No data received, retrying with proxy IP...");
            
            // 清理旧连接
            try { targetSocket.close(); } catch(e) {}
            
            // 使用代理IP重试
            const retrySocket = await connectWithTimeout({
              hostname: _JeHxQnQHudDPWbyN,
              port: _JsGTkSTJgBtAOVZl
            }, CONNECTION_TIMEOUT);
            
            // 重新写入初始数据
            const retryWriter = retrySocket.writable.getWriter();
            await retryWriter.write(initialData);
            retryWriter.releaseLock();
            
            // 重新建立从远程到客户端的流
            const retryReader = retrySocket.readable.getReader();
            let retryHeaderSent = false;
            
            while (!wsClosed) {
              const { done, value } = await retryReader.read();
              if (done || wsClosed) break;
              
              if (ws.readyState === WS_READY_STATE_OPEN) {
                if (!retryHeaderSent) {
                  const combined = new Uint8Array(vlessHeader.byteLength + value.byteLength);
                  combined.set(vlessHeader, 0);
                  combined.set(value, vlessHeader.byteLength);
                  ws.send(combined);
                  retryHeaderSent = true;
                } else {
                  ws.send(value);
                }
              }
            }
            
            retryReader.releaseLock();
          }
        } finally {
          r.releaseLock();
        }
        return 'remoteDone';
      })()
    ]);
    
  } catch (err) {
    if (!wsClosed) {
      console.error("Handle Error:", err.message);
    }
  } finally {
    if (targetSocket) {
      try { targetSocket.close(); } catch(e) {}
    }
    if (!wsClosed && ws.readyState === WS_READY_STATE_OPEN) {
      try { ws.close(); } catch(e) {}
    }
  }
}

// 带超时的连接函数
async function connectWithTimeout(options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const socket = await connect(options, { signal: controller.signal });
    clearTimeout(timeoutId);
    return socket;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// 创建WebSocket可读流
function createWebSocketReader(ws) {
  return new ReadableStream({
    start(controller) {
      ws.addEventListener('message', event => {
        controller.enqueue(new Uint8Array(event.data));
      });
      ws.addEventListener('close', () => controller.close());
      ws.addEventListener('error', () => controller.error(new Error('WebSocket error')));
    }
  });
}

// 解析VLESS头
function parseVLESSHeader(buffer) {
  if (buffer.byteLength < 24) return { hasError: true, message: 'Invalid header' };
  
  const view = new DataView(buffer.buffer);
  const uuidBytes = new Uint8Array(buffer.slice(1, 17));
  const uuidHex = Array.from(uuidBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const expectedUuid = _rcHzgeggsXmfUWrW.replace(/-/g, '');
  
  if (uuidHex !== expectedUuid) {
    return { hasError: true, message: 'Unauthorized' };
  }
  
  const optionsLen = view.getUint8(17);
  let offset = 18 + optionsLen;
  const port = view.getUint16(offset);
  offset += 2;
  const addrType = view.getUint8(offset++);
  
  let address = '';
  switch (addrType) {
    case 1: // IPv4
      address = Array.from(new Uint8Array(buffer.slice(offset, offset + 4))).join('.');
      offset += 4;
      break;
    case 2: // Domain
      const domainLen = view.getUint8(offset++);
      address = new TextDecoder().decode(buffer.slice(offset, offset + domainLen));
      offset += domainLen;
      break;
    case 3: // IPv6
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(view.getUint16(offset).toString(16));
        offset += 2;
      }
      address = ipv6.join(':');
      break;
    default:
      return { hasError: true, message: 'Unsupported address type' };
  }
  
  return {
    hasError: false,
    addressRemote: address,
    portRemote: port,
    rawDataIndex: offset,
    vlessVersion: new Uint8Array(buffer.slice(0, 1))
  };
}
