# vue3问题总结

time: 2021-08-20 16:01:32  
author: heyunjiang

## 问题

1. 为什么 `import vue from 'vue'` 是 undefined，非要 `import { createApp } from 'vue'`?因为 es6 module 在 export 非 default 时，必须使用 {} 或 * 引入
2. 为什么普通状态组件性能能和函数式组件持平？在 vue2 中普通组件生成了 vm 实例和 vnode 对象，vue3 做了什么处理？
3. css v-bind 实现原理
4. 应用 app 和最终实例有什么区别？
5. import 加载的 vue 组件，编译之后使用的哪个方法生成组件实例，和根实例 createApp 是如何结合的？
6. 

## 参考文章

[es6 入门](https://es6.ruanyifeng.com/#docs/module)
