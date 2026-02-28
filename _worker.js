const _LZYatphGWKPqCyCo = 'd14bd0e0-9ade-4824-aa96-03bbe680b4db'; 
let _iHNsBJIspPLKvKPk = 'yx1.9898981.xyz:8443',
  _xhSHtAuaebrQGfch = null,
  _ImrDOcpEklzmKNnc = false,
  _TyVoVSxfvIvubBtw = '',
  _ARHtpnRDAEngpmrr = {};
export default {
  async fetch(_spLKrYXkNoeZNPyW) {
    try {
      const _RQynzuuiLmFvUquE = new URL(_spLKrYXkNoeZNPyW.url);
      
      const _ZdDufTNYUKyioyqi = _spLKrYXkNoeZNPyW.headers.get('Upgrade');
      if (_ZdDufTNYUKyioyqi !== 'websocket') {
        return new Response('Hello World!', {
          status: 200
        });
      } else {
        _iHNsBJIspPLKvKPk = _iHNsBJIspPLKvKPk ? _iHNsBJIspPLKvKPk : _spLKrYXkNoeZNPyW.cf.colo + '.proxyIP.cmliuSSSS.NET';
        await _WhQhlONCWPVxkgLD(_spLKrYXkNoeZNPyW);
        const [_RJdzOehDfAGocdQd, _wZrtuFksKTktscTe] = await _MXeXFGcRPuFvOAJq(_iHNsBJIspPLKvKPk);
        return await _ohokaftAQSQIyZmw(_spLKrYXkNoeZNPyW, {
          parsedSocks5Address: _ARHtpnRDAEngpmrr,
          enableSocks: _xhSHtAuaebrQGfch,
          enableGlobalSocks: _ImrDOcpEklzmKNnc,
          ProxyIP: _RJdzOehDfAGocdQd,
          ProxyPort: _wZrtuFksKTktscTe
        });
      }
    } catch (_chRCQXjuFWyzeZGv) {
      return new Response(_chRCQXjuFWyzeZGv && _chRCQXjuFWyzeZGv.stack ? _chRCQXjuFWyzeZGv.stack : String(_chRCQXjuFWyzeZGv), {
        status: 500
      });
    }
  }
};
async function _ohokaftAQSQIyZmw(_spLKrYXkNoeZNPyW, _wTqhwWWrSfUXcEEZ) {
  const {
    parsedSocks5Address: _ARHtpnRDAEngpmrr,
    enableSocks: _oAaggDnbhzHdUrHJ,
    enableGlobalSocks: _DGOJuhZbXmOMDclV,
    ProxyIP: _FdqnwKlIkzWsYMBy,
    ProxyPort: _FVNZtbGhxhBPYXyb
  } = _wTqhwWWrSfUXcEEZ;
  const _eRYzFdeQLnctcSfL = new WebSocketPair();
  const [_sGRRmEvEObigAsba, _iRZWzNjozCJIjzcb] = Object.values(_eRYzFdeQLnctcSfL);
  _iRZWzNjozCJIjzcb.accept();

  
  let _NgOkaKKJwYmXCvmH = setInterval(() => {
    if (_iRZWzNjozCJIjzcb.readyState === _JxgayyealTelxtGd) {
      try {
        _iRZWzNjozCJIjzcb.send(new Uint8Array(0));
      } catch (_CGvCUwWITTJqgmiS) {}
    }
  }, 30000);
  function _gBxofbQuLnjjpneU() {
    if (_NgOkaKKJwYmXCvmH) {
      clearInterval(_NgOkaKKJwYmXCvmH);
      _NgOkaKKJwYmXCvmH = null;
    }
  }
  _iRZWzNjozCJIjzcb.addEventListener('close', _gBxofbQuLnjjpneU);
  _iRZWzNjozCJIjzcb.addEventListener('error', _gBxofbQuLnjjpneU);

  
  const _MUpgvXjjYPlHUdxe = _spLKrYXkNoeZNPyW.headers.get('sec-websocket-protocol') || '';
  const _JMyvGqVcrlghqycA = _LtylsSPmezxDYMlH(_iRZWzNjozCJIjzcb, _MUpgvXjjYPlHUdxe);
  let _aRsBwlhwKeDpxXtT = null;
  let _TIWtwvSIiPWJQIVu = null;
  let _fWvlkXtaATVEVxnR = false;
  _JMyvGqVcrlghqycA.pipeTo(new WritableStream({
    async write(_XWXrNEBqcomhrDBW) {
      if (_fWvlkXtaATVEVxnR && _TIWtwvSIiPWJQIVu) {
        return _TIWtwvSIiPWJQIVu(_XWXrNEBqcomhrDBW);
      }
      if (_aRsBwlhwKeDpxXtT) {
        try {
          const _eLJdlnsbUlzgOtkM = _aRsBwlhwKeDpxXtT.writable.getWriter();
          await _eLJdlnsbUlzgOtkM.write(_XWXrNEBqcomhrDBW);
          _eLJdlnsbUlzgOtkM.releaseLock();
        } catch (_chRCQXjuFWyzeZGv) {
          _aMtzyMRIkkLzkXZw(_aRsBwlhwKeDpxXtT);
          throw _chRCQXjuFWyzeZGv;
        }
        return;
      }
      const _OiPCQNcsKzbvUlMS = _bmIoKgoBiBIplRvy(_XWXrNEBqcomhrDBW);
      if (_OiPCQNcsKzbvUlMS.hasError) throw new Error(_OiPCQNcsKzbvUlMS.message);
      if (_OiPCQNcsKzbvUlMS.addressRemote.includes(atob('c3BlZWQuY2xvdWRmbGFyZS5jb20='))) throw new Error('Access');
      const _EIbkishqLjKxguFk = new Uint8Array([_OiPCQNcsKzbvUlMS.vlessVersion[0], 0]);
      const _eQiAwFkmOeXkoZUj = _XWXrNEBqcomhrDBW.slice(_OiPCQNcsKzbvUlMS.rawDataIndex);
      if (_OiPCQNcsKzbvUlMS.isUDP) {
        if (_OiPCQNcsKzbvUlMS.portRemote === 53) {
          _fWvlkXtaATVEVxnR = true;
          const {
            write: _cKCxWaFjmRPLBETo
          } = await _SYygdDlrktBLKTfE(_iRZWzNjozCJIjzcb, _EIbkishqLjKxguFk);
          _TIWtwvSIiPWJQIVu = _cKCxWaFjmRPLBETo;
          _TIWtwvSIiPWJQIVu(_eQiAwFkmOeXkoZUj);
          return;
        } else {
          throw new Error('UDP代理仅支持DNS(端口53)');
        }
      }
      async function _wCvGJLIwVAyVcMyu(_oiqFGJuAKelvTqHh, _yxwvgGNTGuvvGeCd) {
        const _wKbEqECFzMNiJoId = await connect({
          hostname: _oiqFGJuAKelvTqHh,
          port: _yxwvgGNTGuvvGeCd
        }, {
          allowHalfOpen: true
        });
        _aRsBwlhwKeDpxXtT = _wKbEqECFzMNiJoId;
        const _eLJdlnsbUlzgOtkM = _wKbEqECFzMNiJoId.writable.getWriter();
        await _eLJdlnsbUlzgOtkM.write(_eQiAwFkmOeXkoZUj);
        _eLJdlnsbUlzgOtkM.releaseLock();
        return _wKbEqECFzMNiJoId;
      }
      async function _QCwzPAPNXTxnYLDz(_oiqFGJuAKelvTqHh, _yxwvgGNTGuvvGeCd) {
        const _wKbEqECFzMNiJoId = _oAaggDnbhzHdUrHJ === 'socks5' ? await _UsrGJxDjsUxGZuKl(_OiPCQNcsKzbvUlMS.addressType, _oiqFGJuAKelvTqHh, _yxwvgGNTGuvvGeCd, _ARHtpnRDAEngpmrr) : await _eUFVUpMvXCwqzFcF(_OiPCQNcsKzbvUlMS.addressType, _oiqFGJuAKelvTqHh, _yxwvgGNTGuvvGeCd, _ARHtpnRDAEngpmrr);
        _aRsBwlhwKeDpxXtT = _wKbEqECFzMNiJoId;
        const _eLJdlnsbUlzgOtkM = _wKbEqECFzMNiJoId.writable.getWriter();
        await _eLJdlnsbUlzgOtkM.write(_eQiAwFkmOeXkoZUj);
        _eLJdlnsbUlzgOtkM.releaseLock();
        return _wKbEqECFzMNiJoId;
      }
      async function _gyoWTTnIspfRmhus() {
        try {
          let _wKbEqECFzMNiJoId;
          if (_oAaggDnbhzHdUrHJ === 'socks5') {
            _wKbEqECFzMNiJoId = await _UsrGJxDjsUxGZuKl(_OiPCQNcsKzbvUlMS.addressType, _OiPCQNcsKzbvUlMS.addressRemote, _OiPCQNcsKzbvUlMS.portRemote, _ARHtpnRDAEngpmrr);
          } else if (_oAaggDnbhzHdUrHJ === 'http') {
            _wKbEqECFzMNiJoId = await _eUFVUpMvXCwqzFcF(_OiPCQNcsKzbvUlMS.addressType, _OiPCQNcsKzbvUlMS.addressRemote, _OiPCQNcsKzbvUlMS.portRemote, _ARHtpnRDAEngpmrr);
          } else {
            _wKbEqECFzMNiJoId = await connect({
              hostname: _FdqnwKlIkzWsYMBy,
              port: _FVNZtbGhxhBPYXyb
            }, {
              allowHalfOpen: true
            });
          }
          _aRsBwlhwKeDpxXtT = _wKbEqECFzMNiJoId;
          const _eLJdlnsbUlzgOtkM = _wKbEqECFzMNiJoId.writable.getWriter();
          await _eLJdlnsbUlzgOtkM.write(_eQiAwFkmOeXkoZUj);
          _eLJdlnsbUlzgOtkM.releaseLock();
          _wKbEqECFzMNiJoId.closed.catch(() => {}).finally(() => {
            if (_iRZWzNjozCJIjzcb.readyState === _JxgayyealTelxtGd) {
              _iRZWzNjozCJIjzcb.close(1000, '连接已关闭');
            }
          });
          _jXfxVuvsOQsZnbrm(_wKbEqECFzMNiJoId, _iRZWzNjozCJIjzcb, _EIbkishqLjKxguFk, null);
        } catch (_chRCQXjuFWyzeZGv) {
          _aMtzyMRIkkLzkXZw(_aRsBwlhwKeDpxXtT);
          _iRZWzNjozCJIjzcb.close(1011, '代理连接失败: ' + (_chRCQXjuFWyzeZGv && _chRCQXjuFWyzeZGv.message ? _chRCQXjuFWyzeZGv.message : _chRCQXjuFWyzeZGv));
        }
      }
      try {
        if (_DGOJuhZbXmOMDclV) {
          const _wKbEqECFzMNiJoId = await _QCwzPAPNXTxnYLDz(_OiPCQNcsKzbvUlMS.addressRemote, _OiPCQNcsKzbvUlMS.portRemote);
          _jXfxVuvsOQsZnbrm(_wKbEqECFzMNiJoId, _iRZWzNjozCJIjzcb, _EIbkishqLjKxguFk, _gyoWTTnIspfRmhus);
        } else {
          const _wKbEqECFzMNiJoId = await _wCvGJLIwVAyVcMyu(_OiPCQNcsKzbvUlMS.addressRemote, _OiPCQNcsKzbvUlMS.portRemote);
          _jXfxVuvsOQsZnbrm(_wKbEqECFzMNiJoId, _iRZWzNjozCJIjzcb, _EIbkishqLjKxguFk, _gyoWTTnIspfRmhus);
        }
      } catch (_chRCQXjuFWyzeZGv) {
        _aMtzyMRIkkLzkXZw(_aRsBwlhwKeDpxXtT);
        _iRZWzNjozCJIjzcb.close(1011, '连接失败: ' + (_chRCQXjuFWyzeZGv && _chRCQXjuFWyzeZGv.message ? _chRCQXjuFWyzeZGv.message : _chRCQXjuFWyzeZGv));
      }
    },
    close() {
      if (_aRsBwlhwKeDpxXtT) {
        _aMtzyMRIkkLzkXZw(_aRsBwlhwKeDpxXtT);
      }
    }
  })).catch(_chRCQXjuFWyzeZGv => {
    _aMtzyMRIkkLzkXZw(_aRsBwlhwKeDpxXtT);
    _iRZWzNjozCJIjzcb.close(1011, '内部错误: ' + (_chRCQXjuFWyzeZGv && _chRCQXjuFWyzeZGv.message ? _chRCQXjuFWyzeZGv.message : _chRCQXjuFWyzeZGv));
  });
  return new Response(null, {
    status: 101,
    webSocket: _sGRRmEvEObigAsba
  });
}
function _LtylsSPmezxDYMlH(_xHOMVbLumNwUKErn, _MUpgvXjjYPlHUdxe) {
  return new ReadableStream({
    start(_rodUYZmlGTYJtEYf) {
      _xHOMVbLumNwUKErn.addEventListener('message', _TcXvJthbxFQSrjVR => {
        _rodUYZmlGTYJtEYf.enqueue(_TcXvJthbxFQSrjVR.data);
      });
      _xHOMVbLumNwUKErn.addEventListener('close', () => {
        _rodUYZmlGTYJtEYf.close();
      });
      _xHOMVbLumNwUKErn.addEventListener('error', _chRCQXjuFWyzeZGv => {
        _rodUYZmlGTYJtEYf.error(_chRCQXjuFWyzeZGv);
      });
      if (_MUpgvXjjYPlHUdxe) {
        try {
          const _RcQqTtRvYqKTiNZY = atob(_MUpgvXjjYPlHUdxe.replace(/-/g, '+').replace(/_/g, '/'));
          const _VcvNVuwCxkNCAxZy = Uint8Array.from(_RcQqTtRvYqKTiNZY, _UbdoxRIIPYzvPgDd => _UbdoxRIIPYzvPgDd.charCodeAt(0));
          _rodUYZmlGTYJtEYf.enqueue(_VcvNVuwCxkNCAxZy.buffer);
        } catch (_CGvCUwWITTJqgmiS) {}
      }
    }
  });
}


