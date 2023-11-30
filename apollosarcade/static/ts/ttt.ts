import { LocalGame } from './LocalGame';
export class TicTacToe extends LocalGame {

    private squares: Element;
    public plays: Array<number>;
    public spaces: Array<number>;

    public numbersOdd: Element;
    public numbersEven: Element;

    public selectedNumber: number;
    public selectedSquare: number;

    private winningArrays: Array<Array<number>>;
    private winLine: Array<number>;

    constructor(board: HTMLElement) {
        super(board);

        this.plays = [];
        this.spaces = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.selectedNumber = 0;
        this.selectedSquare = -1;

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
        for (let i = 1; i < 10; i++) {
            let number = document.createElement('div');
            number.classList.add('ttt-number');
            number.textContent = i.toFixed(0);
            number.id = `number${i}`;
            if (i % 2 == 0) {
                this.numbersEven.append(number);
            } else {
                this.numbersOdd.append(number);
            }
            for (let n of this.numbersEven.children) {
                n.classList.add('disabled');
            }
        }

        // Append squares and numbers to board
        this.boardArea.append(this.squares);
        this.playerOneContent.append(this.numbersOdd);
        this.playerTwoContent.append(this.numbersEven);
        this.setUpSquareEventListeners();
        this.setUpNumberEventListeners();

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

        this.winLine = [];
    }

    public setUpSquareEventListeners() {
        // Construct and append squares to board
        for (let i = 0; i < 9; i++) {
            let square = document.getElementById(`square${i}`);
            if (square != null) {
                square.addEventListener('click', () => {
                    try {
                        if (square?.textContent != '') {
                            throw new Error('Square already taken!')
                        }
                        if (this.selectedSquare == -1) {
                            square.classList.add('ttt-square-selected');
                            this.selectedSquare = parseInt(square.id.slice(-1));
                        } else if (this.selectedSquare >= 0) {
                            if (document.getElementById(`square${this.selectedSquare}`)) {
                                document.getElementById(`square${this.selectedSquare}`)?.classList.remove('ttt-square-selected');
                            }
                            square.classList.add('ttt-square-selected');
                            this.selectedSquare = parseInt(square.id.slice(-1));
                        } else {
                            square.classList.remove('ttt-square-selected');
                            this.selectedSquare = -1;
                        }

                        if (this.selectedSquare != -1 && this.selectedNumber != 0) {
                            console.log(`Selected square: ${this.selectedSquare} and number: ${this.selectedNumber}`);
                            this.handleMove({
                                'space': this.selectedSquare,
                                'play': this.selectedNumber,
                            });
                        }
                    } catch (error) {
                        console.log(error);
                    }
                });
            }
        }
    }

    public setUpNumberEventListeners() {
        for (let i = 1; i < 10; i++) {
            let number = document.getElementById(`number${i}`);
            if (number != null) {
                number.addEventListener('click', () => {
                    if (document.querySelectorAll('.ttt-number-selected').length == 0) {
                        number?.classList.add('ttt-number-selected');
                        if (number?.textContent) {
                            this.selectedNumber = parseInt(number.textContent);
                        }
                    } else if (document.querySelectorAll('.ttt-number-selected').length == 1) {
                        document.querySelectorAll('.ttt-number-selected')[0].classList.remove('ttt-number-selected');
                        number?.classList.add('ttt-number-selected');
                        if (number?.textContent) {
                            this.selectedNumber = parseInt(number.textContent);
                        }
                    } else {
                        number?.classList.remove('ttt-number-selected');
                        this.selectedNumber = 0;
                    }
                    // callback to handleMove
                    if (this.selectedSquare != -1 && this.selectedNumber != 0) {
                        console.log(`Selected square: ${this.selectedSquare} and number: ${this.selectedNumber}`);
                        this.handleMove({
                            'space': this.selectedSquare,
                            'play': this.selectedNumber,
                        });
                    }
                });
            }
        }
    }

    protected handleMove(data: any): void {

        // Update plays and spaces arrays
        this.plays.push(data.play);
        this.spaces[data.space] = data.play;

        // Update the board
        for (let i = 0; i < this.spaces.length; i++) {
            let square = document.getElementById(`square${i}`);
            if (square) {
                square.classList.remove('ttt-square-selected');
                if (this.spaces[i] != 0) {
                    square.textContent = this.spaces[i].toString();
                } else {
                    square.textContent = '';
                }
            }
        }
        
        // Update the numbers
        this.playerOneContent.innerHTML = '';
        this.playerTwoContent.innerHTML = '';
        
        for (let i = 1; i < 10; i++) {
            if (!this.plays.includes(i)) {
                let number = document.createElement('div');
                number.classList.add('ttt-number');
                number.textContent = i.toFixed(0);
                number.id = `number${i}`;
                number.classList.remove('ttt-number-selected');
                if (i % 2 == 0) {
                    this.playerTwoContent.append(number);
                } else {
                    this.playerOneContent.append(number);
                }
            }
        }

        
        // Check for win
        this.checkWin();
        
        // Update round and selections
        this.round++;
        this.selectedNumber = 0;
        this.selectedSquare = -1;
        
        // Update the player turn and areas
        if (this.round && this.round % 2 == 0) {
            this.playerTwoElement.classList.remove('disabled');
            this.playerOneElement.classList.add('disabled');
            this.player2Turn = true;
            this.player1Turn = false;
        } else {
            this.playerOneElement.classList.remove('disabled');
            this.playerTwoElement.classList.add('disabled');
            this.player1Turn = true;
            this.player2Turn = false;
        }
        // Update event listeners
        this.setUpNumberEventListeners();

    }

    protected checkWin(): void {
        if (this.round < 9) {
            // Run thru winning arrays to check win
            for (let i of this.winningArrays) {
                let temp: Array<number> = [];
                for (let j of i) {
                    if (this.spaces[j] != 0) {
                        temp.push(this.spaces[j]);
                    }
                }
                if (temp.length == 3 && temp.reduce((a, b) => a + b, 0) == 15) {
                    this.winLine = i;
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
                this.playerOneElement.innerHTML = '';
                this.playerTwoElement.innerHTML = '';
                this.playerOneElement.textContent = 'TIE';
                break;
            case 2:
                if (this.player1Turn) {
                    this.playerTwoElement.innerHTML = '';
                    this.playerOneContent.innerHTML = 'WINS';
                    this.playerOneElement.classList.remove('disabled');
                } else {
                    this.playerOneElement.innerHTML = '';
                    this.playerTwoContent.innerHTML = 'WINS';
                    this.playerTwoElement.classList.remove('disabled');
                }
                break;
            default:
                break;
        }

        for (let x = 0; x < this.winLine.length; x++) {
            let square = document.getElementById(`square${this.winLine[x]}`);
            if (square) {
                square.classList.add('ttt-win-highlight');
            }
        }
    }
}