# 组件通信

time: 2019.6.28  
author: heyunjiang

## 背景

面试常问：说说你知道的组件间的通信方式？  
项目应用：父组件需要知道根据子组件的状态做出一定的处理；父组件是 form ，包含一系列的子组件；子组件数据更新之后，需要同步更新父组件的数据

总之，总结归纳父子组件之间的通信是一件迫在眉睫的事情

## 1 组件间的通信方式

### 1.1 props 通信

vue, react 都是单向数据流，父组件通常传递 props 给子组件

### 1.2 vuex 或 redux

全局状态管理，父子组件都从这颗全局树中去拿数据，已经扁平化了父子关系。当子组件数据变化，直接通知全局对象，让他去更新其他的数据

### 1.3 $emit

在父组件引用子组件时，监听一个自定义的事件，子组件有需要时，可以发起事件 emit，通知父组件；

非父子组件通信，采用如下实现方式(显得有点多余了)

```javascript
let event = new Vue();

event.$on();

event.$emit();
```

### 1.4 :name.sync + $emit('update:name')

基本原理

```vue
v-bind:name="info.name"
v-on:update:name="info.name = $event"
```

vue 官方提供的缩写：增加 .sync 修饰符

`v-bind:name.sync = "info.name"`

进一步缩写

`:name.sync = "info.name"`

那么子组件如何使用呢？

`name` 会作为 prop 传入，你不能 v-model 双向绑定 name ，可以指定另一个变量 `value` ，通过 watch name 的值来更新 value ，然后 `v-model = "value"`，然后有需要的时候再发起 emit 通知父组件我要改变 name 了，方式为 `this.$emit("update:name", this.value)`

这种实现方式，在使用表单的时候是很友好的

### 1.5 $parent $children

之前我就用过 this.$parent.$refs 来获取父组件节点

### 1.6 v-model 绑定数据

主要用于表单控件绑定数据，控制 props.value 和 input 事件，单选、复选则是 props.checked 和 change 事件。需要在子组件中配置 model 选项

### 1.7 $refs 访问 vnode

> 其他：provite + inject，$attrs, $listeners 

## 参考文章

[vue.js 父子组件通信的十种方式](https://zhuanlan.zhihu.com/p/48090472)
