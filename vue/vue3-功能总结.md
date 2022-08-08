# vue3 功能总结

time: 2021.2.25  
author: heyunjiang

## 背景

vue2 到 vue3 变化总结归纳：  
1. 支持组合式 api：抽离独立的 composables 函数，支持参数，函数内部使用 ref, reactive, watch, onMounted 等全局 api；通常使用 script setup 搭配
2. template 变化：多级根组件、teleport、v-model、this.$slots、key 绑定到 template 等变化
3. css：支持在 style 中使用 v-bind 使用定义在 script 中的变量
4. 分为应用和组件2种实例

内部原理性变化  
1. 组件轻量化：使用 plain object 替代 vue2 的函数实例对象，use、config、mixin 等方法定义在了应用实例上；
2. 渲染性能优化：使用 patchFlags 处理了无响应式数据节点对象，使用位运算 & 快速匹配，按需更新 class, style, props 等
3. 响应式变化：拆分响应式模块，提供 ref, reactive, track, trigger 等 api，内部使用 proxy 简化，使用比较灵活

## 1 功能总结

基础变更点  
1. createApp 代替 new Vue 生成应用实例，参数接受根组件配置，从而将应用 api 和组件 api 分开，实现全局 1应用实例 + n组件实例，简化组件
2. vite 入口是 html，直接使用 es6 script module 引入 js 执行
3. vue3 组合式 api，主要体现在 setup 函数，setup 结合 composables 函数实现组合；vue2 选项式 api
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
那么 vue3 挂载在应用实例上，一样也可以通过 vm.root 来读取插件数据。

### 1.2 v-model

1. v-model 替代了 v-bind.sync 双向数据绑定
2. v-model:title="pageTitle"，组件内部对应的 prop 为 title，对应的事件为 `update:title`
3. 可以使用多个 v-model
4. 单个 v-model，组件内部对应的是默认 `modelValue`，对应的事件是 `update:modelValue`，废弃了原本的 model 选项和 v-bind 的 .sync 修饰符
5. 修饰符：.capitalize

### 1.3 app.config

1. errorHandler: 全局错误处理
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
1. app 是如何影响到内部其余组件的？每个组件都会绑定一个应用实例
2. 它自身就是一个实例吗？它是一个应用实例
3. 内部组件是如何渲染及挂载的？使用根组件作为渲染起点

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

toRef 和 toRefs 有什么不同？2者相同点都是对响应式对象结构，不同的是 toRefs 是返回的对象，toRef 返回的具体属性，如果想获取原对象不存在的属性，则需要使用 toRef 来添加响应式数据

### 1.8 jsx

需要配合构建构建使用 jsx 转译实现

1. jsx 知识 h 函数的语法糖，本质会被编译成 createElementVnode 实现
2. jsx 的优势：能处理动态组件，比如需要根据 props 动态渲染，有动态 table td 渲染
3. template 的优势：能利用 vue 自带的指令、渲染时标记实现性能优化（编译时增加了标记）
4. 动态要求高的地方使用 jsx，其他默认 template

## 2 问题归纳

1. vue2 各组件是 vm.$options._base.extend(object) 对象，生成的 vue 实例，那么 vue3 组件是继续使用 createApp 来生成实例的吗？
2. vue2 一些全局对象挂载在 Vue 对象上有什么不好的点？1. 同时实例化多个 Vue 实例，则不能独享私有配置 2. 全局配置污染测试用例，比如全局的 mixin, use 
3. vue3 响应式系统，对比 vue2，除了使用 proxy 来拦截，是使用什么方式来更新呢？vue2 是 dep + watcher 来实现，vue3 track
4. vue3 数据驱动原理，也就是编译生成 render 函数，通过 render 生成 vnode，vnode 生成 dom 流程，是否与 vue2 不同

2022-05-25 17:20:41
1. vue3 对数据操作方法还有做拦截吗，已经基于 proxy 拦截了，proxy 有能力拦截 push 方法吗？有，push 也是数组的属性，会被 proxy get 拦截，reactive.proxy.handler.get 中对 array 众多方法做了处理
2. vue3 对事件是如何绑定的？有做什么优化没？没有，通过 render.patchElement.mountElement.patchProps.patchEvent 实现事件绑定，对回调函数做了一层 invoke 包装，解决动态绑定事件的立即执行问题
3. vue3 对 mustache 插入的变量是如何渲染的？即 textContent 如何插入？attribute 如何转译的呢？`{{item}}` 编译成 `toDisplayString(item)`, 使用 `el.textContent = text` 渲染文本元素

