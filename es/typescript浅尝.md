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
4. 接口： `interface Person {}` 定义接口对象，使用不需要 implements ，由 class、object 去实现
5. 类： `class` ，构造函数 `constructor` ，如果在构造函数的参数使用 `public` 关键字，等于创建了同名的类成员变量，可以直接通过类的实例 + `.` 方式访问
6. 类型断言：使用 `as` 关键字，可用于接口、类的断言，用以解决 ts 报错的不确定性问题。`let strLength: number = (someValue as string).length;`

类型判断  
1. 变量：采用冒号 `:`，例如 `let myFavoriteNumber: string | number;`
2. 数组：`let hello: number[]`, 泛型 `let hello: Array<number>`，类数组 `let hello: IArguments = arguments`

### 2.1 接口要点

1. 使用 `interface` 关键字定义，内部数据项要求实例严格保持一致
2. 定义对象要求大写开头，比如 `interface Person {}`
3. 分号结尾：接口属性不同于对象逗号结尾，接口是分号 `;` 结尾
4. 可选属性：在属性 key 后面加 `?`
5. 任意属性：使用 propName 关键字，`[propName: string]: string | number;`；它会限制所有接口属性类型；可以添加任意多个属性
6. 只读属性：使用 readonly 关键字定义，`readonly id: number;`
7. 声明数组：`[index: numnber]: number`

### 2.2 函数要点

1. 参数个数限定：指定的参数不可多，也不可少，要求严格匹配
2. 可选参数：同接口属性，使用 `?` 定义，但是函数可选参数之后不能再有其他非可选参数了
3. 剩余参数：`...items: any[]`

### 2.3 声明文件

作用：方便编辑器定位、代码补全

1. 使用 `declare` 关键字定义声明语句
2. 声明文件以 `.d.ts` 结尾

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


## 4 元组、枚举、泛型

TODO

## 5 ts 技巧

1. 跨过 ts 编译错误：断言为 any 可以跨国 ts 错误，例如 `(window as any).hello`
2. ts 对全局对象有做类型定义，比如 Math, addEventListener 等，在我们使用的时候，ts 做类型推论，如果类型不匹配则会编译报错
