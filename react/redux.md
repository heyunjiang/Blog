## 主旨(约定)

1. 应用只有一个store，当应用变大的时候，store可以拆分
2. 单向数据流：getStore()->dispatch(action)->reducer->store

问题：redux是否适用于多页应用？

> 关键词：store、action、reducer、middleware

### action

js 对象

```javascript
{
  type: ADD_TODO,
  text: 'text'
}
```

关键词：`action`、`action创建函数`、`dispatch绑定的action创建函数`

#### 异步action处理

需要封装dispatch方法，当异步操作(通常ajax)结束的时候，再更新store

标准做法：使用中间件，通过redux-thunk或redux-saga实现

### reducer

```javascript
import { combineReducers } from 'redux'
import * as reducers from './reducers'

const todoApp = combineReducers(reducers)
```

reducer为纯函数，接收2个参数： `state`、`action`，这里的 `action` 就是上面的action对象，表示要修改的值

```javascript
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      })
    default:
      return state
  }
}
```

可以使用 `Object.assign`，也可以使用 `...` 运算符，比如

```javascript
return {
  ...state,
  ...action.payload,
}
```

### store

#### 构建store

`createStore`，redux直接提供

#### 5大方法

1. getState()
2. dispatch(action)
3. subscribe(listener)
4. getReducer()
5. replaceReducer(nextReducer)

> 注意: subscribe方法执行返回的结果是一个函数，这个函数是用于注销 subscribe 的

### 异步数据流

默认情况下，通过 `createStore()` 创建的store没有使用 `middleware`，只能支持同步数据流

> 为什么？难道不能自己写吗？中间件还不是封装起来的js，通过重新封装 `dispatch` 函数

### middleware

中间件，通过 `applyMiddleware()` 为redux应用中间件

### redux methods

这些方法都是顶级方法，可以通过 `import { createStore } from 'redux';` 方式直接引入

1. createStore(reducer, [initialState], enhancer)
2. combineReducers(reducers)
3. applyMiddleware(...middlewares)
4. bindActionCreators(actionCreators, dispatch)
5. compose(...functions)

> 注意：bindActionCreators是想对其应用的组件隐藏store和dispatch
> compose: 将包含的funcs从左到右依次嵌套执行 `funcs.reduce((a, b) => (...args) => a(b(...args)))`
> createStore 的 enhancer : 高阶函数，返回增强版 createStore

## 感想

redux的源码很短，就是提供的这几个api代码，直接可以方便阅读，更能理解它的api意思

对比react-redux来看，它们的源码都很简短，但是都很精炼

相比较react的源码来说，react的源码就太饶了