// Color theme class
class ColorTheme {
    public name: string;
    public colorOne: string;
    public colorTwo: string;
    public colorThree: string;
    public colorFour: string;
    public colorFive: string;

    constructor(name: string, colorOne: string, colorTwo: string, colorThree: string, colorFour: string, colorFive: string) {
        this.name = name;
        this.colorOne = colorOne;
        this.colorTwo = colorTwo;
        this.colorThree = colorThree;
        this.colorFour = colorFour;
        this.colorFive = colorFive;
    }
}
// Arcade cabinet class
class ArcadeCabinet {
    public title: string;
    private _cabinet: HTMLElement;
    private _topBand: HTMLElement;
    private _inclaveBand: HTMLElement;
    private _screenBackground: HTMLElement;
    private _screen: HTMLElement;
    private _controlBand: HTMLElement;
    private captureFeature: boolean = false;

    constructor(title: string, container: HTMLElement, colors: ColorTheme = new ColorTheme('default', '#BFD3C1', '#68A691', '#07BEB8', '#0F90C9','#0d78a8')) {
        this.title = title;

        this._cabinet = document.createElement('div');
        this._cabinet.classList.add('arcade-cabinet');
        this._cabinet.addEventListener('click', () => {
            if (this.title == 'Capture' && this.captureFeature) {
                fetch('/capture').then((response) => {
                    if (response.status == 200) {
                        console.log(response);
                        return response.text();
                    }
                }).then((text) => {
                    if (text) {
                        let t = JSON.parse(text);
                        alert(t.capture);
                    }
                });
            } else {
                window.location.href = `/${this.title.toLowerCase().replace(' ', '_')}`;
            }
        });
                

        let cabinetShadow = document.createElement('div');
        cabinetShadow.classList.add('shadow');
        this._cabinet.append(cabinetShadow);

        this._topBand = document.createElement('div');
        this._topBand.classList.add('top-band');
        this._topBand.innerText = this.title;

        this._inclaveBand = document.createElement('div');
        this._inclaveBand.classList.add('inclave-band');

        this._screenBackground = document.createElement('div');
        this._screenBackground.classList.add('screen-container');

        let shadow = document.createElement('div');
        shadow.classList.add('shadow');
        this._screenBackground.append(shadow);

        this._screen = document.createElement('div');
        this._screen.classList.add('screen');

        let joystick = document.createElement('div');
        joystick.classList.add('joystick');
        joystick.style.setProperty('--joystick-background', colors.colorFour);
        joystick.style.setProperty('--joystick-before-background', colors.colorFive);

        let stick = document.createElement('div');
        stick.classList.add('stick');
        joystick.append(stick);

        this._controlBand = document.createElement('div');
        this._controlBand.classList.add('control-band');

        let buttonA = document.createElement('div');
        buttonA.classList.add('button', 'button-a');
        buttonA.style.setProperty('--color-a', colors.colorOne);
        let buttonB = document.createElement('div');
        buttonB.classList.add('button', 'button-b');
        buttonB.style.setProperty('--color-b', colors.colorTwo);
        let buttonC = document.createElement('div');
        buttonC.classList.add('button', 'button-c');
        buttonC.style.setProperty('--color-c', colors.colorThree);

        this._controlBand.append(buttonA);
        this._controlBand.append(buttonB);
        this._controlBand.append(buttonC);

        let bottom = document.createElement('div');
        bottom.classList.add('bottom');

        let stripes = document.createElement('div');
        stripes.classList.add('stripes');
        stripes.style.setProperty('--before-background', colors.colorOne);
        stripes.style.setProperty('--during-background', colors.colorTwo);
        stripes.style.setProperty('--after-background', colors.colorThree);

        bottom.append(stripes);

        this._cabinet.append(this._topBand);
        this._cabinet.append(this._inclaveBand);
        this._screenBackground.append(this._screen);
        this._screenBackground.append(joystick);
        this._cabinet.append(this._screenBackground);
        this._cabinet.append(this._controlBand);
        this._cabinet.append(bottom);

        container.append(this._cabinet);
    }

    public drawLogo(): void {
        if (this._screen != null) {
            let width = this._screen.clientWidth;
            width = width * 0.9;
            let sWidth = width / 3;
            let start = sWidth / 7;
    
            let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', width + 'px');
            svg.setAttribute('height', width + 'px');
    
            switch (this.title) {
                case 'Magic Fifteen':
                    for (let i = 0; i < 3; i++) {
                        let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        for (let j = 0; j < 5; j++) {
                            let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                            line.setAttribute('stroke', '#000020');
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
                            g.setAttribute('transform', `translate(0,${sWidth * 1.1})`);
                        }
                        svg.append(g);
                        start += sWidth;
                    }
                    break;
                case 'Capture':
                    const sideLength = width / 2;
                    const gap = 6;
                    const strokeWidth = 3;

                    for (let i = 0; i < 4; i++) {
                        const angle = i * Math.PI / 2;
                        const cosAngle = Math.cos(angle);
                        const sinAngle = Math.sin(angle);
                        const x1 = sideLength + ((sideLength / 2) * cosAngle) - ((sideLength / 2 - gap) * sinAngle);
                        const y1 = sideLength + ((sideLength / 2) * sinAngle) + ((sideLength / 2 - gap) * cosAngle);
                        const x2 = x1 + ((sideLength - 2 * gap) * sinAngle);
                        const y2 = y1 - ((sideLength - 2 * gap) * cosAngle);

                        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('stroke', '#000020');
                        line.setAttribute('stroke-width', strokeWidth.toFixed(0));
                        line.setAttribute('x1', x1.toFixed(0));
                        line.setAttribute('y1', y1.toFixed(0));
                        line.setAttribute('x2', x2.toFixed(0));
                        line.setAttribute('y2', y2.toFixed(0));
                        svg.append(line);
                    }
                    break;
                default:
                    break;
            }
            this._screen.append(svg);
        }
    }
}

let arcade = document.getElementById('arcadeSpace');
if (arcade) {
    let captureColors = new ColorTheme('Capture', '#004777', '#A30000', '#FF7700', '#EBC670', '#D69F1F');
    let magicFifteen = new ArcadeCabinet('Magic Fifteen', arcade);
    let capture = new ArcadeCabinet('Capture', arcade, captureColors);

    // Draw logos
    magicFifteen.drawLogo();
    capture.drawLogo();
}
