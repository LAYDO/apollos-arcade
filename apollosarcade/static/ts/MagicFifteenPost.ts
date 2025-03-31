import { MultiplayerPost } from "./MultiplayerPost";
export class MagicFifteenPost extends MultiplayerPost {

    private squares: Element;
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


    constructor(app: HTMLElement, data: HTMLElement) {
        super(app, data);
        this.spaces = [0, 0, 0, 0, 0, 0, 0, 0, 0];
     
        if (this.contextData.dataset.spaces) {
            this.spaces = JSON.parse(this.contextData.dataset.spaces);
        }

        this.squares = document.createElement('div');
        this.squares.classList.add('pt-col');
        this.squares.id = 'mftSquares';
        this.squares.setAttribute('game_id', this.gameId || '');
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
        this.resultsContainer.append(this.squares);
        this.drawLine();
    }

    public drawLine() {
        if (this.spaces.reduce((a, b) => a + b, 0) > 0) {
            let win: number[] | null = null;
            if (this.round <= 10) {
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
}