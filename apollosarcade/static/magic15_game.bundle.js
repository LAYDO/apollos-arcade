/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./static/js/magic15.ts":
/*!******************************!*\
  !*** ./static/js/magic15.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.MagicFifteenBoard = exports.FifteenCard = void 0;\nclass FifteenCard {\n    constructor(title, radio1, radio2, button, _element, callback, csrfToken) {\n        this.csrfToken = csrfToken;\n        // Parent and card container, taking on apollos-container styling\n        this.parentElement = _element;\n        this.cardContainer = document.createElement('div');\n        this.cardContainer.classList.add('apollos-container');\n        // Typical title for apollos-container\n        this.title = document.createElement('div');\n        this.title.classList.add('container-title');\n        this.title.textContent = title;\n        // Form\n        this.cardForm = document.createElement('form');\n        this.cardForm.classList.add('mft-col');\n        this.cardForm.setAttribute('action', button.toLowerCase());\n        this.cardForm.setAttribute('method', 'post');\n        // Radio row\n        let radRow = document.createElement('div');\n        radRow.classList.add('mft-row-b');\n        // Radio columns\n        let radCol1 = document.createElement('div');\n        radCol1.classList.add('mft-col');\n        radCol1.setAttribute('style', 'margin-right:1rem;'); // For a little space between the lads\n        let radCol2 = document.createElement('div');\n        radCol2.classList.add('mft-col');\n        // Radio options\n        this.radio1 = document.createElement('input');\n        this.radio1.setAttribute('type', 'radio');\n        this.radio1.id = radio1.toLowerCase();\n        this.radio1.setAttribute('name', button.toLowerCase());\n        this.radio1.setAttribute('value', radio1);\n        this.radio1.addEventListener('click', () => {\n            this.hideText();\n        });\n        let r1 = document.createElement('label');\n        r1.setAttribute('for', radio1.toLowerCase());\n        r1.textContent = radio1;\n        radCol1.append(r1);\n        radCol1.append(this.radio1);\n        let break1 = document.createElement('br');\n        this.radio2 = document.createElement('input');\n        this.radio2.setAttribute('type', 'radio');\n        this.radio2.id = radio2.toLowerCase();\n        this.radio2.setAttribute('name', button.toLowerCase());\n        this.radio2.setAttribute('value', radio2);\n        this.radio2.addEventListener('click', () => {\n            this.showText();\n        });\n        let r2 = document.createElement('label');\n        r2.setAttribute('for', radio2.toLowerCase());\n        r2.textContent = radio2;\n        radCol2.append(r2);\n        radCol2.append(this.radio2);\n        radRow.append(radCol1);\n        radRow.append(radCol2);\n        // Text option label\n        this.textLabel = document.createElement('label');\n        this.textLabel.setAttribute('for', `${button.toLowerCase()}TextOption`);\n        this.textLabel.textContent = button.toLowerCase() == 'create' ? 'Password' : 'Lobby Number';\n        this.textLabel.setAttribute('style', 'display: none;');\n        this.textLabel.id = `${button.toLowerCase()}TextLabel`;\n        // Text option\n        this.textOption = document.createElement('input');\n        this.textOption.setAttribute('style', 'display: none;');\n        this.textOption.setAttribute('type', 'text');\n        this.textOption.setAttribute('autocomplete', 'off');\n        this.textOption.setAttribute('name', `${button.toLowerCase()}_option`);\n        this.textOption.id = `${button.toLowerCase()}TextOption`;\n        this.textOption.classList.add('mft-text');\n        this.textOption.setAttribute('placeholder', button.toLowerCase() == 'create' ? 'Password' : 'Lobby Number');\n        // Password label\n        this.passwordLabel = document.createElement('label');\n        this.passwordLabel.setAttribute('for', `${button.toLowerCase()}_password`);\n        this.passwordLabel.textContent = 'Password';\n        this.passwordLabel.setAttribute('style', 'display: none;');\n        this.passwordLabel.id = `${button.toLowerCase()}_password_label`;\n        // Password\n        this.password = document.createElement('input');\n        this.password.setAttribute('style', 'display: none;');\n        this.password.setAttribute('type', 'password');\n        this.password.setAttribute('name', 'password');\n        this.password.id = `${button.toLowerCase()}_password`;\n        this.password.classList.add('mft-text');\n        let buttRow = document.createElement('div');\n        buttRow.classList.add('mft-row-b');\n        this.button = document.createElement('input');\n        this.button.classList.add('mft-button');\n        this.button.setAttribute('type', 'submit');\n        this.button.setAttribute('value', button);\n        let cancel = document.createElement('div');\n        cancel.classList.add('mft-button');\n        cancel.textContent = 'CANCEL';\n        cancel.addEventListener('click', () => {\n            callback();\n        });\n        buttRow.append(this.button);\n        buttRow.append(cancel);\n        this.cardForm.append(radRow);\n        this.cardForm.append(break1);\n        this.cardForm.append(break1);\n        this.cardForm.append(this.textLabel);\n        this.cardForm.append(this.textOption);\n        if (button.toLowerCase() == 'join') {\n            this.cardForm.append(break1);\n            this.cardForm.append(this.passwordLabel);\n            this.cardForm.append(this.password);\n        }\n        this.cardForm.append(break1);\n        this.cardForm.append(buttRow);\n        this.addCsrfTokenToForm(this.cardForm);\n        this.cardContainer.append(this.title);\n        this.cardContainer.append(this.cardForm);\n        this.parentElement.append(this.cardContainer);\n    }\n    show() {\n        this.parentElement.setAttribute('style', 'display:block;');\n    }\n    hide() {\n        this.parentElement.setAttribute('style', 'display:none;');\n    }\n    showText() {\n        this.textLabel.setAttribute('style', 'display: inherit;');\n        this.textOption.setAttribute('style', 'display: inherit;');\n        this.passwordLabel.setAttribute('style', 'display: inherit;');\n        this.password.setAttribute('style', 'display: inherit;');\n    }\n    hideText() {\n        this.textLabel.setAttribute('style', 'display: none;');\n        this.textOption.setAttribute('style', 'display: none;');\n        this.passwordLabel.setAttribute('style', 'display: none;');\n        this.password.setAttribute('style', 'display: none;');\n    }\n    addCsrfTokenToForm(formElement) {\n        const csrfInput = document.createElement(\"input\");\n        csrfInput.type = \"hidden\";\n        csrfInput.name = \"csrfmiddlewaretoken\";\n        csrfInput.value = this.csrfToken;\n        formElement.appendChild(csrfInput);\n    }\n}\nexports.FifteenCard = FifteenCard;\n// I want to make a class for the ttt-board within magic_fifteen_game.html\nclass MagicFifteenBoard {\n    constructor(board) {\n        this.round = 0;\n        this.player1Turn = true;\n        this.player2Turn = false;\n        this.board = board;\n        this.plays = [];\n        this.spaces = [0, 0, 0, 0, 0, 0, 0, 0, 0];\n        this.isMobile = window.matchMedia(\"only screen and (max-width: 48rem)\").matches;\n        this.selectedNumber = 0;\n        this.selectedSquare = -1;\n        const contextData = document.getElementById('context-data');\n        if (contextData === null || contextData === void 0 ? void 0 : contextData.dataset.plays) {\n            this.plays = JSON.parse(contextData === null || contextData === void 0 ? void 0 : contextData.dataset.plays);\n        }\n        if (contextData === null || contextData === void 0 ? void 0 : contextData.dataset.spaces) {\n            this.spaces = JSON.parse(contextData === null || contextData === void 0 ? void 0 : contextData.dataset.spaces);\n        }\n        const gameId = contextData === null || contextData === void 0 ? void 0 : contextData.dataset.gameId;\n        const round = contextData === null || contextData === void 0 ? void 0 : contextData.dataset.round;\n        const player1 = contextData === null || contextData === void 0 ? void 0 : contextData.dataset.player1;\n        const player2 = contextData === null || contextData === void 0 ? void 0 : contextData.dataset.player2;\n        const p1 = contextData === null || contextData === void 0 ? void 0 : contextData.dataset.p1;\n        const p2 = contextData === null || contextData === void 0 ? void 0 : contextData.dataset.p2;\n        const privacy = contextData === null || contextData === void 0 ? void 0 : contextData.dataset.privacy;\n        const user = contextData === null || contextData === void 0 ? void 0 : contextData.dataset.user;\n        if (!this.isMobile) {\n            this.board.classList.add('ttt-row');\n        }\n        this.squares = document.createElement('div');\n        this.squares.classList.add('ttt-col');\n        this.squares.id = 'mftSquares';\n        this.squares.setAttribute('game_id', gameId || '');\n        let localCount = 0;\n        for (let i = 0; i < 3; i++) {\n            let squareRow = document.createElement('div');\n            squareRow.classList.add('ttt-row');\n            squareRow.id = `squareRow${i}`;\n            for (let j = 0; j < 3; j++) {\n                let square = document.createElement('div');\n                square.classList.add('mft-square');\n                square.id = `square${localCount}`;\n                switch (i) {\n                    case 0:\n                    case 1:\n                        if (j < 2) {\n                            square.classList.add('ttt-border-right');\n                            square.classList.add('ttt-border-bottom');\n                        }\n                        else {\n                            square.classList.add('ttt-border-bottom');\n                        }\n                        break;\n                    case 2:\n                        if (j < 2) {\n                            square.classList.add('ttt-border-right');\n                        }\n                        break;\n                    default:\n                        break;\n                }\n                if (this.spaces[localCount] == 0) {\n                    square.textContent = '';\n                }\n                else {\n                    square.textContent = this.spaces[localCount].toString();\n                }\n                squareRow.append(square);\n                localCount++;\n            }\n            this.squares.append(squareRow);\n        }\n        this.playerArea = document.createElement('div');\n        this.playerArea.classList.add('ttt-col-b');\n        this.playerArea.id = 'ftPlayerArea';\n        this.playerNumbers = document.createElement('div');\n        this.playerNumbers.classList.add('ttt-row-b');\n        this.numbersOdd = document.createElement('div');\n        this.numbersOdd.classList.add('ttt-row-numbers');\n        this.numbersEven = document.createElement('div');\n        this.numbersEven.classList.add('ttt-row-numbers');\n        for (let i = 1; i < 10; i++) {\n            if (this.plays.length >= 0 && !this.plays.includes(i)) {\n                let number = document.createElement('div');\n                number.classList.add('ttt-number');\n                number.textContent = `${i}`;\n                number.id = `number${i}`;\n                if (i % 2 == 0) {\n                    this.numbersEven.append(number);\n                }\n                else {\n                    this.numbersOdd.append(number);\n                }\n            }\n        }\n        this.titleOdd = document.createElement('div');\n        this.titleOdd.classList.add('ttt-player');\n        this.titleOdd.textContent = (player1 === null || player1 === void 0 ? void 0 : player1.toString()) || 'Player 1';\n        this.titleEven = document.createElement('div');\n        this.titleEven.classList.add('ttt-player');\n        this.titleEven.textContent = (player2 === null || player2 === void 0 ? void 0 : player2.toString()) || 'Player 2';\n        this.playerOdd = document.createElement('div');\n        this.playerOdd.classList.add('ttt-col-top');\n        this.playerOdd.append(this.titleOdd);\n        this.playerOdd.append(this.numbersOdd);\n        this.playerOdd.id = 'player_one_numbers';\n        this.playerEven = document.createElement('div');\n        this.playerEven.classList.add('ttt-col-top');\n        this.playerEven.append(this.titleEven);\n        this.playerEven.append(this.numbersEven);\n        this.playerEven.id = 'player_two_numbers';\n        if (round && parseInt(round) % 2 == 0) {\n            this.playerEven.classList.remove('disabled');\n            this.playerOdd.classList.add('disabled');\n            this.player2Turn = true;\n            this.player1Turn = false;\n        }\n        else {\n            this.playerOdd.classList.remove('disabled');\n            this.playerEven.classList.add('disabled');\n            this.player1Turn = true;\n            this.player2Turn = false;\n        }\n        this.playerNumbers.append(this.playerOdd);\n        this.playerNumbers.append(this.playerEven);\n        this.playerArea.append(this.playerNumbers);\n        this.board.append(this.squares);\n        this.board.append(this.playerArea);\n    }\n    setUpSquareEventListeners(callback) {\n        // Construct and append squares to board\n        // this.squares.innerHTML = '';\n        for (let i = 0; i < 9; i++) {\n            let square = document.getElementById(`square${i}`);\n            if (square != null) {\n                square.addEventListener('click', () => {\n                    var _a;\n                    try {\n                        if ((square === null || square === void 0 ? void 0 : square.textContent) != '') {\n                            throw new Error('Square already taken!');\n                        }\n                        if (this.selectedSquare == -1) {\n                            square.classList.add('ttt-square-selected');\n                            this.selectedSquare = parseInt(square.id.slice(-1));\n                        }\n                        else if (this.selectedSquare >= 0) {\n                            if (document.getElementById(`square${this.selectedSquare}`)) {\n                                (_a = document.getElementById(`square${this.selectedSquare}`)) === null || _a === void 0 ? void 0 : _a.classList.remove('ttt-square-selected');\n                            }\n                            square.classList.add('ttt-square-selected');\n                            this.selectedSquare = parseInt(square.id.slice(-1));\n                        }\n                        else {\n                            square.classList.remove('ttt-square-selected');\n                            this.selectedSquare = -1;\n                        }\n                        if (this.selectedSquare != -1 && this.selectedNumber != 0) {\n                            console.log(`Selected square: ${this.selectedSquare} and number: ${this.selectedNumber}`);\n                            callback(this.selectedSquare, this.selectedNumber);\n                        }\n                    }\n                    catch (e) {\n                        console.log(e);\n                        let messageDiv = document.getElementById('messageModal');\n                        let messageContent = document.getElementById('messageContent');\n                        if (messageDiv && messageContent != null) {\n                            messageContent.textContent = e;\n                            messageContent.classList.add('alert-error');\n                            messageDiv.style.display = 'block';\n                        }\n                    }\n                });\n            }\n        }\n    }\n    setUpNumberEventListeners(callback) {\n        for (let i = 1; i < 10; i++) {\n            let number = document.getElementById(`number${i}`);\n            if (number != null) {\n                number.addEventListener('click', () => {\n                    if (document.querySelectorAll('.ttt-number-selected').length == 0) {\n                        number === null || number === void 0 ? void 0 : number.classList.add('ttt-number-selected');\n                        if (number === null || number === void 0 ? void 0 : number.textContent) {\n                            this.selectedNumber = parseInt(number.textContent);\n                        }\n                    }\n                    else if (document.querySelectorAll('.ttt-number-selected').length == 1) {\n                        document.querySelectorAll('.ttt-number-selected')[0].classList.remove('ttt-number-selected');\n                        number === null || number === void 0 ? void 0 : number.classList.add('ttt-number-selected');\n                        if (number === null || number === void 0 ? void 0 : number.textContent) {\n                            this.selectedNumber = parseInt(number.textContent);\n                        }\n                    }\n                    else {\n                        number === null || number === void 0 ? void 0 : number.classList.remove('ttt-number-selected');\n                        this.selectedNumber = 0;\n                    }\n                    // callback to makeMove\n                    if (this.selectedSquare != -1 && this.selectedNumber != 0) {\n                        console.log(`Selected square: ${this.selectedSquare} and number: ${this.selectedNumber}`);\n                        callback(this.selectedSquare, this.selectedNumber);\n                    }\n                });\n            }\n        }\n    }\n}\nexports.MagicFifteenBoard = MagicFifteenBoard;\n\n\n//# sourceURL=webpack:///./static/js/magic15.ts?");

/***/ }),

