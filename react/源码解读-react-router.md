# react-router 4 源码阅读

在阅读 redux-saga 源码的时候，学习了 redux 的 applyMiddleware 原理，知道了一个 middleware 是通过拦截 dispatch 更新 state，创建一个新的 dispatch

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

### 2.2 Router 实现原理

