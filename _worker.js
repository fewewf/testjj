import { connect } from 'cloudflare:sockets';

// ================= 配置区 =================
// 客户端的“路径(Path)”一栏必须填入：/tunnel-vip-2026/auth-888999
const SECRET_PATH = '/tunnel-vip-2026/auth-888999'; 
// ==========================================

const _zYKKdoGZqnmEnGPq = new TextDecoder(),
  _jfaHCVrCBFHnxASx = new TextEncoder(),
  _BbSHBjMtKftiFqYl = '123asa',
  _wodtoCkDNSJPtyzB = '56892533-7dad-475a-b0e8-51040d0d04ad',
  _YIeQkaNUtHnHVlWF = 'yx1.98981.xyz:8443',
  _QTOSmfJbRTcCqJkc = 'Core';

const _kpFHqLdLmlgcXyva = ((_nUSmmfPHomdZlGOs, _VHkyyDtSaKyppgge = new Uint8Array(16)) => {
  for (let i = 0; i < 32; i += 2) _VHkyyDtSaKyppgge[i >> 1] = parseInt(_nUSmmfPHomdZlGOs.substr(i, 2), 16);
  return _VHkyyDtSaKyppgge;
})(_wodtoCkDNSJPtyzB.replace(/-/g, ''));

const _jJFeKUOpdqvDaxGI = _m => {
  for (let i = 0; i < 16; i++) if (_m[i] !== _kpFHqLdLmlgcXyva[i]) return 0;
  return 1;
};

const _RavhGEpFyOMaPebW = async (_n, _p, _d) => {
  try {
    const _s = await connect({ hostname: _n, port: _p });
    return await _s.opened, { tcpSocket: _s, initialData: _d };
  } catch {}
  if (_YIeQkaNUtHnHVlWF) {
    const [_h, _port] = _YIeQkaNUtHnHVlWF.split(':');
    return _RavhGEpFyOMaPebW(_h, +_port || _p, _d);
  }
  throw new Error('Conn Failed');
};

const _ppdadVaeELBSJlSg = async _m => {
  _m = new Uint8Array(_m);
  let _v = 18 + _m[17],
    _p = _m[_v + 1] << 8 | _m[_v + 2],
    _h = '',
    _i = _v + 4;
  switch (_m[_v + 3]) {
    case 1:
      _h = `${_m[_i++]}.${_m[_i++]}.${_m[_i++]}.${_m[_i++]}`;
      break;
    case 2:
      const len = _m[_i++];
      _h = _zYKKdoGZqnmEnGPq.decode(_m.subarray(_i, _i + len));
      _i += len;
      break;
    case 3:
      _h = Array.from({ length: 8 }, (_, k) => (_m[_i + 2 * k] << 8 | _m[_i + 2 * k + 1]).toString(16)).join(':');
      _i += 16;
  }
  return _RavhGEpFyOMaPebW(_h, _p, _m.slice(_i));
};

const _tamKYyjZaHuRxMQA = (_ws, _tcp, _init) => {
  const _w = _tcp.writable.getWriter();
  _ws.send(new Uint8Array([0, 0]));
  _init && _w.write(_init);
  let _q = [], _t, _c = 0;
  const _close = () => {
    if (!_c) { _c = 1; _t && clearTimeout(_t); _w.releaseLock().catch(()=>{}); _tcp.close().catch(()=>{}); _ws.close().catch(()=>{}); _q = null; }
  };
  _ws.onmessage = ({ data }) => {
    if (_c) return;
    const b = data instanceof ArrayBuffer ? new Uint8Array(data) : _jfaHCVrCBFHnxASx.encode(data);
    _q.push(b);
    if (!_t) _t = setTimeout(() => {
      if (_c) return;
      const all = _q.length === 1 ? _q[0] : (() => {
        let l = 0; _q.forEach(x => l += x.length);
        const r = new Uint8Array(l); let o = 0;
        _q.forEach(x => { r.set(x, o); o += x.length; }); return r;
      })();
      _w.write(all).catch(_close); _q.length = 0; _t = null;
    }, 5);
  };
  _tcp.readable.pipeTo(new WritableStream({
    write: chunk => _ws.send(chunk),
    close: _close,
    abort: _close
  })).catch(_close);
  _ws.onclose = _close;
};

export default {
  async fetch(request) {
    const { headers, url } = request;
    const { pathname } = new URL(url);

    // --- 加固校验逻辑 ---
    // 只有路径完全匹配时，才暴露服务
    if (pathname !== SECRET_PATH) {
      // 路径不匹配时，返回一个看似正常的伪装页面
      return new Response('<html><body><h1>404 Not Found</h1><hr>nginx/1.25.4</body></html>', { 
        status: 404, 
        headers: { 'Content-Type': 'text/html' } 
      });
    }

    // 路径匹配，但不是 WebSocket 请求时，提示访问受限（不暴露具体协议）
    if (headers.get('Upgrade') !== 'websocket') {
        return new Response('Access Denied', { status: 403 });
    }

    try {
      const proto = headers.get('sec-websocket-protocol');
      if (!proto) return new Response('Bad Request', { status: 400 });
      
      const _raw = Uint8Array.from(atob(proto.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      
      // 验证 UUID 密文部分
      if (!_jJFeKUOpdqvDaxGI(_raw.subarray(1, 17))) {
          return new Response('Forbidden', { status: 403 });
      }

      const { tcpSocket, initialData } = await _ppdadVaeELBSJlSg(_raw.buffer);
      const [client, server] = Object.values(new WebSocketPair());

      server.accept();
      _tamKYyjZaHuRxMQA(server, tcpSocket, initialData);

      return new Response(null, { status: 101, webSocket: client });
    } catch (e) {
      return new Response('Gateway Error', { status: 502 });
    }
  }
};

