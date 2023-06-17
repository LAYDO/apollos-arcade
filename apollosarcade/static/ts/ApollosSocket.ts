import { apollosLocalMessage } from "./utils";

export abstract class ApollosSocket extends WebSocket {
    protected retryInterval: number;
    protected heartbeatInterval: number;
    protected heartbeatTimeout: any;
    protected gameId: string;
    public data: any;

    constructor(gameId: string, data: any = {}) {
        let path = window.location.pathname.split('/')[2];
        let app = window.location.pathname.split('/')[1];
        let connectionString = (window.location.protocol === 'https:') ? `wss://${window.location.host}/${app}/ws/${path}/${gameId}/` : `ws://${window.location.host}/${app}/ws/${path}/${gameId}/`;
        super(connectionString);
        this.gameId = gameId;
        this.retryInterval = 1000;
        this.heartbeatInterval = 30000; // 30 seconds
        this.heartbeatTimeout = null;
        this.data = data;
    }

    public connect() {
        this.onopen = () => {
            console.log('Connected to websocket');
            this.sendHeartbeat();
        }

        this.onclose = (e) => {
            console.log('Disconnected from websocket.  Reconnect attempt in 1 second...', e.reason);
            setTimeout(() => {
                this.connect();
                this.retryInterval *= 2;
            }, this.retryInterval);
            clearTimeout(this.heartbeatTimeout);
        }

        this.onmessage = (e) => {
            // console.log('Received message from websocket', e.data);
            let data = JSON.parse(e.data);
            if ('payload' in data) {
                data = data.payload;
                this.handleMessage(data);
            } else {
                console.warn('Received message from websocket without payload', data);
                apollosLocalMessage('Received message from websocket without payload. See console for details.', 'warning');
                document.getElementById('message_close')?.addEventListener('click', () => {
                    window.location.reload();
                });
            }
        }
        this.onerror = (e) => {
            console.error('Error connecting to websocket', e);
            apollosLocalMessage('Error connecting to websocket. See console for details.', 'error');
            document.getElementById('message_close')?.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }

    protected sendHeartbeat() {
        if (this.readyState !== this.OPEN) {
            this.send(JSON.stringify({ type: 'heartbeat' }));
        }
        this.heartbeatTimeout = setTimeout(() => { this.sendHeartbeat(); }, this.heartbeatInterval);
    }

    public abstract handleMessage(data: any): void;
}