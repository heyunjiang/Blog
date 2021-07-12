# webpack5功能总结

time: 2021-04-02 10:45:57  
author: heyunjiang

分享大纲：2021-07-12 16:24:33  
1. webpack 调试方法
2. webpack 核心构建流程，compiler 及 compilation 归纳
3. webpack5 最新技术点，核心亮点是啥？
4. moduleFederation 实现的微前端
10. webpack 未来方向

## 更新技术点归纳

最近在做 webpack 源码分析，发现一些代码点不好阅读，需要调试来看调用栈；有一个待优化项目，用的是 vue-cli-service 来构建，使用 webpack4 功能，我切换到 webpack5，看看有什么亮点  
1. module federation 实现微前端
2. Assets module 代替 url-loader 等
3. library.type 支持 module 模式，是如何支持的？
4. 持久性缓存提高构建性能？本地构建
5. 长期缓存优化，包含更好的算法和默认 hash，特指生产环境
6. 减小包大小：优化后的 tree-shaking 和 codeGeneration

其他小点
1. output.clean 清理 dist
2. 多入口共享公共依赖：dependOn + shared + SplitChunksPlugin
3. 使用 webWorker 时，不需要再使用 worker-loader
4. node 配置项注入的全局 node 变量变更，webpack5 只支持 global, __filename, __dirname，不再支持 path, fs 等，需要使用 resolve.fallback 来控制，比如
```javascript
// webpack5 node 全局变量支持
resolve: {
  fallback: {
    path: 'path-browserify'
  }
}
```
5. v4 内部代码结构优化

## 1 module federation

分享内容大纲  
1. 微前端实现方案一种
2. 内部模块加载实现原理
3. 模块打包输出原理
4. 共享模块实现原理，对比 externals
5. 使用场景

npm 也可以分享

## 2 Assets module

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

const mode = 'development'

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

## 临时想法

认知不足  
1. 未来发展焦虑：目前工作无人指导，项目无挑战，担心未来缺乏竞争力
2. 个人缺少沟通，不了解团队信息。领导无沟通，自己也觉得沟通没有必要
3. 缺少热爱那股劲，比如篮球、工作、生活，自己有点咸鱼了

个人强化发展  
1. 做核心技术
2. 关注 vue conf, 早早聊 等前端大会，了解行业发展趋势

## 参考文章

[EMP 原理](https://github.com/efoxTeam/emp/wiki/%E3%80%8Amodule-Federation%E5%8E%9F%E7%90%86%E5%AD%A6%E4%B9%A0%E3%80%8B)
[资源模块](https://webpack.docschina.org/guides/asset-modules/)  
[moduleFeration demo](https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes)  
[mf 在线体验](https://stackblitz.com/github/webpack/webpack.js.org/tree/master/examples/module-federation?file=app2%2Fwebpack.config.js&terminal=start&terminal=)
[webpack5 2021 roadmap](https://webpack.docschina.org/blog/2020-12-08-roadmap-2021/)  
[webpack4 升级指南](https://webpack.docschina.org/migrate/5/)
