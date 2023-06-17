import { TicTacToe } from './ttt';

let game: TicTacToe;

function init() {
    let board = document.getElementById('localBoard');
    if (board) {
        board.innerHTML = '';
        game = new TicTacToe(board);
    }
}

init();