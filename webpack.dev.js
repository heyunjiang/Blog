 const path = require('path');
 const merge = require('webpack-merge');
 const common = require('./webpack.common.js');
 const webpack = require('webpack');

 module.exports = merge(common, {
 	devtool: 'inline-source-map',
 	devServer: {
 		contentBase: path.join(__dirname, "dist"),
 		compress: true,
 		port: 9000,
 		hot: true
 	},
 	plugins: common.plugins.concat([
 		new webpack.NamedModulesPlugin(),
    	new webpack.HotModuleReplacementPlugin()
 	])
 });