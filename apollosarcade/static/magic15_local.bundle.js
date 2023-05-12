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

/***/ "./static/js/ttt.ts":
/*!**************************!*\
  !*** ./static/js/ttt.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.TicTacToe = void 0;\nclass TicTacToe {\n    constructor(board) {\n        this.round = 0;\n        this.player1Turn = true;\n        this.player2Turn = false;\n        this.board = board;\n        this.plays = [];\n        this.isMobile = window.matchMedia(\"only screen and (max-width: 48rem)\").matches;\n        this.selectedElement = '';\n        if (!this.isMobile) {\n            this.board.classList.add('ttt-row');\n        }\n        this.squares = document.createElement('div');\n        this.squares.classList.add('ttt-col');\n        this.playerArea = document.createElement('div');\n        this.playerArea.classList.add('ttt-col-b');\n        this.playerNumbers = document.createElement('div');\n        this.playerNumbers.classList.add('ttt-row-b');\n        this.numbersOdd = document.createElement('div');\n        this.numbersOdd.classList.add('ttt-row-numbers');\n        this.numbersEven = document.createElement('div');\n        this.numbersEven.classList.add('ttt-row-numbers');\n        let localCount = 0;\n        for (let i = 0; i < 3; i++) {\n            let squareRow = document.createElement('div');\n            squareRow.classList.add('ttt-row');\n            squareRow.id = `squareRow${i}`;\n            for (let j = 0; j < 3; j++) {\n                let s = document.createElement('div');\n                s.classList.add('ttt-square');\n                s.id = `square${localCount}`;\n                switch (i) {\n                    case 0:\n                    case 1:\n                        if (j < 2) {\n                            s.classList.add('ttt-border-right');\n                            s.classList.add('ttt-border-bottom');\n                        }\n                        else {\n                            s.classList.add('ttt-border-bottom');\n                        }\n                        break;\n                    case 2:\n                        if (j < 2) {\n                            s.classList.add('ttt-border-right');\n                        }\n                        break;\n                    default:\n                        break;\n                }\n                squareRow.append(s);\n                localCount++;\n            }\n            this.squares.append(squareRow);\n        }\n        // Construct and append numbers to player areas\n        for (let i = 0; i < 9; i++) {\n            let number = i + 1;\n            let text = document.createElement('div');\n            text.classList.add('ttt-number');\n            text.textContent = number.toFixed(0);\n            text.id = `text${i}`;\n            text.addEventListener('click', () => {\n                if (document.querySelectorAll('.selected').length == 0) {\n                    text.classList.add('selected');\n                    if (text.textContent) {\n                        this.selectedElement = text.textContent;\n                    }\n                }\n                else if (document.querySelectorAll('.selected').length == 1) {\n                    document.querySelectorAll('.selected')[0].classList.remove('selected');\n                    text.classList.add('selected');\n                    if (text.textContent) {\n                        this.selectedElement = text.textContent;\n                    }\n                }\n                else {\n                    text.classList.remove('selected');\n                    this.selectedElement = '';\n                }\n            });\n            if (number % 2 == 0) {\n                this.numbersEven.append(text);\n            }\n            else {\n                this.numbersOdd.append(text);\n            }\n            for (let n of this.numbersEven.children) {\n                n.classList.add('disabled');\n            }\n        }\n        // Titles\n        this.titleOdd = document.createElement('div');\n        this.titleOdd.classList.add('ttt-player');\n        this.titleOdd.textContent = 'Player 1';\n        this.titleEven = document.createElement('div');\n        this.titleEven.classList.add('ttt-player');\n        this.titleEven.textContent = 'Player 2';\n        // Player Containers\n        this.playerOdd = document.createElement('div');\n        this.playerOdd.classList.add('ttt-col-top');\n        this.playerOdd.append(this.titleOdd);\n        this.playerOdd.append(this.numbersOdd);\n        this.playerEven = document.createElement('div');\n        this.playerEven.classList.add('ttt-col-top');\n        this.playerEven.append(this.titleEven);\n        this.playerEven.append(this.numbersEven);\n        this.playerNumbers.append(this.playerOdd);\n        this.playerNumbers.append(this.playerEven);\n        this.playerArea.append(this.playerNumbers);\n        // Append squares and numbers\n        this.board.append(this.squares);\n        this.board.append(this.playerArea);\n        this.winningArrays = [\n            [0, 1, 2],\n            [3, 4, 5],\n            [6, 7, 8],\n            [0, 3, 6],\n            [1, 4, 7],\n            [2, 5, 8],\n            [0, 4, 8],\n            [2, 4, 6]\n        ];\n        let row = document.createElement('div');\n        row.classList.add('ttt-row');\n        this.restartButton = document.createElement('div');\n        this.restartButton.classList.add('ttt-restart');\n        this.restartButton.textContent = 'Restart';\n        row.append(this.restartButton);\n        this.playerArea.append(row);\n    }\n    drawEnd(n) {\n        this.numbersOdd.innerHTML = '';\n        this.numbersEven.innerHTML = '';\n        switch (n) {\n            case 1:\n                this.playerOdd.innerHTML = '';\n                this.playerEven.innerHTML = '';\n                this.playerOdd.textContent = 'TIE';\n                break;\n            case 2:\n                if (!this.player1Turn) {\n                    this.playerEven.innerHTML = '';\n                    this.numbersOdd.innerHTML = 'WINS';\n                }\n                else {\n                    this.playerOdd.innerHTML = '';\n                    this.numbersEven.innerHTML = 'WINS';\n                }\n                break;\n            default:\n                break;\n        }\n    }\n}\nexports.TicTacToe = TicTacToe;\n\n\n//# sourceURL=webpack:///./static/js/ttt.ts?");

/***/ }),

