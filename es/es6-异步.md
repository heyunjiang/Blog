# generator、promise、async

time: 2018.8.02

update: 2018.8.20

目录

[1. promise](#1-promise)  
[2. generator](#2-generator)  
[3. async](#3-async)

## 1 promise

promise 作为异步编程的一种解决方案，但是浏览器原生支持 `Promise` 对象

创建 promise 中的代码会立即执行，resolve 即 .then 中的回掉函数会加入 microtask 中，待调用栈中的所有任务执行完毕，会立马执行 microtask 中的任务

```javascript
let promise = new Promise(function(resolve, reject) {
  console.log('Promise');
  resolve();
});
promise.then(function() {
  console.log('resolved.');
});
console.log('Hi!');
// Promise
// Hi!
// resolved
```

### 1.1 Promise 对象上的方法

`Promise.all([])`

1. 接受参数为数组，数组每个元素为一个 promise 实例
2. 返回一个 promise
3. 数组所有 promise 状态变成 fulfilled 之后，返回的 promise 状态才会 fulfilled

`Promise.race([])`

返回一个 promise, 参数同 Promise.all , 不同的是只要数组中某一个 promise 的状态变成 fulfilled 或 rejected ，那么返回的那个 promise 状态就随之改变

`Promise.resolve()`

返回一个 promise ，传入参数有4种情况

1. 参数为 promise ：直接返回这个 promise
2. 参数为含 then 方法的对象：立即执行 then 方法，返回新的 promise
3. 参数为其他不为空的值：直接 resolve(param) ，返回新的 promise
4. 参数为空：直接 resolve ，返回新的 promise

`Promise.reject()`

返回一个 promise, 传入的参数直接作为 catch 的参数函数的参数

```javascript
const thenable = {
  then(resolve, reject) {
    reject('出错了');
  }
};

Promise.reject(thenable)
.catch(e => {
  console.log(e === thenable)
})
// true
```

### 1.2 promise 原型上的方法

1. Promise.prototype.then
2. Promise.prototype.catch
3. Promise.prototype.finally

### 1.3 promise 错误处理

1. 在 promise 内部发生的错误，具有冒泡性质，会被最近的一个 catch 捕获到
2. 在 resolve() 之后抛出的错误，会被忽略
3. 在 promise 内部发生的错误，不会传递到外层代码，即不能被 try...catch 捕获到，成为一个未被捕获到的事件

## 2 generator

目录

1. 例子
2. 特性
3. Generator.prototype.next() 方法参数
4. Generator.prototype.throw()
5. Generator.prototype.return()
6. yield* 表达式
7. 遍历 generator 遍历器
8. 深入 generator 实例
9. generator 与 协程、执行上下文

> generator 是 es6 提供的一种异步变成的解决方案

generator是一个状态机，内部保存的是多个状态

关键词： `generator 遍历器`

****

### 2.1 例子

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();
hw.next();
hw.next();
hw.next();
hw.return();
```

****

### 2.2 特性

1. 函数名 * 开头：但是不限制写在具体位置，只要在函数名之前就行
2. yield 表达式：函数执行暂停标志；返回 yield 后面表达式的值给函数 next 方法调用者；只能存在于generator 函数中
3. generator 函数调用方式与普通函数一样，但是它不立即执行，返回的是一个指向内部状态的指针对象，也就是generator的遍历器对象，该对象实现了 Symbol.iterator 接口。每次获取下一个状态，需要调用这个遍历器对象的 `next` 方法，获取到的状态是一个对象，如 `{value: "hello", done: false}`
4. 因为 generator 函数执行返回的是一个实现了 iterator 接口的对象，可以直接使用 for of , ... 遍历了。可以用作函数延迟执行

### 2.3 Generator.prototype.next()

2.2 特性中的第三点讲到调用 next 方法返回的是一个指针，指向一个对象，包含value和done属性。

返回的这个对象，是返回给的函数next方法调用者，比如 `const obj = hw.next()`，这里返回的是 yield 语句后面的执行的结果；如果在函数内部执行 `let hello = yield 'hello'` ，这里的 hello 值是什么呢？

其实 `yield` 语句本身不返回值，它只是函数执行状态的一个标志，通过调用 `next()` 让其继续执行，比如上面的 hello 的值就是 undefined 。

如果想让 yield 返回值，也就是次状态执行返回的结果，是通过在 next 方法传参，比如

```javascript
function* helloWorldGenerator() {
  let hello = yield 'hello';
  let world = yield hello + 'world';
  return 'ending';
}
```

第一次执行 helloWorldGenerator 函数时，返回一个对象，也就是 generator 遍历器对象；

第二次执行时，调用 next 方法，才遍历第一次执行的遍历器，遇到 yield 语句，暂停执行，返回该 yield 语句后的表达式值给函数调用者，此时world的值为undefined；

第三次执行时，返回给函数调用者的是 `world` ；如果给此次调用 next() 方法传入参数，则该参数会被赋予给上个 yield 执行的返回结果，也就是 hello 会被设置值，比如 next('hello') ，那么第三次执行返回给函数调用者的值是 `hello world`

### 2.4 Generator.prototype.throw()

设计在原型上的方法，用于在实例抛出错误，在 generator 函数内部捕获错误

注意：设计在 generator 实例使用的 throw 方法和全局使用的 throw 命令不同，前者可以在函数内部捕获或外部捕获，后者只能在函数外部捕获

问：之前谈的都是在函数外部抛出错误，如果在 generator 内部发生了错误，又是什么结果呢？普通函数内部发生错误又是什么结果呢？

答：如果 generator 函数内部发生错误，不管有没有被捕获到，或者说外部、内部捕获，都不会继续执行。普通函数，即使内部捕获到了错误，也不会继续执行(经本地测试)

```javascript
function *hello() {
      try {
        throw new Error('shit')
        console.log('hello')
        yield 'hello';
      }catch (e) {
        console.log('内部', e)
      }
}
try {
      var he = hello()
      console.log(he.next()) // 內部 error ，{value: undefined, done: true}
      console.log(he.next()) // {value: undefined, done: true}
} catch(e) {
      console.log(e)
}
```

### 2.5 Generator.prototype.return()

用于终结执行当前 generator 的遍历器对象，参数表示返回值，否则返回 undefined;

如果存在 try...finally ，那么如果执行 return 时，return 会在 finally 代码块执行完成之后执行

### 2.6 yield* 表达式

上面谈到的都是 yield 表达式，比如 `let hello = yield 'hello'` ， yield* 是什么呢？

问：如果在 generator 函数中调用普通函数，普通函数会执行，但是如果调用的是 generator 函数呢，会什么后果？

答：此时 generator 函数不会执行，只是获取到了 generator 的遍历器，得到的遍历器可以通过 next、for of 等实现遍历

`yield*` : 只能在 generator 函数中使用，用于遍历 generator 遍历器，等同于把 generator 拆分成多个 yield 表达式。

```javascript
function* concat(iter1, iter2) {
  yield* iter1;
  yield* iter2;
}

// 等同于

function* concat(iter1, iter2) {
  for (var value of iter1) {
    yield value;
  }
  for (var value of iter2) {
    yield value;
  }
}
```

### 2.7 遍历 generator 遍历器

目前能遍历 generator 遍历器的方法有4种：next, for of, yield*, ... 运算符

1. `next`：返回一个对象，拥有 value 和 done 属性
2. `for of`：直接获取遍历器的 value
3. `...`: 直接获取遍历器的 value
4. `yield* 表达式`：返回 yield 表达式

### 2.8 深入 generator 与普通函数的关系

generator 形式上是一个普通函数，但是它却只是一个异步解决方案，浏览器并没有原生支持它，也就是说它不是函数的实例，它也不像 Promise 对象那样，由浏览器直接原生提供。它提供的语法只是方便开发者调用它，用以解决异步问题，实现的是一个状态机。

```javascript
function* generatorTest () {
  yield 'hello';
  yield 'world';
}
```

#### 2.8.1 看看 babel 将其编译成什么样子

```javascript
function generatorTest() {
  return _regenerator2.default.wrap(function generatorTest$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return 'hello';

        case 2:
          _context.next = 4;
          return 'world';

        case 4:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}
```

可以看出

1. generator 函数的执行，不会返回立即预定义的值，而是返回的一个包装器对象
2. 返回的包装器对象需要遍历，才能返回预定义的值
3. generator不被浏览器原生支持，也不是一个对象，它只是实现的一种机制

#### 2.8.2 prototype 属性

普通构造函数的 prototype 属性指向原型对象，那么 generator 函数的 prototype 属性呢？

```javascript
function* g() {}

g.prototype.hello = function () {
  return 'hi!';
};

let obj = g();

obj instanceof g // true
obj.hello() // 'hi!'
```

问：执行 g 函数返回 generator 遍历器，为什么该遍历器能够访问定义在 generator 函数prototype属性上的值呢？

答：返回的遍历器对象，之所以能够访问到定义在 generator 函数 prototype属性上的方法，因为 **ES6 规定** 这个遍历器对象是 generator 函数的实例，并且继承 generator 函数的 prototype 属性。所以，上面的 obj 就继承了 g 的 prototype 属性。

问：obj 作为实例，是不是可以认为 generator 可以用作构造器函数呢？

答：不行，构造函数实例化是通过 new 关键字实例的，这里的 obj 实例是通过执行 generator 函数生成的，不是通过 new 关键字生成的，而且 **ES6 规定** 也不能通过 new 关键字实例化 generator 函数，因为它不能用作构造函数。

#### 2.8.3 generator 中的 this 关键字

因为不能用作构造函数，那么 generator 函数中的 this 代表什么呢？

```javascript
function* generatorTest () {
  console.log(this)
}
const test = generatorTest()
test.next() // undefined
```

直接输出 `undefined` ，它不是指向 window、global 等对象。为什么是 `undefined` 呢？

### 2.9 generator 与 协程、执行上下文

引用来自阮一峰 ECMAScript 6 入门中关于协程的介绍

> 协程是一种程序运行的方式，可以理解成 `协作的线程` 或 `协作的函数`。协程既可以用单线程实现，也可以使用多线程实现。单线程实现是一种特殊的子例程，多线程实现是一种特殊的线程。

传统函数执行上下文变化过程

当开始执行函数的时候，会创建一个函数的执行上下文，该上下文包含 `函数作用域链`、`变量对象v0`、`this` ，创建完成之后将其加入全局执行上下文栈中。函数执行完毕，将函数执行上下文从全局执行上下文栈中出栈。

generator函数执行上下文变化过程

在generator函数执行的时候，也为其创建执行上下文环境，不立即入全局执行上下文栈；当遍历 generator 遍历器的时候，将执行上下文环境对象压入全局执行上下文栈；执行时一旦遇到 `yield` 命令，则暂停执行函数，保留当前执行状态，将执行上下文环境出栈，但是不删除，此时可以做其他事情；当继续遍历的时候，又将generator执行上下文环境入栈，冻结的状态恢复。

> 学习 generator 可以搭配 redux-saga 学习

## 3 async

### 3.1 问题

1. async 函数是什么，有什么用？
2. async 执行返回一个 promise ，需要手动 return promise 吗？

### 3.2 问题解答

#### 3.2.1 async 函数是什么，有什么用？

async 就是 generator 函数的语法糖。与 generator 函数不同的是，async 有 4 项改进

1. 内置执行器：对于异步操作的同步写法，generator必须亲自写执行过程，而 async 属于自执行，但是 async 函数不再有 generator 的保存状态功能了
2. 更好的语义：使用 `async/awair` 代替 `*/yield`
3. 适用性更广：yield 命令后面通常是 Thunk 函数或者 Promise 对象，但是 await 后面可以是 promise 对象和原始类型的值
4. 返回值是 promise ：generator 初次执行的返回值是一个 iterator 对象，可以采用 ... 遍历，每次调用 next() 执行返回一个对象 `{value: 0, done: false}` ；而 async 函数执行返回的结果是一个 promise

#### 3.2.2 async 执行返回一个 promise ，需要手动 return promise 吗？

答：不是，要求跟在 await 后面的必须是一个 promise 或普通原始类型，如果是原始类型，则相当于直接赋值。 async 执行结果返回一个 promise ，在其内部执行 `return value` ，这里的 value 相当于 `.then(value)` 传入的参数值

## 参考文章

[1. 阮一峰-es6入门/async](http://es6.ruanyifeng.com/#docs/async)  