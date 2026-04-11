import i18n from './i18n.js';
import { FLEET, createGrid, canPlace, placeShip, removeShip, randomPlacement, evaluateShot, allShipsSunk } from './board.js';
import { createHost, joinGame, send, destroy } from './peer.js';
import { renderGrid, renderFleetPanel, renderHomeScreen, renderWaitingScreen, renderPlacingScreen, renderPlayingScreen, renderGameOverScreen, renderRulesModal } from './render.js';

class BattleshipApp {
    constructor() {
        this.root = document.getElementById('app');
        this.state = 'home';
        this.isHost = false;
        this.peer = null;
        this.conn = null;

        // Game state
        this.myGrid = createGrid();
        this.myPlacements = [];
        this.enemyGrid = createGrid(); // tracking shots on enemy
        this.enemySunkShips = [];
        this.selectedShip = null;
        this.horizontal = true;
        this.selectedTarget = null;
        this.myTurn = false;
        this.ready = false;
        this.opponentReady = false;

        // Stats
        this.stats = { turns: 0, hits: 0, misses: 0 };
    }

    async init() {
        await i18n.load(i18n.locale);

        const joinCode = new URLSearchParams(location.search).get('join');
        if (joinCode) {
            history.replaceState(null, '', location.pathname);
            this.joinGameByCode(joinCode.toUpperCase());
        } else {
            this.showHome();
        }
    }

    // --- Screens ---

