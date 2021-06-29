# webpack-moduleFederation

time: 2021-06-28 15:42:44  
author: heyunjiang

## 背景

最近在做微前端相关调研，尝试使用 webpack5 最新功能 module federation 来实现，同时也在跟进 webpack5 最新知识点

## 1 基础知识归纳

1. 

个人问题归纳  
1. shared module 没有打成独立的包，怎么去实现共享的呢？
2. 远程加载 remote js 文件，通常是跨域的，需要配置服务器跨域设置。qiankun也有这个问题吗？

## 2 遇到的问题总结

### 2.1 Uncaught Error: Shared module is not available for eager consumption

问题描述：在配置 shared 共享模块时，js 执行报错，前端无法渲染  
初步解决方案：webpack entry 由 main.js 切换到 index.js，index.js 代码为 `import('./main.js')`

为什么会有这个错误？

### 2.2 script-loader SyntaxError: Cannot use import statement outside a module

问题描述：在使用 `import Task from 'taskAnalysis/task'` import 命令直接引入模块时报错，使用 import() 方法也会报错  
问题分析：项目中使用到了 script-loader，现在该 loader 已经停止维护了，使用 `asset/source` 替换掉

## 参考文章

[webpack 官方](https://webpack.docschina.org/concepts/module-federation/)  
[moduleFeration demo](https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes)  
[mf 在线体验](https://stackblitz.com/github/webpack/webpack.js.org/tree/master/examples/module-federation?file=app2%2Fwebpack.config.js&terminal=start&terminal=)
