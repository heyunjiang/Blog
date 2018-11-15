# 概要

```javascript
/*
 * 归纳 react 和 vue的异同点
 * 背景: 友云设采用react全家桶，微信采用vue基础部分，对于react和vue都有一个大致的掌握，这里总结一下，做个区分
 * time: 2018.4.12
 * update: 2018.11.15
 */
```

[1. 数据流](#1-数据流)  
[2. 组件](#2-组件)  
&nbsp;&nbsp;[2.1 构建方式](#2.1-构建方式)  
&nbsp;&nbsp;[2.2 组件格式](#2.2-组件格式)  
&nbsp;&nbsp;[2.3 生命周期](#2.3-生命周期)  
[3. 虚拟dom](#3-虚拟dom)  
[4. 事件](#4-事件)  
[5. 特性](#5-特性)  
[6. 其他小点](#6-其他小点)

## 1 数据流

默认情况下，react采用**单向数据流**，修改state只能通过 `setState()` 方法操作

默认情况下，vue采用**双向数据绑定**，可以直接修改state `this.data = newData`

都是响应式数据：当state数据变化时，会去判断并更新virtual dom，只是vue是细粒度，react是粗粒度

如果采用状态管理，比如react-redux，vue-vuex，那么它们的数据状态更新都只能通过`reducer`或`mutations`来更新数据，都属于单向数据了

> 注意: 在2者封装组件时，因为传递的props都是只读的，不允许直接修改，但是react可以直接在 `jsx` 中使用 pops，但是vue在使用的时候要注意，不能将 props 通过 `v-modal` 方式绑定到组件上，因为这样会直接修改 props， 从而系统报错

## 2 组件

### 2.1 构建方式

react: 函数式组件，class 组件

vue: 导出一个对象，对象格式固定，通常包含 name、components、data、methods等

### 2.2 组件格式

```javascript
// react 组件
export default class Filter extends React.Component {
  constructor(props) {
        super(props)
    }
  componentDidMount() {}
  render(){
    return ()
  }
}
```

```javascript
// vue
<template></template>

<script>
export default {
  name: 'TaskList',
  components: {},
  mixins: [],
  data () {
    return {}
  },
  methods: {},
  watch: {},
  mounted: function () {}
}
</script>

<style></style>

```

### 2.3 生命周期

react

1. constructor()
2. static getDerivedStateFromProps()
3. componentDidMount()
4. shouldComponentUpdate()
5. getSnapshotBeforeUpdate()
6. componentDidUpdate()
7. componentWillUnmount()
8. componentDidCatch()

****

vue

1. beforeCreate()
2. created()
3. beforeMount()
4. mounted()
5. beforeUpdate()
6. updated()
7. beforeDestroy()
8. destroyed()

## 3 虚拟dom

## 4 事件

2者都是绑定在虚拟dom上的，当虚拟dom组件被销毁，那么事件也取消

## 5 上手

react: jsx + es6，学习曲线高

vue: none，直接上手

## 参考文章

[1. 前端之巅](https://mp.weixin.qq.com/s/KCZsBmQiCdLF2HJ5N4Pbyw)  
[2. vue 官网](https://cn.vuejs.org/v2/guide/comparison.html)  
