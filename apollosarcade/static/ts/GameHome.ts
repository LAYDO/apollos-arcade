import { apollosLocalMessage } from './utils';

export abstract class GameHome {
    private app: HTMLElement;
    private logo: SVGElement;
    private card: HTMLElement;
    private title: HTMLElement;
    private inner: HTMLElement;
    private front: HTMLElement;
    private back: HTMLElement;

    constructor(app: HTMLElement, title: string) {
        this.app = app;
        this.card = document.createElement('div');
        this.card.classList.add('apollos-card');
        this.card.id = 'apollos_card';

        this.inner = document.createElement('div');
        this.inner.classList.add('apollos-card-inner');

        this.front = document.createElement('div');
        this.front.classList.add('apollos-card-front');
        this.front.classList.add('apollos-flex-col');
        this.front.id = 'apollos_front';

        this.logo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.logo.setAttribute('width', '400');
        this.logo.setAttribute('height', '267');
        this.logo.id = 'gameLogo';

        this.title = document.createElement('div');
        this.title.classList.add('apollos-title');
        this.title.classList.add('apollos-flex-row');
        this.title.textContent = title;

        this.front.append(this.logo);
        this.front.append(this.title);

        for (let i = 0; i < 3; i++) {
            let row = document.createElement('div');
            row.classList.add('apollos-flex-row');

            let button = document.createElement('div');
            button.classList.add('apollos-button');
            switch (i) {
                case 0:
                    button.textContent = 'LOCAL';
                    button.addEventListener('click', () => {
                        this.local();
                    });
                    break;
                case 1:
                    button.textContent = 'MULTIPLAYER';
                    button.addEventListener('click', () => {
                        this.multiplayerCheck();
                    });
                    break;
                case 2:
                    button.textContent = 'HOW TO PLAY';
                    button.addEventListener('click', () => {
                        this.howToPlay();
                    });
                    break;
                default:
                    break;
            }
            row.append(button);
            this.front.append(row);
        }

        this.back = document.createElement('div');
        this.back.classList.add('apollos-card-back');
        this.back.id = 'apollos_back';
        this.back.style.display = 'none';
        this.fetchHowToPlay(this.back);
        this.inner.append(this.front);
        this.inner.append(this.back);

        this.card.append(this.inner);
        this.app.append(this.card);
    }

    protected local(): void {
        window.location.pathname = `${window.location.pathname}local/`;
    }

    protected multiplayerCheck(): void {
        let url = `${window.location.origin}${window.location.pathname}multiplayer/`;
        fetch(url).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            if (response.redirected && response.url.includes('/accounts/login/')) {
                // alert('User not authenticated, redirecting to login page');
                apollosLocalMessage('User not authenticated, redirecting to login page', 'warning');
                document.getElementById('message_close')?.addEventListener('click', () => {
                    window.location.pathname = '/login/';
                });
                return;
            }

            if (response.headers.get('content-type') !== 'application/json') {
                throw new Error(`Invalid content-type. Expected 'application/json', received '${response.headers.get('content-type')}'.`);
            }
            return response.json();
        }
        ).then(data => {
            if (data) {
                window.location.pathname = data.pathname;
            }
        }).catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    }

    protected async fetchHowToPlay(inner?: Element): Promise<void> {
        let url = `${window.location.origin}${window.location.pathname}how-to-play/`;
        fetch(url).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            if (data['title'] == this.title.textContent && inner) {
                let title = document.createElement('div');
                title.classList.add('apollos-title');
                title.textContent = data['title'];
                inner.append(title);

                let text = document.createElement('div');
                text.classList.add('apollos-text');
                text.innerHTML = data['instructions'];
                inner.append(text);

                // Create the 'X' button
                let closeButton = document.createElement('div');
                closeButton.classList.add('close-button');
                closeButton.textContent = 'X';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '0';
                closeButton.style.right = '0';
                closeButton.style.cursor = 'pointer';
                closeButton.addEventListener('click', () => {
                    this.howToPlay();
                });
                inner.append(closeButton);
            }
        }).catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    }

    protected howToPlay(): void {
        this.card.classList.toggle('clicked');
        if (this.back.style.display === 'block') {
            this.back.style.display = 'none';
        } else {
            this.back.style.display = 'block';
        }
    }

    public abstract drawLogo(logo: SVGElement): void;
}