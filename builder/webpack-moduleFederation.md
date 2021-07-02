# webpack-moduleFederation

time: 2021-06-28 15:42:44  
author: heyunjiang

## 背景

最近在做微前端相关调研，尝试使用 webpack5 最新功能 module federation 来实现，同时也在跟进 webpack5 最新知识点

## 1 基础知识归纳

参考 [实例](https://github.com/module-federation/module-federation-examples/blob/master/advanced-api/dynamic-remotes/app1/src/App.js)  
说明：webpack 官方文档写的比较垃圾，只有一些概念上的东西，不太方便理解，给了一些 demo，具体 api 配置还是得看源码。结合 emp 源码一起学习

个人问题归纳  
1. shared module 没有打成独立的包，怎么去实现共享的呢？
2. 远程加载 remote js 文件，通常是跨域的，需要配置服务器跨域设置。qiankun也有这个问题吗？
3. 为什么非得使用 import() 来启动包含 moduleFederation 的项目？
4. vue 项目远程加载组件，能加载组件实例吗？看看 createElement 生成 vnode 时能实现不
5. vue2 能加载 vue3 实例不？因为直接加载组件配置文件肯定是不行的，他们依赖的 vue 版本不同
6. vue 组件配置能加 vuex, router 配置吗？

注意事项：  
1. remote 需要控制好 output.pablicPath，不然 host 可能加载不到资源
2. 可以通过 library.type 设置为 umd，来实现通用模块的加载

## 2 遇到的问题总结

### 2.1 Uncaught Error: Shared module is not available for eager consumption

问题描述：在配置 shared 共享模块时，js 执行报错，前端无法渲染  
初步解决方案：webpack entry 由 main.js 切换到 index.js，index.js 代码为 `import('./main.js')`

为什么会有这个错误？

### 2.2 script-loader SyntaxError: Cannot use import statement outside a module

问题描述：在使用 `import Task from 'taskAnalysis/task'` import 命令直接引入模块时报错，使用 import() 方法也会报错  
问题分析：项目中使用到了 script-loader，现在该 loader 已经停止维护了  
解决方案：使用 `asset/source` 替换掉

### 2.3 Failed to resolve async component return __webpack_require__.e Loading script failed

问题描述：在 vue 中使用 import() 动态加载组件时报错，默认在 modulefederation 插件中 library.type 为 var   
解决方案：在 modulefederation 配置中增加 library 配置，因为 webpack 内部是通过增加一个 entry 来实现的这个功能。默认 library 输出为 var，我们可以修改 type 为 umd 来实现在 vue 中使用。
加载方式需要支持 module 才行。并且要在 host 端启动 scriptType 为 module，和 environment.module = true。注意 remote 不能把 runtime 独立出去，否则也会报这个错

从这里总结 webpack 一个知识点：library 有什么用    
答：library 是控制输出为 cdn 等引用库时，可以指定资源脚本类型，可以为 var, umd, module 等

### 2.4 ChunkLoadError: Loading chunk xxxx failed

问题描述：在加载到 remoteEntry 入口文件时，webpack runtime 文件会发请求去获取相关组件依赖文件。没有请求 remote 的域名，是自身的域名
解决方案：我在 remote 项目中指明了 `publicPath: '/'`，所以 host 项目会默认从当前域名去查找，需要我们指明 remote 的 public path，或者不指定，它会根据 host 中的 remotes 来取值

从这里总结 webpack 一个知识点：path 和 publicPath 有什么区别  
答：path 是指定静态资源存储的绝对路径，比如通常存储在 `path.join(__dirname, './dist')` 目录下；publicPath 是指定资源文件访问时的前缀路径，在打包结果中是 `__webpack_require__.p` 的值

### 2.5 

问题描述：

## 3 工作原理

目标归纳：把项目中的某些组件资源打成独立的 js 文件，或者整个项目作为资源使用，打包成独立 js 文件。

### 3.1 remote 工作原理

## 参考文章

[webpack 官方](https://webpack.docschina.org/concepts/module-federation/)  
[moduleFeration demo](https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes)  
[mf 在线体验](https://stackblitz.com/github/webpack/webpack.js.org/tree/master/examples/module-federation?file=app2%2Fwebpack.config.js&terminal=start&terminal=)
