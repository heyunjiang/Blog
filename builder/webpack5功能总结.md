# webpack5功能总结

time: 2021-04-02 10:45:57  
author: heyunjiang

## 背景

最近在做 webpack 源码分析，发现一些代码点不好阅读，需要调试来看调用栈；有一个待优化项目，用的是 vue-cli-service 来构建，使用 webpack4 功能，我切换到 webpack5，看看有什么亮点

1. module federation
2. Assets modules

## 1 module federation

分享内容大纲  
1. 微前端实现方案一种
2. 内部模块加载实现原理
3. 模块打包输出原理
4. 共享模块实现原理，对比 externals
5. 使用场景

## 2 内置模块支持更广

## 参考文章

[EMP 原理](https://github.com/efoxTeam/emp/wiki/%E3%80%8Amodule-Federation%E5%8E%9F%E7%90%86%E5%AD%A6%E4%B9%A0%E3%80%8B)
[资源模块](https://webpack.docschina.org/guides/asset-modules/)  
[moduleFeration demo](https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes)  
[mf 在线体验](https://stackblitz.com/github/webpack/webpack.js.org/tree/master/examples/module-federation?file=app2%2Fwebpack.config.js&terminal=start&terminal=)
