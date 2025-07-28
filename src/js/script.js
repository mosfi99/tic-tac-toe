// Gameboard as an IIFE Module to handle board state
const Gameboard = (function () {
	const rows = 3;
	const columns = 3;
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
const Game = (function (player1, player2) {
	let gameOver = false;

	const board = Gameboard.getBoard();
	const boardSize = board.length;

	const players = [Player(player1, 'X'), Player(player2, 'O')];
	let currentPlayer = players[0];

	const switchTurn = (player) => {
		player =
			player.getName() === players[0].getName() ? players[1] : players[0];

		currentPlayer = player;
		return currentPlayer;
	};

	// check for all winning combinations
	const checkWinner = () => {
		// check if the first element is no empty (if it is, there cannot be a win in that direction)
		for (let i = 0; i < boardSize; i++) {
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
		// TODO: change return for a var with the wining value to stop the game
	};

	// checks if the board has empty spaces, if yes then it is not a tie yet, if no, it is a tie
	const checkTie = () => {
		for (let i = 0; i < boardSize; i++) {
			for (let j = 0; j < boardSize; j++) {
				if (board[i][j] === '') {
					return false;
				}
			}
		}
		return true;
	};

	const restartGame = () => {
		gameOver = false;
		Gameboard.resetBoard();
		// TODO: DOM
		// ask for players name again
		// let them choose the mark
	};

	const playRound = (row, column) => {
		if (gameOver) return;

		// checks if the player chose an already-filled cell
		if (Gameboard.setMarker(row, column, currentPlayer.getMarker())) {
			switchTurn(currentPlayer);
		}

		let winStatus = checkWinner();
		if (!winStatus) {
			let tieStatus = checkTie();
			if (tieStatus) {
				console.log('tie');
				gameOver = true;
				restartGame();
			}
		} else {
			console.log('winner');
			gameOver = true;
			restartGame();
		}
	};

	return { playRound };
})('player 1', 'player 2');
// TODO: up here store the names of the players from the DOM.

// DOM
const modeTwoPlayers = document.querySelector('#mode__twoPlayers');
const modeVsComputer = document.querySelector('#mode__vsComputer');

const dialogTwoPlayers = document.querySelector('#dialog__twoPlayers');

const dialogVsComputer = document.querySelector('#dialog__vsComputer');

// Events
// open form for 2 players mode
modeTwoPlayers.addEventListener('click', () => {
	dialogTwoPlayers.showModal();
});

// TODO: finish form for 2 players, and vs computer

// For both forms, click on start will:
//  1) delete the game mode card
//  2) close the modal
//  3) create the board grid
