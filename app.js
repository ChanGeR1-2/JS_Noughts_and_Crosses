const createCell = function() {
    let symbol = 'EMPTY';
    const getSymbol = function() {
        return symbol;
    }
    const reset = function() {
        symbol = 'EMPTY';
    }
    const setSymbol = function(sym) {
        symbol = sym;
    }
    return {getSymbol, reset, setSymbol};
};

const createPlayer = function(type, symbol) {
    const getType = function() {
        return type;
    }
    const getSymbol = function() {
        return symbol;
    }
    const setSymbol = function(sym) {
        symbol = sym;
    }
    return {getType, getSymbol, setSymbol};
};

const board = (function() {
    const board = [];
    let winningLine = [];
    for (let i = 0; i < 3; i++) {
        const row = [];
        for (let j = 0; j < 3; j++) {
            row.push(createCell());
        }
        board.push(row);
    }
    const reset = function() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board[i][j].reset();
            }
        }
    }
    const setCell = function(row, col, symbol) {
        board[row][col].setSymbol(symbol);
    }

    const checkWin = function(symbol, tiles = board) {
        let cells = [];
        for (let i = 0; i < 3; i++) {
            let count = 0;
            for (let j = 0; j < 3; j++) {
                if (tiles[i][j].getSymbol() === symbol) {
                    count++;
                    cells.push({row: i, col: j});
                }
            }
            if (count >= 3) {
                winningLine = cells;
                return true;
            } else {
                cells = [];
            }
        }

        cells = [];
        for (let i = 0; i < 3; i++) {
            let count = 0;
            for (let j = 0; j < 3; j++) {
                if (tiles[j][i].getSymbol() === symbol) {
                    count++;
                    cells.push({row: j, col: i});
                }
            }
            if (count >= 3) {
                winningLine = cells;
                return true;
            } else {
                cells = [];
            }
        }

        {
            cells = [];
            let count = 0;
            for (let i = 2; i >= 0; i--) {
                if (tiles[i][2 - i].getSymbol() === symbol) {
                    count++;
                    cells.push({row: i, col: 2 - i});
                }
            }
            if (count >= 3) {
                winningLine = cells;
                return true;
            } else {
                cells = [];
            }
        }

        {
            cells = [];
            let count = 0;
            for (let i = 2; i >= 0; i--) {
                if (tiles[i][i].getSymbol() === symbol) {
                    count++;
                    cells.push({row: i, col: i});
                }
            }
            if (count >= 3) {
                winningLine = cells;
                return true;
            }
        }
        return false;
    }

    const checkTie  = function(tiles = board) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (tiles[i][j].getSymbol() === 'EMPTY') {
                    return false;
                }
            }
        }
        return true;
    }

    const isValid = function(row, col) {
        return board[row][col].getSymbol() === 'EMPTY';
    }

    const getWinningLine = function() {
        return winningLine;
    }

    const getAvailableMoves = function(tiles = board) {
        const moves = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (tiles[i][j].getSymbol() === 'EMPTY') {
                    moves.push({row: i, col: j});
                }
            }
        }
        return moves;
    }

    const copyBoard = function() {
        const copy = [];
        for (let i = 0; i < 3; i++) {
            const row = [];
            for (let j = 0; j < 3; j++) {
                const cell = createCell();
                cell.setSymbol(board[i][j].getSymbol())
                row.push(cell);
            }
            copy.push(row);
        }
        return copy;
    }

    return {reset, setCell, checkWin, checkTie, isValid, getWinningLine, getAvailableMoves, copyBoard};
})();

const createComputer = function(type, symbol) {
    const {getType, getSymbol, setSymbol} = createPlayer(type, symbol);

    const findBestMove = function() {
        const tiles = board.copyBoard();
        const moves = board.getAvailableMoves(tiles);
        const scores = new Map();
        for (let {row, col} of moves) {
            tiles[row][col].setSymbol(getSymbol());
            const eval = minimax(tiles, -1000000, 1000000, getSymbol(), false);
            tiles[row][col].reset();
            scores.set({row, col}, eval);
        }
        let bestScore = -100;
        let bestMove;
        for (let [key, value] of scores) {
            const randomChance = Math.random();
            if (value > bestScore || (value >= bestScore && randomChance > 0.5)) {
                bestScore = value;
                bestMove = key;
            }
        }
        return bestMove;
    }

    function getScore(tiles, sym) {
        if (board.checkWin(sym, tiles)) {
            const {row, col} = board.getWinningLine()[0];
            const winningSymbol = tiles[row][col].getSymbol();
            if (winningSymbol === getSymbol()) {
                return 10;
            } else {
                return -10;
            }
        } else {
            return 0;
        }
    }

    function minimax(tiles, alpha, beta, sym, isMax) {
        const score = getScore(tiles, sym);
        const moves = board.getAvailableMoves(tiles);
        if (board.checkWin(sym, tiles) || board.checkTie(tiles) || moves.length === 0) {
            return score;
        }
        if (isMax) {
            let bestEval = -10000;
            for (let {row, col} of moves) {
                tiles[row][col].setSymbol(getSymbol());
                const eval = minimax(tiles, alpha, beta, getSymbol(), false);
                tiles[row][col].reset();
                bestEval = Math.max(bestEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break;
                }
            }
            return bestEval;
        } else {
            let bestEval = 10000;
            for (let {row, col} of moves) {
                const newSymbol = getSymbol() === 'X' ? 'O' : 'X';
                tiles[row][col].setSymbol(newSymbol);
                const eval = minimax(tiles, alpha, beta, newSymbol, true);
                tiles[row][col].reset();
                bestEval = Math.min(bestEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break;
                }
            }
            return bestEval;
        }
    }

    return {getType, getSymbol, setSymbol, findBestMove};
};

