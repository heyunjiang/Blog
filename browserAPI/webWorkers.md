# web workers

designer: heyunjiang
time: 2018.6.11
update: 2018.6.11

**学习目标(要解决什么问题)**：为了实现pwa

## 1 web workers 功能简介

mdn: *Web Workers 使得一个Web应用程序可以在与主执行线程分离的后台线程中运行一个脚本操作。这样做的好处是可以在一个单独的线程中执行费时的处理任务，从而允许主（通常是UI）线程运行而不被阻塞/放慢。*

### 1.1 通信原理

web workers 线程与主线程之间通信，是通过 `postMessage()` 方法发送消息，通过 `onmessage` 这个 event handler 来接收消息。数据消息传递的是副本，不是共享数据(通过消息通道传递的)

### 1.2 操作权限

web workers 线程中，不能直接操作dom(只能在主线程中操作dom)，也不能使用 window 对象中的一些默认的方法和属性，比如：**??**。

worker线程中，能够使用大部分window对象提供的方法和属性，包括 websockets、indexedDB等

### 1.3 worker 分类

1. 专用 worker：常规普通操作，比如计算、websocket
2. shared workers: 表示一种可以同时被多个浏览器环境访问的特殊类型的worker,这些浏览器环境可以是多个window, iframes 或者甚至是多个worker.
3. service workers: 一般作为web应用程序、浏览器和网络（如果可用）之前的代理服务器。他们旨在（除开其他方面）创建有效的离线体验，拦截网络请求，以及根据网络是否可用采取合适的行动并更新驻留在服务器上的资源。他们还将允许访问推送通知和后台同步API。
4. chrome workers(just for firefox)
5. 音频 workers

## 2 api

通用

1. AbstractWorker: 不直接使用，用于接口
2. Worker: 表示正在运行的worker线程
3. SharedWorker: 表示正在运行的共享型worker线程
4. WorkerGlobalScope: worker的通用作用域对象，用于接口
5. DedicatedWorkerGlobalScope: 专用worker作用域对象
6. SharedWorkerGlobalScope: 共享worker作用域对象
7. WorkerNavigator: worker的用户代理信息

主线程

1. myWorker.terminate()
2. myWorker.onerror(e): e.message, e.filename, e.lineno ...

worker 线程

1. close()
2. importScripts('foo.js', 'bar.js')

## 3 例子

```javascript
// shared worker 线程： 根据端口来进行通信
onconnect = function(e) {
  var port = e.ports[0];
  port.onmessage = function(e) {
    var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
    port.postMessage(workerResult);
  }
}

// dedicated worker 线程： 直接通信
onmessage = function(e) {
  console.log('Message received from main script');
  var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
  console.log('Posting message back to main script');
  postMessage(workerResult);
}

// 主线程
var myWorker = new Worker("worker.js");
myWorker.postMessage('hello world');
myWorker.onmessage = function(e) {
  console.log(e.data);
}
```

注意：

1. 在使用worker的时候，需要判断浏览器支持与否 `if (window.Worker)`
2. 主线程中使用时，onmessage和postMessage() 必须挂在worker对象上，而在worker中使用时不用这样做。原因是，在worker内部，worker是有效的全局作用域
3. 消息传递是通过深度复制的副本，不是共享同一个数据
4. Worker接口会生成真正的操作系统级别的线程

## 4 service worker

service worker 作为pwa应用最重要的一环。

实现功能：充当web应用程序和浏览器之间的代理，也可以充当浏览器和网络之间的代理。旨在创建离线应用，拦截网络请求，网络可用时更新本地资源。附加功能有消息推送、设备后台同步api

同其他workers的区别

1. 只能在https环境下
2. 设计为完全异步，不能操作xhr、localStorage等同步api

问题：service worker能使用 `indexedDB` 吗？

猜想：应该也不能，它不能操作同步api

### 4.2 开发步骤

参考文章：

[mdn service workers](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API/Using_Service_Workers)

[github sw](https://github.com/mdn/sw-test/)
