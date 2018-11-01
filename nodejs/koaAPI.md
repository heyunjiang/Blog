# 原由

time: 2018.11.1

目录

[1 目的](#1-目的)  
[2 koa](#2-koa)  
&nbsp;&nbsp;[2.1 koa 对象方法](#2.1-koa-对象方法)  
&nbsp;&nbsp;[2.2 上下文 Context](#2.2-上下文-Context)  
&nbsp;&nbsp;[2.3 Request 别名](#2.3-Request-别名)  
&nbsp;&nbsp;[2.4 Response 别名](#2.4-Response-别名)  
&nbsp;&nbsp;[2.5 koa response](#2.5-koa-response)  
[3 koa 实战](#3-koa-实战)  

## 1 目的

已经掌握了前端开发，目前向中间层学习，准备入手 nodejs 做服务端，但是又没有找到合适的学习方式。  
看到 thinkjs 和 egg 都是基于 koa 进行扩展的，打算先学习一下 koa，通过 koa 学习 nodejs 的应用，在服务端的位置等。

## 2 koa

1. koa 应用程序：包含一组中间件函数的对象
2. 中间件组织方式：堆栈，采用 next() 放入栈 (非队列)

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

采用 new 的方式创建 app 对象，该对象有一系列方法

这里总结了 koa 的一系列 api

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

1. ctx.req：node 的 request 对象
2. ctx.res：node 的 response 对象
3. ctx.request: koa 的 request 对象
4. ctx.response：koa 的 response 对象
5. ctx.state：推荐的命名空间，用于通过中间件传递信息和前端视图
6. ctx.app：应用程序的实例引用
7. ctx.cookies.get(name, options)：koa 获取 cookie，使用 [Cookies](https://github.com/pillarjs/cookies) 模块
8. ctx.cookies.set(name, value, options)：koa 设置 cookie
9. ctx.throw(status, msg, properties)：ctx 抛出错误。`不太懂`
10. ctx.assert(value, status, msg, properties)： 类似 invarient ，当 !value 时，抛出错误
11. ctx.respond：通过设置 `ctx.respond = false` ，可以绕过 koa 内置的 response 处理，操作原始的 response 对象

### 2.3 Request 别名

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

### 2.4 Response 别名

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

## 3 koa 实战

koa 只是对 http 服务做了一个封装，主要 api 3 类，context, request, response

对于 nodejs 的应用，很多还是要写它原本的api。那怎么实战 nodejs 呢？

[thinkjs](https://thinkjs.org/doc/index.html)
