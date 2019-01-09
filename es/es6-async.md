# async

time: 2019.01.09

## 1 问题

1. async 函数是什么，有什么用？
2. async 执行返回一个 promise ，需要手动 return promise 吗？
3. 如果 async 函数内部抛出错误，该怎么处理？

## 2 问题解答

### 2.1 async 函数是什么，有什么用？

async 就是 generator 函数的语法糖。与 generator 函数不同的是，async 有 4 项改进

1. 内置执行器：对于异步操作的同步写法，generator必须亲自写执行过程，而 async 属于自执行，但是 async 函数不再有 generator 的保存状态功能了
2. 更好的语义：使用 `async/awair` 代替 `*/yield`
3. 适用性更广：yield 命令后面通常是 Thunk 函数或者 Promise 对象，但是 await 后面可以是 promise 对象和原始类型的值
4. 返回值是 promise ：generator 初次执行的返回值是一个 iterator 对象，可以采用 ... 遍历，每次调用 next() 执行返回一个对象 `{value: 0, done: false}` ；而 async 函数执行返回的结果是一个 promise

### 2.2 async 执行返回一个 promise ，需要手动 return promise 吗？

答：不是，要求跟在 await 后面的必须是一个 promise 或普通原始类型，如果是原始类型，则相当于直接赋值。 async 执行结果返回一个 promise ，在其内部执行 `return value` ，这里的 value 相当于 `.then(value)` 传入的参数值

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

答：如果 await 后面的异步操作出错，那么该 promise 会被 reject ，从而影响到整个 container 函数返回的 promise 都被 reject。

## 参考文章

[1. 阮一峰-es6入门/async](http://es6.ruanyifeng.com/#docs/async) 