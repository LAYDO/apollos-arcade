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

/***/ "./static/js/app.ts":
/*!**************************!*\
  !*** ./static/js/app.ts ***!
  \**************************/
/***/ (() => {

eval("\nlet overlay = document.getElementById('apollos_overlay');\nlet navbar = document.getElementById('apollos_navbar');\nlet home = document.getElementById('apollos_home');\nlet navTitle = document.getElementById('apollosNavTitle');\nif (navTitle) {\n    navTitle.addEventListener('click', () => {\n        window.location.href = '/';\n    });\n}\nlet navIcon = document.getElementById('apollosNavIcon');\nif (navIcon) {\n    navIcon.addEventListener('click', toggleOverlay);\n}\nlet themeIcon = document.getElementById('themeIcon');\nif (themeIcon) {\n    themeIcon.addEventListener('click', toggleTheme);\n}\nlet prevScrollPos = window.scrollY;\nwindow.onscroll = () => {\n    let currentScrollPos = window.scrollY;\n    if (prevScrollPos > currentScrollPos && navbar) {\n        navbar.style.top = \"0px\";\n    }\n    else if (home && navbar && home.getBoundingClientRect().top >= 0) {\n        navbar.style.top = \"0px\";\n    }\n    else if (navbar) {\n        navbar.style.top = \"-50px\";\n    }\n    prevScrollPos = currentScrollPos;\n};\n// Sets theme\nif (localStorage.getItem('theme') === 'theme-dark') {\n    setTheme('theme-dark');\n}\nelse {\n    setTheme('theme-light');\n}\nfunction toggleOverlay() {\n    if (!navIcon || !overlay) {\n        return;\n    }\n    navIcon.classList.toggle('change');\n    if (navIcon.classList.contains('change')) {\n        document.body.style.overflow = 'hidden';\n        overlay.style.display = \"flex\";\n    }\n    else {\n        document.body.style.overflow = 'auto';\n        overlay.style.display = \"none\";\n    }\n}\n// DARK/LIGHT THEME credit to \n// https://medium.com/@haxzie/dark-and-light-theme-switcher-using-css-variables-and-pure-javascript-zocada-dd0059d72fa2\nfunction toggleTheme() {\n    if (localStorage.getItem('theme') === 'theme-dark') {\n        setTheme('theme-light');\n    }\n    else {\n        setTheme('theme-dark');\n    }\n}\nfunction setTheme(themeName) {\n    localStorage.setItem('theme', themeName);\n    document.documentElement.className = themeName;\n}\nfunction openSocial(evt) {\n    let social = evt.currentTarget.id.replace(\"Icon\", \"\").toLowerCase();\n    if (social === \"twitter\") {\n        window.open(\"https://www.twitter.com/apollos1213\");\n    }\n    else if (social === \"linked\") {\n        window.open(\"https://www.linkedin.com/in/landen-robinson-97683620/\");\n    }\n    else if (social === \"github\") {\n        window.open(\"https://github.com/apollos\");\n    }\n}\ndocument.addEventListener(\"DOMContentLoaded\", function () {\n    let modal = document.getElementById(\"messageModal\");\n    let span = document.getElementById(\"message_close\");\n    if (span) {\n        span.onclick = function () {\n            if (modal) {\n                modal.style.display = \"none\";\n            }\n        };\n    }\n    window.onclick = function (event) {\n        if (event.target == modal) {\n            if (modal) {\n                modal.style.display = \"none\";\n            }\n        }\n    };\n});\n\n\n//# sourceURL=webpack:///./static/js/app.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./static/js/app.ts"]();
/******/ 	
/******/ })()
;