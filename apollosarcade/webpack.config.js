const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    entry: {
        app: './static/js/app.ts',
        home: './static/js/home.ts',
        magic15_home: './static/js/magic15_home.ts',
        magic15_start: ['./static/js/magic15.ts','./static/js/magic15_start.ts'],
        magic15_lobby: ['./static/js/magic15.ts','./static/js/magic15_lobby.ts'],
        magic15_game: ['./static/js/magic15.ts', './static/js/magic15_game.ts'],
        magic15_post: './static/js/magic15_lobby.ts',
        magic15_local: ['./static/js/ttt.ts', './static/js/ttt_game.ts'],
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
        path: path.resolve(__dirname, './static'),
    },
    plugins: [
        new BundleTracker({ filename: './webpack-stats.json' }),
    ],
};
