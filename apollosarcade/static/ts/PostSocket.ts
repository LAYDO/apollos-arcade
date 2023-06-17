import { apollosLocalMessage, apollosServerMessage, getCurrentUserId } from "./utils";
import { ApollosSocket } from "./ApollosSocket";

export class PostSocket extends ApollosSocket {

    private callback: Function;

    constructor(gameId: string, callback: Function, data: any = {}) {
        super(gameId, data);
        this.callback = callback;
    }

    public handleMessage(data: any): void {
        if (data.type == 'update') {
            this.callback(data);
        } else if (data.type == 'redirect') {
            apollosLocalMessage(data.reason, 'info')
            document.getElementById('message_close')?.addEventListener('click', () => {
                window.location.href = data.url;
            });
        } else if (data.type == 'error') {
            apollosServerMessage(data.error, 'error', data);
        }
    }
}