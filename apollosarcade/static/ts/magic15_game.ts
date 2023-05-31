import { MagicFifteenBoard } from './MagicFifteenBoard';
import { getCurrentUserId, apollosServerMessage, apollosLocalMessage } from './utils';

let magic_game: MagicFifteenBoard;
let game_id: string;

// Websocket stuff
let connectionString: string;
let socket : WebSocket;
let retryInterval = 1000;
let heartbeatInterval = 30000; // 30 seconds
let heartbeatTimeout: any;

function magic15() {
    let app = document.getElementById('magic15_app');
    let board = document.getElementById('magic15_board');
    if (app && board) {
        board.innerHTML = '';
        magic_game = new MagicFifteenBoard(board, app);
        magic_game.setUpSquareEventListeners(makeMove);
        magic_game.setUpNumberEventListeners(makeMove);
        game_id = document.getElementById('context-data')?.dataset.gameId || '';
        connectionString = (window.location.protocol === 'https:') ? `wss://${window.location.host}/ws/game/${game_id}/` : `ws://${window.location.host}/ws/game/${game_id}/`;
        socket = new WebSocket(connectionString)
    }
}

function makeMove(square: number, play: number) {
    let _square = square;
    let _play = play;
    let data = {
        'type': 'move',
        'message': {
            'game_id': parseInt(game_id),
            'user_id': getCurrentUserId(),
            'space': _square,
            'play': _play
        }
    };
    socket.send(JSON.stringify(data));
}

function sendHeartbeat() {
    if (socket.readyState !== socket.OPEN) {
        socket.send(JSON.stringify({ type: 'heartbeat' }));
    }
    heartbeatTimeout = setTimeout(sendHeartbeat, heartbeatInterval);
}

function connect() {
    socket.onopen = function open() {
        console.log('Connected to websocket');
        sendHeartbeat();
    }

    socket.onclose = function (e) {
        console.log('Disconnected from websocket.  Reconnect attempt in 1 second...', e.reason);
        apollosLocalMessage('Disconnected from game server', 'error');
        document.getElementById('message_close')?.addEventListener('click', () => {
            window.location.reload();
        });
        setTimeout(() => {
            connect();
            retryInterval *= 2;
        }, retryInterval);
        clearTimeout(heartbeatTimeout);
    }

    socket.onmessage = function (e) {
        let data = JSON.parse(e.data);
        console.log(data);
        // Get current player
        
        
        if ('payload' in data) {
            data = data['payload'];
            if (data['type'] == 'move') {
                magic_game.takeTurn(data, makeMove);
            } else if (data['type'] == 'redirect') {
                console.log("Redirect message received");
                apollosLocalMessage(data['reason'], 'info')
                document.getElementById('message_close')?.addEventListener('click', () => {
                    window.location.href = data['url'];
                });
            } else if (data['type'] == 'error') {
                apollosServerMessage(data['error'], 'error');
            }
        } else {
            console.warn('No payload in message: ', data);
        }
    }

}



magic15();
connect();
// setUpNumberEventListeners();