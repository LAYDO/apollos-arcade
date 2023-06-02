let lobbyOptions = document.getElementById('lobbyOptions');
let isMobile = window.matchMedia("only screen and (max-width: 48rem)").matches;
let lobbyRefeshButton = document.getElementById('lobbyRefresh');

if (!isMobile) {
    lobbyOptions?.classList.add('mft-row');
} else {
    lobbyOptions?.classList.add('apollos-flex-col');
}

lobbyRefeshButton?.addEventListener('click', () => {
    window.location.reload();
});