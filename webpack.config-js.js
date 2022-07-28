const path = require('path');

module.exports = {
    entry: './src/index.js',
    devtool: 'source-map',

    devServer: {
        port: 4100,
        static: {
            directory: path.join(__dirname, 'docs'),
            serveIndex: true,
        },
    },

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
