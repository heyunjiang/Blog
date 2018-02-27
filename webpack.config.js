const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/index.js'
    // print: './src/print.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  plugins: [
    //在这里配置：https://github.com/jantimon/html-webpack-plugin
    new HtmlWebpackPlugin({
      title: 'html模板',
      filename: 'index.html',
    }),
    new CleanWebpackPlugin(['dist']),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
  	rules: [
  		{
  			test: /\.css$/,
  			use: ['style-loader','css-loader']
        // test: /\.scss$/,
        // use: ['style-loader','css-loader','sass-loader']
  		}
  	]
  },
  devtool: 'inline-source-map',//开发时使用，定位报错地点
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
    hot: true
  }
};