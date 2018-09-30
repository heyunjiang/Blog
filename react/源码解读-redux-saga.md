# redux-saga 源码阅读

time: 2018.9.30

heyunjiang

目录

[1 为什么要阅读 saga 源码](#1-为什么要阅读-saga-源码)  
[2 源码分析之前](#2-源码分析之前)  
&nbsp;&nbsp;[2.1 redux.applyMiddleware 入口分析](#2.1-redux.applyMiddleware-入口分析)  
&nbsp;&nbsp;[2.2 回顾我项目中应用到的 redux-saga 特点](#2.2-回顾我项目中应用到的-redux-saga-特点)  
[3 源码分析](#3-源码分析)

## 1 为什么要阅读 saga 源码

1. 名气大，然后我自己项目中也用到了，只是按照它的 api 应用，不了解其内部实现原理
2. 学习 redux.applyMiddleware 时，不清楚为什么要这么写，结合 saga 一起学习
3. 补充 es6 generator 实践能力

## 2 源码分析之前

### 2.1 redux.applyMiddleware 入口分析

redux-saga 作为 redux 中间件，在执行 `createStore(reducer, state, enhancer)` 时，由 `redux.applyMiddleware(saga.createSagaMiddleware())` 传入参数，先看看 applyMiddleware 执行了什么操作

```javascript
// redux.applyMiddleware
import compose from './compose'

export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```

分析：

1. applyMiddleware 要求传入 middleware，不限个数。
2. 函数执行结果返回一个函数，返回的函数要求传入 createStore，这在 redux.createStore 中就已经声明: `enhancer(createStore)(reducer, initState)`。
3. 经过第二步 applyMiddleware 执行返回一个函数，然后这个函数作为 createStore 的第三个参数 enhancer，这个函数是一个高阶函数，该高阶函数执行传入 createStore ，然后返回一个函数，在返回的函数中才执行具体的操作，例如构建 store，返回 dispatch

在 applyMiddleware 中，可以看出返回的 dispatch 不是redux默认创建的 dispatch 了，而是在加入了 middleware 之后，由众多的 middleware 链式调用 + redux 默认创建的 dispatch 一起构成

****

看看 compose 是如何调用的，这里可以看出 middleware 中返回的一些细节

```javascript
// compose
export default function compose(...funcs) {
  if (funcs.length === 0) { return arg => arg }
  if (funcs.length === 1) { return funcs[0] }
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

可以看出，compose 是一个 `高阶函数` ，它返回的是一个函数

如果只有一个 middleware， compose 返回的结果是 middleware 本身；如果有多个 middleware，则返回middleware 的链式调用，`() => a(b(c(d())))`，所有 middleware 都不会执行，返回的是一个函数，返回的这个函数需要传入参数，执行的结果最终依赖于传入的参数

****

所以 applyMiddleware 的 `dispatch = compose(...chain)(store.dispatch)` ，此处构建真正的 dispatch ，内部传入的 middleware 要求能够调用传给他的另一个 middleware 的执行结果

****

middleware 特点

1. 触发dispatch顺序：以 middlewares 传入的倒序。applyMiddleware 传入为正序，构建 dispatch 时调用为middleware 为反序，触发 dispatch 时为正序
2. middleware 要求具有能够调用传给他的另一个 middleware 的执行结果
3. 传入 dispatch ，传出新的 dispatch ，相当于对真实的 dispatch 做了一层拦截
4. middleware 只管 state 、dispatch ，不会去管 reducer 是什么
5. middleware 生命周期： createMiddleware() -> getState() -> proxyDispatch()

### 2.2 回顾我项目中应用到的 redux-saga 特点

通过 2.1 我们明白了 middleware 要实现什么功能，这里我们通过实例看看 redux-saga 执行了什么操作

原生 redux 更新 state: `dispatch({type: 'reducerA', payload: {hello: 'shit'}})` ，这里直接调用的就是 store.dispatch ，dispatch 直接操作的就是 reducer

redux-saga 更新 state: `dispatch({ type: 'initDataFromState', payload: location.state })` ，这个调用的是由 applyMiddleware 新建的 dispatch ，dispatch 直接操作的只是创建的 effects ，这个 effects 也叫做副作用，然后再在 effects 内部通过 saga 提供的 put, call 之类的调用 reducer 或其他 effects

所以在 saga 修改了 dispatch ，让我们不能直接操作 reducer ，而是通过操作 effects ，在 effects 内部操作 reducer 更新 state。所以 saga 定义了 effects 的一系列写法规则，我要学习的也就是 effects 的规则

## 3 源码分析

### 3.1 阅读前的问题

1. 是不是强制使用 generator ，能用 asynv/await 吗？
2. effect 的参数顺序及名称如何定义的？

### 3.2 saga 架构
