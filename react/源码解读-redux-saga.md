# redux-saga 源码阅读

time: 2018.9.30

update: 2018.10.11

heyunjiang

目录

[1 为什么要阅读 saga 源码](#1-为什么要阅读-saga-源码)  
[2 源码分析之前](#2-源码分析之前)  
&nbsp;&nbsp;[2.1 redux.applyMiddleware 入口分析](#2.1-redux.applyMiddleware-入口分析)  
&nbsp;&nbsp;[2.2 回顾我项目中应用到的 redux-saga 特点](#2.2-回顾我项目中应用到的-redux-saga-特点)  
[3 熟悉redux-saga](#3-熟悉redux-saga)  
&nbsp;&nbsp;[3.1 阅读前的问题](#3.1-阅读前的问题)  
&nbsp;&nbsp;[3.2 基本 api 熟悉](#3.2-基本-api-熟悉)  
[4 源码分析](#4-源码分析)

## 1 为什么要阅读 saga 源码

1. 名气大，然后我自己项目中也用到了，只是按照它的 api 应用，不了解其内部实现原理
2. 学习 redux.applyMiddleware 时，不清楚为什么要这么写，结合 saga 一起学习
3. 补充 es6 generator 实践能力

## 2 源码分析之前

该节先了解一下 redux 的 middleware 原理

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
3. **传入 dispatch ，返回新的 dispatch** ，相当于对真实的 dispatch 做了一层拦截
4. middleware 只管 state 、dispatch ，不会去管 reducer 是什么
5. middleware 生命周期： createMiddleware() -> getState() -> proxyDispatch()

### 2.2 回顾我项目中应用到的 redux-saga 特点

通过 2.1 我们明白了 middleware 要实现什么功能，这里我们通过实例看看 redux-saga 执行了什么操作

原生 redux 更新 state: `dispatch({type: 'reducerA', payload: {hello: 'shit'}})` ，这里直接调用的就是 store.dispatch ，dispatch 直接操作的就是 reducer

redux-saga 更新 state: `dispatch({ type: 'initDataFromState', payload: location.state })` ，这个调用的是由 applyMiddleware 新建的 dispatch ，dispatch 直接操作的只是创建的 effects ，这个 effects 也叫做副作用，然后再在 effects 内部通过 saga 提供的 put, call 之类的调用 reducer 或其他 effects

所以在 saga 修改了 dispatch ，让我们不能直接操作 reducer ，而是通过操作 effects ，在 effects 内部操作 reducer 更新 state。所以 saga 定义了 effects 的一系列写法规则，我要学习的也就是 effects 的规则

## 3 熟悉redux-saga

### 3.1 阅读前的问题

1. 是不是强制使用 generator ，能用 asynv/await 吗？
2. effect 的参数顺序及名称如何定义的，分别有什么作用？
3. 我定义好的 generator 是如何被 saga 互相调用的？
4. dva为什么要选用 saga， saga 有什么好处？
5. yield 语句后面为什么要一个纯对象？
6. fork 后台执行原理是什么？
7. 如何同时执行多个任务？

> 结合 dva，看看它内部是如何结合 saga 的

### 3.2 基本 api 熟悉

time: 2018.10.10

在阅读源码之前，必须要先会用 redux-saga ，然后带着使用的问题去阅读源码，所以目前是不会去看过多的源码，只是去熟悉使用 saga

```javascript
// sagas 样例
import createSagaMiddleware from 'redux-saga'
import { call, put, takeEvery } from 'redux-saga/effects'

function* hello() {
  yield call(query)
  yield put({type: 'world'})
}

export default function* all() {
  yield takeEvery('FETCH_USERS', hello)
}
```

redux-saga **功能概括**

1. createSagaMiddleware()：创建 sagaMiddleware
2. sagaMiddleware.run(): 运行 sagas
3. sagaEffects: put, call, apply, select, cps, take, cancel, fork, spawn, race, all
4. sagaEffectsHelper: takeEvery, takeLatest, throttle

****

特点

1. sagas 为 generator 函数
2. yield 后面为纯对象，称为 effect，该对象用于给 middleware 解释执行

****

> 解决问题1：是不是强制使用 generator ，能用 asynv/await 吗？  
> 答：只能使用 generator ，sagaMiddleware 只能识别 generator ，然后解释执行内部状态语句  

****

> 解决问题2：effect 的参数顺序及名称如何定义的，分别有什么作用？  
> 答：是在 dva 的 `getWatcher` 方法中，通过 `yield effect(...args.concat(createEffects(model)));` 方式，为每个我在 model 中创建的 effect 传入参数，第一个参数就为 args ，第二个参数为 sagaEffects。sagaEffects 的作用，就是将传入的函数封装成一个 `纯对象`，交由 middleware 执行。  
> `call/apply`：调用异步执行函数。类似于 Funtion.prototype.call，Funtion.prototype.apply  
> `put`: 用于创建 dispatch 调用的纯对象，调用另一个 effect  
> `select`: 获取 state  
> `cps`: 调用异步执行函数。同 call/apply 区别是，它适用于 node 风格函数处理  
> `takeEvery/takeLatest`: 监听 action，只要触发则执行，不能停止  
> `throttle`: 监听 action，只要触发则执行，节流，必须在多少 ms 之后才能继续监听  
> `take`: 监听 action,只触发执行一次，然后停止  
> `cancel`: 取消由 fork 生成的任务  
> `fork`: fork 一个任务，任务在后台启动，不阻塞任务执行。与 call/apply 不同，call 会阻塞下一步执行，知道异步调用执行完毕，然后才能执行下一步。会阻塞父级 generator 的完成  
> `spawn`: 同 fork 一样，启动一个任务后台启动执行，不阻塞任务执行。但是它不会影响父级 generator 任务的完成  
> `race/all`: 类似于 promise 的 race/all

****

> 解决问题3：我定义好的 generator 是如何被 saga 互相调用的？  
> 答：定义好的 generator ，也就是 saga 函数，会被 dva/core 生成一个 watcher/worker 。当触发 action 的时候，saga 会被 middleware 解析执行。解析过程看源码解析

****

> 解决问题4：dva为什么要选用 saga， saga 有什么好处？  
> 答：redux-saga 作为 redux 的中间件，用于重写 dispatch ，所以在直接更新 state 之前，可以进行一系列的同步、异步操作。saga 的最终目的是修改 state ，所以将其从应用程序逻辑中抽离出来，将异步获取数据、操作浏览器缓存等工作独立出来，减小组件体积，让组件更纯净。  
dva 选择 redux-saga，它只是将 redux、react、react-redux、redux-saga、react-router、connect-react-router 封装起来了，让应用的开发更简单，维护更简单。

****

> 解决问题5：yield 语句后面为什么要一个纯对象？  
> 答：直接 yield 语句后面写 `yield query;` ，middleware 在调用 generator 时，执行到该 yield 语句，query 会立即执行；如果写成 `yield call(query)`，生成的纯对象，query 只会被生成描述语句，不会被立即执行，而是通过 middleware 解析这个纯对象进行执行。  
> 问：middleware 解析这个纯对象执行相比于直接执行有什么好处？  
> 答：方便测试；可以更好的控制 promise 执行状态变化时恢复 generator 执行。

****

> 解决问题7：如何同时执行多个任务？  
> 答：`dispatch 与 put 的执行`：前面做 dva 开发的时候，对于某一个操作，需要同时操作多个 effect 的时候，都是连续写2个 dispatch，心里一直有个疑问，第一个会不会阻塞第二个的调用。在组件里面 dispatch 调用 effect 时，effect 会通过 saga.fork 在后台执行，不阻塞下一个 dispatch 的触发。put 的本质还是触发的 dispatch。  
`call 的执行`：call 跟 put 不同，不是操作 dispatch ，它是让 middleware 执行 后面的异步操作， call 的返回值是后面异步操作的结果，后面还要处理返回值，所以 call 需要的是同步操作。如果需要同时处理多个 call 请求，可以通过 `const [fetchs, gets] = yield [call(fetch), call(get)]` 方式实现

****

### 3.3 takeEvery, takeLatest 源码

takeEvery, takeLatest 是通过 take 实现的

```javascript
// takeEvery 源码
const takeEvery = (pattern, saga, ...args) => fork(function*() {
  while (true) {
    const action = yield take(pattern)
    yield fork(saga, ...args.concat(action))
  }
})
```

```javascript
// takeLatest 源码
const takeLatest = (pattern, saga, ...args) => fork(function*() {
  let lastTask
  while (true) {
    const action = yield take(pattern)
    if (lastTask) {
      yield cancel(lastTask) // 如果任务已经结束，则 cancel 为空操作
    }
    lastTask = yield fork(saga, ...args.concat(action))
  }
})
```

### 3.4 watcher/worker 思想

takeEvery & fork

每一个 effect 都采用 takeEvery 创建一个 watcher ，然后采用 fork 来后台执行这个任务，不阻塞其他任务

```javascript
// watcher
function* getWatcher(comman, effect) {
  return function* () {
    yield takeEvery(comman, effect)
  }
}
//worker
function* worker() {
  const watcher = yield getWatcher('comman', effect)
  const worker = yield fork(watcher)
  yield fork(function* (){
    yield take('cancelcomman')
    yield cancel(worker)
  })
}
```

## 4 源码分析

### 4.1 fork 的实现原理是什么？

time: 2018.10.11

fork 能够让 effect 在后台执行，不阻塞其他 effect 的执行。effect 内部通常是做异步操作，获取数据，更新 state 数据。

```javascript
//src/internal/io.js fork 源码

import * as effectTypes from './effectTypes'
import { IO, SELF_CANCELLATION } from '@redux-saga/symbols'

const makeEffect = (type, payload) => ({ [IO]: true, type, payload })

export function fork(fnDescriptor, ...args) {
  // effectTypes.FORK === 'FORK'
  return makeEffect(effectTypes.FORK, getFnCallDescriptor(fnDescriptor, args))
}

// fnDescriptor 为封装好的 watcher 函数， watcher 包含了待监听的命令和待执行的 effect generator 函数
function getFnCallDescriptor(fnDescriptor, args) {
  return { null, fnDescriptor, args }
}
```

第一步：fork 执行返回的是一个对象 `{ [IO]: true, type, payload }` ，payload里面包含了 watcher 函数

接下来需要看看 middleware 是如何解析这种命令了

### 4.2 middleware 是如何解析 saga effect 执行的？

现在的任务很简单，就是解释这个过程

```javascript
import createSagaMiddleware from 'redux-saga'
import { takeEvery, put, fork, call } from 'redux-saga/effects'

const sagaMiddleware = createSagaMiddleware()
const store = createStore(reducers, {}, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(function* (){
  yield fork(function* () {
    yield takeEvery('show', effect)
  })
})

function* effect() {
  yield put({type: 'reducerA'})
}
```

在使用过程中，有2个疑问，

1. middleware 是如何解析执行 generator 函数的？
2. 它通过 put, call, fork 生成的纯对象是如何被解析执行的？

带着这2个疑问，看看源码

> 同时学习一下 generator 的解析执行过程

#### 4.2.1 createSagaMiddleware 功能解析


