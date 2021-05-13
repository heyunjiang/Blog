# vue 整体架构

time: 2021-05-13 15:44:57  
author: heyunjiang

## 背景

最近在学习 keep-alive, component, slot 渲染流程时，又再次回顾了 vue 的完整渲染流程，本次流程包含了 vue 的大部分细节。  
这里就有一个思考：我也算了解了 vue 框架的内部实现原理，满足了自身对于实现原理掌握的要求。自己还有一个要求，能从 vue 项目中学到什么？比如架构实现、典型设计模式使用、另一些亮点库的实现

这里对 vue 整体架构做一个总结

## 1 vue 核心模块概览

vue src 目录下有这几个模块：compiler, core, platform, shared, server, sfc。核心在 core 模块，这里对 core 做个总结

1. instance 模块：是 vue component 核心实现，内部包含了事件、生命周期、状态 state、props 数据等核心实现，在 lifecycle 中提供 mountComponent 函数，实现了与 vdom 的关联
2. vdom 模块：主要是 createElement, createComponent 生成 vnode，patch 渲染 vnode 生成实际 dom
3. observer 模块：响应式核心实现，包含 watcher, Observer, dep 对象实现

注意事项  
1. 在 patch 渲染流程中，对 component vnode 的渲染是走 createComponent 方法，通过 componentVNodeHooks.init 来实例化组件 vm 实例，走完整 component 渲染流程

目前，心中已经对 vue 代码结构及实现，形成了一颗粗糙的树，还有许多其他细节，比如全局 api 实现，vue plugin 实现，compiler 实现等，后续在深入学习 vue3，以及做更复杂功能时，自然能体会到 vue 的更多优点

## 参考文章
