const BOARD_SIZE = 3;
let Game;

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
			return true;
		} else return false;
	};

	const getBoard = () => board;

	return { initEmptyBoard, setMarker, getBoard };
})();

// store Player information
const Player = function (name, marker) {
	const getName = () => name;
	const getMarker = () => marker;

	return { getName, getMarker };
};

const initGame = function (nameX, nameO) {
	Game = (function (playerX, playerO) {
		let gameOver = false;
		let gameStatus;

		const board = Gameboard.getBoard();

		const players = [playerX, playerO];
		let currentPlayerIndex = 0;
		let lastPlayer; // to keep track of who won

		const switchTurn = () => {
			currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
			return players[currentPlayerIndex];
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
				if (board[0][0] === board[1][1] && board[1][1] === board[2][2])
					return true;
				if (board[0][2] === board[1][1] && board[1][1] === board[2][0])
					return true;
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
			if (
				Gameboard.setMarker(
					row,
					column,
					players[currentPlayerIndex].getMarker()
				)
			) {
				// place the marker
				const index = row * BOARD_SIZE + column;
				Display.updateCell(index, players[currentPlayerIndex].getMarker());
				lastPlayer = players[currentPlayerIndex];

				checkGameStatus();
				if (gameOver) {
					Display.unbindCellEvents();
					Display.showGameStatus();
					return;
				}
				switchTurn();
			}
		};

		const getLastPlayer = () => lastPlayer;
		const getGameStatus = () => gameStatus;

		return { playRound, getLastPlayer, getGameStatus };
	})(Player(nameX, 'X'), Player(nameO, 'O'));
};

// DOM
const Display = (function () {
	// how to play card
	const cardGameRules = document.querySelector('#card__gameRules');
	const btnGotIt = document.querySelector('#btn__gotIt');
	// players form
	const dialogPlayersNames = document.querySelector('#dialog__playersNames');
	const formPlayersNames = document.querySelector('#form__playersNames');
	// game status
	const sectionGameStatus = document.querySelector('#section__gameStatus');
	const titleGameStatus = document.querySelector('#title__gameStatus');
	const btnPlayAgain = document.querySelector('#btn__playAgain');
	// const cells = document.querySelectorAll('.cell');

	// players
	let nameX, nameO;

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
				const index = parseInt(e.currentTarget.dataset.cell);
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
		cardGameRules.classList.add('hidden');
		dialog.close();
		renderBoard();
		nameX = document.querySelector('#player__X').value;
		nameO = document.querySelector('#player__O').value;
		initGame(nameX, nameO);
		bindCellEvents();
	};

	const playAgain = () => {
		const board = document.querySelector('#board');
		board.remove(); // dom board

		Gameboard.initEmptyBoard(); // for game logic board

		cardGameRules.classList.remove('hidden');
		sectionGameStatus.classList.add('hidden');
	};

	const showGameStatus = () => {
		const status = Game.getGameStatus();
		const winnerMarker = Game.getLastPlayer().getMarker();

		// styling
		sectionGameStatus.classList.remove('hidden');

		if (status === 'win') {
			if (winnerMarker === 'X') {
				titleGameStatus.textContent = `🎉 ${nameX} wins! 🎉`;
			} else {
				titleGameStatus.textContent = `🎉 ${nameO} wins! 🎉`;
			}
		} else if (status === 'tie') {
			titleGameStatus.textContent = `That's a tie!`;
		}
	};

	const bindEvents = () => {
		btnGotIt.addEventListener('click', () => {
			dialogPlayersNames.showModal();
		});

		btnPlayAgain.addEventListener('click', () => {
			playAgain();
		});

		formPlayersNames.addEventListener('submit', (e) => {
			startGame(e, dialogPlayersNames);
			formPlayersNames.reset();
		});
	};

	return {
		updateCell,
		bindEvents,
		unbindCellEvents,
		showGameStatus,
	};
})();

Display.bindEvents();
