# react vs vue

> 每当自己对 vue 或 react 有疑惑的时候，则可以来这里查看相关  
> 总结归纳方式：通读 vue 官方文档，每到一个知识点，同 react 官方文档对比来看

已经总结到：基础 - vue 实例，该**模板语法**了

## 1 整体对比

| 类型     | react  |  vue  |
| -------- | :-----: | :----:   |
| `1渐进式框架` | ✔  | ✔  |
| `2虚拟dom` | ✔  | ✔  |
| `2虚拟dom`-特点 | 一个根实例 + 树形后代多实例  | 一个根实例 + 树形后代多实例  |
| `2虚拟dom`-更新方式 | diff新旧虚拟树?  | diff?  |
| `3数据流`-响应式数据 | - | 双向数据邦定 |
| `3数据流`-props | 单向数据流 | 单向数据流 |
| `3数据流`-data | 在 constructor 方法内部设置 this.state = {} | data(){return {}}，首层为响应式数据 |
| `3数据流`-数据驱动 | 主动调用 setState 方法，添加到数据更新队列 | defineProperty、proxy 添加 watcher 给每个数据；<br>也可以主动 this.hello = 'world'，数据变动添加到更新队列 |
| `4组件`-格式 | 标准 es6 class 对象, `.js` | vue 指定格式, `.vue` |
| `4组件`-根组件渲染 | ReactDOM.render(element, document.body) | new Vue({ele, router, template, components}) |
| `4组件`-实例 | 每个组件都是一个 react 实例 | 每个组件都是一个 vue 实例 |
| `4组件`-jsx | React.createElement(component, props, ...children) 的语法糖 | createElement |
| `4组件`-jsx-内容变量 | {hello} | {{hello}} |
| `4组件`-jsx-属性变量 | `<span title={this.state.title}>` | `<span v-bind:title="title">` |
| `4组件`-jsx-属性变量不传值 | 默认为 true | 默认为 true |
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
| `事件`-邦定 | onClick="clickCallback" | v-on:click="clickCallback" 或 @click="clickCallback" |
| `事件`-兼容性 | ✔  | ✔  |
| `扩展`-状态管理 | redux  | vuex  |

> 待补充：  
> 1. 在不同生命周期时，框架做了什么事情

## 2 vue 特色

### 2.1 指令

1. v-bind: 节点属性插入变量

### 2.2 实例属性

每一个 vue 组件都是一个实例，这个同 react 一样，但是 react 没有什么实例属性或方法，但是 vue 有

1. 实例属性：`$` 开头，比如 `$ref`
2. 实例方法：`$` 开头，比如  `$watch()`

### 2.3 computed vs watch

2者不同的使用场景

1. 内部响应式数据需要使用到 props 数据：使用 `watch` 监听 props 数据，动态更新 data 内部属性值
2. 复杂计算构成的普通数据：使用 `computed`，当一个状态需要由其他数据决定的时候，包括 props 数据、响应式数据、普通数据，但是 computed 数据本身只能作为普通数据，不能用于响应式数据

计算属性 computed 特点：`数据缓存`，当依赖数据变化时才会去更新缓存

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

### 5.1 父子组件信息交互

通常实现一个功能模块，需要将该功能模块拆分成多个模块，模块之间信息通过 `props` 传递数据与方法

1. `index.vue`：入口文件，作为其他组件的父组件，包含通用状态
2. 多层嵌套、多子组件实例，建议使用状态管理

### 5.2 标单可编辑状态数据回滚

表单数据更新，应当允许数据回滚，比如数据用户编辑出错，选择取消编辑，则数据应当回滚

数据设计方式：`originalInfo`, `currentInfo`

originalInfo: 保存原有数据，当数据出错时，将 currentInfo 部分数据恢复为 originalInfo 的数据

currentInfo：当前表单双向数据邦定数据，由 originalInfo 而来，当 originalInfo 更新时同步更新

### 5.3 使用 v-if 阻止组件渲染与发起 http 请求

如果在父组件中同时存在多个相同子组件实例，如果默认子组件渲染的话，可能会同时由子组件发起重复的 http 请求获取初始化数据，此刻可以使用 v-if 阻止子组件渲染，减少同时发起的 http 请求

思考：

1. 如果项目中用到的 vuex 状态管理，就可以多个子组件共享一套数据，而不用重复去发起数据请求了
2. 如果使用动态加载技术，也可以实现在需要的时候再去加载这个组件，但是组件属于内部组件，而不是模块组件的话，则

****




## 参考文章

[1. 前端之巅](https://mp.weixin.qq.com/s/KCZsBmQiCdLF2HJ5N4Pbyw)  
[2. vue 官网](https://cn.vuejs.org/v2/guide/comparison.html)  
