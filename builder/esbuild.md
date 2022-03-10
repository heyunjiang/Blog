# esbuild

time: 2022-03-10 16:11:04  
author: heyunjiang

## 背景

最近在学习 vite 执行流程中，了解到了 esbuild 相关能力，这里做个总结

## 1. esbuild 基础功能

1. esbuild 提供了三种方式调用 api：命令行、js、go
2. 2大 api: `transformSync | transform` 处理字符串, `buildSync | build` 处理文件
3. 支持功能：多入口、指定出口、压缩、打包、定义全局常量表达式、external、sourcemap、代码分割(开发中)、jsx preserve or Factory、tree shaking、target(默认 esnext)、format

esbuild 作用  
1. 打包压缩代码
2. js 语法转换，可以指定 target 为 es2020 等，默认 esnext，即所有 js 语法都支持
3. 模块包装与互换：指定输出格式 format 为 iife, cjs, esm。即可以把 cjs 转换为 esm
4. ts 转换：将 ts 处理为 js，也就是去除 ts 相关代码；但是不会做类型检查
5. jsx 编译处理

特性：构建速度很快，性能是 webpack 的100倍+

总结：esbuild 是一个 js 打包器，实现了代码打包、代码转换处理等功能

## 2. vite 使用了 esbuild 什么功能

1. 依赖预构建
2. ts 转换
3. jsx 的处理，默认 react16，可以使用 `@vitejs/plugin-vue-jsx` 处理 vue

用于**依赖**预构建，生成 esm，并做了如下事情  
1. cjs, umd 转换成 esm，比如 react、lodash 之类的转换
2. 依赖细小模块压缩：node_modules 依赖的多细小模块会被压缩为一个模块用以提升性能
3. 构建缓存，缓存到 node_modules/.vite/
4. 浏览器缓存：因为是处理的 node_modules 依赖，所以会使用强缓存 max-age (3万多秒) 实现
5. 重写依赖导入：将代码中用到 import 依赖的连接更改为 .vite 缓存中的地址

vite 并没有使用 esbuild 提供的打包能力

## 3. 为什么 esbuild 这么快

1. 使用 go 编译型语言处理，比解释性 js 要快
2. 多线程，充分利用 cpu 和内存

## 参考文章

[esbuild 中文网](https://esbuild.docschina.org/api/)  
[vite 中文网](https://cn.vitejs.dev/guide/why.html#slow-server-start)
