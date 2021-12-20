# vue3 功能总结

time: 2021.2.25  
author: heyunjiang

## 背景

vue2 升级到 vue3，包含了全局 api、tempalte 模板语法、组件配置选项、事件、插槽、css等变化，概括如下  
1. 全局 api 变化：vue3 统一由 createApp 生成的实例来设置，比如 app.use, app.config, app.directive
2. template 内元素 attribute 的变化：vue3 废弃了 v-bind.sync 写法，支持多个 v-model 写法；v-for key 写在 tempalte 上；支持多个根节点
3. 配置选项 - model的变化：vue3 去除了 model 选项
4. 配置选项 - 事件的变化：未被定义在 `emits` 数组中的事件，会被默认为原生事件；废除了 $listeners 属性
5. 函数式组件功能弱化：vue3 有状态组件性能优化到跟函数式组件无差异，并且 vue3 支持返回多个根节点。废除了 functional 关键字
6. 配置选项 - render 函数变化：`h` 需要明确 import 引入；查找已经注册的组件需要使用 `resolveComponent`，对于 template 写法不会有影响
7. 插槽变化：jsx 中废除 vue2 的 this.$scopedSlots 写法，统一使用 this.$slots 来调用；vue3 插槽节点都被定义为子节点了？不是 scopedSlot 属性了？同前面废除 $scopedSlots 理解，应该是
8. 配置选项 - 生命周期：使用 beforeUnmount 代替 beforeDestory，unmounted 代替 destroyed
9. css 变量：使用 v-bind 实现 css 变量通过 js 控制

## 1 功能总结

基础变更点  
1. createApp 代替 new Vue 生成组件，全局 api
2. vite 入口是 html，直接使用 es6 script module 引入 js 执行
3. vue3 组合式 api，主要体现在 setup 函数，vue2 选项式 api
4. 函数式组件：vue3 使用 export 箭头函数直接创建函数式组件，废弃了 functional 标识；与 vue2 不同，vue3 在有状态组件和函数式组件上性能已经持平
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
16. inheritAttrs：组件 attribute 继承，默认组件单个根元素会继承未声明 prop 的 attribute，多个根元素则会给出警告，可以使用 inheritAttrs: false 来放弃继承
17. 事件命名：自定义事件需要使用 kebab-case 命名，或者全部小写，大写是不支持的
18. emits 选项：在 emits 选项数组中把当前组件 emit 的所有事件都汇总，方便管理，并且可以做事件拦截判断有效性
19. teleport：使用 `<teleport to="#endofbody">` 来将子组件渲染到特定的 dom 元素下
20. $attrs 变更：$listeners 废除，事件合并入 this.$attrs，比如 `<div v-bind="$attrs" />`；class, style 也合并到 $attrs 对象上，可以通过 `inheritAttrs: false` 放弃默认规则来自定义
21. 手动实例化组件：废除 propsData，而是通过 createApp 第二个参数传入

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

### 1.3 app.config

1. errorHandler
2. warnHandler
3. globalProperties: 用以替代 vue2 的 Vue.prototype 配置
4. optionMergeStrategies：mixin 合并规则控制
5. performance：在支持 performance.mark 的浏览器中监测组件的初始化、编译、渲染、更新的性能
6. compilerOptions：运行时编译的配置

### 1.4 应用 api

通过 createApp 返回的 app 对象，可以用于注册全局组件、注册全局指令、使用 use 加载插件，类似 vue2 的 Vue.component 等

1. app.component
2. app.directive
3. app.config
4. app.use
5. app.mixin
6. app.mount
7. app.unmount
8. app.provide
9. app.version

问题：  
1. app 是如何影响到内部其余组件的
2. 它自身就是一个实例吗
3. 内部组件是如何渲染及挂载的

### 1.5 全局 api

指的是 `import { createApp, ref } from 'vue'` 引入的 api，也就是 vue export 的各种对象，与 createApp 生成的 app 对象不同  
1. vue 输出的全局 api 是提供给开发者自定义组合使用的功能
2. app 是?看看源码实现吧

1. createApp
2. h
3. defineComponent: 目前来看是用于 ts 时
4. defineAsyncComponent：定义异步组件，只会在需要的时候才去加载，同 router 配合时需要查看 router 文档
5. defineCustomElement：定义自定义组件，暂时没有用到
6. resolveComponent：在 setup 和 render 中使用，返回一个 component，找不到则返回组件名称；是配置对象，还是组件实例？
7. resolveDynamicComponent：在 setup 和 render 中使用，返回一个已解析的 component 或 vnode，参数为 name 或组件配置对象，找不到会发出警告
8. resolveDirective：在 setup 和 render 中使用，返回一个 Directive，参数为 name，找不到返回 undefined
9. withDirectives
10. createRenderer: 自定义渲染器，有啥场景？
11. nextTick：同 vm.$nextTick
12. mergeProps: 用于 props 合并，返回新对象，不会修改愿对象，是如何做到的？对象 deepclone 吗？
13. useCssModule：在 setup 和 render 中使用，返回当前组件的 css module 对象，与 vue2 手动引入 css 文件处理不同
14. version

