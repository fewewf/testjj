import { connect } from 'cloudflare:sockets';

const _cQndIdPFBwdwdfPS = '/t-vip-9026/auth-888999';
const _rcHzgeggsXmfUWrW = '56892533-7dad-324a-b0e8-51040d0d04ad';
const _JeHxQnQHudDPWbyN = 'ProxyIP.FR.CMLiussss.net';
const _JsGTkSTJgBtAOVZl = 443;

const WS_READY_STATE_OPEN = 1;

const _KtFJDaQcgkFDwTLY = (_yRsSyhpBCxFbqNPU, _HpkuToMJSAvwPNva = 404) => {
  // ... (保持不变) ...
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
    // ... (保持不变) ...
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

    // 不再等待，避免阻塞
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

// 独立的回退处理函数 - 负责在回退场景下处理所有流量
async function runFallback(_zNeFASTClFTonTIr, _vlessHeader, _initialData, _clientReader) {
    console.log("Fallback function started with proxy IP");
    let fallbackSocket = null;
    let webSocketClosed = false;

    const closeListener = () => { webSocketClosed = true; };
    _zNeFASTClFTonTIr.addEventListener('close', closeListener);
    _zNeFASTClFTonTIr.addEventListener('error', closeListener);

    try {
        // 1. 创建到代理IP的新连接
        fallbackSocket = await connect({
            hostname: _JeHxQnQHudDPWbyN,
            port: _JsGTkSTJgBtAOVZl
        });

        // 2. 写入初始数据
        const writer = fallbackSocket.writable.getWriter();
        await writer.write(_initialData);
        writer.releaseLock();

        // 3. 启动双向通信 (使用传入的 _clientReader)
        const fallbackTasks = await Promise.allSettled([
            // 任务1: 客户端 -> 远程 (通过代理)
            (async () => {
                const w = fallbackSocket.writable.getWriter();
                try {
                    while (!webSocketClosed) {
                        const { done, value } = await _clientReader.read();
                        if (done || webSocketClosed) break;
                        await w.write(value);
                    }
                } finally {
                    w.releaseLock();
                }
            })(),

            // 任务2: 远程 (通过代理) -> 客户端
            (async () => {
                const r = fallbackSocket.readable.getReader();
                let headerSent = false;
                try {
                    while (!webSocketClosed) {
                        const { done, value } = await r.read();
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
                } finally {
                    r.releaseLock();
                }
            })()
        ]);

        // 检查是否有任务失败
        for (const result of fallbackTasks) {
            if (result.status === 'rejected') {
                console.error("Fallback task failed:", result.reason);
            }
        }

    } catch (err) {
        console.error("Fallback function critical error:", err);
    } finally {
        _zNeFASTClFTonTIr.removeEventListener('close', closeListener);
        _zNeFASTClFTonTIr.removeEventListener('error', closeListener);
        if (fallbackSocket) {
            try { fallbackSocket.close(); } catch(e) {}
        }
        // 注意：不要在这里释放 _clientReader，它的生命周期由调用者管理
    }
}

async function _QlxgSaLbCagSZvDa(_zNeFASTClFTonTIr) {
  const _clientReadableStream = _GWHvqQvdiYQMUGEh(_zNeFASTClFTonTIr);
  let _activeSocket = null;
  let _vlessHeader = null;
  let _initialData = null;
  let _useProxyIP = false;
  let _webSocketClosed = false;

  // 获取 reader
  const _clientReader = _clientReadableStream.getReader();

  const closeListener = () => { _webSocketClosed = true; };
  _zNeFASTClFTonTIr.addEventListener('close', closeListener);
  _zNeFASTClFTonTIr.addEventListener('error', closeListener);

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
      _activeSocket = await connect({
        hostname: _JeHxQnQHudDPWbyN,
        port: _JsGTkSTJgBtAOVZl
      });
      const writer = _activeSocket.writable.getWriter();
      await writer.write(_initialData);
      writer.releaseLock();
      _useProxyIP = true;
    }

    // 3. 设置一个标志，表示是否已经转移了 reader 的所有权
    let readerOwnershipTransferred = false;

    // 4. 启动双向流处理
    const results = await Promise.race([
        // 客户端 -> 远程
        (async () => {
            const writer = _activeSocket.writable.getWriter();
            try {
                while (!_webSocketClosed && !readerOwnershipTransferred) {
                    const { done, value } = await _clientReader.read();
                    if (done || _webSocketClosed) break;
                    await writer.write(value);
                }
            } finally {
                writer.releaseLock();
            }
            return 'clientToRemoteDone';
        })(),

        // 远程 -> 客户端 (这个 Promise 会解析为 'fallbackTriggered' 或 'remoteToClientDone')
        (async () => {
            const reader = _activeSocket.readable.getReader();
            let headerSent = false;
            let hasData = false;
            try {
                while (!_webSocketClosed && !readerOwnershipTransferred) {
                    const { done, value } = await reader.read();
                    if (done || _webSocketClosed) break;

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
            } finally {
                reader.releaseLock();
            }

            // 5. 关键逻辑：如果没有数据，触发回退
            if (!hasData && !_useProxyIP && !_webSocketClosed && !readerOwnershipTransferred) {
                console.log("No data received, transferring reader ownership to fallback function...");
                readerOwnershipTransferred = true; // 标记所有权已转移

                // 关闭旧 socket
                if (_activeSocket) {
                    try { _activeSocket.close(); } catch(e) {}
                    _activeSocket = null;
                }

                // 启动独立的回退函数，并传入 reader（现在所有权属于它）
                // 注意：我们不等待这个函数，让它在后台运行
                runFallback(_zNeFASTClFTonTIr, _vlessHeader, _initialData, _clientReader)
                    .catch(err => console.error("Unhandled error in runFallback:", err));

                return 'fallbackTriggered';
            }
            return 'remoteToClientDone';
        })()
    ]);

    // 如果结果是 'fallbackTriggered'，我们就让当前函数结束，让 runFallback 接管
    if (results === 'fallbackTriggered') {
        console.log("Main function exiting, fallback is now in charge.");
        return; // 直接返回，不执行清理，因为 reader 已经移交
    }

  } catch (_wozDXumapohYMyrU) {
    if (!_webSocketClosed) {
      console.error("HandleWS Error:", _wozDXumapohYMyrU.message);
    }
  } finally {
    // 只有在 reader 所有权没有被转移的情况下，才在这里清理
    if (!readerOwnershipTransferred) {
        _clientReader.releaseLock();
    }
    _zNeFASTClFTonTIr.removeEventListener('close', closeListener);
    _zNeFASTClFTonTIr.removeEventListener('error', closeListener);
    if (_activeSocket) {
        try { _activeSocket.close(); } catch {}
    }
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
  // ... (完全保持不变) ...
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
