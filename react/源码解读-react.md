# 源码解读 react

time: 2021-11-01 19:17:26  
author: heyunjiang

## 1 问题归纳

1. `export default class extends React.Component {}` 这个继承做了什么？constructor 做了什么？加了哪些属性？添加 this.props、生命周期方法、class 属性、实例方法、实例属性
2. react 事件和 vue 事件都是事件托管处理的吗？是的
3. 为什么给组件 `class.contextType` 加上 contextType 属性，就可以在内部通过 this.context 获取到绑定的 context 对象？
4. 

## 临时想法

1. 项目简单，就缺少了需要解决问题的场景，成长较慢
2. 项目数量多了，就会存在大量的人力切换成本，很耗精力，事倍工半
3. 需要的是独立负责一个项目，专一投入解决复杂问题，这个在找工作或者换部门的时候要向业务方明确工作内容
