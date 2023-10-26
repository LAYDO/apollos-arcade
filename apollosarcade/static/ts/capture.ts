import { LocalGame } from "./LocalGame";

export class Capture extends LocalGame {

    private lines: Array<number>;
    public plays: Array<number>;

    constructor(board: HTMLElement) {
        super(board);
        this.lines = new Array(178).fill(0);
        this.plays = [];

        this.boardArea.style.width = '50%';
        let width = this.boardArea.clientWidth;
        let spacing = width / 10;

        let localCount = 0;
        for (let j = 1; j <= 11; j++) {
            let dotRow = document.createElement('div');
            dotRow.classList.add('capture-row');
            for (let i = 1; i <= 9; i++) {
                let dot = document.createElement('div');
                dot.classList.add('capture-dot');
                dotRow.append(dot);
                if (i < 9) {

                    let space = document.createElement('div');
                    space.classList.add('capture-space');
                    space.style.width = `${spacing}px`;
                    space.style.height = `${spacing}px`;
                    space.id = `space${localCount}`;
                    space.addEventListener('click', (event: MouseEvent) => {
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
    
                        (event.target as HTMLElement).style.border = '';
    
                        switch (nearestSide) {
                            case 'top':
                                (event.target as HTMLElement).classList.add('capture-border-top');
                                break;
                            case 'bottom':
                                (event.target as HTMLElement).classList.add('capture-border-bottom');
                                break;
                            case 'left':
                                (event.target as HTMLElement).classList.add('capture-border-left');
                                break;
                            case 'right':
                                (event.target as HTMLElement).classList.add('capture-border-right');
                                break;
                        }
                    });
                    dotRow.append(space);
                }
                this.boardArea.append(dotRow);
                localCount++;
            }
        }
    }

    protected loop(timestamp: number): void {

    }

    protected handleMove(progress: number): void {
        
    }

    protected checkWin(): void {
        
    }
}