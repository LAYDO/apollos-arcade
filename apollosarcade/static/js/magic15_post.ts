import { MagicFifteenPost } from "./MagicFifteenPost";

function magicFifteenPost() {
    let app = document.getElementById('magicFifteenPost');
    if (app) {
        let magicFifteenPost = new MagicFifteenPost(app);
        magicFifteenPost.drawLine();
    }
}

magicFifteenPost();