# react源码阅读

time: 2018.10.16

heyunjiang

目录

[1 为什么阅读源码](#1-为什么阅读源码)  
[2 熟练使用 react](#2-熟练使用-react)  
&nbsp;&nbsp;[2.1 基本功能](#2.1-基本功能)  
&nbsp;&nbsp;[2.2 错误边界](#2.2-错误边界)  
&nbsp;&nbsp;[2.3 高阶组件](#2.3-高阶组件)  
&nbsp;&nbsp;[2.4 setState](#2.4-setState)  
&nbsp;&nbsp;[2.5 示例代码](#2.5-示例代码)  
[3 问题归纳](#3-问题归纳)  
[4 问题解答](#4-问题解答)  
&nbsp;&nbsp;[4.1 为什么使用 react ?它与 vue 相比较的优劣势是什么？](#4.1-为什么使用-react-?它与-vue-相比较的优劣势是什么？)  

## 1 为什么阅读源码

1. 在使用 react 过程中，存在一些问题，需要读取源码才能解答这些疑惑；
2. 在解答这些问题的过程中，补充学习基本能力(html, css, js, dom, 浏览器等)
3. 加强自己对 react 的熟练使用程度，学习其设计理念

## 2 熟练使用 react

time: 2018.10.16

背景：自己也使用过 react ，知道 react 的基本使用，没有系统学习 react 。对 redux , react-router4, redux-saga 也研究过了，知道了这3个在项目中充当什么责任，明白了它们的设计理念与实现原理。现在再对 react 做一个完整学习与回顾，看看它在视图层做了什么工作。本次学习就是对自己知识体系的一个完善，'补补牙'

### 2.1 基本功能

也就是学习框架强制的要求写法

react: v16.5.2

time: 2018.10.18

update: 2018.10.29

****

#### 2.1.1 基本知识

> 包含 react 思想、设计理念、运行原理、格式要求

1. 3层架构：用户使用层、虚拟 dom 层、真实 dom 层
2. 数据驱动：数据驱动界面变化，单向数据流
3. 组件化：由多个组件构建成一个界面
4. jsx 编译: jsx 也是表达式，语法糖，在编译过后，jsx 会被转化成普通的 jsx 对象，由 `React.createElement()` 包装起来，如 `代码1`
5. jsx 安全：在编译之后，所有 jsx 中的值都被转换成了字符串，有效解决了 `xss` 攻击
6. 元素：React 基本单元，对象，存在于 `虚拟 dom 层` 中。区别于浏览器 dom 元素，这里的元素是 react 实现的一套 dom 系统，属性也是参考浏览器实现，有许多差别
7. 渲染：`真实 dom 层` 操作，采用 ReactDOM.render(element, document.getElementById('root')) 方法渲染
8. 组件：分为有状态组件和无状态组件。组件编译后的最终形态是一个 funciton。react 在识别 jsx 时，识别到组件时，会自动组装对应组件返回的 jsx ，要求组件名称必须大写开头，用于和 react 普通元素做区别
9. 事件：名称为小驼峰写法，传入函数(非字符串);属于合成事件，实现了浏览器兼容；每个事件对象(syntheticEvent)都有这些属性：bubbles, cancelable, currentTarget, target, defaultPrevented, eventPhase, nativeEvent, type；事件对象是属于共享的，回调事件结束之后，该对象会被重用，属性值置空。
10. html 标签：react 模拟了一层浏览器 html 标签，编译过后就成了 react 元素，要求必须小写开头
11. jsx 内容：会移除空行和开始与结尾处的空格，标签邻近的新行也会被移除，字符串常量内部的换行会被压缩成一个空格
12. PropTypes：只适用于开发环境
13. refs：用的少，结合 echarts 用过，做强制动画用过(因为需要js动态获取高度)，设置 input 焦点用过
14. jsx 标签名：不能为表达式，只能为变量或 react 元素
15. react 表单元素：存在 `defaultValue` 和 `defaultChecked` 2个默认值属性
16. React.pureComponent: 性能优化，浅比较 props 和 state
17. 对象引用修改问题：函数参数为对象时，不能直接修改对象的值，而是复制一遍这个对象。可以考虑使用 immutable.js 这个库，对象一旦创建，如果发生改变则创建一个新对象，不影响原对象
18. context：用于多个层级的多个组件之间需要使用相同数据的场景。`const {Provider, Consumer} = React.createContext(defaultValue);` ，使用 Consumer 订阅 Provider 的值。使用 `context` ，其更新方式不受 shouldComponentUpdate() 生命周期方法影响，只要 Provider 值变，其下面的 Consumer 就会更新。
19. React.Fragment：简写 `<></>`
20. Portals: ReactDOM.createPortal(child, container)，将子节点渲染到父组件以外的 DOM 节点下
21. Error Boundaries：子组件异常捕获，防止应用崩溃，见 2.2 错误边界
22. web 组件：单独学，与 react 不冲突，可以互相套用
23. hoc：高阶组件，一个没有副作用的纯函数，见 2.3 高阶组件
24. render props: 一种设计技术，prop 值为一个函数，动态渲染技术，例子见2.5.3
25. react 严格模式：React.StrictMode，识别具有不安全生命周期的组件，旧 ref 警告，检查意外的副作用。用于多人开发前端时，组件的规范化问题

****

#### 2.1.2 react api

> 包含 react 静态方法、组件生命周期方法、组件类型及属性

1. React.Component
2. React.PureComponent：与 Component 的却别是更新判断 props 的深度差别
3. React.createElement()：创建 react 元素，3个参数：type, props, children，语法糖是 jsx
4. React.cloneElement(element, [props], [...children])：克隆元素，并且增加 props ，替换 children
5. React.isValidElement(element)：判断是否是 react 元素
6. React.Children.FUNCTION: 用于处理 this.props.children ，方法有 map, forEach, count, only, toArray
7. React.Fragment：语法糖 `<></>`
8. React.forwardRef: ref 传递
9. render()：返回 react 元素、字符串、数字、Portals、null、boolean。需要保持其纯净，和浏览器交互应该放到其他生命周期方法中。如果 `shouldComponentUpdate()` 返回 false ，render 方法不会被调用。在组件存活期间只会被调用 **多次**
10. constructor()：组件的构造函数，可选，用于初始化状态或绑定方法，`super(props)` 在构造函数中写其他表达式之前需要先被调用。在组件存活期间只会被调用 **1次**
11. `static getDerivedStateFromProps()`：组件静态方法，当组件初始化时和接受新 props 时会被调用，返回 state 用以更新组件 state 值。使用地方，之前有需要根据props来确定 state ，然后 state 又会改变，以前变相的解决方式是在 state 中保存一个临时 prop 值，然后再前后比较 prop 是否改变来更新 state ，现在可以调用 `getDerivedStateFromProps()` 来实现上述功能。在组件存活期间只会被调用 **多次**
12. UNSAFE_componentWillMount()：在 componentWillMount 和 render 之间的一个生命周期函数，唯一在服务端渲染调用的声明周期钩子函数。在组件存活期间只会被调用 **1次**
13. shouldComponentUpdate()：返回 false ，可以组织 render() 被调用。但是如果组件采用 forceUpdate() 会强制 render() 被调用。在组件存活期间只会被调用 **多次**
14. `getSnapshotBeforeUpdate()`：在更新前拦截旧数据，它的返回值作为 componentDidUpdate() 的参数传入。在组件存活期间只会被调用 **多次**
15. `setState(updater, [callback])`：见2.4 setState
16. `component.forceUpdate()`：强制调用 render() ，并忽略 shouldComponentUpdate()
17. Component.defaultProps：设置组件的默认 props 值
18. Component.displayName：组件属性名，用在调试信息中

****

#### 2.1.3 ReactDOM api

ReactDOM 实现了操作真实 dom 接口，兼容主流浏览器及 ie9+

1. ReactDOM.render(element, container, callback)
2. ReactDOM.unmountComponentAtNode(container)：从目标元素中移除已挂载的 React 组件，清楚他的事件处理器和 state 数据。
3. ReactDOM.findDOMNode(component)：适用于有状态组件，不适用于无状态组件，获取对应组件所在的真实dom。推荐使用 ref 属性实现。
4. ReactDOMServer.renderToString(element)：服务端渲染使用。将组件渲染为原始的 HTML 字符串。

****

#### 2.1.4 React Element

这里归纳一下 react 实现的 dom 元素与浏览器自带的 dom 元素的差别

1. checked：react 中属于受控属性，`defaultChecked` 是非受控属性，设置元素初次加载时的状态
2. 类名：react 中为 className，浏览器中为 class
3. innerHTML：react 提供 `dangerouslySetInnerHTML` 属性接口，值必须为一个函数，函数返回包含 `__html` 属性的对象，浏览器为 dom 对象设置 property `innerHTML`
4. for：react 使用 `htmlfor` 替代浏览器节点上的 for 属性
5. onChange：事件处理，react 的 onChange 就是浏览器的 onInput
6. style: react 支持对象，浏览器节点为字符串
7. value: react 中 value 为受控属性，defaultValue 为非受控属性

#### 2.1.5 测试

使用 `react-dom/test-utils` 搭配 `Jest` 一起做 react 组件测试

****

tips

1. jsx 注释写法： {/* 注释 */}

### 2.2 错误边界

time: 2018.10.23

update: 2018.10.23

设计目标：保护整个应用，捕获部分 UI 异常  
功能描述：用于捕获其子组件树 javascript 异常，记录错误并展示一个回退的 UI

错误捕获位置：

1. 子组件内
2. 渲染期间，非运行期间
3. 生命周期方法、构造函数内，非render方法

无法捕获的错误：

1. 事件处理器内部的错误：它不是在渲染期间内触发的，而是在运行期间
2. 异步代码：setTimeout、requestAnimationFrame
3. 服务端渲染
4. 组件自身，非子组件

实现方式：`componentDidCatch(error, info)`

使用目的：解决因部分组件问题，而造成整个应用 dom 树卸载，应用出现白屏问题。使用错误边界，可以保证整个项目正常运行

错误组件定位：`babel-plugin-transform-react-jsx-source`

### 2.3 高阶组件

> 高阶组件可以返回有状态组件与无状态组件

这里列出高阶组件应遵守的一些约定

1. 约定：不改变原始组件的原型属性，而是使用组合技术，为目标组件创建一个容器组件。如果多个高阶组件使用，修改原始组件的原型属性会出现覆盖问题
2. 约定：不修改原始组件的 props
3. 约定：高阶组件名字有意义，并且能够通过 `WrappedComponent.displayName || WrappedComponent.name` 访问到

注意事项

1. 不要在 render 函数中使用 hoc ：因为 react 每次更新 render 执行时，如果存在高阶组件，则会再次创建一个高阶组件的实例，保留之前创建的实例，占用内存
2. 静态方法拷贝：原组件的静态方法不能通过高阶组件访问到，需要做静态方法拷贝，`hoist-non-react-statics`
3. 高阶组件不能传递 `ref` 属性：ref 属性不想其他 props 一样可以通过传递进原组件，ref 不是一个 prop；react 对 ref 属性有一层处理，会创建使用 ref 属性所在组件的一个 dom 指向。解决方案：使用 `React.forwardRef()` API

### 2.4 setState

标准写法：

```javascript
setState((prevState, props) => stateChange, [callback])

// 或者

setState(stateChange, [callback])
```

1. 更新数据方式：setState 将要变化的数据 state 更新队列，并非立即更新 state 对象。react 会推迟更新 state ，会在合适的时候，一次性地更新组件的 state。
2. 更新结束：callback 或者 componentDidUpdate()
3. setState 返回的更新数据，会被 react 用于和原有 state 作一个浅合并(Object.assign)，类似于 PureComponent 的浅比较

> 问：componentWillUpdate() 在什么时机触发呢？  
> 猜想：在调用 setState 触发或 props 变化的时候。

### 2.5 示例代码

#### 2.5.1 jsx 编译

```javascript
// 代码1 jsx 编译
// jsx
const element = <h1>Hello, world!</h1>;
const ele = (<div>xixi<element /></div>);
const ele1 = (<div>haha<element /><ele /></div>);
ReactDOM.render(ele, document.getElementById('root'));

// 编译后的 jsx
const element = React.createElement('h1', null, 'Hello, world!');
const ele = React.createElement('div', null, 'xixi', React.createElement('element', null));
const ele1 = React.createElement('div', null, 'haha', React.createElement('element', null), React.createElement('ele', null));
ReactDOM.render(ele, document.getElementById('root'));

// React.createElement('h1', null, 'Hello, world!') 返回结果
const element = {
  type: 'h1',
  props: {
    children: 'Hello, world'
  }
};
```

#### 2.5.2 错误边界

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
// 用法
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

#### 2.5.3 render prop

```javascript
// render prop 技术
class Child extends React.Component {
  render() {
    return <components value={this.props.value} />
  }
}
class Parent extends React.Component {
  render() {
    return <div>{this.props.render(this.state)}</div>
  }
}
function withParent (Component) {
  class withParentComponent extends React.Component {
    render() {
      return <Parent render={(value)=><Child value={value} />} />
    }
  }
  withParentComponent.displayName = 'withParentComponent';
  return withParentComponent;
}
```

#### 2.5.4 高阶组件 及 ref 传递

```javascript
// hoc使用错误示例
function logProps(InputComponent) {
  InputComponent.prototype.componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps);
  }
  return InputComponent;
}
const EnhancedComponent = logProps(InputComponent);

// hoc使用正确示例
function logProps(WrappedComponent) {
  return class extends React.Component {
    componentWillReceiveProps(nextProps) {
      console.log(this.props, nextProps);
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
}

//hoc使用传递 ref 解决方案
function logProps(Component) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }
    render() {
      const {forwardedRef, ...rest} = this.props;
      return <Component ref={forwardedRef} {...rest} />;
    }
  }
  function forwardRef(props, ref) {
    return <LogProps {...props} forwardedRef={ref} />;
  }
  const name = Component.displayName || Component.name;
  forwardRef.displayName = `logProps(${name})`;

  return React.forwardRef(forwardRef);
}
```

## 3 问题归纳

1. 为什么使用 react ?它与 vue 相比较的优劣势是什么？
2. 状态变化时，组件与其子组件如何变化，反应到浏览器更新时如何更新的？ finished
3. 为什么要在 jsx 外层包一个小括号，直接返回 jsx 不行吗？ finished
4. setState() 属于异步更新，它更新的时机是什么？为什么要这么做？
5. 为什么要在列表生成中加入 key ？ finished
6. 我使用 jsx ，为什么要引入 react 呢？ finished
7. jsx 标签名为什么不能为一个表达式，必须要是一个变量或 react 元素？
8. extend React.Component 与 React.PureComponent 有什么区别？ finished

## 4 问题解答

### 4.1 为什么使用 react ?它与 vue 相比较的优劣势是什么？

time: 2018.10.16

update: 2018.10.29

isFinish: `false`

本科毕业设计做的项目用的是 react ，对 react 相对更熟悉，react 生态圈也更好，各种模块很完善。

现在使用了一段时间 react ,使用的技术栈为： `webpack4 + react 16 + redux + react-router4 + redux-saga` ，除了 webpack4、 react 源码外，redux + router 系列的源码也都看过了，知道了技术栈中各个模块在系统构建过程中充当什么角色，承担了什么责任。

> 先熟悉一下 react 实现的基本功能，也就是 [第二点](#2-熟练使用-react) 再来看这个问题  
> dom 操作是页面性能的瓶颈

1. 加快开发速度
2. 实现合理兼容：syntheticEvent，antd
3. 利用庞大社区，使用已有轮子：redux, react-router 等
4. 项目合理优化：使用 webpack 优化，dom 操作优化

### 4.2 状态变化时，组件与其子组件如何变化，反应到浏览器更新时如何更新的？

time: 2018.10.18

update: 2018.10.22

isFinish: `true`

> 在 react 官网文档-高级指引- `Reconliliation` 一章中，解释了这个过程

当组件内部状态变化，react 只会更新必要的部分，即子组件变化不会影响到父组件的变化；

当父组件变化，子组件没有变化时，是不是所有子组件都会更新？

> 之前看文档，有谈到 react 是 `粗粒度` 更新，即父组件变化，子组件全部更新；vue 是 `细粒度` 更新，只有父组件变化，则只更新父组件。(这里的更新是指重新创建 dom 树，在浏览器上重新绘制一遍)  
> 答：这种观点是错误的。具体看下面的对比算法，react 是否是粗粒度更新，试更新情况而定

如果想要子组件不被父组件的更新而更新，可以设置 `shouldComponentUpdate()` 生命周期函数返回值。如果父组件的 shouldComponentUpdate 返回 false ，那么父组件及其所有子组件不会被更新。

****

官网更新算法

时间复杂度：O(n)

基于2点假设：

1. 2个不同类型的元素将产生不同的树
2. 通过设置元素 key 属性，示意元素可能是稳定的

**对比算法**：

1. `不同类型的元素`：每当根元素有不同类型，不管是 dom 元素还是组件元素，react 将卸载旧树并重新构建新树。会调用 `componentWillUnmount()` , `componentWillMount()` 和 `componentDidMount()`
2. `相同类型的 dom 元素`：变化前后如果元素为 dom 类型，则比较该 dom 的属性，只更新该 dom 变化的属性，然后递归更新其子元素
3. `相同类型的组件元素`：当更新前后组件类型相同时，实例任然保持一致，保留实例的状态。 react 通过 props 来产生新元素，依次调用 `componentWillReceiveProps()` 和 `componentWillUpdate()` 方法，最后调用 `render()` 方法，然后递归更新其子元素
4. `递归子节点`：当因父组件变化，需要更新时，会遍历子节点。如果子节点非循环遍历生成的，react 循环每个子节点，根据对比算法的1,2,3点进行判断对比更新；如果子节点属于循环遍历生成的，则每个子节点都添加一个 key 属性，通过匹配 key 来寻找原有的子节点更新，或者新增子节点。

****

### 4.3 为什么要在 jsx 外层包一个小括号，直接返回 jsx 不行吗？

time: 2018.10.18

isFinish: `true`

加个小括号，是解决 `分号自动插入` 的 bug

### 4.4 setState() 属于异步更新，它更新的时机是什么？为什么要这么做？

time: 2018.10.24

isFinish: `false`

为什么要这么做：在将要更新的 state 数据放入队列中，react 不会立即更新 state ，为了保证组件性能，react 会挑选合适的时候更新 state 。

更新时机：

### 4.5 为什么要在列表生成中加入 key ？

time: 2018.10.18

isFinish: `true`

表面说的是帮助 react 识别哪些元素发生了改变，key作为元素的唯一标识；除了列表，凡是通过循环生成后代的，都应该添加 key 属性。

非循环生成的 react 元素，react 通过遍历，对比前后 react 树的节点，通过对比算法1,2,3点进行更新。

而循环生成的 react 元素，react 通过其 key 值，定位前后节点变化情况，通过对比算法1,2,3点进行更新。

> 问：非循环生成的 react 元素，是怎么定位的呢？  
> 解释：比如使用 `{isShow?<Show>:null}` 或 `{isShow&&<Show>}` 方式，当 isShow 值变化的时候，react 如何定位该节点后面的兄弟节点，判断是原有节点还是新增的呢？  
> 答：

### 4.6 我使用 jsx ，为什么要引入 react 呢？

time: 2018.10.18

isFinish: `true`

使用了 jsx ，不管使用的是 react 组件，还是 react 元素，最终都会被编译成 `React.createElement()` ，所以必须引入 react 包

### 4.7 jsx 标签名为什么不能为一个表达式，必须要是一个变量或 react 元素？

time: 2018.10.18

isFinish: `false`

猜想：在编译过程中，jsx 会被转换成一个 `createElement()` 对象，标签名会变成第一个参数，如果不是组件，则会变成字符串，组件则变成组件名称，也就是一个变量。为什么不能写成 `components[props.storyType]` 这种表达式呢? 首先，首字母必须大写；其次，编译过程是不会做 js 代码执行，去计算结果的。

### 4.8 extend React.Component 与 React.PureComponent 有什么区别？

time: 2018.10.18

isFinish: `true`

都为 react 组件，区别就在于实现更新上，`shouldComponentUpdate` 上，做 **props 和 state 数据比较**。React.Component 会对传入的 props 和 state 做深层数据比较，判断是否更新组件，而 React.PureComponent 只会对数据做浅比较，只要数据第一层没有变化就不更新，所以它的速度会快许多。

同时，在继承 React.PureComponent 的组件中，其子组件不要有复杂的数据结构

****
