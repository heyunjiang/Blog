# vite源码分析-核心流程

time: 2022-03-07 17:34:53  
author: heyunjiang

## 背景

vite 核心功能  
1. 依赖预构建
2. 开发服务器 + hmr
3. ts 处理

学习目的  
1. 最近在学习实践 ts 时，在梳理整个 ts 执行流程中，对 vite 中 esbuild 如何编译 ts 不太清楚，想了解它的流程
2. vue3 组件是如何被编译的，看看 @vitejs/plugin-vue 如何处理
3. umd, cjs 如何被处理为 esm

这里来看看核心流程

## 1. 

1. 入口 bin/vite.js, `require('../dist/node/cli')`
2. 
