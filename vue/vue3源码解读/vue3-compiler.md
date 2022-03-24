# compiler

time: 2022-03-24 20:13:24  
author: heyunjiang

## 背景

最近想做 webpack loader ast 类似的分析处理 template 代码，场景是在 vue3 component.is 动态组件中，使用 script setup 时是直接使用的变量
```javascript
<component :is="$route.path.replace('/', '')" />
<script setup>
import A from 'A.vue'
</script>
```
此刻的组件 A 就不能被使用，应该改成如下写法
```javascript
<component :is="danymicComponents[$route.path.replace('/', '')]" />
<script setup>
import A from 'A.vue'
const danymicComponents = {
  A
}
</script>
```

想做的：不想声明额外的 danymicComponents 对象，考虑到 setup 中引入的组件，是挂载在 this.$setup 对象上，如果直接写成如下格式能识别就好了
```javascript
<component :is="$setup[$route.path.replace('/', '')]" />
<script setup>
import A from 'A.vue'
</script>
```

但是 `@vue/compiler-sfc` 编译的结果却是如下
```javascript
<component :is="_ctx.$setup[$route.path.replace('/', '')]" />
```

现在就想做一个判断，如果代码中直接写了 $setup，就不再编译到 _ctx 上了

## 1 compiler 基础知识

## 参考文章
