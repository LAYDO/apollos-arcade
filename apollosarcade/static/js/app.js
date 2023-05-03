"use strict";
let overlay = document.getElementById('apollos_overlay');
let navbar = document.getElementById('apollos_navbar');
let home = document.getElementById('apollos_home');
let prevScrollPos = window.scrollY;
window.onscroll = () => {
    let currentScrollPos = window.scrollY;
    if (prevScrollPos > currentScrollPos && navbar) {
        navbar.style.top = "0px";
    }
    else if (home && navbar && home.getBoundingClientRect().top >= 0) {
        navbar.style.top = "0px";
    }
    else if (navbar) {
        navbar.style.top = "-50px";
    }
    prevScrollPos = currentScrollPos;
};
// Sets theme
if (localStorage.getItem('theme') === 'theme-dark') {
    setTheme('theme-dark');
}
else {
    setTheme('theme-light');
}
function redirect(evt) {
    var y = document.getElementsByClassName('active');
    for (var i = 0; i < y.length; i++) {
        y[i].className = '';
    }
    if (evt.currentTarget.id == 'apollosNavTitle') {
        window.location.pathname = '';
    }
    else {
        window.location.pathname = evt.currentTarget.id.toLowerCase();
        // document.getElementById(window.location.pathname).className = 'active';
    }
}
function toggleOverlay() {
    let navIcon = document.getElementById('apollosNavIcon');
    if (!navIcon || !overlay) {
        return;
    }
    navIcon.classList.toggle('change');
    if (navIcon.classList.contains('change')) {
        document.body.style.overflow = 'hidden';
        overlay.style.display = "flex";
    }
    else {
        document.body.style.overflow = 'auto';
        overlay.style.display = "none";
    }
}
// DARK/LIGHT THEME credit to 
// https://medium.com/@haxzie/dark-and-light-theme-switcher-using-css-variables-and-pure-javascript-zocada-dd0059d72fa2
function toggleTheme() {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-light');
    }
    else {
        setTheme('theme-dark');
    }
}
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}
function openSocial(evt) {
    let social = evt.currentTarget.id.replace("Icon", "").toLowerCase();
    if (social === "twitter") {
        window.open("https://www.twitter.com/apollos1213");
    }
    else if (social === "linked") {
        window.open("https://www.linkedin.com/in/landen-robinson-97683620/");
    }
    else if (social === "github") {
        window.open("https://github.com/apollos");
    }
}
