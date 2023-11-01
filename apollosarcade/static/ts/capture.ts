import { LocalGame } from "./LocalGame";

export class Capture extends LocalGame {

    public plays: Array<number>;
    protected rows: number = 11;
    protected cols: number = 9;
    private horizontalLines: number = 0;
    private verticalLines: number = 0;
    private horizontalArray: Array<number>;
    private verticalArray: Array<number>;

    constructor(board: HTMLElement) {
        super(board);
        this.horizontalLines = this.rows * (this.cols - 1);
        this.horizontalArray = new Array(this.horizontalLines).fill(0);
        this.verticalLines = (this.rows - 1) * this.cols;
        this.verticalArray = new Array(this.verticalLines).fill(0);
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
                    space.textContent = spaceCount.toFixed(0);
                    
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
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let localCount = r * this.cols + c;
                let space = document.getElementById(`space${localCount}`);
                space?.addEventListener('click', (event: MouseEvent) => {
                    let nearestSide = this.determineNearestSide(event);
                    switch (nearestSide) {
                        case 'top':
                            let top = localCount;
                            if (this.horizontalArray[top] == 0) {
                                if (this.player1Turn) {
                                    this.updateLineArray(top, 0, 1);
                                } else {
                                    this.updateLineArray(top, 0, 2);
                                }
                            }
                            break;
                        case 'bottom':
                            let bottom = localCount + this.cols;
                            if (this.horizontalArray[bottom] == 0) {
                                if (this.player1Turn) {
                                    this.updateLineArray(bottom, 0, 1);
                                } else {
                                    this.updateLineArray(bottom, 0, 2);
                                }
                            }
                            break;
                        case 'left':
                            let left = localCount;
                            if (this.verticalArray[left] == 0) {
                                if (this.player1Turn) {
                                    this.updateLineArray(left, 1, 1);
                                } else {
                                    this.updateLineArray(left, 1, 2);
                                }
                            }
                            break;
                        case 'right':
                            let right = localCount + 1;
                            if (this.verticalArray[right] == 0) {
                                if (this.player1Turn) {
                                    this.updateLineArray(right, 1, 1);
                                } else {
                                    this.updateLineArray(right, 1, 2);
                                }
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

    private updateLineArray(index: number, which: number, player: number): void {
        if (which == 0) {
            this.horizontalArray[index] = player;
        } else {
            this.verticalArray[index] = player;
        }
        console.log(`Horizontal: ${this.horizontalArray}\nVertical: ${this.verticalArray}`);
    }

    private drawLines(): void {
        for (let i = 0; i < this.horizontalArray.length; i++) {
            let space = document.getElementById(`space${i}`);
            space?.classList.remove('capture-border-top');
            space?.classList.remove('capture-border-bottom');
            if (i < this.cols) {
                if (this.horizontalArray[i] == 1) {
                    space?.classList.add('capture-border-top');
                } else if (this.horizontalArray[i] == 2) {
                    space?.classList.add('capture-border-top');
                }
            } else if (i > this.horizontalArray.length - this.cols) {
                if (this.horizontalArray[i] == 1) {
                    space?.classList.add('capture-border-bottom');
                } else if (this.horizontalArray[i] == 2) {
                    space?.classList.add('capture-border-bottom');
                }
            } else {
                let spaceBelowId = document.getElementById(`space${i - this.cols}`);
                if (this.horizontalArray[i] == 1) {
                    space?.classList.add('capture-border-top-shared');
                    spaceBelowId?.classList.add('capture-border-bottom-shared');
                } else if (this.horizontalArray[i] == 2) {
                    space?.classList.add('capture-border-top-shared');
                    spaceBelowId?.classList.add('capture-border-bottom-shared');
                }
            }
        }

        let leftCount = 0;
        let rightCount = 1;
        for (let i = 0; i < this.verticalArray.length; i++) {
            if (i % this.cols + 1 == 0) {
                let space = document.getElementById(`space${i - leftCount}`);
                space?.classList.remove('capture-border-left');
                space?.classList.remove('capture-border-right');

                if (this.verticalArray[i] == 1) {
                    space?.classList.add('capture-border-left');
                } else if (this.verticalArray[i] == 2) {
                    space?.classList.add('capture-border-left');
                }
                leftCount++;
            } else if (i + 1 % this.cols + 1 == 0) {
                let space = document.getElementById(`space${i - rightCount}`);
                space?.classList.remove('capture-border-left');
                space?.classList.remove('capture-border-right');

                if (this.verticalArray[i] == 1) {
                    space?.classList.add('capture-border-right');
                } else if (this.verticalArray[i] == 2) {
                    space?.classList.add('capture-border-right');
                }
                rightCount++;
            } else {
                let spaceLeft = document.getElementById(`space${i - rightCount}`);
                spaceLeft?.classList.remove('capture-border-left');
                spaceLeft?.classList.remove('capture-border-right');

                let spaceRight = document.getElementById(`space${i - leftCount}`);
                spaceRight?.classList.remove('capture-border-left');
                spaceRight?.classList.remove('capture-border-right');

                if (this.verticalArray[i] == 1) {
                    spaceRight?.classList.add('capture-border-left-shared');
                    spaceLeft?.classList.add('capture-border-right-shared');
                } else if (this.verticalArray[i] == 2) {
                    spaceRight?.classList.add('capture-border-left-shared');
                    spaceLeft?.classList.add('capture-border-right-shared');
                }
            }
        }
     }
}