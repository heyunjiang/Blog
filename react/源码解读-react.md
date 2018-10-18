# react源码阅读

time: 2018.10.16

heyunjiang

目录

[1 为什么阅读源码](#1-为什么阅读源码)  
[2 熟练使用 react](#2-熟练使用-react)  
[3 问题归纳](#3-问题归纳)  
[4 问题解答](#4-问题解答)  
&nbsp;&nbsp;[4.1 为什么使用 react ?它与 vue 相比较的优劣势是什么？](#4.1-为什么使用-react-?它与-vue-相比较的优劣势是什么？)  

## 1 为什么阅读源码

1. 在使用 react 过程中，存在一些问题，需要读取源码才能解答这些疑惑；
2. 在解答这些问题的过程中，补充学习基本能力(html, css, js, dom, 浏览器等)
3. 加强自己对 react 的熟练使用程度，学习其设计理念

## 2 熟练使用 react

time: 2018.10.16

背景：自己也使用过 react ，知道 react 的基本使用，没有系统学习 react 。对 redux , react-router4, redux-saga 也研究过了，知道了这3个在项目中充当什么责任，明白了它们的设计理念与实现原理。现在再对 react 做一个完整学习与回顾，看看它在视图层做了什么工作。本次学习就是对自己知识体系的一个完善，'补补牙'

### 2.1 基本功能

也就是学习框架强制的要求写法

react: v16.5.2

time: 2018.10.18

****

1. 3层架构：用户使用层、虚拟 dom 层、真实 dom 层
2. 数据驱动：数据驱动界面变化，单向数据流
3. 组件化：由多个组件构建成一个界面
4. jsx 编译: jsx 也是表达式，语法糖，在编译过后，jsx 会被转化成普通的 jsx 对象，由 `React.createElement()` 包装起来，如 `代码1`
5. jsx 安全：在编译之后，所有 jsx 中的值都被转换成了字符串，有效解决了 `xss` 攻击
6. 元素：React 基本单元，对象，存在于 `虚拟 dom 层` 中
7. 渲染：`真实 dom 层` 操作，采用 ReactDOM.render(element, document.getElementById('root')) 方法渲染
8. 组件：分为有状态组件和无状态组件。组件编译后的最终形态是一个 funciton。react 在识别 jsx 时，识别到组件时，会自动组装对应组件返回的 jsx ，要求组件名称必须大写开头，用于和 react 普通元素做区别
9. 事件：名称为小驼峰写法，传入函数(非字符串);属于合成事件，实现了浏览器兼容；
10. html 标签：react 模拟了一层浏览器 html 标签，编译过后就成了 react 元素，要求必须小写开头
11. jsx 内容：会移除空行和开始与结尾处的空格，标签邻近的新行也会被移除，字符串常量内部的换行会被压缩成一个空格
12. PropTypes：只适用于开发环境
13. refs：用的少，结合 echarts 用过，做强制动画用过(因为需要js动态获取高度)，设置 input 焦点用过
14. jsx 标签名：不能为表达式，只能为变量或 react 元素
15. react 表单元素：存在 `defaultValue` 和 `defaultChecked` 2个默认值属性

学到 react 官方文档 `性能优化` 章节

****

### 2.2 示例代码

```javascript
// 代码1 jsx 编译
// jsx
const element = <h1>Hello, world!</h1>;
const ele = (<div>xixi<element /></div>);
const ele1 = (<div>haha<element /><ele /></div>);
ReactDOM.render(ele, document.getElementById('root'));

// 编译后的 jsx
const element = React.createElement('h1', null, 'Hello, world!');
const ele = React.createElement('div', null, 'xixi', React.createElement('element', null));
const ele1 = React.createElement('div', null, 'haha', React.createElement('element', null), React.createElement('ele', null));
ReactDOM.render(ele, document.getElementById('root'));

// React.createElement('h1', null, 'Hello, world!') 返回结果
const element = {
  type: 'h1',
  props: {
    children: 'Hello, world'
  }
};
```

## 3 问题归纳

1. 为什么使用 react ?它与 vue 相比较的优劣势是什么？
2. 状态变化时，组件与其子组件如何变化，反应到浏览器更新时如何更新的？
3. 为什么要在 jsx 外层包一个小括号，直接返回 jsx 不行吗？
4. setState() 属于异步更新，它更新的时机是什么？为什么要这么做？
5. 为什么要在列表生成中加入 key ？
6. 我使用 jsx ，为什么要引入 react 呢？
7. jsx 标签名为什么不能为一个表达式，必须要是一个变量或 react 元素？

## 4 问题解答

### 4.1 为什么使用 react ?它与 vue 相比较的优劣势是什么？

time: 2018.10.16

isFinish: `false`

本科毕业设计做的项目用的是 react ，对 react 相对更熟悉，react 生态圈也更好，各种模块很完善。

现在使用了一段时间 react ,使用的技术栈为： `webpack4 + react 16 + redux + react-router4 + redux-saga` ，除了 webpack4、 react 源码外，redux + router 系列的源码也都看过了，知道了技术栈中各个模块在系统构建过程中充当什么角色，承担了什么责任。

> 先熟悉一下 react 实现的基本功能，也就是 [第二点](#2-熟练使用-react) 再来看这个问题

react 作为视图层的一个框架，基于 `数据驱动` 外接 redux、redux-saga 做 `状态管理` ，内部连接浏览器原生 dom 操作，封装了一个虚拟 dom 层。

### 4.2 状态变化时，组件与其子组件如何变化，反应到浏览器更新时如何更新的？

time: 2018.10.18

isFinish: `false`

当组件内部状态变化，react 只会更新必要的部分，即子组件变化不会影响到父组件的变化；

当父组件变化，子组件没有变化时，

### 4.3 为什么要在 jsx 外层包一个小括号，直接返回 jsx 不行吗？

time: 2018.10.18

isFinish: `true`

加个小括号，是解决 `分号自动插入` 的 bug

### 4.5 为什么要在列表生成中加入 key ？

time: 2018.10.18

isFinish: `false`

表面说的是帮助 react 识别哪些元素发生了改变，key作为元素的唯一标识；

### 4.6 我使用 jsx ，为什么要引入 react 呢？

time: 2018.10.18

isFinish: `true`

使用了 jsx ，不管使用的是 react 组件，还是 react 元素，最终都会被编译成 `React.createElement()` ，所以必须引入 react 包

### 4.7 jsx 标签名为什么不能为一个表达式，必须要是一个变量或 react 元素？

time: 2018.10.18

isFinish: `false`

猜想：在编译过程中，jsx 会被转换成一个 `createElement()` 对象，标签名会变成第一个参数，如果不是组件，则会变成字符串，组件则变成组件名称，也就是一个变量。为什么不能写成 `components[props.storyType]` 这种表达式呢? 首先，首字母必须大写；其次，编译过程是不会做 js 代码执行，去计算结果的。

****
