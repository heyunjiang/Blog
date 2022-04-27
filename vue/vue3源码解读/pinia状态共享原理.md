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

## store 存储位置

## 参考文章
