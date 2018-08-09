# typescript

time: 2018.8.09

一直都没有怎么去学习 typescript ，但是今天阅读 antd 源码的时候，发现它是用 ts 写的，大部分源码都能看懂，但是它的一些语法不是很懂，比如 `export default class Button extends React.Component<ButtonProps, any>` ，它尾巴上的 `<ButtonProps, any>` 是什么，是 React.Component 自带可以这样子写的吗，还是 ts 赋予的？

目录

1. typescript 简介
2. typescript 基本语法

## 1 typescript 简介

ts 是 js 类型的超集，可以编译成纯 js

存在原因：

1. 存在强类型语言的某些特征，比如 static 、 interface 等，方便后端转前端人员使用

## 2 typescript 基本语法

