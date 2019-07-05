# vue-cli

time: 2019.6.7 - 2019.6.19  
author: heyunjiang

目录：  
[1 背景](#1-背景)  
[2 vue-cli 常用功能总结](#2-vue-cli-常用功能总结)  
&nbsp;&nbsp;[2.1 快速原型开发](#2.1-快速原型开发)  
&nbsp;&nbsp;[2.2 插件](#2.2-插件)  
&nbsp;&nbsp;[2.3 构建项目](#2.3-构建项目)  
[3 cli常见知识点归纳](#3-cli常见知识点归纳)  
&nbsp;&nbsp;[3.1 vue create --help 支持的命令集合](#3.1-vue-create---help-支持的命令集合)  
&nbsp;&nbsp;[3.2 预设配置](#3.2-预设配置)  
[4 vue.config.js](#4-vue.config.js)  

## 1 背景

之前做vue项目，一些是自己一点一点配，但是是简单小项目，一些是直接在别人项目上进行修改。  
同 react 不同，vue-cli 等生态都是 vue 官方团队在维护，许多项目的构建都是通过 vue-cli 工具来实现，并且最近这个项目采用了 vue-cli 3 的一些功能，构建的项目采用的是 vue-cli 的插件方式实现，这个插件自己随时可以修改，在创建的时候再去动态拿取，有点超出自己的想象。之前自己也做过脚手架，但是构建的项目内容都是封装好在脚手架内部的，参考 roadhog 实现的。所以对于 vue-cli 插件功能，自己有必要学习一下 vue-cli 的功能

那么，学习总结 vue-cli 有什么用呢？  
1. 基本知识，学会了才能更好的开展业务
2. 解决问题套路：使用 vue-cli 去搭一个项目，采用 preset 快速配置

## 2 vue-cli 常用功能总结

1. 基于 @vue/cli 搭建交互式的项目脚手架 (what?还有这种操作，用脚手架构建脚手架，此刻 @vue/cli 已经不只是一个脚手架了)
2. 快速开始零配置原型开发：需要使用 `npm install -g @vue/cli-service-global`，用于快速查看一个 vue 组件的样子，不用再去搭建开发环境，相当于把开发环境搞成了全局配置命令了
3. 一个运行时依赖 - `@vue/cli-service`，用于启动 webpack 服务、可通过 vue.config.js 扩展配置、插件拓展配置
4. 一套丰富的插件集合：`@vue/cli-plugin-eslint` 等插件
5. 图形化界面

> 总结：vue-cli 就是为了方便快速的构建项目

构成

1. @vue/cli：终端脚手架，用于构建新的脚手架、项目、管理项目，暴露 `vue create <app>` 命令
2. @vue/cli-service：开发环境依赖包，包含在 `@vue/cli` 创建的项目中，用于加载其他 cli 插件、启动项目、内部命令，暴露 `vue-cli-service serve` 命令
3. @vue/cli-plugin-：在运行 `@vue/cli-service` 命令时，自动解析并加载定义在 package.json 中的插件

### 2.1 快速原型开发

`vue serve MyComponent.vue`，需要全局安装 `@vue/cli-server-global`，主要是产品设计时用的

### 2.2 插件

插件作为 vue-cli 脚手架的特性功能，配置动态加载，即在 `vue create` 的时候再去拉取你的配置，与 `mww new` 实现的不同，mm-cli 只是预置了项目目录结构在脚手架内，每次更新需要更新脚手架的版本

插件实现的功能

1. Creator：在 `vue create app` 时创建了一个 Creator 类，负责偏好对话、调用 generator 和安装依赖
2. service：向 vue-cli-serviece 注入命令，在被 `@vue/cli-service` 初始化时加载的模块，也就是执行执行 service 命令的时候会被加载。负责管理内部 webpack 配置、暴露服务和构建项目的命令

#### 2.2.1 cli 插件的基本结构

一个 cli 插件包含一个 service 插件作为主要导出，还可以配置 generator 和 prompts

```md
.
├── README.md
├── generator.js  # generator (可选)
├── prompts.js    # prompt 文件 (可选)
├── index.js      # service 插件
└── package.json
```

#### 2.2.2 service 插件主要功能

service 插件，指的是 cli 插件的 index.js 入口文件，前面提到它是在每次执行 `vue-cli-service <command>` 命令时调用的，那么它在运行本地项目时，可以做哪些事情呢？

该 index 模块导出函数为 `module.exports = (api, projectOptions) => {}` ，该 api 主要支持 3 个方法：`chainWebpack`、`configureWebpack`、`registerCommand`

1. **修改 webpack 配置**：可以通过 `api.chainWebpack(webpackConfig => {})` 或者 `api.configureWebpack(webpackConfig => {})` 来修改 webpack 配置
2. **注册新命令**：`api.registerCommand('test', args => {})` 来注册命令 `vue-cli-service test`(通常需要为注册的命令指定运行模式，是 production or developement)

问题：  
1. 该 api 是否就只支持上面3个方法？：不是，还支持在 resolveWebpackConfig 方法，直接返回解析好的 webpack 配置；支持 resolveChainableWebpackConfig 方法，返回链式配置
2. 什么是链式配置？即 chainWebpack 与 configureWebpack 有什么区别？：配置方式差别，具体可以查看 [webpack-chain](https://github.com/neutrinojs/webpack-chain)
3. 模块第二个参数 projectOptions 用来干嘛的？：是一个对象，包含 vue.config.js 内指定的项目本地选项，或者是 package.json 中的 vue 字段

#### 2.2.3 generator

既然 service 用于修改 webpack 配置和注册新的 vue-cli-service 命令，那么 generator 又用来干嘛呢？

generator 在如下2种方式被调用

1. preset : **项目创建时**，时通过 preset 方式去调用 cli 插件，此刻就会调用 generator(主要使用方式)
2. 插件在项目创建好之后通过 vue invoke 独立调用时被安装 (没有用过，所以体会不到)

知道了 generator 在什么情况下调用，那么来看看它起什么作用呢？  
同样 generator 也是一个模块，导出一个函数，支持3个函数参数：generatorAPI 实例、该插件 generator 配置选项、整个 preset 文件  
既然是在创建项目时调用，那么也就是在 install 之前，我们可以做如下事情

1. **修改 package.json 字段** : 通过 `api.extendPackage({})` 修改配置
2. **渲染 template 文件** : 通过 `api.render('./template)` 来渲染所有文件，是采用 EJS 渲染

问题： 为什么需要预渲染呢？那么 template 里面文件该怎么写呢？  
答：既然需要渲染，那么意味着我们编写的是模板，则需要对应模板的一些语法

模板语法

1. 使用 `YAML` 前置元信息，继承并替换已有模板文件的一部分
2. 常规还是写 vue 的模板就行

#### 2.2.4 使用插件

1. 向已有项目增加插件：`vue add @vue/cli-plugin-eslint`，可以使用 `vue invoke @vue/cli-plugin-eslint` 命令增加插件，该命令跳过安装过程，接受和 vue add 相同的参数
2. 新建项目时使用插件：在 preset 内部指定插件 npm 包
3. 使用其他项目的已经安装好了的插件：在 package.json 中设置 `vuePlugins.resolveFrom` 可以引用其他项目的插件
4. 使用本地的插件：`vuePlugins.service`

```json
// 使用插件 package.json
{
    "vuePlugins": {
        "resolveFrom": ".config", // 使用其他项目包含 package.json 的文件夹(service 插件，非 generator 插件)
        "service": ["mu-commands.js"] // 使用本地一个插件(service 插件，非 generator 插件)
    }
}
```

问题：如果想在 vue create 项目的时候，使用本地的插件怎么做？上面说到的使用本地插件，是指 service 插件，我需要的是 generator 和 prompts 这2个功能快速处理

### 2.2.5 prompts

前面知道 servece, generator 的用法，那么 prompts 用来干嘛呢？

prompts 是用于插件激活时的对话，2种场景，分为项目创建时、vue invoke 时

由于我们编写的插件时第三方插件，不属于 vue 内置插件(@vue/vue-cli-plugin-eslint 等才是)，所以 prompts 中要使用数组，下面归纳一下实现过程，以 vue-cli-plugin-applo 为例

```javascript
// prompts
module.exports = [
  {
    type: 'input',
    name: 'apolloEngineKey',
    message: 'API Key (create one at https://engine.apollographql.com):',
    validate: input => !!input
  }
]

// generator
module.exports = (api, options, rootOptions) => {
    console.log(options.apolloEngineKey)
}
```

### 2.3 构建项目

使用 `vue create` 构建项目，可以选用指定的本地或远程 preset

## 3 cli常见知识点归纳

### 3.1 vue create --help 支持的命令集合

1. -p, --preset：忽略提示符，并使用已经保存的或者远程的预设选项 preset，远程预设支持 repo, gitlab, bitbucket 3种方式，具体 demo 看官网
2. -d, --default：忽略提示符，并使用默认预设选项
3. -i, --inlinePreset：忽略提示符，并使用内联的 json 字符串预设选项
4. -m, --packageManager：在安装依赖时使用指定的 npm 客户端
5. -r, --registry：在安装依赖时使用指定的 npm registry
6. -g, --git：强制跳过 git 初始化，并设置可选的指定初始化提交信息 (因为 cli 创建好的项目默认就是 git init 创建的一个git仓库)
7. -n, --no-git：跳过 git 初始化
8. -f, --force：覆盖目标目录可能存在的配置(覆盖已有目录？？？)
9. -c, --clone：使用 git clone 获取远程预设选项
10. -x, --proxy：使用指定的代理创建项目(怎么玩？)
11. -b, --bare：创建项目时省略默认组件中的新手指导信息 
12. -h, --help：输出使用帮助信息

### 3.2 预设配置

也就是 preset 文件，命名 `preset.json`

```json
{
  "useConfigFiles": true, // 
  "router": true, // 使用 vue-router
  "vuex": true, // 使用 vuex
  "cssPreprocessor": "sass", // 使用 css 预处理器 sass
  "plugins": {
    "@vue/cli-plugin-babel": {},
    "@vue/cli-plugin-eslint": {
      "config": "airbnb",
      "lintOn": ["save", "commit"]
    }
  },
  "configs": {} // 这个用来干嘛？官网说是会和 useConfigFiles 的值合并到 package.json 或相应的配置文件中
}
```

预置配置的插件管理

1. 指定版本： `version: ^3.0.0`
2. 允许插件的命令提示： `prompts: true`，注意，这个和插件的 prompts.js 文件功能不同，prompts.js 用于控制 vue-cli 的创建项目时整体的会话

## 4 vue.config.js

该文件存在于根目录，用于被 `@vue/cli-service` 加载。它是一个项目配置文件，有如下作用，归纳：  
1. 修改 webpack 一些常用配置 (也可以通过插件 index.js 来修改，但是插件的使用建议是增加或删除配置，而此处是修改配置，2者用处不同)
2. vue 是否支持 template ，即使用包含运行时编译器的 vue 构建版本
3. nodemodules 可选部分支持 babel 编译
4. integrity 安全支持
5. pluginOptions 插件选项支持，向第三方插件传递选项

## 参考文档

[@vue/cli 官方文档](https://cli.vuejs.org/zh/guide/#cli)

## 文档编写思路

time: 2019.6.7  
思路：本期是快速阅读文档，用以解决 preset 原理问题，如何编写插件 
