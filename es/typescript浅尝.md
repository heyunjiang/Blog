# typescript

time: 2018.8.09  
update: 2020.12.28

一直都没有怎么去学习 typescript ，但是今天阅读 antd 源码的时候，发现它是用 ts 写的，大部分源码都能看懂，但是它的一些语法不是很懂，比如 `export default class Button extends React.Component<ButtonProps, any>` ，它尾巴上的 `<ButtonProps, any>` 是什么，是 React.Component 自带可以这样子写的吗，还是 ts 赋予的？

目录

[1 typescript 简介](#1-typescript-简介)  
[2 typescript 基本语法](#2-typescript-基本语法)  
&nbsp;&nbsp;[2.1 interface](#2.1-interface)  
&nbsp;&nbsp;[2.2 function](#2.2-function)  
&nbsp;&nbsp;[2.3 declare](#2.3-declare)  
&nbsp;&nbsp;[2.4 class](#2.4-class)  
[3 tsx](#3-tsx)  
[4 泛型](#4-泛型)  
[5 技巧](#5-技巧)  
[6 与es6 class区别](#6-与es6-class区别)  

## 1 typescript 简介

1. ts 是 js 类型的超集，可以编译成纯 js
2. 存在强类型语言的某些特征，比如 static 、 interface 等，方便类型约束，提升代码鲁棒性

优势  
1. 语义化增强：完备的类型系统让代码阅读更方便明了
2. 语法错误提前暴露
3. 编辑器和ide代码补全
4. 类型系统包容性强：类型推论、第三方系统兼容性强
5. 社区活跃：vue、antd 都是用 ts 写的

## 2 typescript 基本语法

1. 扩展名： `.ts`
2. 编译器： `tsc greeter.ts`
3. 函数参数类型限定： `function greeter(person: string)` ，可用类型： string 、interface、any、boolean、number、`Array<number>`、void、null、undefined
4. 接口： 使用 `interface` 关键字，使用不需要 implements ，由 class、object 去实现
5. 类： `class` ，构造函数 `constructor` ，如果在构造函数的参数使用 `public` 关键字，等于创建了同名的类成员变量，可以直接通过类的实例 + `.` 方式访问
6. 类型断言：使用 `as` 关键字，可用于接口、类的断言，用以解决 ts 报错的不确定性问题。`let strLength: number = (someValue as string).length;`；也可以使用 <any>5 来做类型断言
7. 类型别名：使用 `type` 关键字，type NameOrResolver = Name | NameResolver
8. 枚举：使用 `enum` 关键字，enum Days {Sun, Mon, Tue, Wed, Thu, Fri, Sat} 约定取值范围，会被编译为从 0 开始递增的数组

类型判断  
1. 变量：采用冒号 `:`，例如 let myFavoriteNumber: string | number;
2. 数组：let hello: number[], 泛型 `let hello: Array<number>`，类数组 `let hello: IArguments = arguments`
3. 对象：使用 `interface` 判断属性及值类型

### 2.1 interface

1. 使用 `interface` 关键字定义，内部数据项要求实例严格保持一致
2. 定义对象要求大写开头，比如 `interface Person {}`
3. 分号结尾：接口属性不同于对象逗号结尾，接口是分号 `;` 结尾
4. 可选属性：在属性 key 后面加 `?`
5. 任意属性：使用 propName 关键字，`[propName: string]: string | number;`；它会限制所有接口属性类型；可以添加任意多个属性
6. 只读属性：使用 readonly 关键字定义，`readonly id: number;`
7. 声明数组：`[index: numnber]: number`

### 2.2 array

1. 简单方式: let hello: number[]
2. 数组泛型: let hello: Array<number>
3. any: let hello: any[]
4. 元组：let tom: [string, number]，属于兼容了不同项的数组
5. 枚举：enum Days {Sun, Mon, Tue, Wed, Thu, Fri, Sat}，将数组值全都枚举出来
6. 常数枚举：使用 `const enum` 定义常数枚举中不能包含计算值，只能是固定值
7. 外部枚举：使用 `declare enum` 定义外部枚举，编译效果同普通枚举一样，也可以结合常数枚举和外部枚举

### 2.3 function

1. 参数个数限定：指定的参数不可多，也不可少，要求严格匹配
2. 可选参数：同接口属性，使用 `?` 定义，但是函数可选参数之后不能再有其他非可选参数了
3. 剩余参数：`...items: any[]`
4. 参数默认值: function (hello: string = 'hello')
5. 返回值：function(hello: string): boolean {}

### 2.4 class

class 包含了 属性、constructor、方法

1. 多态：类在继承之后，可以对相同方法重新实现
2. Abstract：Abstract class | method，属于基类，只能被继承，不能被实例化；抽象方法必须被实现
3. super: 调用父 class constructor
4. static: 可以直接通过 class.prop 来调用
5. public：可以在外部访问
6. private：私有的，只能当前类访问。如果 constructor 被声明为 private，那么该 class 不可被继承及实例化
7. protected：私有的，只能当前类和子类访问。如果 constructor 被声明为 private，那么该 class 不可被实例化，但是可以继承，类似于 Abstract
8. readonly：可以用在属性、索引签名或 contructor 中
9. interface: 定义接口，接口之间也可以继承，接口还可以继承类(ts 特有，并且只会继承类的非静态属性、非静态方法)
10. implements：实现接口，多个接口用逗号隔开

问：private 或 protected 属性，可以通过实例访问吗？  
答：不可，只能在类内部访问

### 2.5 declare

作用：方便编辑器定位、代码补全

1. 使用 `declare` 关键字定义声明语句
2. 声明文件以 `.d.ts` 结尾

## 3 tsx

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


## 4 泛型

在定义函数、接口、类时不指定类型，在使用时再确定。一般很少使用泛型，都使用 any 替代了

```typescript
function swap<T, U>(tuple: [T, U]): [U, T] {
    return [tuple[1], tuple[0]];
}

swap([7, 'seven']);
```

泛型约束：由于是使用时才确定泛型变量的具体类型，所以不能直接读取泛型变量的属性

## 5 技巧

1. 跨过 ts 编译错误：断言为 any 可以跨国 ts 错误，例如 `(window as any).hello`
2. ts 对全局对象有做类型定义，比如 Math, addEventListener 等，在我们使用的时候，ts 做类型推论，如果类型不匹配则会编译报错

## 6 与es6 class区别

1. 编译结果: ts class 编译结果为 es5 function，es6 class 由 v8 本身提供
2. 关键字: ts 支持更完整关键字，而 es6 只支持 static、extends、super 三个
