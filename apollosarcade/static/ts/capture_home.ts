import { GameHome } from "./GameHome";

class CaptureHome extends GameHome {
    constructor(app: HTMLElement) {
        super(app, 'Capture');
    }

    public drawLogo(logo: SVGElement): void {
        let width = logo.clientWidth;
        const sideLength = width / 3;
        const gap = 10;
        const strokeWidth = 3;

        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2;
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);
            const x1 = (sideLength * 1.5) + ((sideLength / 2) * cosAngle) - ((sideLength / 2 - gap) * sinAngle);
            const y1 = (sideLength) + ((sideLength / 2) * sinAngle) + ((sideLength / 2 - gap) * cosAngle);
            const x2 = x1 + ((sideLength - 2 * gap) * sinAngle);
            const y2 = y1 - ((sideLength - 2 * gap) * cosAngle);

            let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('stroke', 'var(--font-color)');
            line.setAttribute('stroke-width', strokeWidth.toFixed(0));
            line.setAttribute('x1', x1.toFixed(0));
            line.setAttribute('y1', y1.toFixed(0));
            line.setAttribute('x2', x2.toFixed(0));
            line.setAttribute('y2', y2.toFixed(0));
            logo.append(line);
        }
    }
}

let home: CaptureHome;
let logo: SVGElement;

function ft_init() {
    let app = document.getElementById('aa_home');
    if (app) {
        home = new CaptureHome(app);
    }
    logo = document.getElementById('gameLogo') as unknown as SVGElement;
    if (logo) {
        home.drawLogo(logo);
    }
}

ft_init();