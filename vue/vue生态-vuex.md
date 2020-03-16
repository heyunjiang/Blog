# vuex

time: 2019.6.7  
author: heyunjiang

## 背景

最近在使用 vuex ，这里也需要总结一下 vuex 的相关知识点

## 1 基本使用

通过在入口文件中创建一个 store 对象

``` javascript
const store = new Vuex.Store(storeConfig);
sync(store, router)();

new Vue({
    router,
    store
    ...
})
```

这里是让每个非动态生成的组件，都可以使用到一个公用的 store 对象，可以访问 store 对象的属性和方法；  
如果是动态生成的组件，即通过 `new Vue()` 生成一个组件，需要在配置中传入 store 对象

1. state
2. mutation 更新 state
3. action 搞异步事件处理并更新 state
4. modules 可以拆成多个 modules ，并且允许 action 方法同名，会按顺序执行

同 vue-router，vuex 的实现原理也是作为 vue 插件来实现

## 2 问题

1. vuex 中的数据是怎么实现响应式的？是通过 Vue.set() 来实现的吗？ - 是的，通过注册响应式数据到一个空的 vue 实例对象上，在每个组件内部使用 store 数据时，则会被收集到依赖，将数据对应的 dep 对象与组件的 watcher 绑定，如果 store 数据变化，则将组件 watcher 加入到 watcher 更新队列，重新生成对应组件的 vnode 并渲染
2. 通过 mutation 来更新 store，是为来追踪哪些数据变化呢？ - 如果有使用插件 或者 subscribe 来 mutation 的变化，可以在 mutation 执行之后，触发回掉事件。
