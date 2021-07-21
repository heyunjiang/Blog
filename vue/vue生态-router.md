# vue router

time: 2019.6.5  
update: 2020.3.16  
author: heyunjiang

## 1 问题

1. 动态路由是什么？和静态路由的优劣比较如何？
2. 路由懒加载怎样才是标准写法？
3. 路由守卫是什么？分哪几种类型？什么时候才起作用？
4. 路由插件提供了哪些能力？
5. 路由如何动态注册，原理是啥？
6. 路由跳转时，同时传 name 和 path，谁的优先级高？name，在 vue-router matcher 源码中有先判断 name。我们在配置路由时，name 一定要全局唯一

## 2 路由基本知识

> 完整学习一遍之后，再来和介绍页的功能对比，看自己的掌握程度

1. vue-router 是深度集成在 vue 内部的，当路径变化的时候，控制组件的展示与否。
2. vue 组件是一个对象，该对象有3个属性：template, script, style
3. router 是一个对象，配置是一个数组
4. 组件内部访问路由信息：this.$route。使用 vuex-router-sync 后可以访问 store.state.route
5. 路由嵌套：`<router-view>` 作为全局组件，可以用在组件内部，用于匹配路由配置的 `children` 配置
6. 路由组合：`<router-view name="a">`，除了嵌套，也可以组合成兄弟元素。需要在配置中 component -> components
7. 路由导航组件：`<router-link>` 总共就这2个全局组件
8. 路由是作为 vue 插件实现
9. 路由内部是通过监听浏览器历史状态的变化来更新路由，hash、history、abstract 模式，采用 popState 和 hashChange 事件支持

## 3 路由配置

> 采用先配置优先级最高匹配原则

```javascript
const route = [{
    path: '/user/:userId',
    name: 'user',
    component: User,
    meta,
    children
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

使用 `props` 字段传参，比如 `{ path: '/user/:id', component: User, props: {} }`，在路由组件内部使用 props 接收。  
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

next 方法  
1. 禁止跳转使用 next(false)
2. 继续 next()
3. 修改路由 next({to: xxx})

路由守卫只在路由组件内起效，在非路由组件上不起效

问题：  
1. 全局守卫和内部守卫谁先执行？全局 beforeEach -> 路由配置 beforeEnter -> 组件内部 beforeRouteEnter
2. beforeEach, beforeResolve 2者有什么区别？区别在于 beforeResolve 是在所有内部守卫解析之后及异步路由组件解析之后调用，而 beforeEach 是内部守卫解析之前调用？
3. afterEach 需要调用 next 吗？不需要，也不能

## 6 动态增加路由

`router.addRoute(parentName: string, route: RouteConfig)`

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

1. webpack 会处理 es6 提供的 import 引入的组件，会拆分成独立文件，然后在需要使用到的时候才会远程加载，从而减少文件体积，通过 runtime.js 实现的功能
2. vue 支持异步组件，后续拿到组件时可以局部注册

## 8 静态路由 vs 动态路由

静态路由：实现配置好，在应用初始化创建 router 对象时传入的配置，后续根据 url 变化渲染加载不同的组件，将组件内部的 `<router-view>` 与 路由配置的 children 匹配  
动态路由：在 react 中，动态路由的概念是没有配置，route 本身作为一个组件，将 route 组件 prop 的 `path` 属性与浏览器 url 的 path 作匹配，成功才显示内容；路由嵌套也是在 route 加载的 component 组件内部再加载一个 route ；vue 还不知道。

总结区别  
1. 配置：静态路由有配置，动态路由没有配置
2. 组件化：动态路由本身就是一个组件，静态路由不是
3. 编写时：静态路由依靠 router-view, 而动态路由则需要在可能渲染到的地方都写上

## 9 hash 模式和 history 模式区别

1. history 需要服务器端做配置，否则刷新前端会 404
2. url 路径展示不同
3. pushState 实现方式差异：hash 内部采用 `window.location['replace', 'assign]` 来更新历史信息，history 采用 html5 的 `pushState | replaceState` 来直接实现
4. history 模式可以不更新 URL 来改变浏览器历史记录信息，而 hash 不能

## 10 关键源码解读

### 10.1 this.$router 及全局组件 router-view、router-link

vue-router 作为 vue 插件

```javascript
export function install (Vue) {
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
}
```

源码解析  
1. 根组件通过读取 $options.router 绑定 this._router 属性，子组件通过访问 this.$parent._routerRoot，同 vuex 一样，大家指向的都是同一个 $options.router 对象
2. vue-router 提供了2个全局组件：RouterView, RouterLink

## 参考文章

[vue router](https://router.vuejs.org/zh/)  
[react-router 4](https://react-router.docschina.org)
