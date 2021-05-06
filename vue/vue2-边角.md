# vue2-边角

time: 2021.2.20  
author: heyunjiang

## 背景

今天在回顾 vue 全局注册组件时，看到 vue 文档中有一些自己没有用过的知识点，比如 v-once 做性能优化，x-template 编写模板等。  
现在打算对 vue2 做个知识点完整回顾，对比源码查看，对一些不太熟悉的边角总结在这里。

## 1 vue class 写法

```javascript
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class YourComponent extends Vue {
  @Prop(Number) readonly propA: number | undefined
  @Prop({ default: 'default value' }) readonly propB!: string
  @Prop([String, Boolean]) readonly propC: string | boolean | undefined
}
```

疑问  
1. 这里是 vue2 的写法，vue2 是基于 function 来实现的，这里怎么是 class？官方提供了 class 版本
2. decorator 在这里是如何工作的，目前不是还没有进入标准吗？babel 支持了
3. 它能支持 ts 写法？支持，也是源于 vue-cli-plugin-typescript，还是 babel

## 2 手动绑定生命周期事件

通常在 vue 组件中使用生命周期，是在配置的 beforeDestroy 等属性方法中实现，vue 提供了程序化监听事件，编写方式如下  
```javascript
this.$on('hook:beforeDestroy', cb)
this.$once('hook:beforeDestroy', cb)
```

## 3 递归组件

在递归渲染中，可以使用自身组件或其他组件

```javascript
export default {
  name: 'MyComponent',
  template: `
    <div>
      <template v-if="count < 5">
        <my-component></my-component>
      </template>
    </div>
  `
}
```

## 4 inline-template 子组件模板提升

```html
<my-component inline-template>
  <div>
    <p>These are compiled as the component's own template.</p>
    <p>Not parent's transclusion content.</p>
  </div>
</my-component>
```

此刻定义的模板，会替代子组件本身的模板(未验证)，并且当前模板作用域是子组件的作用域，同 slot 不同，slot 是父组件作用域

另外，也可以使用 script + text/x-template 来替代 `<template>` 的写法

```html
<script type="text/x-template" id="hello-world-template">
  <p>Hello hello hello</p>
</script>
```

## 5 函数式组件与 v-once

通过设置 `functional` 在 template 根节点上，或添加 functional: true 属性，可以让当前组件变为函数式组件；  
通过设置 `v-once` 在 template 根节点上，可以让内容只计算一次就缓存起来，后续不再更新。  
2者有什么区别？  
1. 有没有状态：函数式组件没有状态，没有实例对象 this，可以通过 context 对象访问 props, slots 等属性
2. 是否重新渲染：v-once 会在计算一次之后就被缓存，后续即使 data 等数据改变，也不会重新渲染

> 问：函数式组件中的 props 是响应式的吗？是

## 6 transition 过度动画

可以控制在初始、离开、进入、active 等时机的动画、相应的 @enter 等钩子函数，包括列表 flip 过度动画都可以实现。后续做动画相关的，可以深入研究这块

## 7 render

1. `.vue 文件`：template 最终都会通过 vue-loader 编译为 render 函数，内部使用 compiler 模块编译
2. `template 选项`，会被 compileToFunctions 方法编译成 render、staticRenderFns 函数，内部使用 compiler 模块编译
3. `render 函数`，我们也可以直接写 render 函数，内部返回 createElement('div', [createElement('span', 'hello'), this.$slots.default]) 来生成内容
4. `jsx`: 是因为有一个 babel 插件 @vue/babel-preset-jsx，在 babel 转换的时候，将 jsx 转换成普通 render 的 createElement 方法

createElement 及函数参数  
```javascript
createElement({
  // string | object | function，必填
  'div',
  // 与模板中 attribute 属性对应, 可选
  {
    class: {
      foo: true,
      bar: false
    },
    style: {
      fontSize: '12px'
    },
    attrs: {
      id: 'hello'
    },
    props: {},
    key: 'key',
    ...
  },
  // children, string | array, 可选
  []
})
```

## 参考文章

[vue-class-component](https://class-component.vuejs.org/) vue class 写法  
[vue-property-decorator](https://github.com/kaorun343/vue-property-decorator) 对 vue-class-component 的 decorator 补充实现
