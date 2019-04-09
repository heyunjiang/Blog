# async

time: 2019.01.09  
update: 2019.4.9

## 1 问题

1. async 函数是什么，有什么用？
2. async 执行返回一个 promise ，需要手动 return promise 吗？
3. 如果 async 函数内部抛出错误，该怎么处理？
4. promise 和 async、generator 函数有什么区别，都是异步解决方案怎么理解？

## 2 问题解答

### 2.1 async 函数是什么，有什么用？

async 就是一个函数的修饰符，不同于普通函数，async 返回一个 promise  
async 函数是 generator 函数的语法糖。与 generator 函数不同的是，async 有 4 项改进

1. 内置执行器：对于异步操作的同步写法，generator必须亲自写执行过程，而 async 属于自执行，但是 async 函数不再有 generator 的保存状态功能了
2. 更好的语义：使用 `async/awair` 代替 `*/yield`
3. 适用性更广：yield 命令后面通常是 Promise 对象，但是 await 后面可以是 promise 对象、thenable对象(包含then方法的对象)和原始类型的值
4. 返回值是 promise ：generator 初次执行的返回值是一个 iterator 对象，可以采用 ... 遍历，每次调用 next() 执行返回一个对象 `{value: 0, done: false}` ；而 async 函数执行返回的结果是一个 promise

但是，它也没有了 generator 函数的一些特点，比如

1. 函数暂停执行：generator 函数可以暂停执行，当调用 next 才继续执行
2. 内部状态可以通过 ... 遍历，而 async 不行，async 执行结果返回的是一个 promise 对象

### 2.2 async 执行返回一个 promise ，需要手动 return promise 吗？

答：不是， async 执行结果返回一个 promise ，在其内部执行 `return value` ，这里的 value 相当于 `.then(value)` 传入的参数值。  
要求跟在 await 后面的必须是一个 promise 或普通原始类型，如果是原始类型，则相当于直接赋值。

### 2.3 如果 async 函数内部抛出错误，该怎么处理？

async 函数在调用时，会立即返回一个 promise ，如果内部出现错误，可以在返回的这个 promise 上处理错误。

问题：如果 await 后面的异步操作出错，该怎么监听？

```javascript
const errorThrower = () => {
  return new Promise((resolve, reject) => {
    throw new Error("出错出错")
  })
}

const container = async () => {
  ...
  let result = await errorThrower();
  ...
}
```

如果 await 后面的异步操作出错，那么该 promise 对象会被 reject ，一旦状态变化，reject 之后的代码不会执行了，从而影响到整个 container 函数返回的 promise 都被 reject。  
如果想 reject 之后的代码继续执行，必须将 await 后的异步任务加 try...catch 包裹起来

### 2.4 promise 和 async、generator 函数有什么区别，都是异步解决方案怎么理解？

首先明确2点

1. promise 是一个对象
2. async、generator 是2种函数类型

同样是异步解决方案，但是本质不同，应用的场景不同，可以搭配使用

promise: 构造器内部是立即执行，then 方法是异步执行的，其构成了同步写法异步调用的效果  
async、generator: 通过 yield、await 来暂停函数内部的执行，直到后面的 promise 状态变化则继续执行，所以这2者都必须搭配 promise 使用，他们2个实现的效果是让函数内部的异步任务同步写法，但是异步执行等待，同直接使用 promise 对象来配置不一样，这2者更具语义化，并且是用在函数上的，最终 async、generator 函数会被 babel 编译成很复杂的函数样子

> 具体异步方案的差异，还是要深入使用了才能知道

## 参考文章

[1. 阮一峰-es6入门/async](http://es6.ruanyifeng.com/#docs/async) 