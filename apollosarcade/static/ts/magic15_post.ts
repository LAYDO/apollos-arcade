import { MagicFifteenPost } from "./MagicFifteenPost";

function magicFifteenPost() {
    let app = document.getElementById('aa_post');
    let data = document.getElementById('context-data-post');
    if (app && data) {
        let magicFifteenPost = new MagicFifteenPost(app, data);
        magicFifteenPost.drawLine();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    magicFifteenPost();
});