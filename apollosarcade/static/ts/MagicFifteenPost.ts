import { addCsrfTokenToForm } from "./utils";
export class MagicFifteenPost {

    private app: Element;
    private gameTitle: Element;
    private winnerElement: Element;
    private loserElement: Element;
    private squares: Element;
    private csrfToken: string;

    public winner: string;
    public loser: string;
    public round: number;
    public spaces: number[];
    private winningArrays: number[][] = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ]

    private isMobile: boolean;

    constructor(app: HTMLElement, csrfToken: string) {
        this.app = app;
        this.csrfToken = csrfToken;
        this.spaces = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;

        const contextData = document.getElementById('context-data-post');
     
        if (contextData?.dataset.spaces) {
            this.spaces = JSON.parse(contextData?.dataset.spaces);
        }
        const gameId = contextData?.dataset.gameId;
        this.round = contextData?.dataset.round ? parseInt(contextData?.dataset.round) : 0;
        const privacy = contextData?.dataset.privacy;

        this.winner = contextData?.dataset.winner !== undefined ? contextData?.dataset.winner : '';
        this.loser = contextData?.dataset.loser !== undefined ? contextData?.dataset.loser : '';

        if (!this.isMobile) {
            this.app.classList.add('mft-row');
        } else {
            this.app.classList.add('apollos-flex-col');
        }

        let boardContainer = document.createElement('div');
        boardContainer.classList.add('apollos-flex-col');

        let buttonContainer = document.createElement('div');
        buttonContainer.classList.add('apollos-flex-col');

        this.gameTitle = document.createElement('div');
        this.gameTitle.classList.add('mft-row');
        this.gameTitle.classList.add('mft-title');
        this.gameTitle.id = 'game_title';
        this.gameTitle.textContent = `${privacy} Post Game #${gameId}`;

        let outcomeContainer = document.createElement('div');
        outcomeContainer.classList.add('apollos-flex-col');

        this.winnerElement = document.createElement('div');
        this.winnerElement.classList.add('mft-row-b');
        this.winnerElement.classList.add('mft-margin-sb');
        this.winnerElement.id = 'winner';

        this.loserElement = document.createElement('div');
        this.loserElement.classList.add('mft-row-b');
        this.loserElement.classList.add('mft-margin-sb');
        this.loserElement.id = 'loser';

        if (this.round == 10 && this.winner != null) {
            this.winnerElement.textContent = `Draw: ${this.winner}`;
            this.loserElement.textContent = `Draw: ${this.loser}`;
        } else {
            this.winnerElement.textContent = `Winner: ${this.winner}`;
            this.loserElement.textContent = `Try again: ${this.loser}`;
        }

        this.squares = document.createElement('div');
        this.squares.classList.add('pt-col');
        this.squares.id = 'mftSquares';
        this.squares.setAttribute('game_id', gameId || '');
        let localCount = 0;
        for (let i = 0; i < 3; i++) {
            let squareRow = document.createElement('div');
            squareRow.classList.add('pt-row');
            squareRow.id = `squareRow${i}`;
            for (let j = 0; j < 3; j++) {
                let square = document.createElement('div');
                square.classList.add('pt-square');
                square.id = `square${localCount}`;
                switch (i) {
                    case 0:
                    case 1:
                        if (j < 2) {
                            square.classList.add('pt-border-right');
                            square.classList.add('pt-border-bottom');
                        } else {
                            square.classList.add('pt-border-bottom');
                        }
                        break;
                    case 2:
                        if (j < 2) {
                            square.classList.add('pt-border-right');
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

        let lobbyOptions = document.createElement('div');
        lobbyOptions.classList.add('mft-row');
        lobbyOptions.id = 'lobbyOptions';

        let rematchForm = document.createElement('form');
        rematchForm.classList.add('apollos-flex-col');
        rematchForm.id = 'rematchForm';
        rematchForm.setAttribute('action', 'rematch');
        rematchForm.setAttribute('method', 'post');

        let rematchButton = document.createElement('input');
        rematchButton.classList.add('apollos-button');
        rematchButton.setAttribute('type', 'submit');
        rematchButton.setAttribute('value', 'REMATCH');

        let leaveForm = document.createElement('form');
        leaveForm.classList.add('apollos-flex-col');
        leaveForm.id = 'leaveForm';
        leaveForm.setAttribute('action', 'leave');
        leaveForm.setAttribute('method', 'post');

        let leaveButton = document.createElement('input');
        leaveButton.classList.add('apollos-button');
        leaveButton.setAttribute('type', 'submit');
        leaveButton.setAttribute('value', 'LEAVE');

        rematchForm.append(rematchButton);
        leaveForm.append(leaveButton);

        addCsrfTokenToForm(rematchForm, this.csrfToken);
        addCsrfTokenToForm(leaveForm, this.csrfToken);

        lobbyOptions.append(rematchForm);
        lobbyOptions.append(leaveForm);

        let refreshContainer = document.createElement('div');
        refreshContainer.classList.add('mft-refresh');

        let refreshButton = document.createElement('div');
        refreshButton.classList.add('apollos-button');
        refreshButton.addEventListener('click', () => {
            window.location.reload();
        });
        let refreshIcon = document.createElement('span');
        refreshIcon.classList.add('fa-solid');
        refreshIcon.classList.add('fa-rotate');

        refreshButton.append(refreshIcon);
        refreshContainer.append(refreshButton);

        buttonContainer.append(lobbyOptions);
        buttonContainer.append(refreshContainer);

        outcomeContainer.append(this.gameTitle);
        outcomeContainer.append(this.winnerElement);
        outcomeContainer.append(this.loserElement);
        outcomeContainer.append(this.squares);

        boardContainer.append(outcomeContainer);
        boardContainer.append(buttonContainer);
        this.app.append(boardContainer);
    }

    public drawLine() {
        if (this.spaces.reduce((a, b) => a + b, 0) > 0) {
            console.log(`Drawing winning line of squares: ${this.spaces}`);
            let win: number[] | null = null;
            if (this.round <= 9) {
                for (let i of this.winningArrays) {
                    let temp: number[] = [];
                    for (let x of i) {
                        if (this.spaces[x] !== 0) {
                            temp.push(this.spaces[x]);
                        }
                    }
                    if (new Set(temp).size === 3 && temp.reduce((acc, curr) => acc + curr, 0) === 15) {
                        win = i;
                        break;
                    }
                }
            }
            console.log(`Win: ${win}`);
            if (win) {
                for (let x = 0; x < win?.length; x++) {
                    let square = document.getElementById(`square${win[x]}`);
                    if (square) {
                        square.classList.add('mft-win-highlight');
                    }
                }
            }
        }
    }

    // addCsrfTokenToForm(form: HTMLFormElement) {
    //     const csrfToken = document.createElement('input');
    //     csrfToken.setAttribute('type', 'hidden');
    //     csrfToken.setAttribute('name', 'csrfmiddlewaretoken');
    //     csrfToken.setAttribute('value', this.csrfToken);
    //     form.append(csrfToken);
    // }
}