const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
   entry: {
     app: './src/index.js'
   },
   plugins: [
     new CleanWebpackPlugin(['dist']),
     new HtmlWebpackPlugin({
      title: 'html模板',
      filename: 'index.html',
     })
   ],
   module: {
  	 rules: [
  		{
  			test: /\.css$/,
  			use: ['style-loader','css-loader']
  		}
  	 ]
   },
   output: {
     filename: '[name].bundle.js',
     chunkFilename: '[name].bundle.js', //非入口文件直接引入的，即动态引入的bundle文件
     path: path.resolve(__dirname, 'dist')
   }
};