问题：为什么不包含响应式 api

### 1.6 实例 api

属性  
1. vm.$data
2. vm.$props
3. vm.$el: 当前实例正在使用的根元素，多根节点则是顶部的占位元素
4. vm.$options: 组件配置选项
5. vm.$parent：访问父实例，但是没有 vm.$children 了
6. vm.$root：组件树根实例
7. vm.$slot: vm.$slot.default(), vm.$slot.header() 函数调用，统一了默认插槽和具名插槽，废除了 vm.$scopedSlot
8. vm.$refs: 同 vue2
9. vm.$attrs：包含了所有没有被解析的 template 属性，比如 class, style, 事件等

方法  
1. vm.$watch
2. vm.$emit
3. vm.$forceUpdate: 影响实例本身和插槽内的子组件，不是所有子组件？如何理解
4. vm.$nextTick

### 1.7 响应式 api

是一种特殊的 全局 api，包含了基础 api reactive 等、Refs、Computed 和 watch

基础响应式，主要是 reactive
1. reactive()：将 object 对象转换为响应式的，基于 proxy。和 ref 有什么区别？能处理基础类型和数组函数吗？
2. readonly()
3. isProxy(): 检测对象是否是基于 reactive or readonly 处理后的数据
4. isReactive()
5. isReadonly()
6. toRaw(): 获取原始对象，绕过 proxy 访问和修改原始对象
7. markRaw()：标记一个对象，返回对象本身，让其不会被 reactive 等转换为 proxy
8. shallowReactive()：不同于 reactive，shallowReactive是只监听第一层。有什么用？
9. shallowReadonly()：有什么使用场景？

ref  
1. ref()
2. unref()
3. toRef(): 获取响应式对象的某个属性，并且设置其为响应式值
4. toRefs(): 批量获取响应式对象的第一层属性，并且设置属性为响应式值，返回的是普通对象，但是对象值是 ref 响应式的，主要用于解构赋值
5. isRef()
6. 

## 2 问题归纳

1. vue2 各组件是 vm.$options._base.extend(object) 对象，生成的 vue 实例，那么 vue3 组件是继续使用 createApp 来生成实例的吗？
2. vue2 一些全局对象挂载在 Vue 对象上有什么不好的点？1. 同时实例化多个 Vue 实例，则不能独享私有配置 2. 全局配置污染测试用例，比如全局的 mixin, use 
3. vue3 响应式系统，对比 vue2，除了使用 proxy 来拦截，是使用什么方式来更新呢？vue2 是 dep + watcher 来实现
4. vue3 数据驱动原理，也就是编译生成 render 函数，通过 render 生成 vnode，vnode 生成 dom 流程，是否与 vue2 不同

## 3 组合式 api

组合式 api 的目的，是为了将逻辑代码块抽离，在需要的组件内部合理组装

```javascript
import { reactive, ref, toRefs, onMounted, watch, computed, provide, inject... } from 'vue'
```

1. reactive: reactive({key: value})
2. ref: ref(0)，用于封装独立原始值，作为响应式对象，返回包裹后的引用对象；直接访问这个对象，需要访问对象的 value 属性，而对象作为 reactive 封装的对象属性或 vm 实例时，会自动展开，不用访问其 value 属性；如果 ref 的 key 和定义在 html 元素上的 ref 属性相同时，ref 指向 vnode 节点
3. toRefs：响应式对象数据解耦需要使用 toRefs 包裹，后续使用到再了解实现原理。通常在 setup 中使用 props 来使用它。同 toRef 处理可能不存在的响应式属性
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
5. context对象包含属性：attrs, slots, emit；context 是非响应式的，可以任意解构
6. 不能访问的实例属性：data, computed, methods
7. 返回 render 函数：会替代 template 和组件自身的 render 吗？会

## 4 ts 支持

1. webpack 配置 ts-loader 处理 ts
```javascript
{
  test: /\.tsx?$/,
  loader: 'ts-loader',
  options: {
    appendTsSuffixTo: [/\.vue$/],
  },
  exclude: /node_modules/,
}
```
2. 所有 vue 组件使用 `defineComponent` 包裹起来
```javascript
import { defineComponent } from 'vue'
export default defineComponent({
})
```
3. computed 对象数据需要明确添加 ts 类型注解

## 参考文章

[vue3 中文官网](https://vue3js.cn/docs/zh/guide/migration/introduction.html#%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)  
[vue3 + ts](https://v3.cn.vuejs.org/guide/typescript-support.html#typescript-%E6%94%AF%E6%8C%81)
