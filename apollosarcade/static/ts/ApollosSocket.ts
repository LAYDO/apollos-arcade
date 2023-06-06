import { apollosLocalMessage } from "./utils";

export abstract class ApollosSocket {
    protected socket: WebSocket;
    protected connectionString: string;
    protected retryInterval: number;
    protected heartbeatInterval: number;
    protected heartbeatTimeout: any;
    protected gameId: string;

    constructor(gameId: string) {
        this.gameId = gameId;
        let path = window.location.pathname.split('/')[2];
        this.connectionString = (window.location.protocol === 'https:') ? `wss://${window.location.host}/ws/${path}/${this.gameId}/` : `ws://${window.location.host}/ws/${path}/${this.gameId}/`;
        this.retryInterval = 1000;
        this.heartbeatInterval = 30000; // 30 seconds
        this.heartbeatTimeout = null;
        this.socket = new WebSocket(this.connectionString);
    }

    public connect() {
        this.socket.onopen = () => {
            console.log('Connected to websocket');
            this.sendHeartbeat();
        }

        this.socket.onclose = (e) => {
            console.log('Disconnected from websocket.  Reconnect attempt in 1 second...', e.reason);
            setTimeout(() => {
                this.connect();
                this.retryInterval *= 2;
            }, this.retryInterval);
            clearTimeout(this.heartbeatTimeout);
        }

        this.socket.onmessage = (e) => {
            let data = JSON.parse(e.data);
            if ('payload' in data) {
                data = data.payload;
                this.handleMessage(data);
            } else {
                console.warn('Received message from websocket without payload', data);
                apollosLocalMessage('Received message from websocket without payload. See console for details.', 'warning');
            }
        }
    }

    protected sendHeartbeat() {
        if (this.socket.readyState !== this.socket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'heartbeat' }));
        }
        this.heartbeatTimeout = setTimeout(() => { this.sendHeartbeat(); }, this.heartbeatInterval);
    }

    public send(data: any): void {
        this.socket.send(JSON.stringify(data));
    }

    public abstract handleMessage(data: any): void;
}