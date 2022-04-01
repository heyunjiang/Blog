# vue3组件编码规范

time: 2022-04-01 19:12:40  
author: heyunjiang

## 规范条例

组件命名  
1. 使用大驼峰
2. 单例组件使用 The 开头，比如 `TheHeader`
3. 与父组件耦合的子组件，命名应当以父组件名作为前缀
4. 多单词

1. 没有内容的组件使用，保持组件自闭合，比如 `<MyComponent />`
2. template 中组件使用优先大驼峰，其次 kebab-case
3. jsx 中必须使用大驼峰
4. 组件名称全写，不缩写
5. 声明 props 使用小驼峰，在 template 绑定使用时用 kebab-case
6. 多个 attribute 应该换行
7. sfc 组件内部顺序：style 放最后，script 和 template 全局都保持一致

元素 attribute 顺序：  
1. is
2. v-for
3. v-if, v-else, v-show, v-cloak
4. v-pre, v-once
5. id
6. ref, key
7. v-model
8. 其他 attribute
9. v-on, @ 绑定事件
10. v-html, v-text
## 参考文章

[vue3 风格指南](https://v3.cn.vuejs.org/style-guide/)
