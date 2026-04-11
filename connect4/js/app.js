import i18n from './i18n.js';
import { ROWS, COLS, EMPTY, P1, P2, createBoard, dropDisc, isColumnFull, checkWin, isBoardFull } from './board.js';
import { createHost, joinGame, send, destroy } from './peer.js';

const t = (key) => i18n.t(key);

class ConnectFourApp {
    constructor() {
        this.root = document.getElementById('app');
        this.peer = null;
        this.conn = null;
        this.isHost = false;
        this.board = createBoard();
        this.myPlayer = P1;
        this.myTurn = false;
        this.moves = 0;
        this.winCells = null;
        this.state = 'home';
    }

    async init() {
        await i18n.load(i18n.locale);

        const joinCode = new URLSearchParams(location.search).get('join');
        if (joinCode) {
            history.replaceState(null, '', location.pathname);
            this.joinByCode(joinCode.toUpperCase());
        } else {
            this.showHome();
        }
    }

    // --- Screens ---

    showHome() {
        this.state = 'home';
        this.cleanup();
        const rules = t('home.rulesText');
        const rulesList = Array.isArray(rules) ? rules.map(r => `<li>${r}</li>`).join('') : '';

        this.root.innerHTML = `
            <div class="screen screen-home">
                <h1>${t('home.title')}</h1>
                <p class="subtitle">${t('home.subtitle')}</p>
                <div class="home-actions">
                    <button class="btn btn-primary btn-large" id="btn-create">${t('home.create')}</button>
                    <div class="join-form">
                        <input type="text" id="join-code" class="input-code" placeholder="${t('home.joinPlaceholder')}" maxlength="5" autocapitalize="characters" />
                        <button class="btn btn-secondary" id="btn-join">${t('home.connect')}</button>
                    </div>
                </div>
                <div class="home-footer">
                    <button class="btn btn-ghost" id="btn-rules">${t('home.rules')}</button>
                    <button class="btn btn-ghost btn-lang" id="btn-lang">${i18n.locale === 'en' ? 'ES' : 'EN'}</button>
                </div>
            </div>
            <div class="modal-overlay hidden" id="rules-modal">
                <div class="modal">
                    <h2>${t('home.rulesTitle')}</h2>
                    <ol class="rules-list">${rulesList}</ol>
                    <button class="btn btn-primary" id="btn-close-rules">${t('home.close')}</button>
                </div>
            </div>
        `;

        document.getElementById('btn-create').addEventListener('click', () => this.createGame());
        document.getElementById('btn-join').addEventListener('click', () => {
            const code = document.getElementById('join-code').value.trim().toUpperCase();
            if (code.length === 5) this.joinByCode(code);
        });
        document.getElementById('join-code').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('btn-join').click();
        });
        document.getElementById('btn-rules').addEventListener('click', () => {
            document.getElementById('rules-modal').classList.remove('hidden');
        });
        document.getElementById('btn-close-rules').addEventListener('click', () => {
            document.getElementById('rules-modal').classList.add('hidden');
        });
        document.getElementById('rules-modal').addEventListener('click', (e) => {
            if (e.target.id === 'rules-modal') e.target.classList.add('hidden');
        });
        document.getElementById('btn-lang').addEventListener('click', async () => {
            await i18n.load(i18n.locale === 'en' ? 'es' : 'en');
            this.showHome();
        });
    }

    showWaiting(code) {
        this.state = 'waiting';
        const joinUrl = `${location.origin}${location.pathname}?join=${code}`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(t('waiting.whatsAppMessage') + ' ' + joinUrl)}`;
        this.root.innerHTML = `
            <div class="screen screen-waiting">
                <h2>${t('waiting.title')}</h2>
                <div class="code-display">
                    <span class="game-code">${code}</span>
                    <button class="btn btn-small" id="btn-copy">${t('waiting.copy')}</button>
                </div>
                <div id="qr-code" class="qr-container"></div>
                <div class="share-buttons">
                    <a href="${waUrl}" target="_blank" class="btn btn-secondary">${t('waiting.shareWhatsApp')}</a>
                </div>
                <div class="spinner"></div>
                <button class="btn btn-ghost" id="btn-cancel">${t('waiting.cancel')}</button>
            </div>
        `;
        this.renderQR(code);
        document.getElementById('btn-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.getElementById('btn-copy');
                btn.textContent = t('waiting.copied');
                setTimeout(() => { if (btn) btn.textContent = t('waiting.copy'); }, 2000);
            });
        });
        document.getElementById('btn-cancel').addEventListener('click', () => {
            this.cleanup();
            this.showHome();
        });
    }

    renderQR(code) {
        const container = document.getElementById('qr-code');
        if (!container || typeof qrcode === 'undefined') return;
        const joinUrl = `${location.origin}${location.pathname}?join=${code}`;
        const qr = qrcode(0, 'M');
        qr.addData(joinUrl);
        qr.make();
        container.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0 });
    }

    showPlaying() {
        this.state = 'playing';
        this.board = createBoard();
        this.moves = 0;
        this.winCells = null;
        this.myTurn = this.isHost; // host (P1) goes first

        this.root.innerHTML = `
            <div class="screen screen-playing">
                <div class="players-bar">
                    <div class="player-indicator p1 ${this.myPlayer === P1 ? 'me' : ''}" id="ind-p1">
                        <span class="disc disc-p1"></span>
                        <span>${this.myPlayer === P1 ? t('playing.you') : t('playing.opponent')}</span>
                    </div>
                    <div class="turn-text" id="turn-text"></div>
                    <div class="player-indicator p2 ${this.myPlayer === P2 ? 'me' : ''}" id="ind-p2">
                        <span>${this.myPlayer === P2 ? t('playing.you') : t('playing.opponent')}</span>
                        <span class="disc disc-p2"></span>
                    </div>
                </div>
                <div class="board-wrapper">
                    <div class="col-buttons" id="col-buttons"></div>
                    <div class="board" id="board"></div>
                </div>
            </div>
        `;

        this.renderBoard();
        this.updateTurn();
    }

    renderBoard() {
        const boardEl = document.getElementById('board');
        const colBtns = document.getElementById('col-buttons');
        if (!boardEl) return;

        // Column drop buttons
        let btnsHtml = '';
        for (let c = 0; c < COLS; c++) {
            const disabled = !this.myTurn || isColumnFull(this.board, c) || this.state === 'gameover';
            btnsHtml += `<button class="col-btn ${disabled ? 'disabled' : ''}" data-col="${c}">
                <span class="preview-disc disc-${this.myPlayer === P1 ? 'p1' : 'p2'}"></span>
                <span class="drop-arrow">▼</span>
            </button>`;
        }
        colBtns.innerHTML = btnsHtml;

        // Board grid
        let html = '';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const val = this.board[r][c];
                let cls = 'cell';
                if (val === P1) cls += ' cell-p1';
                else if (val === P2) cls += ' cell-p2';

                if (this.winCells && this.winCells.some(w => w.r === r && w.c === c)) {
                    cls += ' cell-win';
                }

                html += `<div class="${cls}" data-row="${r}" data-col="${c}"><div class="disc-slot"></div></div>`;
            }
        }
        boardEl.innerHTML = html;

        // Click handlers
        if (this.myTurn && this.state === 'playing') {
            colBtns.querySelectorAll('.col-btn:not(.disabled)').forEach(btn => {
                btn.addEventListener('click', () => {
                    const col = parseInt(btn.dataset.col);
                    this.makeMove(col);
                });
            });
        }
    }

    updateTurn() {
        const el = document.getElementById('turn-text');
        if (!el) return;
        el.textContent = this.myTurn ? t('playing.yourTurn') : t('playing.opponentTurn');
        el.className = `turn-text ${this.myTurn ? 'my-turn' : 'their-turn'}`;

        // Highlight active player
        const currentPlayer = this.myTurn ? this.myPlayer : (this.myPlayer === P1 ? P2 : P1);
        document.getElementById('ind-p1')?.classList.toggle('active', currentPlayer === P1);
        document.getElementById('ind-p2')?.classList.toggle('active', currentPlayer === P2);
    }

    makeMove(col) {
        if (!this.myTurn || this.state !== 'playing') return;
        if (isColumnFull(this.board, col)) return;

        const row = dropDisc(this.board, col, this.myPlayer);
        if (row < 0) return;

        this.moves++;
        this.myTurn = false;

        send(this.conn, { type: 'move', col });

        this.renderBoard();
        this.animateDrop(row, col, this.myPlayer);
        this.updateTurn();

        const win = checkWin(this.board, row, col, this.myPlayer);
        if (win) {
            this.winCells = win;
            setTimeout(() => this.showGameOver('win', win), 600);
            return;
        }
        if (isBoardFull(this.board)) {
            setTimeout(() => this.showGameOver('draw'), 600);
            return;
        }
    }

    handleOpponentMove(col) {
        const opponent = this.myPlayer === P1 ? P2 : P1;
        const row = dropDisc(this.board, col, opponent);
        if (row < 0) return;

        this.moves++;
        this.renderBoard();
        this.animateDrop(row, col, opponent);

        const win = checkWin(this.board, row, col, opponent);
        if (win) {
            this.winCells = win;
            setTimeout(() => this.showGameOver('lose', win), 600);
            return;
        }
        if (isBoardFull(this.board)) {
            setTimeout(() => this.showGameOver('draw'), 600);
            return;
        }

        this.myTurn = true;
        this.renderBoard();
        this.updateTurn();
    }

    animateDrop(row, col, player) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('anim-drop');
            if (navigator.vibrate) navigator.vibrate(30);
        }
    }

    showGameOver(result, winCells) {
        this.state = 'gameover';

        if (winCells) {
            this.winCells = winCells;
            this.renderBoard(); // re-render to highlight winning cells
        }

        let title;
        if (result === 'win') title = t('gameover.victory');
        else if (result === 'lose') title = t('gameover.defeat');
        else title = t('gameover.draw');

        if (result === 'win' && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

        // Overlay on top of the board
        const overlay = document.createElement('div');
        overlay.className = 'gameover-overlay';
        overlay.innerHTML = `
            <h1 class="${result}">${title}</h1>
            <div class="stat"><span class="stat-label">${t('gameover.moves')}</span><span class="stat-value">${this.moves}</span></div>
            <div class="gameover-actions">
                <button class="btn btn-primary" id="btn-rematch">${t('gameover.rematch')}</button>
                <button class="btn btn-secondary" id="btn-newgame">${t('gameover.newGame')}</button>
            </div>
        `;
        this.root.querySelector('.screen-playing').appendChild(overlay);

        document.getElementById('btn-rematch').addEventListener('click', () => {
            send(this.conn, { type: 'rematch' });
            this.showPlaying();
        });
        document.getElementById('btn-newgame').addEventListener('click', () => {
            this.cleanup();
            this.showHome();
        });
    }

    // --- Networking ---

    async createGame() {
        this.isHost = true;
        this.myPlayer = P1;
        try {
            const { peer, code } = await createHost(
                (conn) => { this.conn = conn; this.showPlaying(); },
                (data) => this.onMessage(data),
                () => this.onDisconnect(),
                (err) => this.onError(err),
            );
            this.peer = peer;
            this.showWaiting(code);
        } catch (err) { this.onError(err); }
    }

    async joinByCode(code) {
        this.isHost = false;
        this.myPlayer = P2;
        try {
            const { peer, conn } = await joinGame(
                code,
                (data) => this.onMessage(data),
                () => this.onDisconnect(),
                (err) => this.onError(err),
            );
            this.peer = peer;
            this.conn = conn;
            this.showPlaying();
        } catch (err) { this.onError(err); }
    }

    onMessage(data) {
        switch (data.type) {
            case 'move':
                this.handleOpponentMove(data.col);
                break;
            case 'rematch':
                this.showPlaying();
                break;
        }
    }

    onDisconnect() {
        if (this.state !== 'home' && this.state !== 'gameover') {
            this.showToast(t('errors.disconnected'));
        }
    }

    onError(err) {
        console.error('Peer error:', err);
        this.showToast(t('errors.connectionFailed'));
    }

    showToast(message) {
        document.querySelector('.toast')?.remove();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    cleanup() {
        destroy(this.peer);
        this.peer = null;
        this.conn = null;
        this.board = createBoard();
        this.moves = 0;
        this.winCells = null;
        this.myTurn = false;
    }
}

new ConnectFourApp().init();
