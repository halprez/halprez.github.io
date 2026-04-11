const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const P1 = 1;
const P2 = 2;

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function dropDisc(board, col, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === EMPTY) {
            board[r][col] = player;
            return r;
        }
    }
    return -1; // column full
}

function isColumnFull(board, col) {
    return board[0][col] !== EMPTY;
}

function checkWin(board, row, col, player) {
    const directions = [
        [0, 1],  // horizontal
        [1, 0],  // vertical
        [1, 1],  // diagonal down-right
        [1, -1], // diagonal down-left
    ];

    for (const [dr, dc] of directions) {
        const cells = [{ r: row, c: col }];

        // Count forward
        for (let i = 1; i < 4; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
            cells.push({ r, c });
        }

        // Count backward
        for (let i = 1; i < 4; i++) {
            const r = row - dr * i;
            const c = col - dc * i;
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
            cells.push({ r, c });
        }

        if (cells.length >= 4) return cells;
    }

    return null;
}

function isBoardFull(board) {
    return board[0].every(cell => cell !== EMPTY);
}

export { ROWS, COLS, EMPTY, P1, P2, createBoard, dropDisc, isColumnFull, checkWin, isBoardFull };
