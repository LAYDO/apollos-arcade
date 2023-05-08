let selectedElement = '';
let game_id = document.getElementById('mftSquares')?.getAttribute('game_id');

// Websocket stuff
let connectionString = (window.location.protocol === 'https:') ? `wss://${window.location.host}/ws/game/${game_id}/` : `ws://${window.location.host}/ws/game/${game_id}/`;
let socket = new WebSocket(connectionString);
let retryInterval = 1000;
let heartbeatInterval = 30000; // 30 seconds
let heartbeatTimeout: any;

// Initialize the board
for (let i = 0; i < 9; i++) {
    let square = document.getElementById(`square${i}`);
    square?.addEventListener('click', () => {
        if (selectedElement != null || selectedElement != '') {
            let selectedSquare = square?.id.slice(-1);
            if (square?.textContent) {
                throw new Error('Square already has a value');
            }
            if (selectedSquare) {
                console.log(`Trying to place ${selectedElement} in square ${selectedSquare}`);
                makeMove(selectedSquare, selectedElement);
            }
        }
    })
}

// Initialize event listeners for the numbers
function setUpNumberEventListeners() {
    for (let i = 0; i < 9; i++) {
        let text = document.getElementById(`text${i}`);
        text?.addEventListener('click', () => {
            if (document.querySelectorAll('.selected').length == 0) {
                text?.classList.add('selected');
                if (text?.textContent) {
                    selectedElement = text.textContent;
                }
            } else if (document.querySelectorAll('.selected').length == 1) {
                document.querySelectorAll('.selected')[0].classList.remove('selected');
                text?.classList.add('selected');
                if (text?.textContent) {
                    selectedElement = text.textContent;
                }
            } else {
                text?.classList.remove('selected');
                selectedElement = '';
            }
        });
    }
}

function makeMove(square: string, play: string) {
    let _square = parseInt(square);
    let _play = parseInt(play);
    let data = {
        'type': 'move',
        'message': {
            'game_id': game_id,
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
        
        // Get current player
        let currentPlayer = data['payload']['round'] % 2 === 0 ? data['payload']['p2'] : data['payload']['p1'];


        if ('payload' in data) {
            data = data['payload'];
            if (data['type'] == 'move') {
                let roundDiv = document.getElementById('current_round');
                if (roundDiv) {
                    roundDiv.textContent = `Round: ${data['round']}`;
                }
                for (let i = 0; i < data['spaces'].length; i++) {
                    let square = document.getElementById(`square${i}`);
                    if (square) {
                        if (data['spaces'][i] == 0) {
                            square.textContent = '';
                        } else {
                            square.textContent = data['spaces'][i];
                        }
                    }
                }

                let p1Numbers = document.getElementById('player_one_numbers');
                let p2Numbers = document.getElementById('player_two_numbers');

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
                    for (let i = 0; i < 9; i++) {
                        if ((i + 1) % 2 !== 0 && !data['plays'].includes((i + 1))) {
                            const numberDiv = document.createElement('div');
                            numberDiv.className = 'ttt-number';
                            numberDiv.id = 'text' + i;
                            numberDiv.textContent = (i + 1).toString();
                            playerOneNumbersContainer.appendChild(numberDiv);
                        }
                    }
                }

                // Update the player two numbers
                const playerTwoNumbersContainer = p2Numbers?.querySelector('.ttt-row-numbers');
                if (playerTwoNumbersContainer) {
                    playerTwoNumbersContainer.innerHTML = '';
                    for (let i = 0; i < 9; i++) {
                        if ((i + 1) % 2 === 0 && !data['plays'].includes((i + 1))) {
                            const numberDiv = document.createElement('div');
                            numberDiv.className = 'ttt-number';
                            numberDiv.id = 'text' + i;
                            numberDiv.textContent = (i + 1).toString();
                            playerTwoNumbersContainer.appendChild(numberDiv);
                        }
                    }
                }

                // Set up the numbers' event listeners for each message
                selectedElement = '';
                setUpNumberEventListeners();

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



connect();
setUpNumberEventListeners();