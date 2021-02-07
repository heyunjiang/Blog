# vue-property-decorator

time: 2021.2.7  
author: heyunjiang

## 背景

目前还没有正式写过 vue3 的项目，但是目前团队中有个项目使用到了 vue-property-decorator 这个库，属于对 vue decorator 的实现，这里也对 vue3 和 vue2 的理解做个对比，也算是对 vue 组件化理解深入

## 1 示例写法

```javascript
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class YourComponent extends Vue {
  @Prop(Number) readonly propA: number | undefined
  @Prop({ default: 'default value' }) readonly propB!: string
  @Prop([String, Boolean]) readonly propC: string | boolean | undefined
}
```

## 2 疑问

1. 这里是 vue2 的写法，vue2 是基于 function 来实现的，这里怎么是 class？
2. decorator 在这里是如何工作的，目前不是还没有进入标准吗？