## 3 组合式 api

组合式 api 的目的，是为了将逻辑代码块抽离，在需要的组件内部合理组装。本质是数据逻辑与模板的拆分，通过 setup 去拿想要的数据。  
> 类似之前的 mixin 非直接混入用法，也可以只 import mixin 对象的属性和方法

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

项目经验总结：  
1. 使用 vuex 数据时，需要访问 this 对象，则需要使用选项式 api 操作，通常一个组件中同时包含 setup 和 export default 2种 script
2. 使用 2种 script 时，不支持 render 渲染，需要处理成 template 模板写法
3. 

### 3.1 setup 选项

1. 作为独立选项，并且放置在 props 之下，data 之前
2. 执行时机在组件创建之前，那具体在什么时候呢？是在 beforeCreate 之后吗？
3. 参数为：props, context
4. 作用：返回的内容(return obj, arr or string 等等)，是直接挂载到当前组件实例 this 对象上，用作给其他生命周期方法、method、watch、computed、template 等使用
5. context对象包含属性：attrs, slots, emit, expose；context 是非响应式的，可以任意解构
6. 不能访问的实例属性：data, computed, methods
7. 返回 render 函数：会替代 template 和组件自身的 render 吗？会

### 3.2 <script setup>

每个 sfc 中，可以包含一个 `<script>` 和 一个 `<script setup>`

1. 是组合式 api setup() 的语法糖
2. 内部代码在组件被创建时被执行，而不是引入时执行
3. 顶层绑定直接暴露给模板，比如声明的变量、函数声明、import 的组件(特殊)等
4. 声明 props 必须使用 `defineProps`
5. 声明 emits 必须使用 `defineEmits`
6. 可以使用 `defineExpose` 主动暴露对象数据
7. 搭配 `<script>` 一起使用：什么场景？深入使用再考虑
8. 可以使用顶层 await
9. 能使用 ts 声明

既然作为 setup 的语法糖，并且提供了组件 props, emits 声明实现，代码中我们可以直接使用它

问题：setup 是在组件实例创建之前执行的，也就是此刻访问不到 this 对象，那么它如何同其他组件通信呢？  
1. localStorage
2. defineProps
3. 和 script 共存，通过 this 对象传递

### 3.3 composition api vs mixin

vue2 在如下场景中使用到了 mixin：多个 tab 对应的内容大致一样，可以抽离通用的方法、属性和生命周期等，实现代码复用。

mixin 使用有如下弊端  
1. 需要打开每个 mixin 查看每个属性含义：复杂组件，每个 mixin 属性都需要去指定的 mixin 了解它的属性含义，而组合式 api 是在 setup 中显示引入模块的属性和方法，就在当前组件 setup 中能看到
2. 灵活性：mixin 不能传参，而组合式 api 可以

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

## 临时思考

找新工作时，想到一个点可以去了解公司岗位，问面试官如下问题  
1. 部门对社招新人有啥培养
2. 业务开发任务多不
3. 有哪些前端发展方向，可能有哪些机会

## vue3 框架思考

1. 核心能力：声明式渲染(html)、响应性
2. 多场景支持：无需构建的纯 html 引入使用、spa、webComponents、ssr、ssg、桌面端等。需要为这些场景配备相应的能力，比如包含 compiler 的 umd 包，支持 webpack 的 vue-loader，nuxtjs ssr 实现。。。
3. 提供的能力：单文件组件渲染、loader、国际化、测试、ts、极致性能、treeShaking、体积小、编辑器插件、构建工具vite、jsx、less、css、ssr、安全、无障碍

性能优化  
1. 智能推导需要重新渲染的组件最小数量：patch + diff + patchFlag + key。patchFlag 为 -1 表示静态节点，后续更新会复用，不会再次生成；还有 style, class, props 等标识
2. tree-shaking 减小 bundle
3. ssr/ssg
4. v-once/v-memo
5. flat tree：打平树结构，createElementBlock 只保留动态子节点，diff 时节省时间

虚拟 dom 的优势  
1. 提升开发速度：隐藏了实际操作 dom 结构，交给框架 patch 去实现，开发者只需要声明式编写相关数据结构
2. 规范化开发体系：所有直接操作 dom、内部优化由框架实现

## 参考文章

[vue3 中文官网](https://vue3js.cn/docs/zh/guide/migration/introduction.html#%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)  
[vue3 + ts](https://v3.cn.vuejs.org/guide/typescript-support.html#typescript-%E6%94%AF%E6%8C%81)
