import { MultiplayerLobby } from "./MultiplayerLobby";
import { apollosLocalMessage, getCurrentUserId } from "./utils";

export class MagicFifteenLobby extends MultiplayerLobby {
    constructor(app: HTMLElement, data: HTMLElement, csrfToken: string) {
        super(app, data, csrfToken);
    }

    protected handleLobby(data: any): void {
        // "payload": {
        //     "id": event['message']['id'],
        //     "status": event['message']['status'],
        //     "p1": event['message']['p1'],
        //     "p2": event['message']['p2'],
        //     "p1ID": event['message']['p1ID'],
        //     "p2ID": event['message']['p2ID'],
        //     "p1Status": event['message']['p1Status'],
        //     "p2Status": event['message']['p2Status'],
        //     "privacy": event['message']['privacy'],
        //     "current": event['message']['current'],
        //     "round": event['message']['round'],
        // }
        this.playerOneStatus = data.status.p1Status;
        this.playerTwoStatus = data.status.p2Status;
        this.playerOne = data.status.p1;
        this.playerTwo = data.status.p2;
        this.playerOneID = data.status.p1ID;
        this.playerTwoID = data.status.p2ID;
        this.privacy = data.status.privacy;
        // this.current = data.status.current;
        this.round = data.status.round;
        this.handleOptions();
    }

    protected updateLobby(data: any): void {
        // TODO: Test lobby update
        let lobby = {
            'type': '',
            'message': {
                'lobby_id': this.gameId,
                'user_id': getCurrentUserId(),
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