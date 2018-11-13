# koa 进阶

time: 2018.11.12

## 1 目的

在掌握了 [koa基础 api](./koaAPI.md) 之后，还不知道如何灵活运用，所以不能理解 koa 的灵魂所在。写这篇文章，目的是为了深入理解 koa ，学习如何使用它

## 2 问题

1. koa 中间件是不是只能写成 async 函数？
2. promise 内部加的 setTimeout 在 event loop 的本轮循环中什么时候执行呢？

## 3 回答问题

### 3.1 koa 中间件是不是只能写成 async 函数？

回答：只能使用 async 。在 koa2 的中间件源码实现中，只能使用 async 函数。在 koa1 中使用的是 generator 实现。在 koa2 种使用 generator ，需要使用 `koa-convert` 来转换

```javascript
// koa use 源码
use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
}
```

## 4 实战

目前实现了一个文件上传系统demo，关键技术

1. koa 实现 http 服务器
2. 自定义中间件，实现文件上传 formData + post 处理
3. ctx.req 获取请求可读流，写入 `busboy` 可写流，busboy 实现了文件、字段监听事件，通过 `fs.createWriteStream()` 写入文件，实现保存文件

## 参考文章

[1. 阮一峰-es6入门/async](http://es6.ruanyifeng.com/#docs/async)  
[2. koa2 进阶学习笔记](https://chenshenhai.github.io/koa2-note/note/start/quick.html)
