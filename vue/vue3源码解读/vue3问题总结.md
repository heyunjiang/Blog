# vue3问题总结

time: 2021-08-20 16:01:32  
author: heyunjiang

## 问题

1. 为什么 `import vue from 'vue'` 是 undefined，非要 `import { createApp } from 'vue'`?因为 es6 module 在 export 非 default 时，必须使用 {} 或 * 引入
2. 为什么普通状态组件性能能和函数式组件持平？在 vue2 中普通组件生成了 vm 实例和 vnode 对象，vue3 做了什么处理？
3. css v-bind 实现原理
4. 应用 app 和组件实例有什么区别？1个应用实例渲染时以根组件作为入口，也就是会对应n个组件
5. import 加载的 vue 组件，编译之后使用的哪个方法生成组件实例，和根实例 createApp 是如何结合的？
6. 子组件是怎么获取全局配置的组件、store、router 等数据？看看每个组件的实现，通过定义在 app.config.globalProperties 上
7. 子组件是如何获取应用上的配置的？vnode.appContext.components

## 阅读源码目的

1. 解决 vue 使用的所有问题，比如渲染流程如何、应用实例拆分对组件性能优化有多少等
2. 学习 ts 在 vue 中的应用实践，看看一些 declare、interface 等是如何使用的

## 参考文章

[es6 入门](https://es6.ruanyifeng.com/#docs/module)