function _bmIoKgoBiBIplRvy(_cumvQwYxVBWafsuF) {
  if (_cumvQwYxVBWafsuF.byteLength < 24) {
    return {
      hasError: true,
      message: '无效的头部长度'
    };
  }
  const _szLUpZkZhrwuukwv = new DataView(_cumvQwYxVBWafsuF);
  const _NgXqNSJhJOOolodx = new Uint8Array(_cumvQwYxVBWafsuF.slice(0, 1));
  const _NCHfiXZLuMjmuldF = _bIduwSeMjtBxxRjW(new Uint8Array(_cumvQwYxVBWafsuF.slice(1, 17)));
  if (_LZYatphGWKPqCyCo && _NCHfiXZLuMjmuldF !== _LZYatphGWKPqCyCo) {
    return {
      hasError: true,
      message: '无效的用户'
    };
  }
  const _tcAOcnUIjZBqvWGZ = _szLUpZkZhrwuukwv.getUint8(17);
  const _GAkDzCoWgAFPWbxX = _szLUpZkZhrwuukwv.getUint8(18 + _tcAOcnUIjZBqvWGZ);
  let _XbynuvIaIfAwqslH = false;
  if (_GAkDzCoWgAFPWbxX === 1) {} else if (_GAkDzCoWgAFPWbxX === 2) {
    _XbynuvIaIfAwqslH = true;
  } else {
    return {
      hasError: true,
      message: '不支持的命令，仅支持TCP(01)和UDP(02)'
    };
  }
  let _ogUBwHhUVMcdvCpM = 19 + _tcAOcnUIjZBqvWGZ;
  const _yxwvgGNTGuvvGeCd = _szLUpZkZhrwuukwv.getUint16(_ogUBwHhUVMcdvCpM);
  _ogUBwHhUVMcdvCpM += 2;
  const _JMWozzRDZiJLJFje = _szLUpZkZhrwuukwv.getUint8(_ogUBwHhUVMcdvCpM++);
  let _oiqFGJuAKelvTqHh = '';
  switch (_JMWozzRDZiJLJFje) {
    case 1:
      _oiqFGJuAKelvTqHh = Array.from(new Uint8Array(_cumvQwYxVBWafsuF.slice(_ogUBwHhUVMcdvCpM, _ogUBwHhUVMcdvCpM + 4))).join('.');
      _ogUBwHhUVMcdvCpM += 4;
      break;
    case 2:
      const _xmUEEPtKKMRXZHxr = _szLUpZkZhrwuukwv.getUint8(_ogUBwHhUVMcdvCpM++);
      _oiqFGJuAKelvTqHh = new TextDecoder().decode(_cumvQwYxVBWafsuF.slice(_ogUBwHhUVMcdvCpM, _ogUBwHhUVMcdvCpM + _xmUEEPtKKMRXZHxr));
      _ogUBwHhUVMcdvCpM += _xmUEEPtKKMRXZHxr;
      break;
    case 3:
      const _kjewKLVQzlnNAemV = [];
      for (let _xGYEJQkdFmkcgXkc = 0; _xGYEJQkdFmkcgXkc < 8; _xGYEJQkdFmkcgXkc++) {
        _kjewKLVQzlnNAemV.push(_szLUpZkZhrwuukwv.getUint16(_ogUBwHhUVMcdvCpM).toString(16).padStart(4, '0'));
        _ogUBwHhUVMcdvCpM += 2;
      }
      _oiqFGJuAKelvTqHh = _kjewKLVQzlnNAemV.join(':').replace(/(^|:)0+(\w)/g, '$1$2');
      break;
    default:
      return {
        hasError: true,
        message: '不支持的地址类型'
      };
  }
  return {
    hasError: false,
    addressRemote: _oiqFGJuAKelvTqHh,
    portRemote: _yxwvgGNTGuvvGeCd,
    rawDataIndex: _ogUBwHhUVMcdvCpM,
    vlessVersion: _NgXqNSJhJOOolodx,
    isUDP: _XbynuvIaIfAwqslH,
    addressType: _JMWozzRDZiJLJFje
  };
}
async function _jXfxVuvsOQsZnbrm(_aRsBwlhwKeDpxXtT, _xHOMVbLumNwUKErn, _OTtEInlHayZlUIpn, _gyoWTTnIspfRmhus = null, _jAxipFuctmgLRCEi = 0) {
  const _IzJgVawVozZSahgX = 8; 
  const _JdDhFJPQEsRtlrqf = 128 * 1024; 
  const _SReOEvBXXijDWoxq = 2 * 1024 * 1024; 
  const _nMLamCPIAycyPvrK = 10; 
  const _XxxdGvBtKBfuxrAS = 200; 

  let _RoIkcIzIdvrRMtJy = false;
  let _PKnBjIflZhEDlsUm = false;
  let _wVxnBEszFcGNYLqh = [];
  let _uYxrYfBhcObVcIKg = 0;

  

  const _HVNJpLUVQuHRFWAv = _urYuDArkTIkUmObR => {
    if (_urYuDArkTIkUmObR.length === 1) return _urYuDArkTIkUmObR[0];
    const _SPPetkXDPuzcEsSG = _urYuDArkTIkUmObR.reduce((_HCOqAzxlrgBxAUDF, _UbdoxRIIPYzvPgDd) => _HCOqAzxlrgBxAUDF + _UbdoxRIIPYzvPgDd.byteLength, 0);
    const _ETbQXrDUpcXqOmlZ = new Uint8Array(_SPPetkXDPuzcEsSG);
    let _ogUBwHhUVMcdvCpM = 0;
    for (const _UbdoxRIIPYzvPgDd of _urYuDArkTIkUmObR) {
      _ETbQXrDUpcXqOmlZ.set(_UbdoxRIIPYzvPgDd, _ogUBwHhUVMcdvCpM);
      _ogUBwHhUVMcdvCpM += _UbdoxRIIPYzvPgDd.byteLength;
    }
    return _ETbQXrDUpcXqOmlZ;
  };

  
  const _ItSmcAyxoXfWuOdf = _VcvNVuwCxkNCAxZy => {
    let _ogUBwHhUVMcdvCpM = 0;
    while (_ogUBwHhUVMcdvCpM < _VcvNVuwCxkNCAxZy.byteLength) {
      const _IBELWwaLjrRYKAZu = Math.min(_ogUBwHhUVMcdvCpM + _JdDhFJPQEsRtlrqf, _VcvNVuwCxkNCAxZy.byteLength);
      _xHOMVbLumNwUKErn.send(_VcvNVuwCxkNCAxZy.slice(_ogUBwHhUVMcdvCpM, _IBELWwaLjrRYKAZu));
      _ogUBwHhUVMcdvCpM = _IBELWwaLjrRYKAZu;
    }
  };
  const _BtmFoIqQRplyNpoI = () => {
    if (_xHOMVbLumNwUKErn.readyState !== _JxgayyealTelxtGd || _wVxnBEszFcGNYLqh.length === 0) return;
    const _ETbQXrDUpcXqOmlZ = _HVNJpLUVQuHRFWAv(_wVxnBEszFcGNYLqh);
    _wVxnBEszFcGNYLqh = [];
    _uYxrYfBhcObVcIKg = 0;
    _ItSmcAyxoXfWuOdf(_ETbQXrDUpcXqOmlZ);
  };
  const _mYTWEhfVFNTjprJB = setInterval(_BtmFoIqQRplyNpoI, _nMLamCPIAycyPvrK);

  
  const _DwkznFePlNjRMexI = _aRsBwlhwKeDpxXtT.readable.getReader();
  try {
    while (true) {
      const {
        done: _DgMYUYVlCbpmRpjR,
        value: _VoJqIjlhjKLsvFSJ
      } = await _DwkznFePlNjRMexI.read();
      if (_DgMYUYVlCbpmRpjR) break;
      _PKnBjIflZhEDlsUm = true;
      if (_xHOMVbLumNwUKErn.readyState !== _JxgayyealTelxtGd) break;

      
      if (!_RoIkcIzIdvrRMtJy) {
        const _KlKxjTTXdvRiPJIt = new Uint8Array(_OTtEInlHayZlUIpn.byteLength + _VoJqIjlhjKLsvFSJ.byteLength);
        _KlKxjTTXdvRiPJIt.set(new Uint8Array(_OTtEInlHayZlUIpn), 0);
        _KlKxjTTXdvRiPJIt.set(_VoJqIjlhjKLsvFSJ, _OTtEInlHayZlUIpn.byteLength);
        _wVxnBEszFcGNYLqh.push(_KlKxjTTXdvRiPJIt);
        _uYxrYfBhcObVcIKg += _KlKxjTTXdvRiPJIt.byteLength;
        _RoIkcIzIdvrRMtJy = true;
      } else {
        _wVxnBEszFcGNYLqh.push(_VoJqIjlhjKLsvFSJ);
        _uYxrYfBhcObVcIKg += _VoJqIjlhjKLsvFSJ.byteLength;
      }

      
      if (_uYxrYfBhcObVcIKg >= _SReOEvBXXijDWoxq) {
        _BtmFoIqQRplyNpoI();
      }
    }
    _DwkznFePlNjRMexI.releaseLock();
    _BtmFoIqQRplyNpoI();
    clearInterval(_mYTWEhfVFNTjprJB);

    
    if (!_PKnBjIflZhEDlsUm && _gyoWTTnIspfRmhus && _jAxipFuctmgLRCEi < _IzJgVawVozZSahgX) {
      const _kFqwijGIcsmHPPyH = _XxxdGvBtKBfuxrAS * Math.pow(2, _jAxipFuctmgLRCEi);
      console.warn(`未收到数据，${_kFqwijGIcsmHPPyH} ms 后重试 (${_jAxipFuctmgLRCEi + 1}/${_IzJgVawVozZSahgX})`);
      await new Promise(_IFUvHtlDoUnZhyxG => setTimeout(_IFUvHtlDoUnZhyxG, _kFqwijGIcsmHPPyH));
      await _gyoWTTnIspfRmhus();
      return;
    }
    if (_xHOMVbLumNwUKErn.readyState === _JxgayyealTelxtGd) _xHOMVbLumNwUKErn.close(1000, '正常关闭');
  } catch (_chRCQXjuFWyzeZGv) {
    _DwkznFePlNjRMexI.releaseLock();
    clearInterval(_mYTWEhfVFNTjprJB);
    console.error('数据传输错误:', _chRCQXjuFWyzeZGv);
    _aMtzyMRIkkLzkXZw(_aRsBwlhwKeDpxXtT);
    if (_gyoWTTnIspfRmhus && _jAxipFuctmgLRCEi < _IzJgVawVozZSahgX) {
      const _kFqwijGIcsmHPPyH = _XxxdGvBtKBfuxrAS * Math.pow(2, _jAxipFuctmgLRCEi);
      console.warn(`错误重试 (${_jAxipFuctmgLRCEi + 1}/${_IzJgVawVozZSahgX})，将在 ${_kFqwijGIcsmHPPyH} ms 后重试`);
      await new Promise(_IFUvHtlDoUnZhyxG => setTimeout(_IFUvHtlDoUnZhyxG, _kFqwijGIcsmHPPyH));
      await _gyoWTTnIspfRmhus();
      return;
    }
    if (_xHOMVbLumNwUKErn.readyState === _JxgayyealTelxtGd) {
      _xHOMVbLumNwUKErn.close(1011, '数据传输错误');
    }
  }
}
function _aMtzyMRIkkLzkXZw(_CAWOZXtTtqZvnyLG) {
  if (_CAWOZXtTtqZvnyLG) {
    try {
      _CAWOZXtTtqZvnyLG.close();
    } catch (_CGvCUwWITTJqgmiS) {}
  }
}
function _bIduwSeMjtBxxRjW(_ZNSLkLavIHTmLtPe) {
  const _WECQpYYSXqZVKYrY = Array.from(_ZNSLkLavIHTmLtPe, _GkvJwoWbgUMgZueB => _GkvJwoWbgUMgZueB.toString(16).padStart(2, '0')).join('');
  return `${_WECQpYYSXqZVKYrY.slice(0, 8)}-${_WECQpYYSXqZVKYrY.slice(8, 12)}-${_WECQpYYSXqZVKYrY.slice(12, 16)}-${_WECQpYYSXqZVKYrY.slice(16, 20)}-${_WECQpYYSXqZVKYrY.slice(20)}`;
}
async function _UsrGJxDjsUxGZuKl(_JMWozzRDZiJLJFje, _QsfdKCplVQInpDQE, _KIWLUfYXrHkrSvLP, _ARHtpnRDAEngpmrr) {
  const {
    username: _gpCmpiyHNRsjbmmS,
    password: _HnsKrCCnUpDfzpjz,
    hostname: _wmoMoxhSEgrQRfGY,
    port: _yxwvgGNTGuvvGeCd
  } = _ARHtpnRDAEngpmrr;
  const _CAWOZXtTtqZvnyLG = connect({
    hostname: _wmoMoxhSEgrQRfGY,
    port: _yxwvgGNTGuvvGeCd
  });
  const _KtmhmsanIacInotA = new Uint8Array([5, 2, 0, 2]);
  const _eLJdlnsbUlzgOtkM = _CAWOZXtTtqZvnyLG.writable.getWriter();
  await _eLJdlnsbUlzgOtkM.write(_KtmhmsanIacInotA);
  const _DwkznFePlNjRMexI = _CAWOZXtTtqZvnyLG.readable.getReader();
  const _pVoPbxksJAPuApLa = new TextEncoder();
  let _VeWMGNRMFukqKHQN = (await _DwkznFePlNjRMexI.read()).value;
  if (_VeWMGNRMFukqKHQN[0] !== 0x05) {
    throw new Error(`socks server version error: ${_VeWMGNRMFukqKHQN[0]} expected: 5`);
  }
  if (_VeWMGNRMFukqKHQN[1] === 0xff) {
    throw new Error("no acceptable methods");
  }
  if (_VeWMGNRMFukqKHQN[1] === 0x02) {
    if (!_gpCmpiyHNRsjbmmS || !_HnsKrCCnUpDfzpjz) {
      throw new Error("please provide username/password");
    }
    const _BSjKJaamgwXqaRVH = new Uint8Array([1, _gpCmpiyHNRsjbmmS.length, ..._pVoPbxksJAPuApLa.encode(_gpCmpiyHNRsjbmmS), _HnsKrCCnUpDfzpjz.length, ..._pVoPbxksJAPuApLa.encode(_HnsKrCCnUpDfzpjz)]);
    await _eLJdlnsbUlzgOtkM.write(_BSjKJaamgwXqaRVH);
    _VeWMGNRMFukqKHQN = (await _DwkznFePlNjRMexI.read()).value;
    if (_VeWMGNRMFukqKHQN[0] !== 0x01 || _VeWMGNRMFukqKHQN[1] !== 0x00) {
      throw new Error("fail to auth socks server");
    }
  }
  let _YtgLksNnMpeWwcBZ;
  switch (_JMWozzRDZiJLJFje) {
    case 1:
      _YtgLksNnMpeWwcBZ = new Uint8Array([1, ..._QsfdKCplVQInpDQE.split('.').map(Number)]);
      break;
    case 2:
      _YtgLksNnMpeWwcBZ = new Uint8Array([3, _QsfdKCplVQInpDQE.length, ..._pVoPbxksJAPuApLa.encode(_QsfdKCplVQInpDQE)]);
      break;
    case 3:
      _YtgLksNnMpeWwcBZ = new Uint8Array([4, ..._QsfdKCplVQInpDQE.split(':').flatMap(_vhTiCUruyDSbJghI => [parseInt(_vhTiCUruyDSbJghI.slice(0, 2), 16), parseInt(_vhTiCUruyDSbJghI.slice(2), 16)])]);
      break;
    default:
      throw new Error(`invalid addressType is ${_JMWozzRDZiJLJFje}`);
  }
  const _QjPPvkSBMYElbsDr = new Uint8Array([5, 1, 0, ..._YtgLksNnMpeWwcBZ, _KIWLUfYXrHkrSvLP >> 8, _KIWLUfYXrHkrSvLP & 0xff]);
  await _eLJdlnsbUlzgOtkM.write(_QjPPvkSBMYElbsDr);
  _VeWMGNRMFukqKHQN = (await _DwkznFePlNjRMexI.read()).value;
  if (_VeWMGNRMFukqKHQN[1] === 0x00) {} else {
    throw new Error("fail to open socks connection");
  }
  _eLJdlnsbUlzgOtkM.releaseLock();
  _DwkznFePlNjRMexI.releaseLock();
  return _CAWOZXtTtqZvnyLG;
}
async function _eUFVUpMvXCwqzFcF(_JMWozzRDZiJLJFje, _QsfdKCplVQInpDQE, _KIWLUfYXrHkrSvLP, _ARHtpnRDAEngpmrr) {
  const {
    username: _gpCmpiyHNRsjbmmS,
    password: _HnsKrCCnUpDfzpjz,
    hostname: _wmoMoxhSEgrQRfGY,
    port: _yxwvgGNTGuvvGeCd
  } = _ARHtpnRDAEngpmrr;
  const _euMevBPmgUrvlAFK = await connect({
    hostname: _wmoMoxhSEgrQRfGY,
    port: _yxwvgGNTGuvvGeCd
  });

  
  let _UtyEUTkjlhgVLxUL = `CONNECT ${_QsfdKCplVQInpDQE}:${_KIWLUfYXrHkrSvLP} HTTP/1.1\r\n`;
  _UtyEUTkjlhgVLxUL += `Host: ${_QsfdKCplVQInpDQE}:${_KIWLUfYXrHkrSvLP}\r\n`;

  
  if (_gpCmpiyHNRsjbmmS && _HnsKrCCnUpDfzpjz) {
    const _CEmNBGRvkHpkFrHz = `${_gpCmpiyHNRsjbmmS}:${_HnsKrCCnUpDfzpjz}`;
    const _lkuximydLIlRfeqA = btoa(_CEmNBGRvkHpkFrHz);
    _UtyEUTkjlhgVLxUL += `Proxy-Authorization: Basic ${_lkuximydLIlRfeqA}\r\n`;
  }
  _UtyEUTkjlhgVLxUL += `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n`;
  _UtyEUTkjlhgVLxUL += `Proxy-Connection: Keep-Alive\r\n`;
  _UtyEUTkjlhgVLxUL += `Connection: Keep-Alive\r\n`; 
  _UtyEUTkjlhgVLxUL += `\r\n`;
  try {
    
    const _eLJdlnsbUlzgOtkM = _euMevBPmgUrvlAFK.writable.getWriter();
    await _eLJdlnsbUlzgOtkM.write(new TextEncoder().encode(_UtyEUTkjlhgVLxUL));
    _eLJdlnsbUlzgOtkM.releaseLock();
  } catch (_chRCQXjuFWyzeZGv) {
    console.error('发送HTTP CONNECT请求失败:', _chRCQXjuFWyzeZGv);
    throw new Error(`发送HTTP CONNECT请求失败: ${_chRCQXjuFWyzeZGv.message}`);
  }

  
  const _DwkznFePlNjRMexI = _euMevBPmgUrvlAFK.readable.getReader();
  let _rSDdVOgnwrVWoNOa = '';
  let _vlxUGdpmkhwlJByw = false;
  let _nsdWddrUgHlcDOxD = new Uint8Array(0);
  try {
    while (true) {
      const {
        value: _VoJqIjlhjKLsvFSJ,
        done: _DgMYUYVlCbpmRpjR
      } = await _DwkznFePlNjRMexI.read();
      if (_DgMYUYVlCbpmRpjR) {
        console.error('HTTP代理连接中断');
        throw new Error('HTTP代理连接中断');
      }

      
      const _rLEVBbStDNYvOMfk = new Uint8Array(_nsdWddrUgHlcDOxD.length + _VoJqIjlhjKLsvFSJ.length);
      _rLEVBbStDNYvOMfk.set(_nsdWddrUgHlcDOxD);
      _rLEVBbStDNYvOMfk.set(_VoJqIjlhjKLsvFSJ, _nsdWddrUgHlcDOxD.length);
      _nsdWddrUgHlcDOxD = _rLEVBbStDNYvOMfk;

      
      _rSDdVOgnwrVWoNOa = new TextDecoder().decode(_nsdWddrUgHlcDOxD);

      
      if (_rSDdVOgnwrVWoNOa.includes('\r\n\r\n')) {
        
        const _FuJJQQFdpBwrCfpk = _rSDdVOgnwrVWoNOa.indexOf('\r\n\r\n') + 4;
        const _aNWxhjsnSAsPxdLC = _rSDdVOgnwrVWoNOa.substring(0, _FuJJQQFdpBwrCfpk);

        
        if (_aNWxhjsnSAsPxdLC.startsWith('HTTP/1.1 200') || _aNWxhjsnSAsPxdLC.startsWith('HTTP/1.0 200')) {
          _vlxUGdpmkhwlJByw = true;

          
          if (_FuJJQQFdpBwrCfpk < _nsdWddrUgHlcDOxD.length) {
            const _mzAMxIpepohChcMJ = _nsdWddrUgHlcDOxD.slice(_FuJJQQFdpBwrCfpk);
            
            const _NfHAVydyDlZmVSsZ = new ReadableStream({
              start(_rodUYZmlGTYJtEYf) {
                _rodUYZmlGTYJtEYf.enqueue(_mzAMxIpepohChcMJ);
              }
            });

            
            const {
              readable: _RiWeCLYrDiFuRZDh,
              writable: _ohUUAVSQUWQpVIuW
            } = new TransformStream();
            _NfHAVydyDlZmVSsZ.pipeTo(_ohUUAVSQUWQpVIuW).catch(_chRCQXjuFWyzeZGv => console.error('处理剩余数据错误:', _chRCQXjuFWyzeZGv));

            
            
            _euMevBPmgUrvlAFK.readable = _RiWeCLYrDiFuRZDh;
          }
        } else {
          const _lEcSgLJWiAlatiOT = `HTTP代理连接失败: ${_aNWxhjsnSAsPxdLC.split('\r\n')[0]}`;
          console.error(_lEcSgLJWiAlatiOT);
          throw new Error(_lEcSgLJWiAlatiOT);
        }
        break;
      }
    }
  } catch (_chRCQXjuFWyzeZGv) {
    _DwkznFePlNjRMexI.releaseLock();
    throw new Error(`处理HTTP代理响应失败: ${_chRCQXjuFWyzeZGv.message}`);
  }
  _DwkznFePlNjRMexI.releaseLock();
  if (!_vlxUGdpmkhwlJByw) {
    throw new Error('HTTP代理连接失败: 未收到成功响应');
  }
  return _euMevBPmgUrvlAFK;
}
async function _SYygdDlrktBLKTfE(_ZBiFVhAnIQRDwawP, _gBudYBTLzEaIyAAk) {
  let _LSchzXNxretscbyE = false;
  const _VHLamdVvTXKnUymy = new TransformStream({
    start(_rodUYZmlGTYJtEYf) {},
    transform(_XWXrNEBqcomhrDBW, _rodUYZmlGTYJtEYf) {
      for (let _StvOpZDDhYwCFBOW = 0; _StvOpZDDhYwCFBOW < _XWXrNEBqcomhrDBW.byteLength;) {
        const _NKjOHtybYLIIXZKC = _XWXrNEBqcomhrDBW.slice(_StvOpZDDhYwCFBOW, _StvOpZDDhYwCFBOW + 2);
        const _wRwHLBqCqNGsirMU = new DataView(_NKjOHtybYLIIXZKC).getUint16(0);
        const _GyxhMdZGtWaFqlCE = new Uint8Array(_XWXrNEBqcomhrDBW.slice(_StvOpZDDhYwCFBOW + 2, _StvOpZDDhYwCFBOW + 2 + _wRwHLBqCqNGsirMU));
        _StvOpZDDhYwCFBOW = _StvOpZDDhYwCFBOW + 2 + _wRwHLBqCqNGsirMU;
        _rodUYZmlGTYJtEYf.enqueue(_GyxhMdZGtWaFqlCE);
      }
    },
    flush(_rodUYZmlGTYJtEYf) {}
  });
  _VHLamdVvTXKnUymy.readable.pipeTo(new WritableStream({
    async write(_XWXrNEBqcomhrDBW) {
      const _QLsWwSOrVpOELuYC = await fetch('https:
        method: 'POST',
        headers: {
          'content-type': 'application/dns-message'
        },
        body: _XWXrNEBqcomhrDBW
      });
      const _qtdCzzxPhXBELatB = await _QLsWwSOrVpOELuYC.arrayBuffer();
      const _LFvubMgjjXPiTTLq = _qtdCzzxPhXBELatB.byteLength;
      const _UblHNWcZISfRXGli = new Uint8Array([_LFvubMgjjXPiTTLq >> 8 & 0xff, _LFvubMgjjXPiTTLq & 0xff]);
      if (_ZBiFVhAnIQRDwawP.readyState === _JxgayyealTelxtGd) {
        if (_LSchzXNxretscbyE) {
          _ZBiFVhAnIQRDwawP.send(await new Blob([_UblHNWcZISfRXGli, _qtdCzzxPhXBELatB]).arrayBuffer());
        } else {
          _ZBiFVhAnIQRDwawP.send(await new Blob([_gBudYBTLzEaIyAAk, _UblHNWcZISfRXGli, _qtdCzzxPhXBELatB]).arrayBuffer());
          _LSchzXNxretscbyE = true;
        }
      }
    }
  })).catch(_VBSVusgADLirnYOE => {});
  const _eLJdlnsbUlzgOtkM = _VHLamdVvTXKnUymy.writable.getWriter();
  return {
    write(_XWXrNEBqcomhrDBW) {
      _eLJdlnsbUlzgOtkM.write(_XWXrNEBqcomhrDBW);
    }
  };
}


