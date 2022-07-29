# 项目经验总结

time: 2022-05-24 10:45:53  
author: heyunjiang

## 背景

最近使用 vite2.8 + vue3.2 + ts4.5 + router + pinia + elementui + axios + koa 做了一套系统，这里对使用到的技术点做一个总结

## 1 vite

1. 基础配置：`vite.config.ts`
2. 配置 alias 需要搭配 tsconfig 的 compilerOptions.paths 一起
3. 中间件：transform 解决 iconfont svg + symbol 默认携带 fill 问题；解决动态组件使用 route.path 导致 treeShaking 丢失问题，使用 vue3.compiler.compileScript 编译获取 script 信息
4. vite dev 构建原理解析：vue.compiler + esbuild + esm
5. public 目录默认会拷贝

待完善点  
1. transform 中间件除了返回 code，可以返回 ast 吗？

## 2 vue3

1. globalProperties 挂载全局属性
2. setup 快捷语法糖及实现原理
3. 抽离通用 composables ，实现组合式 api 使用
4. 内部 api 使用：ref, reactive, computed, watch, defineProps, defineEmits...
5. vue3 组件渲染流程：createElement 生成 vnode, patch 渲染 mountComponent
6. vue3 响应式原理：ref, reactive, proxy, deps, effect, track, trigger
7. v-for renderList 渲染原理
8. 编码规范
9. v-bind 在 css 中使用 js 变量
10. slot 嵌套
11. v-bind="attrs"

待完善点  
1. 通读官网文档，补漏学习

## 3 ts

1. tsconfig.compilerOptions 配置 baseUrl + paths 实现 alias 语法检查
2. esbuild 编译 ts ，不做 type check
3. interface 声明在组件内部，使用 import type 引入
4. 普通类型： string, number, boolean, Date, File, any...
5. 泛型：`Ref<tableItems[]>` 声明，尖括号内可以使用 `typeof component` 读取组件类型
6. interface 剩余参数定义：[propName: string]: any

待提升点  
1. 全局声明如何实现？
2. declare module 之类自己需要手动操作

## 4 pinia

1. defineStore 定义一个 esm 共享变量
2. useCustomStore 读取响应式数据
3. createPinia 主要是挂载 $store 对象到 globalProperties 对象上，并且 provide 对象挂载到 app 对象上
4. useStore 同 useRoute 一样，内部使用 inject 读取当前组件相关联的 app 对象上 provide 数据
5. 直接同 ref 更新数据一样，即可实现响应式

## 其他总结

1. 使用 map 定义数据结构，表现比 obj 更丰富，并且保证了渲染顺序
2. esm 可以全局共享状态，编译成 es5 体现为全局模块或全局变量
3. svg 通用：img + svg、svg + symbol + use 二种模式
4. 百分比：margin、padding基于父元素宽度，translate 基于自身
5. css 变量：使用 var + -- 声明
