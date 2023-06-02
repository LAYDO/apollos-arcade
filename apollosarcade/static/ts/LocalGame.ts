export abstract class LocalGame {

    private game: any;  // Reference to game class
    protected lastRender = 0;
    protected board: HTMLElement;
    protected boardArea: HTMLElement;
    protected playerArea: HTMLElement;
    protected playerOne: HTMLElement;
    protected playerTwo: HTMLElement;
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
        this.game = this;

        this.round = 0;
        this.player1Turn = true;
        this.player2Turn = false;

        this.isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;
        if (!this.isMobile) {
            this.board.classList.add('ttt-row');
        }

        this.boardArea = document.createElement('div');
        this.boardArea.classList.add('ttt-col');

        this.playerArea = document.createElement('div');
        this.playerArea.classList.add('ttt-col-b');

        this.playerOne = document.createElement('div');
        this.playerOne.classList.add('ttt-col-top');

        this.oneTitle = document.createElement('div');
        this.oneTitle.classList.add('ttt-player');
        this.oneTitle.textContent = 'Player 1';

        this.playerOneContent = document.createElement('div');
        this.playerOneContent.classList.add('ttt-player-content');

        this.playerOne.append(this.oneTitle);
        this.playerOne.append(this.playerOneContent);

        this.playerTwo = document.createElement('div');
        this.playerTwo.classList.add('ttt-col-top');

        this.twoTitle = document.createElement('div');
        this.twoTitle.classList.add('ttt-player');
        this.twoTitle.textContent = 'Player 2';

        this.playerTwoContent = document.createElement('div');
        this.playerTwoContent.classList.add('ttt-player-content');

        this.playerTwo.append(this.twoTitle);
        this.playerTwo.append(this.playerTwoContent);

        let playerRow: Element = document.createElement('div');
        playerRow.classList.add('ttt-row');

        playerRow.append(this.playerOne);
        playerRow.append(this.playerTwo);

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
    }

    protected loop(timestamp: number): void {
        let progress = timestamp - this.lastRender;
        this.update(progress);
        this.checkWin();
        this.lastRender = timestamp;
        window.requestAnimationFrame(this.loop.bind(this));
    }
    
    // protected abstract loop(timestamp: number): void;
    protected abstract update(progress: number): void;
    protected abstract checkWin(): void;
}