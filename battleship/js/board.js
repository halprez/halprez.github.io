const GRID_SIZE = 10;
const EMPTY = 0;
const SHIP = 'S';
const HIT = 'H';
const MISS = 'M';
const SUNK = 'K';

const FLEET = [
    { id: 'carrier', size: 5 },
    { id: 'battleship', size: 4 },
    { id: 'submarine1', size: 3 },
    { id: 'submarine2', size: 3 },
    { id: 'destroyer', size: 2 },
];

function createGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(EMPTY));
}

function canPlace(grid, ship, row, col, horizontal) {
    const dr = horizontal ? 0 : 1;
    const dc = horizontal ? 1 : 0;

    for (let i = 0; i < ship.size; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
        if (grid[r][c] !== EMPTY) return false;
    }
    return true;
}

function placeShip(grid, ship, row, col, horizontal) {
    const cells = [];
    const dr = horizontal ? 0 : 1;
    const dc = horizontal ? 1 : 0;

    for (let i = 0; i < ship.size; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        grid[r][c] = ship.id;
        cells.push({ r, c });
    }
    return cells;
}

function removeShip(grid, shipId) {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === shipId) grid[r][c] = EMPTY;
        }
    }
}

function randomPlacement() {
    const grid = createGrid();
    const placements = [];

    for (const ship of FLEET) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 200) {
            const horizontal = Math.random() > 0.5;
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);
            if (canPlace(grid, ship, row, col, horizontal)) {
                const cells = placeShip(grid, ship, row, col, horizontal);
                placements.push({ ...ship, row, col, horizontal, cells });
                placed = true;
            }
            attempts++;
        }
    }
    return { grid, placements };
}

function evaluateShot(grid, placements, row, col) {
    const cell = grid[row][col];

    if (cell === EMPTY) {
        grid[row][col] = MISS;
        return { result: 'miss' };
    }

    if (cell === HIT || cell === MISS || cell === SUNK) {
        return { result: 'already' };
    }

    // It's a ship id
    const shipId = cell;
    grid[row][col] = HIT;

    // Check if ship is sunk
    const placement = placements.find(p => p.id === shipId);
    const isSunk = placement.cells.every(c => grid[c.r][c.c] === HIT);

    if (isSunk) {
        placement.cells.forEach(c => { grid[c.r][c.c] = SUNK; });
        return { result: 'sunk', ship: { id: shipId, cells: placement.cells } };
    }

    return { result: 'hit' };
}

function allShipsSunk(grid, placements) {
    return placements.every(p => p.cells.every(c => grid[c.r][c.c] === SUNK));
}

export {
    GRID_SIZE, EMPTY, SHIP, HIT, MISS, SUNK, FLEET,
    createGrid, canPlace, placeShip, removeShip,
    randomPlacement, evaluateShot, allShipsSunk,
};
