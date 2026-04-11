import { GRID_SIZE, EMPTY, HIT, MISS, SUNK, FLEET } from './board.js';
import i18n from './i18n.js';

function t(key) { return i18n.t(key); }

function renderGrid(grid, options = {}) {
    const { onClick, showShips = false, selectedCell = null, sunkShips = [] } = options;
    const table = document.createElement('div');
    table.className = 'grid';

    // Column headers (A-J)
    const headerRow = document.createElement('div');
    headerRow.className = 'grid-row grid-header';
    headerRow.innerHTML = '<div class="grid-cell grid-label"></div>';
    for (let c = 0; c < GRID_SIZE; c++) {
        headerRow.innerHTML += `<div class="grid-cell grid-label">${String.fromCharCode(65 + c)}</div>`;
    }
    table.appendChild(headerRow);

    for (let r = 0; r < GRID_SIZE; r++) {
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.innerHTML = `<div class="grid-cell grid-label">${r + 1}</div>`;

        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            const val = grid[r][c];

            if (val === HIT) cell.classList.add('cell-hit');
            else if (val === MISS) cell.classList.add('cell-miss');
            else if (val === SUNK) cell.classList.add('cell-sunk');
            else if (showShips && val !== EMPTY) cell.classList.add('cell-ship');

            // Mark sunk ships from opponent reveals
            if (sunkShips.some(s => s.cells.some(sc => sc.r === r && sc.c === c))) {
                cell.classList.add('cell-sunk');
            }

            if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
                cell.classList.add('cell-selected');
            }

            if (onClick) {
                cell.addEventListener('click', () => onClick(r, c));
            }

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    return table;
}

function renderFleetPanel(fleet, placedShips, selectedShip, onSelect) {
    const panel = document.createElement('div');
    panel.className = 'fleet-panel';

    fleet.forEach(ship => {
        const btn = document.createElement('button');
        const baseName = ship.id.replace(/[0-9]/g, '');
        btn.className = 'fleet-ship';
        if (placedShips.includes(ship.id)) btn.classList.add('placed');
        if (selectedShip === ship.id) btn.classList.add('selected');

        const dots = '■'.repeat(ship.size);
        btn.innerHTML = `<span class="ship-name">${t('ships.' + baseName)}</span><span class="ship-dots">${dots}</span>`;
        btn.addEventListener('click', () => onSelect(ship.id));
        panel.appendChild(btn);
    });

    return panel;
}

function renderHomeScreen(onCreateGame, onJoinGame, onToggleLang) {
    return `
        <div class="screen screen-home">
            <div class="home-header">
                <h1>${t('home.title')}</h1>
                <p class="subtitle">${t('home.subtitle')}</p>
            </div>
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
    `;
}

function renderWaitingScreen(code) {
    const joinUrl = `${location.origin}${location.pathname}?join=${code}`;
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(t('waiting.whatsAppMessage') + ' ' + joinUrl)}`;
    return `
        <div class="screen screen-waiting">
            <h2>${t('waiting.title')}</h2>
            <div class="code-display">
                <span class="game-code">${code}</span>
                <button class="btn btn-small" id="btn-copy">${t('waiting.copy')}</button>
            </div>
            <div id="qr-code" class="qr-container"></div>
            <div class="share-buttons">
                <a href="${whatsAppUrl}" target="_blank" class="btn btn-secondary">${t('waiting.shareWhatsApp')}</a>
            </div>
            <div class="spinner"></div>
            <button class="btn btn-ghost" id="btn-cancel">${t('waiting.cancel')}</button>
        </div>
    `;
}

function renderPlacingScreen() {
    return `
        <div class="screen screen-placing">
            <div class="placing-header">
                <h2>${t('placing.title')}</h2>
                <p class="status-text" id="placing-status">${t('placing.tapToPlace')}</p>
            </div>
            <div id="placing-grid"></div>
            <div id="fleet-panel"></div>
            <div class="placing-actions">
                <button class="btn btn-small" id="btn-rotate">${t('placing.rotate')}</button>
                <button class="btn btn-small" id="btn-random">${t('placing.random')}</button>
                <button class="btn btn-small" id="btn-reset">${t('placing.reset')}</button>
            </div>
            <button class="btn btn-primary" id="btn-ready" disabled>${t('placing.ready')}</button>
        </div>
    `;
}

function renderPlayingScreen() {
    return `
        <div class="screen screen-playing">
            <div class="play-topbar">
                <div class="turn-indicator" id="turn-indicator"></div>
                <button class="btn btn-primary btn-fire" id="btn-fire" disabled>${t('playing.fire')}</button>
            </div>
            <div class="boards">
                <div class="board-section board-enemy">
                    <h3 class="board-label">${t('playing.enemyWaters')}</h3>
                    <div id="enemy-grid"></div>
                </div>
                <div class="board-section board-mine">
                    <h3 class="board-label">${t('playing.myFleet')}</h3>
                    <div id="my-grid"></div>
                </div>
            </div>
        </div>
    `;
}

function renderGameOverScreen(won, stats) {
    return `
        <div class="screen screen-gameover">
            <h1 class="${won ? 'victory' : 'defeat'}">${won ? t('gameover.victory') : t('gameover.defeat')}</h1>
            <div class="stats">
                <div class="stat"><span class="stat-label">${t('gameover.turns')}</span><span class="stat-value">${stats.turns}</span></div>
                <div class="stat"><span class="stat-label">${t('gameover.hits')}</span><span class="stat-value">${stats.hits}</span></div>
                <div class="stat"><span class="stat-label">${t('gameover.misses')}</span><span class="stat-value">${stats.misses}</span></div>
                <div class="stat"><span class="stat-label">${t('gameover.accuracy')}</span><span class="stat-value">${stats.accuracy}%</span></div>
            </div>
            <div class="gameover-actions">
                <button class="btn btn-primary" id="btn-rematch">${t('gameover.rematch')}</button>
                <button class="btn btn-secondary" id="btn-newgame">${t('gameover.newGame')}</button>
            </div>
        </div>
    `;
}

function renderRulesModal() {
    const rules = t('home.rulesText');
    const rulesList = Array.isArray(rules) ? rules.map(r => `<li>${r}</li>`).join('') : '';
    return `
        <div class="modal-overlay" id="rules-modal">
            <div class="modal">
                <h2>${t('home.rulesTitle')}</h2>
                <ol class="rules-list">${rulesList}</ol>
                <button class="btn btn-primary" id="btn-close-rules">${t('home.close')}</button>
            </div>
        </div>
    `;
}

export {
    renderGrid, renderFleetPanel,
    renderHomeScreen, renderWaitingScreen,
    renderPlacingScreen, renderPlayingScreen,
    renderGameOverScreen, renderRulesModal,
};
