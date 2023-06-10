import { addCsrfTokenToForm } from "./utils";
import { LobbySocket } from "./LobbySocket";

export abstract class MultiplayerLobby {
    protected app: HTMLElement;
    protected contextData: HTMLElement;
    protected gameId: string;
    protected privacy: string;
    protected playerOne: string;
    protected playerTwo: string;
    protected playerOneID: string;
    protected playerTwoID: string;
    protected playerOneStatus: string;
    protected playerTwoStatus: string;
    protected gameStatus: string;
    public round: string;
    public current: string;

    protected card: HTMLElement;
    protected lobbyTitle: HTMLElement;
    protected players: HTMLElement;
    protected options: HTMLElement;

    public readyForm: HTMLFormElement;
    public unreadyForm: HTMLFormElement;
    public continueForm: HTMLFormElement;
    public leaveForm: HTMLFormElement;

    protected readyButton: HTMLElement;
    protected unreadyButton: HTMLElement;
    protected continueButton: HTMLElement;
    protected leaveButton: HTMLElement;

    protected isMobile: boolean;

    private csrfToken: string;

    protected socket: LobbySocket;

    constructor(app: HTMLElement, data: HTMLElement, csrfToken: string) {
        // House-keeping
        this.app = app;
        this.contextData = data;
        this.csrfToken = csrfToken;
        this.isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;
        if (!this.isMobile) {
            this.app.classList.add('apollos-flex-row');
        } else {
            this.app.classList.add('apollos-flex-col');
        }

        // Setting context data
        this.gameId = this.contextData.dataset.gameId || '';
        this.privacy = this.contextData.dataset.privacy || 'Public';
        this.playerOne = this.contextData.dataset.p1 || 'Player 1';
        this.playerTwo = this.contextData.dataset.p2 || 'Player 2';
        this.playerOneID = this.contextData.dataset.p1ID || '0';
        this.playerTwoID = this.contextData.dataset.p2ID || '0';
        this.playerOneStatus = this.contextData.dataset.p1Status || 'UNREADY';
        this.playerTwoStatus = this.contextData.dataset.p2Status || 'UNREADY';
        this.gameStatus = this.contextData.dataset.status || 'LOBBY';
        this.round = this.contextData.dataset.round || '0';
        this.current = this.contextData.dataset.current || '0';

        this.card = document.createElement('div');
        this.card.classList.add('apollos-flex-col');

        this.lobbyTitle = document.createElement('div');
        this.lobbyTitle.classList.add('apollos-flex-row');
        this.lobbyTitle.classList.add('apollos-title');
        this.lobbyTitle.textContent = `${this.privacy} Game #${this.gameId}`;

        this.players = document.createElement('div');
        this.players.classList.add('apollos-flex-col');

        let playerOneContainer = document.createElement('div');
        playerOneContainer.classList.add('apollos-flex-row');

        let p1 = document.createElement('div');
        p1.classList.add('apollos-margin-sb');
        p1.textContent = `Player 1: ${this.playerOne}`;

        let playerTwoContainer = document.createElement('div');
        playerTwoContainer.classList.add('apollos-flex-row');

        let p2 = document.createElement('div');
        p2.classList.add('apollos-margin-sb');
        p2.textContent = `Player 2: ${this.playerTwo}`;

        playerOneContainer.appendChild(p1);
        playerTwoContainer.appendChild(p2);
        this.players.appendChild(playerOneContainer);
        this.players.appendChild(playerTwoContainer);

        this.options = document.createElement('div');
        this.options.classList.add('apollos-flex-row');
        this.options.id = 'lobbyOptions';

        this.readyForm = document.createElement('form');
        this.readyForm.classList.add('apollos-flex-col');
        this.readyForm.id = 'startForm';
        this.readyForm.setAttribute('action', `start`);
        this.readyForm.setAttribute('method', 'post');

        this.readyButton = document.createElement('input');
        this.readyButton.classList.add('apollos-button');
        this.readyButton.setAttribute('type', 'submit');
        this.readyButton.setAttribute('value', 'START');

        this.unreadyForm = document.createElement('form');
        this.unreadyForm.classList.add('apollos-flex-col');
        this.unreadyForm.id = 'startForm';
        this.unreadyForm.setAttribute('action', `start`);
        this.unreadyForm.setAttribute('method', 'post');

        this.unreadyButton = document.createElement('input');
        this.unreadyButton.classList.add('apollos-button');
        this.unreadyButton.setAttribute('type', 'submit');
        this.unreadyButton.setAttribute('value', 'START');

        this.continueForm = document.createElement('form');
        this.continueForm.classList.add('apollos-flex-col');
        this.continueForm.id = 'startForm';
        this.continueForm.setAttribute('action', `start`);
        this.continueForm.setAttribute('method', 'post');

        this.continueButton = document.createElement('input');
        this.continueButton.classList.add('apollos-button');
        this.continueButton.setAttribute('type', 'submit');
        this.continueButton.setAttribute('value', 'CONTINUE');

        this.leaveForm = document.createElement('form');
        this.leaveForm.classList.add('apollos-flex-col');
        this.leaveForm.id = 'leaveForm';
        this.leaveForm.setAttribute('action', 'leave');

        this.leaveButton = document.createElement('input');
        this.leaveButton.classList.add('apollos-button');
        this.leaveButton.setAttribute('type', 'submit');
        this.leaveButton.setAttribute('value', 'LEAVE');

        this.readyForm.appendChild(this.readyButton);
        this.unreadyForm.appendChild(this.unreadyButton);
        this.continueForm.appendChild(this.continueButton);
        this.leaveForm.appendChild(this.leaveButton);

        addCsrfTokenToForm(this.readyForm, this.csrfToken);
        addCsrfTokenToForm(this.unreadyForm, this.csrfToken);
        addCsrfTokenToForm(this.continueForm, this.csrfToken);
        addCsrfTokenToForm(this.leaveForm, this.csrfToken);

        
        this.handleOptions();

        this.card.appendChild(this.lobbyTitle);
        this.card.appendChild(this.players);
        this.card.appendChild(this.options);

        this.socket = new LobbySocket(this.gameId, this.handleLobby.bind(this));
        this.socket.connect();
    }

    public handleOptions(): void {
        this.options.innerHTML = '';
        switch (this.gameStatus) {
            case 'LOBBY':
            case 'REMATCH':
                if (this.current === this.playerOneID && this.playerOneStatus == 'UNREADY') {
                    this.options.appendChild(this.readyForm);
                } else if (this.current === this.playerOneID && this.playerOneStatus == 'READY') {
                    this.options.appendChild(this.unreadyForm);
                } else if (this.current === this.playerTwoID && this.playerTwoStatus == 'UNREADY') {
                    this.options.appendChild(this.readyForm);
                } else if (this.current === this.playerTwoID && this.playerTwoStatus == 'READY') {
                    this.options.appendChild(this.unreadyForm);
                }
                break;
            case 'IN-GAME':
                if (this.current === this.playerOneID && this.playerOneStatus == 'IN-GAME') {
                    this.options.appendChild(this.continueForm);
                } else if (this.current === this.playerTwoID && this.playerTwoStatus == 'IN-GAME') {
                    this.options.appendChild(this.continueForm);
                }
                break;
            default:
                break;
        }
        this.options.appendChild(this.leaveForm);
    }

    protected abstract handleLobby(data: any): void;
    protected abstract updateLobby(data: any): void;
}