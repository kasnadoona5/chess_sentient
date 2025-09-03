document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const turnElement = document.getElementById('turn');
    const winnerElement = document.getElementById('winner');

    let board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    const pieceUnicode = {
        'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
        'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
    };

    let turn = 'white';
    let selectedPiece = null;
    let selectedSquare = null;

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((i + j) % 2 === 0 ? 'white' : 'black');
                square.dataset.row = i;
                square.dataset.col = j;

                const piece = board[i][j];
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.classList.add('piece');
                    pieceElement.textContent = pieceUnicode[piece];
                    pieceElement.style.color = (piece === piece.toUpperCase()) ? '#fff' : '#000';
                    square.appendChild(pieceElement);
                }
                square.addEventListener('click', handleSquareClick);
                boardElement.appendChild(square);
            }
        }
    }

    function handleSquareClick(event) {
        if (winnerElement.textContent) return;

        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = board[row][col];

        if (selectedPiece) {
            // Try to move
            if (isValidMove(selectedSquare, { row, col })) {
                movePiece(selectedSquare, { row, col });
                turn = 'black';
                turnElement.textContent = 'Black';
                setTimeout(computerMove, 500);
            }
            selectedPiece = null;
            selectedSquare = null;
            // Deselect visual feedback
            document.querySelectorAll('.selected').forEach(s => s.classList.remove('selected'));
        } else if (piece && isPlayerPiece(piece)) {
            // Select a piece
            selectedPiece = piece;
            selectedSquare = { row, col };
            square.classList.add('selected'); // Visual feedback for selection
        }
    }

    function isPlayerPiece(piece) {
        return turn === 'white' && piece === piece.toUpperCase();
    }

    function isValidMove(from, to) {
        // This is a very simplified validation for this minimal game
        // It doesn't check for piece-specific rules, just for capturing or moving to an empty square
        const targetPiece = board[to.row][to.col];
        if (targetPiece && isPlayerPiece(targetPiece)) {
            return false; // Can't capture your own piece
        }
        return true;
    }

    function movePiece(from, to) {
        const piece = board[from.row][from.col];
        board[to.row][to.col] = piece;
        board[from.row][from.col] = '';

        if (piece.toLowerCase() === 'k') {
            winnerElement.textContent = (piece === 'K' ? 'Black' : 'White') + ' has captured the King! Game Over.';
        }
        renderBoard();
    }

    function computerMove() {
        let possibleMoves = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece === piece.toLowerCase()) { // Black's piece
                    for (let x = 0; x < 8; x++) {
                        for (let y = 0; y < 8; y++) {
                            if (isValidComputerMove({row: i, col: j}, {row: x, col: y})) {
                                possibleMoves.push({ from: { row: i, col: j }, to: { row: x, col: y } });
                            }
                        }
                    }
                }
            }
        }

        if (possibleMoves.length > 0) {
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            movePiece(randomMove.from, randomMove.to);
        }

        turn = 'white';
        turnElement.textContent = 'White';
    }

    function isValidComputerMove(from, to) {
        const targetPiece = board[to.row][to.col];
        if (targetPiece && targetPiece === targetPiece.toLowerCase()) {
            return false; // Can't capture own piece
        }
        return true;
    }

    renderBoard();
});
