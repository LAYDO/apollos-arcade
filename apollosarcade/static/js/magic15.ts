class FifteenCard {
    private csrfToken: string;
    private parentElement: Element;
    private cardContainer: Element;
    private title: Element;
    private cardForm: Element;
    private radio1: Element;
    private radio2: Element;
    private textLabel: Element;
    private textOption: Element;
    private button: Element;
    private passwordLabel: Element;
    private password: Element;

    constructor(title: string, radio1: string, radio2: string, button: string, _element: Element, callback: Function, csrfToken: string) {
        this.csrfToken = csrfToken;
        // Parent and card container, taking on apollos-container styling
        this.parentElement = _element;
        this.cardContainer = document.createElement('div');
        this.cardContainer.classList.add('apollos-container');

        // Typical title for apollos-container
        this.title = document.createElement('div');
        this.title.classList.add('container-title');
        this.title.textContent = title;

        // Form
        this.cardForm = document.createElement('form');
        this.cardForm.classList.add('mft-col');
        this.cardForm.setAttribute('action', button.toLowerCase());
        this.cardForm.setAttribute('method', 'post');

        // Radio row
        let radRow = document.createElement('div');
        radRow.classList.add('mft-row-b');

        // Radio columns
        let radCol1 = document.createElement('div');
        radCol1.classList.add('mft-col');
        radCol1.setAttribute('style', 'margin-right:1rem;'); // For a little space between the lads

        let radCol2 = document.createElement('div');
        radCol2.classList.add('mft-col');

        // Radio options
        this.radio1 = document.createElement('input');
        this.radio1.setAttribute('type', 'radio');
        this.radio1.id = radio1.toLowerCase();
        this.radio1.setAttribute('name', button.toLowerCase());
        this.radio1.setAttribute('value', radio1);
        this.radio1.addEventListener('click', () => {
            this.hideText();
        });

        let r1 = document.createElement('label');
        r1.setAttribute('for', radio1.toLowerCase());
        r1.textContent = radio1;

        radCol1.append(r1);
        radCol1.append(this.radio1);

        let break1 = document.createElement('br');

        this.radio2 = document.createElement('input');
        this.radio2.setAttribute('type', 'radio');
        this.radio2.id = radio2.toLowerCase();
        this.radio2.setAttribute('name', button.toLowerCase());
        this.radio2.setAttribute('value', radio2);
        this.radio2.addEventListener('click', () => {
            this.showText();
        });

        let r2 = document.createElement('label');
        r2.setAttribute('for', radio2.toLowerCase());
        r2.textContent = radio2;

        radCol2.append(r2);
        radCol2.append(this.radio2);

        radRow.append(radCol1);
        radRow.append(radCol2);
        // Text option label
        this.textLabel = document.createElement('label');
        this.textLabel.setAttribute('for', `${button.toLowerCase()}TextOption`);
        this.textLabel.textContent = button.toLowerCase() == 'create' ? 'Password' : 'Lobby Number';
        this.textLabel.setAttribute('style', 'display: none;');
        this.textLabel.id = `${button.toLowerCase()}TextLabel`;
        
        // Text option
        this.textOption = document.createElement('input');
        this.textOption.setAttribute('style', 'display: none;');
        this.textOption.setAttribute('type', 'text');
        this.textOption.setAttribute('autocomplete', 'off');
        this.textOption.setAttribute('name', `${button.toLowerCase()}_option`);
        this.textOption.id = `${button.toLowerCase()}TextOption`;
        this.textOption.classList.add('mft-text');
        this.textOption.setAttribute('placeholder', button.toLowerCase() == 'create' ? 'Password' : 'Lobby Number');

        // Password label
        this.passwordLabel = document.createElement('label');
        this.passwordLabel.setAttribute('for', `${button.toLowerCase()}_password`);
        this.passwordLabel.textContent = 'Password';
        this.passwordLabel.setAttribute('style', 'display: none;');
        this.passwordLabel.id = `${button.toLowerCase()}_password_label`;

        // Password
        this.password = document.createElement('input');
        this.password.setAttribute('style', 'display: none;');
        this.password.setAttribute('type', 'password');
        this.password.setAttribute('name', 'password');
        this.password.id = `${button.toLowerCase()}_password`;
        this.password.classList.add('mft-text');

        let buttRow = document.createElement('div');
        buttRow.classList.add('mft-row-b');

        this.button = document.createElement('input');
        this.button.classList.add('mft-button');
        this.button.setAttribute('type', 'submit');
        this.button.setAttribute('value', button);

        let cancel = document.createElement('div');
        cancel.classList.add('mft-button');
        cancel.textContent = 'CANCEL';
        cancel.addEventListener('click', () => {
            callback();
        });

        buttRow.append(this.button);
        buttRow.append(cancel);

        this.cardForm.append(radRow);
        this.cardForm.append(break1);
        this.cardForm.append(break1);
        this.cardForm.append(this.textLabel);
        this.cardForm.append(this.textOption);
        if (button.toLowerCase() == 'join') {
            this.cardForm.append(break1);
            this.cardForm.append(this.passwordLabel)
            this.cardForm.append(this.password);
        }
        this.cardForm.append(break1);
        this.cardForm.append(buttRow);
        this.addCsrfTokenToForm(this.cardForm);

        this.cardContainer.append(this.title);
        this.cardContainer.append(this.cardForm);

        this.parentElement.append(this.cardContainer);
    }

    show() {
        this.parentElement.setAttribute('style', 'display:block;');
    }

    hide() {
        this.parentElement.setAttribute('style', 'display:none;');
    }

    showText() {
        this.textLabel.setAttribute('style', 'display: inherit;');
        this.textOption.setAttribute('style', 'display: inherit;');
        this.passwordLabel.setAttribute('style', 'display: inherit;');
        this.password.setAttribute('style', 'display: inherit;');
    }

    hideText() {
        this.textLabel.setAttribute('style', 'display: none;');
        this.textOption.setAttribute('style', 'display: none;');
        this.passwordLabel.setAttribute('style', 'display: none;');
        this.password.setAttribute('style', 'display: none;');
    }

    addCsrfTokenToForm(formElement: Element) {
            const csrfInput = document.createElement("input");
            csrfInput.type = "hidden";
            csrfInput.name = "csrfmiddlewaretoken";
            csrfInput.value = this.csrfToken;

            formElement.appendChild(csrfInput);
        }

}

