# vue代码架构组织分析

time: 2021.2.7  
author: heyunjiang

## 背景

今天在学习 vue-property-decorator 时，看到 vue 的 class + decorator 写法，觉得和日常我们写的 vue 组件大不一样；  
再次回顾 vue 源码，这里归纳一下 vue 的代码组织架构，对 vue 的代码能做到胸有成竹

## 1 收益

1. 全局认识：建立起对 vue 整体代码架构的全局认识
2. 版本对比：后续对 vue3 做源码分析时，能明确知晓 vue 不同版本的异同点
3. 架构能力：提升自身架构能力，能模仿 vue 做一套框架

## 2 整体目录分析

这里只对 src 做目录分析，其他涉及到输出结果、起停脚本、示例 demo等一级目录及 package.json 等文件，这里不做总结  
```bash
src
├── compiler                   # 编译模块，输出 createCompiler 方法，可以传参 const { compile, compileToFunctions } = createCompiler(baseOptions) 实现生成 compile 编译函数
├── core                       # vue 对象源码目录
├── platforms                  # 针对 web, weex 平台，输出特定 vue 对象及附加标注实现
├── server                     # 针对 ssr 渲染的实现
├── sfc                        # 暂时不清楚用来干啥
├── shared                     # utils 和 const
```

总结：通过目录可以看到，通过抽离通用的 vue 对象作为核心实现，与平台无关，另外将编译模块抽离，减小源码体积。

## 3 核心 core 分析

先看目录  
```bash
core
├── components                 # vue 提供的组件，目前只看到 keep-alive 组件
├── global-api                 # 定义 vue 全局 api，比如 Vue.component、Vue.extend、Vue.mixin、Vue.use、Vue.utils 等
├── instance                   # vue 对象核心
│   ├── render-helpers           # render 的一些辅助方法，比如 dynamic-keys、slot 等
│   ├── events.js                # 挂载 Vue.prototype 对象事件实现，包括 $on、$off、$once、$emit；定义了组件事件初始化
│   ├── index.js                 # 入口文件，定义了 Vue 对象函数
│   ├── init.js                  # 挂载 Vue.prototype._init 实现，内部定义了实例初始化流程
│   ├── inject.js                # 定义了实例如何处理 inject 实现
│   ├── lifecycle.js             # 挂载 Vue.prototype 对象实例生命周期方法，包括 _update、$forceUpdate、$destory；定义了组件生命周期初始化；定义了 mountComponent、updateChildComponent 实现
│   ├── proxy.js                 # 基本没啥用，一些规则校验
│   ├── render.js                # 挂载 Vue.prototype 对象渲染实现，包括 _render、$nextTick；定义了 initRender，生成 vm.$createElement 方法
│   └── state.js                 # 挂载 Vue.prototype 对象数据对象，包括 $data、$props、$watch、 等；定义了 initState，computed 数据处理实现
├── observer                   # 发布订阅实现，也是响应式核心，内部实现了 dep、watcher 等对象
├── util                       # util，在 global-api 中挂载了部分
├── vdom                       # 虚拟 dom 的实现，包括定义 vnode 对象、diff 更新算法、渲染真实 dom 实现
├── config.js                  # 配置文件，内部通过 Vue.config 使用
├── index.js                   # vue 入口文件
```

这里对整体架构做个总结，再结合其他源码解读系列来看，一切都串起来了
