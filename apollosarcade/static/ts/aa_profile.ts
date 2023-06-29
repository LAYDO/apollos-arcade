import { Profile } from './Profile';

function aa_profile() {
    let app = document.getElementById('aa_profile');
    let data = document.getElementById('context-data-profile');
    if (app && data) {
        new Profile(app, data);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    aa_profile();
});