import { connect } from 'cloudflare:sockets';

const _cQndIdPFBwdwdfPS = '/t-vip-9026/auth-888999';
const _rcHzgeggsXmfUWrW = '56892533-7dad-324a-b0e8-51040d0d04ad';
const _JeHxQnQHudDPWbyN = 'ProxyIP.FR.CMLiussss.net';
const _JsGTkSTJgBtAOVZl = 443;

const WS_READY_STATE_OPEN = 1;

const _KtFJDaQcgkFDwTLY = (_yRsSyhpBCxFbqNPU, _HpkuToMJSAvwPNva = 404) => {
  // ... (此函数保持不变) ...
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
    // ... (此函数保持不变) ...
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

    _QlxgSaLbCagSZvDa(_zNeFASTClFTonTIr).catch(_wozDXumapohYMyrU => {
      console.error("Critical WS Error:", _wozDXumapohYMyrU.message);
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

// 独立的回退处理函数
async function handleFallback(_zNeFASTClFTonTIr, _vlessHeader, _initialData, _clientReaderForFallback) {
    console.log("Fallback function started with proxy IP");
    let fallbackSocket = null;
    let fallbackClientReader = _clientReaderForFallback; // 使用传入的 reader
    let webSocketClosed = false;

    _zNeFASTClFTonTIr.addEventListener('close', () => {
        webSocketClosed = true;
    });

    try {
        // 1. 创建到代理IP的新连接
        fallbackSocket = await connect({
            hostname: _JeHxQnQHudDPWbyN,
            port: _JsGTkSTJgBtAOVZl
        });

        // 2. 写入初始数据
        const initialWriter = fallbackSocket.writable.getWriter();
        await initialWriter.write(_initialData);
        initialWriter.releaseLock();

        // 3. 启动两个新的独立循环来处理双向通信

        // 客户端 -> 远程 (通过代理)
        const fallbackClientToRemote = (async () => {
            const writer = fallbackSocket.writable.getWriter();
            try {
                while (!webSocketClosed) {
                    const { done, value } = await fallbackClientReader.read();
                    if (done || webSocketClosed) break;
                    await writer.write(value);
                }
            } catch (err) {
                console.error("Fallback client->remote error:", err.message);
            } finally {
                writer.releaseLock();
            }
        })();

        // 远程 (通过代理) -> 客户端
        const fallbackRemoteToClient = (async () => {
            const reader = fallbackSocket.readable.getReader();
            let headerSent = false;
            try {
                while (!webSocketClosed) {
                    const { done, value } = await reader.read();
                    if (done || webSocketClosed) break;

                    if (_zNeFASTClFTonTIr.readyState === WS_READY_STATE_OPEN) {
                        if (!headerSent) {
                            const combined = new Uint8Array(_vlessHeader.byteLength + value.byteLength);
                            combined.set(_vlessHeader, 0);
                            combined.set(value, _vlessHeader.byteLength);
                            _zNeFASTClFTonTIr.send(combined);
                            headerSent = true;
                        } else {
                            _zNeFASTClFTonTIr.send(value);
                        }
                    }
                }
            } catch (err) {
                console.error("Fallback remote->client error:", err.message);
            } finally {
                reader.releaseLock();
            }
        })();

        await Promise.race([fallbackClientToRemote, fallbackRemoteToClient]);

    } catch (err) {
        console.error("Fallback function critical error:", err);
        if (!webSocketClosed && _zNeFASTClFTonTIr.readyState === WS_READY_STATE_OPEN) {
            _zNeFASTClFTonTIr.close(1011, "Fallback failed");
        }
    } finally {
        if (fallbackSocket) {
            try { fallbackSocket.close(); } catch(e) {}
        }
        if (fallbackClientReader) {
            try { fallbackClientReader.releaseLock(); } catch(e) {}
        }
    }
}


async function _QlxgSaLbCagSZvDa(_zNeFASTClFTonTIr) {
  const _rQBZEdhdojOaQypG = _GWHvqQvdiYQMUGEh(_zNeFASTClFTonTIr);
  let _activeSocket = null;
  let _vlessHeader = null;
  let _initialData = null;
  let _useProxyIP = false;
  let _webSocketClosed = false;
  let _fallbackTriggered = false;

  const _clientReader = _rQBZEdhdojOaQypG.getReader();

  _zNeFASTClFTonTIr.addEventListener('close', () => {
    _webSocketClosed = true;
  });

  try {
    // 1. 读取第一个消息
    const { done: firstDone, value: firstMessage } = await _clientReader.read();
    if (firstDone || _webSocketClosed) return;

    const parsedHeader = _MkxTgzbSwfhpsfJi(firstMessage);
    if (parsedHeader.hasError) throw new Error(parsedHeader.message);

    _vlessHeader = new Uint8Array([parsedHeader.vlessVersion[0], 0]);
    _initialData = firstMessage.slice(parsedHeader.rawDataIndex);

    // 2. 尝试直接连接
    try {
      _activeSocket = await connect({
        hostname: parsedHeader.addressRemote,
        port: parsedHeader.portRemote
      });
      const writer = _activeSocket.writable.getWriter();
      await writer.write(_initialData);
      writer.releaseLock();
    } catch (err) {
      console.log("Direct connection failed, using proxy IP immediately:", err.message);
      // 如果直接连接都失败，立刻使用代理IP，不走回退逻辑
      _activeSocket = await connect({
        hostname: _JeHxQnQHudDPWbyN,
        port: _JsGTkSTJgBtAOVZl
      });
      const writer = _activeSocket.writable.getWriter();
      await writer.write(_initialData);
      writer.releaseLock();
      _useProxyIP = true;
    }

    // 3. 启动双向流处理
    const clientToRemotePromise = (async () => {
      const writer = _activeSocket.writable.getWriter();
      try {
        while (!_webSocketClosed && !_fallbackTriggered) {
          const { done, value } = await _clientReader.read();
          if (done || _webSocketClosed || _fallbackTriggered) break;
          await writer.write(value);
        }
      } catch (err) {
        // 忽略因回退触发的错误
        if (!_fallbackTriggered) console.error("Client to remote error:", err.message);
      } finally {
        writer.releaseLock();
      }
    })();

    const remoteToClientPromise = (async () => {
      const reader = _activeSocket.readable.getReader();
      let headerSent = false;
      let hasData = false;
      try {
        while (!_webSocketClosed && !_fallbackTriggered) {
          const { done, value } = await reader.read();
          if (done || _webSocketClosed || _fallbackTriggered) break;

          hasData = true;
          if (_zNeFASTClFTonTIr.readyState === WS_READY_STATE_OPEN) {
            if (!headerSent) {
              const combined = new Uint8Array(_vlessHeader.byteLength + value.byteLength);
              combined.set(_vlessHeader, 0);
              combined.set(value, _vlessHeader.byteLength);
              _zNeFASTClFTonTIr.send(combined);
              headerSent = true;
            } else {
              _zNeFASTClFTonTIr.send(value);
            }
          }
        }
      } catch (err) {
        if (!_fallbackTriggered) console.error("Remote to client error:", err.message);
      } finally {
        reader.releaseLock();

        // 4. 关键回退逻辑：没有数据、未使用代理、WebSocket还在、未触发过回退
        if (!hasData && !_useProxyIP && !_webSocketClosed && !_fallbackTriggered) {
          _fallbackTriggered = true;
          console.log("No data received, triggering isolated fallback to proxy IP...");

          // 5. 粗暴但有效的清理：关闭旧 socket 并忽略所有错误
          try { _activeSocket.close(); } catch (e) {}
          _activeSocket = null;

          // 6. 启动独立的回退处理函数，并传入当前的 _clientReader
          //    注意：这里我们不等待 (no await)，让回退函数在后台运行，同时当前函数可以结束。
          handleFallback(_zNeFASTClFTonTIr, _vlessHeader, _initialData, _clientReader).catch(err => {
              console.error("Unhandled error in fallback function:", err);
          });
        }
      }
    })();

    await Promise.race([clientToRemotePromise, remoteToClientPromise]);

  } catch (_wozDXumapohYMyrU) {
    if (!_webSocketClosed && !_fallbackTriggered) {
      console.error("HandleWS Error:", _wozDXumapohYMyrU.message);
    }
  } finally {
    // 只有在没有触发回退的情况下，才在这里清理 _clientReader 和 _activeSocket
    // 如果触发了回退，_clientReader 的所有权已经转移给了 handleFallback 函数
    if (!_fallbackTriggered) {
        _clientReader.releaseLock();
        if (_activeSocket) {
            try { _activeSocket.close(); } catch {}
        }
    }
    // 如果回退已触发且 WebSocket 还开着，我们不再关闭它，因为回退函数会接管。
  }
}

// _GWHvqQvdiYQMUGEh 和 _MkxTgzbSwfhpsfJi 函数保持不变
function _GWHvqQvdiYQMUGEh(_YHRMXlCNQXcLTQTX) {
  return new ReadableStream({
    start(_umAYPzwPqpEFUFDI) {
      _YHRMXlCNQXcLTQTX.addEventListener('message', _fVheVUSIAbHdlEXQ => 
        _umAYPzwPqpEFUFDI.enqueue(new Uint8Array(_fVheVUSIAbHdlEXQ.data))
      );
      _YHRMXlCNQXcLTQTX.addEventListener('close', () => 
        _umAYPzwPqpEFUFDI.close()
      );
      _YHRMXlCNQXcLTQTX.addEventListener('error', () => 
        _umAYPzwPqpEFUFDI.error(new Error('WebSocket error'))
      );
    }
  });
}

function _MkxTgzbSwfhpsfJi(_QjfgPTDmcvdvEOSN) {
  // ... (此函数完全保持不变) ...
  if (_QjfgPTDmcvdvEOSN.byteLength < 24) return {
    hasError: true,
    message: 'Invalid header'
  };
  
  const _igZwspOTXOUDIgpJ = new DataView(_QjfgPTDmcvdvEOSN.buffer);
  const _mQuBmCqLfAfNDGqA = Array.from(new Uint8Array(_QjfgPTDmcvdvEOSN.slice(1, 17)))
    .map(_UgvgeNOVlJZSBxZG => _UgvgeNOVlJZSBxZG.toString(16).padStart(2, '0'))
    .join('');
    
  if (_mQuBmCqLfAfNDGqA !== _rcHzgeggsXmfUWrW.replace(/-/g, '')) {
    return { hasError: true, message: 'Unauthorized' };
  }
  
  const _jAStFyandqGWXqZR = _igZwspOTXOUDIgpJ.getUint8(17);
  let _pWtFmyUVDkElICtU = 18 + _jAStFyandqGWXqZR;
  const _fIfiLUgHAsoXFbhV = _igZwspOTXOUDIgpJ.getUint8(_pWtFmyUVDkElICtU++);
  const _ytQFGPvxNQUjZTAs = _igZwspOTXOUDIgpJ.getUint16(_pWtFmyUVDkElICtU);
  _pWtFmyUVDkElICtU += 2;
  const _PnLELLVjNfMwYHCb = _igZwspOTXOUDIgpJ.getUint8(_pWtFmyUVDkElICtU++);
  
  let _SnVNbvZshYkvCWQB = '';
  
  if (_PnLELLVjNfMwYHCb === 1) {
    _SnVNbvZshYkvCWQB = Array.from(new Uint8Array(_QjfgPTDmcvdvEOSN.slice(_pWtFmyUVDkElICtU, _pWtFmyUVDkElICtU + 4))).join('.');
    _pWtFmyUVDkElICtU += 4;
  } else if (_PnLELLVjNfMwYHCb === 2) {
    const _UGfWcImCHyxtNgQc = _igZwspOTXOUDIgpJ.getUint8(_pWtFmyUVDkElICtU++);
    _SnVNbvZshYkvCWQB = new TextDecoder().decode(_QjfgPTDmcvdvEOSN.slice(_pWtFmyUVDkElICtU, _pWtFmyUVDkElICtU + _UGfWcImCHyxtNgQc));
    _pWtFmyUVDkElICtU += _UGfWcImCHyxtNgQc;
  } else if (_PnLELLVjNfMwYHCb === 3) {
    _SnVNbvZshYkvCWQB = Array.from({
      length: 8
    }, (_iuHKolsMIqvRXzVH, _HRhJESqDjdwZmuMt) => 
      _igZwspOTXOUDIgpJ.getUint16(_pWtFmyUVDkElICtU + _HRhJESqDjdwZmuMt * 2).toString(16)
    ).join(':');
    _pWtFmyUVDkElICtU += 16;
  }
  
  return {
    hasError: false,
    addressRemote: _SnVNbvZshYkvCWQB,
    portRemote: _ytQFGPvxNQUjZTAs,
    rawDataIndex: _pWtFmyUVDkElICtU,
    vlessVersion: new Uint8Array(_QjfgPTDmcvdvEOSN.slice(0, 1))
  };
}
