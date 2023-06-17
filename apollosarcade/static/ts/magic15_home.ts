import { GameHome } from "./GameHome";

class Magic15Home extends GameHome {
    constructor(app: HTMLElement) {
        super(app, 'Magic 15');
    }

    public drawLogo(logo: SVGElement): void {
        let width = logo.clientWidth;
        let sWidth = width / 3;
        let start = sWidth / 7;
        for (let i = 0; i < 3; i++) {
            let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            for (let j = 0; j < 5; j++) {
                let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('stroke', 'var(--font-color)');
                line.setAttribute('stroke-width', '2.5');
                if (j != 4) {
                    line.setAttribute('x1', ((j * (sWidth / 4)) + start).toFixed(0));
                    line.setAttribute('x2', ((j * (sWidth / 4)) + start).toFixed(0));
                    line.setAttribute('y1', '3');
                    line.setAttribute('y2', `${sWidth - 3}`);
                } else {
                    line.setAttribute('x1', (((j - 1) * (sWidth / 4)) + start).toFixed(0));
                    line.setAttribute('x2', (start).toFixed(0));
                    line.setAttribute('y1', '3');
                    line.setAttribute('y2', `${sWidth - 3}`);
                }
                g.append(line);
            }
            if (i == 1) {
                g.setAttribute('transform', `translate(0,${sWidth})`);
            }
            logo.append(g);
            start += sWidth;
        }
    }
}

let home: Magic15Home;
let logo: SVGElement;

function ft_init() {
    let app = document.getElementById('aa_home');
    if (app) {
        home = new Magic15Home(app);
    }
    logo = document.getElementById('gameLogo') as unknown as SVGElement;
    if (logo) {
        home.drawLogo(logo);
    }
}

ft_init();