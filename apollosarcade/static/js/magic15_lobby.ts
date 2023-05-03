let lobbyOptions = document.getElementById('lobbyOptions');
let isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;

if (!isMobile) {
    lobbyOptions?.classList.add('mft-row');
} else {
    lobbyOptions?.classList.add('mft-col');
}