import { Capture } from "./capture";

let game: Capture;

function init() {
    let board = document.getElementById('localBoard');
    if (board) {
        board.innerHTML = '';
        game = new Capture(board);
    }
}

init();