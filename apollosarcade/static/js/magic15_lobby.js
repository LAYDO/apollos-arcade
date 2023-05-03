"use strict";
let lobbyOptions = document.getElementById('lobbyOptions');
let isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;
if (!isMobile) {
    lobbyOptions === null || lobbyOptions === void 0 ? void 0 : lobbyOptions.classList.add('mft-row');
}
else {
    lobbyOptions === null || lobbyOptions === void 0 ? void 0 : lobbyOptions.classList.add('mft-col');
}