const _JxgayyealTelxtGd = 1;
import { connect } from 'cloudflare:sockets';
async function _MXeXFGcRPuFvOAJq(_iXrPjSDJGGOjLsVL) {
  _iXrPjSDJGGOjLsVL = _iXrPjSDJGGOjLsVL.toLowerCase();
  let _ssGMBZNVrdbsGkoY = _iXrPjSDJGGOjLsVL,
    _puMMnvNqJMlKTeZO = 443;
  if (_iXrPjSDJGGOjLsVL.includes('.tp')) {
    const _cNgRzEQDvxRxRyUb = _iXrPjSDJGGOjLsVL.match(/\.tp(\d+)/);
    if (_cNgRzEQDvxRxRyUb) _puMMnvNqJMlKTeZO = parseInt(_cNgRzEQDvxRxRyUb[1], 10);
    return [_ssGMBZNVrdbsGkoY, _puMMnvNqJMlKTeZO];
  }
  if (_iXrPjSDJGGOjLsVL.includes(']:')) {
    const _RrUeiqJFkqdrPsTc = _iXrPjSDJGGOjLsVL.split(']:');
    _ssGMBZNVrdbsGkoY = _RrUeiqJFkqdrPsTc[0] + ']';
    _puMMnvNqJMlKTeZO = parseInt(_RrUeiqJFkqdrPsTc[1], 10) || _puMMnvNqJMlKTeZO;
  } else if (_iXrPjSDJGGOjLsVL.includes(':') && !_iXrPjSDJGGOjLsVL.startsWith('[')) {
    const _NGzwKBuoGQWJapTK = _iXrPjSDJGGOjLsVL.lastIndexOf(':');
    _ssGMBZNVrdbsGkoY = _iXrPjSDJGGOjLsVL.slice(0, _NGzwKBuoGQWJapTK);
    _puMMnvNqJMlKTeZO = parseInt(_iXrPjSDJGGOjLsVL.slice(_NGzwKBuoGQWJapTK + 1), 10) || _puMMnvNqJMlKTeZO;
  }
  return [_ssGMBZNVrdbsGkoY, _puMMnvNqJMlKTeZO];
}
async function _WhQhlONCWPVxkgLD(_spLKrYXkNoeZNPyW) {
  const _RQynzuuiLmFvUquE = new URL(_spLKrYXkNoeZNPyW.url);
  const {
    pathname: _SNeyTjjrmxXQahpN,
    searchParams: _KRoMIgfiKIBsGhax
  } = _RQynzuuiLmFvUquE;
  const _eIGSLsWZVkEKdNKq = _SNeyTjjrmxXQahpN.toLowerCase();

  
  _TyVoVSxfvIvubBtw = _KRoMIgfiKIBsGhax.get('socks5') || _KRoMIgfiKIBsGhax.get('http') || null;
  _ImrDOcpEklzmKNnc = _KRoMIgfiKIBsGhax.has('globalproxy') || false;

  
  const _NIyPLqCFyuhmKcyH = _eIGSLsWZVkEKdNKq.match(/\/(proxyip[.=]|pyip=|ip=)(.+)/);
  if (_KRoMIgfiKIBsGhax.has('proxyip')) {
    const _llXgtUPGxLblciMC = _KRoMIgfiKIBsGhax.get('proxyip');
    _iHNsBJIspPLKvKPk = _llXgtUPGxLblciMC.includes(',') ? _llXgtUPGxLblciMC.split(',')[Math.floor(Math.random() * _llXgtUPGxLblciMC.split(',').length)] : _llXgtUPGxLblciMC;
    return;
  } else if (_NIyPLqCFyuhmKcyH) {
    const _llXgtUPGxLblciMC = _NIyPLqCFyuhmKcyH[1] === 'proxyip.' ? `proxyip.${_NIyPLqCFyuhmKcyH[2]}` : _NIyPLqCFyuhmKcyH[2];
    _iHNsBJIspPLKvKPk = _llXgtUPGxLblciMC.includes(',') ? _llXgtUPGxLblciMC.split(',')[Math.floor(Math.random() * _llXgtUPGxLblciMC.split(',').length)] : _llXgtUPGxLblciMC;
    return;
  }

  
  let _HQtdeJoTRYeAmeto;
  if (_HQtdeJoTRYeAmeto = _SNeyTjjrmxXQahpN.match(/\/(socks5?|http):\/?\/?(.+)/i)) {
    
    _xhSHtAuaebrQGfch = _HQtdeJoTRYeAmeto[1].toLowerCase() === 'http' ? 'http' : 'socks5';
    _TyVoVSxfvIvubBtw = _HQtdeJoTRYeAmeto[2].split('#')[0];
    _ImrDOcpEklzmKNnc = true;

    
    if (_TyVoVSxfvIvubBtw.includes('@')) {
      const _VZybQchZGkUXfvfQ = _TyVoVSxfvIvubBtw.lastIndexOf('@');
      let _XLSFcWEzHgVTrDME = _TyVoVSxfvIvubBtw.substring(0, _VZybQchZGkUXfvfQ).replaceAll('%3D', '=');
      if (/^(?:[A-Z0-9+/]{4})*(?:[A-Z0-9+/]{2}==|[A-Z0-9+/]{3}=)?$/i.test(_XLSFcWEzHgVTrDME) && !_XLSFcWEzHgVTrDME.includes(':')) {
        _XLSFcWEzHgVTrDME = atob(_XLSFcWEzHgVTrDME);
      }
      _TyVoVSxfvIvubBtw = `${_XLSFcWEzHgVTrDME}@${_TyVoVSxfvIvubBtw.substring(_VZybQchZGkUXfvfQ + 1)}`;
    }
  } else if (_HQtdeJoTRYeAmeto = _SNeyTjjrmxXQahpN.match(/\/(g?s5|socks5|g?http)=(.+)/i)) {
    
    const _PPgDPvHwagjgLmdP = _HQtdeJoTRYeAmeto[1].toLowerCase();
    _TyVoVSxfvIvubBtw = _HQtdeJoTRYeAmeto[2];
    _xhSHtAuaebrQGfch = _PPgDPvHwagjgLmdP.includes('http') ? 'http' : 'socks5';
    _ImrDOcpEklzmKNnc = _PPgDPvHwagjgLmdP.startsWith('g') || _ImrDOcpEklzmKNnc; 
  }

  
  if (_TyVoVSxfvIvubBtw) {
    try {
      _ARHtpnRDAEngpmrr = await _NlZsholQZsTbAhyy(_TyVoVSxfvIvubBtw);
      _xhSHtAuaebrQGfch = _KRoMIgfiKIBsGhax.get('http') ? 'http' : _xhSHtAuaebrQGfch;
    } catch (_chRCQXjuFWyzeZGv) {
      console.error('解析SOCKS5地址失败:', _chRCQXjuFWyzeZGv.message);
      _xhSHtAuaebrQGfch = null;
    }
  } else _xhSHtAuaebrQGfch = null;
}
async function _NlZsholQZsTbAhyy(_oiqFGJuAKelvTqHh) {
  const _DoPYthDMIsfsEvWQ = _oiqFGJuAKelvTqHh.lastIndexOf("@");
  let [_BiTjYHzIZPwIRHxH, _xKKNJkjtlmBLnlHO] = _DoPYthDMIsfsEvWQ === -1 ? [_oiqFGJuAKelvTqHh, undefined] : [_oiqFGJuAKelvTqHh.substring(_DoPYthDMIsfsEvWQ + 1), _oiqFGJuAKelvTqHh.substring(0, _DoPYthDMIsfsEvWQ)];
  let _gpCmpiyHNRsjbmmS, _HnsKrCCnUpDfzpjz, _wmoMoxhSEgrQRfGY, _yxwvgGNTGuvvGeCd;
  if (_xKKNJkjtlmBLnlHO) {
    const _CSJQuQGaYhfDicQB = _xKKNJkjtlmBLnlHO.split(":");
    if (_CSJQuQGaYhfDicQB.length !== 2) {
      throw new Error('无效的 SOCKS 地址格式：认证部分必须是 "username:password" 的形式');
    }
    [_gpCmpiyHNRsjbmmS, _HnsKrCCnUpDfzpjz] = _CSJQuQGaYhfDicQB;
  }
  const _HvmDhGvXDxGRDgeo = _BiTjYHzIZPwIRHxH.split(":");
  if (_HvmDhGvXDxGRDgeo.length > 2 && _BiTjYHzIZPwIRHxH.includes("]:")) {
    _yxwvgGNTGuvvGeCd = Number(_BiTjYHzIZPwIRHxH.split("]:")[1].replace(/[^\d]/g, ''));
    _wmoMoxhSEgrQRfGY = _BiTjYHzIZPwIRHxH.split("]:")[0] + "]";
  } else if (_HvmDhGvXDxGRDgeo.length === 2) {
    _yxwvgGNTGuvvGeCd = Number(_HvmDhGvXDxGRDgeo.pop().replace(/[^\d]/g, ''));
    _wmoMoxhSEgrQRfGY = _HvmDhGvXDxGRDgeo.join(":");
  } else {
    _yxwvgGNTGuvvGeCd = 80;
    _wmoMoxhSEgrQRfGY = _BiTjYHzIZPwIRHxH;
  }
  if (isNaN(_yxwvgGNTGuvvGeCd)) {
    throw new Error('无效的 SOCKS 地址格式：端口号必须是数字');
  }
  const _LmWggTeDiLHGUVyX = /^\[.*\]$/;
  if (_wmoMoxhSEgrQRfGY.includes(":") && !_LmWggTeDiLHGUVyX.test(_wmoMoxhSEgrQRfGY)) {
    throw new Error('无效的 SOCKS 地址格式：IPv6 地址必须用方括号括起来，如 [2001:db8::1]');
  }
  return {
    username: _gpCmpiyHNRsjbmmS,
    password: _HnsKrCCnUpDfzpjz,
    hostname: _wmoMoxhSEgrQRfGY,
    port: _yxwvgGNTGuvvGeCd
  };
}
