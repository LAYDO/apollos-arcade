import { MagicFifteenBoard } from './MagicFifteenBoard';

let magic_game: MagicFifteenBoard;

function magic15() {
    let app = document.getElementById('mpApp');
    let board = document.getElementById('mpBoard');
    let data = document.getElementById('context-data');
    if (app && board && data) {
        magic_game = new MagicFifteenBoard(app, board, data);
    }
}

magic15();