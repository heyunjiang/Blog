# webpack-模块化

time: 2021-06-10 20:26:44  
author: heyunjiang

## 问题

最近在深入了解 webpack 时，有了一些模块化相关的疑惑  
1. webpack 构建是走 nodejs commonjs，模块化是 require + module.exports，为什么我们代码中能写 import export 呢？内置支持多种模块化写法
2. webpack 最终打包结果又是使用的模拟 commonjs 模块化，使用 `__webpack_require__` 加载模块，也就是说最终并没有 commonjs or es6 的模块化，对于这2者的模块化特点是如何处理的？
3. webpack 的模块化是加载 chunk，是如何实现 commonjs 的加载模块只执行一次并缓存起来？webpack 模块和 commonjs 有啥差异？

同时在学习比较 webpack, commonjs, es6 的模块化，之前也大致了解了 c++, python 的模块化相关知识

> 这里基于 webpack 5 来说明

## 1 webpack 模块基础知识

webpack 是模拟的 commonjs 加载模块，webpack 模块也叫做 chunk，是将多个源文件打包成限定大小的单文件模块。

webpack 支持的模块，不需要使用 loader  
1. es module
2. commonjs module
3. amd module
4. Assets module
5. WebAssembly module

还有如下模块需要我们使用 loader  
1. ts 使用 
2. es next 使用 babel
3. sass, less, stylus
4. elm-lang js 写法

相关问题  
1. webpack 是如何实现 es module 和 commonjs module 共存的？最终跑在浏览器中是什么代码，与各模块化有什么差异？
2. commonjs module 中的特性，比如模块缓存、__dirname 等，在 webpack 中如何处理？
3. es module 使用 import 可以动态加载模块，webpack 如何处理？

## 2 模块化实现原理

1. 模块解析：使用 resolver 来解析模块引用，包含 require/import 2种写法。resolver 是啥？
2. 模块依赖：根据模块之间的依赖关系，会生产模块依赖图对象。assets graph 和 chunk graph?
3. target：指定部署格式，区别在于最终打包结果chunk的加载方式，比如 nodejs 则使用 require。默认为 web，支持 nodejs, electron-main 等。
4. runtime：webpack 连接各模块的所有代码
5. manifest：指的是模块源码及其详细要点，也就是 chunk 中的内容，被 runtime 加载和使用。webpack 是如何远程加载 chunk 的？

## 3 总结归纳

使用 webpack 打包项目代码，最终会生产 webpack 模块，也就是 chunk，和我们所写的 commonjs, es module 的区别  
1. 统一最终只有 webpack module，没有 commonjs module, es module
2. 核心点在于模块的加载逻辑差异，webpack 内部使用 resolver 来统一处理 commonjs module 和 es module

## 参考文章

[webpack 模块化](https://webpack.docschina.org/concepts/modules/)
