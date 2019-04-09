# promise

time: 2019.01.09

update: 2019.01.16

目录

[1. Promise 对象上的方法](#1-Promise-对象上的方法)  
[2. promise 原型上的方法](#2-promise-原型上的方法)  
[3. promise 错误处理](#3-promise-错误处理)  
[4. promise 特征](#4-promise-特征)  
[5. promise 学习中的问题](#5-promise-学习中的问题)  
[6. promise 应用](#6-promise-应用)  
[7. promise 模拟实现](#7-promise-模拟实现)  

创建 promise 中的代码会立即执行，then 内部任务属于 microtask 任务，会在本轮事件结束之前调用; 而 macrotask 会在下轮事件开始之前调用

> 了解 promise 所有特性，直接把它实现一次就行，或者看它的模拟实现了

```javascript
// 解释一下下面代码的执行逻辑
const p1 = new Promise(function (resolve, reject) {
  setTimeout(() => reject(new Error('fail')), 3000)
})

const p2 = new Promise(function (resolve, reject) {
  setTimeout(() => resolve(p1), 1000)
})

p2
  .then(result => console.log('123', result))
  .catch(error => console.log(error))
// Error: fail

// 解释：此刻的 then 方法，都是针对在 p1 种返回的 promise 对象了，因为是 reject，所以直接走 catch 方法。
```

## 1 Promise 对象上的方法

### 1.1 Promise.all([])

1. 接受参数为数组，数组每个元素为一个 promise 实例
2. 返回一个 promise
3. 数组所有 promise 状态变成 fulfilled 之后，返回的 promise 状态才会 fulfilled

### 1.2 Promise.race([])

返回一个 promise, 参数同 Promise.all , 不同的是只要数组中某一个 promise 的状态变成 fulfilled 或 rejected ，那么返回的那个 promise 状态就随之改变

### 1.3 Promise.resolve()

返回一个 promise ，传入参数有4种情况

1. 参数为 promise ：直接返回这个 promise
2. 参数为含 then 方法的对象：立即执行 then 方法，返回新的 promise
3. 参数为其他不为空的值：直接 resolve(param) ，返回新的 promise，该 promise 状态为 fulfilled
4. 参数为空：直接 resolve ，返回新的 promise，该 promise 状态为 fulfilled

### 1.4 Promise.reject()

返回一个 promise, promise 状态直接为 rejected, 传入的参数直接作为 catch 的参数函数的参数

> 因为 then 方法的第二个参数函数，通常用在 catch 来捕获了

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

## 2 promise 原型上的方法

1. Promise.prototype.then
2. Promise.prototype.catch
3. Promise.prototype.finally

## 3 promise 错误处理

1. 在 promise 内部发生的错误，具有冒泡性质，会被最近的一个 catch 捕获到
2. 在 resolve() 之后抛出的错误，会被忽略
3. 在 promise 内部发生的错误，不会传递到外层代码，即不能被 try...catch 捕获到，成为一个未被捕获到的事件

## 4 promise 特征

了解特征，才能在实现原理上明白，为什么这么实现

1. promise 状态只能由异步操作结果决定，不受其它操作影响
2. promise 内部状态变化，由实例内部的 `resolve` 和 `reject` 2个函数实现，分别对应 fullfilled 和 rejected 状态，状态改变之后不能再变
3. promise 在实例化创建的时候，会立即执行，不能被取消
4. promise 内部抛出的错误，不会反应到外部
5. promise 只有构造函数的参数函数有 `resolve` 和 `reject` 2个函数，其他 promise 实例不能使用这2个函数
6. new Promise() 生成的是一个对象
7. then 方法的参数为 promise 对象的回调函数
8. then 方法返回一个新的 promise 对象，从进入时状态为 pending 状态，因此可以链式调用

## 5 promise 学习中的问题

1. resolve(param) 函数参数 param 传递给 then 方法的第一个参数函数，并且 resolve 执行后将通过构造函数生成的 promise 对象的状态变成 fulfilled。如果这个 param 参数为一个 promise ，那么这个 promise 对象的状态如何变化呢？
2. promise 对象的状态是否必须从 pending 变成 fulfilled 或 rejected？
3. then 方法返回的 promise 对象，如果不包含异步操作，它的状态如何变化，是否可以链式调用？
4. promise 的异步任务回调为什么就能链式写法呢？

### 5.1 resolve(param) 函数参数 param 传递给 then 方法的第一个参数函数，并且 resolve 执行后将通过构造函数生成的 promise 对象的状态变成 fulfilled。如果这个 param 参数为一个 promise ，那么这个 promise 对象的状态如何变化呢？

答：构造函数通过 resolve 方法传递参数 promiseB，同 then 方法返回值。如果传递的是一个 promise 对象 `promiseB`，resolve 方法会作一个判断，如果是 promise 对象，则 promiseB 会立即调用 `promise.then(resolve, reject)`，此刻 promiseB 调用前一个对象的 `resolve | reject` 方法，promiseB 状态是已经确定了的，这就让 promiseB 决定了前一个 promise 对象的状态了。

### 5.2 promise 对象的状态是否必须从 pending 变成 fulfilled 或 rejected？

答：不是，比如通过构造函数创建的 promise 对象，如果内部不调用 resolve() 方法，则该 promise 对象始终为 `pending` 状态

### 5.3 then 方法返回的 promise 对象，如果不包含异步操作，它的状态如何变化，是否可以链式调用？

答：如果不包含异步操作，则直接执行完成，状态为 `fulfilled`。  
如果包含异步操作呢？比如返回的是一个 promise ，则这个问题就同 5.1 一样了，在 then 方法中返回 promise 对象，跟在构造函数中调用 resolve(param) 方法传递 promise 一样。  
如果不返回 promise ，则默认是 fulfilled。

### 5.4 promise 的异步任务回调为什么就能链式写法呢？

答：简单讲，promise 的 then 方法的参数，是我们写的回调处理函数，不是立即执行，是作为参数传递的。

## 6 promise 应用

在常规使用中，通常我们不会使用构造函数 `new Promise()` 方式创建 promise 对象，而是直接使用某些具体的 api 来创建 promise 对象，比如 fetch 等方法

promise 对象的状态变化，可以在一定时间后 resolved ，也可以立即 resolved。

```javascript
// 10s 后 resolved
const wait = time => new Promise(resolve => setTimeout(resolve, time || 10000))
// 立即 resolved
Promise.resolve().then()
```

## 7 promise 模拟实现

```javascript
const PENGDING = 'pending';
const FULLFILLED = 'fullfilled';
const REJECTED = 'rejected';

// Promise 接受一个函数参数
function myPromise(callback) {
  let that = this
  this.statu = PENGDING;
  this.fullfilledCallbackArray = []; // 保存 fullfilled 任务，当异步调用 resolve 时执行
  this.rejectedCallbackArray = []; // 保存 rejeced 任务，当异步调用 reject 时执行
  // 1 执行这个函数参数
  callback(resolve, reject)
  function resolve(value) {
    // 2 如果返回的是一个 promise 对象，那么当前对象的状态就由该返回的 promise 对象决定了，因为直接传递的就是 resolve, reject 。如果返回的 promise 对象状态为 fullfilled ，那么当前 promise 对象状态就为 fullfilled，rejected 也一样。
    if(value instanceof myPromise) {
      return value.then(resolve, reject)
    }
    // 3. resolve 及 reject 内部异步执行，因为需要等待 then 的参数添加到任务队列中
    setTimeout(() => {
      that.statu = FULLFILLED;
      that.result = value;
      that.fullfilledCallbackArray.forEach(item => {
        item(value)
      })
    })
  }
  function reject(reason) {
    setTimeout(() => {
      that.statu = REJECTED;
      that.reason = reason;
      that.rejectedCallbackArray.forEach(item => {
        item(reason)
      })
    })
  }
}
// 4 then 方法，返回一个新的 promise
myPromise.prototype.then = function (fullfilledCallback, rejectedCallback) {
  const that = this; // 原 promise 对象的 this
  return new myPromise((resolve, reject) => {
    if(this.statu === FULLFILLED) {
      // 原对象执行完毕，已经调用 resolve()，场景是没有链式调用，多是用在 promiseA+ 上面
      setTimeout(() => {
        let value = fullfilledCallback(that.result)
        resolve(value)
      })
    } else if(this.statu === REJECTED && rejectedCallback) {
      // 原对象执行完毕，已经调用 reject()
      setTimeout(() => {
        let value = rejectedCallback(that.reason)
        reject(value)
      })
    } else if(this.statu === PENGDING) {
      // 如果原对象还在执行过程中，还没有来得及调用 resolve() 或者 reject()
      that.fullfilledCallbackArray.push((result) => {
        let value = fullfilledCallback(result);
        resolve(value)
      });
      that.rejectedCallbackArray.push(reason => {
        let value = rejectedCallback(reason)
        reject(value)
      });
    }
  })
}
myPromise.prototype.catch = function (rejectedCallback) {
  return this.then(null, rejectedCallback)
}
```

## 参考文章

[阮一峰 es 入门](http://es6.ruanyifeng.com/#docs/promise)  
[mdn promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)  
[mdn 使用 promises](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)  
[mdn EventLoop](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop)  
[简书 Promise 详解与实现](https://www.jianshu.com/p/459a856c476f)
