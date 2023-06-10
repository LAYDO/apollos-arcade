import { GameSocket } from "./GameSocket";
import { LocalGame } from "./LocalGame";
export abstract class MultiplayerGame extends LocalGame{
    protected app: HTMLElement;
    protected contextData: HTMLElement;
    protected currentRound: HTMLElement;
    protected gameTitle: HTMLElement;

    protected privacy: string;
    protected gameId: string;
    protected playerOne: string;
    protected playerTwo: string;

    public socket: GameSocket;

    constructor(app: HTMLElement, board: HTMLElement, data: HTMLElement) {
        super(board);
        this.app = app;
        this.restartButton.style.display = 'none';
        this.contextData = data;

        this.gameId = this.contextData.dataset.gameId || '';
        this.round = parseInt(this.contextData.dataset.round || '0');
        this.privacy = this.contextData.dataset.privacy || 'Public';
        this.playerOne = this.contextData.dataset.player1 || 'Player 1';
        this.playerTwo = this.contextData.dataset.player2 || 'Player 2';

        this.gameTitle = document.createElement('div');
        this.gameTitle.classList.add('apollos-flex-row');
        this.gameTitle.classList.add('apollos-title');
        this.gameTitle.id = 'game_title';
        this.gameTitle.textContent = `${this.privacy} Game #${this.gameId}`;

        this.currentRound = document.createElement('div');
        this.currentRound.classList.add('apollos-flex-row');
        this.currentRound.classList.add('apollos-round');
        this.currentRound.id = 'current_round';
        this.currentRound.textContent = `Round ${this.round}`;
        
        this.app.prepend(this.currentRound);
        this.app.prepend(this.gameTitle);

        this.oneTitle.textContent = this.playerOne;
        this.twoTitle.textContent = this.playerTwo;

        if (this.round && this.round % 2 == 0) {
            this.player1Turn = false;
            this.player2Turn = true;
            this.playerOneElement.classList.add('disabled');
            this.playerTwoElement.classList.remove('disabled');
        } else {
            this.player1Turn = true;
            this.player2Turn = false;
            this.playerOneElement.classList.remove('disabled');
            this.playerTwoElement.classList.add('disabled');
        }

        this.socket = new GameSocket(this.gameId, this.handleMove.bind(this));
        this.socket.connect();
    }
    protected loop(): void { }
    protected handleMove(data: any): void { }
    protected checkWin(): void { }

    protected abstract makeMove(data: any): void;
}