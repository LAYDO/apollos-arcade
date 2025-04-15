import { CaptureLobby } from "./CaptureLobby";

let capture_lobby: CaptureLobby;

function captureLobby() {
    let app = document.getElementById('aa_lobby');
    let data = document.getElementById('context-data-lobby');
    if (app && data) {
        capture_lobby = new CaptureLobby(app, data);
    }
}

captureLobby();