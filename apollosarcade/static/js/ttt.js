"use strict";
class TicTacToe {
    constructor(board) {
        this.round = 0;
        this.player1Turn = true;
        this.player2Turn = false;
        this.board = board;
        this.plays = [];
        this.isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;
        this.selectedElement = '';
        if (!this.isMobile) {
            this.board.classList.add('ttt-row');
        }
        this.squares = document.createElement('div');
        this.squares.classList.add('ttt-col');
        this.playerArea = document.createElement('div');
        this.playerArea.classList.add('ttt-col-b');
        this.playerNumbers = document.createElement('div');
        this.playerNumbers.classList.add('ttt-row-b');
        this.numbersOdd = document.createElement('div');
        this.numbersOdd.classList.add('ttt-row-numbers');
        this.numbersEven = document.createElement('div');
        this.numbersEven.classList.add('ttt-row-numbers');
        let localCount = 0;
        for (let i = 0; i < 3; i++) {
            let squareRow = document.createElement('div');
            squareRow.classList.add('ttt-row');
            squareRow.id = `squareRow${i}`;
            for (let j = 0; j < 3; j++) {
                let s = document.createElement('div');
                s.classList.add('ttt-square');
                s.id = `square${localCount}`;
                switch (i) {
                    case 0:
                    case 1:
                        if (j < 2) {
                            s.classList.add('ttt-border-right');
                            s.classList.add('ttt-border-bottom');
                        }
                        else {
                            s.classList.add('ttt-border-bottom');
                        }
                        break;
                    case 2:
                        if (j < 2) {
                            s.classList.add('ttt-border-right');
                        }
                        break;
                    default:
                        break;
                }
                squareRow.append(s);
                localCount++;
            }
            this.squares.append(squareRow);
        }
        // Construct and append numbers to player areas
        for (let i = 0; i < 9; i++) {
            let number = i + 1;
            let text = document.createElement('div');
            text.classList.add('ttt-number');
            text.textContent = number.toFixed(0);
            text.id = `text${i}`;
            text.addEventListener('click', () => {
                if (document.querySelectorAll('.selected').length == 0) {
                    text.classList.add('selected');
                    if (text.textContent) {
                        this.selectedElement = text.textContent;
                    }
                }
                else if (document.querySelectorAll('.selected').length == 1) {
                    document.querySelectorAll('.selected')[0].classList.remove('selected');
                    text.classList.add('selected');
                    if (text.textContent) {
                        this.selectedElement = text.textContent;
                    }
                }
                else {
                    text.classList.remove('selected');
                    this.selectedElement = '';
                }
            });
            if (number % 2 == 0) {
                this.numbersEven.append(text);
            }
            else {
                this.numbersOdd.append(text);
            }
            for (let n of this.numbersEven.children) {
                n.classList.add('disabled');
            }
        }
        // Titles
        this.titleOdd = document.createElement('div');
        this.titleOdd.classList.add('ttt-player');
        this.titleOdd.textContent = 'Player 1';
        this.titleEven = document.createElement('div');
        this.titleEven.classList.add('ttt-player');
        this.titleEven.textContent = 'Player 2';
        // Player Containers
        this.playerOdd = document.createElement('div');
        this.playerOdd.classList.add('ttt-col-top');
        this.playerOdd.append(this.titleOdd);
        this.playerOdd.append(this.numbersOdd);
        this.playerEven = document.createElement('div');
        this.playerEven.classList.add('ttt-col-top');
        this.playerEven.append(this.titleEven);
        this.playerEven.append(this.numbersEven);
        this.playerNumbers.append(this.playerOdd);
        this.playerNumbers.append(this.playerEven);
        this.playerArea.append(this.playerNumbers);
        // Append squares and numbers
        this.board.append(this.squares);
        this.board.append(this.playerArea);
        this.winningArrays = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        let row = document.createElement('div');
        row.classList.add('ttt-row');
        this.restartButton = document.createElement('div');
        this.restartButton.classList.add('ttt-restart');
        this.restartButton.textContent = 'Restart';
        row.append(this.restartButton);
        this.playerArea.append(row);
    }
    drawEnd(n) {
        this.numbersOdd.innerHTML = '';
        this.numbersEven.innerHTML = '';
        switch (n) {
            case 1:
                this.playerOdd.innerHTML = '';
                this.playerEven.innerHTML = '';
                this.playerOdd.textContent = 'TIE';
                break;
            case 2:
                if (!this.player1Turn) {
                    this.playerEven.innerHTML = '';
                    this.numbersOdd.innerHTML = 'WINS';
                }
                else {
                    this.playerOdd.innerHTML = '';
                    this.numbersEven.innerHTML = 'WINS';
                }
                break;
            default:
                break;
        }
    }
}
