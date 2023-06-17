import { MultiplayerLobby } from "./MultiplayerLobby";
import { getCurrentUserId } from "./utils";

export class MagicFifteenLobby extends MultiplayerLobby {
    constructor(app: HTMLElement, data: HTMLElement) {
        super(app, data);
    }

    protected handleLobby(data: any): void {
        this.playerOneStatus = data.p1Status;
        this.playerTwoStatus = data.p2Status;
        this.playerOne = data.p1 == null ? 'Waiting for player...' : data.p1;
        this.playerTwo = data.p2 == null ? 'Waiting for player...' : data.p2;
        let p1 = document.getElementById('playerOne');
        if (p1 != null) {
            p1.textContent = `Player 1: ${this.playerOne}`;
        }
        let p2 = document.getElementById('playerTwo');
        if (p2 != null) {
            p2.textContent = `Player 2: ${this.playerTwo}`;
        }
        this.playerOneID = data.p1ID;
        this.playerTwoID = data.p2ID;
        this.privacy = data.privacy;
        this.round = data.round;
        this.gameStatus = data.status;

        this.handleOptions(this.updateLobby.bind(this));
    }

    protected updateLobby(data: any): void {
        let lobby = {
            'type': '',
            'message': {
                'game_id': this.gameId,
                'user_id': getCurrentUserId(this.contextData.dataset),
            },
        };
        if (data.type == 'ready') {
            lobby.type = 'ready';
        } else if (data.type == 'unready') {
            lobby.type = 'unready';
        } else if (data.type == 'continue') {
            lobby.type = 'continue';
        } else if (data.type == 'leave') {
            lobby.type = 'leave';
        }
        this.socket.send(JSON.stringify(lobby));
    }
}