/***/ "./static/js/ttt_game.ts":
/*!*******************************!*\
  !*** ./static/js/ttt_game.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst ttt_1 = __webpack_require__(/*! ./ttt */ \"./static/js/ttt.ts\");\nlet game;\nlet lastRender = 0;\nlet round = 0;\nlet plays = ['', '', '', '', '', '', '', '', ''];\nfunction init() {\n    let board = document.getElementById('tttBoard');\n    if (board) {\n        board.innerHTML = '';\n        game = new ttt_1.TicTacToe(board);\n        game.restartButton.addEventListener('click', init);\n        window.requestAnimationFrame(loop);\n    }\n}\nfunction update(progress) {\n    // Update the state of the game for the elapsed time since last render\n    for (let s = 0; s < 9; s++) {\n        let square = document.getElementById(`square${s}`);\n        square === null || square === void 0 ? void 0 : square.addEventListener('click', () => {\n            if (game.selectedElement != null || game.selectedElement != \"\") {\n                let t = document.getElementById(`text${parseInt(game.selectedElement) - 1}`);\n                if (t) {\n                    t.classList.remove('selected');\n                    square === null || square === void 0 ? void 0 : square.append(t);\n                    game.plays[s] = parseInt(game.selectedElement);\n                    game.selectedElement = '';\n                    game.round++;\n                    game.player1Turn = !game.player1Turn;\n                    game.player2Turn = !game.player2Turn;\n                    for (let n of game.numbersOdd.children) {\n                        n.classList.toggle('disabled');\n                    }\n                    for (let n of game.numbersEven.children) {\n                        n.classList.toggle('disabled');\n                    }\n                }\n            }\n        });\n    }\n}\nfunction loop(timestamp) {\n    // let timestamp = new Date();\n    let progress = timestamp - lastRender;\n    update(progress);\n    checkWin(game);\n    lastRender = timestamp;\n    window.requestAnimationFrame(loop);\n}\nfunction checkWin(game) {\n    if (game.round < 9) {\n        // Run thru winning arrays to check win\n        for (let i of game.winningArrays) {\n            let temp = [];\n            for (let j of i) {\n                temp.push(game.plays[j]);\n            }\n            if (temp.reduce((a, b) => a + b, 0) == 15) {\n                game.drawEnd(2);\n            }\n        }\n    }\n    else {\n        // Catch for tie\n        game.drawEnd(1);\n    }\n}\ninit();\n\n\n//# sourceURL=webpack:///./static/js/ttt_game.ts?");

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
/******/ 	__webpack_require__("./static/js/ttt.ts");
/******/ 	var __webpack_exports__ = __webpack_require__("./static/js/ttt_game.ts");
/******/ 	
/******/ })()
;