# vite 原理

time: 2022-03-24 10:38:35  
author: heyunjiang

# 大纲

1. 问题总结
2. vite 基础简介
3. 如何调试 vite 项目
4. 本地启动流程
5. 插件总结
6. vue compiler

## 1 问题总结

1. vite 本地启动为什么这么快？
2. vite 是如何编译 ts、vue3、cjs 等语法的？
3. 如何实现类似 webpack ast 解析，实现某些自定义语法场景?
4. 如何对项目制定定制化 vite 开发？

## 2 vite 基础简介

核心功能归纳  
1. 依赖预构建：cjs/umd -> esm，缓存(构建缓存、浏览器 http 缓存)，重写导入为 node_modules/.vite/ 目录
2. 常规构建工具能力提供：hmr, ts, jsx, postcss, less, sass, cssModule, json, asset import, wasm, webWorker
3. 插件支持，对框架支持：`@vitejs/plugin-vue`

## 3 如何调试 vite 项目

结合 vscode 提供的断点调试能力，可以实现调试指定项目

1. 在目标项目根目录添加 debug.js 文件，内容为 `require('./node_modules/vite/dist/node/cli.js')`
2. 点击左侧"虫子"按钮，打开运行和调试面板
3. 点击顶部 Launch Programe select 框，为目标项目添加配置，添加 launch 项如下，会执行 debug.js 文件  
```javascript
{
  "type": "node",
  "request": "launch",
  "name": "Launch Program",
  "program": "${workspaceFolder}/debug.js",
  "outFiles": [
    "${workspaceFolder}/**/*.js"
  ]
}
```
4. 为 node_modules/vite/ 项目添加断点
5. 在 vscode 运行和调试面板点击绿色执行按钮，即可进入 vite 调试模式

## 4 本地启动流程

为了知道 vite 是如何处理 ts, vue3, cjs 等语法，详细可以看看 [vite源码分析-核心流程](https://github.com/heyunjiang/Blog/blob/master/builder/vite%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90-%E6%A0%B8%E5%BF%83%E6%B5%81%E7%A8%8B.md) 这里对 vite 整个 dev 流程做个总结

1. 初始化 http server, ws server
2. 执行依赖预构建并缓存，内部调用 esbuild.build 构建为 esm
3. 监听服务 server.listen
4. 每个请求会被 server.middleware 处理，其中核心使用 transformMiddleware 转换，内部使用插件容器递归处理 code
5. 返回 http 请求

## 5 插件总结

在了解了 vite 执行流程之后，我们知道了 vite 会使用 transformMiddleware 来处理每次请求 `const transformResult = await pluginContainer.transform(code, id)`  
来看看 vite 的核心模块 - 插件

## 如何对项目制定定制化 vite 开发？

概括一下 vite 提供的能力：使用 npm 模板构建基本项目架子，内部使用 vite.config.js 作为配置文件，核心加载 vite 插件实现定制化 transform 处理  
有没有对 vite 二次封装的项目？  
其他对 webpack 二次封装的项目做了哪些事情？

## 参考文章
