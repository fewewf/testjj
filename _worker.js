const FIXED_KEY = 'd14bd0e0-9ade-4824-aa96-03bbe680b4db';
let mainServer = 'yx1.9898981.xyz:8443';

// 备用服务器列表 - 使用简单可用的服务器
const BACKUP_SERVERS = [
    'proxyip.cf.342688.xyz:443',
    'proxyip.hk.342688.xyz:443',
    'proxyip.jp.342688.xyz:443'
];

// 超时设置
const LINK_TIMEOUT = 8000; // 增加到8秒
const MAX_RETRY = 2;

export default {
    async fetch(request) {
        try {
            const url = new URL(request.url);
            const upgradeHeader = request.headers.get('Upgrade');
            
            if (upgradeHeader !== 'websocket') {
                return new Response('Hello World!', { status: 200 });
            } else {
                await updateMainServer(request);
                const serverList = await getServerList(request);
                return await handleWebSocket(request, { serverList });
            }
        } catch (error) {
            return new Response(error && error.stack ? error.stack : String(error), { status: 500 });
        }
    },
};

async function getServerList(request) {
    const servers = [];
    
    // 解析主服务器
    const [mainHost, mainPort] = await parseAddress(mainServer);
    servers.push({ host: mainHost, port: mainPort });
    
    // 添加备用服务器
    for (const backup of BACKUP_SERVERS) {
        const [host, port] = await parseAddress(backup);
        servers.push({ host, port });
    }
    
    return servers;
}

