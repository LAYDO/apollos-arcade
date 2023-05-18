import { FifteenCard } from './FifteenCard';

declare var csrfToken: string;
let createModal = document.getElementById('createModal');
let joinModal = document.getElementById('joinModal');
let createButton = document.getElementById('createButton');
let joinButton = document.getElementById('joinButton');
let create: FifteenCard;
let join: FifteenCard;
let startContainer = document.getElementById('start_container');

function startInit() {
    if (createModal) {
        create = new FifteenCard('Match Options', 'Public', 'Private', 'CREATE', createModal, cancel, csrfToken);
    }
    if (joinModal) {
        join = new FifteenCard('Join Lobby', 'Random Lobby', 'Lobby Number', 'JOIN', joinModal, cancel, csrfToken);
    }

    if (createButton) {
        createButton.addEventListener('click', showCreate);
    }

    if (joinButton) {
        joinButton.addEventListener('click', showJoin);
    }

    window.onclick = (e: MouseEvent) => {
        if (e.target == createModal) {
            create.hide();
        }
        if (e.target == joinModal) {
            join.hide();
        }
    }
}

function showCreate() {
    create.show();
    join.hide();
    startContainer?.setAttribute('style', 'display:none;');
}

function showJoin() {
    join.show();
    create.hide();
    startContainer?.setAttribute('style', 'display:none;');
}

function cancel() {
    create.hide();
    join.hide();
    startContainer?.setAttribute('style', 'display: flex;');
}

document.addEventListener('DOMContentLoaded', () => {
    startInit();
});