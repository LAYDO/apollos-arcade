import { MultiplayerLobby } from "./MultiplayerLobby";
import { apollosLocalMessage, getCurrentUserId } from "./utils";

export class MagicFifteenLobby extends MultiplayerLobby {
    constructor(app: HTMLElement, data: HTMLElement) {
        super(app, data);
    }

    protected handleLobby(data: any): void {
        this.playerOneStatus = data.status.p1Status;
        this.playerTwoStatus = data.status.p2Status;
        this.playerOne = data.status.p1;
        this.playerTwo = data.status.p2;
        this.playerOneID = data.status.p1ID;
        this.playerTwoID = data.status.p2ID;
        this.privacy = data.status.privacy;
        // this.current = data.status.current;
        this.round = data.status.round;
        this.handleOptions(this.updateLobby.bind(this));
    }

    protected updateLobby(data: any): void {
        // TODO: Test lobby update
        let lobby = {
            'type': '',
            'message': {
                'lobby_id': this.gameId,
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