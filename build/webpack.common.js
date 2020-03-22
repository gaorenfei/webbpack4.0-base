
const path = require('path');
const config = require('./config');
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
	return{
        entry: {
            main: path.join(__dirname, '../src/main.js'),
        },
        output: {
            chunkFilename: '[name].[contenthash:6].js', // 按需加载文件名称
            filename: 'app.js', // 打包后文件名为app.js
            path: path.resolve(__dirname, '../dist'), //打包后的文件资源在dist文件下
            publicPath: '/',
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpg|gif|woff|woff2)$/,
                    include: config.srcPath,
                    loader: 'url-loader?limit=8192&name=images/[hash:8].[name].[ext]',
                    exclude: /node_modules/,
                },
                {
                    test: /\.(ttf|eot|mp4|ogg|svg)$/,
                    include: config.srcPath,
                    loader: 'file-loader',
                    exclude: /node_modules/,
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.jsx', '.vue'],
            alias: { // 引入模块别名
                src: `${config.srcPath}`,
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: path.resolve(__dirname, '../index.html'), //样板
                inject: 'body',//注入到哪里
                chunksSortMode: 'none',
                hash: true,
            }),
            new webpack.DefinePlugin({
                NODE_ENV: JSON.stringify(env.NODE_ENV) // 定义环境变量
            })
        ]
    }
}