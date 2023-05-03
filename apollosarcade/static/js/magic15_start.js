"use strict";
let createModal = document.getElementById('createModal');
let joinModal = document.getElementById('joinModal');
let create;
let join;
function startInit() {
    if (createModal) {
        create = new FifteenCard('Match Options', 'Public', 'Private', 'CREATE', createModal);
    }
    if (joinModal) {
        join = new FifteenCard('Join Lobby', 'Random Lobby', 'Lobby Number', 'JOIN', joinModal);
    }
    window.onclick = (e) => {
        if (e.target == createModal) {
            create.hide();
        }
        if (e.target == joinModal) {
            join.hide();
        }
    };
}
function showCreate() {
    create.show();
}
function showJoin() {
    join.show();
}
startInit();
