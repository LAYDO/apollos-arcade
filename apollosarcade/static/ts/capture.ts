import { LocalGame } from "./LocalGame";

const SIDE_INDEXES = {
    top: 0,
    bottom: 1,
    left: 2,
    right: 3
}

export class Capture extends LocalGame {

    public plays: Array<number>;
    protected rows: number = 5;
    protected cols: number = 5;
    private squareArrays: Array<Array<number>>;
    private gameOver: boolean = false;
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

    private getCurrentPlayerNumber(): number {
        return this.player1Turn ? 1 : 2;
    }

    protected handleMove(progress: number): void {
        for (let r = 0; r <= this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let localCount = r * this.cols + c;
                let space = document.getElementById(`space${localCount}`);
                space?.addEventListener('click', (event: MouseEvent) => {
                    if (this.gameOver) {
                        return;
                    }
                    const currentPlayerNumber = this.getCurrentPlayerNumber();
                    const nearestSide = this.determineNearestSide(event);
                    const affectedSquares: number[] = [];

                    if (localCount < this.squareArrays.length && this.squareArrays[localCount][nearestSide] !== 0) {
                        alert('This side is already captured');
                        return;
                    }

                    switch (nearestSide) {
                        case SIDE_INDEXES.top:
                            if (localCount < this.squareArrays.length) {
                                this.squareArrays[localCount][0] = currentPlayerNumber;
                                affectedSquares.push(localCount);
                            }
                            if (localCount >= this.cols || localCount >= this.squareArrays.length) {
                                this.squareArrays[localCount - this.cols][1] = currentPlayerNumber;
                                affectedSquares.push(localCount - this.cols);
                            }
                            break;
                        case SIDE_INDEXES.bottom:
                            if (localCount < this.squareArrays.length) {
                                this.squareArrays[localCount][1] = currentPlayerNumber;
                                affectedSquares.push(localCount);
                            }
                            if (localCount < (this.rows * this.cols) - this.cols) {
                                this.squareArrays[localCount + this.cols][0] = currentPlayerNumber;
                                affectedSquares.push(localCount + this.cols);
                            }
                            break;
                        case SIDE_INDEXES.left:
                            if (localCount < this.squareArrays.length) {
                                this.squareArrays[localCount][2] = currentPlayerNumber;
                                affectedSquares.push(localCount);
                            }
                            if (localCount < this.squareArrays.length && localCount % this.cols != 0) {
                                this.squareArrays[localCount - 1][3] = currentPlayerNumber;
                                affectedSquares.push(localCount - 1);
                            }
                            break;
                        case SIDE_INDEXES.right:
                            if (localCount < this.squareArrays.length) {
                                this.squareArrays[localCount][3] = currentPlayerNumber;
                                affectedSquares.push(localCount);
                            }
                            if (localCount < this.squareArrays.length && localCount % this.cols != this.cols - 1) {
                                this.squareArrays[localCount + 1][2] = currentPlayerNumber;
                                affectedSquares.push(localCount + 1);
                            }
                            break;
                    }
                    

                    this.drawLines();
                    const completedSquare = this.checkForCompletedSquare(currentPlayerNumber, affectedSquares);

                    if (!completedSquare) {
                        this.player1Turn = !this.player1Turn;
                        this.player2Turn = !this.player2Turn;
                        this.updateTurnIndicator();
                    }

                    this.checkWin();
                });
            }
        }
    }

    private checkForCompletedSquare(currentPlayerNumber: number, affectedSquares: number[]): boolean {
        let squareCompleted = false;
        for (let index of affectedSquares) {
            const square = this.squareArrays[index];
            // Check if all sides are captured and the square is not owned
            if (square?.slice(0, 4).every(side => side !== 0) && square[4] === 0) {
                square[4] = currentPlayerNumber;
                squareCompleted = true;
                // Update the UI to indicate ownership
                const space = document.getElementById(`space${index}`);
                if (space) {
                    space.classList.add(`capture-owned-player${currentPlayerNumber}`);
                }
            }
        }
        return squareCompleted;
    }

    protected checkWin(): void {
        const totalSquares = this.rows * this.cols;
        let player1Score = 0;
        let player2Score = 0;

        for (const square of this.squareArrays) {
            if (square[4] === 1) player1Score++;
            if (square[4] === 2) player2Score++;
        }

        this.playerOneContent.textContent = `${player1Score}`;
        this.playerOneContent.classList.add(`capture-score-player1`);
        this.playerTwoContent.textContent = `${player2Score}`;
        this.playerTwoContent.classList.add(`capture-score-player2`);

        if (player1Score + player2Score === totalSquares) {
            this.gameOver = true;
            // let message: string;

            if (player1Score > player2Score) {
                // message = 'Player 1 wins!';
                // this.playerOneElement.classList.add('winners-glow');
                for (let i = 0; i < this.squareArrays.length; i++) {
                    const square = this.squareArrays[i];
                    if (square[4] === 1) {
                        const space = document.getElementById(`space${i}`);
                        if (space) {
                            space.classList.add('winners-glow');
                        }
                    } else {
                        const space = document.getElementById(`space${i}`);
                        if (space) {
                            space.classList.add('capture-faded-player2');
                        }
                    }
                }
            } else if (player2Score > player1Score) {
                // message = 'Player 2 wins!';
                for (let i = 0; i < this.squareArrays.length; i++) {
                    const square = this.squareArrays[i];
                    if (square[4] === 2) {
                        const space = document.getElementById(`space${i}`);
                        if (space) {
                            space.classList.add('winners-glow');
                        }
                    } else {
                        const space = document.getElementById(`space${i}`);
                        if (space) {
                            space.classList.add('capture-faded-player1');
                        }
                    }
                }
            } else {
                // message = "It's a tie!";
            }

            // alert(message);
        }
    }

    private determineNearestSide(event: MouseEvent): number {
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

        return SIDE_INDEXES[nearestSide];
    }

    private drawLines(): void {
        for (let index = 0; index < this.squareArrays.length; index++) {
            const square = this.squareArrays[index];
            const space = document.getElementById(`space${index}`);

            if (space) {
                if (square[0] !== 0) space.classList.add('capture-border-top');
                if (square[1] !== 0) space.classList.add('capture-border-bottom');
                if (square[2] !== 0) space.classList.add('capture-border-left');
                if (square[3] !== 0) space.classList.add('capture-border-right');
            }
        }
    }

    private updateTurnIndicator(): void {
        if (this.player1Turn) {
            this.playerOneElement.classList.remove('disabled');
            this.playerTwoElement.classList.add('disabled');
        } else {
            this.playerOneElement.classList.add('disabled');
            this.playerTwoElement.classList.remove('disabled');
        }
    }
}