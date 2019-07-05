# Vue响应式原理

> 关键词：响应式数据、根级响应式数据及其限制、异步更新队列

目录

[1 shim vs polyfill](#1-shim-vs-polyfill)  
[2 如何追踪数据变化](#2-如何追踪数据变化)  
[3 vue 的响应式数据](#3-vue-的响应式数据)  
[4 异步更新队列](#4-异步更新队列)  
[5 如何更新 dom](#5-如何更新-dom)  

## 1 shim vs polyfill

shim: 使用浏览器的已有(旧)的api，来实现一个新的api功能

polyfill: 检测浏览器是否有这个api，如果没有，就加载polyfill中的api，也是基于旧的api实现

区别：polyfill使用的新api是标准的、公认的，而shim使用的新api不一定是标准的，可能是用于自定义的，也可能是公认的，shim包含了polyfill，polyfill是shim的部分实现

## 2 如何追踪数据变化

```javascript
data () {
  return object
}
```

在vue实例对象中，返回的data数据，vue会遍历这个数据object的属性，使用 `Object.definedProperty` 将它们转化为 getter/setter，vue在每次get/set的时候，就会对数据进行追踪判断。vue对数据属性追踪判断使用的是一个 `watcher` 实例对象，用于判断并通知组件调用 `render` 方法，然后更新 `virtual dom tree`

> 图片来自vue官网

![data](./data.png)

## 3 vue 的响应式数据

vue 不能监测到对象属性的添加或删除，只能监测到getter/setter，这是由javascript语言特性限制的。

**响应式属性**：在初始化实例之前声明根级属性，这些就是响应式属性。响应式属性具有 vue动态添加的 getter/setter 方法，用于监听数据变化。vue创建响应式数据(增加getter/setter)，是在组件实例化的时候创建的，这些数据必须存在于data对象上。

vue不允许在已经创建的实例上动态添加新的**根级**响应式属性。但是可以使用 `Vue.set(object, key, value)` 、 `this.$set(object, key, value)` 或 `this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 })`，在非根级对象上添加新的属性及其值。

为什么要有这个限制？

1. 消除了在依赖项跟踪系统中的一类边界情况(什么边界情况???)
2. 使得vue实例在类型检查系统的帮助下运行的更高效
3. 增强代码的可维护性：提前声明所有响应式属性，便于理解

## 4 异步更新队列

vue是异步执行dom更新

```javascript
Vue.component('example', {
  template: '<span>{{ message }}</span>',
  data: function () {
    return {
      message: '没有更新'
    }
  },
  methods: {
    updateMessage: function () {
      this.message = '更新完成'
      console.log(this.$el.textContent) // => '没有更新'
      this.$nextTick(function () {
        console.log(this.$el.textContent) // => '更新完成'
      })
    }
  }
})
```

> nextTick: 在本次dom更新完成之后就会调用

如何理解异步更新？

跟 `react` 一样，都是属于数据驱动，当 set 数据时，如果需要更新dom，他们(vue、react)都不会立即更新dom，而是会开启一个队列，缓冲同一事件循环中的所有数据改变，当所有数据改变完成，然后才把该缓冲数据推入到队列中去。也就是说，同一事件循环中，当同一个watcher被多次触发，只会被推入到队列中一次。

> 好处：在缓冲时去除了重复数据产生的不必要的计算和dom重复操作，其实这个在原生js操作中，如果代码写得规范，原生的执行效率是要高于vue、react的，因为原生还少了watcher触发并通知 re-render，少了virtual dom这一层

## 5 如何更新 dom

time: 2018.11.15

以前没有总结完善，只看到了在调用 `this.hello = 'world'` 时，通知到了对应该属性的 watcher ，在 watcher 队列被执行，更新数据之后，又是如何更新 dom 的，这个问题没有得到解决？

答：真实 dom 的更新，是在虚拟 dom 树中，调用 element.replaceChild 替换 dom ，或者设置 dom 的属性。那么watcher 是如何对应到虚拟 dom 的哪个点的呢？[答案](../react/深入理解virtualDOM.md#3.5-数据-state-和-virtual-dom-是如何关联的？)

> 为什么说 vue 是细粒度的，因为它的每个属性都对应了一个 watcher ，占很多内存的

## 题外

`redux`、`vuex`都是状态管理，他们的共同点，都是不能直接操作`store`中的`state`数据，需要通过action来操作

`redux`是需要通过`action`调用`reducer`更新`state`，而`vuex`是通过 `action`来执行 `mutations` 来更新 `state`，同样追踪数据变化。

这里的`reducer`就类似`mutations`，react 用 `dispatch`，vue用 `commit` 和 `dispatch`，redux与vuex非常类似

vue使用 vuex，则会造成 `v-modal` 失效并报错，因为vuex必须通过 `mutations`来更新state，这点跟react一样，这失去了 `v-modal`的一些好处.

解决办法是通过计算属性和绑定事件来更新state，不是用`v-modal`直接去更新state了,另一种解决办法是通过 `getter/setter`，get时用计算属性`computed`返回值，set时通过执行`action`操作`mutations`更新state



