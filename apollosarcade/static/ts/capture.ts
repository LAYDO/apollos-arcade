import { LocalGame } from "./LocalGame";

export class Capture extends LocalGame {

    public plays: Array<number>;
    protected rows: number = 11;
    protected cols: number = 9;
    private squareArrays: Array<Array<number>>;

    constructor(board: HTMLElement) {
        super(board);
        this.squareArrays = new Array(this.rows * this.cols).fill(null).map(() => Array(5).fill(0));
        this.plays = [];

        // this.boardArea.style.width = '50%';
        let width = this.boardArea.clientWidth;
        let spacing = width / 10;

        for (let j = 0; j <= this.rows; j++) {
            let dotRow = document.createElement('div');
            dotRow.classList.add('capture-row');
            for (let i = 0; i <= this.cols; i++) {
                let spaceCount = j * this.cols + i;
                let dot = document.createElement('div');
                dot.classList.add('capture-dot');
                dotRow.append(dot);
                if (i < this.cols) {

                    let space = document.createElement('div');
                    space.classList.add('capture-space');
                    space.style.width = `${spacing}px`;
                    space.style.height = `${spacing}px`;
                    space.id = `space${spaceCount}`;
                    // space.textContent = spaceCount.toFixed(0);
                    
                    dotRow.append(space);
                }
                this.boardArea.append(dotRow);
            }
        }

        this.restartButton.addEventListener('click', () => {
            new Capture(this.board);
        });
    }

    protected handleMove(progress: number): void {
        for (let r = 0; r <= this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let localCount = r * this.cols + c;
                let space = document.getElementById(`space${localCount}`);
                space?.addEventListener('click', (event: MouseEvent) => {
                    let nearestSide = this.determineNearestSide(event);
                    switch (nearestSide) {
                        case 'top':
                            // console.log(`Top: ${localCount}`);
                            if (localCount < this.squareArrays.length) {
                                this.squareArrays[localCount][0] = 1;
                            }
                            if (localCount >= this.cols || localCount >= this.squareArrays.length) {
                                this.squareArrays[localCount - this.cols][1] = 1;
                            }
                            break;
                        case 'bottom':
                            // console.log(`Bottom: ${localCount}`);
                            if (localCount < this.squareArrays.length) {
                                this.squareArrays[localCount][1] = 1;
                            }
                            if (localCount < (this.rows * this.cols) - this.cols) {
                                this.squareArrays[localCount + this.cols][0] = 1;
                            }
                            break;
                        case 'left':
                            // console.log(`Left: ${localCount}`);
                            if (localCount < this.squareArrays.length) {
                                this.squareArrays[localCount][2] = 1;
                            }
                            if (localCount < this.squareArrays.length && localCount % this.cols != 0) {
                                this.squareArrays[localCount - 1][3] = 1;
                            }
                            break;
                        case 'right':
                            // console.log(`Right: ${localCount }`);
                            if (localCount < this.squareArrays.length) {
                                this.squareArrays[localCount][3] = 1;
                            }
                            if (localCount < this.squareArrays.length && localCount % this.cols != this.cols - 1) {
                                this.squareArrays[localCount + 1][2] = 1;
                            }
                            break;
                    }
                    this.drawLines();
                });
            }
        }
    }

    protected checkWin(): void {

    }

    private determineNearestSide(event: MouseEvent): string {
        let rect = (event.target as HTMLElement).getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        let width = rect.width;
        let height = rect.height;

        let distances = {
            top: y,
            bottom: height - y,
            left: x,
            right: width - x
        };

        let nearestSide = (Object.keys(distances) as (keyof typeof distances)[]).reduce((a, b) => {
            return distances[a] < distances[b] ? a : b
        });

        return nearestSide;
    }

    private drawLines(): void {
        for (let square of this.squareArrays) {
            if (square.includes(1)) {
                let index = this.squareArrays.indexOf(square);
                let space = document.getElementById(`space${index}`);
                if (square[0] == 1) {
                    space?.classList.add('capture-border-top');
                }
                if (square[1] == 1) {
                    space?.classList.add('capture-border-bottom');
                }
                if (square[2] == 1) {
                    space?.classList.add('capture-border-left');
                }
                if (square[3] == 1) {
                    space?.classList.add('capture-border-right');
                }
            }
        }
    }
}