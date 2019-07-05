# vue 深入

time: 2019.7.4  
author: heyunjiang

[vue 基本知识](react/react-vs-vue.md) vue 基本知识使用，是总结在和 react 一起作对比

![vue 知识技能图](../images/vue.png)

## 背景

到今天为止，自己使用过 react, vue, 对这2者的基本使用都是没有什么问题，特别是组件的构造，遵循了组件复用、组件低耦合、组件规范编码、高可拓展可维护性等，自己也是写代码的一把好手了。但是也只是搬砖的，只会搬砖，按照框架文档 + API，一块砖一块砖的磊起来。  

自己使用框架，常规问题是能够解决，但是如果超出一些问题边界，比如框架本身的问题，包括性能、bug等，如果不深入框架本身，那么项目出了问题还是不能及时得到解决，即使可以在 github 上提 issue，也只是解决通用的一些问题，定制性的功能不能提供。

深入学习框架，出于以下目的：  
1. 自身好奇：想了解框架实现原理，vue-loader, Vue.compile 做了什么
2. 前端技能提升：vnode 在浏览器中的存储，vtree 如何更新dom

## 1 编译 compile

从我们编写 template 到生成真实 dom，中间有一个过程，即把模板编译成 render 函数，这个过程叫做编译。  
虽然我们可以直接写 render，起内部写 jsx，但是它远没有写模板来的方便，vue 为 template 提供了一些便捷写法，包括指令、特定标签等。

vue 提供了2种版本的源码

1. runtime + compiler：可以在运行时编译
2. runtime：需要通过 vue-loader 预编译，转为 render 函数

## 参考文章

[1 vue 官方文档](https://cn.vuejs.org/v2/guide/) 这次除了教程，也把 api 详细过一遍  
[2 vue 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/)