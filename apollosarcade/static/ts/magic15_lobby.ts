import { MagicFifteenLobby } from './MagicFifteenLobby';

let magic_lobby: MagicFifteenLobby;

function magicFifteenLobby() {
    let app = document.getElementById('aa_lobby');
    let data = document.getElementById('context-data-lobby');
    if (app && data) {
        magic_lobby = new MagicFifteenLobby(app, data);
    }
}

magicFifteenLobby();