const dialogOpenOver = new CustomEvent('gameOver')

const gameController = (function () {
    const cellNodes = document.querySelectorAll('.cell');
    const players = [];
    players.push(createPlayer('human', 'X'));
    players.push(createComputer('computer', 'O'));
    let currentPlayer = players[0];

    let gameIsOver = false;

    for (let i = 0; i < cellNodes.length; i++) {
        const cell = cellNodes[i];
        const row = Math.floor(i / 3);
        const col = i - (row * 3);
        cell.addEventListener('click', () => {
            if (board.isValid(row, col) && !gameIsOver) {
                board.setCell(row, col, currentPlayer.getSymbol());
                if (board.checkTie()) {
                    document.dispatchEvent(dialogOpenOver);
                }
                if (cell.children[0]) {
                    cell.removeChild(cell.firstChild);
                }
                const span = document.createElement('span');
                span.textContent = currentPlayer.getSymbol();
                cell.appendChild(span);
                if (board.checkWin(currentPlayer.getSymbol())) {
                    handleWin();
                } else {
                    currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
                    const type = currentPlayer.getType();
                    if (type === 'computer' && !board.checkTie()) {
                        const {row, col} = currentPlayer.findBestMove();
                        cellNodes[(row * 3) + col].click();
                    }
                }
            }
        });
        cell.addEventListener('mouseenter', () => {
            if (cell.children.length === 0) {
                const span = document.createElement('span');
                span.textContent = currentPlayer.getSymbol();
                span.classList.add('transparent-text');
                cell.appendChild(span);
            }
        })
        cell.addEventListener('mouseleave', () => {
            const span = cell.children[0];
            if (span.classList.contains('transparent-text')) {
                cell.removeChild(span);
            }
        })
    }

    const reset = function() {
        for (let node of cellNodes) {
            node.textContent = '';
            if (node.classList.contains('green')) {
                node.classList.toggle('green');
            }
        }
        currentPlayer = players[0];
        gameIsOver = false;
        if (currentPlayer.getType() === "computer") {
            const {row, col} = currentPlayer.findBestMove();
            cellNodes[(row * 3) + col].click();
        }
    }

    const switchPlayers = function() {
        const tmp = players[0];
        players[0] = players[1];
        players[1] = tmp;
        players[0].setSymbol('X');
        players[1].setSymbol('O');
        board.reset();
        reset();
    }

    const getWinner = function() {
        if (gameIsOver) {
            return currentPlayer;
        }
        return null;
    }

    function handleWin() {
        const winningLine = board.getWinningLine();
        gameIsOver = true;

        for (let {row, col} of winningLine) {
            cellNodes[(row * 3) + col].classList.toggle('green');
        }
        document.dispatchEvent(dialogOpenOver);
    }

    return {reset, switchPlayers, getWinner};
})();

const gameOverScreen = document.querySelector('.game-over-screen');
const gameOverScreenText = document.querySelector('.game-over-screen div');
document.addEventListener('gameOver', () => {
    const winner = gameController.getWinner();
    gameOverScreenText.textContent = `${winner ? winner.getSymbol() + ' wins!' : 'Draw!'}`;
    gameOverScreen.inert = true;
    gameOverScreen.showModal();
    gameOverScreen.inert = false;
})

document.querySelector('.switch-player').addEventListener('click', () => {
    gameController.switchPlayers();
})

gameOverScreen.addEventListener('click', () => {
    gameOverScreen.close();
    board.reset();
    gameController.reset();
})

document.querySelector('.reset-button').addEventListener('click', () => {
    board.reset();
    gameController.reset();
})
