# template vs jsx.md

time: 2021-05-06 16:02:31  
author: heyunjiang

## 1 jsx 基本知识

1. 使用 @vue/babel-preset-jsx 解析 jsx
2. 组件通常大驼峰式写法，也支持 kebe-case
3. 三种使用方式如下

使用方式  
1. 在 render 中返回

```javascript
render() {
  return (
    <MyComponent>
      <header slot="header">header</header>
      <footer slot="footer">footer</footer>
    </MyComponent>
  )
}
```

2. 作为独立函数式组件，使用箭头函数: `export default ({ props }) => <p>hello {props.message}</p>`
3. 作为变量声明，使用箭头函数: `const HelloWorld = ({ props }) => <p>hello {props.message}</p>`

## 2 问题

1. jsx 工作原理
2. 什么场景使用 jsx
3. jsx 和 template 区别

## 3 jsx 和 template 区别

1. 组件编码位置不同：jsx 是写在 render 函数中，template 作为独立模块，最终都是编译成 createElement 函数
2. template 特定语法：template 可以使用 v-for, jsx 是不支持的；@click.native, v-model, slot, jsx 写法不同，jsx支持 vOn:click_stop_prevent、vModel、domPropsInnerHTML
3. 变量括号：template 支持双括号，jsx 单括号

## 4 jsx 使用场景

1. 在 render 中编写 createElement 函数过多，jsx 能减少编码工作量

## 5 解析原理

## 参考文章

[vue jsx](https://github.com/vuejs/jsx#installation)
