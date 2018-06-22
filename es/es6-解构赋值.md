# 解构赋值

赋值：对一个变量设置值，也就是对这个变量对应内存地址编号所对应的存储空间储值

本章主要总结了数组、对象、字符串、数字、布尔值、函数参数的解构赋值

## 1 数组的解构赋值

### 1.1 基本用法

es6允许的模式匹配： `let [a, b, c] = [1, 2, 3];`

如果解构不成功，变量的值就是undefined:

```javascript
let [x, y, ...z] = ['a'];
x // "a"
y // undefined
z // []
```

### 1.2 能实现数组解构赋值的条件

`=` 号2边的格式一样，都具有iterator接口。比如：

```javascript
function* fibs() {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
let [first, second, third, fourth, fifth, sixth] = fibs();
console.log(first, second, third, fourth, fifth, sixth) // 0 1 1 2 3 5
```

为什么返回结果是这样？

```javascript
let a = 1, b = 2;
([a, b] = [b, a+b])
console.log(a, b) //2, 3
```

答：上个fibs每次的返回值是a，因为 `yield a` 。所以解构赋值的执行没有顺序，都是同时执行

具有iterator接口的类型有哪些？

### 1.3 默认值设置

只有当 `=` 右侧的值严格等于 `undefined` 的时候，设置的默认值才会起效

```javascript
let [x = 1] = [undefined];
x // 1

let [x = 1] = [null];
x // null
```

## 2 对象的解构赋值

### 2.1 对象解构赋值条件

必须要 `=` 两侧变量名完全一致才能赋值成功，否则 `undefined`

### 2.2 对象解构赋值本质

```javascript
let { foo: baz } = { foo: "aaa", bar: "bbb" };
baz // "aaa"
foo // error: foo is not defined
```

真正被赋值的是 baz，而不是 foo，foo只是作为一个标识(模式)，表示右侧对象是否具备这个属性，如果具备才进行赋值。

### 2.3 默认值设置

只有当 `=` 右侧的值严格等于 `undefined` 的时候，设置的默认值才会起效

```javascript
var {x = 3} = {x: undefined};
x // 3

var {x = 3} = {x: null};
x // null
```

### 2.4 一个问题

解构赋值时，如果忘记使用let 或者 const，那么会报错

```javascript
{x} = {x: 1};
//SyntaxError: Unexpected token =
```

原因：js引擎会将 `{x}` 当做一个代码块执行，然后又出现了 `=`，自然报错

解决方案：`({x} = {x: 1});`

原因：es6的规则是，只要有可能导致解构的歧义，就不得使用圆括号。唯一使用圆括号的地方，就是 `赋值语句的非模式部分`，即在解构赋值的时候，给模式部分添加圆括号会报错。那为什么这里加圆括号就能成功了呢？加圆括号就表示不要把 `{x}` 当做一个代码块执行，整体表示一个解构赋值，类似函数

> 数组也和对象的这个特性一样，需要加个括号

## 3 字符串的解构赋值

```javascript
const [a, b, c, d, e] = 'hello';
a // "h"
b // "e"
c // "l"
d // "l"
e // "o"

// length属性
let {length : len} = 'hello';
len // 5
```

之所以能解构赋值成功，字符串被转换成了一个类似数组的对象，这个对象也有length属性

> 注意：采用 `const {a, b, c, d, e} = 'hello';` 方式不能解构赋值成功

## 4 数字和布尔值的解构赋值

```javascript
let {toString: s} = 123;
s === Number.prototype.toString // true
s // [Function: toString]

let {toString: s} = true;
s === Boolean.prototype.toString // true
```

之所以能解构赋值成功，数字和布尔值被转换成了一个类似数组的对象，他们的包装对象都有toString属性

```javascript
let {s} = 123;
s // undefined
```

为什么 `{s}` 和 `{toString: s}` 2种就有差异呢?

答：因为这里的 toString ，在数字 123 转换成对象的时候，它的原型上存在一个 toString 属性，但是不存在 s 属性，所以就有差异。

> 字符串、数字、布尔值的解构赋值，都会将其转换成一个对象，然后解构赋值的时候，从他们自身属性或者原型链上面取属性值。

## 5 函数参数的解构赋值

函数的解构赋值用到的就是数组、对象、数字、布尔值、string的解构赋值，有2点要注意一下

```javascript
function add([x, y]){
  return x + y;
}

add([1, 2]); // 3
```

虽然这里写成的是 `[x, y]`，但是js引擎理解这里是用到的解构赋值，在函数内部还是会单独用到x和y

数组或对象都可以采用如下方式设置默认值

```javascript
function m1({x = 0, y = 0} = {}) {
  console.log([x, y])
}
function m2({x, y} = { x: 0, y: 0 }) {
  console.log([x, y])
}
m1() // [0, 0]
m2() // [0, 0]
```

## 6 应用场景

函数参数默认值、变量交换、import 模块方法、函数返回多个值等

> 记一句：学习是反反复复的，我要对每个知识点掌握全面，不着急一口吃个大胖子
