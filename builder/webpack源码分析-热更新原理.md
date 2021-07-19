# hmr 原理

time: 2021-07-13 19:30:47  
author: heyunjiang

## 背景

今天做升级 webpack5 时，发现 dev-server 的热更新一直有问题，import 加载的入口 vue 修改之后无法更新界面，内部普通组件可以热更新，搜索引擎也查不到相关解决方案。  
自己也一直对 webpack 热更新原理不太清楚，这里做一个全面总结

## 1 热更新基础知识

基本配置：在 devServer 配置 `hot: true` 即可开启热更新，并且 webpack5 无需再使用 webpack.HotModuleReplacementPlugin 插件，内部会默认使用

基本功能：  
1. 在应用程序运行时，局部更新、替换、删除模块，不刷新页面
2. 保存应用程序状态不变
3. 在代码更新后，应用程序接收到更新消息，会去更新实现了 HMR 接口的模块。是如何更新的？

### 1.1 实现 HMR 接口

通常在入口文件实现 HMR 接口  
```javascript
if (module.hot) {
  module.hot.accept('./print.js', function() {
    console.log('Accepting the updated printMe module!');
  })
}
```

热更新接口实现要求  
1. dom 更新的，需要 vue-loader 主动更新渲染组件
2. 样式更新的，需要 vue-loader 和 vue-style-loader 协同工作

### 1.2 api 支持

1. module.hot.accept: 添加热更新模块
```javascript
module.hot.accept(
  dependencies, // 可以是一个字符串或字符串数组
  callback // 用于在模块更新后触发的函数
  errorHandler // (err, {moduleId, dependencyId}) => {}
)
```
2. module.hot.decline(dependencies)：去除热更新模块
3. module.hot.status() 返回当前模块的状态

## 2 实现原理

### 2.1 初步问题调试

启动 webpack-dev-server.hot 之后，在 chrome-dev-tool network 中，发现有一个 websocket 链接，每当我们有内容修改时，会有如下流程  
1. 修改 .vue 组件内容
2. 服务器会 Checking for updates on the server
3. 向浏览器 ws client 发起消息通知，类似 `a["{\"type\":\"hash\",\"data\":\"0118df37df688211703d\"}"]`
4. ws client 通知应用程序，有更新，应该发哪些请求(根据 0118df37df688211703d 来，怎么根据？)
5. 浏览器发起一个 hot-update.json 的 fetch 请求，获取待更新的 chunk 列表；还同时发起一个 hot-update.js 的 script 请求，这个是做啥？
6. 浏览器发起获取实际 chunk 请求，获取到更新后的 chunk

问题分析：查看更新后的 chunk，发现我修改的内容已经拿到了，说明是在应用时产生了问题  
解决方案分析：需要查看 vue-loader 在实现 hmr 接口时的处理逻辑，初步判断不是 webpack hmr 的问题

### 2.2 vue-loader 实现的 hmr 接口

vue-loader 有2个入口，一个是作为 loader，还有一个 VueLoaderPlugin  
分析 package.json 查找入口 main 及相关 dependencies，查找到 loader 中有 genHotReloadCode 方法执行

```javascript
if (needsHotReload) {
  code += `\n` + genHotReloadCode(id, hasFunctional, templateRequest)
}
```

配置 vscode launch.json 启动命令后，在 node_modules 中给 vue-loader 打断点调试一下  
> launch.json 配置命令，或者 spawn 执行命令是进不到调试的

手动调用 webpack-dev-server 实例
```javascript
const webpack = require('webpack')
const config = require('./webpack.dev.js')
const Server = require('webpack-dev-server/lib/Server');
const compiler = webpack(config)

server = new Server(compiler, {
  ...config.devServer,
  progress: true,
  hot: true
})

server.listen(config.devServer.port, 'localhost', (err) => {
  if (err) {
    throw err;
  }
})
```

在 vue-loader 中，是这么添加热更新的  
vue-loader index.js
```javascript
if (needsHotReload) {
  code += `\n` + genHotReloadCode(id, hasFunctional, templateRequest)
}
```

vue-loader codeGen/hotReload.js
```javascript
const hotReloadAPIPath = JSON.stringify(require.resolve('vue-hot-reload-api'))

const genTemplateHotReloadCode = (id, request) => {
  return `
    module.hot.accept(${request}, function () {
      api.rerender('${id}', {
        render: render,
        staticRenderFns: staticRenderFns
      })
    })
  `.trim()
}

exports.genHotReloadCode = (id, functional, templateRequest) => {
  return `
