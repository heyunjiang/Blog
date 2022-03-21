# vite源码分析-核心流程

time: 2022-03-07 17:34:53  
author: heyunjiang

## 背景

vite 核心功能  
1. 依赖预构建
2. 开发服务器 + hmr
3. ts 处理

学习目的  
1. `done`最近在学习实践 ts 时，在梳理整个 ts 执行流程中，对 vite 中 esbuild 如何编译 ts 不太清楚，想了解它的流程。调用的 esbuild.transform api
2. `done`vue3 组件是如何被编译的，看看 @vitejs/plugin-vue 如何处理。vue 插件调用了 compiler api，`options.compiler.compileTemplate`，也就是调用的 `vue/compiler-sfc` 编译 api
3. umd, cjs 如何被处理为 esm
4. 有的时候，同时存在 script setup + script 时，dev 开发没问题，build 之后访问变量会出现问题？是 compiler 的问题？
5. vite 插件时如何被调用的？无非初始化 + 每个钩子递归调用插件

这里来看看核心流程

## 1

1. 入口 bin/vite.js, `require('../dist/node/cli')`
2. 

## 2 插件

在解决 vue3 编译问题，想要实现类似 ast 解析处理特定代码问题，就了解了 vite 如何编译 vue 的。  
vue 组件的编译，是通过 @vitejs/plugin-vue 实现的。
在查看这个插件源码时，发现它提供了 vite 插件要求的几个配置：buildStart, load, transform 等，先对 vite 插件做个基础学习总结

1. vite-plugin-inspect 可以检查插件的中间状态，可以体验使用
2. 插件提供配置，在 vite.config.js 中被顺序调用，可以配置优先级

通用钩子: 在 build 时直接使用 rollup，在 dev 时创建插件容器调用 rollup 钩子。咋理解？  
1. options：读取配置
2. buildStart：服务启动
3. resolveId
4. load: 加载模块文件时处理，返回代码
5. transform：通常用于代码编译，输入编译前的 code，输出编译后的 code
6. buildEnd
7. closeBundle

vite 特有钩子  
1. config: vite 配置解析之前调用，可以改变 vite.config.js 文件
2. configResolved
3. configServer: 配置开发服务器，可以添加一下 dev 时的中间件
4. transformIndexHtml：处理 index.html 入口文件，返回新的 html 字符串
5. handleHotUpdate：自定义 hmr 处理

## 3 rollup 基础

1. 本身是一个模块打包器，也就是会把众多小模块打包成大的模块
2. 可以作为 library 和 application
3. 插件的作用：rollup 本身只做模块的打包，一些自定义打包行为可以通过插件来实现
4. 插件格式是同 vite 一样，对象配置方式

## 参考文章

1. [vite 官网](https://vitejs.bootcss.com/guide/api-plugin.html#universal-hooks)
2. [rollup 中文网](https://www.rollupjs.com/guide/plugin-development)
