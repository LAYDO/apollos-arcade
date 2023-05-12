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

/***/ "./static/js/home.ts":
/*!***************************!*\
  !*** ./static/js/home.ts ***!
  \***************************/
/***/ (() => {

eval("\nlet mft = document.getElementById('magic_fifteen');\nif (mft) {\n    drawLogo(mft);\n    mft.addEventListener('click', () => {\n        window.location.href = '/magic_fifteen';\n    });\n}\nfunction drawLogo(_element) {\n    if (_element != null) {\n        let width = _element.clientWidth;\n        width = width * 0.9;\n        let sWidth = width / 3;\n        let start = sWidth / 7;\n        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');\n        svg.setAttribute('width', width + 'px');\n        svg.setAttribute('height', width + 'px');\n        for (let i = 0; i < 3; i++) {\n            let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');\n            for (let j = 0; j < 5; j++) {\n                let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');\n                line.setAttribute('stroke', 'var(--font-color)');\n                line.setAttribute('stroke-width', '2.5');\n                if (j != 4) {\n                    line.setAttribute('x1', ((j * (sWidth / 4)) + start).toFixed(0));\n                    line.setAttribute('x2', ((j * (sWidth / 4)) + start).toFixed(0));\n                    line.setAttribute('y1', '3');\n                    line.setAttribute('y2', `${sWidth - 3}`);\n                }\n                else {\n                    line.setAttribute('x1', (((j - 1) * (sWidth / 4)) + start).toFixed(0));\n                    line.setAttribute('x2', (start).toFixed(0));\n                    line.setAttribute('y1', '3');\n                    line.setAttribute('y2', `${sWidth - 3}`);\n                }\n                g.append(line);\n            }\n            if (i == 1) {\n                g.setAttribute('transform', `translate(0,${sWidth * 1.1})`);\n            }\n            svg.append(g);\n            start += sWidth;\n        }\n        _element.append(svg);\n    }\n}\n\n\n//# sourceURL=webpack:///./static/js/home.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./static/js/home.ts"]();
/******/ 	
/******/ })()
;