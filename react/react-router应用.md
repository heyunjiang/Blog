# react-router 应用

time: 2018.8.23

version: 4.0

heyunjiang

update: 2018.8.24

目录

[1 静态路由与动态路由](#1-静态路由与动态路由)  
&nbsp;&nbsp; [1.1 静态路由](#11-静态路由)  
&nbsp;&nbsp; [1.2 动态路由](#12-动态路由)  
[2 动态路由操作文档](#2-动态路由操作文档)

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

#### 2.1.1 BrowserRouter、HashRouter 路由根节点

router组件，每个应用只能有一个 router 组件，作为路由根节点。

`BrowserRouter`：动态网站

`HashRouter`：静态网站

这2个路由都会创建一个专门的 `history` 对象

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

## 参考文档

[react-router 4](https://react-router.docschina.org/)
