const path = require('path');

module.exports = {
    entry: './src/index.js',
    devtool: 'source-map',

    watch: true,
    watchOptions: {
        followSymlinks: true
    },

    devServer: {
        port: 4100,
        liveReload: true,
        static: {
            directory: path.join(__dirname, 'dist'),
            serveIndex: true,
            watch: true
        },
    },

    output: {
        filename: 'kasimir-editor.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
