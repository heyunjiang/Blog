# react-router 应用

time: 2018.8.23

version: 4.0

heyunjiang

update: 2018.8.28

目录

[1 静态路由与动态路由](#1-静态路由与动态路由)  
&nbsp;&nbsp; [1.1 静态路由](#11-静态路由)  
&nbsp;&nbsp; [1.2 动态路由](#12-动态路由)  
[2 动态路由操作文档](#2-动态路由操作文档)  
&nbsp;&nbsp; [2.1 基础组件](#21-基础组件)  
&nbsp;&nbsp;&nbsp;&nbsp; [2.1.1 BrowserRouter、HashRouter 路由根节点](#211-browserrouterhashrouter-路由根节点)  
&nbsp;&nbsp;&nbsp;&nbsp; [2.1.2 Route、Switch 路由匹配](#212-routeswitch-路由匹配)  
&nbsp;&nbsp;&nbsp;&nbsp; [2.1.3 Link、NavLink、Redirect 导航](#213-linknavlinkredirect-导航)  
&nbsp;&nbsp; [2.2 使用 react-router 4](#22-使用-react-router-4)  
&nbsp;&nbsp; [2.3 按需加载](#23-按需加载)  
&nbsp;&nbsp; [2.4 history](#24-history)  
[3 参考文档](#3-参考文档)  

## 1 静态路由与动态路由

静态路由：在任何渲染发生之前，就将预定义的路由声明为应用初始化的一部分。

动态路由：在应用程序渲染时发生的路由，即在应用程序工作过程中，根据不同的条件生成不同的路由。

### 1.1 静态路由

在 react-router 4 之前，设计的都是属于静态路由，因为都是在应用程序渲染之前就将路由声明成了应用初始化的一部分，后期没有动态生成路由或者路由调整

```javascript
// 例1: 友云设 1.0 版本的静态路由声明
const Routers = function ({ history, app }) {
  const routes = [
    {
      path: config.routerPath,
      component: App,
      getIndexRoute (nextState, cb) {
        require.ensure([], (require) => {
          registerModel(app, require('./models/myWorkSpace'))
          cb(null, {component: require('./routes/myWorkSpace/')})
        }, 'myWorkSpace')
      },
      childRoutes: [
        {
          path: 'docList',
          getComponent (nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/docList'))
              cb(null, require('./routes/docList/'))
            }, 'docList')
          },
        }, {
          path: '*',
          getComponent (nextState, cb) {
            require.ensure([], (require) => {
              cb(null, require('routes/error/'))
            }, 'error')
          },
        },
      ],
    },
  ]

  return <Router history={history} routes={routes} />
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers
```

问题：曾经做裕承保险项目的时候，路由是从服务器返回的，这个是属于静态路由吗？

答：这个是属于静态路由的。虽然是从服务器返回的路由配置，曾经一度以为这就是动态路由，根据登录用户具备的权限不同，返回不同的路由配置。其实这就是静态路由，在它主要应用渲染之前，它就设置好了，作为初始化声明的一部分

### 1.2 动态路由

在 react-router 4 开始出现动态路由，它和静态路由最主要的区别是：动态路由作为组件存在于组件、模块中，在程序使用过程中产生的路由，不是在运行应用程序之外的配置或约定中发生的路由。

```javascript
// 例2: 动态路由例子
const App = () => (
  <div>
    <nav>
      <Link to="/dashboard">Dashboard</Link>
    </nav>
    <div>
      <Route path="/dashboard" component={Dashboard} />
    </div>
  </div>
);
```

例2解释：Route 作为组件写在 App 组件中，只有当点击 `Dashboard` 这个链接，才会触发路由渲染，否则不会渲染，展示为 null。

## 2 动态路由操作文档

### 2.1 基础组件

在 react-router 4 种文档有明确说明，所有的组件都应该从 `react-router-dom` 中引入

#### 2.1.1 BrowserRouter、HashRouter 路由根节点

router组件，每个应用只能有一个 router 组件，作为路由根节点。

`BrowserRouter`：使用 html5 历史 API 记录 `Router` 使 UI 和 URL 保持同步。这个使用有个问题，在 spa 应用中，跳转到非首页时，浏览器刷新会获取不到页面，除非服务器做配置。

`HashRouter`：使用 URL 的 hash 部分使 UI 和 URL 保持同步。

这2个路由都会创建一个专门的 `history` 对象

BrowserRouter、HashRouter 都是实现的 Router 底层接口，使用 Router 的情况一般是用于和 redux 定制的 history 保持同步

```javascript
import { Router } from 'react-router'
import createBrowserHistory from 'history/createBrowserHistory'

const history = createBrowserHistory()

<Router history={history}>
  <App/>
</Router>
```

2者区别: `BrowserRouter` 适用于现代浏览器，使用 html5 history api，能记录支持 location.key 和 location.state，而 `HashRouter` 主要用于支持传统浏览器，不能记录 location.key 或 location.state

问题：我在设计云第一个版本中大量使用到了下面这种语法，我使用 HashRouter 是不是就不行呢？结合 connect-react-router 来看

```javascript
dispatch(routerRedux.push({pathname: '/docList',
  state: {
    filterListStatus: rest,
    from: 'myWorkSpace'
  },
}));
```

#### 2.1.2 Route、Switch 路由匹配

路由匹配组件， `Route` 通过匹配 `path` 属性和当前地址的 `pathname` 来实现

1. 当匹配成功，则渲染对应 `component` 属性组件
2. 匹配不成功则渲染 null
3. 没有指定 path 属性则默认匹配

Switch组件，用于将 Route 组件分组

```javascript
<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/about" component={About} />
  <Route path="/contact" component={Contact} />
  {/* when none of the above match, <NoMatch> will be rendered */}
  <Route component={NoMatch} />
</Switch>
```

Switch 会遍历其所有的 Route 元素，仅渲染与当前地址匹配的第一个元素，可以指定一个 404 组件，用于无匹配展示

#### 2.1.3 Link、NavLink、Redirect 导航

location 跳转，都是根据 `to` 属性跳转

Link: 会被渲染成 `<a>`

NavLink: 特殊类型的 Link，当它的 to 属性与当前地址匹配时，会将 NavLink 的属性渲染到 a 上面

```javascript
// location = { pathname: '/react' }
<NavLink to="/react" activeClassName="hurray">
  React
</NavLink>
// <a href='/react' className='hurray'>React</a>
```

Redirect: 重定向

### 2.2 使用 react-router 4

基本支持 `npm install react-router-dom`

`react-router-dom` 中包含了基本组件 `BrowserRouter`、`HashRouter`、`Route`、`Switch`、`Link`、`NavLink`、`Redirect` 等

```javascript
import React from  'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
```

问：react-router 与 react-router-dom 有什么区别？

答：react-router 属于最基础的接口，实现了路由的基本功能；react-router-dom 在此基础上封装成路由组件，提供了 BrowserRouter、HashRouter 等组件，用于在浏览器运行环境。使用时，只需要引入 react-router-dom 就行

问：如果我使用了 redux ，该怎么传递 history 对象呢？

答：使用 `connected-react-router` 包，下面介绍 history 对象时会介绍到

### 2.3 按需加载

首次加载不用加载所有的应用程序代码，可以做 code splitting ，中文名代码拆分，也叫做增量下载。

需要使用到的 npm 包有： `babel-plugin-syntax-dynamic-import` 、 `react-loadable`

**babel-plugin-syntax-dynamic-import** : babel 插件，用于让 babel 识别这个语法，不做任何额外的转换，搭配 `react-loadable` 使用

**react-loadable**: 高阶组件，用于动态导入 `import()` 方法，处理各种边缘情况，并且使代码拆分变得简单

```javascript
import Loadable from 'react-loadable'
const About = Loadable({
  loader: () => import('./component'),
  loading: () => (
    <div>
      <h2>About</h2>
    </div>
  )
})
```

loading 参数，是指在加载过程中占位元素

问题：如果使用 `BrowserRouter` ,非主页刷新页面提示 `Cannot GET /about`，是否需要设置 history ?采用 `HashRouter` 就没有问题

回答：BrowserRouter，如果直接访问 `http://localhost:9000/about` ，服务器并不能直接返回 index.html， 这个需要服务器设置，就可以解决问题。如果服务器开发人员不配合，自己又不会改，那就换 `HashRouter` 吧。

### 2.4 history

history 对象，用于实现对 `session 历史` 的管理。以往内置于 react-router 中，现在单独列出，作为 react-router 4 的2大依赖之一(react + history)。

在将 redux 和 react-router 结合使用的时候，就需要 history 对象支持

目前用法

```javascript
// in router
import { Router } from 'react-router'
import createBrowserHistory from 'history/createBrowserHistory'

const history = createBrowserHistory()

<Router history={history}>
  <App/>
</Router>
```

```javascript
// in redux
subscriptions: {
  enterDocList ({ dispatch, history }) {
    history.listen((location) => {})
  },
},
```

因为使用 redux 时，要求有 history 对象传入，该怎么结合 react-router-dom 和 redux 呢？

## 2.5 使用 connected-react-router

该库主要是结合 redux 和 react-router，让操作 history 的时候，能同步更新到 state

使用例子

```javascript
// 结合 redux : 构建 history 对象与 store 对象
import { createBrowserHistory } from 'history'
import { applyMiddleware, compose, createStore } from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
...
const history = createBrowserHistory()

const store = createStore(
  connectRouter(history)(rootReducer), // new root reducer with router state
  initialState,
  compose(
    applyMiddleware(
      routerMiddleware(history), // for dispatching history actions
      // ... other middlewares ...
    ),
  ),
)
```

```javascript
// 结合 react-redux 的 `Provider` 传入 store 对象，结合 `ConnectedRouter` 传入 history 对象，将 redux 、 history、react-router 结合起来了
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router' // react-router v4
import { ConnectedRouter } from 'connected-react-router'
...
ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}> { /* place ConnectedRouter under Provider */ }
      <div> { /* your usual react-router v4 routing */ }
        <Switch>
          <Route exact path="/" render={() => (<div>Match</div>)} />
          <Route render={() => (<div>Miss</div>)} />
        </Switch>
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('react-root')
)
```

更新原理: store.dispatch(push('/path/to/somewhere'))

```javascript
// connected-react-router action.js 部分源码
const updateLocation = (method) => {
  return (...args) => ({
    type: CALL_HISTORY_METHOD,
    payload: {
      method,
      args
    }
  })
}

export const push = updateLocation('push')
export const replace = updateLocation('replace')
export const go = updateLocation('go')
export const goBack = updateLocation('goBack')
export const goForward = updateLocation('goForward')

export const routerActions = { push, replace, go, goBack, goForward }
```

源码解释，它触发了自己作为中间件的方法：dispatch 的 action.type = CALL_HISTORY_METHOD，这里会更新 history 的 state 数据，不会更新 redux 应用的基本数据

## 3 参考文档

[react-router 4](https://react-router.docschina.org/)

[redux源码解读](./源码解读-redux.md)
