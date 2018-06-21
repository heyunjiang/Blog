# web workers

designer: heyunjiang
time: 2018.6.11
update: 2018.6.19

目录

1. web workers 功能简介
2. 大体api
3. 专用 worker 、 shared worker 例子
4. service worker
5. 应用场景

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

## 2 大体api

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

## 3 专用 worker 、 shared worker 例子

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

单个 service worker 可以控制很多页面。每个你的 scope 里的页面加载完的时候，安装在页面的 service worker 可以控制它。牢记你需要小心 service worker 脚本里的全局变量： 每个页面不会有自己独有的worker

`service worker` 特性

1. 只能在 `https` 环境下( `localhost` 或者 `127.0.0.1` 也是 ok 的)
2. 设计为 `完全异步`，依赖 `promise` ，不可以使用 `localstorage` 与 `xhr`，可以使用 `indexDB` 和 `fetch`
3. service worker 的缓存机制依赖 `cache api` 实现
4. 依赖 `fetch` (fetch在主流浏览器中都已经实现了，可以替代xhr)

### 4.1 service worker 创建步骤

1 注册或获取

`navigator.serviceWorker.register('service-worker.js', {scope: './'}).then(function(reg){})`

如果注册成功，则返回一个 `promise`。然后注册的 `service worker` 线程独立运行。

scope表示 `service worker` 要控制的子目录，路径相对于 `origin`，不是当前js文件， `service-worker.js` 也一样

2 安装

运行注册service worker的主线程所在页面开始安装service worker。开始安装到安装成功，会触发事件：`install`。

可以在 `worker线程` 里面监听事件，并 **处理 indexDB 和 缓存站点资源了**

3 激活

当 service worker 安装完成后，会接收到一个激活事件: `activate`。

onactivate 主要用途是 **清理先前版本的service worker 脚本中使用的资源**。

4 重新加载页面

重新加载页面，保证 `service worker` 能完全控制页面

****

主线程支持状态判断

1. reg.installing
2. reg.waiting
3. reg.active

service worker 支持事件列表

1. install
2. activate
3. message
4. fetch
5. sync
6. push

### 4.2 service worker 生命周期

6个阶段

register -> installing -> installed -> activating -> activated -> redundant

1. `register`: 在主线程中进行注册
2. `installing`：安装时会触发 `install` 事件，该事件包含2个方法：`event.waitUntil` 和 `self.skipWaiting`。 `self.skipWaiting` 用于跳过 waiting 状态，直接进入 `activating`
3. `installed`: 安装成功后，waiting, 等待其他的service worker线程关闭，然后它才能进入激活
4. `activating`: 激活中，当其他的service worker线程(控制该客户端的)关闭后，允许当前service worker的安装、激活。激活中会触发 `activate` 事件，该事件包含2个方法：`event.waitUntil` 和 `self.clients.claim`。 `self.clients.claim` 用于取得页面的控制权，其他的service worker就强制进入 `redundant`
5. `activated`: 激活后，然后处理 `activate` 的回掉事件，例如 `fetch` 、 `sync` 、 `push`
6. `redundant`: 结束

### 4.3 示例代码

app.js // 主线程

```javascript
// 代码1：主线程获取或注册 service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-test/sw.js', { scope: '/sw-test/' }).then(function(reg) {

    if(reg.installing) {
      console.log('Service worker installing');
    } else if(reg.waiting) {
      console.log('Service worker installed');
    } else if(reg.active) {
      console.log('Service worker active');
    }

  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
}
```

sw.js // service worker 线程

`cache` 作为 service worker 作用域的一个全局变量

`caches` 作为 service worker 作用域的一个全局变量，原名 `CacheStorage`

`promise.catch` 就是在没有联网的时候触发，可以自定义返回数据

```javascript
// 代码2：service worker 缓存文件
self.addEventListener('install', function(event) {
  // waitUntil 保证缓存数据成功前，service worker 不会 install 完成
  event.waitUntil(
    // v1 表示当前 service worker 激活使用的版本
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/sw-test/',
        '/sw-test/index.html',
        '/sw-test/style.css',
        '/sw-test/app.js',
        '/sw-test/image-list.js',
        '/sw-test/star-wars-logo.jpg',
        '/sw-test/gallery/bountyHunters.jpg',
        '/sw-test/gallery/myLittleVader.jpg',
        '/sw-test/gallery/snowTroopers.jpg'
      ]);
    })
  );
});

// 代码3：service worker 拦截请求
self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    // service worker 保证 caches.match() 总是会 resolves
    // 但是返回 response 可能为 undefined
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        // response 只会被使用一次
        // 保存 clone 版本到 cache 中
        // 然后返回 response
        let responseClone = response.clone();
        caches.open('v1').then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        // 如果网络错误，则返回默认配置
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
      });
    }
  }));
});
```

问题：上面例子实现了数据缓存、拦截请求，以及处理断网状态如何返回数据，那么如何更新缓存中的数据呢？

答：每次都让其执行fetch，失败再读取缓存。或许上面处理例子可以改写为

```javascript
// 代码4：service worker 能更新缓存的拦截请求
self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    let responsePre = response&&response.clone()||null;
    return fetch(event.request).then(function (response) {
      let responseClone = response.clone();
      caches.open('v1').then(function (cache) {
        cache.put(event.request, responseClone);
      });
      return response;
    }).catch(function () {
      if (responsePre !== null) {
        return responsePre
      } else {
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
      }
    });
  }));
});
```

### 4.4 更新 service worker

先安装：如果有旧版的 worker 已经被安装，那么在刷新页面的时候，新版本的 worker 虽然会被安装，但是不会被激活。

后激活：当没有任何已加载的页面在使用旧版的 worker 的时候，新版本才会被激活

再清理：当新的service worker激活之后，需要清理之前版本缓存

```javascript
// 代码5：service worker 更新激活时清理缓存
self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['v2'];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});
```

### 4.5 注意事项

1. 必须在 `https` 环境下运行项目
2. service worker文件的地址也要相对于 `origin` ，scope也一样，但是要求必须在应用目录之下

### 4.6 问题

**问**：为什么不可以使用localstorage？为什么它就是同步的？为什么就可以使用indexDB？这几种存储方式之间有什么异同？

**问**：为什么不能使用xhr，能够使用fetch？这2者有什么区别？

答：xhr采用的是传统回调函数写法，虽然是异步请求，但是是同步操作与响应。fetch返回的是promise，也是异步请求，但是是异步操作与响应。axois中使用的就是promise搭起基于xhr的异步桥梁。

### 5 应用场景

pwa、数据mock、网速很差或者离线情况是保证良好用户体验

### 6 调试

chrome -> Application -> Service Workers

参考文章：

[mdn service workers](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API/Using_Service_Workers)

[github sw](https://github.com/mdn/sw-test/)

[axios源码分析](https://www.cnblogs.com/wwwweb/p/axios.html)

[service worker && cachestorage](http://www.zhangxinxu.com/wordpress/2017/07/service-worker-cachestorage-offline-develop/)

****

练习：

1. 借助 github 的 https实现 service worker
2. 练习 caches。分析localstorage、sessionstorage、cachestorage之间差异

练习应用场景

做一个pwa应用，就在我的手写签章里面实现

1. 定时获取天气信息，并实现消息推送：Push Notification
