import { MultiplayerGame } from "./MultiplayerGame";
import { apollosLocalMessage, getCurrentUserId } from "./utils";

export class MagicFifteenBoard extends MultiplayerGame {

    private squares: Element;

    public plays: Array<number>;
    public spaces: Array<number>;

    public selectedNumber: number;
    public selectedSquare: number;

    constructor(app: HTMLElement, board: HTMLElement, data: HTMLElement) {
        super(app, board, data);

        this.plays = [];
        this.spaces = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.selectedNumber = 0;
        this.selectedSquare = -1;

        const contextData = document.getElementById('context-data');
        if (contextData?.dataset.plays) {
            this.plays = JSON.parse(contextData?.dataset.plays);
        }
        if (contextData?.dataset.spaces) {
            this.spaces = JSON.parse(contextData?.dataset.spaces);
        }


        this.squares = document.createElement('div');
        this.squares.classList.add('ttt-col');
        this.squares.id = 'mftSquares';
        this.squares.setAttribute('game_id', this.gameId || '');
        let localCount = 0;
        for (let i = 0; i < 3; i++) {
            let squareRow = document.createElement('div');
            squareRow.classList.add('ttt-row');
            squareRow.id = `squareRow${i}`;
            for (let j = 0; j < 3; j++) {
                let square = document.createElement('div');
                square.classList.add('mft-square');
                square.id = `square${localCount}`;
                switch (i) {
                    case 0:
                    case 1:
                        if (j < 2) {
                            square.classList.add('ttt-border-right');
                            square.classList.add('ttt-border-bottom');
                        } else {
                            square.classList.add('ttt-border-bottom');
                        }
                        break;
                    case 2:
                        if (j < 2) {
                            square.classList.add('ttt-border-right');
                        }
                        break;
                    default:
                        break;
                }
                if (this.spaces[localCount] == 0) {
                    square.textContent = '';
                } else {
                    square.textContent = this.spaces[localCount].toString();
                }
                squareRow.append(square);
                localCount++;
            }
            this.squares.append(squareRow);
        }

        for (let i = 1; i < 10; i++) {
            if (this.plays.length >= 0 && !this.plays.includes(i)) {
                let number = document.createElement('div');
                number.classList.add('ttt-number');
                number.textContent = `${i}`;
                number.id = `number${i}`;
                if (i % 2 == 0) {
                    this.playerTwoContent.append(number);
                } else {
                    this.playerOneContent.append(number);
                }
            }
        }

        this.board.prepend(this.squares);
        this.setUpSquareEventListeners();
        this.setUpNumberEventListeners();
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
                            this.makeMove({
                                'space': this.selectedSquare,
                                'play': this.selectedNumber,
                            });
                        }
                    } catch (e: any) {
                        apollosLocalMessage(e, 'error');
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
                    // callback to makeMove
                    if (this.selectedSquare != -1 && this.selectedNumber != 0) {
                        console.log(`Selected square: ${this.selectedSquare} and number: ${this.selectedNumber}`);
                        this.makeMove({
                            'space': this.selectedSquare,
                            'play': this.selectedNumber,
                        });
                    }
                });
            }
        }
    }

    public handleMove(data: any) {
        // Update the current round
        this.round = data['round'];
        this.currentRound.textContent = `Round: ${this.round}`;

        let currentPlayer: number = this.round % 2 == 0 ? data['p2'] : data['p1'];
        if (currentPlayer == getCurrentUserId()) {
            this.app.classList.remove('turn-disable');
        } else {
            this.app.classList.add('turn-disable');
        }

        // Update the spaces on the board
        for (let i = 0; i < data['spaces'].length; i++) {
            let square = document.getElementById(`square${i}`);
            if (square) {
                square.classList.remove('ttt-square-selected');
                if (data['spaces'][i] != 0) {
                    square.textContent = data['spaces'][i];
                } else {
                    square.textContent = '';
                }
            }
        }

        // Update the current player
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

        // Clear the player number areas
        this.playerOneContent.innerHTML = '';
        this.playerTwoContent.innerHTML = '';

        // Update the numbers
        for (let i = 1; i < 10; i++) {
            if ((i % 2 != 0) && !data['plays'].includes(i)) {
                let number = document.createElement('div');
                number.classList.add('ttt-number');
                number.id = `number${i}`;
                number.textContent = `${i}`;
                number.classList.remove('ttt-number-selected');
                this.playerOneContent.append(number);
            } else if ((i % 2 == 0) && !data['plays'].includes(i)) {
                let number = document.createElement('div');
                number.classList.add('ttt-number');
                number.id = `number${i}`;
                number.textContent = `${i}`;
                number.classList.remove('ttt-number-selected');
                this.playerTwoContent.append(number);
            }
        }

        // Set up the numbers' event listeners
        this.selectedSquare = -1;
        this.selectedNumber = 0;
        this.setUpNumberEventListeners();
    }

    protected makeMove(data: any) {
        let move = {
            'type': 'move',
            'message': {
                'game_id': this.gameId,
                'user_id': getCurrentUserId(),
                'space': data['space'],
                'play': data['play'],
            }
        };
        this.socket.send(JSON.stringify(move));
    }
}