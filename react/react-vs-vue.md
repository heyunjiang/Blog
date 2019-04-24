# react vs vue

author: heyunjiang  
time: 2019.3.27  
update: 2019.4.2  

> 每当自己对 vue 或 react 有疑惑的时候，则可以来这里查看相关  
> 总结归纳方式：通读 vue 官方文档，每到一个知识点，同 react 官方文档对比来看，待总结完了，再完整看 react 官方文档一编；日后做项目，如果有发现新的特点或者有所项目感悟，也可以总结到这里来

已经总结到：基础 - vue 深入-prop，该自定义事件

目录

[1 整体对比](#1-整体对比)  
[2 vue 特色](#2-vue-特色)  
&nbsp;&nbsp;[2.1 指令](#2.1-指令)  
&nbsp;&nbsp;[2.2 实例属性](#2.2-实例属性)  
&nbsp;&nbsp;[2.3 computed vs watch](#2.3-computed-vs-watch)  
[3 标准示例](#3-标准示例)  
[5 项目经验总结](#5-项目经验总结)  
&nbsp;&nbsp;[5.1 父子组件数据组织](#5.1-父子组件数据组织)  
&nbsp;&nbsp;[5.2 表单可编辑状态数据回滚](#5.2-表单可编辑状态数据回滚)  
&nbsp;&nbsp;[5.3 使用 v-if 阻止组件渲染与发起 http 请求](#5.3-使用-v-if-阻止组件渲染与发起-http-请求)  
&nbsp;&nbsp;[5.4 组件使用 v-model](#5.4-组件使用-v-model)  

## 1 整体对比

归纳
1. react 很轻量，vue 做了太多特性的东西了，比如指令、class多种类型绑定等

| 类型     | react  |  vue  |
| -------- | :----- | :----   |
| `1渐进式框架` | ✔  | ✔  |
| `2虚拟dom` | ✔  | ✔  |
| `2虚拟dom`-特点 | 一个根实例 + 树形后代多实例  | 一个根实例 + 树形后代多实例  |
| `2虚拟dom`-更新方式 | diff新旧虚拟树?  | diff?  |
| `3数据流`-响应式数据 | - | 双向数据邦定 |
| `3数据流`-props | 单向数据流 | 单向数据流 |
| `3数据流`-data | 在 constructor 方法内部设置 this.state = {} | data(){return {}}，首层为响应式数据 |
| `3数据流`-数据驱动 | 主动调用 setState 方法，添加到数据更新队列 | 1. 响应式数据：defineProperty、proxy 添加 watcher 给每个组件的 data 对象；<br>2. 也可以主动 this.hello = 'world'，数据变动添加到更新队列；<br>3. this.$set(this.hello, 'world', 27) 添加响应式数据，或者更新数组、对象的值，直接更新数组对应下标值、更新对象属性是不能将数据添加到更新队列，界面无法更新；<br>4. v-model 双向邦定标单数据 |
| `3数据流`-数组更新 | only setState | 支持直接 arr.push() 或者 arr = [...arr, newItem] |
| `4组件`-格式 | 标准 es6 class 对象, `.js` | vue 指定格式, `.vue` |
| `4组件`-根组件渲染 | ReactDOM.render(element, document.body) | new Vue({ele, router, template, components}) |
| `4组件`-实例 | 每个组件都是一个 react 实例 | 每个组件都是一个 vue 实例 |
| `4组件`-自定义组件命名 | 名称必须大写开头 | 名称可以大写小写开头 |
| `4组件`-全局注册 |  | Vue.component()<br>一些通用、常用组件可以考虑全局注册，通过 webpack 进行目录性质的全局注册 |
| `4组件`-局部注册 | export default class Hello extends React.component {} | export default {name:'Hello', data(){return {}}} |
| `4组件`-jsx-解析 | React.createElement(component, props, ...children) 的语法糖 | render: createElement => createElement(...) |
| `4组件`-jsx-内容变量 | {hello} | {{hello}}、v-html |
| `4组件`-jsx-属性变量 | `<span title={this.state.title}>` | `<span v-bind:title="title">` |
| `4组件`-jsx-属性批量传递 | {...childPros} | v-bind="childPros" |
| `4组件`-jsx-属性变量不传值 | 默认为 true | 默认为 true |
| `4组件`-jsx-动态生成节点 | jsx array，可以通过 map 或普通函数 return 节点 | v-html, v-for |
| `4组件`-jsx-class绑定 | className={this.state.helloClass}，**组件根元素呢？** | bind 中可以是字符串、数组、对象，用在组件上可以渲染到组件的根元素上 |
| `4组件`-jsx-style绑定 | style={styleObject} | :style="styleObject"，多个的话支持数组 |
| `4组件`-jsx-防xss攻击 | react 会把所有内容在渲染前解析成字符串 | vue 会把所有内容在渲染前解析成字符串，但是不会转换v-html 的值，会有 xss 攻击风险 |
| `4组件`-jsx-隐身元素 | React.Fragment 或 <></> | template |
| `4组件`-props |  | 1.大小写不敏感，在模版中可以采用 `kebab-case` 规则 <br> 2.使用 v-bind 批量传递 prop <br> 3.组件 props 默认存在继承特性，即父组件可以增加未在子组件中定义的prop，比如 class，默认是应用在子组件根节点上，可以使用 `inheritAttrs: false` 禁止继承 |
| `5生命周期`-实例创建前 | constructor() | beforeCreate() |
| `5生命周期`-实例创建成功 | - | created() |
| `5生命周期`-实例挂载前 | getDerivedStateFromProps() | beforeMount() |
| `5生命周期`-实例挂载成功 | componentDidMount() | mounted() |
| `5生命周期`-实例更新前 | getDerivedStateFromProps()、shouldComponentUpdate()、getSnapshotBeforeUpdate() | beforeUpdate() |
| `5生命周期`-实例更新成功 | componentDidUpdate() | updated() |
| `5生命周期`-实例停用时 | - | deactivated()，在 keep-alive 组件停用时调用 |
| `5生命周期`-实例激活时 | - | activated()，在 keep-alive 组件激活时调用 |
| `5生命周期`-实例销毁前 | componentWillUnmount() | beforeDestroy() |
| `5生命周期`-实例销毁成功 | componentDidUnmount() | destroyed() |
| `5生命周期`-实例错误处理 | getDerivedStateFromError()、componentDidCatch() | errorCaptured() |
| `6事件`-邦定 | onClick="clickCallback" | v-on:click="clickCallback" 或 @click="clickCallback" |
| `6事件`-兼容性 | ✔  | ✔  |
| `6事件`-访问原始event |   | @click="func($event)"  |
| `6事件`-事件修饰 |   | .stop, .prevent, .capture, .self, .once, .passive，按键修饰、系统修饰  |
| `6事件`-自定义-定义事件并触发 |   | 定义：@personalEvent="func";<br> 触发：@click="this.$emit('personalEvent')")  |
| `6事件`-自定义-事件名 |   | 要求必须定义和调用时一致，这个和组件名、props名不一样  |
| `扩展`-状态管理 | redux  | vuex  |

> 待补充：  
> 1. 在不同生命周期时，框架做了什么事情

## 2 vue 特色

### 2.1 指令

1. v-bind: v-bind:href="", 简写 `:href=""`，节点属性插入变量
2. v-once: 节点一次性插值，当变量变化的时候，该节点的值不会更新
3. v-html: 节点输出内部 innerHTML (不要对用户提供的内容使用 v-html，容易导致 xss 攻击)
4. v-if, v-else, v-else-if, v-show
5. v-on: 邦定事件，v-on:click=""，简写`@click=""`，可以自定义事件，在组件内部调用 this.$emit() 触发
6. v-for: 循环，增加 key 是为了提高效率，方便追踪到具体元素，而不是所有元素都去比较
7. v-model: 双向邦定标单数据，属于语法糖，本质是监听事件更新数据，会忽略value、checked、selected 等特性，支持 input 框的 v-model.lay 属性，在 change 时更新，而不是 input 的时候更新

> 指令修饰：@click.prevent=""

### 2.2 实例属性

每一个 vue 组件都是一个实例，这个同 react 一样，但是 react 没有什么实例属性或方法，但是 vue 有

1. 实例属性：`$` 开头，比如 `$ref`
2. 实例方法：`$` 开头，比如  `$watch()`

### 2.3 computed vs watch

2者不同的使用场景

1. 内部响应式数据需要使用到 props 数据：使用 `watch` 监听 props 数据，动态更新 data 内部属性值
2. 复杂计算构成的普通数据：使用 `computed`，当一个状态需要由其他数据决定的时候，包括 props 数据、响应式数据、普通数据，但是 computed 数据本身只能作为普通数据，不能用于响应式数据

计算属性 computed 特点：

1. `数据缓存`，当依赖数据变化时才会去更新缓存
2. `setter 反响更新其它数据`，本来计算属性是只有 getter，但是可以强行增加 setter，反响操作，更新其他值

## 3 标准示例

```javascript
// react 组件
export default class Filter extends React.Component {
  constructor(props) {
        super(props)
        this.state = {
          hello: 'world'
        }
    }
  componentDidMount() {}
  updateFunction() {
    this.setState({
      hello: 'china'
    })
  }
  render(){
    return (
      <div title="{this.title}">{this.hello}</div>
    )
  }
}
```

```vue
// vue 组件
<template>
  <div>{{hello}}</div>
</template>

<script>
export default {
  name: 'TaskList',
  components: {},
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  mixins: [],
  data () {
    return {
      hello: 'world',
      modalStatus: false
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    update() {
      this.modalStatus = true
    }
  }
}
</script>

<style></style>

```

## 5 项目经验总结

### 5.1 父子组件数据组织

通常实现一个功能模块，需要将该功能模块拆分成多个模块，模块之间信息通过 `props` 传递数据与方法

1. `index.vue`：入口文件，作为其他组件的父组件，包含通用状态
2. 多层嵌套、多子组件实例，建议使用状态管理

### 5.2 表单可编辑状态数据回滚

表单数据更新，应当允许数据回滚，比如数据用户编辑出错，选择取消编辑，则数据应当回滚

数据设计方式：`originalInfo`, `currentInfo`

originalInfo: 保存原有数据，当数据出错时，将 currentInfo 部分数据恢复为 originalInfo 的数据

currentInfo：当前表单双向数据邦定数据，由 originalInfo 而来，当 originalInfo 更新时同步更新

### 5.3 使用 v-if 阻止组件渲染与发起 http 请求

如果在父组件中同时存在多个相同子组件实例，如果默认子组件渲染的话，可能会同时由子组件发起重复的 http 请求获取初始化数据，此刻可以使用 v-if 阻止子组件渲染，减少同时发起的 http 请求

思考：

1. 如果项目中用到的 vuex 状态管理，就可以多个子组件共享一套数据，而不用重复去发起数据请求了
2. 如果使用动态加载技术，也可以实现在需要的时候再去加载这个组件，但是组件属于内部组件，而不是模块组件的话，则

### 5.4 组件抽离原则

组件抽离类型

1. 页面模块抽离：一个页面由多个模块组成，比如 `header + leftList + rightContent + footer` ，每个模块都单独拆分，公共数据由统一父组件管理
2. 通用模块抽离：项目内不同页面可能使用到相同的模块，比如 `文件上传、评论列表` 等，需要抽离出来
3. 通用组件抽离：通常是特性组件，是你自行设计的通用组件，可以跨项目使用的

组件抽离原则

1. readme：每个组件要有一个 readme.md 的说明文件 (或者至少在组件入口 index.vue 中要一段说明注释)
2. props：组件的 props 要设计的合理，每个 prop 至少包含如下字段 `type, required, desc`
3. 注释：组件内部各项操作要有注释
4. 编码规范：符合 vue 官方风格指南，包括组件命名、选项顺序等

### 5.5 接口数据缓存

为什么说接口数据缓存很重要？

场景描述：在一个页面内，有几个地方需要使用到相同的数据，比较差点的做法是在每次需要时都去发起 http 请求拿数据，好一点的是将数据缓存起来，在需要拿最新数据的时候再发 http 请求

缓存数据的方式：在每次发请求拿数据前，判断一下是否有缓存

1. 当前组件内部缓存：缓存在组件内部 data 变量中
2. 保存在 sessionStorage 中：通常用在 mixin 中，因为 mixin 需要在很多组件中引入
3. 保存在 vuex 全局状态中：这种方式对于大型应用很友好，但是小应用就没有必要了，不用管理那么多数据

## 参考文章

[1. 前端之巅](https://mp.weixin.qq.com/s/KCZsBmQiCdLF2HJ5N4Pbyw)  
[2. vue 官网](https://cn.vuejs.org/v2/guide/comparison.html)  
