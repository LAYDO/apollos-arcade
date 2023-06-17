import { GameStart } from './GameStart';

let app = document.getElementById('aa_start');
declare var csrfToken: string;
const contextData = document.getElementById('context-data-start')?.dataset;
let gameStart: GameStart;

function startInit() {
    if (app) {
        gameStart = new GameStart(app, contextData, csrfToken);
    }
    window.onclick = (e: MouseEvent) => {
        if (e.target == gameStart.createModal) {
            gameStart.create.hide();
        }
        if (e.target == gameStart.joinModal) {
            gameStart.join.hide();
        }
    }

    
}

startInit();