async function handleWebSocket(request, config) {
    const { serverList } = config;
    const wsPair = new WebSocketPair();
    const [clientWS, serverWS] = Object.values(wsPair);

    serverWS.accept();

    // Heartbeat
    let heartbeatTimer = setInterval(() => {
        if (serverWS.readyState === WS_STATE_OPEN) {
            try {
                serverWS.send(new Uint8Array(0));
            } catch (e) {}
        }
    }, 30000);

    function stopHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    }

    serverWS.addEventListener('close', stopHeartbeat);
    serverWS.addEventListener('error', stopHeartbeat);

    const earlyData = request.headers.get('sec-websocket-protocol') || '';
    const readableStream = createReadableStream(serverWS, earlyData);
    
    let remoteConn = null;
    let udpWriter = null;
    let isDnsMode = false;
    let targetInfo = null;
    let clientData = null;
    let vlessHeader = null;

    readableStream.pipeTo(new WritableStream({
        async write(dataChunk) {
            try {
                // 确保数据格式正确
                let buffer;
                if (dataChunk instanceof ArrayBuffer) {
                    buffer = new Uint8Array(dataChunk);
                } else if (dataChunk instanceof Uint8Array) {
                    buffer = dataChunk;
                } else if (dataChunk instanceof Blob) {
                    buffer = new Uint8Array(await dataChunk.arrayBuffer());
                } else {
                    buffer = new Uint8Array(dataChunk);
                }

                // DNS模式
                if (isDnsMode && udpWriter) {
                    return udpWriter(buffer);
                }

                // 如果已连接，直接转发数据
                if (remoteConn) {
                    try {
                        const writer = remoteConn.writable.getWriter();
                        await writer.write(buffer);
                        writer.releaseLock();
                    } catch (err) {
                        closeConnection(remoteConn);
                        remoteConn = null;
                    }
                    return;
                }

                // 首次连接，解析VLESS头部
                if (!targetInfo) {
                    const parseResult = parseVLESSHeader(buffer);
                    if (parseResult.hasError) {
                        console.log('Header parse error:', parseResult.message);
                        throw new Error(parseResult.message);
                    }
                    
                    // 屏蔽特定域名
                    if (parseResult.targetAddress.includes(atob('c3BlZWQuY2xvdWRmbGFyZS5jb20='))) {
                        throw new Error('Access Denied');
                    }

                    targetInfo = {
                        host: parseResult.targetAddress,
                        port: parseResult.targetPort
                    };
                    
                    vlessHeader = new Uint8Array([parseResult.version[0], 0]);
                    clientData = buffer.slice(parseResult.dataOffset);
                    
                    console.log(`Target: ${targetInfo.host}:${targetInfo.port}`);

                    // UDP DNS处理
                    if (parseResult.isUdp) {
                        if (parseResult.targetPort === 53) {
                            isDnsMode = true;
                            const { write } = await handleUDP(serverWS, vlessHeader);
                            udpWriter = write;
                            udpWriter(clientData);
                            return;
                        } else {
                            throw new Error('UDP only supports port 53');
                        }
                    }

                    // 尝试连接
                    await tryConnect(0);
                }
            } catch (err) {
                console.log('Write error:', err.message);
                if (serverWS.readyState === WS_STATE_OPEN) {
                    serverWS.close(1011, err.message);
                }
            }
        },
        close() {
            if (remoteConn) {
                closeConnection(remoteConn);
            }
        }
    })).catch(err => {
        console.log('Stream error:', err.message);
        closeConnection(remoteConn);
    });

    // 尝试连接函数
    async function tryConnect(attempt) {
        if (!targetInfo || !clientData || !vlessHeader) {
            console.log('Missing target info');
            return;
        }

        // 选择服务器：第一次用主服务器，之后用备用
        let serverToUse;
        if (attempt === 0) {
            // 第一次尝试直接连接目标
            serverToUse = { host: targetInfo.host, port: targetInfo.port };
        } else {
            // 后续尝试使用备用代理服务器
            const proxyIndex = (attempt - 1) % serverList.length;
            serverToUse = serverList[proxyIndex];
        }

        console.log(`Attempt ${attempt + 1}: Connecting to ${serverToUse.host}:${serverToUse.port}`);

        try {
            // 带超时的连接
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), LINK_TIMEOUT);

            const socket = await connect(
                { hostname: serverToUse.host, port: serverToUse.port },
                { signal: controller.signal }
            );
            
            clearTimeout(timer);
            
            // 发送数据
            const writer = socket.writable.getWriter();
            await writer.write(clientData);
            writer.releaseLock();

            remoteConn = socket;

            // 开始接收数据
            receiveData(socket, serverWS, vlessHeader);

        } catch (err) {
            console.log(`Attempt ${attempt + 1} failed:`, err.message);
            closeConnection(remoteConn);
            remoteConn = null;

            // 尝试下一次
            if (attempt < MAX_RETRY) {
                await tryConnect(attempt + 1);
            } else {
                console.log('All attempts failed');
                if (serverWS.readyState === WS_STATE_OPEN) {
                    serverWS.close(1011, 'All connections failed');
                }
            }
        }
    }

    // 接收数据函数
    async function receiveData(socket, ws, header) {
        const MAX_FRAGMENT = 128 * 1024;
        let headerSent = false;

        try {
            const reader = socket.readable.getReader();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (ws.readyState !== WS_STATE_OPEN) break;

                if (!headerSent) {
                    // 合并header和第一个数据包
                    const combined = new Uint8Array(header.byteLength + value.byteLength);
                    combined.set(new Uint8Array(header), 0);
                    combined.set(new Uint8Array(value), header.byteLength);
                    
                    // 分片发送
                    let pos = 0;
                    while (pos < combined.byteLength) {
                        const end = Math.min(pos + MAX_FRAGMENT, combined.byteLength);
                        ws.send(combined.slice(pos, end));
                        pos = end;
                    }
                    headerSent = true;
                } else {
                    // 直接发送数据
                    let pos = 0;
                    while (pos < value.byteLength) {
                        const end = Math.min(pos + MAX_FRAGMENT, value.byteLength);
                        ws.send(value.slice(pos, end));
                        pos = end;
                    }
                }
            }

            reader.releaseLock();

            if (ws.readyState === WS_STATE_OPEN) {
                ws.close(1000, 'Done');
            }
        } catch (err) {
            console.log('Receive error:', err.message);
            closeConnection(socket);
        }
    }

    return new Response(null, {
        status: 101,
        webSocket: clientWS,
    });
}

