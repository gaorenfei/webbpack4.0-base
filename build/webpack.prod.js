const merge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"); // 压缩css代码
const HappyPack = require("happypack"); //多线程运行
const CleanWebpackPlugin = require('clean-webpack-plugin'); //每次打打包清除上次打包内容
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // css单独打包
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');  //将dll文件引入html
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer") // 打包后显示打包文件细节
    .BundleAnalyzerPlugin;
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin') // 为模块提供中间缓存，提升第二次打包构建速度可以替换DLL插件
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin"); //分析各个loader编译时间和add插件有冲突
// const smp = new SpeedMeasurePlugin();

module.exports = (env, argv) => 
  merge(commonConfig(env, argv), {
    mode: 'production',
    devtool: 'source-map', // 生产环境可在浏览器上调试源码，不建议，这样会暴露源码。可设置为none
    module: {
      rules: [
          {
              test: /\.css$/,
              include: path.join(__dirname, '../src'),
              use: [MiniCssExtractPlugin.loader, "css-loader"]
          },
          {
            test: /\.less/,
            use: [
                MiniCssExtractPlugin.loader,
                { loader: "css-loader" },
                { loader: "less-loader",
                  options: {
                    javascriptEnabled: true
                  }
                }
            ]
          },
          {
              test: /\.(js|jsx)$/,
              loader: "happypack/loader?id=babel",
              // loader: 'babel-loader?cacheDirectory=true',// babel缓存开启 极大提高打包速度
              include: path.join(__dirname, "../src"),
              exclude: /node_modules/
          }
      ]
    },
    plugins: [
        new CleanWebpackPlugin(path.join(__dirname, "../dist"), {
          root: path.join(__dirname, "../")
        }),
        new BundleAnalyzerPlugin(), // 打包后显示打包文件细节
        new HappyPack({
          //多线程运行 默认是电脑核数-1
          id: "babel", //对于loaders id
          loaders: ["babel-loader"], //是用babel-loader解析
          threadPool: HappyPack.ThreadPool({ size: 4 }),
          verboseWhenProfiling: true //显示信息
        }),
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[name].chunk.css"
        }),
        new AddAssetHtmlWebpackPlugin({ //将dll文件引入html
          filepath: path.resolve(__dirname, '../dll/vendor.dll.js')
        }),
        new webpack.DllReferencePlugin({ //webpack打包时根据manifest.json文件,排除不需要打包处理的第三方依赖文件
          manifest: path.resolve(__dirname, '../dll/manifest.json')
        }),
    ],
    optimization: {
      usedExports: true, // tree shaking  package.json中也做了css排除配置
      splitChunks: {
        chunks: "all",
        minSize: 30000, // 3 to 10 because of gzip
        minChunks: 2, // 共享该module的最小chunk数
        maxAsyncRequests: 10,
        maxInitialRequests: 3,
        automaticNameDelimiter: "-",
        name: true
      },
      minimizer: [
        new OptimizeCSSAssetsPlugin()   // 压缩css代码，去掉空格这些，在安装在生产环境下
      ]
    }
  });
// module.exports = smp.wrap(prodConfig)