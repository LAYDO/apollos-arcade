import { apollosLocalMessage, getCurrentUserId } from "./utils";

export class MagicFifteenBoard {
    public player1Turn: boolean;
    public player2Turn: boolean;

    private app: Element;
    public gameTitle: Element;
    public currentRound: Element;
    private board: Element;
    private squares: Element;
    private playerNumbers: Element;
    public numbersOdd: Element;
    public numbersEven: Element;
    public titleEven: Element
    public titleOdd: Element;
    public playerEven: Element;
    public playerOdd: Element;
    public playerArea: Element;

    public round: number;
    public plays: Array<number>;
    public spaces: Array<number>;

    private isMobile: boolean;

    public selectedNumber: number;
    public selectedSquare: number;

    constructor(board: HTMLElement, app: HTMLElement) {
        this.player1Turn = true;
        this.player2Turn = false;
        this.app = app;
        this.board = board;
        this.plays = [];
        this.spaces = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;
        this.selectedNumber = 0;
        this.selectedSquare = -1;

        const contextData = document.getElementById('context-data');
        if (contextData?.dataset.plays) {
            this.plays = JSON.parse(contextData?.dataset.plays);
        }
        if (contextData?.dataset.spaces) {
            this.spaces = JSON.parse(contextData?.dataset.spaces);
        }
        const gameId = contextData?.dataset.gameId;
        this.round = contextData?.dataset.round ? parseInt(contextData?.dataset.round) : 0;
        const player1 = contextData?.dataset.player1;
        const player2 = contextData?.dataset.player2;
        const p1 = contextData?.dataset.p1;
        const p2 = contextData?.dataset.p2;
        const privacy = contextData?.dataset.privacy;

        if (!this.isMobile) {
            this.board.classList.add('ttt-row');
        }

        this.gameTitle = document.createElement('div');
        this.gameTitle.classList.add('mft-row');
        this.gameTitle.classList.add('mft-title');
        this.gameTitle.id = 'game_title';
        this.gameTitle.textContent = `${privacy} Game #${gameId}`;

        this.currentRound = document.createElement('div');
        this.currentRound.classList.add('mft-row');
        this.currentRound.classList.add('mft-round');
        this.currentRound.id = 'current_round';
        this.currentRound.textContent = `Round: ${this.round}`;


        this.squares = document.createElement('div');
        this.squares.classList.add('ttt-col');
        this.squares.id = 'mftSquares';
        this.squares.setAttribute('game_id', gameId || '');
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

        this.playerArea = document.createElement('div');
        this.playerArea.classList.add('ttt-col-b');
        this.playerArea.id = 'ftPlayerArea';

        this.playerNumbers = document.createElement('div');
        this.playerNumbers.classList.add('ttt-row-b');

        this.numbersOdd = document.createElement('div');
        this.numbersOdd.classList.add('ttt-row-numbers');

        this.numbersEven = document.createElement('div');
        this.numbersEven.classList.add('ttt-row-numbers');

        for (let i = 1; i < 10; i++) {
            if (this.plays.length >= 0 && !this.plays.includes(i)) {
                let number = document.createElement('div');
                number.classList.add('ttt-number');
                number.textContent = `${i}`;
                number.id = `number${i}`;
                if (i % 2 == 0) {
                    this.numbersEven.append(number);
                } else {
                    this.numbersOdd.append(number);
                }
            }
        }

        this.titleOdd = document.createElement('div');
        this.titleOdd.classList.add('ttt-player');
        this.titleOdd.textContent = player1?.toString() || 'Player 1';

        this.titleEven = document.createElement('div');
        this.titleEven.classList.add('ttt-player');
        this.titleEven.textContent = player2?.toString() || 'Player 2';

        this.playerOdd = document.createElement('div');
        this.playerOdd.classList.add('ttt-col-top');
        this.playerOdd.append(this.titleOdd);
        this.playerOdd.append(this.numbersOdd);
        this.playerOdd.id = 'player_one_numbers';

        this.playerEven = document.createElement('div');
        this.playerEven.classList.add('ttt-col-top');
        this.playerEven.append(this.titleEven);
        this.playerEven.append(this.numbersEven);
        this.playerEven.id = 'player_two_numbers';

        if (this.round && this.round % 2 == 0) {
            this.playerEven.classList.remove('disabled');
            this.playerOdd.classList.add('disabled');
            this.player2Turn = true;
            this.player1Turn = false;
        } else {
            this.playerOdd.classList.remove('disabled');
            this.playerEven.classList.add('disabled');
            this.player1Turn = true;
            this.player2Turn = false;
        }

        this.playerNumbers.append(this.playerOdd);
        this.playerNumbers.append(this.playerEven);

        this.playerArea.append(this.playerNumbers);

        this.app.prepend(this.currentRound);
        this.app.prepend(this.gameTitle);
        this.board.append(this.squares);
        this.board.append(this.playerArea);
    }

    public setUpSquareEventListeners(callback: Function) {
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
                            callback(this.selectedSquare, this.selectedNumber);
                        }
                    } catch (e: any) {
                        apollosLocalMessage(e, 'error');
                    }
                });
            }
        }
    }

    public setUpNumberEventListeners(callback: Function) {
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
                        callback(this.selectedSquare, this.selectedNumber);
                    }
                });
            }
        }
    }

    public takeTurn(data: any, callback: Function) {
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
            this.playerEven.classList.remove('disabled');
            this.playerOdd.classList.add('disabled');
            this.player2Turn = true;
            this.player1Turn = false;
        } else {
            this.playerOdd.classList.remove('disabled');
            this.playerEven.classList.add('disabled');
            this.player1Turn = true;
            this.player2Turn = false;
        }

        // Clear the player number areas
        this.numbersOdd.innerHTML = '';
        this.numbersEven.innerHTML = '';

        // Update the numbers
        for (let i = 1; i < 10; i++) {
            if ((i % 2 != 0) && !data['plays'].includes(i)) {
                let number = document.createElement('div');
                number.classList.add('ttt-number');
                number.id = `number${i}`;
                number.textContent = `${i}`;
                number.classList.remove('ttt-number-selected');
                this.numbersOdd.append(number);
            } else if ((i % 2 == 0) && !data['plays'].includes(i)) {
                let number = document.createElement('div');
                number.classList.add('ttt-number');
                number.id = `number${i}`;
                number.textContent = `${i}`;
                number.classList.remove('ttt-number-selected');
                this.numbersEven.append(number);
            }
        }

        // Set up the numbers' event listeners
        this.selectedSquare = -1;
        this.selectedNumber = 0;
        this.setUpNumberEventListeners(callback);
    }
}