function createReadableStream(ws, earlyData) {
    return new ReadableStream({
        start(controller) {
            let earlyDataSent = false;
            
            ws.addEventListener('message', event => {
                let data = event.data;
                
                if (typeof data === 'string') {
                    controller.enqueue(new TextEncoder().encode(data));
                } else if (data instanceof Blob) {
                    data.arrayBuffer().then(buf => {
                        controller.enqueue(new Uint8Array(buf));
                    });
                } else if (data instanceof ArrayBuffer) {
                    controller.enqueue(new Uint8Array(data));
                } else {
                    controller.enqueue(data);
                }
            });

            ws.addEventListener('close', () => {
                controller.close();
            });

            ws.addEventListener('error', err => {
                controller.error(err);
            });

            // 处理early data
            if (earlyData && earlyData.length > 0 && !earlyDataSent) {
                try {
                    // 解码base64
                    let base64Str = earlyData.replace(/\s/g, '');
                    while (base64Str.length % 4) {
                        base64Str += '=';
                    }
                    base64Str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
                    
                    const decodedStr = atob(base64Str);
                    const bytes = new Uint8Array(decodedStr.length);
                    for (let i = 0; i < decodedStr.length; i++) {
                        bytes[i] = decodedStr.charCodeAt(i);
                    }
                    
                    console.log('Early data decoded length:', bytes.length);
                    controller.enqueue(bytes);
                    earlyDataSent = true;
                } catch (e) {
                    console.log('Early data decode error:', e.message);
                }
            }
        }
    });
}

function parseVLESSHeader(buffer) {
    if (buffer.byteLength < 18) {
        return { hasError: true, message: 'Header too short' };
    }

    try {
        // 检查协议版本
        if (buffer[0] !== 0) {
            return { hasError: true, message: 'Invalid protocol version' };
        }

        // 提取UUID
        const keyBytes = new Uint8Array(buffer.slice(1, 17));
        const key = formatKey(keyBytes);

        // 验证UUID
        if (FIXED_KEY && key !== FIXED_KEY) {
            return { hasError: true, message: 'Invalid key' };
        }

        const optionsLen = buffer[17];
        
        if (buffer.byteLength < 18 + optionsLen + 3) {
            return { hasError: true, message: 'Incomplete header' };
        }

        const cmd = buffer[18 + optionsLen];
        let isUdp = false;

        if (cmd === 2) {
            isUdp = true;
        } else if (cmd !== 1) {
            return { hasError: true, message: 'Unsupported command' };
        }

        let offset = 19 + optionsLen;
        
        // 端口
        const port = (buffer[offset] << 8) | buffer[offset + 1];
        offset += 2;

        // 地址类型
        const addrType = buffer[offset++];
        let address = '';
        let addrLen = 0;

        switch (addrType) {
            case 1: // IPv4
                if (buffer.byteLength < offset + 4) {
                    return { hasError: true, message: 'Incomplete IPv4' };
                }
                address = Array.from(buffer.slice(offset, offset + 4)).join('.');
                addrLen = 4;
                break;
                
            case 2: // Domain
                if (buffer.byteLength < offset + 1) {
                    return { hasError: true, message: 'Incomplete domain len' };
                }
                const domainLen = buffer[offset++];
                if (buffer.byteLength < offset + domainLen) {
                    return { hasError: true, message: 'Incomplete domain' };
                }
                const domainBytes = buffer.slice(offset, offset + domainLen);
                address = new TextDecoder().decode(domainBytes);
                addrLen = domainLen;
                break;
                
            case 3: // IPv6
                if (buffer.byteLength < offset + 16) {
                    return { hasError: true, message: 'Incomplete IPv6' };
                }
                const ipv6 = [];
                for (let i = 0; i < 16; i += 2) {
                    const word = (buffer[offset + i] << 8) | buffer[offset + i + 1];
                    ipv6.push(word.toString(16));
                }
                address = ipv6.join(':');
                addrLen = 16;
                break;
                
            default:
                return { hasError: true, message: 'Unsupported address type' };
        }
        
        offset += addrLen;

        return {
            hasError: false,
            targetAddress: address,
            targetPort: port,
            dataOffset: offset,
            version: new Uint8Array([buffer[0]]),
            isUdp: isUdp,
            addrType: addrType
        };
        
    } catch (err) {
        return { hasError: true, message: 'Parse error: ' + err.message };
    }
}

