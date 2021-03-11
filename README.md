# Blog

![abilityTree](./images/abilityTree.jpg)

个人技术总结，技术发展方向：目标是一名卓越的软件工程师，从前端入手，让前端能力成为我的杀手锏，同时也能解决其他软件工程方面的能力

个人实践，并深入分析之后总结

> 说明：写这些文章，目的是让自己对js基础知识掌握更全面。这里总结的是自己不是很熟或者陌生的知识点，如果说熟悉了的，平常用到的，就不总结了。  
> 不着急总结全部知识，每个知识追求细枝末节，希望掌握全面  
> 使用技术：学习技术，要结合实际项目来学习，脱离项目的学习很快就会忘记；结合项目的学习，负责任把项目做好，技术做深入，能力自然就提升了。  
> 新技术：关注新技术，先总结其能做什么，再考虑能否在项目中融合使用进去  
> 项目开发目标：首要完成项目，其次 **提升自己技术能力**，正是玉伯的：业务为正，专业为奇。

本地开发神器

1. parcel：支持入口文件 html，快速启动一个本地服务。用于自己写的 js 库快速调试，或者启动包含第三方库的单文件 vue 组件 （踩坑：parcel 自动安装依赖不完整，比如对 scss, postcss 的依赖安装就有问题，0配置跑不起来，非常依赖用户自己安装正确依赖）
2. vue-cli：支持入口文件 vue，快速启动一个本地服务。用于纯 vue 文件，如果使用了第三方库，比如 elementui ，则需要回到 parcel 快速启动服务
3. webpack：灵活配置，常用语打包 lib 文件，发布为 npm package 资源

抓包工具：chrome-dev-tool、whistle、wireshark

- html
  - ✔ [深入html-标签语义化](html/深入html-标签语义化.md)
- css
  - ✔ [cssModule](css/cssModule.md)  :global、:local、composes继承
  - ✔ [深入css-flex布局](css/深入css-flex.md)
  - [深入css-grid布局](css/深入css-grid.md)
  - ✔ [深入css-fixed、absolute、float](css/深入css-fixed、absolute、float.md)
  - ✔ [深入css-block、inline、inline-block](css/深入css-block、inline、inline-block.md)
  - ✔ [深入css-选择器及权重](css/深入css-选择器及权重.md)
  - [常见知识归纳](css/常见知识归纳.md) 包含了 css 一些常用知识点：盒子模型、选择器、字体使用、rem等
  - [预处理器-less](css/预处理器-less.md)
  - css 工具-postcss
  - transform 动画
  - animate 动画
  - [动画-flip](css/动画-flip.md) flip技术让过渡动画更流畅
- javascript
  - ✔ [es2015-解构赋值](es/es6-解构赋值.md)
  - ✔ [es2015-decorator](es/es6-decorator.md)
  - ✔ [es2015-模板字符串](es/es6-模板字符串.md)
  - ✔ [es2015-Symbol](es/es6-Symbol.md)
  - ✔ [es2015-promise](es/es6-promise.md)
  - ✔ [es2015-proxy](es/es6-proxy.md)
  - ✔ [es2015-set和map](es/es6-set和map.md)
  - ✔ [es2015-generator](es/es6-generator.md)
  - ✔ [es2015-async](es/es6-async.md)
  - ✔ [es2015-class](es/es6-class.md)
  - ✔ [es2015-模块化](es/es6-模块化.md) import export 关系
  - ✔ [深入js-编码规则](es/深入js-编码规则.md)
  - ✔ [深入js-词法作用域](es/深入js-作用域.md)
  - ✔ [深入js-语句与表达式](es/深入js-语句与表达式.md)
  - ✔ [深入js-基本类型](es/深入js-基本类型.md) 包含了数值、函数、对象的关键点总结
  - ✔ [深入js-原型与继承](es/深入js-原型与继承.md)
  - ✔ [深入js-执行上下文](es/深入js-执行上下文.md)
  - ✔ [深入js-闭包](es/深入js-闭包.md)
  - ✔ [深入js-正则表达式](es/深入js-正则表达式.md)
  - ✔ [深入js-内存管理与垃圾回收](es/深入js-内存管理与垃圾回收.md)
  - [深入js-this](es/深入js-this.md)  说明了 this 指向问题
  - [深入js-一些功能模拟实现](es/深入js-一些功能模拟实现.md)
  - [js-奇技淫巧](es/js-奇技淫巧.md)  比如 0.1+0.2 问题、退出循环等问题
  - ✔ [typescript浅尝](es/typescript浅尝.md) ts 基础总结
