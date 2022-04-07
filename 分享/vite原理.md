# vite 原理

time: 2022-03-24 10:38:35  
author: heyunjiang

# 大纲

0. 问题总结
1. vite 基础简介
2. 如何断点调试
3. 本地开发流程：resolveConfig, httpserver + ws, middleware, watcher, pluginContainer, optimizeDeps + cache
4. 插件总结
5. vue compiler

## 0 问题总结

1. vite 本地启动为什么这么快？
2. vite 是如何编译 ts、vue3、cjs 等语法的？
3. 如何实现类似 webpack ast 解析，实现某些自定义语法场景?

## 1 vite 基础简介

核心功能归纳  
1. 依赖预构建：cjs/umd -> esm，缓存(构建缓存、浏览器 http 缓存)，重写导入为 node_modules/.vite/ 目录
2. 常规构建工具能力提供：hmr, ts, jsx, postcss, less, sass, cssModule, json, asset import, wasm, webWorker
3. 插件支持，对框架支持：`@vitejs/plugin-vue`

## 2 如何调试 vite 项目

结合 vscode 提供的断点调试能力，在项目根目录添加启动文件

debug.js  
`require('./node_modules/vite/dist/node/cli.js')`

## 3 本地启动流程

为了知道 vite 是如何处理 ts, vue3, cjs 等语法，这里对 vite 整个 dev 流程做个总结

1. 初始化 http server, ws server
2. 执行依赖预构建并缓存，内部调用 esbuild.build 构建为 esm
3. 监听服务 server.listen
4. 每个请求会被 server.middleware 处理，其中核心使用 transformMiddleware 转换，内部使用插件容器递归处理 code
5. 返回 http 请求

## 4 插件
