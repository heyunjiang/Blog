# 原由

time: 2018.11.1  
udpate: 2021-09-02 17:21:18

目录

[1 目的](#1-目的)  
[2 koa 基础总结](#2-koa-基础总结)  
&nbsp;&nbsp;[2.1 koa 对象方法](#2.1-koa-对象方法)  
&nbsp;&nbsp;[2.2 上下文 Context](#2.2-上下文-Context)  
&nbsp;&nbsp;[2.3 Request 别名](#2.3-Request-别名)  
&nbsp;&nbsp;[2.4 Response 别名](#2.4-Response-别名)  
&nbsp;&nbsp;[2.5 koa response](#2.5-koa-response)  
[3 koa 实战](#3-koa-实战)  

## 1 目的

已经掌握了前端开发，目前向中间层学习，准备入手 nodejs 做服务端，但是又没有找到合适的学习方式。  
看到 thinkjs 和 egg 都是基于 koa 进行扩展的，打算先学习一下 koa，通过 koa 学习 nodejs 的应用，在服务端的位置等。

## 2 koa 基础总结

1. koa 应用程序：包含一组中间件函数的对象
2. 中间件组织方式：采用队列方式组织和执行各中间件，内部通过 next 显示调用下一个中间件函数执行器

```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

### 2.1 koa 对象方法

`const app = new Koa();`

最重要的2个 `listen` 、 `use`

#### 2.1.1. app.listen()

属于 nodejs http 的语法糖

```javascript
const http = require('http');
http.createServer(app.callback()).listen(3000);
```

#### 2.1.2 app.callback()

http.createServer() 的回调函数

#### 2.1.3 app.use()

给应用程序添加 `中间件`

#### 2.1.4 app.keys = []

设置签名的 Cookie 密钥

#### 2.1.5 app.contenxt

访问 `ctx` 对象的原型，可以为其添加属性，将会在整个应用程序中使用到。

#### 2.1.6 错误处理

监听应用全局错误

```javascript
app.on('error', (err, ctx) => {
  log.error('server error', err, ctx)
});
```

### 2.2 上下文 Context

在每个中间件中，其参数包含了 `ctx` 对象

1. ctx.req：node 的 request 对象，不建议直接使用
2. ctx.res：node 的 response 对象
3. ctx.request: koa 的 request 对象，ctx.req === ctx.request.req，通常使用 ctx.request 处理请求 request
4. ctx.response：koa 的 response 对象
5. ctx.state：推荐的命名空间，用于通过中间件传递信息和前端视图
6. ctx.app：应用程序的实例引用
7. ctx.cookies.get(name, options)：koa 获取 cookie，使用 [Cookies](https://github.com/pillarjs/cookies) 模块
8. ctx.cookies.set(name, value, options)：koa 设置 cookie
9. ctx.throw(status, msg, properties)：ctx 抛出错误。
10. ctx.assert(value, status, msg, properties)： 类似 invarient ，当 !value 时，抛出错误
11. ctx.respond：通过设置 `ctx.respond = false` ，可以绕过 koa 内置的 response 处理，操作原始的 response 对象

### 2.3 koa Request 对象访问代理

ctx.header
ctx.headers
ctx.method
ctx.method=
ctx.url
ctx.url=
ctx.originalUrl
ctx.origin
ctx.href
ctx.path
ctx.path=
ctx.query
ctx.querystring
ctx.host
ctx.hostname
ctx.fresh
ctx.stale
ctx.socket
ctx.protocol
ctx.secure
ctx.ip
ctx.ips
ctx.subdomains
ctx.is()
ctx.accepts()
ctx.acceptsEncodings()
ctx.acceptsCharsets()
ctx.acceptsLanguages()
ctx.get()

### 2.4 koa Response 对象访问代理

ctx.body
ctx.status
ctx.message
ctx.length
ctx.type
ctx.headerSent
ctx.redirect()
ctx.attachment()
ctx.set()
ctx.append()
ctx.remove()
ctx.lastModified
ctx.etag=

### 2.5 koa response

> 该 response 对象是 koa 在 node 的 response 对象上的抽象

1. response.header：response.headers 的别名
2. response.headers
3. response.socket
4. response.status : 获取或设置 `响应状态`，(默认是 404，不是 node 的200)
5. response.message : 获取或设置 `状态消息`
6. response.length : 获取或设置响应的 `Content-Length`
7. response.body : 获取或设置响应体 (string, Buffer, Stream, Object, null)
8. response.get(field) : 获取响应头字段值 (不是响应体) ，同 ctx.response.get(field)
9. response.set(field, value) : 设置响应头字段值，同 ctx.set(filed, value)
10. response.append(field, value) : 添加额外的响应头，同 ctx.append(field, value)
11. response.set(fields) : 批量设置响应头，同 ctx.set(fields)
12. response.remove(field)
13. response.type : 获取或设置响应头的 Content-Type 字段，同 ctx.type
14. response.is(types) : 检查响应的 Content-Type 类型，同 ctx.response.is
15. response.redirect(url, alt) : 重定向，修改状态在重定向之前，修改 body 在重定向之后，同 ctx.redirect
16. response.attachment(filename) : 将 Content-Disposition 设置为附件，指示客户端下载，filename 可选
17. response.headerSent : 检查是否已经发送了一个响应头
18. response.lastModified : 获取或设置 `Last-Modified` 响应头，同 ctx.response.lastModified
19. response.etag : 设置 ETAG 响应(没有获取)，同 ctx.response.etag
20. response.vary(field) : 改变 field ，怎么变？
21. response.flushHeaders() : 刷新任何设置的标头，并开始主体，什么意思？

> 注意：response 可以通过 ctx.response 访问到，所以它的属性或方法的别名，可以通过 ctx.body 或 ctx.response.body 访问

response.body 类型与 http 协议的 `Content-Type` 字段关系

> [http 基础](../other/专题-http.md) 这里看 http 基础知识

1. String - `text/html | text/plain`
2. Buffer - `application/octet-stream`
3. Stream - `application/octet-stream`
4. Object - `application/json` Object 通常为普通对象、数组

## 3 koa 源码解析

从源码了解 koa 的整体功能，了解核心 api 实现，比如 koa 对象，实例方法 use, listen，ctx 对象等  
问题：  
1. koa 中间件执行顺序是怎么样？在官方文档中说的是：按照堆栈的方式组织和执行的，也就是说定义在后面的会先执行？不会，属于队列方式，先定义先执行，还是得实际操作或看源码才能明白
2. 为什么要封装 context 对象？什么时候创建？

koa 对象核心代码
```javascript
module.exports = class Application extends Emitter {
  constructor (options) {
    super()
    this.middleware = []
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
  }
  listen (...args) {
    const server = http.createServer(this.callback())
    return server.listen(...args)
  }
  use (fn) {
    this.middleware.push(fn)
    return this
  }
  callback () {
    const fn = compose(this.middleware)
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res)
      return this.handleRequest(ctx, fn)
    }
    return handleRequest
  }
  handleRequest (ctx, fnMiddleware) {
    const res = ctx.res
    res.statusCode = 404
    const onerror = err => ctx.onerror(err)
    const handleResponse = () => respond(ctx)
    onFinished(res, onerror)
    return fnMiddleware(ctx).then(handleResponse).catch(onerror)
  }
}

function respond (ctx) {
  const res = ctx.res
  let body = ctx.body
  body = JSON.stringify(body)
  res.end(body)
}
```

归纳总结：  
1. koa 代码简洁，内部调用 `http.createServer` 创建服务器，封装了自身的插件规范、request、response，没有多做什么事情
2. 中间件采用数组栈保存，通过 compose 处理调用顺序，生成的 fn 是如何调用内部中间件

### 3.1 koa 中间件编写

```javascript
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(async ctx => {
  ctx.body = 'Hello World';
});
```

中间件函数是输入 context 对象，返回 promise 对象

### 3.2 koa 中间件实现原理

前面总结到如下内容  
1. 中间件保存为 middleware 数组，每个中间件定义为一个 async 函数，内部处理异步逻辑
2. 通过 compose 调用所有中间件，compose 返回一个函数
3. 在 http request callback 中，compose 返回函数被执行，输入参数为 ctx 对象
4. compose 返回函数执行结果输出为 promise

来看看 compose 是如何调用函数数组的  
```javascript
function flatten (arr) {
  return arr.reduce((acc, next) => acc.concat(Array.isArray(next) ? flatten(next) : next), [])
}
function compose (middleware) {
  middleware = flatten(middleware)
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

归纳总结  
1. 基于 promise 特性，在 compose 返回函数执行时，其返回的 promise 需要在各中间件函数执行完毕之后，才会变成 resolved 状态
2. 各中间件需要显示调用 `dispatch` 执行器，也就是 `next()`
3. 中间件函数调用顺序为先定义先执行，可以通过 next 显示调用下一个中间件函数执行器，执行完毕再回到当前函数，基于 `async` 异步函数原理

### 3.3 createContext

每次 http 请求调用的 callback
```javascript
callback () {
  const fn = compose(this.middleware)
  const handleRequest = (req, res) => {
    const ctx = this.createContext(req, res)
    return this.handleRequest(ctx, fn)
  }
  return handleRequest
}
```

createContext  
```javascript
createContext (req, res) {
  const context = Object.create(this.context)
  const request = context.request = Object.create(this.request)
  const response = context.response = Object.create(this.response)
  context.app = request.app = response.app = this
  context.req = request.req = response.req = req
  context.res = request.res = response.res = res
  request.ctx = response.ctx = context
  request.response = response
  response.request = request
  context.originalUrl = request.originalUrl = req.url
  context.state = {}
  return context
}
```

归纳分析：  
1. 约定：通过访问 context.request 来操作请求，不要通过 context.req 来操作原始请求对象，通 response
2. 为什么要对 node.request 封装一层？

## 4 归纳总结

1. koa 就是一个包含一组中间件函数的对象
2. 中间件函数是按照队列的方式进行组织执行的，基于 async 异步实现，通过 next 显示调用中间件函数执行器
3. koa 仅仅实现了一个 http 服务器，封装了 context 对象供各中间件对 request, response 处理
4. nodejs 服务端编程，几乎都是需要基于 http 服务实现，而 koa 正是对 http 服务的一层封装
5. context 对象在 app 各中间件应用中全局可以使用
6. 每次 http 请求都新建一个 context 对象，并且调用中间件链

## 参考文章

[thinkjs](https://thinkjs.org/doc/index.html)  
[koa2 官网](https://koa.bootcss.com/)  
[koa 进阶学习笔记](https://chenshenhai.github.io/koa2-note/note/start/info.html)  
[koa 中间件](https://github.com/guo-yu/koa-guide#%E4%B8%AD%E9%97%B4%E4%BB%B6middleware)
