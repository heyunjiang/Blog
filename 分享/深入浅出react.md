# 深入浅出 react

time: 2018.10.25

update: 2018.11.13

> 公司内部分享，面向大部分不太懂前端的人员

## 1 分享目的

听者：了解流行前端框架 react，包括其应用方式、原理、场景等

自己：对阶段学习总结，加深印象，沟通能力提高

## 2 初探 react

```javascript
import React from 'react'
import ReactDOM from 'react-dom'

const Element = () => {
    return (
        <div>hello world</div>
    )
}

ReactDom.render(<Element />, document.body)
```

查看编译结果

[babel 在线编译](https://babeljs.io/repl/#?babili=false&evaluate=true&lineWrap=false&presets=es2015%2Creact%2Cstage-0&code=function%20hello()%20%7B%0A%20%20return%20%3Cdiv%3EHello%20world!%3C%2Fdiv%3E%3B%0A%7D)

## 3 react 知识点概括

基本

1. 3层架构：用户使用层、虚拟 dom 层、真实 dom 层
2. 数据驱动：数据驱动界面变化，单向数据流
3. 组件化：由多个组件构建成一个界面
4. jsx、元素、事件
5. React.createElement()、React.cloneElement(element, [props], [...children])
6. ReactDOM.render(element, container, callback)、ReactDOM.findDOMNode(component)

详细讲解组件化：标准组件代码、组件代码结构(css + js)、组件生命周期

****

高级

1. refs：获取真实dom，React.forwardRef
2. context：全局对象，解决多层多个组件间使用同一数据问题
3. Portals：外部渲染，ReactDOM.createPortal(child, container)
4. Error Boundaries：错误边界，项目体验优化，`componentDidCatch(error, info)`
5. hoc && render prop

## 4 react 全家桶

redux + redux-saga + react-router (+ webpack + history + connect-react-router)

## 5 项目实战

结合 portal 来谈

## 6 react 技术难点

虚拟 dom

## 7 对比 vue

## 8 总结