- nodejs
  - [node-模块化](nodejs/node-模块化.md) 模块加载缓存、包装器
  - [node-process](nodejs/node-process.md) 当前进程属性、方法
  - [node-cluster](nodejs/node-cluster.md) 多进程
  - [node-crypto](nodejs/node-crypto.md) OpenSSL 加解密实现
  - node-threads 工作线程，用于 cpu 密集计算，不适用于 i/o 密集
  - node-fs 文件系统
  - [node-调试](nodejs/node-调试.md) debugger 能力
  - node-error 错误对象
  - node-全局对象
  - [node-http](nodejs/node-http.md) http, http2, https 系列总结
  - node-socket net 实现 tcp | ipc 功能，dgram 实现 udp 功能
  - node-path 路径解析、拼装
  - node-repl 用户交互，需要时再查看 api，一般使用 commander 之类的库实现
  - node-buffer 二进制操作工具，同时包含 string_decoder 解码 buffer 为字符串
  - node-tls nodejs 对 tls/ssl 的实现，包括密钥、证书等
  - node-url URL 的处理与解析
  - node-vm 解析和执行 javascript 代码，基于 v8
  - node-zlib 提供了对 gzip, deflate/inflate, brotli 的压缩实现
  - [node-stream](nodejs/node-stream.md) 流的原理，包含 readline 逐行读取、实现 stream 的类统计
  - [node-timer](nodejs/node-timer.md) 定时器与事件循环
  - ✔ [cli工具](nodejs/cli工具.md)
  - ✔ [npm发包](nodejs/npm发包.md)
  - ✔ [koaAPI](nodejs/koaAPI.md) koa 实现了 http 服务器方面功能，包括 response, request, context 3大api
  - [koa 进阶](nodejs/koa进阶.md) 学习 koa 如何使用
- 浏览器
  - ✔ [深入浏览器-dom](browser/深入浏览器-dom.md)
  - ✔ [深入浏览器-bom](browser/深入浏览器-bom.md)
  - ✔ [深入浏览器-浏览器](browser/深入浏览器-浏览器.md)
  - ✔ [深入浏览器-事件循环](browser/深入浏览器-事件循环.md) 学习 chrome event loop，包括 macrotask, microtask, gc task, render task
  - [web 存储](PWA/web存储.md)
  - ✔ [跨域实现的几种方法](other/跨域实现的几种方法.md)
  - ✔ [浏览器安全](browser/深入浏览器-安全.md) 常见 xss 攻击及防御，csrf 攻防
  - ✔ [利用无头浏览器实现ui自动化测试](browser/利用无头浏览器实现ui自动化测试.md) 亮点技能 - ui 自动化测试
  - [关于前端监控的几点思考](browser/关于前端监控的几点思考.md)
- builder
  - [npm基础](builder/npm专题.md)
  - [ast的思考](builder/ast的思考.md)
  - ✔ [webpack基础](builder/webpack专题.md)
  - webpack 运行原理
  - webpack loader
  - [webpack-plugin](webpack-plugin.md)
  - rollup基础
  - fis基础
  - ✔ [babel plugin](builder/babel.md)
