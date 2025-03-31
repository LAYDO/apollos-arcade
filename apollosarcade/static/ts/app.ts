let overlay = document.getElementById('apollos_overlay');
let navbar = document.getElementById('apollos_navbar');
let home = document.getElementById('apollos_home');
let navTitle = document.getElementById('apollosNavTitle');
if (navTitle) {
    navTitle.addEventListener('click', () => {
        window.location.href = '/';
    });
}
let navIcon = document.getElementById('apollosNavIcon');
if (navIcon) {
    navIcon.addEventListener('click', toggleOverlay);
}
let themeIcon = document.getElementById('themeIcon');
if (themeIcon) {
    themeIcon.addEventListener('click', toggleTheme);
}
let menuNavTitle = document.getElementById('menuNavTitle');
if (menuNavTitle) {
    menuNavTitle.addEventListener('click', () => {
        window.location.href = '/';
    });
}

let prevScrollPos = window.scrollY;
window.onscroll = () => {
    let currentScrollPos = window.scrollY;
    if (prevScrollPos > currentScrollPos && navbar) {
        navbar.style.transform = "translateY(0)";
    } else if (home && navbar && home.getBoundingClientRect().top >= 0) {
        navbar.style.transform = "translateY(0)";
    } else if (navbar) {
        navbar.style.transform = "translateY(-100%)";
    }
    prevScrollPos = currentScrollPos;
}

// Sets theme
if (localStorage.getItem('theme') === 'theme-dark') {
    setTheme('theme-dark');
} else {
    setTheme('theme-light');
}

function toggleOverlay() {
    if (!navIcon || !overlay) {
        return;
    }
    navIcon.classList.toggle('change');
    if (navIcon.classList.contains('change')) {
        document.body.style.overflow = 'hidden';
        overlay.style.display = "flex";
    } else {
        document.body.style.overflow = 'auto';
        overlay.style.display = "none";
    }
}

// DARK/LIGHT THEME credit to 
// https://medium.com/@haxzie/dark-and-light-theme-switcher-using-css-variables-and-pure-javascript-zocada-dd0059d72fa2

function toggleTheme() {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-light');
    } else {
        setTheme('theme-dark');
    }
}

function setTheme(themeName: string) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}


document.addEventListener("DOMContentLoaded", function () {
    let modal = document.getElementById("messageModal");
    let span = document.getElementById("message_close");

    if (span) {
        span.onclick = function () {
            if (modal) {
                modal.style.display = "none";
            }
        };
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            if (modal) {
                modal.style.display = "none";
            }
        }
    };
});

let socials = document.getElementsByClassName('socicon');
for (let i = 0; i < socials.length; i++) {
    socials[i].addEventListener('click', openSocial);
}

function openSocial(event: Event) {
    let element = event.target as HTMLElement;
    let social = element.id.replace("Icon", "").toLowerCase();
    switch (social) {
        case 'twitter':
            window.open("https://twitter.com/_apollosarcade");
            break;
        case 'instagram':
            window.open("https://www.instagram.com/_apollosarcade/");
            break;
        default:
            break;
    }
}
