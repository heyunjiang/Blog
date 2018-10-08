# history 源码解读

time: 2018.10.08

history 作为 react-router 2 大主要依赖之一

## 1 补充 html5 history 知识

```javascript
// history 对象

History {
  length: 6,
  scrollRestoration: "auto",
  state: null
}
// history 原型链
History.prototype {
  back() {},
  forward() {},
  go() {},
  length: 6,
  pushState(stateObj, name, uri) {},
  replaceState(stateObj, name, uri) {},
  scrollRestoration: "auto",
  state: null
}
// history 事件
window.onpopstate = () => {}
```

浏览器支持： ie 10+

## 2 history package

使用 HTML5 历史 API 记录（ pushState，replaceState 和 popstate 事件）

```javascript
// createHashHistory

const createHashHistory = (...options) => {
  const history = {
    length: globalHistory.length,
    action: "POP",
    location: initialLocation,
    createHref,
    push,
    replace,
    go,
    goBack,
    goForward,
    block,
    listen
  };

  return history;
}

export default createHashHistory;
```

createBrowserHistory 返回的解构也是一致的，但是它采用的的是 html5 提供的 history 对象操作

### 2.1 createHashHistory 与 createBrowserHistory 区别

1. url 路径不同
2. 实现方式不同，createHashHistory 采用内存操作数据，createBrowserHistory 采用 html5 history api 操作数据
3. 后端配置：createHashHistory 不需要服务端配置路由， createBrowserHistory 需要服务端配置路由