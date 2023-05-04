let createModal = document.getElementById('createModal');
let joinModal = document.getElementById('joinModal');
let create: FifteenCard;
let join: FifteenCard;
let startContainer = document.getElementById('start_container');

function startInit() {
    if (createModal) {
        create = new FifteenCard('Match Options', 'Public', 'Private', 'CREATE', createModal, cancel);
    }
    if (joinModal) {
        join = new FifteenCard('Join Lobby', 'Random Lobby', 'Lobby Number', 'JOIN', joinModal, cancel);
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

startInit();