/* hot reload */
if (module.hot) {
  var api = require(${hotReloadAPIPath})
  api.install(require('vue'))
  if (api.compatible) {
    module.hot.accept()
    if (!api.isRecorded('${id}')) {
      api.createRecord('${id}', component.options)
    } else {
      api.${functional ? 'rerender' : 'reload'}('${id}', component.options)
    }
    ${templateRequest ? genTemplateHotReloadCode(id, templateRequest) : ''}
  }
}
  `.trim()
}

```

结果分析：  
1. vue-loader 在处理 .vue 文件时，会给每个组件添加 module.hot 热更新代码，并且更新前后的 id 都没有变化；通过观察打包结果，可以发现每个 chunk 内包含多个组件，每个 import() 对应独立的 chunk，每个组件都有 module.hot 热更新代码
2. module.hot.accept 回调函数在 webpack5.40.0 + vue-loader15.9.7 不会执行

为什么 module.hot.accept 回调函数不会执行？  
这里要先思考几个问题：  
1. 浏览器应用程序收到的是 hot-update.js 文件，是如何应用更新的？module.hot.accept 回调函数应该怎么才能执行
2. 我们的打包结果 chunkName 为什么那么长？
3. 为什么chunk 入口组件不会被热更新？非入口却可以？可以看看应用程序 runtime hot 文件
4. 从我们代码变更保存时，webpack 做了什么？

### 2.3 webpack 监听代码变更

目前只是知道了 vue-loader 在处理 .vue 模块时，给每个模块实现了 hmr 接口，并且在 module.hot.accept 回调函数中调用了 `require.resolve('vue-hot-reload-api').rerender`，可惜在 webpack5 中没有执行。  
但是通过控制台观察到 webpack 给了 hot-update.json, hot-update.js 文件给应用程序。

现在开始从头分析：编辑器代码保存时，webpack 做了什么操作？  
猜想流程：webpack watch 到对应模块代码变更，会对该模块做独立构建，生成独立的 module.hot-update.js 文件  
如果启动了 hmr，则发起 ws 消息传递 hash 随机数，等待应用程序来取更新后的模块信息  
并且替换掉之前构建好的 chunk 中的模块内容，包装浏览器刷新能获取到最新的代码

测试一：关闭 devServer.hot ，看看是否有新构建模块  
答：会新构建，并且走 liveReload 模式，也就是浏览器刷新模式，这个是 webpack-dev-server 中配置的

从 webpack-dev-server 入口看起，看看是如何实例化 webpack 的  
走 compiler.watch 模式，并且在 compiler.hooks.done 之后，会去监察 compilation.fileDependencies 等文件依赖，在变化之后做了什么

webpack.watching.watch 方法
```javascript
watch(files, dirs, missing) {
  this.pausedWatcher = null;
  this.watcher = this.compiler.watchFileSystem.watch(
    files,
    dirs,
    missing,
    this.lastWatcherStartTime,
    this.watchOptions,
    (
      err,
      fileTimeInfoEntries,
      contextTimeInfoEntries,
      changedFiles,
      removedFiles
    ) => {
      this._invalidate(
        fileTimeInfoEntries,
        contextTimeInfoEntries,
        changedFiles,
        removedFiles
      );
      this._onChange();
    },
    (fileName, changeTime) => {
      if (!this._invalidReported) {
        this._invalidReported = true;
        this.compiler.hooks.invalid.call(fileName, changeTime);
      }
      this._onInvalid();
    }
  );
}
```

在文件变化的时候，会通过 watching._invalidate，依次走到 watching._go，将更改的文件名保存在 `compiler.modifiedFiles` 上。  
再去看看 compiler, compilation 是如何处理变更文件的  
全局搜索了 webpack 项目，发现没有地方用到 compiler.modifiedFiles 属性，难道是要 webpack-dev-server 自己处理吗？  
再回到 webpack-dev-server server 中来看，它是如何监听文件变化的

> webpack-dev-middleware 是一个封装器，执行之后作为 express 或 koa 的中间件，将 compiler 产生的文件提供给对应服务器。  
> 直接使用它时，在文件变更之后，需要手动刷新浏览器

在 webpack-dev-server 中添加了如下钩子  
```javascript
const { compile, invalid, done } = compiler.hooks;

compile.tap('webpack-dev-server', invalidPlugin);
invalid.tap('webpack-dev-server', invalidPlugin);
done.tap('webpack-dev-server', (stats) => {
  this._sendStats(this.sockets, this.getStats(stats));
  this._stats = stats;
});
```

总结: 在 `compiler.hooks.done` 完成 emitAssets 之后，会根据 compilation 生成 stats 信息，并使用 getStats 获取 stats.toJson 发送给 ws client

### 2.4 webpack-dev-server 服务架构

在 webpack-dev-server 内部，启动了 `http 服务器`，还启动了 `sockjs 服务器`。sockjs 和 websocket 有什么不同？sockjs 是模拟实现 websocket

