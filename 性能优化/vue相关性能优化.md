# vue 相关性能优化

time: 2021-05-06 15:51:42  
author: heyunjiang

## 背景

这里总结 vue 使用相关的性能优化，包括如下方面  
1. 构建时：vue extenals，vue3 按需加载
2. 加载时：使用不包含 compile 版本
3. 运行时：使用函数式组件等

## 1 构建时

## 2 加载时

## 3 运行时

### 3.1 函数式组件

[vue深入 - 组件化](vue/vue高能/函数式组件.md) vue 组件化原理，函数式组件和普通组件的对比

对于没有自身状态的组件，可以改为函数式组件。`router-view` 就是典型的函数式组件

### 3.2 keep-alive 优化

[vue深入 - keepAlive组件原理](vue/vue源码解读/源码解读-keepAlive.md) 源码解读-keepAlive，来看看它的缓存实现原理

通过 include, exclude, max 合理控制需要缓存的组件

### 3.3 动态组件和异步组件

### 3.4 善用 transition 动画组件

## 参考文章
