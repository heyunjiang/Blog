# react-router 4 源码阅读

time: 2018.9.30

update: 2018.10.08

在阅读 redux-saga 源码的时候，学习了 redux 的 applyMiddleware 原理，知道了一个 middleware 是通过拦截 dispatch 更新 state，创建一个新的 dispatch

目录

[1 阅读源码前的问题](#1-阅读源码前的问题)  
[2 源码阅读](#2-源码阅读)  
[3 总结](#3-总结)

## 1 阅读源码前的问题

1. 根据 url 变化，控制模块显示
2. react-router 4 还实现了其他什么功能

## 2 源码阅读

### 2.1 基本架构

就一条直线，通过 index.js 导出模块

包含的模块有：

1. BrowserRouter
2. HashRouter
3. MemoryRouter
4. Link(与 antd 的 Link 不同)
5. NavLink
6. Prompt
7. Redirect
8. Route
9. Router
10. StaticRouter
11. Switch
12. generatePath
13. matchPath
14. withRouter

学习顺序：Router -> history -> HashRouter -> BrowserRouter

### 2.2 Router 使用示例

```javascript
import React from  'react'
import { HashRouter, Route, Link } from 'react-router-dom'
import Loadable from 'react-loadable'
import { createBrowserHistory } from 'history'

const history = createBrowserHistory()

const Home = () => ( <div><h2>Home</h2></div> )

const About = Loadable({
  loader: () => import('./component'),
  loading: () => ( <div><h2>About</h2></div> )
})
const BasicExample = () => (
  <HashRouter>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      <Route exact path="/" component={Home}/>
      <Route path="/about" component={About}/>
    </div>
  </HashRouter>
)
export default BasicExample
```

### 2.3 HashRouter 源码分析

```javascript
import React from "react";
import PropTypes from "prop-types";
import { createHashHistory as createHistory } from "history";
import warning from "warning";

import Router from "./Router";

class HashRouter extends React.Component {
  history = createHistory(this.props);

  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}
export default HashRouter
```

同样，BrowserRouter 也只是在内部使用 `import { createBrowserHistory as createHistory } from "history"`。这也解释了在 `connected-react-router` 中没有直接使用 HashRouter

### 2.4 Router 源码分析

在 Router 组件的使用中，它接受2个 prop ： `history` + `children` 。

**问**：通常只需搭配 Router + Route 即可使用 react-router 了，分别实现了什么功能？

```javascript
// Router 源码
import React from "react";
import PropTypes from "prop-types";
import warning from "warning";

import RouterContext from "./RouterContext";
import warnAboutGettingProperty from "./utils/warnAboutGettingProperty";

function getContext(props, state) {
  return {
    history: props.history,
    location: state.location,
    match: Router.computeRootMatch(state.location.pathname),
    staticContext: props.staticContext
  };
}

/**
 * The public API for putting history on context.
 */
 class Router extends React.Component {
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }

  // TODO: Remove this
  static childContextTypes = {
    router: PropTypes.object.isRequired
  };

  // TODO: Remove this
  getChildContext() {
    const context = getContext(this.props, this.state);
    return { router: context };
  }

  constructor(props) {
    super(props);

    this.state = {
      location: props.history.location
    };

    this.unlisten = props.history.listen(location => {
      this.setState({ location });
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    const context = getContext(this.props, this.state);

    return (
      <RouterContext.Provider
        children={this.props.children || null}
        value={context}
      />
    );
  }
}

export default Router;
```

通过代码 + 注释，可以看出 Router 实现的主要功能是挂载 history 对象到 context 这个环境上。传递了一个对象给 RouterContext.Provider 组件

```javascript
// RouterContext.Provider 源码
import createContext from "create-react-context";

const context = createContext();

context.Provider.displayName = "Router.Provider";
context.Consumer.displayName = "Router.Consumer";

export default context;
```

它使用的是 `create-react-context` 组件。它只是作为 `React.createContext` 的 `ponyfills`，如果使用的 react 版本小于16

### 2.5 Route 源码分析

上面看到 Router 是将 history 对象挂载到了全局 context 对象上，所以我们在任何后代组件中都可以通过 connect 方式获取到 context 对象上的 history 数据

```javascript
export default connect(state => ({
  app: state.app,
  loading: state.loading,
  location: state.router.location
}))(App)
```

看看 Route 组件传入了什么：component, exact, path 等

```javascript
// Route 源码
import React from "react";
import PropTypes from "prop-types";
import invariant from "invariant";
import warning from "warning";

import RouterContext from "./RouterContext";
import matchPath from "./matchPath";
import warnAboutGettingProperty from "./utils/warnAboutGettingProperty";

function isEmptyChildren(children) {
  return React.Children.count(children) === 0;
}

function getContext(props, context) {
  const location = props.location || context.location;
  const match = props.computedMatch
    ? props.computedMatch // <Switch> already computed the match for us
    : props.path
      ? matchPath(location.pathname, props)
      : context.match;

  return { ...context, location, match };
}

/**
 * The public API for matching a single path and rendering.
 */
class Route extends React.Component {
  // TODO: Remove this
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  // TODO: Remove this
  static childContextTypes = {
    router: PropTypes.object.isRequired
  };

  // TODO: Remove this
  getChildContext() {
    let parentContext = this.context.router;
    const context = getContext(this.props, parentContext);
    return {
      router: context
    };
  }

  render() {
    return (
      <RouterContext.Consumer>
        {context => {
          const props = getContext(this.props, context);
          let { children, component, render } = this.props;
          // Preact uses an empty array as children by
          // default, so use null if that's the case.
          if (Array.isArray(children) && children.length === 0) { children = null; }
          if (typeof children === "function") {
            children = children(props);
            if (children === undefined) { children = null; }
          }

          return (
            <RouterContext.Provider value={props}>
              {children && !isEmptyChildren(children)
                ? children
                : props.match
                  ? component
                    ? React.createElement(component, props)
                    : render
                      ? render(props)
                      : null
                  : null}
            </RouterContext.Provider>
          );
        }}
      </RouterContext.Consumer>
    );
  }
}

export default Route;
```

可以看出，在 Route 中，是直接通过 `this.context.router` 方式直接访问 context 对象，然后直接访问到 Router 放在 context 对象上的数据。通过 `getContext` 方法获取的对象的 `match` 值，来判断是否渲染对应的 component 或 render 数据。

它使用到了 `matchPath` 方法，如果不匹配，matchPath 方法返回 null，否则返回一个对象

```javascript
// matchPath 源码
function matchPath(pathname, options = {}) {
  if (typeof options === "string") options = { path: options };

  const { path, exact = false, strict = false, sensitive = false } = options;

  const { regexp, keys } = compilePath(path, { end: exact, strict, sensitive });
  const match = regexp.exec(pathname);

  if (!match) return null;

  const [url, ...values] = match;
  const isExact = pathname === url;

  if (exact && !isExact) return null;

  return {
    path, // the path used to match
    url: path === "/" && url === "" ? "/" : url, // the matched portion of the URL
    isExact, // whether or not we matched exactly
    params: keys.reduce((memo, key, index) => {
      memo[key.name] = values[index];
      return memo;
    }, {})
  };
}
```

## 3 总结

react-router 源码也不多，原理也很简单。

原理：通过比较 location.pathname 和组件的 path 属性值，来判断是否渲染组件。

> react-router 依赖于 react 与 history 2大库

关键技术点：

Router: 将 history 等数据挂载到 context 对象上，包括 `{history, location, match, staticContext}`

Route: 通过 context 获取 Router 的数据并绑定新的数据到 context 对象上，包括 `{history, location, match, staticContext}`

> 这里只是说了 react-router 的基本使用，并没有将其与 redux 联系起来，只有将其与 redux 结合起来，才能使用 react-redux 提供的 connect 方法，让子组件获取 location, history 等对象数据
