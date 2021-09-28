# webpack-moduleFederation

time: 2021-06-28 15:42:44  
author: heyunjiang

## 背景

最近在做微前端相关调研，尝试使用 webpack5 最新功能 module federation 来实现，同时也在跟进 webpack5 最新知识点

## 1 基础知识归纳

参考 [实例](https://github.com/module-federation/module-federation-examples/blob/master/advanced-api/dynamic-remotes/app1/src/App.js)  
说明：webpack 官方文档写的比较垃圾，只有一些概念上的东西，不太方便理解，给了一些 demo，具体 api 配置还是得看源码。结合 emp 源码一起学习

问题归纳  
1. shared module 没有打成独立的包，怎么去实现共享的呢？
2. 远程加载 remote js 文件，通常是跨域的，需要配置服务器跨域设置。qiankun也有这个问题吗？如果是走的同一**网关，就不需要配置**
3. 为什么非得使用 import() 来启动包含 moduleFederation 的项目？
4. vue 项目远程加载组件，能加载组件实例吗？**能**
5. vue2 能加载 vue3 实例不？因为直接加载组件配置文件肯定是不行的，他们依赖的 vue 版本不同，实例可以 import 之后，**手动执行 $mount 方法**
6. vue 组件配置能加 vuex, router 配置吗？**能**

注意事项：  
1. remote 需要控制好 output.pablicPath，不然 host 可能加载不到资源
2. 可以通过 library.type 设置为 umd，来实现通用模块的加载

## 2 遇到的问题总结

### 2.1 Uncaught Error: Shared module is not available for eager consumption

问题描述：在配置 shared 共享模块时，js 执行报错，前端无法渲染  
初步解决方案：webpack entry 由 main.js 切换到 index.js，index.js 代码为 `import('./main.js')`

为什么会有这个错误？

### 2.2 script-loader SyntaxError: Cannot use import statement outside a module

问题描述：在使用 `import Task from 'taskAnalysis/task'` import 命令直接引入模块时报错，使用 import() 方法也会报错  
问题分析：项目中使用到了 script-loader，现在该 loader 已经停止维护了  
解决方案：使用 `asset/source` 替换掉

### 2.3 Failed to resolve async component return __webpack_require__.e Loading script failed

问题描述：在 vue 中使用 import() 动态加载组件时报错，默认在 modulefederation 插件中 library.type 为 var   
解决方案：在 modulefederation 配置中增加 library 配置，因为 webpack 内部是通过增加一个 entry 来实现的这个功能。默认 library 输出为 var，我们可以修改 type 为 umd 来实现在 vue 中使用。
加载方式需要支持 module 才行。并且要在 host 端启动 scriptType 为 module，和 environment.module = true。注意 remote 不能把 runtime 独立出去，否则也会报这个错

从这里总结 webpack 一个知识点：library 有什么用    
答：library 是控制输出为 cdn 等引用库时，可以指定资源脚本类型，可以为 var, umd, module 等

### 2.4 ChunkLoadError: Loading chunk xxxx failed

问题描述：在加载到 remoteEntry 入口文件时，webpack runtime 文件会发请求去获取相关组件依赖文件。没有请求 remote 的域名，是自身的域名
解决方案：我在 remote 项目中指明了 `publicPath: '/'`，所以 host 项目会默认从当前域名去查找，需要我们指明 remote 的 public path，或者不指定，它会根据 host 中的 remotes 来取值

从这里总结 webpack 一个知识点：path 和 publicPath 有什么区别  
答：path 是指定静态资源存储的绝对路径，比如通常存储在 `path.join(__dirname, './dist')` 目录下；publicPath 是指定资源文件访问时的前缀路径，在打包结果中是 `__webpack_require__.p` 的值

### 2.5 Container initialization failed as it has already been initialized with a different share scope

问题描述：单独 export 某组件或组件实例是没问题，但是 export main.js 为什么会有这个问题

## 3 微前端实现思考

1. 子应用暴露组件配置，父应用直接加载组件配置，作为 vm.components 来实现。思考点：webpack mf 是如何加载到组件文件的，这个也是 mf 工作原理
2. 子应用暴露组件配置，但是配置包含了 store, router。思考点：子应用能独立存在 store, router 吗？为什么？
3. 子应用暴露 vue 实例。思考点：vue 渲染时，如果 vm.components 下的组件是实例，而不是实例配置，能发生什么？
不行，vue createComponent 支持配置文件对象、Vue.extend 之后的构造函数对象、function，不支持实例化后的 vm 对象。除非拿到对象之后主动 $mount 到对应节点
4. 子应用暴露 vue3 配置，react 配置，能实现吗？

思考学习总结  
1. 子应用能独立存在 store，因为 store 是挂载在实例上面，最先会在当前实例查找 store，找不到才去 parent.$options.store 查找
2. 子应用能独立存在 router，因为 router 也是挂载在实例上面，所有子组件都是访问的该实例的 $options.router 对象。对于全局组件 link、view 来说，也是通过访问该实例的 $options.router 上的路由配置，加载对应的组件
3. 子应用暴露实例，是不能直接通过 components 注册来实现渲染，因为 createComponent 不支持实例，它支持了构造函数、object、普通 function(vue 的其他实现)
4. 子应用暴露实例，在父应用中可以 import 之后，通过主动调用 $mount 来挂载，这就实现了跨技术栈的实现，可以使用 vue3, react 等框架
5. 子应用暴露 vue3 配置，react 配置，需要父应用主动生成相关框架组件实例，可以自行加载 vue.runtime.min.js 等 runtime 文件，自己包装一层实现，也可以使用已有的一些转换库实现，比如 vuera

## 4 工作原理

到目前为止，基于 moduleFederation 的微前端基本已经实现，但是还有2个想到的问题和一个实际项目遇到的问题没有解决，这里做一个源码分析，做一个接下来要做的事情  
1. 继续分析 webpack5 打包流程，掌握资源 emit 原理
2. 分析 moduleFederation 原理，做相关总结
3. 分析同时携带这3个问题
4. 归纳总结 mf
5. 优化项目 webpack 打包配置，体验 dev 打包速度优化
6. 归纳总结 webpack5 相关功能

### 4.1 remote 工作原理

## 5 解决方案 - 全局样式污染

主应用可能污染子应用，子应用可能污染整个父应用。  
目前运行方式：同时启动父子应用，在父应用内部加载子应用，同时查看效果，所以暂时不处理父应用污染子应用问题。这里仅解决 `子应用污染父应用` 问题

污染类型  
1. 不同组件库样式污染
2. 自定义全局样式污染

针对不同组件库，解决方案是 `按需引入样式`，比如 element-plus 可以使用 [unplugin-vue-components](https://element-plus.gitee.io/zh-CN/guide/quickstart.html#on-demand-import) 实现按需加载组件和样式

针对全局样式污染：需要在所有全局样式前增加命名空间，名字为子应用 id，保证全局唯一

## 参考文章

[webpack 官方](https://webpack.docschina.org/concepts/module-federation/)  
[moduleFeration demo](https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes)  
[mf 在线体验](https://stackblitz.com/github/webpack/webpack.js.org/tree/master/examples/module-federation?file=app2%2Fwebpack.config.js&terminal=start&terminal=)
