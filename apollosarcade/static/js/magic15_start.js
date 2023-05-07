"use strict";
let createModal = document.getElementById('createModal');
let joinModal = document.getElementById('joinModal');
let create;
let join;
let startContainer = document.getElementById('start_container');
function startInit() {
    if (createModal) {
        create = new FifteenCard('Match Options', 'Public', 'Private', 'CREATE', createModal, cancel, csrfToken);
    }
    if (joinModal) {
        join = new FifteenCard('Join Lobby', 'Random Lobby', 'Lobby Number', 'JOIN', joinModal, cancel, csrfToken);
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
    join.hide();
    startContainer === null || startContainer === void 0 ? void 0 : startContainer.setAttribute('style', 'display:none;');
}
function showJoin() {
    join.show();
    create.hide();
    startContainer === null || startContainer === void 0 ? void 0 : startContainer.setAttribute('style', 'display:none;');
}
function cancel() {
    create.hide();
    join.hide();
    startContainer === null || startContainer === void 0 ? void 0 : startContainer.setAttribute('style', 'display: flex;');
}
document.addEventListener('DOMContentLoaded', () => {
    startInit();
});
