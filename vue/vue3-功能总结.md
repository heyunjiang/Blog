# vue3 功能总结

time: 2021.2.25  
author: heyunjiang

## 1 常用功能总结

1. createApp 代替 new Vue 生成组件，全局 api
2. vite 入口是 html，直接使用 es6 script module 引入 js 执行
3. vue3 组合式 api，vue2 选项式 api
4. 函数式组件：vue3 使用 export 箭头函数直接创建函数式组件，与 vue2 的 functional 关键字不同，vue3 在有状态组件和函数式组件上性能已经持平
5. data 对象：vue3 data 必须返回一个函数，与 vue2 可以返回 plain object | function 不同；mixin 混入的 data 只是浅层次合并
6. template 多个根节点
7. 全局 api：vue3 一些全局 api 需要通过实例 app 来挂载使用，包含 config, component, directive, mixin, use
8. treeshaking：在构建目标为 es6 时，vue3 的组合式 api 特性支持了 treeshaking
9. key：key 可以设置在 template 上了，并且 v-for 必须设置在 template 上
10. h：作为 createElement 的简写，vue3 在 render 函数不再作为默认参数，需要主动引入 import { h } from 'vue'
11. extenal 配置：由于 vue3 都是采用主动 import 一些 vue 的方法，在打包时会将 vue 主动打入，需要配置 extenal
12. v-model：v-bind 的 sync 和组件的 model 选项移除，vue3 支持默认的 modelValue + update:modelValue 用作 v-model 功能
13. v-if v-for 优先级：vue2 v-for 优先级更高，vue3 v-if 优先级更高
14. 异步组件：vue3 函数式组件为纯函数，异步组件需要使用 `defineAsyncComponent` 明确指定
15. 自定义指令生命周期更改为类组件生命周期

### 1.1 全局插件使用

```javascript
// vue2
Vue.use(VueRouter)

// vue3
const app = createApp(MyApp)
app.use(VueRouter)
```

思考：vue3 插件使用是挂载在根实例上的，与 vue2 挂载在 Vue 对象上有什么区别？  
解答：vue2 是在 Vue.prototype 上扩展 router 属性，在子组件使用 extend 继承根组件上挂载的 Vue 对象时，会共享 prototype，从而实现插件的相关功能。
那么 vue3 挂载在根实例上，一样也可以通过 vm.root 来读取插件数据。

### 1.2 v-model

1. v-model 替代了 v-bind.sync 双向数据绑定
2. v-model:title="pageTitle"
3. 可以使用多个 v-model

## 2 问题归纳

1. vue2 各组件是 vm.$options._base.extend(object) 对象，生成的 vue 实例，那么 vue3 组件是继续使用 createApp 来生成实例的吗？
2. vue2 一些全局对象挂载在 Vue 对象上有什么不好的点？1. 同时实例化多个 Vue 实例，则不能独享私有配置 2. 全局配置污染测试用例，比如全局的 mixin, use 等包含一些命名不规范的属性和方法

## 参考文章

[vue3 中文官网](https://vue3js.cn/docs/zh/guide/migration/introduction.html#%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)
