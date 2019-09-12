# vuex

time: 2019.6.7  
author: heyunjiang

## 背景

最近在使用 vuex ，这里也需要总结一下 vuex 的相关知识点

## 基本使用

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
