import { MagicFifteenBoard } from './magic15';

let selectedElement = '';
let magic_game: MagicFifteenBoard;
let game_id: string;

// Websocket stuff
let connectionString: string;
let socket : WebSocket;
let retryInterval = 1000;
let heartbeatInterval = 30000; // 30 seconds
let heartbeatTimeout: any;

function magic15() {
    let board = document.getElementById('magic15_board');
    if (board) {
        board.innerHTML = '';
        magic_game = new MagicFifteenBoard(board);
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
        let currentPlayer = data['payload']['round'] % 2 === 0 ? data['payload']['p2'] : data['payload']['p1'];


        if ('payload' in data) {
            data = data['payload'];
            if (data['type'] == 'move') {
                // Update the current round
                let roundDiv = document.getElementById('current_round');
                if (roundDiv) {
                    roundDiv.textContent = `Round: ${data['round']}`;
                }
                // Update the spaces on the board
                for (let i = 0; i < data['spaces'].length; i++) {
                    let square = document.getElementById(`square${i}`);
                    if (square) {
                        square.classList.remove('ttt-square-selected');
                        if (data['spaces'][i] == 0) {
                            square.textContent = '';
                        } else {
                            square.textContent = data['spaces'][i];
                        }
                    }
                }

                let p1Numbers = document.getElementById('player_one_numbers');
                let p2Numbers = document.getElementById('player_two_numbers');

                // Update the current player
                if (data['round'] % 2 == 0) {
                    p2Numbers?.classList.remove('disabled');
                    p1Numbers?.classList.add('disabled');
                } else {
                    p1Numbers?.classList.remove('disabled');
                    p2Numbers?.classList.add('disabled');
                }
                // Update the player one numbers
                const playerOneNumbersContainer = p1Numbers?.querySelector('.ttt-row-numbers');
                if (playerOneNumbersContainer) {
                    playerOneNumbersContainer.innerHTML = '';
                    for (let i = 1; i < 10; i++) {
                        if ((i) % 2 !== 0 && !data['plays'].includes((i))) {
                            const numberDiv = document.createElement('div');
                            numberDiv.className = 'ttt-number';
                            numberDiv.id = 'number' + i;
                            numberDiv.textContent = (i).toString();
                            playerOneNumbersContainer.appendChild(numberDiv);
                        }
                    }
                }

                // Update the player two numbers
                const playerTwoNumbersContainer = p2Numbers?.querySelector('.ttt-row-numbers');
                if (playerTwoNumbersContainer) {
                    playerTwoNumbersContainer.innerHTML = '';
                    for (let i = 1; i < 10; i++) {
                        if ((i) % 2 === 0 && !data['plays'].includes((i))) {
                            const numberDiv = document.createElement('div');
                            numberDiv.className = 'ttt-number';
                            numberDiv.id = 'number' + i;
                            numberDiv.textContent = (i).toString();
                            playerTwoNumbersContainer.appendChild(numberDiv);
                        }
                    }
                }

                // Set up the numbers' event listeners for each message
                magic_game.selectedSquare = -1;
                magic_game.selectedNumber = 0;
                magic_game.setUpNumberEventListeners(makeMove);
                // magic_game.setUpSquareEventListeners(makeMove);

                // Check if the current user can play a move


                if (currentPlayer === getCurrentUserId()) {
                    let appElement = document.getElementById('magic15_app');
                    appElement?.classList.remove('turn-disable');
                } else {
                    let appElement = document.getElementById('magic15_app');
                    appElement?.classList.add('turn-disable');
                }
            } else if (data['type'] == 'redirect') {
                console.log("Redirect message received");
                window.location.href = data['url'];
            } else if (data['type'] == 'error') {
                let serverMessage = data['error'];
                let userIdRegex = /User:\s*(\d+)/;
                let matchedUserId = serverMessage.match(userIdRegex);
                let userIdFromMessage = matchedUserId ? parseInt(matchedUserId[1]) : null;

                let errorMessageRegex = /Error:\s*([^\n]+)/;
                let matchedErrorMessage = serverMessage.match(errorMessageRegex);
                let errorMessage = matchedErrorMessage ? matchedErrorMessage[1] : null;

                if (userIdFromMessage === getCurrentUserId() && errorMessage) {
                    // Want to only show alert to the user who made the error
                    let messageDiv = document.getElementById('messageModal');
                    let messageContent = document.getElementById('messageContent');
                    if (messageDiv && messageContent) {
                        messageContent.textContent = errorMessage;
                        messageContent.classList.add('alert-error');
                        messageDiv.style.display = 'block';
                    }
                }
            }
        } else {
            console.warn('No payload in message: ', data);
        }
    }

}

function getCurrentUserId() {
    let appElement = document.getElementById('magic15_app');
    let id = (appElement?.dataset.userId)?.toString();
    if (id) {
        return parseInt(id);
    } else {
        throw new Error('User id not found');
    }
}



magic15();
connect();
// setUpNumberEventListeners();