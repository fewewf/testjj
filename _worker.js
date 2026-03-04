import { connect } from 'cloudflare:sockets';
const _kAtFWWCOYpzAQsPd = '/tunnel-vip-2026/auth-888999';
const _mbhCCWIFhtvkFufm = '56892533-7dad-475a-b0e8-51040d0d04ad';
const _vVwiDUUvulyxyOqq = 'ProxyIP.FR.CMLiussss.net';
const _FpArNnfOkKILXNeL = 443;
const _ZQwazNJRhdcswHEU = 15000;
const _RAFPAdVNijTWnNRt = (_BtftGQqnSPvQITtK, _SaDPPbkRqRMJdVkv = 404) => {
  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    status: _SaDPPbkRqRMJdVkv,
    error: "Resource Error",
    requestId: Math.random().toString(36).substring(2, 10).toUpperCase()
  }), {
    status: _SaDPPbkRqRMJdVkv,
    headers: {
      'Content-Type': 'application/json',
      'Server': 'nginx'
    }
  });
};
export default {
  async fetch(_nqGkAyxkefkcoJPD) {
    const _BtftGQqnSPvQITtK = new URL(_nqGkAyxkefkcoJPD.url);
    if (_BtftGQqnSPvQITtK.pathname !== _kAtFWWCOYpzAQsPd) return _RAFPAdVNijTWnNRt(_BtftGQqnSPvQITtK, 404);
    const _pjtmHImNXPYEmzif = (_nqGkAyxkefkcoJPD.headers.get('User-Agent') || '').toLowerCase();
    if (_pjtmHImNXPYEmzif.includes('python-requests')) return _RAFPAdVNijTWnNRt(_BtftGQqnSPvQITtK, 403);
    if (_nqGkAyxkefkcoJPD.headers.get('Upgrade') !== 'websocket') {
      return new Response(JSON.stringify({
        status: "UP",
        heartbeat: Date.now()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    const _CPxzbEwwRjgOGFCv = new WebSocketPair();
    const [_ttUNzTUvaLzjqPTB, _zDnzfATLqPjBjHWg] = Object.values(_CPxzbEwwRjgOGFCv);
    _zDnzfATLqPjBjHWg.accept();
    _fuIkTYYbbIggKYkP(_zDnzfATLqPjBjHWg).catch(_oFompoaQDqTJsOoB => console.log(`WS_SAFE_EXIT: ${_oFompoaQDqTJsOoB.message}`));
    return new Response(null, {
      status: 101,
      webSocket: _ttUNzTUvaLzjqPTB,
      headers: {
        'Upgrade': 'websocket'
      }
    });
  }
};
async function _fuIkTYYbbIggKYkP(_zDnzfATLqPjBjHWg) {
  const _zjNyYTWoKtcjDoQM = _SkdQYqzKfVCbDJdq(_zDnzfATLqPjBjHWg);
  let _bIVZMjWOCCEfaAhM = null;
  let _SdIMwkcdPQuCefgJ = _zjNyYTWoKtcjDoQM.getReader();
  try {
    const {
      done: _QKlfGnGfeNrhPtrC,
      value: _GKDJUkDXogrnjAIy
    } = await _SdIMwkcdPQuCefgJ.read();
    if (_QKlfGnGfeNrhPtrC) return;
    const _pnkTUXBGiREcOSfg = _yDjlFCFkFulDlEdh(_GKDJUkDXogrnjAIy);
    if (_pnkTUXBGiREcOSfg.hasError) throw new Error('VLESS_AUTH_FAIL');
    const _rXfvkgnUeRnIGUII = new Uint8Array([_pnkTUXBGiREcOSfg.vlessVersion[0], 0]);
    const _BgVcHknuPzanBPbC = _GKDJUkDXogrnjAIy.slice(_pnkTUXBGiREcOSfg.rawDataIndex);
    try {
      _bIVZMjWOCCEfaAhM = await connect({
        hostname: _pnkTUXBGiREcOSfg.addressRemote,
        port: _pnkTUXBGiREcOSfg.portRemote
      }, {
        allowHalfOpen: true
      });
    } catch {
      _bIVZMjWOCCEfaAhM = await connect({
        hostname: _vVwiDUUvulyxyOqq,
        port: _FpArNnfOkKILXNeL
      }, {
        allowHalfOpen: true
      });
    }
    const _THQzHtDqRkiXCXBU = _bIVZMjWOCCEfaAhM.writable.getWriter();
    await _THQzHtDqRkiXCXBU.write(_BgVcHknuPzanBPbC);
    _THQzHtDqRkiXCXBU.releaseLock();
    const _yHycNNXgUFgZYqMP = _tYvGNYvWIDJMQxZl(_bIVZMjWOCCEfaAhM, _zDnzfATLqPjBjHWg, _rXfvkgnUeRnIGUII);
    const _AENwCpPcVgfrSINP = _CKgwzlxxUMqqnoPQ(_SdIMwkcdPQuCefgJ, _bIVZMjWOCCEfaAhM);
    await Promise.race([_yHycNNXgUFgZYqMP, _AENwCpPcVgfrSINP]);
  } catch (_iALhJWAeuZDzeAxq) {} finally {
    try {
      _SdIMwkcdPQuCefgJ.releaseLock();
    } catch {}
    if (_bIVZMjWOCCEfaAhM) try {
      _bIVZMjWOCCEfaAhM.close();
    } catch {}
    if (_zDnzfATLqPjBjHWg.readyState === 1) try {
      _zDnzfATLqPjBjHWg.close();
    } catch {}
  }
}
async function _tYvGNYvWIDJMQxZl(_bIVZMjWOCCEfaAhM, _uNqSJypHNndQhNeG, _rXfvkgnUeRnIGUII) {
  const _SdIMwkcdPQuCefgJ = _bIVZMjWOCCEfaAhM.readable.getReader();
  let _XeFoJOwCswYRHndz = false;
  try {
    while (true) {
      const {
        done: _QKlfGnGfeNrhPtrC,
        value: _GKDJUkDXogrnjAIy
      } = await _SdIMwkcdPQuCefgJ.read();
      if (_QKlfGnGfeNrhPtrC || _uNqSJypHNndQhNeG.readyState !== 1) break;
      if (!_XeFoJOwCswYRHndz) {
        const _FtojNLPnBmUxhDVa = new Uint8Array(_rXfvkgnUeRnIGUII.byteLength + _GKDJUkDXogrnjAIy.byteLength);
        _FtojNLPnBmUxhDVa.set(_rXfvkgnUeRnIGUII, 0);
        _FtojNLPnBmUxhDVa.set(_GKDJUkDXogrnjAIy, _rXfvkgnUeRnIGUII.byteLength);
        _uNqSJypHNndQhNeG.send(_FtojNLPnBmUxhDVa);
        _XeFoJOwCswYRHndz = true;
      } else {
        _uNqSJypHNndQhNeG.send(_GKDJUkDXogrnjAIy);
      }
    }
  } finally {
    _SdIMwkcdPQuCefgJ.releaseLock();
  }
}
async function _CKgwzlxxUMqqnoPQ(_SdIMwkcdPQuCefgJ, _bIVZMjWOCCEfaAhM) {
  const _THQzHtDqRkiXCXBU = _bIVZMjWOCCEfaAhM.writable.getWriter();
  try {
    while (true) {
      const {
        done: _QKlfGnGfeNrhPtrC,
        value: _GKDJUkDXogrnjAIy
      } = await _SdIMwkcdPQuCefgJ.read();
      if (_QKlfGnGfeNrhPtrC) break;
      await _THQzHtDqRkiXCXBU.write(_GKDJUkDXogrnjAIy);
    }
  } finally {
    try {
      _THQzHtDqRkiXCXBU.releaseLock();
    } catch {}
  }
}
function _SkdQYqzKfVCbDJdq(_uNqSJypHNndQhNeG) {
  return new ReadableStream({
    start(_DYuEBcZbsrERdXNT) {
      _uNqSJypHNndQhNeG.addEventListener('message', _oFompoaQDqTJsOoB => _DYuEBcZbsrERdXNT.enqueue(new Uint8Array(_oFompoaQDqTJsOoB.data)));
      _uNqSJypHNndQhNeG.addEventListener('close', () => _DYuEBcZbsrERdXNT.close());
      _uNqSJypHNndQhNeG.addEventListener('error', () => _DYuEBcZbsrERdXNT.close());
    }
  });
}
function _yDjlFCFkFulDlEdh(_eGiySjdHaoTMjyVS) {
  if (_eGiySjdHaoTMjyVS.byteLength < 24) return {
    hasError: true
  };
  const _qsItakeIGBwoJYYW = new DataView(_eGiySjdHaoTMjyVS.buffer);
  const _oOeFlSPIgGILpbMP = Array.from(new Uint8Array(_eGiySjdHaoTMjyVS.slice(1, 17))).map(_dgedNtlUYehYFnyc => _dgedNtlUYehYFnyc.toString(16).padStart(2, '0')).join('');
  if (_oOeFlSPIgGILpbMP !== _mbhCCWIFhtvkFufm.replace(/-/g, '')) return {
    hasError: true
  };
  let _fSdrOmGnfKSuBHUL = 18 + _qsItakeIGBwoJYYW.getUint8(17);
  const _AMvlNpXsCrFqEKNm = _qsItakeIGBwoJYYW.getUint16(_fSdrOmGnfKSuBHUL + 1);
  const _qMVlKYsVzjszNvvg = _qsItakeIGBwoJYYW.getUint8(_fSdrOmGnfKSuBHUL + 3);
  let _DEZMCDHlDKxOqUTL = '';
  _fSdrOmGnfKSuBHUL += 4;
  if (_qMVlKYsVzjszNvvg === 1) _DEZMCDHlDKxOqUTL = Array.from(new Uint8Array(_eGiySjdHaoTMjyVS.slice(_fSdrOmGnfKSuBHUL, _fSdrOmGnfKSuBHUL + 4))).join('.');else if (_qMVlKYsVzjszNvvg === 2) {
    const _yeDjZARCtotrdWYv = _qsItakeIGBwoJYYW.getUint8(_fSdrOmGnfKSuBHUL);
    _DEZMCDHlDKxOqUTL = new TextDecoder().decode(_eGiySjdHaoTMjyVS.slice(_fSdrOmGnfKSuBHUL + 1, _fSdrOmGnfKSuBHUL + 1 + _yeDjZARCtotrdWYv));
  }
  return {
    hasError: false,
    addressRemote: _DEZMCDHlDKxOqUTL,
    portRemote: _AMvlNpXsCrFqEKNm,
    rawDataIndex: _eGiySjdHaoTMjyVS.byteLength,
    vlessVersion: new Uint8Array(_eGiySjdHaoTMjyVS.slice(0, 1))
  };
}
