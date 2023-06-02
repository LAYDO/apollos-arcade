import { LocalGame } from './LocalGame';
export class TicTacToe extends LocalGame {


    private squares: Element;
    public numbersOdd: Element;
    public numbersEven: Element;

    public plays: Array<number>;

    private selectedElement: string;
    private winningArrays: Array<Array<number>>;


    constructor(board: HTMLElement) {
        super(board);

        this.plays = [];
        this.selectedElement = '';

        this.squares = document.createElement('div');
        this.squares.classList.add('ttt-col');

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
                        } else {
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
                } else if (document.querySelectorAll('.selected').length == 1) {
                    document.querySelectorAll('.selected')[0].classList.remove('selected');
                    text.classList.add('selected');
                    if (text.textContent) {
                        this.selectedElement = text.textContent;
                    }
                } else {
                    text.classList.remove('selected');
                    this.selectedElement = '';
                }
            });
            if (number % 2 == 0) {
                this.numbersEven.append(text);
            } else {
                this.numbersOdd.append(text);
            }
            for (let n of this.numbersEven.children) {
                n.classList.add('disabled');
            }
        }

        // Append squares and numbers to board
        this.boardArea.append(this.squares);
        this.playerOneContent.append(this.numbersOdd);
        this.playerTwoContent.append(this.numbersEven);


        this.restartButton.addEventListener('click', () => {
            new TicTacToe(this.board);
        });

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

        window.requestAnimationFrame(this.loop.bind(this));
    }

    protected update(progress: number): void {
        for (let s = 0; s < 9; s++) {
            let square = document.getElementById(`square${s}`);
            square?.addEventListener('click', () => {
                if (this.selectedElement != null || this.selectedElement != "") {
                    let t = document.getElementById(`text${parseInt(this.selectedElement) - 1}`);
                    if (t) {
                        t.classList.remove('selected');
                        square?.append(t);
                        this.plays[s] = parseInt(this.selectedElement);
                        this.selectedElement = '';
                        this.round++;
                        this.player1Turn = !this.player1Turn;
                        this.player2Turn = !this.player2Turn;
                        for (let n of this.numbersOdd.children) {
                            n.classList.toggle('disabled');
                        }
                        for (let n of this.numbersEven.children) {
                            n.classList.toggle('disabled');
                        }
                    }
                }
            })
        }
    }

    protected checkWin(): void {
        if (this.round < 9) {
            // Run thru winning arrays to check win
            for (let i of this.winningArrays) {
                let temp: Array<number> = [];
                for (let j of i) {
                    temp.push(this.plays[j]);
                }
                if (temp.reduce((a, b) => a + b, 0) == 15) {
                    this.drawEnd(2);
                }
            }
        } else {
            // Catch for tie
            this.drawEnd(1);
        }
    }

    drawEnd(n: number) {
        this.numbersOdd.innerHTML = '';
        this.numbersEven.innerHTML = '';

        switch (n) {
            case 1:
                this.playerOne.innerHTML = '';
                this.playerTwo.innerHTML = '';
                this.playerOne.textContent = 'TIE';
                break;
            case 2:
                if (!this.player1Turn) {
                    this.playerTwo.innerHTML = '';
                    this.numbersOdd.innerHTML = 'WINS';
                } else {
                    this.playerOne.innerHTML = '';
                    this.numbersEven.innerHTML = 'WINS';
                }
                break;
            default:
                break;
        }
    }
}