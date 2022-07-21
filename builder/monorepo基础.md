# monorepo

time: 2021-12-29 10:36:47

## 背景

最近在做 vue2, vue3 搭配 webpack5 moduleFederation 实现微前端跨技术栈架构。  
同时又想到 monorepo 跨技术栈实现，特此来学习一下，看看是否能在已有项目中实践

## 1 基础知识

monorepo 特征  
1. 多个有关联的子项目共同管理在一个 workspace 下
2. 共享顶层 node_modules
3. 子项目可独立发布，也可以父项目统一发布
4. 场景：vue3, vite, vue-cli 等基建服务，内部通常存在子项目之间的依赖，比如响应式api、脚手架插件化实现等
5. 实现方案：lerna, npm7+, yarn, ...

开发时的基础知识  
1. workspace 下的项目，在顶层 node_modules 初始化时会被包含进来，作为软链般存在，如果存在 bin 能力，那么也会在 node_modules/.bin 下生成命令入口
2. 

## 参考文章
