import { PostSocket } from "./PostSocket";
import { getCurrentUserId } from "./utils";

export class MultiplayerPost {

    protected app: Element;
    protected contextData: HTMLElement;
    protected gameId: string;
    protected privacy: string;
    protected gameTitle: Element;
    protected winnerElement: Element;
    protected loserElement: Element;
    public resultsContainer: HTMLElement;

    protected rematchButton: HTMLElement;
    protected leaveButton: HTMLElement;

    protected playerOneStatus: string;
    protected playerTwoStatus: string;
    public p1Check: HTMLElement;
    public p2Check: HTMLElement;

    public winner: string;
    public winnerText: Element;
    public loser: string;
    public loserText: Element;
    public round: number;

    protected isMobile: boolean;

    protected socket: PostSocket;

    constructor(app: HTMLElement, data: HTMLElement) {
        this.app = app;
        this.contextData = data;
        this.isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;

        this.gameId = this.contextData.dataset.gameId || '';
        this.round = this.contextData.dataset.round ? parseInt(this.contextData.dataset.round) : 0;
        this.privacy = this.contextData.dataset.privacy || 'Public';
        this.winner = this.contextData.dataset.winner || '';
        this.loser = this.contextData.dataset.loser || '';
        this.playerOneStatus = this.contextData.dataset.p1Status || 'UNREADY';
        this.playerTwoStatus = this.contextData.dataset.p2Status || 'UNREADY';

        if (!this.isMobile) {
            this.app.classList.add('mft-row');
        } else {
            this.app.classList.add('apollos-flex-col');
        }

        this.resultsContainer = document.createElement('div');
        this.resultsContainer.classList.add('apollos-flex-col');

        let buttonContainer = document.createElement('div');
        buttonContainer.classList.add('apollos-flex-col');

        this.gameTitle = document.createElement('div');
        this.gameTitle.classList.add('mft-row');
        this.gameTitle.classList.add('mft-title');
        this.gameTitle.id = 'game_title';
        this.gameTitle.textContent = `${this.privacy} Post Game #${this.gameId}`;

        this.resultsContainer = document.createElement('div');
        this.resultsContainer.classList.add('apollos-flex-col');

        this.winnerElement = document.createElement('div');
        this.winnerElement.classList.add('mft-row-b');
        this.winnerElement.classList.add('mft-margin-sb');
        this.winnerElement.id = 'winner';

        this.loserElement = document.createElement('div');
        this.loserElement.classList.add('mft-row-b');
        this.loserElement.classList.add('mft-margin-sb');
        this.loserElement.id = 'loser';

        this.winnerText = document.createElement('div');
        this.winnerText.classList.add('apollos-flex-row');

        this.loserText = document.createElement('div');
        this.loserText.classList.add('apollos-flex-row');

        if (this.round == 10 && this.winner == null) {
            this.winnerElement.textContent = `Draw: ${this.winner}`;
            this.loserElement.textContent = `Draw: ${this.loser}`;
        } else {
            this.winnerText.textContent = `Winner: ${this.winner}`;
            this.loserText.textContent = `Try again: ${this.loser}`;
        }

        this.p1Check = document.createElement('span');
        this.p1Check.classList.add('fa-solid');
        this.p1Check.classList.add('fa-check');
        this.p1Check.style.color = 'limegreen';
        this.p1Check.style.visibility = this.playerOneStatus == 'REMATCH' ? 'visible' : 'hidden';

        this.p2Check = document.createElement('span');
        this.p2Check.classList.add('fa-solid');
        this.p2Check.classList.add('fa-check');
        this.p2Check.style.color = 'limegreen';
        this.p2Check.style.visibility = this.playerTwoStatus == 'REMATCH' ? 'visible' : 'hidden';

        this.winnerElement.append(this.winnerText);
        this.winnerElement.append(this.p1Check);
        this.loserElement.append(this.loserText);
        this.loserElement.append(this.p2Check);

        let lobbyOptions = document.createElement('div');
        lobbyOptions.classList.add('mft-row');
        lobbyOptions.id = 'lobbyOptions';

        this.rematchButton = document.createElement('div');
        this.rematchButton.classList.add('apollos-button');
        this.rematchButton.setAttribute('value', 'REMATCH');
        this.rematchButton.textContent = 'REMATCH';
        this.rematchButton.addEventListener('click', () => {
            this.updatePost({ 'type': 'rematch' });
        });

        this.leaveButton = document.createElement('div');
        this.leaveButton.classList.add('apollos-button');
        this.leaveButton.setAttribute('value', 'LEAVE');
        this.leaveButton.textContent = 'LEAVE';
        this.leaveButton.addEventListener('click', () => {
            this.updatePost({ 'type': 'leave' });
        });

        lobbyOptions.append(this.rematchButton);
        lobbyOptions.append(this.leaveButton);

        buttonContainer.append(lobbyOptions);

        this.resultsContainer.append(this.gameTitle);
        this.resultsContainer.append(this.winnerElement);
        this.resultsContainer.append(this.loserElement);

        this.app.append(this.resultsContainer);
        this.app.append(buttonContainer);

        this.socket = new PostSocket(this.gameId, this.handlePost.bind(this), data);
        this.socket.connect();
    }

    protected handlePost(data: any): void {
        this.playerOneStatus = data.p1Status;
        this.playerTwoStatus = data.p2Status;
        if (this.playerOneStatus == 'REMATCH') {
            this.p1Check.style.visibility = 'visible';
        } else if (this.playerOneStatus == 'POST') {
            this.p1Check.style.visibility = 'hidden';
        }
        if (this.playerTwoStatus == 'REMATCH') {
            this.p2Check.style.visibility = 'visible';
        } else if (this.playerTwoStatus == 'POST') {
            this.p2Check.style.visibility = 'hidden';
        }
    };
    protected updatePost(data: any): void {
        let post = {
            'type': '',
            'message': {
                'game_id': this.gameId,
                'user_id': getCurrentUserId(this.contextData.dataset),
            }
        }
        if (data.type == 'rematch') {
            post.type = 'rematch';
        } else if (data.type == 'leave') {
            post.type = 'leave';
        }
        this.socket.send(JSON.stringify(post));
    };
}