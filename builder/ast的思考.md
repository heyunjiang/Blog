# ast的思考

time: 2020.11.05  
author

## 背景

今天看到一篇介绍多端开发的文章，里面说到如何通过 ast 做多端适配，之前自己也了解到 v8 执行 js 也是将其通过 ast 转为字节码文件，babel 通过 ast 将 es6 转为 es5，内心有个问题：  
通过语法分析、词法分析，生成 ast 结构，然后再通过转换 ast 为目标元素，为什么不直接通过语法分析、词法分析直接生成目标元素呢？

因为考虑到 ast 内部转换复杂，目前自己专注于后端开发相关，这里只做简单问题解决即可，不求深入了解 ast 转换过程

## 为什么需要通过 ast 去生成字节码、es5 等目标元素

目前了解到  
1. ast 有一套标准规范，浏览器、babel 对 ast 有自己的实现
2. ast 格式有 ExpressionStatement、FunctionDeclaration、CallExpression、Identifier 等显示声明，能明确知道表达式、变量、函数声明等格式

## 参考文章

[ast 在线体验](https://astexplorer.net/)  
[ast sf 入门](https://segmentfault.com/a/1190000016231512)  
[简易 js 编译器](https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js)  
[mdn parse api](https://developer.mozilla.org/zh-CN/docs/Mozilla/Projects/SpiderMonkey/Parser_API) mozilla 的 spiderMonkey 引擎定义的 ast 规范
