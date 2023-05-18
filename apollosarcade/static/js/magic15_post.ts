import { MagicFifteenPost } from "./MagicFifteenPost";

declare var csrfToken: string;

function magicFifteenPost() {
    let app = document.getElementById('magicFifteenPost');
    if (app) {
        let magicFifteenPost = new MagicFifteenPost(app, csrfToken);
        magicFifteenPost.drawLine();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    magicFifteenPost();
});