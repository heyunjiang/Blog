# vue-cli

time: 2019.6.7  
author: heyunjiang

## 1 背景

之前做vue项目，一些是自己一点一点配，但是是简单小项目，一些是直接在别人项目上进行修改。  
同 react 不同，vue-cli 等生态都是 vue 官方团队在维护，许多项目的构建都是通过 vue-cli 工具来实现，并且最近这个项目采用了 vue-cli 3 的一些功能，构建的项目采用的是 vue-cli 的插件方式实现，这个插件自己随时可以修改，在创建的时候再去动态拿取，有点超出自己的想象。之前自己也做过脚手架，但是构建的项目内容都是封装好在脚手架内部的，参考 roadhog 实现的。所以对于 vue-cli 插件功能，自己有必要学习一下 vue-cli 的功能

## 2 vue-cli 常用功能总结

1. 基于 @vue/cli 搭建交互式的项目脚手架 (what?还有这种操作，用脚手架构建脚手架，此刻 @vue/cli 已经不只是一个脚手架了)
2. 快速开始零配置原型开发：需要使用 `npm install -g @vue/cli-service-global`，用于快速查看一个 vue 组件的样子，不用再去搭建开发环境，相当于把开发环境搞成了全局配置命令了

构成

1. @vue/cli：终端脚手架，用于构建新的脚手架、项目、管理项目，暴露 `vue create <app>` 命令
2. @vue/cli-service：开发环境依赖包，包含在 `@vue/cli` 创建的项目中，用于加载其他 cli 插件、启动项目、内部命令，暴露 `vue-cli-service serve` 命令
3. @vue/cli-plugin-：在运行 `@vue/cli-service` 命令时，自动解析并加载定义在 package.json 中的插件

### 2.1 快速原型开发

`vue serve MyComponent.vue`

### 2.2 插件

插件实现的功能

1. cli 插件：修改内部的 webpack 设置，添加 npm 包
2. service 插件：向 vue-cli-serviece 注入命令，在被 `@vue/cli-service` 初始化时加载的模块，也就是执行执行 service 命令的时候会被加载

### 2.3 preset

预设配置，实现的功能

1. 减少用户选择的操作：在 @vue/cli create 项目的时候，需要选取很多配置

## 参考文档

[@vue/cli 官方文档](https://cli.vuejs.org/zh/guide/#cli)

## 文档编写思路

time: 2019.6.7  
思路：本期是快速阅读文档，用以解决 preset 原理问题，如何编写插件 