- 框架
  - [mvvm](other/mvvm.md) 都在用 mvvm ，到底什么 mvvm 是什么？
  - [源码解读-antd](react/源码解读-antd.md)
  - react
    - ✔ [源码解读-dva](react/源码解读-dva.md)
    - ✔ [源码解读-redux](react/源码解读-redux.md)
    - ✔ [源码解读-react-redux](react/源码解读-react-redux.md)
    - ✔ [源码解读-react-router](react/源码解读-react-router.md)
    - ✔ [源码解读-history](react/源码解读-history.md)
    - [源码解读-connected-react-router](react/源码解读-connected-react-router.md)
    - ✔ [源码解读-redux-saga](react/源码解读-redux-saga.md)
    - [源码解读-setState](./源码解读-setState.md)
    - ✔ [深入理解virtualDOM](react/深入理解virtualDOM.md)
    - ✔ [基本使用-react](react/基本使用-react.md) 官网 api + 使用技巧
    - ✔ [基本使用-react-router](react/基本使用-react-router.md) ：react-router 4
    - ✔ [vue vs react](react/react-vs-vue.md) : 可以直接参考 vue 及 react 相关知识点
  - vue
    - ✔ [vue生态 router](vue/vue生态-router.md) vue-router, 路由使用，路由配置，路由守卫，静态路由，动态路由
    - ✔ [vue生态 vuex](vue/vue生态-vuex.md) vue 状态管理
    - ✔ [vue生态 vue-cli](vue/vue生态-vue-cli.md) vue-cli 插件原理
    - ✔ [vue 组件通信](vue/vue组件通信.md) vue 组件间的 10 种通信方式
    - ✔ [vue 组件复用](vue/vue组件复用.md) vue 组件优化：10 种复用方式
    - ✔ [vue 目录规范](vue/vue目录规范.md) vue 目录规范
    - vue2 深入
      - ✔ [vue深入 - vue代码架构组织分析](vue/vue源码解读/vue代码架构组织分析.md) vue 代码架构组织分析
      - ✔ [vue深入 - 响应式系统](vue/vue源码解读/响应式系统.md) vue 响应式系统
      - ✔ [vue深入 - 数据驱动](vue/vue源码解读/数据驱动.md) vue 数据驱动 vnode
      - ✔ [vue深入 - 组件化](vue/vue源码解读/组件化.md) vue 组件化
      - [vue深入 - compiler](vue/vue源码解读/compiler.md) vue compiler 编译原理 ast
    - ✔ [vue vs react](react/react-vs-vue.md) vue 基本知识点
    - ✔ [vue2 边角知识](vue/vue2-边角.md)
    - ✔ [vue3 功能总结](vue/vue3-功能总结.md)
    - vue3 深入
      - [vue3 响应式系统](vue/vue3响应式系统.md)
  - [校验：eslint](react/基本使用-eslint.md)
  - 测试：mocha, karma, jest, enzyme  需要注意的有：注释规范、命名规范、语法规范、文件组织结构规范、接口文档规范、设计文档规范等
  - 模拟: mock
  - Rxjs: [中文官网](https://cn.rx.js.org/)
- 可视化
  - ✔ [可视化实现方案](可视化/可视化实现方案.md) 4种可视化实现方案
  - zRender 源码分析
- 性能优化
  - [系统性能衡量及优化](性能优化/系统性能衡量及优化.md) 系统性能如何衡量、如何优化、chrome-dev-tool
- pwa
  - ✔ [webWorkers](PWA/webWorkers.md) 亮点技能 - pwa
  - ✔ [pwa构建](PWA/pwa构建.md) -- [体验](https://heyunjiang.github.io/)
- git
  - ✔ [常见问题及答案](git/常见问题及答案.md)
  - ✔ [git知识点总结](git/git知识点总结.md)
- 软件工程
  - ✔ [项目中遇到的问题](software/项目中遇到的问题.md)
  - ✔ [项目经验](https://github.com/heyunjiang/Blog/blob/master/react/react-vs-vue.md#5-%E9%A1%B9%E7%9B%AE%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93)
  - ✔ [MBA](software/MBA.md)
- 设计模式、技巧
  - [高阶组件](designModal/HOC.md)
  - [Observer模式](designModal/从vue响应式数据看观察者模式.md)
  - mediator
  - 工厂
- 规范
  - W3C标准
  - ES规范
- 计算机基础
  - ✔ [计算机组成原理](计算机基础/结构-计算机组成原理.md)
  - ✔ [vultr 搭梯子](计算机基础/vultr搭梯子.md)  科学上网，你懂的
  - 操作系统
  - 计算机网络
    - [http 3](计算机基础/网络-http3学习.md)
    - ✔ [http1、http2简介](计算机基础/网络-专题-http.md)
    - ✔ [常见 http 状态码、解释及解决方案](计算机基础/网络-httpCode.md)
    - ✔ [七层协议](计算机网络/网络-七层协议.md)
    - ✔ [网络抓包](计算机网络/网络-抓包.md) wireshark
    - ✔ [nginx 与 反向代理](other/nginx配置介绍.md)
  - 数据结构与算法
    - ✔ [冒泡排序](计算机网络/算法-冒泡排序最优.md)
- 技术方向
  - [webGL](webGL/入门.md): 3D
  - [svg](html/svg入门.md) svg 入门学习
  - canvas2d: 2D
  - webRTC: 实时通信技术
  - docker基础: 容器技术
  - [webAssembly](webAssembly/webAssembly.md): 提升项目运行效率，能在浏览器中跑的另一种语言
  - flutter: 移动应用开发，替代 android ios
  - GraphQL: vs restful
- 用户体验
  - [字体优化](用户体验/字体优化.md)
- 人工智能
  - [人工智能入门](人工智能/人工智能入门.md)
  - [python入门](人工智能/python入门.md)
- 示例 demo
  - 智能提示组件: 在 textarea 输入时，基于 react + getBoundingClietRect + element.selectionStart 实现的智能提示

> 注：没有链接的表示待发展、学习的技术

## 运营

目标 + 决策 + 资源配置

目标：清晰明确的目标，知道带来的收益，目标倒推、精细拆解、环环相接  
决策：决定下一刻需要立即做的事情，不做哪些事情  
资源配置：老板给的资源合理利用
