# hmr 原理

time: 2021-07-13 19:30:47  
author: heyunjiang

## 背景

今天做升级 webpack5 时，发现 dev-server 的热更新一直有问题，vue 修改之后无法更新界面，搜索引擎也查不到相关解决方案。  
自己也一直对 webpack 热更新原理不太清楚，这里做一个全面总结

## 1 热更新基础知识

基本配置：在 devServer 配置 `hot: true` 即可开启热更新，并且 webpack5 无需再使用 webpack.HotModuleReplacementPlugin 插件，内部会默认使用

基本功能：  
1. 在应用程序运行时，局部更新、替换、删除模块，不刷新页面
2. 保存应用程序状态不变
3. 在代码更新后，应用程序接收到更新消息，会去更新实现了 HMR 接口的模块。是如何更新的？

## 2 实现原理

## 参考文章

[webpack hmr 概念介绍](https://webpack.docschina.org/concepts/hot-module-replacement/)  
[vue-loader hmr](https://vue-loader.vuejs.org/zh/guide/hot-reload.html#%E7%8A%B6%E6%80%81%E4%BF%9D%E7%95%99%E8%A7%84%E5%88%99)
