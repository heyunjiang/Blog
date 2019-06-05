# vue router

time: 2019.6.5  
author: heyunjiang

## 1 问题

1. 动态路由是什么？和静态路由的优劣比较如何？
2. 路由懒加载怎样才是标准写法？
3. 路由守卫是什么？分哪几种类型？什么时候才起作用？

## 2 路由基本知识

> 完整学习一边之后，再来和介绍页的功能对比，看自己的掌握程度

1. vue-router 是深度集成在 vue 内部的，当路径变化的时候，控制组件的展示与否。
2. vue 组件是一个对象，该对象有3个属性：template, script, style
3. router 是一个对象，配置是一个数组
4. 组件内部访问路由信息：this.$route。使用 vuex-router-sync 后可以访问 store.state.route
5. 路由嵌套：`<router-view>` 作为全局组件，可以用在组件内部，用于匹配路由配置的 `children` 配置
6. 路由组合：`<router-view name="a">`，除了嵌套，也可以组合成兄弟元素。需要在配置中 component -> components

## 3 路由配置

> 采用先配置优先级最高匹配原则

```javascript
const route = [{
    path: '/user/:userId',
    name: 'user',
    component: User
}]
```

### 3.1 动态路径参数

```javascript
routes: [
    { path: '/user/:id', component: User }
]
```

特点：

1. 使用冒号，真实url `/user/12345678`，在组件内部使用 this.$route.param.id 访问
2. 当参数变化时，可以通过 watch 当前实例的 $route 属性来观察变化，或者通过路由守卫的 `beforeRouteUpdate` 方法实现监听

### 3.2 通配符 *

1. 写在配置列表最后
2. 用于统一错误处理
3. $route.params.pathMatch 参数提供，表示被匹配的部分

### 3.3 路由命名

增加一个 name 参数，路由跳转、匹配时都可以使用 name

### 3.4 路由传参

使用 `props` 字段传参，比如 `{ path: '/user/:id', component: User, props: {} }`，在组件内部使用 props 接收。  
参数类型有：布尔、对象、函数

### 3.5 路由元信息 meta

## 4 路由导航

1. 全局组件 `<router-link>`
2. 实例方法： `this.$router.push`，如果同时存在 path 和 params ，则 params 不生效
3. 替换url不刷新页面： `router.replace(location)`
4. 重定向：在配置中设置 `redirect` 字段
5. 别名：在配置中设置 `alias` 字段

## 5 路由守卫

分为全局守卫、组件内守卫、路由独享的(在路由配置中实现)

1. 全局守卫：beforeEach, beforeResolve, afterEach
2. 路由守卫：beforeEnter
3. 组件内部守卫：beforeRouteEnter, beforeRouteUpdate, beforeRouteLeave

> 在使用路由守卫时，通常要使用 next 方法，如果禁止跳转，则使用 next(false)

路由守卫只在路由组件内起效

## 6 动态增加路由

`router.addRoutes(routes)`

## 7 路由懒加载

这里指的是路由对应的组件懒加载，标准写法

```javascript
const Foo = () => import('./Foo.vue')
const router = new VueRouter({
  routes: [
    { path: '/foo', component: Foo }
  ]
})
```

实现原理：

1. webpack 会处理 es6 提供的 import 引入的组件，会拆分成独立文件，然后在需要使用到的时候才会远程加载，从而减少文件体积
2. vue 支持异步组件，后续拿到组件时可以局部注册

## 参考文章

[vue router](https://router.vuejs.org/zh/)
