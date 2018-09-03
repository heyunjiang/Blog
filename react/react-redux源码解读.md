# react-redux

time: 2018.8.30  
designer: heyunjiang  
version: react-redux 5.0.7  
update: 2018.9.03

[github地址](https://github.com/reactjs/react-redux/blob/master/docs/api.md#api)

react-redux 是 `redux` 的 `react` 版本实现

概览：react-redux 提供2个接口，一个是 `Provider` 组件，用于创建根组件，传入 `store` 作为 props；另一个是 `connect` 方法， Provider 子孙组件通过 connect 方法可以获取到 Provider 根组件上的 store，是通过 react 提供的 `context` 对象实现的。

目录

[1 为什么要阅读源码](#1-为什么要阅读源码)  
[2 api](#2-api)  
[3 源码解读](#3-源码解读)

## 1 为什么要阅读源码

问：我为什么要用 react-redux 呢？

答：redux 本身不是针对哪个框架实现的，它是一种通用的状态管理库。而 react-redux 是针对 react 实现的状态管理库

**设计思想**: react-redux 的设计思想，要求 `容器组件和展示组件相分离` 。容器组件使用 connect 方法获取 store 上的数据，然后内部展示组件通过 props 从容器组件获取数据

阅读源码前带2个问题

1. react-redux 是怎么将与框架无关的 redux 与 react 连接起来的？
2. connect 方法是怎么获取到 store 中的数据的？

## 2 api

provider和connect

### 2.1 Provider

Provider.props:

1. store(redux store): 应用的store(每个应用保持单一store原则)
2. children：应用root组件

```jsx
ReactDOM.render(
  <Provider store={store}>
    <MyRootComponent />
  </Provider>,
  rootEl
)
```

```js
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="foo" component={Foo}/>
        <Route path="bar" component={Bar}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
)
```

### 2.2 connect方法

由react-redux提供的connect方法，让我们能方便操作store、props、dispatch等

参数：

`connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])`

`mapStateToProps`：获取store中的state

`mapDispatchToProps`: 获取redux中的dispatch方法，如果不设置此参数，默认在组件中插入 `dispatch` 方法

> connectAdvanced: connect基于此方法构建而来
> createProvider： 构建一个新的provider

## 3 源码解读

### 3.1 导出 4 个接口

```javascript
// index.js
import Provider, { createProvider } from './components/Provider'
import connectAdvanced from './components/connectAdvanced'
import connect from './connect/connect'

export { Provider, createProvider, connectAdvanced, connect }
```

### 3.2 Provider 源码解读

容器组件通过 connect 方法获取 store 上面的数据，展示组件通过 props 从容器组件获取数据。猜想 connect 方法也是通过传入 props 给容器组件的

重点学习 connect 的使用格式

首先看看如何应用的

```javascript
// Provider 应用
<Provider store={store}>
  <App />
</Provider>

// connect 应用
export default connect(({ myWorkSpace, loading }) => ({ myWorkSpace, loading }))(myWorkSpace)
```

**Provider 看源码之前的问题**：

1. 传入 store 之后，它对 store 做了什么处理？
2. 它是怎么将 redux 和 react 结合起来的

```javascript
// Provider
import { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { storeShape, subscriptionShape } from '../utils/PropTypes'

export function createProvider(storeKey = 'store', subKey) {
    const subscriptionKey = subKey || `${storeKey}Subscription`

    class Provider extends Component {
        getChildContext() {
          return { [storeKey]: this[storeKey], [subscriptionKey]: null }
        }

        constructor(props, context) {
          super(props, context)
          this[storeKey] = props.store;
        }

        render() {
          // 限制一个孩子
          return Children.only(this.props.children)
        }
    }

    if (process.env.NODE_ENV !== 'production') {
      Provider.prototype.componentWillReceiveProps = function (nextProps) {
        if (this[storeKey] !== nextProps.store) {
          warnAboutReceivingStore()
        }
      }
    }

    Provider.propTypes = {
        store: storeShape.isRequired,
        children: PropTypes.element.isRequired,
    }
    Provider.childContextTypes = {
        [storeKey]: storeShape.isRequired,
        [subscriptionKey]: subscriptionShape,
    }

    return Provider
}

export default createProvider()
```

回答读源码的问题：Provider 使用了 React.Component 创建了一个组件，该组件的 state 数据 `this[storeKey] = props.store` ，就保存了我们传入的 store 。这个 store 会通过 connect 方法被后代获取到。

### 3.2.2 connect 源码解读

阅读源码之前的问题：容器组件是通过 connect 方法获取到 store 中的数据，connect 是否采用 props 方式注入容器组件的呢？

```javascript
// react-redux connect 源码
import connectAdvanced from '../components/connectAdvanced'
import shallowEqual from '../utils/shallowEqual'
import defaultMapDispatchToPropsFactories from './mapDispatchToProps'
import defaultMapStateToPropsFactories from './mapStateToProps'
import defaultMergePropsFactories from './mergeProps'
import defaultSelectorFactory from './selectorFactory'

function match(arg, factories, name) {
  for (let i = factories.length - 1; i >= 0; i--) {
    const result = factories[i](arg)
    if (result) return result
  }

  return (dispatch, options) => {
    throw new Error(`Invalid value of type ${typeof arg} for ${name} argument when connecting component ${options.wrappedComponentName}.`)
  }
}

function strictEqual(a, b) { return a === b }

export function createConnect({
  connectHOC = connectAdvanced,
  mapStateToPropsFactories = defaultMapStateToPropsFactories,
  mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
  mergePropsFactories = defaultMergePropsFactories,
  selectorFactory = defaultSelectorFactory
} = {}) {
  return function connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    {
      pure = true,
      areStatesEqual = strictEqual,
      areOwnPropsEqual = shallowEqual,
      areStatePropsEqual = shallowEqual,
      areMergedPropsEqual = shallowEqual,
      ...extraOptions
    } = {}
  ) {
    const initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps')
    const initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps')
    const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps')

    return connectHOC(selectorFactory, {
      methodName: 'connect',

      getDisplayName: name => `Connect(${name})`,

      shouldHandleStateChanges: Boolean(mapStateToProps),

      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      pure,
      areStatesEqual,
      areOwnPropsEqual,
      areStatePropsEqual,
      areMergedPropsEqual,

      ...extraOptions
    })
  }
}

export default createConnect()
```

初步可以看出，`connect` 需要传入的3个参数 `mapStateToProps`, `mapDispatchToProps`, `mergeProps`

要求传入的 mapStateToProps、mapDispatchToProps 类型为 `function` 

然后返回的高阶函数 connect ，它的目标是获取 initMapStateToProps ，这个是一个函数，执行返回的一个对象，暂时不去深入看

然后这个 connect 执行返回的也是一个高阶函数 connectHOC 的执行结果，大致看看这个 connectHOC 高阶函数

```javascript
// connectAdvanced.js 部分源码
export default function connectAdvanced() {
  return function wrapWithConnect(WrappedComponent) {
    class Connect extends Component {
      constructor(props, context) {
        super(props, context)

        this.version = version
        this.state = {}
        this.renderCount = 0
        this.store = props[storeKey] || context[storeKey]
        this.propsMode = Boolean(props[storeKey])
        this.setWrappedInstance = this.setWrappedInstance.bind(this)
      }
    }
    return hoistStatics(Connect, WrappedComponent)
  }
}
```

hoistStatics 的目的是为了将 WrappedComponent 的一些属性复制给 Connect ，这里重点就是 context 属性对象，react 的每个组件都可以通过 context 全局对象访问 store。

****

回答阅读源码之前的问题：容器组件是通过 connect 方法获取到 store 中的数据，connect 是否采用 props 方式注入容器组件的呢？

答：注入组件中的数据，肯定是通过 props 传入的，但是这个数据怎么来？通过 connect 方式获取的数据，是通过 react 组件能够访问的 `context` 对象来的。一般组件不直接访问 context 对象，但是 react-redux 就通过这个对象，传递数据给了我们 connect 的组件，它保证了我们不直接接触该对象，只有 react-redux 接触该对象。
