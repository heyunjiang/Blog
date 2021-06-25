# webpack5功能总结

time: 2021-04-02 10:45:57  
author: heyunjiang

## 背景

最近在做 webpack 源码分析，发现一些代码点不好阅读，需要调试来看调用栈；有一个待优化项目，用的是 vue-cli-service 来构建，使用 webpack4 功能，我切换到 webpack5，看看有什么亮点

1. module federation
2. Assets modules
3. output.clean 清理 dist
4. 多入口共享公共依赖：dependOn + shared + SplitChunksPlugin
5. 使用 webWorker 时，不需要再使用 worker-loader
6. node 配置项注入的全局 node 变量变更，webpack5 只支持 global, __filename, __dirname，不再支持 path, fs 等，需要使用 resolve.fallback 来控制，比如

```javascript
// webpack5 node 全局变量支持
resolve: {
  fallback: {
    path: 'path-browserify'
  }
}
```

## 1 module federation

分享内容大纲  
1. 微前端实现方案一种
2. 内部模块加载实现原理
3. 模块打包输出原理
4. 共享模块实现原理，对比 externals
5. 使用场景

## 2 支持模块类型

webpack 模块化，包含了 es module, commonjs module, amd module, assets module, webassembly module  
归纳如下要点  
1. 代码中可以同时使用 import 和 require 写法
2. 字体、图标、图片等文件，不需要再使用 file-loader 或 url-loader 处理了，webpack 内部提供了对其的处理。咋处理的？

内置资源模块增加如下类型  
1. asset/resource 输出文件，并导出 url，替代之前的 file-loader
2. asset/inline 输出文件 data uri，同 asset/resource 不同的是，inline 是将资源转换成了类似 base64 的 uri，替代之前的 url-loader
3. asset/source 输出文件源代码 string，替代之前的 raw-loader
4. asset 小于 8kb 时使用 inline，大于时使用 resource。当然可以修改 Rule.parser.dataUrlCondition.maxSize 阈值

## 推荐配置

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')
const CopyWebpackPlugin = require("copy-webpack-plugin")

function resolve(dir) {
  return path.join(__dirname, dir)
}

const mode = 'production'

module.exports = {
  mode,
  entry: './src/main.js',
  output: {
    path: resolve('dist'),
    filename: 'static/js/[name].[contenthash:8].js',
    publicPath: '/',
    chunkFilename: 'static/js/[name].[contenthash:8].js',
    assetModuleFilename: 'static/assets/[hash][ext][query]',
    clean: true
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    port: 8081,
    disableHostCheck: true,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    }
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single'
  },
  resolve: {
    alias: {
      '@': resolve('src')
    },
    extensions: ['.js', '.json', '.vue']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('index.html')
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve('public'),
          to: resolve('dist'),
          toType: 'dir'
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.scss$/i,
        use: ['vue-style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset'
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@vue/babel-preset-jsx'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: 'vue-loader'
      }
    ]
  }
}

```

日常思考 - webpack 深入  
1. 编写 webpack cli 脚手架 https://webpack.docschina.org/api/cli/#init

## 参考文章

[EMP 原理](https://github.com/efoxTeam/emp/wiki/%E3%80%8Amodule-Federation%E5%8E%9F%E7%90%86%E5%AD%A6%E4%B9%A0%E3%80%8B)
[资源模块](https://webpack.docschina.org/guides/asset-modules/)  
[moduleFeration demo](https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes)  
[mf 在线体验](https://stackblitz.com/github/webpack/webpack.js.org/tree/master/examples/module-federation?file=app2%2Fwebpack.config.js&terminal=start&terminal=)
[webpack5 2021 roadmap](https://webpack.docschina.org/blog/2020-12-08-roadmap-2021/)
