document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const turnElement = document.getElementById('turn');
    const statusElement = document.getElementById('status');
    const winnerElement = document.getElementById('winner');
    const difficultySelect = document.getElementById('difficulty');
    const newGameButton = document.getElementById('new-game');

    let game = new Chess();
    let board = null;
    let selectedSquare = null;

    // Initialize Stockfish
    const stockfish = new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.wasm.js');
    stockfish.onmessage = (event) => {
        const message = event.data;
        if (message.startsWith('bestmove')) {
            const move = message.split(' ')[1];
            game.move(move, { sloppy: true });
            renderBoard();
            updateStatus();
        }
    };

    function getComputerMove() {
        const difficulty = difficultySelect.value;
        stockfish.postMessage(`position fen ${game.fen()}`);
        stockfish.postMessage(`go depth ${difficulty}`);
    }

    function renderBoard() {
        boardElement.innerHTML = '';
        const boardState = game.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.className = `square ${(i + j) % 2 === 0 ? 'white' : 'black'}`;
                const algebraic = String.fromCharCode('a'.charCodeAt(0) + j) + (8 - i);
                square.dataset.square = algebraic;

                const piece = boardState[i][j];
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = getPieceUnicode(piece);
                    pieceElement.style.color = piece.color === 'w' ? '#f0f0f0' : '#333';
                    square.appendChild(pieceElement);
                }
                square.addEventListener('click', handleSquareClick);
                boardElement.appendChild(square);
            }
        }
        // Highlight selected square
        if (selectedSquare) {
            document.querySelector(`[data-square='${selectedSquare}']`)?.classList.add('selected');
        }
    }

    function handleSquareClick(event) {
        const square = event.currentTarget.dataset.square;
        if (game.game_over()) return;

        if (selectedSquare) {
            const move = game.move({
                from: selectedSquare,
                to: square,
                promotion: 'q' // Always promote to queen for simplicity
            });

            if (move === null) { // Illegal move
                selectedSquare = null;
                renderBoard();
                return;
            }

            renderBoard();
            updateStatus();
            if (!game.game_over()) {
                window.setTimeout(getComputerMove, 250);
            }
            selectedSquare = null;
        } else {
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                selectedSquare = square;
                renderBoard();
            }
        }
    }

    function updateStatus() {
        let status = '';
        let moveColor = game.turn() === 'b' ? 'Black' : 'White';

        if (game.in_checkmate()) {
            status = `Checkmate! ${moveColor === 'White' ? 'Black' : 'White'} wins.`;
            winnerElement.textContent = status;
        } else if (game.in_draw()) {
            status = 'Draw!';
            winnerElement.textContent = status;
        } else {
            status = `${moveColor}'s turn`;
            if (game.in_check()) {
                status += ', Check!';
            }
        }
        statusElement.textContent = status;
        turnElement.textContent = moveColor;
    }

    function getPieceUnicode(piece) {
        const unicodeMap = {
            'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
            'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
        };
        const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
        return unicodeMap[key];
    }

    function startNewGame() {
        game.reset();
        selectedSquare = null;
        winnerElement.textContent = '';
        renderBoard();
        updateStatus();
    }

    newGameButton.addEventListener('click', startNewGame);

    // Initial setup
    startNewGame();
});
