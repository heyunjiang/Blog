# webpack-模块化

time: 2021-06-10 20:26:44  
author: heyunjiang

## 问题

最近在深入了解 webpack 时，有了一些模块化相关的疑惑  
1. webpack 构建是走 nodejs commonjs，模块化是 require + module.exports，为什么我们代码中能写 import export 呢？
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

是如何支持的呢？

还有如下模块需要我们使用 loader  
1. ts 使用 
2. es next 使用 babel
3. sass, less, stylus
4. elm-lang js 写法

## 2 模块化实现原理

## 参考文章

[webpack 模块化](https://webpack.docschina.org/concepts/modules/)
