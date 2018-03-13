# react-redux

[github地址](https://github.com/reactjs/react-redux/blob/master/docs/api.md#api)

react-redux 是 `redux` 的 `react` 版本实现

## api 

provider和connect

### 1. <Provider store>

props: 
1. store(redux store): 应用的store(每个应用保持单一store原则)
2. children：应用root组件

```js
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

### 2. connect方法

由react-redux提供的connect方法，让我们能方便操作store、props、dispatch等

参数：

`connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])`

`mapStateToProps`：获取store中的state

`mapDispatchToProps`: 获取redux中的dispatch方法，如果不设置此参数，默认在组件中插入 `dispatch` 方法


> 3. connectAdvanced: connect基于此方法构建而来
> 4. createProvider： 构建一个新的provider