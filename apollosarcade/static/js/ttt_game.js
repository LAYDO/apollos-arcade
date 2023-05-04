"use strict";
let game;
let lastRender = 0;
let round = 0;
let plays = ['', '', '', '', '', '', '', '', ''];
function init() {
    let board = document.getElementById('tttBoard');
    if (board) {
        board.innerHTML = '';
        game = new TicTacToe(board);
        game.restartButton.addEventListener('click', init);
        window.requestAnimationFrame(loop);
    }
}
function update(progress) {
    // Update the state of the game for the elapsed time since last render
    for (let s = 0; s < 9; s++) {
        let square = document.getElementById(`square${s}`);
        square === null || square === void 0 ? void 0 : square.addEventListener('click', () => {
            if (game.selectedElement != null || game.selectedElement != "") {
                let t = document.getElementById(`text${parseInt(game.selectedElement) - 1}`);
                if (t) {
                    t.classList.remove('selected');
                    square === null || square === void 0 ? void 0 : square.append(t);
                    game.plays[s] = parseInt(game.selectedElement);
                    game.selectedElement = '';
                    game.round++;
                    game.player1Turn = !game.player1Turn;
                    game.player2Turn = !game.player2Turn;
                    for (let n of game.numbersOdd.children) {
                        n.classList.toggle('disabled');
                    }
                    for (let n of game.numbersEven.children) {
                        n.classList.toggle('disabled');
                    }
                }
            }
        });
    }
}
function loop(timestamp) {
    // let timestamp = new Date();
    let progress = timestamp - lastRender;
    update(progress);
    checkWin(game);
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}
function checkWin(game) {
    if (game.round < 9) {
        // Run thru winning arrays to check win
        for (let i of game.winningArrays) {
            let temp = [];
            for (let j of i) {
                temp.push(game.plays[j]);
            }
            if (temp.reduce((a, b) => a + b, 0) == 15) {
                game.drawEnd(2);
            }
        }
    }
    else {
        // Catch for tie
        game.drawEnd(1);
    }
}
init();
