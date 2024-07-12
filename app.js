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
    return {getType, getSymbol};
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

    const checkWin = function(tiles, symbol) {
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

    const checkTie  = function(tiles) {
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

    const getAvailableMoves = function(tiles) {
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
    const {getType, getSymbol} = createPlayer(type, symbol);

    const findBestMove = function() {
        const tiles = board.copyBoard();
        const moves = board.getAvailableMoves(tiles);
        const scores = new Map();
        for (let {row, col} of moves) {
            tiles[row][col].setSymbol(symbol);
            const eval = minimax(tiles, -1000000, 1000000, symbol, false);
            tiles[row][col].reset();
            scores.set({row, col}, eval);
        }
        console.log(scores);
        let bestScore = -100;
        let bestMove;
        for (let [key, value] of scores) {
            if (value > bestScore) {
                bestScore = value;
                bestMove = key;
            }
        }
        return bestMove;
    }

    function getScore(tiles, sym) {
        if (board.checkWin(tiles, sym)) {
            const {row, col} = board.getWinningLine()[0];
            const winningSymbol = tiles[row][col].getSymbol();
            if (winningSymbol === symbol) {
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
        if (board.checkWin(tiles, sym) || board.checkTie(tiles) || moves.length === 0) {
            return score;
        }
        if (isMax) {
            let bestEval = -10000;
            for (let {row, col} of moves) {
                tiles[row][col].setSymbol(symbol);
                const eval = minimax(tiles, alpha, beta, symbol, false);
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
                const newSymbol = symbol === 'X' ? 'O' : 'X';
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

    return {getType, getSymbol, findBestMove};
};


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
                cell.textContent = currentPlayer.getSymbol();
                if (board.checkWin(board.copyBoard(), currentPlayer.getSymbol())) {
                    handleWin();
                }
                currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
                const type = currentPlayer.getType();
                if (type === 'computer' && !board.checkTie(board.copyBoard())) {
                    const {row, col} = currentPlayer.findBestMove();
                    cellNodes[(row * 3) + col].click();
                }
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
    }

    const setPlayers = function(player1, player2) {
        players[0] = player1;
        players[1] = player2;
    }

    function handleWin() {
        const winningLine = board.getWinningLine();
        gameIsOver = true;

        for (let {row, col} of winningLine) {
            cellNodes[(row * 3) + col].classList.toggle('green');
        }
    }

    return {reset, setPlayers};
})();

document.querySelector('.reset-button').addEventListener('click', () => {
    board.reset();
    gameController.reset();
})