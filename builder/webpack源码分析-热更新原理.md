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

### 2.3 应用程序中的 hot runtime 文件

通过 `http://localhost:8081/webpack-dev-server` 查看 dev 环境的构建代码

## 参考文章

[webpack hmr 概念介绍](https://webpack.docschina.org/concepts/hot-module-replacement/)  
[vue-loader hmr](https://vue-loader.vuejs.org/zh/guide/hot-reload.html#%E7%8A%B6%E6%80%81%E4%BF%9D%E7%95%99%E8%A7%84%E5%88%99)  
[vscode launch.json 配置](https://www.barretlee.com/blog/2019/03/18/debugging-in-vscode-tutorial/)
