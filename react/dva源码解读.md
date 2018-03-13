# dva 源码解读

[dva](https://github.com/dvajs/dva): 基于redux、react-redux、redux-saga、react-router 的轻量级框架

dva 只是对上面组件的一层封装，react该怎么写还是怎么写，不影响组件的写法

## 目录结构说明

查看npm的dva包

```bash
├── /dist/            # 项目输出目录
├── /lib/             # 项目源码编译后的库目录
├── /src/             # 项目源码目录
│ ├── createDva.js    # 主要源码目录
│ ├── handleActions.js   
│ ├── index.js        # 源码入口文件
│ ├── mobile.js       # 移动端入口文件及源码
│ └── plugin          # 插件加载工具函数     
├── index.js     	  # dva默认入口
├── mobile.js         # dva 移动端支持入口
└── router.js    	  # 路由输出
```

## 源码解读

进入src目录进行源码查看，`index.js`是作为项目的入口文件，执行createDva，导出dva函数

```index.js
import hashHistory from 'react-router/lib/hashHistory';
import {
  routerMiddleware,
  syncHistoryWithStore,
  routerReducer as routing,
} from 'react-router-redux';
import createDva from './createDva';

export default createDva({
  mobile: false,
  initialReducer: {
    routing,
  },
  defaultHistory: hashHistory,
  routerMiddleware,

  setupHistory(history) {
    this._history = syncHistoryWithStore(history, this._store);
  },
});
```

进入 `'./createDva'`,我们先看看它 import 了哪些主要工具: `react-redux`、`redux`、`redux-saga`。

`redux-saga` 是 `redux` 的一个中间件，用于 `effects` 管理。

export出createDva，在 `src/index` 里面已经执行了，它返回的是一个函数dva，dva执行则返回一个app对象，也就是我们使用dva的那几个简单api操作接口对象，

```
return function dva(hooks = {}) {
    // history and initialState does not pass to plugin
    const history = hooks.history || defaultHistory;
    const initialState = hooks.initialState || {};
    delete hooks.history;
    delete hooks.initialState;

    const plugin = new Plugin();
    plugin.use(hooks);

    const app = {
      // properties
      _models: [],
      _router: null,
      _store: null,
      _history: null,
      _plugin: plugin,
      // methods
      use,
      model,
      router,
      start,
    };
    return app;
```

我们使用dva进行如下操作 

```
import { message } from 'antd'
import dva from 'dva'
import createLoading from 'dva-loading'
import { browserHistory } from 'dva/router'
import 'babel-polyfill'

// 1. Initialize
const app = dva({
  ...createLoading({
    effects: true,
  }),
  history: browserHistory,
  onError (error) {
    message.error(error.message)
  },
})

// 2. Model
app.model(require('./models/app'))

// 3. Router
app.router(require('./router'))

// 4. Start
app.start('#root')
```

接下来我们仔细分析app对象里面的这几个属性。

#### 1. _models

_models为一个数组，保存的是当前已经加载的model，就是我们写的包含的`namespace`、`subscriptions`、`effects`、`reducers` 的models目录文件。用于提取store信息，方便`redux-sage`和`redux`处理。

#### 2. _router

_router为一个数组，保存的是我们定义的路由信息，用于直接添加到`react-redux`的`Provider`里面，没有其他处理。所以说dva对于路由并没有特殊处理，用的就是 `react-router`。

#### 3. _store

```
const store = this._store = createStore(
        createReducer(),
        initialState,
        compose(...enhancers),
      );
```

存储当前`namespace`下的store信息，`createStore`为redux的构建store方法

#### 4. _history

用于对`history`的一个重新赋值，真实起效的是history

#### 5. _plugin

保存当前使用的plugin信息，

```
const plugin = new Plugin();
plugin.use(hooks);
```

#### 6. use

**dva api use**

加载插件

#### 7. model

**dva api model**

加载model，将其push到_model数组中

#### 8. router

**dva api router**

router，将其push到_router数组中

#### 9. start

前面一些私有属性和3个公共方法，都是为start方法做准备的

### start细讲

#### 1.support selector 获取dom容器-container

#### 2.从_model中装载reducers和sagas所需信息

```
const sagas = [];
      const reducers = { ...initialReducer };
      for (const m of this._models) {
        reducers[m.namespace] = getReducer(m.reducers, m.state);
        if (m.effects) sagas.push(getSaga(m.effects, m, onErrorWrapper));
      }
```

reducer加载_model的reducer，saga加载_model的effects

#### 3.构建store

1.首先创建 `sagaMiddleware` ，使用 `saga` 提供的 `createSagaMiddleware()` 方法创建。

`const sagaMiddleware = createSagaMiddleware();`

2.然后构建 `middlewares` 数组，由 `sagaMiddleware` 和其他的 `extraMiddlewares` 构成，用于使用 `redux` 的 `applyMiddleware` 来加载 `redux` 所需的中间件。

`let middlewares = [sagaMiddleware,...flatten(extraMiddlewares),];`

3.构建 `enhancers` ，组成一个函数数组，我理解的它主要是effects，用于后面构建 `store`

```
const enhancers = [
        applyMiddleware(...middlewares),
        devtools(),
        ...extraEnhancers,
      ];
```

4.构建 `store` ，使用 `redux` 提供的 `createStore()`方法创建 store，

```
const store = this._store = createStore(
        createReducer(),
        initialState,
        compose(...enhancers),
      );

      function createReducer(asyncReducers) {
        return reducerEnhancer(combineReducers({
          ...reducers,
          ...extraReducers,
          ...asyncReducers,
        }));
      }
```

构建好了 `store` 之后，如何应用呢？

先需要将 `saga` 中间件启动起来

`sagas.forEach(sagaMiddleware.run);`

绑定 `history`

`if (setupHistory) setupHistory.call(this, history);`

执行数据源订阅，获取 _model 中的`subscriptions`，其中，runSubscriptions会执行 `redux` 的 `dispatch` 方法，来启动subscriptions

```
const unlisteners = {};
      for (const model of this._models) {
        if (model.subscriptions) {
          unlisteners[model.namespace] = runSubscriptions(model.subscriptions, model, this,
            onErrorWrapper);
        }
      }
```

最后，才来应用 `store`: 这里要使用 `react-dom` 的 `render` 方法来渲染dom;使用 `react-redux` 的 `Provider` 将 `react` 与 `redux`连接起来并共享 `store`;

```
if (container) {
      render(container, store, this, this._router);
      plugin.apply('onHmr')(render.bind(this, container, store, this));
    } else {
      return getProvider(store, this, this._router);
    }

    function getProvider(store, app, router) {
      return extraProps => (
        <Provider store={store}>
          { router({ app, history: app._history, ...extraProps }) }
        </Provider>
      );
    }

	function render(container, store, app, router) {
      const ReactDOM = require('react-dom');
      ReactDOM.render(React.createElement(getProvider(store, app, router)), container);
    }

```


----------


到这里就，基本结束了dva的源码大概解析。

我这里只分析了它实现的基本原理，它的一些实现细节需要你去具体分析，它还包含了plugin、invariant、saga方法等的应用。

接下来总结一下它的实现步骤

## 步骤总结

1. 构建 `createDva` 函数，执行并返回 `dva` 方法对象
2. 构建 `dva` 方法执行返回的 `app` 对象，首先构建基础的 `_models, _router, _store, _history, _plugin, use, model, router`，这些有的是数组，有的是函数
3. 构建 `start`，也是最重要的一个环节，这里构建了 `saga`，监听了 `subscription`，构建了 `store`，
4. 最后将 `redux`、`saga`、`react`结合起来，应用到项目中


----------

对于一个model的处理，比如injectModel，动态插入dodel时，分三步

1. getReducer(m.reducers, m.state) && store.replaceReducer()，完整替换之前的reducer
2. getSaga(m.effects, m, onError) && store.runSaga()
3. runSubscriptions(m.subscriptions, m, this, onError) 执行subscriptions

----------

这里的简单总结，也是我自己对于dva应用的学习总结