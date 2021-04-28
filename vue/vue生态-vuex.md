# vuex

time: 2019.6.7  
author: heyunjiang

## 背景

最近在使用 vuex ，这里也需要总结一下 vuex 的相关知识点

## 1 基本使用

通过在入口文件中创建一个 store 对象

``` javascript
Vue.use(Vuex)
const store = new Vuex.Store(storeConfig);

new Vue({
    store
})
```

这里是让每个非动态生成的组件，都可以使用到一个公用的 store 对象，可以访问 store 对象的属性和方法；  
如果是动态生成的组件，即通过 `new Vue()` 生成一个组件，需要在配置中传入 store 对象

1. state
2. mutation 更新 state
3. action 搞异步事件处理并更新 state
4. modules 可以拆成多个 modules ，并且允许 action 方法同名，会按顺序执行

关键 api  
1. 读取数据：this.$store.state.hello，或者在计算属性中添加 mapState({hello: state => state.hello})
2. 更新数据：this.$store.dispatch('increment')

> mapState 为什么要在计算属性中添加呢？  
> 因为它的参数对象写法，更像是 computed 对象写法；mapState 内部是会去遍历对象并且执行它，返回的是一个结果对象，跟 computed 有什么关系？是因为它的效果同 computed 一样，在 state 数据变化之后，更新它对应的依赖源对象

## 2 问题

1. vuex 中的数据是怎么实现响应式的？是通过 Vue.set() 来实现的吗？ - 是的，通过注册响应式数据到一个空的 vue 实例对象上，在每个组件内部使用 store 数据时，则会被收集到依赖，将数据对应的 dep 对象与组件的 watcher 绑定，如果 store 数据变化，则将组件 watcher 加入到 watcher 更新队列，重新生成对应组件的 vnode 并渲染
2. 通过 mutation 来更新 store，是为来追踪哪些数据变化呢？ - 如果有使用插件 或者 subscribe 来 mutation 的变化，可以在 mutation 执行之后，触发回掉事件。
3. 模块热重载是什么意思？

## 3 关键源码解读

### 3.1 插件挂载 $store 原理

为什么我们能通过 $store 访问到全局状态数据呢？  
在 Vuex 插件中，执行了如下操作

```javascript
export function install (_Vue) {
  Vue = _Vue
  applyMixin(Vue)
}
export default function (Vue) {
  Vue.mixin({ beforeCreate: vuexInit })
  function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
```

源码解读：  
1. 通过 Vue.mixin，为每个子组件注入了 beforeCreate 生命周期方法，挂载 this.$store 属性，所有子组件都指向根组件的 $store 对象
2. 为什么通过 beforeCreate 方法，是因为组件实例化是，initState 等都是在 beforeCreate 之后加载的，所以 vuex 都是遵从同样的设计理念
3. 根组件的 store 是通过 `options.store || options.store()` 来加载

总结归纳：  
1. 每个组件的 $store 属性都指向全局唯一 store 对象，同组件内部 data 数据一样，提供了第二个数据源

### 3.2 vuex 响应式数据原理

```javascript
export class Store {
  constructor (options = {}) {
    this._modules = new ModuleCollection(options)
    const state = this._modules.root.state
    resetStoreVM(this, state)
  }

  get state () {
    return this._vm._data.$$state
  }

  function resetStoreVM (store, state, hot) {
    const oldVm = store._vm

    // 1. 将 getters 转换为 computed
    store.getters = {}
    store._makeLocalGettersCache = Object.create(null)
    const wrappedGetters = store._wrappedGetters
    const computed = {}
    forEachValue(wrappedGetters, (fn, key) => {
      computed[key] = partial(fn, store)
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key],
        enumerable: true // for local getters
      })
    })

    const silent = Vue.config.silent
    Vue.config.silent = true
    // 2. 将 state 挂载到一个新的 vue 实例 data 上，实现响应式数据
    store._vm = new Vue({
      data: {
        $$state: state
      },
      computed
    })
    Vue.config.silent = silent
  }
}
```

总结归纳：  
1. 全局 store 是挂载在根组件 options.store 上
2. 所有子组件都实现了 $store 访问 root.$options.store 对象
3. 全局 state 是通过作为一个空的 vue 实例 data 属性，实现响应式
4. 整体使用了 vue 插件实现，包括：Vue.mixin 注入生命周期方法，vue 实例 data 响应式数据
