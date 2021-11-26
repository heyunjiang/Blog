# snowpack

time: 2021-11-23 16:56:54  
author: heyunjiang

## 背景

es module 被主流浏览器实现 + h2 普及，急需 webpack 的替代品  
vite + snowpack 的出现，正式解决这类问题

在学习之前，有一些疑问  
1. 目前项目依赖的各 npm 包，webpack 是需要打包到最终的 bundles 中去，那 snowpack 是如何处理的？
2. .vue, tsx 这些原本需要 loader 编译处理的，现在怎么处理？
3. import css, image 这些资源，又是怎么处理？浏览器只能 import js 文件

## 1 snowpack

1. snowpack 处理 npm 包: 将 package.json 中的依赖，使用 rollup 打包到 /web_modules/ 目录，然后替换源码中 import 的包引用路径
2. 处理 import css: 将 css code 转换为 style 标签，生成 css.proxy.js 文件
3. 处理 import img: 将 img 转为图片地址，生成 image.proxy.js 文件



## 参考文章

[snowpack 简介](https://zhuanlan.zhihu.com/p/149351900)