// I want to make a class for the ttt-board within magic_fifteen_game.html
class MagicFifteenBoard {
    public player1Turn: boolean;
    public player2Turn: boolean;

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

    constructor(board: HTMLElement) {
        this.round = 0;
        this.player1Turn = true;
        this.player2Turn = false;
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
        const round = contextData?.dataset.round;
        const player1 = contextData?.dataset.player1;
        const player2 = contextData?.dataset.player2;
        const p1 = contextData?.dataset.p1;
        const p2 = contextData?.dataset.p2;
        const privacy = contextData?.dataset.privacy;
        const user = contextData?.dataset.user;

        if (!this.isMobile) {
            this.board.classList.add('ttt-row');
        }

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

        if (round && parseInt(round) % 2 == 0) {
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

        this.board.append(this.squares);
        this.board.append(this.playerArea);
    }

    public setUpSquareEventListeners(callback: Function) {
        // Construct and append squares to board
        // this.squares.innerHTML = '';
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
                        console.log(e);
                        let messageDiv = document.getElementById('messageModal');
                        let messageContent = document.getElementById('messageContent');
                        if (messageDiv && messageContent != null) {
                            messageContent.textContent = e;
                            messageContent.classList.add('alert-error');
                            messageDiv.style.display = 'block';
                        }
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
}