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

## 8 动态组件和异步组件

### 8.1 动态组件

动态组件指 vue 内置的 `component` 组件，基本使用如下

```javascript
<component :is="currentComponent" />
```

使用说明  
1. is: 通过 is 属性控制当前应该渲染哪个组件
2. currentComponent: 指已经注册的组件 name，或者组件对象

使用场景：顾名思义，当前渲染的组件需要根据运行时环境条件来确定，是一个动态渲染的过程

问题：为什么不使用 v-if 来判断？  
答：动态组件比 v-if 写法更简洁；对于一些异步加载的组件，组件名不能确定

原理概括  
1. 编译结果：在 render 中生成 `_c(_vm.currentComponents,{tag:"component"})`，处理还是回到 createElement 方法中去
2. createElement 渲染：都是通过 `Ctor = resolveAsset(context.$options, 'components', tag)` 获取组件配置对象，然后再 `vnode = createComponent(Ctor, data, context, children, tag)`，同普通组件渲染流程一样
3. 组件切换更新：是 is 属性值变化，导致父组件 watcher.update 更新

### 8.2 异步组件

## 9 keep-alive

基础知识
1. `缓存` 不活动的动态组件实例，而不是销毁他们，在下次激活的时候，用户会看到之前操作的状态被保留
2. 被 keep-alive 包裹的动态组件及其子元素，都会存在 `activated` 和 `deactivated` 2个生命周期钩子
3. 直接子元素 `只允许有一个`，超出则组件不会被缓存
4. include, exclude 可以条件控制组件是否缓存，操作组件名；max 可以控制最多有多少组件被缓存起来，在达到峰值时，最久缓存没有被访问的组件则会被销毁，将最新的加进去

```javascript
// 编译前
<keep-alive>
  <component :is="currentComponents" :hello="1" />
</keep-alive>
// 编译后
_c('keep-alive',[_c(_vm.currentComponents,{tag:"component",attrs:{"hello":1}})
```

还是在 createElement 中来看，在查找实例 `vm.$options.components` 时，能找到 `keep-alive` 组件，我们来看看它是如何控制的

原理概括  
1. keep-alive 会实例化一个 vm vnode 实例，因为它有自己内部的缓存处理逻辑，包含了 cache 缓存子 vnode 节点
2. 初次渲染，keep-alive 组件会按正常组件渲染，会实例化一个 watcher，vm._render 调用 render 生成 vnode，vm._patch 渲染生成 keep-alive component 实例，实例内部再次调用 mountComponent 方法
3. 被 keep-alive 包裹的组件(唯一直接子元素)在通过 slot 生成 vnode 时，它的 vnode.context = keep-alive.vnode，它的 vnode.data.keepAlive = true，并缓存在 keep-alive vm.cache 中
4. 唯一直接子元素更新走如下流程

销毁 keep-alive 唯一直接子元素组件流程  
1. 再次生成新的 vnode tree，执行 patch，前后 vdom diff，递归 patch
2. 在判断没有新的 vnode 时，会执行销毁旧 vnode 操作，调用 invokeDestroyHook 函数，也就是 componentVNodeHooks.destroy
3. 在 componentVNodeHooks.destroy 中，如果是普通组件，则调用普通组件的 vm.$destroy 方法，断开与父 vnode 的联系；
如果是 keepAlive 组件，则调用 deactivateChildComponent，则不会销毁组件，会标识 vm._inactive = true，并调用 deactivated 钩子

恢复 keep-alive 唯一直接子元素组件流程  
1. 继续通过 slot 生成 vnode 对象，并读取 keep-alive.cache 中的 vnode.componentInstance 属性
2. 在组件 patch 时，调用 componentVNodeHooks.init 时，走到 componentVNodeHooks.prepatch 方法，执行 updateChildComponent
3. 

componentVNodeHooks 组件 vnode 初始化、销毁、更新相关入口
```javascript
const componentVNodeHooks = {
  // 初始化组件入口
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive 组件更新
      const mountedNode: any = vnode 
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      // 所有组件初次渲染，实例化组件
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance // 表示当前渲染组件的环境
      )
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },
  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },
  // 销毁组件入口
  destroy (vnode: MountedComponentVNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy()
      } else {
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}
```

lifecycle.js deactivateChildComponent 组件流程
```javascript
export function deactivateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    callHook(vm, 'deactivated')
  }
}
```

## 参考文章

[vue-class-component](https://class-component.vuejs.org/) vue class 写法  
[vue-property-decorator](https://github.com/kaorun343/vue-property-decorator) 对 vue-class-component 的 decorator 补充实现
