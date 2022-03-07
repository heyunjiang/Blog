# typescript

time: 2018.8.09  
update: 2020.12.28  
update: 2021-09-16 19:24:39

一直都没有怎么去学习 typescript ，但是今天阅读 antd 源码的时候，发现它是用 ts 写的，大部分源码都能看懂，但是它的一些语法不是很懂，比如 `export default class Button extends React.Component<ButtonProps, any>` ，它尾巴上的 `<ButtonProps, any>` 是什么，是 React.Component 自带可以这样子写的吗，还是 ts 赋予的？

目录

[1 typescript 简介](#1-typescript-简介)  
[2 typescript 基本语法](#2-typescript-基本语法)  
&nbsp;&nbsp;[2.1 interface](#2.1-interface)  
&nbsp;&nbsp;[2.2 function](#2.2-function)  
&nbsp;&nbsp;[2.3 declare](#2.3-declare)  
&nbsp;&nbsp;[2.4 class](#2.4-class)  
&nbsp;&nbsp;[2.5 declare](#2.5-declare)  
&nbsp;&nbsp;[2.6 module](#2.6-module)  
[3 tsx](#3-tsx)  
[4 泛型](#4-泛型)  
[5 技巧](#5-技巧)  
[6 与es6 class区别](#6-与es6-class区别)  
[7 ts 踩坑归纳](#7-ts-踩坑归纳)  
[8 vue3 使用 ts](#8-vue3-使用-ts)  

## 1 typescript 简介

1. ts 是 js 类型的超集，可以编译成纯 js
2. 存在强类型语言的某些特征，比如 static 、 interface 等，方便类型约束，提升代码鲁棒性
3. 按类型检查的时机，ts 是动态类型，js 是静态类型
4. 按是否允许强制转换，ts 和 js 是弱类型，ts 兼容了 js 的类型转换语法
5. 小项目使用障碍：手动写声明文件、类型

问题：  
1. es6 class 有 static, interface 没？
2. interface 有哪些用？怎么用？定义接口类型，用于定义函数、class 需要的类型
3. .d.ts 的 declare 有什么用？怎么用？类型声明，用于编辑器的识别处理，包括错误提示、代码补全
4. as 通常用于 ts 报错的不确定性处理，通常在访问可能存在的属性场景，那么在 export 导出中使用怎么理解 `export const createApp = ((...args) => {}) as CreateAppFunction<Element>`
5. 类型声明，`let renderer: Renderer<Element | ShadowRoot> | HydrationRenderer` 后面的 Renderer 是复合声明吗？
6. export type 是什么意思？声明类型别名或字面量类型限制
7. 在 .ts 文件中引入 vue3 ref，会提示 ts 2305 没有导出的成员 ref，怎么解决？
8. `export * from "@vue/runtime-dom";` 在 .d.ts 中 import 导入的是什么？

优势  
1. 语义化增强：完备的类型系统让代码阅读更方便明了
2. 语法错误提前暴露，在 ts 编译为 js 时报错、在编辑器内部检查报错
3. 编辑器和ide代码补全、智能提示、跳转
4. 类型系统包容性强：类型推论、第三方系统兼容性强
5. 社区活跃：vue、antd 都是用 ts 写的

目的：提供类型系统，完善 javascript 过于灵活导致的代码质量参差不齐的问题

## 2 typescript 基本语法

1. 扩展名： `.ts`
2. 编译器： `tsc greeter.ts`
3. 函数参数类型限定： `function greeter(person: string)` ，可用类型： string 、interface、any、boolean、number、`Array<number>`、void、null、undefined
4. 接口： 使用 `interface` 关键字，使用不需要 implements ，由 class、object 去实现
5. 类： `class` ，构造函数 `constructor` ，如果在构造函数的参数使用 `public` 关键字，等于创建了同名的类成员变量，可以直接通过类的实例 + `.` 方式访问
6. 类型断言：使用 `as` 关键字，可用于接口、类的断言，用以解决 ts 报错的不确定性问题。`let strLength: number = (someValue as string).length;`；也可以使用 `(<string>someValue).length` 来做类型断言
7. 类型别名：使用 `type` 关键字，type NameOrResolver = Name | NameResolver
8. 枚举：使用 `enum` 关键字，enum Days {Sun, Mon, Tue, Wed, Thu, Fri, Sat} 约定取值范围，会被编译为从 0 开始递增的数组。在 ts 中作为一种数据结构，编译之后为数组和对象的结合体
9. 联合类型：使用单竖线 `|`

问题：es 函数默认值是 `=` 还是 `:`

类型声明  
1. 普通类型：采用冒号 `:`，例如 let myFavoriteNumber: string | number;
2. 数组：let hello: number[], 泛型 `let hello: Array<number>`，类数组 `let hello: IArguments = arguments`
3. 对象：使用 `interface` 声明属性及值类型，或者简单对象则使用 `object` 声明
4. 函数：(data: object) => boolean，参数可以直接使用 object 关键字或者使用 interface 来声明

> 尖括号里面始终表示类型，可以是基础类型，有可以是定义好的 interface、object 等数据类型，也又可能是定义的泛型

### 2.1 interface

1. 使用 `interface` 关键字定义，内部数据项要求实例严格保持一致
2. 定义对象要求大写开头，比如 `interface Person {}`
3. 分号结尾：接口属性不同于对象逗号结尾，接口是分号 `;` 结尾
4. 可选属性：在属性 key 后面加 `?`
5. 任意属性：使用 propName 关键字，`[propName: string]: string | number;`；它会限制所有接口属性类型；可以添加任意多个属性
6. 只读属性：使用 readonly 关键字定义，`readonly id: number;`
7. 声明数组：定义数组或类数组，定义了索引和值类型
```javascript
interface MyArray {
  [index: number]: string
}
```
8. 声明函数：定义函数的参数及返回值类型
```javascript
interface MyFun {
  (source: string): boolean
}
```
9. 声明类：在使用到类时再来学习，类的声明包含了属性、方法、实例 new 的控制

作用-类型声明：用于对象类型参数声明，比如定义变量、函数参数、函数本身、类等

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
3. 剩余参数：function hello(firstName: string, ...items: any[]) {}
4. 参数默认值: function (hello: string = 'hello')
5. 返回值：function(hello: string): boolean {}
6. this 参数：为了解决 ts 函数内部访问 this 警告或报错问题，可以生命一个 this 函数参数并指明类型
7. 函数重载：参数不同，返回值不同。通过多行定义函数

完整函数类型  
```javascript
let myAdd: (x: number, y: number) => number = 
    function(x: number, y: number): number { return x + y }
```

推断函数类型  
```javascript
let myAdd = function(x: number, y: number): number { return x + y } // 会自动推断出左侧变量 myAdd 的类型
let myAdd: (x: number, y: number) => number = function(x, y) { return x + y } // 会自动推断出右侧函数的参数和返回值类型
```

简化函数类型  
```javascript
let myAdd = function(x: number, y: number) { return x + y } // 会自动推断出左侧变量 myAdd 的类型、右侧函数返回值类型
```

函数重载  
```javascript
function pickCard(x: {suit: string; card: number; }[]): number;
function pickCard(x: number): {suit: string; card: number; };
function pickCard(x): any {}
```

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

### 2.5 declare

作用：方便编辑器定位、代码补全

1. 使用 `declare`、`interface`、`type` 关键字定义声明语句
2. 声明文件以 `.d.ts` 结尾
3. 在 package.json 中使用 `types` 字段指向项目的声明文件。如果项目根目录存在 index.d.ts，那么则不需要指明该字段

作用  
1. 引用第三方库时，需要引用它的声明文件，获取代码提示和补全

### 2.6 module

在 nodejs 中，默认采用的是 commonjs 规范，如果想使用 es6 规范，则必须声明为 .mjs，在 ts 中对于模块有不同的实现

1. ts 中默认支持 export 和 import 关键字，使用方式同 es6 一致
2. export = 和 import =: ts 规定，如果使用 export = 来兼容 commonjs 的导出对象(即 commonjs 和 es6 混用)，则必须使用 import = require 来实现
3. 除了和 export =  搭配，ts 支持 commonjs require 加载文件吗？

### 2.7 type

先来看看 ts 默认支持的类型  
1. 基础类型：string, number, boolean, void, undefined, null。后面三个基本不用
2. 任意类型：let hello: any
3. 联合类型：let hello: string | number
4. 接口类型: let hello: interface
5. 数组类型: let hello: number[]
6. 函数类型: let fun: (x: number, y: number) => number；函数声明写法 function fun(x: number, y: number): number {}
7. 内置对象: let hello: Boolean | Error | Date | RegExp | HTMLElement | NodeList
8. 元组类型: let hello: [string, number] 它限制了数组每一项的取值和 length
9. 泛型: `let hello: Array<string>`，`let hello: <T>(x: T) => T = function yo<T>(x: T): T {}`

type 的作用  
1. 定义类型别名：type Name = string; 接着使用 let hello: Name 即可
2. 定义字符串字面量类型：type Names = 'jack' | 'tom' | 'andy'; 然后使用 function hello(name: Names): any {} 即可。它的作用是限制了对应参数的取值只能是字面量中的一个

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

泛型是使用尖括号定义泛型变量，`<T>`，其他使用跟函数、数组这些没变化。  
> 在定义函数、接口、类时不指定类型，在使用时再确定。一般很少使用泛型，都使用 any 替代了  
注意这几个泛型例子的使用，泛型变量定义的位置
demo  
```typescript
let arr: Array<number> = [];
function swap<T, U>(tuple: [T, U]): [U, T] {
    return [tuple[1], tuple[0]];
}
swap([7, 'seven']); // 相当于使用了类型推论 swap<number, string>([7, 'seven'])
```
泛型函数  
```typescript
let myswap: <T, U>(tuple: [T, U]) => [U, T] = function swap<T, U>(tuple: [T, U]): [U, T] { return [tuple[1], tuple[0]] } // 通过表达式声明时，函数泛型前需要命名
```
泛型接口  
```typescript
interface GenericIdentity<T> {
  (arg: T): T;
}
function identity<T>(arg: T): T {
  return arg;
}
let myIdentity: GenericIdentity = identity
```
泛型类  
```typescript
class hello<T> {}
```
泛型继承接口 T extends，也叫泛型约束  
```typescript
interface hello {
  world: string;
}
function identity<T extends hello>(arg: T): T {
  return arg.world
}
```

## 5 技巧

1. 跨过 ts 编译错误：断言为 any 可以跨国 ts 错误，例如 `(window as any).hello`
2. ts 对全局对象有做类型定义，比如 Math, addEventListener 等，在我们使用的时候，ts 做类型推论，如果类型不匹配则会编译报错

## 6 与es6 class区别

1. 编译结果: ts class 编译结果为 es5 function，es6 class 由 v8 本身提供
2. 关键字: ts 支持更完整关键字，而 es6 只支持 static、extends、super 三个

## 7 ts 踩坑归纳

这里总结 ts 开发中遇到的问题

### 7.1 es6 编译为 commonjs 时引用标准包 path，使用时会调用 path.default 导致访问失败

生成错误：TypeError: Cannot read property 'isAbsolute' of undefined  
原因分析：ts 编译时将 es6 import 转为 require 后，使用时默认会去读取 default 作为入口属性，但是标准包在 commonjs require 时，并没有 default 属性  
解决方案：修改 ts 编译配置 tsconfig.json `"esModuleInterop": true`，这个会默认包裹一层 default 属性

## 8 vue3 使用 ts

项目使用 vite 作为构建工具

### 8.1 vue3 对 ts 的支持

1. 在使用 options api 组件时，使用 `defineComponent` 包裹组件，实现类型推断
2. 使用 script setup 时，使用 `defineProps`, `defineEmits` 定义 props 和 emits，实现类型推断
3. lang="ts"

问题：为什么要使用 defineComponent 包裹组件？

总结：vue3 只是提供了 ts 需要的组件类型，这些方法执行的结果还是 ts 代码，没有对 ts 做啥特殊处理

### 8.2 vite 对 ts 的支持

1. 内部实现了 `.ts` 的转译，生成 .js
2. 类型检查提示由 IDE 和 构建过程实现。构建过程是指 esbuild 和 rollup 插件吗？
3. .vue 文件使用 `vue-tsc` 工具做类型检查

### 8.3 vscode 配置 ts 支持

## 参考文档

[ts 中文](https://www.tslang.cn/docs/handbook/modules.html)  
[打造TypeScript的Visual Studio Code开发环境](https://zhuanlan.zhihu.com/p/21611724)
