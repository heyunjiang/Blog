# react vs vue

> 每当自己对 vue 或 react 有疑惑的时候，则可以来这里查看相关  
> 总结归纳方式：通读 vue 官方文档，每到一个知识点，同 react 官方文档对比来看

## 1 整体对比

| 类型     | react  |  vue  |
| -------- | :-----: | :----:   |
| 渐进式框架 | ✔  | ✔  |
| 虚拟dom | ✔  | ✔  |
| 虚拟dom-更新方式 | diff新旧虚拟树?  | diff?  |
| 数据流-响应式数据 | - | 双向数据邦定 |
| 数据流-props | 单向数据流 | 单向数据流 |
| 数据流-data | 在 constructor 方法内部设置 this.state = {} | data(){return {}}，首层为响应式数据 |
| 数据流-数据驱动 | 主动调用 setState 方法，添加到数据更新队列 | defineProperty、proxy 添加 watcher 给每个数据；<br>也可以主动 this.hello = 'world'，数据变动添加到更新队列 |
| 组件-格式 | 标准 es6 class 对象, `.js` | vue 指定格式, `.vue` |
| 组件-渲染 | ReactDOM.render(element, document.body) | new Vue({ele, router, template, components}) |
| 组件-jsx | React.createElement(component, props, ...children) 的语法糖 | createElement |
| 组件-jsx-内容变量 | {hello} | {{hello}} |
| 组件-jsx-属性变量 | `<span title={this.state.title}>` | `<span v-bind:title="title">` |
| 组件-jsx-属性变量不传值 | 默认为 true | 默认为 true |
| 事件-邦定 | onClick="clickCallback" | v-on:click="clickCallback" 或 @click="clickCallback" |
| 事件-兼容性 | ✔  | ✔  |

## 2 vue 特色

### 2.1 指令

1. v-bind: 节点属性插入变量

## 3 标准实例


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


## 1 数据流

如果采用状态管理，比如react-redux，vue-vuex，那么它们的数据状态更新都只能通过`reducer`或`mutations`来更新数据，都属于单向数据了

> 注意: 在2者封装组件时，因为传递的props都是只读的，不允许直接修改，但是react可以直接在 `jsx` 中使用 pops，但是vue在使用的时候要注意，不能将 props 通过 `v-modal` 方式绑定到组件上，因为这样会直接修改 props， 从而系统报错

## 2 组件

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

## 参考文章

[1. 前端之巅](https://mp.weixin.qq.com/s/KCZsBmQiCdLF2HJ5N4Pbyw)  
[2. vue 官网](https://cn.vuejs.org/v2/guide/comparison.html)  
