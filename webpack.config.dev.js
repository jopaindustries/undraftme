const merge = require('webpack-merge');
const base = require('./webpack.config.base');

module.exports = merge(base, {
    mode: 'development',
    devServer: {
        contentBase: './dist',
        allowedHosts: [
            '.ngrok.io',
            'vk.com'
        ],
        host: '0.0.0.0',
        port: '10880',
        publicPath: '/',
        historyApiFallback: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {}
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader",
                        options: {}
                    },
                    {
                        loader: "less-loader"
                    }
                ]
            }
        ]
    }
});