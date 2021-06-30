# webpack-moduleFederation

time: 2021-06-28 15:42:44  
author: heyunjiang

## 背景

最近在做微前端相关调研，尝试使用 webpack5 最新功能 module federation 来实现，同时也在跟进 webpack5 最新知识点

## 1 基础知识归纳

参考 [实例](https://github.com/module-federation/module-federation-examples/blob/master/advanced-api/dynamic-remotes/app1/src/App.js)  
说明：webpack 官方文档写的比较垃圾，只有一些概念上的东西，不太方便理解，给了一些 demo，具体 api 配置还是得看源码

个人问题归纳  
1. shared module 没有打成独立的包，怎么去实现共享的呢？
2. 远程加载 remote js 文件，通常是跨域的，需要配置服务器跨域设置。qiankun也有这个问题吗？
3. 为什么非得使用 import() 来启动包含 moduleFederation 的项目？
4. 使用 require.ensure() 和 imort() 动态导入模块

## 2 遇到的问题总结

### 2.1 Uncaught Error: Shared module is not available for eager consumption

问题描述：在配置 shared 共享模块时，js 执行报错，前端无法渲染  
初步解决方案：webpack entry 由 main.js 切换到 index.js，index.js 代码为 `import('./main.js')`

为什么会有这个错误？

### 2.2 script-loader SyntaxError: Cannot use import statement outside a module

问题描述：在使用 `import Task from 'taskAnalysis/task'` import 命令直接引入模块时报错，使用 import() 方法也会报错  
问题分析：项目中使用到了 script-loader，现在该 loader 已经停止维护了，使用 `asset/source` 替换掉

### 2.3 Failed to resolve async component return __webpack_require__.e Loading script failed

问题描述：在 vue 中使用 import() 动态加载组件时报错  
解决方案：在 modulefederation 配置中增加 library 配置，因为 webpack 内部是通过增加一个 entry 来实现的这个功能。默认 library 输出为 var，我们可以修改 type 为 umd 来实现在 vue 中使用

### 2.4 ChunkLoadError: Loading chunk xxxx

问题描述：在加载到 remoteEntry 入口文件时，webpack runtime 文件会发请求去获取相关组件依赖文件。我这里是因为配置了默认的 chunkFilename 为 `[name].[contenthash:8].js`，但是 mf 发的请求却是 `[name].undefined.js`
解决方案：

## 参考文章

[webpack 官方](https://webpack.docschina.org/concepts/module-federation/)  
[moduleFeration demo](https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes)  
[mf 在线体验](https://stackblitz.com/github/webpack/webpack.js.org/tree/master/examples/module-federation?file=app2%2Fwebpack.config.js&terminal=start&terminal=)