http 服务器相关实现
```javascript
setupApp() {
  this.app = new express();
}
createServer() {
  this.listeningApp = http.createServer(this.app);
}
```

### 2.5 webpack-dev-server 修改 compiler.options 配置文件，添加 entry client、hot server 入口和 HotModuleReplacementPlugin 插件

前面了解到了 webpack-dev-server 是通过监听 compiler.hooks.done 来及时获取构建结果。  
现在的问题是  
1. 客户端接收到 ws 更新信息，是如何处理的
2. 服务器是如何生成 hot-update 文件的，是读的 compilation 的哪些数据

在 devServer 配置中，inline 表示在 bundle 中插入 hmr runtime 脚本，来看看相关代码  
在 updateCompiler 方法中，如果有 hot or hotOnly 配置，则会默认加上

1. webpack-dev-server Server 调用 updateCompiler 修改 compiler 配置添加 hmr HotModuleReplacementPlugin
```javascript
class Server {
  constructor(compiler, options = {}, _log) {
    this.compiler = compiler;
    this.options = options;
    this.log = _log || createLogger(options);
    normalizeOptions(this.compiler, this.options);
    updateCompiler(this.compiler, this.options);
  }
}
```

2. updateCompiler 函数 addEntries 及定义 `__webpack_dev_server_client__` 全局属性
```javascript
function updateCompiler(compiler, options) {
  addEntries(webpackConfig, options);
  compilers.forEach((compiler) => {
    const config = compiler.options;
    compiler.hooks.entryOption.call(config.context, config.entry);

    const providePlugin = new webpack.ProvidePlugin({
      __webpack_dev_server_client__: getSocketClientPath(options),
    });
    providePlugin.apply(compiler);
  });

  if (options.hot || options.hotOnly) {
    compilersWithoutHMR.forEach((compiler) => {
      const plugin = findHMRPlugin(compiler.options);
      if (plugin) {
        plugin.apply(compiler);
      }
    });
  }
}
```

3. addEntries(webpackConfig, options) 修改 webpack config 配置
```javascript
function addEntries(config, options, server) {
  // 1 定义 clientEntry, 通常是 webpack-dev-server/client/index.js?http://localhost:3000
  const clientEntry = `${require.resolve(
    '../../client/'
  )}?${domain}${sockHost}${sockPath}${sockPort}`;

  // 2 定义 hotEntry, 通常是 webpack/hot/dev-server.js
  let hotEntry;
  if (options.hotOnly) {
    hotEntry = require.resolve('webpack/hot/only-dev-server');
  } else if (options.hot) {
    hotEntry = require.resolve('webpack/hot/dev-server');
  }

  // 3 修改 webpack.config.entry，增加 clientEntry 和 hotEntry
  const additionalEntries = [clientEntry];
  if (hotEntry && checkInject(options.injectHot, config, true)) {
    additionalEntries.push(hotEntry);
  }
  config.entry = prependEntry(config.entry || './src', additionalEntries);

  // 4 添加 HotModuleReplacementPlugin 插件
  if (options.hot || options.hotOnly) {
    config.plugins = config.plugins || [];
    if (
      !config.plugins.find(
        (plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin'
      )
    ) {
      config.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
  }
}
```

归纳总结  
1. 在 webpack-dev-server 启动 webpack watch 之前，会修改 compiler 对象，加上 hmr 相关插件和相关 entry 入口
2. 只要设置了 hot || hotonly，就会默认带上 hmr 相关插件
3. 定义的 `__webpack_dev_server_client__` 指向 webpack-dev-server/client/clients/SockJsClient.js 文件

定义的多入口和 HotModuleReplacementPlugin 做了什么？  
1. 多入口，代表 compilation 会调用多次 addEntry 方法，看看最后输出什么？

### 2.6 应用程序中的 hot runtime 文件

> 前面我们看到了 webpack-dev-server 是修改了 entry 入口和 添加了 HotModuleReplacementPlugin 插件

来看看 hot runtime 相关代码

通过 `http://localhost:8081/webpack-dev-server` 查看 dev 环境的构建代码

## 参考文章

[webpack hmr 概念介绍](https://webpack.docschina.org/concepts/hot-module-replacement/)  
[vue-loader hmr](https://vue-loader.vuejs.org/zh/guide/hot-reload.html#%E7%8A%B6%E6%80%81%E4%BF%9D%E7%95%99%E8%A7%84%E5%88%99)  
[vscode launch.json 配置](https://www.barretlee.com/blog/2019/03/18/debugging-in-vscode-tutorial/)  
[sockjs, websocket, stompjs](https://segmentfault.com/a/1190000017204277)
