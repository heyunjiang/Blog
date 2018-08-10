# typescript

time: 2018.8.09

一直都没有怎么去学习 typescript ，但是今天阅读 antd 源码的时候，发现它是用 ts 写的，大部分源码都能看懂，但是它的一些语法不是很懂，比如 `export default class Button extends React.Component<ButtonProps, any>` ，它尾巴上的 `<ButtonProps, any>` 是什么，是 React.Component 自带可以这样子写的吗，还是 ts 赋予的？

目录

1. typescript 简介
2. typescript 基本语法
3. jsx

## 1 typescript 简介

ts 是 js 类型的超集，可以编译成纯 js

存在原因：

1. 存在强类型语言的某些特征，比如 static 、 interface 等，方便后端转前端人员使用

## 2 typescript 基本语法

1. 扩展名： `.ts`
2. 编译器： `tsc greeter.ts`
3. 函数参数类型限定： `function greeter(person: string)` ，可用类型： string 、自定义接口对象原型类型、any、boolean、number、`Array<number>`、void、null、undefined
4. 接口： `interface Person {}` 定义接口对象，使用不需要 implements ，只需要包含接口结构就行，例如函数参数类型限定
5. 类： `class` ，构造函数 `constructor` ，如果在构造函数的参数使用 `public` 关键字，等于创建了同名的类成员变量，可以直接通过类的实例 + `.` 方式访问
6. 类型断言：`let strLength: number = (<string>someValue).length;` 或者 `let strLength: number = (someValue as string).length;`

## 3 jsx

在 typescript 实现的 jsx 命名为 `tsx`

支持3种模式配置

1. `preserve`: 保留 jsx ，只转换 ts 特有的一些语法，用以后期的转换操作，输出 `.jsx`
2. `react`: 生成 `React.createElement` ，直接转换，输出 `.js`
3. `react-native`: 保留 jsx ，只转换 ts 特有的一些语法，用以后期的转换操作，输出 `.js`

注意

1. 在 tsx 中禁止使用尖括号来表示类型断言 `let foo = <foo>bar`，应该使用 `let foo = bar as foo`
2. 同时使用 jsx 和 react，应该使用 react 类型定义(类似类型断言)。

比如

```tsx
interface Props {
  foo: string;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return <span>{this.props.foo}</span>
  }
}

<MyComponent foo="bar" />; // 正确
<MyComponent foo={0} />; // 错误
```

这里解释了最开始提出的问题，React.Component 的尾巴上的 `<Props, {}>` 这个是什么。原来这个是它的类型定义，是typescript约定的，不是 react 的
