# js 基本类型

关键词：`类型`、`内存`、`指针`

目录

[1 七大变量类型](#1-7大变量类型)  
&nbsp;&nbsp;[1.1 number](#1.1-number)  
&nbsp;&nbsp;[1.2 函数](#1.2-函数)  
&nbsp;&nbsp;[1.3 array](#1.3-array)  
&nbsp;&nbsp;[1.4 object](#1.4-object)  
[2 值类型与引用类型](#2-值类型与引用类型)  
[3 如何理解js中参数都是按值传递](#3-如何理解js中参数都是按值传递)  
[4 参考文章](#4-参考文章)

## 1 7大变量类型

boolean, number, string, null, undefined, object, symbol

symbol：[es6-Symbol](./es6-Symbol.md)  
string: [es2015-模板字符串](./es6-模板字符串.md)

### 1.1 number

#### 1.1.1 number 一些知识点

`Infinity`：表示正无穷大的值

原型方法(实例方法)

1. Number.prototype.toString(): number -> string
2. Number.prototype.toFixed(): number -> string，保留小数点后几位
3. Number.prototype.toExponential(): number指数表示法，保留小数点后几位
4. Number.prototype.toPrecision(): number -> string，保留几位有效位
5. Number.prototype.toLocaleString(): number -> string

对象方法、属性

1. Number.parseInt(): string -> number 取整
2. Number.parseFloat(): string -> number 可以是浮点数
3. Number.isFinite(): 检测是否是有效数字
4. Number.isInteger(): 检测是否是整数，但是必须在53个二进制位之间，如果超过只会判断53位之间的
5. Number.isNaN()
6. Number.isSafeInteger(): 检测是否是安全整数，-(2^53 - 1) 到 (2^53 - 1) 之间
7. Number.MIN_VALUE: javascript能够表示的最小值
8. Number.MAX_VALUE: javascript能够表示的最大值
9. Number.MIN_SAFE_INTEGER：javascript能够表示的最小安全整数
10. Number.MAX_SAFE_INTEGER：javascript能够表示的最大安全整数
11. Number.EPSILON: 表示1到大于1的最小浮点数之间的差，因为js浮点数的计算是不准确的，引入 `EPSILON` 是用于表示误差能够接受的最小范围，如果在这个范围内，表示没有误差，例如 `(0.1+0.2-0.3)<Number.EPSILON // true`，这样就能判断浮点数运算的准确率了

#### 1.1.2 number 多种进制表示法

1. 二进制：`0b` 或 `0B`，0b111110111 === 503 // true
2. 八进制：`0o` 或 `0O`，0o767 === 503 // true (不再允许0开头了)
3. 十进制：`13`
4. 十六进制：`0x`

#### 1.1.3 number 的存储方式

整数和浮点数采用同样的存储方法，都采用 IEEE 754 标准(其他大多数语言同样)，数值存储为64位双精度格式，但是在js中，数值精度最多可以达到53个二进制位(1个隐藏位与52个有效位)，超过限度的会被丢弃。  
javascript 不区分整数值和浮点数值，所有数字在 javascript 中均用 `浮点数` 值表示。

#### 1.1.4 Math 扩展

1. Math.trunc(): 用于去除一个数的小数部分，返回整数部分，类似Number.parseInt()
2. Math.sign(): 用于判断一个数的正负值，返回值：`1, -1, 0, -0, NaN`
3. Math.cbrt(): 计算一个数的立方根，同等：`Math.pow(Math.abs(x), 1/3)`
4. Matn.clz32(): 返回一个数的32位无符号整数形式有多少个前导0，例如：`Math.clz32(0) // 32  Math.clz32(1) // 31  Math.clz32(1000) // 22`
5. Math.imul(): 返回2个数以32位带符号相乘的结果，因为js最多表示2^53，这里2个32位相乘就可以正常表示
6. Math.fround(): 返回一个数的32位单精度浮点数形式。主要作用，将64位双精度浮点数转为32位单精度浮点数
7. Math.hypot(): 返回所有参数的平方和的平方根(执行勾股定理)
8. Math.expm1(): `e^x - 1`，即 `Math.exp(x) - 1`
9. Math.log1p(): 返回 `1 + x` 的自然对数，即 `Math.log(1 + x)` (Math.log默认采用 e 为底数)
10. Math.log10(): 返回以 `10` 为底的x对数，如： `Math.log10(1) // 0`
11. Math.log2(): 返回以 `2` 为底的x对数，如： `Math.log2(1) // 0`
12. Math.sinh(): 正弦
13. Math.cosh()：余弦
14. Math.tanh()：正切
15. Math.asinh()：反正弦
16. Math.acosh()：反余弦
17. Math.atanh()：反正切

问题：这里的64位双精度，32位单精度是什么意思？与对应数值精度有什么关系？(64位双精度对应54,32位单进度对应24)

#### 1.1.5 指数运算符

`**` : `2 ** 2 //4`

### 1.2 函数

#### 1.2.1 函数length属性变化

采用解构赋值方式设置参数默认值可以查看[解构赋值](./es6-解构赋值.md)部分

length属性值变化:

1. 在设置了参数默认值后，函数的length属性值是未设置默认值的参数个数
2. 在使用了rest之后，函数的length属性值是不包含rest的个数

```javascript
(function (a) {}).length // 1
(function (a, b, c = 5) {}).length // 2
(function(a, ...b) {}).length  // 1
```

#### 1.2.2 函数体内设置严格模式

标准规定：如果函数设置了默认值、解构赋值、扩展运算符，那么函数内部不能使用严格模式

原因：如果函数内部设置了严格模式，那么函数体和函数参数都要遵守，但是严格模式是在函数内部设置的，函数参数优先于函数体执行，就造成了函数参数可以不严格执行，函数体必须严格执行，造成矛盾。

#### 1.2.3 箭头函数

返回值：如果返回值不是对象，则可以不用大括号，否则需要大括号(array、object、function需要)

参数：1个参数可以不用括号，0个或多个参数需要括号

使用箭头函数的注意事项：

1. 函数体内的 `this` 对象，属于在函数定义的时候的对象，属于静态对象，需要沿着作用域链向上查找this
2. 箭头函数不可以被实例化，不能使用 `new`(因为箭头函数没有this，它的this就是函数外部的this)
3. 函数体内不再存在 `arguments` 对象，通常使用 `rest` 替代
4. 箭头函数不可以作为 `generator` 函数，内部不可以使用 `yield` 命令，同样不可用于 async 函数
5. 箭头函数不可以使用 `call`、`apply`、`bind`、`super`等

使用箭头函数的好处：`this` 固化，利于封装回调函数，让对象内部this始终指向该对象；箭头函数通常不用作方法函数(类似 obj.func())

```javascript
// 箭头函数this
// ES6
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

// ES5
function foo() {
  var _this = this;
  setTimeout(function () {
    console.log('id:', _this.id);
  }, 100);
}
```

#### 1.2.4 双冒号运算符

用于实现 es5 种的 `bind` 功能

```javascript
// 功能1
foo::bar;
// 等同于
bar.bind(foo);

//---------------

// 功能2
obj::obj.func
// 等同于
::obj.func
```

#### 1.2.5 函数尾调用

> ES6规定：所有ECMAScript的实现，都必须部署尾调用优化。es6的尾调用优化只有在严格模式下开启生效，函数不能设置参数默认值、rest参数、解构赋值

**尾调用**：在函数 `return` 执行的最后一步，一定是返回的一个函数的执行，如果最后一步不是函数的执行，那就不是尾调用

```javascrip
// 尾调用
function f(x){
  return g(x);
}

非尾调用
function f(x){
  return g(x) + 1;
}
```

**尾调用优化**：相比普通函数，尾调用在执行的时候，js引擎在运行的时候，不会保存外部函数的作用环境，从而实现了内存优化。普通模式(非严格模式)实现尾调用优化，采用循环(for, while)，不保存每次函数的执行环境

**尾递归**：原理同尾调用优化，节省内存

```javascript
// 非尾递归，每次递归需要保存上次函数的运行环境，因为上个函数还未运行结束
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}
factorial(5) // 120

// 尾递归
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}
factorial(5, 1) // 120
```

### 1.3 array

#### 1.3.1 iterator

iterator： 调用 `Symbol.iterator`

任何实现了 `iterator` 接口的对象(arguments、document.getElements、map、set、generator)，都可以用 `...` 将其转为真正的数组

#### 1.3.2 Array.from()

Array.from: 调用 `Symbol.iterator` || `length`

任何实现了 `iterator` 接口的对象，以及类似数组的对象(具有length属性，object如果赋予length属性，也是类似数组的对象)，都可以采用 `Array.from` 将其转为真正的数组。

第二个参数，用于对每个元素进行处理

```javascript
Array.from(arrayLike, x => x * x);
// 等同于
Array.from(arrayLike).map(x => x * x);

Array.from([1, 2, 3], (x) => x * x)
// [1, 4, 9]
```

#### 1.3.3 Array.of()

返回一个数组

```javascript
// Array.of()
Array.of(3, 11, 8) // [3,11,8]
Array.of(3) // [3]
Array.of(3).length // 1

// Array()
Array() // []
Array(3) // [, , ,]
Array(3, 11, 8) // [3, 11, 8]
```

Array.of() vs Array(): `Array()` 存在重载，参数个数的不同，实现结果也不同

> Array 与 new Array() 实现结果一致

#### 1.3.4 copyWithin()

在当前数组内部，将制定位置的成员复制到其他位置，替换元素，然后返回当前数组，会修改原数组

```javascript
[1, 2, 3, 4, 5].copyWithin(0, 3, 4)
// [4, 5, 3, 4, 5]
```

第一个参数：开始替换的位置

第二个参数：开始读取数据的位置，可选

第三个参数：结束读取数组的位置，可选

> 说明：开始替换的位置，不需要说明要替换多少个数组元素，替换掉的数组元素个数由后面2个参数决定；替换前后数组元素个数总数不变

#### 1.3.5 find() findIndex()

这2个函数，查找元素，与 indexOf() 不同的是，这2者的第一个参数必须是函数

```javascript
[1, 4, -5, 10].find((n) => n < 0) // -5
```

这2个函数，查找到第一个返回值为 `true` 的成员，并返回该成员。区别是，如果没有查找到，find返回 `undefined`，findIndex返回 `-1`

#### 1.3.6 fill()

用于初始化数组，设置默认填充值

```javascript
new Array(3).fill(7)
// [7, 7, 7]
```

注意：

1. 调用fill方法，会抹去原数组所有原始值
2. 可以设置填充的起始值: `['a', 'b', 'c'].fill(7, 1, 2) // ['a', 7, 'c']`
3. 如果填充值为对象：填充的就是该对象的 `内存地址` ，以后修改每个元素，都会影响到所有填充的元素

#### 1.3.7 includes()

用于代替 indexOf

比 indexOf 好的原因

1. 更加语义化：返回布尔值
2. 能识别 `NaN`

#### 1.3.8 数组空位

`Array(3) // [empty x 3]`: 构造了3个空位

es5: 处理不一致，例如 forEach 会跳过空位， map 会跳过空位，但是会保留这个值， join 会将空位视为 `undefined`

es6: 空位一律处理成 `undefined`

### 1.4 object

#### 1.4.1 属性名表达式

可以采用如下方式定义对象

```javascript
let propKey = 'foo';

let obj = {
  [propKey]: true,
  ['a' + 'bc']: 123
}
```

> 注意：不能将属性名表达式与对象简洁表示混合使用，否则报错 `const baz = { [foo] }`

#### 1.4.2 对象方法的 name 属性

函数的 `name` 属性，返回函数名；对象方法的 `name` 属性，通常也是返回方法名(此处方法也是函数)

以下3种方式不同

1 `get/set`

直接访问属性的name报错，因为这里的foo属性返回值是 `undefined`，foo的真实值是它的返回值

```javascript
const obj = {
  get foo() {},
  set foo(x) {}
};

obj.foo.name
// TypeError: Cannot read property 'name' of undefined

const descriptor = Object.getOwnPropertyDescriptor(obj, 'foo');

descriptor.get.name // "get foo"
descriptor.set.name // "set foo"
```

2 `bind/Function`

```javascript
(new Function()).name // "anonymous"

var doSomething = function() {};
doSomething.bind().name // "bound doSomething"
```

3 `Symbol`

```javascript
const key1 = Symbol('description');
const key2 = Symbol();
let obj = {
  [key1]() {},
  [key2]() {},
};
obj[key1].name // "[description]"
obj[key2].name // ""
```

#### 1.4.3 Object.is()

用于判断2个值是否相等，类似 `===`

`==` vs `===` : 前者会隐式转换类型

`===` vs `Object.is()`: 后者在 `===` 的基础之上，增加了 `NaN` 等于自身，并且 `+0` 不等于 `-0`

`==` vs `Object.is()`: 后者不会隐式转换，并且 `+0` 不等于 `-0`， `NaN` 等于自身

#### 1.4.4 Object.assign()

对象合并：将源对象的所有可枚举属性都合并/覆盖到目标对象上去

注意事项

1. 如果传入一个对象参数，就返回这个对象
2. 如果传入不是对象参数，那么转换成对象(该方法保证返回对象，只是返回的是该参数原有对象形式的对象)
3. 如果第一个参数传入 `null` 或 `undefined` ，报错
4. `Object.assign({}, 'hello')`: 第二个参数只有是对象或者字符串时才起效，数字、null、undefined、function等都无效
5. 属于浅拷贝(如果源对象的某属性是对象，那么拷贝的也只是这个对象的引用，如果需要深度复制，还是需要自己手写)，继承属性不拷贝，也不拷贝不可枚举的属性
6. Object.assign只能进行值的复制，如果要复制的值是一个取值函数，那么将求值后再复制
7. 可以接受多个参数，用以实现多个对象的合并

#### 1.4.5 对象属性的可枚举性和遍历

可枚举性：可以控制该属性，是否允许别人看到

采用 `Object.getOwnPropertyDescriptor` 获取对象属性的描述对象

```javascript
let obj = { foo: 123 };
Object.getOwnPropertyDescriptor(obj, 'foo')
//  {
//    value: 123,
//    writable: true,
//    enumerable: true,
//    configurable: true
//  }
```

如果设置对象属性描述对象的 `enumerable` 值为 false，那么下列操作就会忽略这个属性

1. for...in 循环
2. Object.keys()
3. Json.stringify()
4. Object.assing()

下列操作可以获取到 `enumerable` 值为 false 的属性

1. Object.getOwnPropertyNames
2. Reflect.ownKeys
3. Object.getOwnPropertyDescriptors

> es6 规定： __proto__ 属性只需浏览器部署，其他环境可以不用部署

#### 1.4.6 Object.getOwnPropertyDescriptors

获取对象所有属性(非继承)的描述对象集合，该集合是个对象，不是数组

创建该方法的目的：解决 `Object.assign()` 无法复制 get/set 属性的问题

使用方式1: 结合 `Object.defineProperties`，实现复制

```javascript
const source = {
  set foo(value) {
    console.log(value);
  }
};

const target2 = {};
Object.defineProperties(target2, Object.getOwnPropertyDescriptors(source));
Object.getOwnPropertyDescriptor(target2, 'foo')
// { get: undefined,
//   set: [Function: set foo],
//   enumerable: true,
//   configurable: true }
```

> 问：为什么这就是复制，可以称为继承吗？答：最多称为浅继承，而且这个复制也只是浅复制，不能复制原型上的属性。这里如果说是继承，那么也只继承了它的自身属性，可以称为浅继承。要实现真实继承，使用 `Object.create`

使用方式2：结合 `Object.create`，实现clone

```javascript
const source = {
  set foo(value) {
    console.log(value);
  }
};

const target2 = Object.create(Object.getPrototypeOf(source), Object.getOwnPropertyDescriptors(source));
Object.getOwnPropertyDescriptor(target2, 'foo')
// { get: undefined,
//   set: [Function: set foo],
//   enumerable: true,
//   configurable: true }
```

使用方式3：结合 `Object.create`，实现继承

```javascript
const obj = Object.create(
  prot,
  Object.getOwnPropertyDescriptors({
    foo: 123,
  })
);
```

> 上面实现的本质： 1. 继承就是一个对象获取另一个对象的属性  2. getOwnPropertyDescriptors 获取到的属性描述集合， defineProperties 和 create 的第二个参数恰好可以用而已  3. getOwnPropertyDescriptors 实现了另一种读取对象属性的方式

#### 1.4.7 __proto__

1. 规定：浏览器必须部署，非浏览器不用部署
2. 实例.__proto__ = 构造器.prototype
3. Object.__proto__ === null
4. Object.setPrototypeOf() : 用于设置对象的原型，也可以使用 `.__proto__ =` 来设置原型(非对象转为对象，undefined和null不能转，报错)
5. Object.getPrototypeOf() : 返回第一个参数的原型(非对象转为对象，undefined和null不能转，报错)

#### 1.4.8 super 关键字

`this` 关键字，总是指向当前对象，`super` 关键字，总是指向当前对象的原型

**使用限制**：super 只能用在对象的方法之中，这个方法就是对象的简写方法

```javascript
// 写法一：唯一正确
const obj = {
  foo: 'world',
  find() {
    return super.foo;
  }
}
// 写法二：报错
const obj = {
  foo: 'world',
  find: () => {
    return super.foo;
  }
}
```

问：为什么写法二就不行呢？

答：因为 js 引擎只能识别简写方式的对象方法，属性方式则不行

#### 1.4.9 Object.keys Object.values Object.entries

都属于对象的遍历，但是都只是遍历对象自身的属性，不包含原型、 `enumerable` 为 `false`、`Symbol` 的属性。

#### 1.4.10 对象的扩展运算符 ...

1. 只能拷贝可枚举的属性
2. 只能写在最后 ： `let { x, ...newObj } = o;`
3. 属于浅复制，如果对象属性是一个对象，那么使用...之后的新对象，是对这个对象的引用

## 2 值类型与引用类型

值类型：boolean, number, string, null, undefined, symbol

引用类型：object (object, function, array)

问：什么是引用类型？

答：引用类型的数据，其真实值在内存中分配一个地址001，然后我们访问的都是这个001地址，就是说为我们的变量分配的值是这个地址001，它作为一个指针，指向真实值。

## 3 如何理解js中参数都是按值传递

原则：在javascript中的参数传递都是按值传递

理解：这里的值，值得是变量的值。js的类型分为基本类型与引用类型，传的实参赋值给形参，就是把实参的值复制给形参。如果 `var obj = {}`，通常我们所说的 obj 的值是一个对象，其实这种说法是错误的，正确说法 obj 的值对这个对象的引用，因为这个 obj 变量在内存中对应的值是一个指针，这个指针就是这个对象 `{}` 的内存地址，所以说 obj 它是对这个对象的引用。那么如果将 obj 作为实参传递给函数，其实传递的是 obj 的值(指针)，也就是 `{}` 的内存地址。

```javascript
const arr = [{"hello": 'world'}, {"hello": 'world'}]
console.log(arr === arr, arr[0] === arr[1]) //true, false
```

## 4 参考文章

[mdn javascript 教程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