function closeConnection(socket) {
    if (socket) {
        try {
            socket.close();
        } catch (e) {}
    }
}

function formatKey(bytes) {
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function handleUDP(webSocket, responseHeader) {
    let headerSent = false;

    const transform = new TransformStream({
        transform(chunk, controller) {
            for (let idx = 0; idx < chunk.byteLength;) {
                if (idx + 2 > chunk.byteLength) break;
                const pktLen = (chunk[idx] << 8) | chunk[idx + 1];
                if (idx + 2 + pktLen > chunk.byteLength) break;
                
                const udpData = chunk.slice(idx + 2, idx + 2 + pktLen);
                controller.enqueue(udpData);
                idx = idx + 2 + pktLen;
            }
        }
    });

    transform.readable.pipeTo(new WritableStream({
        async write(chunk) {
            try {
                const response = await fetch('https://1.1.1.1/dns-query', {
                    method: 'POST',
                    headers: { 'content-type': 'application/dns-message' },
                    body: chunk,
                });

                const result = await response.arrayBuffer();
                const size = result.byteLength;
                const sizeBuf = new Uint8Array([(size >> 8) & 0xff, size & 0xff]);

                if (webSocket.readyState === WS_STATE_OPEN) {
                    if (headerSent) {
                        webSocket.send(await new Blob([sizeBuf, result]).arrayBuffer());
                    } else {
                        webSocket.send(await new Blob([responseHeader, sizeBuf, result]).arrayBuffer());
                        headerSent = true;
                    }
                }
            } catch (err) {}
        }
    })).catch(() => {});

    const writer = transform.writable.getWriter();

    return {
        write(chunk) {
            writer.write(chunk).catch(() => {});
        }
    };
}

const WS_STATE_OPEN = 1;
import { connect } from 'cloudflare:sockets';

async function parseAddress(serverAddr) {
    serverAddr = serverAddr.toLowerCase();
    let host = serverAddr;
    let port = 443;

    if (serverAddr.includes(']:')) {
        const parts = serverAddr.split(']:');
        host = parts[0] + ']';
        port = parseInt(parts[1], 10) || port;
    } else if (serverAddr.includes(':') && !serverAddr.startsWith('[')) {
        const colonIdx = serverAddr.lastIndexOf(':');
        host = serverAddr.slice(0, colonIdx);
        port = parseInt(serverAddr.slice(colonIdx + 1), 10) || port;
    }

    return [host, port];
}

async function updateMainServer(request) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const pathLower = pathname.toLowerCase();

    const match = pathLower.match(/\/(proxyip[.=]|pyip=|ip=)(.+)/);

    if (searchParams.has('proxyip')) {
        const param = searchParams.get('proxyip');
        mainServer = param.includes(',') 
            ? param.split(',')[Math.floor(Math.random() * param.split(',').length)] 
            : param;
        return;
    } else if (match) {
        const param = match[1] === 'proxyip.' 
            ? `proxyip.${match[2]}` 
            : match[2];
        mainServer = param.includes(',') 
            ? param.split(',')[Math.floor(Math.random() * param.split(',').length)] 
            : param;
        return;
    }
}
