import { CaptureBoard } from "./CaptureBoard";

let capture_game: CaptureBoard;

function capture() {
    let app = document.getElementById('mpApp');
    let board = document.getElementById('mpBoard');
    let data = document.getElementById('context-data');
    if (app && board && data) {
        capture_game = new CaptureBoard(app, board, data);
    }
}

capture();
