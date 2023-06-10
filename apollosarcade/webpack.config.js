const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    entry: {
        app: ['./static/ts/app.ts', './static/ts/utils.ts'],
        home: './static/ts/home.ts',
        aa_local: ['./static/ts/LocalGame.ts'],
        aa_start: ['./static/ts/GameStart.ts'],
        aa_game: ['./static/ts/MultiplayerGame.ts', './static/ts/LocalGame.ts', './static/ts/GameSocket.ts', './static/ts/ApollosSocket.ts'],
        aa_lobby: ['./static/ts/MultiplayerLobby.ts', './static/ts/LobbySocket.ts', './static/ts/ApollosSocket.ts'],
        // aa_post: ['./static/ts/PostGame.ts', './static/ts/PostGameSocket.ts', './static/ts/ApollosSocket.ts'],
        magic15_home: './static/ts/magic15_home.ts',
        magic15_start: ['./static/ts/StartCard.ts','./static/ts/magic15_start.ts'],
        magic15_lobby: ['./static/ts/magic15_lobby.ts', './static/ts/MagicFifteenLobby.ts'],
        magic15_game: ['./static/ts/MagicFifteenBoard.ts', './static/ts/magic15_game.ts'],
        magic15_post: ['./static/ts/MagicFifteenPost.ts','./static/ts/magic15_post.ts'],
        magic15_local: ['./static/ts/ttt.ts', './static/ts/ttt_game.ts'],
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, './static/dist/'),
    },
    plugins: [
        new BundleTracker({ filename: './webpack-stats.json' }),
    ],
};
