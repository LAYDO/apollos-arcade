let mft = document.getElementById('magic_fifteen');
if (mft) {
    drawLogo(mft);
    mft.addEventListener('click', () => {
        window.location.href = '/magic_fifteen';
    });
}


function drawLogo(_element: HTMLElement) {
    if (_element != null) {
        let width = _element.clientWidth;
        width = width * 0.9;
        let sWidth = width / 3;
        let start = sWidth / 7;

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width + 'px');
        svg.setAttribute('height', width + 'px');

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
                g.setAttribute('transform', `translate(0,${sWidth * 1.1})`);
            }
            svg.append(g);
            start += sWidth;
        }
        _element.append(svg);
    }
}