const PEER_PREFIX = 'c4-';

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

function createHost(onConnection, onData, onDisconnect, onError) {
    const code = generateCode();
    const peerId = PEER_PREFIX + code;
    const peer = new Peer(peerId, { debug: 0 });

    return new Promise((resolve, reject) => {
        peer.on('open', () => {
            peer.on('connection', (conn) => {
                conn.on('open', () => onConnection(conn));
                conn.on('data', (data) => onData(data));
                conn.on('close', () => onDisconnect());
                conn.on('error', (err) => onError(err));
            });
            resolve({ peer, code });
        });
        peer.on('error', (err) => { onError(err); reject(err); });
    });
}

function joinGame(code, onData, onDisconnect, onError) {
    const peerId = PEER_PREFIX + code.toUpperCase();
    const peer = new Peer(undefined, { debug: 0 });

    return new Promise((resolve, reject) => {
        peer.on('open', () => {
            const conn = peer.connect(peerId, { reliable: true });
            conn.on('open', () => resolve({ peer, conn }));
            conn.on('data', (data) => onData(data));
            conn.on('close', () => onDisconnect());
            conn.on('error', (err) => { onError(err); reject(err); });
        });
        peer.on('error', (err) => { onError(err); reject(err); });
    });
}

function send(conn, message) {
    if (conn && conn.open) conn.send(message);
}

function destroy(peer) {
    if (peer) peer.destroy();
}

export { createHost, joinGame, send, destroy };
