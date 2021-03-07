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
16. 组件 attribute 继承：默认组件单个根元素会继承未声明 prop 的 attribute，多个根元素则会给出警告，可以使用 inheritAttrs: false 来放弃继承
17. 事件命名：自定义事件需要使用 kebab-case 命名，或者全部小写，大写是不支持的
18. emits 选项：在 emits 选项数组中把当前组件 emit 的所有事件都汇总，方便管理，并且可以做事件拦截判断有效性
19. teleport：使用 `<teleport to="#endofbody">` 来将子组件渲染到特定的 dom 元素下

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
4. 单个 v-model，组件内部对应的是默认 modelValue

## 2 问题归纳

1. vue2 各组件是 vm.$options._base.extend(object) 对象，生成的 vue 实例，那么 vue3 组件是继续使用 createApp 来生成实例的吗？
2. vue2 一些全局对象挂载在 Vue 对象上有什么不好的点？1. 同时实例化多个 Vue 实例，则不能独享私有配置 2. 全局配置污染测试用例，比如全局的 mixin, use 等包含一些命名不规范的属性和方法

## 3 组合式 api

组合式 api 的目的，是为了将逻辑代码块抽离，在需要的组件内部合理组装

```javascript
import { reactive, ref, toRefs, onMounted, watch, computed, provide, inject... } from 'vue'
```

1. reactive: reactive({key: value})
2. ref: ref(0)，用于封装独立原始值，作为响应式对象，返回包裹后的引用对象；直接访问这个对象，需要访问对象的 value 属性，而对象作为 reactive 封装的对象属性时，会自动展开，不用访问其 value 属性
3. toRefs：响应式对象数据解耦需要使用 toRefs 包裹，后续使用到再了解实现原理
4. onMounted()：通常在 setup 选项中使用，加入的方法会在 mounted 生命周期中执行。在 mounted 函数内部哪个位置执行呢？
5. watch()：通常在 setup 选项中使用，用于监听 ref 生成的响应式对象
6. computed()：通常在 setup 选项中使用，用于动态计算 ref 生成的响应式对象，具有返回值，这点与 watch 不同
7. 剩余其他在 setup 选项中使用的生命周期方法：onBeforeMount、onBeforeUpdate、onUpdated、onBeforeUnmount、onUnmounted、onErrorCaptured、onRenderTracked、onRenderTriggered
8. provide, inject 也可以作为独立的 api 使用

### 3.1 setup 选项

1. 作为独立选项，并且放置在 props 之下，data 之前
2. 执行时机在组件创建之前，那具体在什么时候呢？是在 beforeCreate 之后吗？
3. 参数为：props, context
4. 作用：返回的内容(return obj, arr or string 等等)，是直接挂载到当前组件实例 this 对象上，用作给其他生命周期方法、method、watch、computed、template 等使用
5. context对象包含属性：attrs, slots, emit
6. 不能访问的实例属性：data, computed, methods
7. 返回 render 函数：会替代 template 和组件自身的 render 吗？

## 参考文章

[vue3 中文官网](https://vue3js.cn/docs/zh/guide/migration/introduction.html#%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)
