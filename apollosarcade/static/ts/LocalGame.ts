export abstract class LocalGame {

    protected lastRender = 0;
    protected board: HTMLElement;
    protected boardArea: HTMLElement;
    protected playerArea: HTMLElement;
    protected playerOneElement: HTMLElement;
    protected playerTwoElement: HTMLElement;
    protected oneTitle: HTMLElement;
    protected twoTitle: HTMLElement;
    protected playerOneContent: HTMLElement;
    protected playerTwoContent: HTMLElement;
    protected restartButton: HTMLElement;

    public player1Turn: boolean;
    public player2Turn: boolean;

    protected round: number;

    private isMobile: boolean;

    constructor(board: HTMLElement) {
        this.board = board;
        this.board.innerHTML = '';

        this.round = 0;
        this.player1Turn = true;
        this.player2Turn = false;

        this.isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;
        if (!this.isMobile) {
            this.board.classList.add('ttt-row');
        }

        this.boardArea = document.createElement('div');
        this.boardArea.classList.add('ttt-col');
        this.boardArea.classList.add('board-area');

        this.playerArea = document.createElement('div');
        this.playerArea.classList.add('ttt-col-b');

        this.playerOneElement = document.createElement('div');
        this.playerOneElement.classList.add('ttt-col-top');

        this.oneTitle = document.createElement('div');
        this.oneTitle.classList.add('ttt-player');
        this.oneTitle.textContent = 'Player 1';

        this.playerOneContent = document.createElement('div');
        this.playerOneContent.classList.add('apollos-flex-row');

        this.playerOneElement.append(this.oneTitle);
        this.playerOneElement.append(this.playerOneContent);

        this.playerTwoElement = document.createElement('div');
        this.playerTwoElement.classList.add('ttt-col-top');

        this.twoTitle = document.createElement('div');
        this.twoTitle.classList.add('ttt-player');
        this.twoTitle.textContent = 'Player 2';

        this.playerTwoContent = document.createElement('div');
        this.playerTwoContent.classList.add('apollos-flex-row');

        this.playerTwoElement.append(this.twoTitle);
        this.playerTwoElement.append(this.playerTwoContent);

        let playerRow: Element = document.createElement('div');
        playerRow.classList.add('ttt-row');

        playerRow.append(this.playerOneElement);
        playerRow.append(this.playerTwoElement);

        this.playerArea.append(playerRow);

        let row: Element = document.createElement('div');
        row.classList.add('ttt-row');

        this.restartButton = document.createElement('div');
        this.restartButton.classList.add('ttt-restart');
        this.restartButton.innerHTML = 'Restart';

        row.append(this.restartButton);
        this.playerArea.append(row);

        this.board.append(this.boardArea);
        this.board.append(this.playerArea);

        window.requestAnimationFrame(this.loop.bind(this));
    }
    
    protected loop(timestamp: number): void {
        let progress = timestamp - this.lastRender;
        this.handleMove(progress);
        this.checkWin();
        this.lastRender = timestamp;
        window.requestAnimationFrame((timestamp) => this.loop.bind(this));
    }

    protected abstract handleMove(progress: number): void;
    protected abstract checkWin(): void;
}