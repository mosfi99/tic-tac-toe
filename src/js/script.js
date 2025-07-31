const BOARD_SIZE = 3;

// Gameboard as an IIFE Module to handle board state
const Gameboard = (function () {
	const rows = BOARD_SIZE;
	const columns = BOARD_SIZE;
	let board = [];

	const initEmptyBoard = () => {
		board = [];
		for (let i = 0; i < rows; i++) {
			board[i] = [];
			for (let j = 0; j < columns; j++) {
				board[i].push('');
			}
		}
	};

	initEmptyBoard();

	const setMarker = (row, column, marker) => {
		// set a marker ( X or O) if the cell is empty
		if (board[row][column] === '') {
			board[row][column] = marker;
			console.log('setting:', marker, 'at:', row, column);
			return true;
		} else return false;
	};

	const getBoard = () => board;

	const resetBoard = function () {
		initEmptyBoard();
		return board;
	};

	return { setMarker, getBoard, resetBoard };
})();

// store Player information
const Player = function (name, marker) {
	const getName = () => name;
	const getMarker = () => marker;

	return { getName, getMarker };
};

// Game controller as an IIFE Module to manage the turns, win/tie logic and track current player
const Game = (function (playerX, playerO) {
	let gameOver = false;
	let gameStatus;

	const board = Gameboard.getBoard();

	const players = [playerX, playerO];
	let currentPlayer = players[0];
	let lastPlayer; // to keep track of who won

	const switchTurn = (player) => {
		player =
			player.getName() === players[0].getName() ? players[1] : players[0];

		currentPlayer = player;
		return currentPlayer;
	};

	// check for all winning combinations
	const checkWinner = () => {
		// check if the first element is no empty (if it is, there cannot be a win in that direction)
		for (let i = 0; i < BOARD_SIZE; i++) {
			// row
			if (
				board[i][0] !== '' &&
				board[i][0] === board[i][1] &&
				board[i][1] === board[i][2]
			) {
				return true;
			}
			// column
			if (
				board[0][i] !== '' &&
				board[0][i] === board[1][i] &&
				board[1][i] === board[2][i]
			) {
				return true;
			}
		}
		// diagonal
		// 0,0 - 1,1 - 2,2
		// 0,2 - 1,1 - 2,0
		if (board[1][1] !== '') {
			if (
				board[0][0] !== '' &&
				board[0][0] === board[1][1] &&
				board[1][1] === board[2][2]
			) {
				return true;
			}
			if (
				board[0][2] !== '' &&
				board[0][2] === board[1][1] &&
				board[1][1] === board[2][0]
			) {
				return true;
			}
		}

		return false;
	};

	// checks if the board has empty spaces, if yes then it is not a tie yet, if no, it is a tie
	const checkTie = () => {
		for (let i = 0; i < BOARD_SIZE; i++) {
			for (let j = 0; j < BOARD_SIZE; j++) {
				if (board[i][j] === '') {
					return false;
				}
			}
		}
		return true;
	};

	const restartGame = () => {
		// game logic
		gameOver = false;
		Gameboard.resetBoard();
	};

	const checkGameStatus = () => {
		if (checkWinner()) {
			gameStatus = 'win';
			gameOver = true;
			return;
		}

		if (checkTie()) {
			gameStatus = 'tie';
			gameOver = true;
			return;
		}
	};

	const playRound = (row, column) => {
		if (gameOver) return; // safe guard, in case the events are not unbinding on time.

		// checks if the player chose an already-filled cell
		if (Gameboard.setMarker(row, column, currentPlayer.getMarker())) {
			// place the marker
			const index = row * BOARD_SIZE + column;
			Display.updateCell(index, currentPlayer.getMarker());

			lastPlayer = currentPlayer;
			switchTurn(currentPlayer);
		}

		checkGameStatus();
		if (gameOver) {
			Display.unbindCellEvents();
			Display.showGameStatus();
			// TODO: add a Display.gameOverDisplay function, to hold all these Display.sth funcs, display should only return gameOverDisplay
			return;
		}
	};
	const getLastPlayer = () => lastPlayer;
	const getGameStatus = () => gameStatus;

	return { playRound, getLastPlayer, getGameStatus };
})(Player('playerX', 'X'), Player('playerO', 'O'));

