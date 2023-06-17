import { apollosLocalMessage, apollosServerMessage, getCurrentUserId } from './utils';
import { ApollosSocket } from './ApollosSocket';

export class LobbySocket extends ApollosSocket {

    private callback: Function;

    constructor(gameId: string, callback: Function, data: any = {}) {
        super(gameId, data);
        this.callback = callback;
    }

    public handleMessage(data: any): void {
        // console.log('Received message from websocket', data);
        if (data.type == 'update') {
            this.callback(data);
        } else if (data.type == 'leave') {
            if (data.current == getCurrentUserId(this.data)) {
                // console.log("Redirect message received");
                apollosLocalMessage(data.reason, 'info');
                document.getElementById('message_close')?.addEventListener('click', () => {
                    window.location.href = data.url;
                });
            }
        } else if (data.type == 'continue') {
            if (data.current == getCurrentUserId(this.data)) {
                console.log(data.reason);
                window.location.href = data.url;
            }
        } else if (data.type == 'redirect') {
            // console.log("Redirect message received");
            apollosLocalMessage(data.reason, 'info');
            document.getElementById('message_close')?.addEventListener('click', () => {
                window.location.href = data.url;
            });
        } else if (data.type == 'error') {
            apollosServerMessage(data.error, 'error', data);
        }
    }
}