/***/ "./static/js/magic15_game.ts":
/*!***********************************!*\
  !*** ./static/js/magic15_game.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst magic15_1 = __webpack_require__(/*! ./magic15 */ \"./static/js/magic15.ts\");\nlet selectedElement = '';\nlet magic_game;\nlet game_id;\n// Websocket stuff\nlet connectionString;\nlet socket;\nlet retryInterval = 1000;\nlet heartbeatInterval = 30000; // 30 seconds\nlet heartbeatTimeout;\nfunction magic15() {\n    var _a;\n    let board = document.getElementById('magic15_board');\n    if (board) {\n        board.innerHTML = '';\n        magic_game = new magic15_1.MagicFifteenBoard(board);\n        magic_game.setUpSquareEventListeners(makeMove);\n        magic_game.setUpNumberEventListeners(makeMove);\n        game_id = ((_a = document.getElementById('context-data')) === null || _a === void 0 ? void 0 : _a.dataset.gameId) || '';\n        connectionString = (window.location.protocol === 'https:') ? `wss://${window.location.host}/ws/game/${game_id}/` : `ws://${window.location.host}/ws/game/${game_id}/`;\n        socket = new WebSocket(connectionString);\n    }\n}\nfunction makeMove(square, play) {\n    let _square = square;\n    let _play = play;\n    let data = {\n        'type': 'move',\n        'message': {\n            'game_id': parseInt(game_id),\n            'user_id': getCurrentUserId(),\n            'space': _square,\n            'play': _play\n        }\n    };\n    socket.send(JSON.stringify(data));\n}\nfunction sendHeartbeat() {\n    if (socket.readyState !== socket.OPEN) {\n        socket.send(JSON.stringify({ type: 'heartbeat' }));\n    }\n    heartbeatTimeout = setTimeout(sendHeartbeat, heartbeatInterval);\n}\nfunction connect() {\n    socket.onopen = function open() {\n        console.log('Connected to websocket');\n        sendHeartbeat();\n    };\n    socket.onclose = function (e) {\n        console.log('Disconnected from websocket.  Reconnect attempt in 1 second...', e.reason);\n        setTimeout(() => {\n            connect();\n            retryInterval *= 2;\n        }, retryInterval);\n        clearTimeout(heartbeatTimeout);\n    };\n    socket.onmessage = function (e) {\n        let data = JSON.parse(e.data);\n        console.log(data);\n        // Get current player\n        let currentPlayer = data['payload']['round'] % 2 === 0 ? data['payload']['p2'] : data['payload']['p1'];\n        if ('payload' in data) {\n            data = data['payload'];\n            if (data['type'] == 'move') {\n                // Update the current round\n                let roundDiv = document.getElementById('current_round');\n                if (roundDiv) {\n                    roundDiv.textContent = `Round: ${data['round']}`;\n                }\n                // Update the spaces on the board\n                for (let i = 0; i < data['spaces'].length; i++) {\n                    let square = document.getElementById(`square${i}`);\n                    if (square) {\n                        square.classList.remove('ttt-square-selected');\n                        if (data['spaces'][i] == 0) {\n                            square.textContent = '';\n                        }\n                        else {\n                            square.textContent = data['spaces'][i];\n                        }\n                    }\n                }\n                let p1Numbers = document.getElementById('player_one_numbers');\n                let p2Numbers = document.getElementById('player_two_numbers');\n                // Update the current player\n                if (data['round'] % 2 == 0) {\n                    p2Numbers === null || p2Numbers === void 0 ? void 0 : p2Numbers.classList.remove('disabled');\n                    p1Numbers === null || p1Numbers === void 0 ? void 0 : p1Numbers.classList.add('disabled');\n                }\n                else {\n                    p1Numbers === null || p1Numbers === void 0 ? void 0 : p1Numbers.classList.remove('disabled');\n                    p2Numbers === null || p2Numbers === void 0 ? void 0 : p2Numbers.classList.add('disabled');\n                }\n                // Update the player one numbers\n                const playerOneNumbersContainer = p1Numbers === null || p1Numbers === void 0 ? void 0 : p1Numbers.querySelector('.ttt-row-numbers');\n                if (playerOneNumbersContainer) {\n                    playerOneNumbersContainer.innerHTML = '';\n                    for (let i = 1; i < 10; i++) {\n                        if ((i) % 2 !== 0 && !data['plays'].includes((i))) {\n                            const numberDiv = document.createElement('div');\n                            numberDiv.className = 'ttt-number';\n                            numberDiv.id = 'number' + i;\n                            numberDiv.textContent = (i).toString();\n                            playerOneNumbersContainer.appendChild(numberDiv);\n                        }\n                    }\n                }\n                // Update the player two numbers\n                const playerTwoNumbersContainer = p2Numbers === null || p2Numbers === void 0 ? void 0 : p2Numbers.querySelector('.ttt-row-numbers');\n                if (playerTwoNumbersContainer) {\n                    playerTwoNumbersContainer.innerHTML = '';\n                    for (let i = 1; i < 10; i++) {\n                        if ((i) % 2 === 0 && !data['plays'].includes((i))) {\n                            const numberDiv = document.createElement('div');\n                            numberDiv.className = 'ttt-number';\n                            numberDiv.id = 'number' + i;\n                            numberDiv.textContent = (i).toString();\n                            playerTwoNumbersContainer.appendChild(numberDiv);\n                        }\n                    }\n                }\n                // Set up the numbers' event listeners for each message\n                magic_game.selectedSquare = -1;\n                magic_game.selectedNumber = 0;\n                magic_game.setUpNumberEventListeners(makeMove);\n                // magic_game.setUpSquareEventListeners(makeMove);\n                // Check if the current user can play a move\n                if (currentPlayer === getCurrentUserId()) {\n                    let appElement = document.getElementById('magic15_app');\n                    appElement === null || appElement === void 0 ? void 0 : appElement.classList.remove('turn-disable');\n                }\n                else {\n                    let appElement = document.getElementById('magic15_app');\n                    appElement === null || appElement === void 0 ? void 0 : appElement.classList.add('turn-disable');\n                }\n            }\n            else if (data['type'] == 'redirect') {\n                console.log(\"Redirect message received\");\n                window.location.href = data['url'];\n            }\n            else if (data['type'] == 'error') {\n                let serverMessage = data['error'];\n                let userIdRegex = /User:\\s*(\\d+)/;\n                let matchedUserId = serverMessage.match(userIdRegex);\n                let userIdFromMessage = matchedUserId ? parseInt(matchedUserId[1]) : null;\n                let errorMessageRegex = /Error:\\s*([^\\n]+)/;\n                let matchedErrorMessage = serverMessage.match(errorMessageRegex);\n                let errorMessage = matchedErrorMessage ? matchedErrorMessage[1] : null;\n                if (userIdFromMessage === getCurrentUserId() && errorMessage) {\n                    // Want to only show alert to the user who made the error\n                    let messageDiv = document.getElementById('messageModal');\n                    let messageContent = document.getElementById('messageContent');\n                    if (messageDiv && messageContent) {\n                        messageContent.textContent = errorMessage;\n                        messageContent.classList.add('alert-error');\n                        messageDiv.style.display = 'block';\n                    }\n                }\n            }\n        }\n        else {\n            console.warn('No payload in message: ', data);\n        }\n    };\n}\nfunction getCurrentUserId() {\n    var _a;\n    let appElement = document.getElementById('magic15_app');\n    let id = (_a = (appElement === null || appElement === void 0 ? void 0 : appElement.dataset.userId)) === null || _a === void 0 ? void 0 : _a.toString();\n    if (id) {\n        return parseInt(id);\n    }\n    else {\n        throw new Error('User id not found');\n    }\n}\nmagic15();\nconnect();\n// setUpNumberEventListeners();\n\n\n//# sourceURL=webpack:///./static/js/magic15_game.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__("./static/js/magic15.ts");
/******/ 	var __webpack_exports__ = __webpack_require__("./static/js/magic15_game.ts");
/******/ 	
/******/ })()
;