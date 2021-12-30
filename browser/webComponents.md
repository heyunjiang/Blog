# webComponents

time: 2021-12-30 16:36:04  

## 背景

最近在做微前端，使用 umd 方式加载资源，搭配 shadow dom 实现样式隔离，特此来学习总结一下

## 1 基础知识

### 1.1 定义方式

第一步，定义 custom element class
```javascript
export default class WordCount extends HTMLElement {
  constructor() {
    super()
    var shadow = this.attachShadow({mode: 'open'})
    var wrapper = document.createElement('span')
    wrapper.textContent = 'content'
    shadow.appendChild(wrapper)
  }
  connectedCallback() {
    console.log('connectedCallback')
  }
  disconnectedCallback() {
    console.log('disconnectedCallback')
  }
}
```

第二步，注册组件 `customElements.define('word-count', WordCount)`  
第三步，配置 vue 全局自定义组件 `Vue.config.ignoredElements = ['word-count']`  
第四步，使用组件 `<word-count />`

### 1.2 生命周期

### 1.3 shadow dom

作用：可以将标记结构、样式和行为隐藏起来，并与页面上的其他代码相隔离，保证不同的部分不会混在一起，可使代码更加干净、整洁  
创建方式：`this.attachShadow({mode: 'open'})` open 和 closed 作为可选项，open 表示外部可以访问 `shadowRoot` 节点  
弊端：由于 shadow dom 不能改变外部 dom 样式，如果我们的 dialog 是渲染在 body 里面，则会丢失响应样式，需要控制只能渲染到 shadowRoot 里面

## 参考文章

[Web Component可以取代你的前端框架吗？](https://zhuanlan.zhihu.com/p/64619005)  
[mdn web components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_shadow_DOM)
