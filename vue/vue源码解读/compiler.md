# 编译

time: 2019.11.11  
author: heyunjiang

## 说明

> 在 vue 生成虚拟节点之前，我们先来看看 vue 的模板编译，即我们写的模板是怎么转换成 vue 的 `createElement` 方法的。

从我们编写 template 到生成真实 dom，中间有一个过程，即把模板编译成 createElement 函数，这个过程叫做编译。  
虽然我们可以直接写 jsx，但是它远没有写模板来的方便，vue 为 template 提供了一些便捷写法，包括指令、特定标签等。

vue 提供了2种版本的源码

1. runtime + compiler：可以在运行时编译
2. runtime：需要通过 vue-loader 预编译，转为 createElement 函数

编译的源码路径： `import { compileToFunctions } from './compiler/index'`