    showHome() {
        this.state = 'home';
        this.cleanup();
        this.root.innerHTML = renderHomeScreen();

        document.getElementById('btn-create').addEventListener('click', () => this.createGame());
        document.getElementById('btn-join').addEventListener('click', () => {
            const code = document.getElementById('join-code').value.trim().toUpperCase();
            if (code.length === 5) this.joinGameByCode(code);
        });
        document.getElementById('join-code').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const code = e.target.value.trim().toUpperCase();
                if (code.length === 5) this.joinGameByCode(code);
            }
        });
        document.getElementById('btn-rules').addEventListener('click', () => this.showRules());
        document.getElementById('btn-lang').addEventListener('click', () => this.toggleLang());
    }

    showRules() {
        this.root.insertAdjacentHTML('beforeend', renderRulesModal());
        document.getElementById('btn-close-rules').addEventListener('click', () => {
            document.getElementById('rules-modal').remove();
        });
        document.getElementById('rules-modal').addEventListener('click', (e) => {
            if (e.target.id === 'rules-modal') e.target.remove();
        });
    }

    async toggleLang() {
        const newLocale = i18n.locale === 'en' ? 'es' : 'en';
        await i18n.load(newLocale);
        this.showHome();
    }

    showWaiting(code) {
        this.state = 'waiting';
        this.root.innerHTML = renderWaitingScreen(code);
        this.renderQR(code);

        document.getElementById('btn-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
                document.getElementById('btn-copy').textContent = i18n.t('waiting.copied');
                setTimeout(() => {
                    const btn = document.getElementById('btn-copy');
                    if (btn) btn.textContent = i18n.t('waiting.copy');
                }, 2000);
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

    showPlacing() {
        this.state = 'placing';
        this.myGrid = createGrid();
        this.myPlacements = [];
        this.selectedShip = null;
        this.horizontal = true;
        this.ready = false;

        this.root.innerHTML = renderPlacingScreen();
        this.renderPlacingBoard();
        this.renderFleet();

        document.getElementById('btn-rotate').addEventListener('click', () => {
            this.horizontal = !this.horizontal;
            this.renderPlacingBoard();
        });
        document.getElementById('btn-random').addEventListener('click', () => {
            const { grid, placements } = randomPlacement();
            this.myGrid = grid;
            this.myPlacements = placements;
            this.selectedShip = null;
            this.renderPlacingBoard();
            this.renderFleet();
            this.updateReadyButton();
        });
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.myGrid = createGrid();
            this.myPlacements = [];
            this.selectedShip = null;
            this.renderPlacingBoard();
            this.renderFleet();
            this.updateReadyButton();
        });
        document.getElementById('btn-ready').addEventListener('click', () => this.setReady());
    }

    renderPlacingBoard() {
        const container = document.getElementById('placing-grid');
        if (!container) return;
        container.innerHTML = '';
        container.appendChild(renderGrid(this.myGrid, {
            showShips: true,
            onClick: (r, c) => this.onPlacingCellClick(r, c),
        }));
    }

    renderFleet() {
        const container = document.getElementById('fleet-panel');
        if (!container) return;
        const placedIds = this.myPlacements.map(p => p.id);
        container.innerHTML = '';
        container.appendChild(renderFleetPanel(FLEET, placedIds, this.selectedShip, (id) => {
            if (placedIds.includes(id)) {
                // Remove placed ship
                removeShip(this.myGrid, id);
                this.myPlacements = this.myPlacements.filter(p => p.id !== id);
                this.selectedShip = id;
            } else {
                this.selectedShip = id;
            }
            this.renderPlacingBoard();
            this.renderFleet();
            this.updateReadyButton();
        }));
    }

    onPlacingCellClick(row, col) {
        if (!this.selectedShip || this.ready) return;

        const ship = FLEET.find(s => s.id === this.selectedShip);
        if (!ship) return;

        if (canPlace(this.myGrid, ship, row, col, this.horizontal)) {
            const cells = placeShip(this.myGrid, ship, row, col, this.horizontal);
            this.myPlacements.push({ ...ship, row, col, horizontal: this.horizontal, cells });

            // Auto-select next unplaced ship
            const placedIds = this.myPlacements.map(p => p.id);
            const next = FLEET.find(s => !placedIds.includes(s.id));
            this.selectedShip = next ? next.id : null;

            this.renderPlacingBoard();
            this.renderFleet();
            this.updateReadyButton();

            if (!next) {
                const status = document.getElementById('placing-status');
                if (status) status.textContent = i18n.t('placing.allPlaced');
            }
        }
    }

    updateReadyButton() {
        const btn = document.getElementById('btn-ready');
        if (btn) btn.disabled = this.myPlacements.length < FLEET.length;
    }

    setReady() {
        this.ready = true;
        document.getElementById('btn-ready').disabled = true;
        document.getElementById('btn-ready').textContent = i18n.t('placing.waitingOpponent');

        // Send board to opponent (only ship positions, no IDs — opponent shouldn't see layout)
        send(this.conn, { type: 'ready' });

        if (this.opponentReady) this.startPlaying();
    }

    showPlaying() {
        this.state = 'playing';
        this.enemyGrid = createGrid();
        this.enemySunkShips = [];
        this.selectedTarget = null;
        this.stats = { turns: 0, hits: 0, misses: 0 };

        this.root.innerHTML = renderPlayingScreen();
        this.renderBoards();
        this.updateTurnIndicator();

        document.getElementById('btn-fire').addEventListener('click', () => this.fireShot());
    }

    renderBoards() {
        const enemyContainer = document.getElementById('enemy-grid');
        const myContainer = document.getElementById('my-grid');
        if (!enemyContainer || !myContainer) return;

        enemyContainer.innerHTML = '';
        enemyContainer.appendChild(renderGrid(this.enemyGrid, {
            onClick: this.myTurn ? (r, c) => this.selectTarget(r, c) : null,
            selectedCell: this.selectedTarget,
            sunkShips: this.enemySunkShips,
        }));

        myContainer.innerHTML = '';
        myContainer.appendChild(renderGrid(this.myGrid, { showShips: true }));
    }

    updateTurnIndicator() {
        const el = document.getElementById('turn-indicator');
        const fireBtn = document.getElementById('btn-fire');
        if (!el) return;

        if (this.myTurn) {
            el.textContent = i18n.t('playing.yourTurn');
            el.className = 'turn-indicator my-turn';
            if (fireBtn) fireBtn.style.display = '';
        } else {
            el.textContent = i18n.t('playing.opponentTurn');
            el.className = 'turn-indicator opponent-turn';
            if (fireBtn) fireBtn.style.display = 'none';
        }
    }

    selectTarget(row, col) {
        if (!this.myTurn) return;
        const val = this.enemyGrid[row][col];
        if (val !== 0) return; // already shot

        this.selectedTarget = { r: row, c: col };
        document.getElementById('btn-fire').disabled = false;
        this.renderBoards();
    }

    fireShot() {
        if (!this.myTurn || !this.selectedTarget) return;
        const { r, c } = this.selectedTarget;

        send(this.conn, { type: 'shot', x: r, y: c });
        this.myTurn = false;
        this.selectedTarget = null;
        document.getElementById('btn-fire').disabled = true;
        this.updateTurnIndicator();
    }

    showGameOver(won) {
        this.state = 'gameover';
        const total = this.stats.hits + this.stats.misses;
        const accuracy = total > 0 ? Math.round((this.stats.hits / total) * 100) : 0;

        this.root.innerHTML = renderGameOverScreen(won, {
            turns: this.stats.turns,
            hits: this.stats.hits,
            misses: this.stats.misses,
            accuracy,
        });

        if (won && navigator.vibrate) navigator.vibrate([200, 100, 200]);

        document.getElementById('btn-rematch').addEventListener('click', () => {
            send(this.conn, { type: 'rematch' });
            this.resetGameState();
            this.showPlacing();
        });
        document.getElementById('btn-newgame').addEventListener('click', () => {
            this.cleanup();
            this.showHome();
        });
    }

    // --- Networking ---

    async createGame() {
        this.isHost = true;
        try {
            const { peer, code } = await createHost(
                (conn) => this.onPeerConnected(conn),
                (data) => this.onMessage(data),
                () => this.onDisconnect(),
                (err) => this.onError(err),
            );
            this.peer = peer;
            this.showWaiting(code);
        } catch (err) {
            this.onError(err);
        }
    }

    async joinGameByCode(code) {
        this.isHost = false;
        try {
            const { peer, conn } = await joinGame(
                code,
                (data) => this.onMessage(data),
                () => this.onDisconnect(),
                (err) => this.onError(err),
            );
            this.peer = peer;
            this.conn = conn;
            this.showPlacing();
        } catch (err) {
            this.onError(err);
        }
    }

    onPeerConnected(conn) {
        this.conn = conn;
        this.showPlacing();
    }

    onMessage(data) {
        switch (data.type) {
            case 'ready':
                this.opponentReady = true;
                if (this.ready) this.startPlaying();
                else {
                    const status = document.getElementById('placing-status');
                    if (status) status.textContent = i18n.t('placing.opponentReady');
                }
                break;

            case 'shot':
                this.handleIncomingShot(data.x, data.y);
                break;

            case 'result':
                this.handleShotResult(data);
                break;

            case 'gameover':
                this.showGameOver(false);
                break;

            case 'rematch':
                this.resetGameState();
                this.showPlacing();
                break;
        }
    }

    startPlaying() {
        // Host goes first
        this.myTurn = this.isHost;
        this.showPlaying();
    }

    handleIncomingShot(row, col) {
        const result = evaluateShot(this.myGrid, this.myPlacements, row, col);

        send(this.conn, {
            type: 'result',
            x: row,
            y: col,
            result: result.result,
            ship: result.ship || null,
        });

        this.renderBoards();
        this.playIncomingShotAnimation(row, col, result.result);

        if (result.result === 'hit' || result.result === 'sunk') {
            if (navigator.vibrate) navigator.vibrate([100, 50, 150]);
        }

        if (allShipsSunk(this.myGrid, this.myPlacements)) {
            send(this.conn, { type: 'gameover' });
            setTimeout(() => this.showGameOver(false), 1200);
        } else {
            this.myTurn = true;
            this.updateTurnIndicator();
            this.renderBoards();
        }
    }

    handleShotResult(data) {
        const { x, y, result, ship } = data;

        if (result === 'miss') {
            this.enemyGrid[x][y] = 'M';
            this.stats.misses++;
        } else if (result === 'hit') {
            this.enemyGrid[x][y] = 'H';
            this.stats.hits++;
        } else if (result === 'sunk') {
            this.enemyGrid[x][y] = 'K';
            this.stats.hits++;
            if (ship) {
                ship.cells.forEach(c => { this.enemyGrid[c.r][c.c] = 'K'; });
                this.enemySunkShips.push(ship);
            }
        }

        this.stats.turns++;
        this.renderBoards();
        this.playShotAnimation(x, y, result);
        this.showShotFeedback(result);

        // Check if I won
        if (result === 'sunk' && this.enemySunkShips.length >= FLEET.length) {
            setTimeout(() => this.showGameOver(true), 1200);
        } else {
            this.myTurn = false;
            this.updateTurnIndicator();
        }
    }

    playShotAnimation(row, col, result) {
        const enemyGrid = document.getElementById('enemy-grid');
        if (!enemyGrid) return;

        const cell = enemyGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        // Add animation class
        if (result === 'miss') {
            cell.classList.add('anim-splash');
            const ring2 = document.createElement('div');
            ring2.className = 'splash-ring2';
            cell.appendChild(ring2);
        } else if (result === 'sunk') {
            cell.classList.add('anim-sunk');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        } else {
            cell.classList.add('anim-explode');
            if (navigator.vibrate) navigator.vibrate([80, 40, 120]);
        }

        // Floating comment
        const rect = cell.getBoundingClientRect();
        const comment = document.createElement('div');
        const key = result === 'miss' ? 'playing.miss' : result === 'hit' ? 'playing.hit' : 'playing.sunk';
        comment.className = `shot-comment shot-comment-${result}`;
        comment.textContent = i18n.t(key);
        comment.style.left = `${rect.left + rect.width / 2}px`;
        comment.style.top = `${rect.top}px`;
        comment.style.transform = 'translateX(-50%)';
        document.body.appendChild(comment);

        setTimeout(() => comment.remove(), 1500);
    }

    playIncomingShotAnimation(row, col, result) {
        const myGrid = document.getElementById('my-grid');
        if (!myGrid) return;

        const cell = myGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        if (result === 'miss') {
            cell.classList.add('anim-splash');
        } else if (result === 'sunk') {
            cell.classList.add('anim-sunk');
        } else {
            cell.classList.add('anim-explode');
        }
    }

    showShotFeedback(result) {
        const indicator = document.getElementById('turn-indicator');
        if (!indicator) return;

        const key = result === 'miss' ? 'playing.miss' : result === 'hit' ? 'playing.hit' : 'playing.sunk';
        indicator.textContent = i18n.t(key);
        indicator.className = `turn-indicator shot-${result}`;

        setTimeout(() => this.updateTurnIndicator(), 1500);
    }

    onDisconnect() {
        if (this.state !== 'home' && this.state !== 'gameover') {
            this.showToast(i18n.t('errors.disconnected'));
        }
    }

    onError(err) {
        console.error('Peer error:', err);
        this.showToast(i18n.t('errors.connectionFailed'));
    }

    showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // --- Helpers ---

    resetGameState() {
        this.myGrid = createGrid();
        this.myPlacements = [];
        this.enemyGrid = createGrid();
        this.enemySunkShips = [];
        this.selectedShip = null;
        this.horizontal = true;
        this.selectedTarget = null;
        this.ready = false;
        this.opponentReady = false;
        this.stats = { turns: 0, hits: 0, misses: 0 };
    }

    cleanup() {
        destroy(this.peer);
        this.peer = null;
        this.conn = null;
        this.resetGameState();
    }
}

// Boot
const app = new BattleshipApp();
app.init();
