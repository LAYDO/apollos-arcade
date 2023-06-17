import { StartCard } from './StartCard';

export class GameStart {
    protected app: HTMLElement;
    private title: HTMLElement;
    protected startContainer: HTMLElement;
    public createModal: HTMLElement;
    public joinModal: HTMLElement;
    private createButton: HTMLElement;
    private joinButton: HTMLElement;
    public create: StartCard;
    public join: StartCard;
    protected contextData: any;
    protected guest: boolean;
    private csrfToken: string;

    constructor(app: HTMLElement, data: any, csrfToken: string) {
        this.app = app;
        this.startContainer = document.createElement('div');
        this.startContainer.setAttribute('id', 'start_container');
        this.startContainer.classList.add('apollos-flex-col');

        this.title = document.createElement('div');
        this.title.classList.add('apollos-title');
        this.title.classList.add('apollos-flex-row');
        this.title.textContent = 'START MATCH';

        this.createModal = document.createElement('div');
        this.createModal.setAttribute('id', 'createModal');
        this.createModal.classList.add('apollos-modal');

        this.joinModal = document.createElement('div');
        this.joinModal.setAttribute('id', 'joinModal');
        this.joinModal.classList.add('apollos-modal');

        this.showCreate = this.showCreate.bind(this);
        this.showJoin = this.showJoin.bind(this);

        this.createButton = document.createElement('div');
        this.createButton.setAttribute('id', 'createButton');
        this.createButton.classList.add('apollos-button');
        this.createButton.addEventListener('click', this.showCreate);
        this.createButton.textContent = 'CREATE';

        this.joinButton = document.createElement('div');
        this.joinButton.setAttribute('id', 'joinButton');
        this.joinButton.classList.add('apollos-button');
        this.joinButton.addEventListener('click', this.showJoin);
        this.joinButton.textContent = 'JOIN';

        this.contextData = data;
        this.guest = this.contextData.guest == 'True' ? true : false;
        this.csrfToken = csrfToken;

        this.cancel = this.cancel.bind(this);

        this.create = new StartCard('Match Options', 'Public', 'Private', 'CREATE', this.createModal, this.cancel, this.csrfToken, this.guest);
        this.join = new StartCard('Join Lobby', 'Random Lobby', 'Lobby Number', 'JOIN', this.joinModal, this.cancel, this.csrfToken, this.guest);

        let createButtonContainer = document.createElement('div');
        createButtonContainer.classList.add('apollos-flex-row');
        createButtonContainer.appendChild(this.createButton);

        let joinButtonContainer = document.createElement('div');
        joinButtonContainer.classList.add('apollos-flex-row');
        joinButtonContainer.appendChild(this.joinButton);

        this.startContainer.appendChild(this.title);
        this.startContainer.appendChild(createButtonContainer);
        this.startContainer.appendChild(joinButtonContainer);

        this.app.appendChild(this.startContainer);
        if (this.app.parentElement != null) {
            this.app.parentElement?.appendChild(this.createModal);
            this.app.parentElement?.appendChild(this.joinModal);
        }
    }

    public showCreate() {
        this.create.show();
        this.join.hide();
        this.startContainer.setAttribute('style', 'display:none;');
    }

    public showJoin() {
        this.join.show();
        this.create.hide();
        this.startContainer?.setAttribute('style', 'display:none;');
    }

    public cancel() {
        this.create.hide();
        this.join.hide();
        this.startContainer?.setAttribute('style', 'display: flex;');
    }
}