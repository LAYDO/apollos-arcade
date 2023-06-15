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
    public p1Check: HTMLElement;
    public p2Check: HTMLElement;
    protected gameStatus: string;
    public round: string;
    public current: string;

    protected card: HTMLElement;
    protected lobbyTitle: HTMLElement;
    protected players: HTMLElement;
    protected options: HTMLElement;

    protected readyButton: HTMLElement;
    protected unreadyButton: HTMLElement;
    protected continueButton: HTMLElement;
    protected leaveButton: HTMLElement;

    protected isMobile: boolean;

    protected socket: LobbySocket;

    constructor(app: HTMLElement, data: HTMLElement) {
        // House-keeping
        this.app = app;
        this.contextData = data;
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
        this.playerOneID = this.contextData.dataset.p1Id || '0';
        this.playerTwoID = this.contextData.dataset.p2Id || '0';
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
        p1.id = 'playerOne';
        p1.textContent = `Player 1: ${this.playerOne}`;

        let playerTwoContainer = document.createElement('div');
        playerTwoContainer.classList.add('apollos-flex-row');

        let p2 = document.createElement('div');
        p2.classList.add('apollos-margin-sb');
        p2.id = 'playerTwo';
        p2.textContent = `Player 2: ${this.playerTwo}`;

        this.p1Check = document.createElement('span');
        this.p1Check.classList.add('fa-solid');
        this.p1Check.classList.add('fa-check');
        this.p1Check.style.color = 'limegreen';
        this.p1Check.style.visibility = 'hidden';

        this.p2Check = document.createElement('span');
        this.p2Check.classList.add('fa-solid');
        this.p2Check.classList.add('fa-check');
        this.p2Check.style.color = 'limegreen';
        this.p2Check.style.visibility = 'hidden';

        playerOneContainer.appendChild(p1);
        playerOneContainer.appendChild(this.p1Check);
        playerTwoContainer.appendChild(p2);
        playerTwoContainer.appendChild(this.p2Check);
        this.players.appendChild(playerOneContainer);
        this.players.appendChild(playerTwoContainer);

        this.options = document.createElement('div');
        this.options.classList.add('apollos-flex-row');
        this.options.id = 'lobbyOptions';

        this.readyButton = document.createElement('div');
        this.readyButton.classList.add('apollos-button');
        this.readyButton.setAttribute('value', 'ready');
        this.readyButton.textContent = 'READY';

        this.unreadyButton = document.createElement('div');
        this.unreadyButton.classList.add('apollos-button');
        this.unreadyButton.setAttribute('value', 'unready');
        this.unreadyButton.textContent = 'UNREADY';

        this.continueButton = document.createElement('div');
        this.continueButton.classList.add('apollos-button');
        this.continueButton.setAttribute('value', 'CONTINUE');
        this.continueButton.textContent = 'CONTINUE';

        this.leaveButton = document.createElement('div');
        this.leaveButton.classList.add('apollos-button');
        this.leaveButton.setAttribute('value', 'LEAVE');
        this.leaveButton.textContent = 'LEAVE';

        this.card.appendChild(this.lobbyTitle);
        this.card.appendChild(this.players);
        this.card.appendChild(this.options);
        
        this.app.appendChild(this.card);
        
        this.socket = new LobbySocket(this.gameId, this.handleLobby.bind(this), this.contextData.dataset);
        this.socket.connect();

        // this.handleOptions(this.updateLobby.bind(this));
    }

    public handleOptions(callback: Function): void {
        this.options.innerHTML = '';
        switch (this.gameStatus) {
            case 'LOBBY':
            case 'REMATCH':
                if (this.current == this.playerOneID) {
                    if (this.playerOneStatus == 'UNREADY') {
                        this.readyButton.addEventListener('click', () => {
                            callback({
                                'type': 'ready',
                            })
                        });
                        this.options.appendChild(this.readyButton);
                    } else if (this.playerOneStatus == 'READY') {
                        this.unreadyButton.addEventListener('click', () => {
                            callback({
                                'type': 'unready',
                            })
                        });
                        this.options.appendChild(this.unreadyButton);
                    }
                } else if (this.current == this.playerTwoID) {
                    if (this.playerTwoStatus == 'UNREADY') {
                        this.readyButton.addEventListener('click', () => {
                            callback({
                                'type': 'ready',
                            })
                        });
                        this.options.appendChild(this.readyButton);
                    } else if (this.playerTwoStatus == 'READY') {
                        this.unreadyButton.addEventListener('click', () => {
                            callback({
                                'type': 'unready',
                            })
                        });
                        this.options.appendChild(this.unreadyButton);
                    }
                }
                if (this.playerOneStatus == 'READY') {
                    this.p1Check.style.visibility = 'visible';
                } else if (this.playerOneStatus == 'UNREADY') {
                    this.p1Check.style.visibility = 'hidden';
                }
                if (this.playerTwoStatus == 'READY') {
                    this.p2Check.style.visibility = 'visible';
                } else if (this.playerTwoStatus == 'UNREADY') {
                    this.p2Check.style.visibility = 'hidden';
                }
                break;
            case 'IN-GAME':
                if (this.current == this.playerOneID) {
                    if (this.playerOneStatus == 'IN-GAME') {
                        this.continueButton.addEventListener('click', () => {
                            callback({
                                'type': 'continue',
                            })
                        });
                        this.options.appendChild(this.continueButton);
                    }
                } else if (this.current == this.playerTwoID) {
                    if (this.playerTwoStatus == 'IN-GAME') {
                        this.continueButton.addEventListener('click', () => {
                            callback({
                                'type': 'continue',
                            })
                        });
                        this.options.appendChild(this.continueButton);
                    }
                }
                break;
            default:
                break;
        }
        this.leaveButton.addEventListener('click', () => {
            callback({
                'type': 'leave',
            })
        });
        this.options.appendChild(this.leaveButton);
    }

    protected abstract handleLobby(data: any): void;
    protected abstract updateLobby(data: any): void;
}