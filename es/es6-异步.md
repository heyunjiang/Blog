# generator、promise、async

time: 2018.8.02

update: 2018.8.03

目录

1. promise
2. generator
3. async

## 1 promise

promise 作为异步编程的一种解决方案

## 2 generator

目录

1. 例子
2. 特性
3. Generator.prototype.next() 方法参数
4. Generator.prototype.throw()
5. Generator.prototype.return()

> generator 是 es6 提供的一种异步变成的解决方案

generator是一个状态机，内部保存的是多个状态

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



## async
