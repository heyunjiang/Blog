# pinia状态共享原理

time: 2022-04-27 16:45:43  
author: heyunjiang

## 背景

最近在做 vue3 项目，使用到了 pinia 做全局状态共享，如下操作步骤  
1. 定义 store  
```javascript
import { defineStore } from 'pinia'
import { reactive } from 'vue'
export const useUploadStore = defineStore('upload', () => {
  const uploading = reactive({})
  return {
    uploading
  }
})
```
2. 初始化
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
const app = createApp(App)
app.use(createPinia())
```
3. 更改 state  
```javascript
import { storeToRefs } from 'pinia'
import { useUploadStore } from '@/store/upload'
const { uploading } = storeToRefs(useUploadStore())
uploading.value.hello = 'world'
```
4. 读取 state  
```javascript
<div>{{uploadingKeys.length}}</div>
import { useUploadStore } from '@/store/upload'
const { uploading } = storeToRefs(useUploadStore())
const uploadingKeys = computed(() => Object.keys(uploading.value))
```

相较于 vuex，pinia 有如下优点  
1. 整体使用 composition api 风格，按需使用全局数据
2. 定义和更新 store 更加简单，全面利用 proxy api

但是也产生了疑问  
1. vue 定义的 composition api 在引用时，会生成每个组件自身的状态，而 pinia 在引用时却是大家共享的状态，怎么实现的？
2. vuex 是通过定义在根组件(store 是绑定在根组件上，需要 Vue.use(vuex) + new Vue({store}))上的 $store 去访问 store 数据，每个组件通过递归向上查找; vue-router(vue2) 也是一样，保存在根组件上的引用，每个组件通过递归向上查找；  
pinia 是需要手动 import，pinia store 存储在什么位置呢？

> router 对象是存储在内存中，通过 $router 或 useRouter 访问

## pinia store 读取原理

同 router 一样，核心使用 vue3 provide + inject api 实现  
1. provide：在 `app.use(createPinia())` 时创建了 pinia 对象，app 通过 provide 保存了对该对象的引用 `app.provide(piniaSymbol, pinia)`
2. inject: 在组件中使用了通过 `defineStore` 定义好的 store，在 setup 执行过程中会调用 store 的初始化流程: 
执行 `inject(piniaSymbol)` 加载 pinia 对象和 `createSetupStore(id, setup, options, pinia)` 初始化 store

provide/inject 原理是使用 appContext.provide 对象保存状态数据，共享响应式对象(ref, reactive) 时，子组件获取就是响应式的

## 归纳总结

1. pinia 和 router 都是在 app.use 时将 `createRouter | createPinia` 生成的对象绑定到 app 上，使用 app.provide + useRouter | useStore 提供 composition api 使用方式，
同时也提供了 app.config.globalProperties 绑定全局 $pinia or $router 的 vue option api 使用
2. 一个 app 对象只使用一个 pinia | router 对象
3. 核心还是使用的 provide + inject 实现，vue 内部使用的 esm + 闭包提供全局对象快速访问与共享
4. 修改 ref.value 就可以触发相应组件的更新渲染，这一点同 setup 中定义响应式数据状态变更是一致的，都是通过 proxy + track + trigger 实现的响应式
