# vue3 响应式系统

time: 2021.3.9  
author: heyunjiang

## 背景

归纳 vue3 响应式原理，同 vue2 的差异。  
目前已知：vue3 使用 proxy 代替 vue2 的 defineProperty，但是 vue2 的 dep + watcher 对象是被什么代替了呢？  
并且，reactive 和 ref 是如何通知更新组件的，收集当前组件 vm 时机

## 1 响应式流程

## 参考文章