// DOM
const Display = (function () {
	// game mode
	const cardGameMode = document.querySelector('#card__gameMode');
	const modeTwoPlayers = document.querySelector('#mode__twoPlayers');
	const modeVsComputer = document.querySelector('#mode__vsComputer');
	// dialogs
	const dialogTwoPlayers = document.querySelector('#dialog__twoPlayers');
	const dialogVsComputer = document.querySelector('#dialog__vsComputer');
	// forms
	const form__twoPlayers = document.querySelector('#form__twoPlayers');
	const form__vsComputer = document.querySelector('#form__vsComputer');

	// board
	const cells = document.querySelectorAll('.cell');

	// For both forms, click on start btn (type submit) will:
	//  1) delete the game mode card
	//  2) close the modal
	//  3) create the board grid
	const renderBoard = () => {
		const sectionBoard = document.querySelector('#section__board');
		const board = document.createElement('div');

		board.id = 'board';
		board.className = `grid grid-cols-3 grid-rows-3 size-60 my-10 sm:size-90 mx-auto`;

		for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
			const cell = document.createElement('div');
			cell.dataset.cell = i;
			cell.className = 'cell flex justify-center items-center border';
			board.appendChild(cell);
		}

		sectionBoard.appendChild(board);
	};

	const bindCellEvents = () => {
		const cells = document.querySelectorAll('.cell');
		cells.forEach((cell) => {
			cell.addEventListener('click', (e) => {
				const index = parseInt(e.target.dataset.cell);
				const row = Math.floor(index / BOARD_SIZE);
				const col = index % BOARD_SIZE;
				Game.playRound(row, col);
			});
		});
	};

	const unbindCellEvents = () => {
		const cells = document.querySelectorAll('.cell');
		cells.forEach((cell) => {
			// clone without listeners
			const newCell = cell.cloneNode(true);
			cell.replaceWith(newCell);
		});
	};

	const updateCell = (index, currentMarker) => {
		const cell = document.querySelector(`[data-cell='${index}']`);
		const marker = document.createElement('span');
		marker.className = 'text-5xl font-bold';
		currentMarker === 'X'
			? marker.classList.add('text-primary')
			: marker.classList.add('text-secondary');
		marker.textContent = currentMarker;
		if (cell) cell.appendChild(marker);
	};

	const startGame = (e, dialog) => {
		e.preventDefault();
		cardGameMode.remove();
		dialog.close();
		renderBoard();
		bindCellEvents();
	};

	// TODO: on playAgain func
	// - restartGame(); for the game logic.
	// - Display.clearBoard(); (maybe not cause the board will be generated again?)
	// - show again gameMode card, which was removed, maybe use hidden for it.
	// - hide the section Game Status
	const playAgain = () => {};

	const showGameStatus = () => {
		const status = Game.getGameStatus();
		const winnerMarker = Game.getLastPlayer().getMarker();
		const playerX = document.querySelector('#player__X').value;
		const playerO = document.querySelector('#player__O').value;

		// DOM
		const sectionGameStatus = document.querySelector('#section__gameStatus');
		const titleGameStatus = document.querySelector('#title__gameStatus');

		// styling
		sectionGameStatus.classList.remove('hidden');

		if (status === 'win') {
			if (winnerMarker === 'X') {
				titleGameStatus.textContent = `🎉 ${playerX} wins! 🎉`;
			} else {
				titleGameStatus.textContent = `🎉 ${playerO} wins! 🎉`;
			}
		} else if (status === 'tie') {
			titleGameStatus.textContent = `That's a tie!`;
		}
	};

	const clearBoard = () => {
		document
			.querySelectorAll('.cell')
			.forEach((cell) => (cell.textContent = ''));
	};

	const bindEvents = () => {
		modeTwoPlayers.addEventListener('click', () => {
			dialogTwoPlayers.showModal();
		});

		modeVsComputer.addEventListener('click', () => {
			dialogVsComputer.showModal();
		});

		form__twoPlayers.addEventListener('submit', (e) => {
			startGame(e, dialogTwoPlayers);
		});

		form__vsComputer.addEventListener('submit', (e) => {
			startGame(e, dialogVsComputer);
		});
	};

	return {
		updateCell,
		bindEvents,
		unbindCellEvents,
		showGameStatus,
		clearBoard,
	};
})();

Display.bindEvents();
