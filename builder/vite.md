# vite

time: 2021-03-19 14:51:59  
update: 2021-12-31 10:28:59  
author: heyunjiang

## 背景

整体技术栈为 vite + vue3 + ts + esm + umd + shadowDom 实现微前端  
目前 vue3 主要使用 vite 作为其构建工具，实现了本地构建(npm 预构建、模板编译)、本地服务器(nodejs server, hmr)

## 1 vite 基础知识

问题：  
1. 浏览器虽然可以直接加载 es module，但是我们代码中包含了对 npm 包的引入，vite 做了什么处理？依赖解析，路径替换
2. 我们写的 jsx、cjs、umd 之类需要编译的语法，vite 怎么处理？预构建
3. 开发时使用的 esbuild，生产使用 rollup，那么插件 @vitejs/plugin-xxx 是要做2套兼容吗？是如何工作的？
4. 开发时使用的 esm 规范，npm pkg 有许多 cjs, umd 格式的，vite 怎么处理为 esm？依赖预构建

1. vite 入口可以是 html, 也可以是 main.js
2. 依赖预构建：
使用 esbuild 执行预构建，将依赖的 npm 包预构建缓存到 node_modules/.vite 中，后续构建只需要处理 src 下面的代码即可，类似 webpack dll 构建；
处理 npm pkg，转为 cjs, umd，生成合格的 esm；
合并 npm 细小模块
3. 依赖解析：npm pkg 引入路径替换为 `/node_modules/.vite/xxx` 目录资源
4. hmr：vite 自己实现了一套 hmr
5. ts：vite 使用 `esbuild` 解析 ts 文件，比 `tsc` 速度快 20+ 倍。可以配置 `tsconfig.json`
6. jsx：使用 @vitejs/plugin-vue-jsx 解析 vue3 的 jsx，非 vue 环境使用可以配置 esbuild 的 jsx 配置
7. css module：以 `.module.css` 后缀的文件会被解析为 css module，可以通过 js 使用
8. css 预处理：不推荐使用 sass, less 之类，建议使用原生 css 变量来实现
9. web worker 解析：可以直接导入时增加 `?worker` 结尾，vite 提供 worker 解析
10. css 代码分割：默认开启异步 chunk 中 css 代码拆分，并通过该 chunk 自动加载，也可以配置 `build.cssCodeSplit = false` 来禁用拆分，将所有 css 合并为一个文件，build.library 默认为不分割
11. 静态资源处理

2021-12-31 12:07:46：目前已经学习了 vite 的基础知识，大致明白它的一个工作原理，后续在实际项目中，针对依赖预构建、hmr 等细节技术去源码学习

## 2 依赖预构建

学习2个点  
1. 对 npm 包的构建处理
2. 修改 import 地址

## 3 静态资源处理

## 4 插件

问题：  
1. 插件是怎么工作的？处理每个文件，还是同 webpack 一样监听事件？
2. 插件同 esbuild, rollup 有没有关系？

## 5 hmr 实现原理

## 参考文章

[vite](https://vitejs.bootcss.com/guide/why.html)
