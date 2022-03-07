# vite ts 支持

time: 2022-03-07 16:47:46  
author: heyunjiang

## 问题

最近在做 vite + ts + vue3 + vscode 的项目开发，遇到了一些 ts 相关问题  
1. 在 .ts 文件中引入 vue3 ref，会提示 ts 2305 没有导出的成员 ref，怎么解决？
2. esbuild 是如何读取 tsconfig.json 的？

vite 官方文档上说明了只是对 ts 做编译成 js 文件，不做类型检查。也就是说  
1. 写代码时编辑器提示错误，是编辑器的能力
2. 执行代码是 v8 执行的 js 文件

所以现在想知道 vite 是对 ts 怎么编译的

学习步骤  
1. vite 官网系统学习，总结相关知识点
2. 先看一些公众号文章，快速学习 vite 相关原理
