# node-http

time: 2021.1.22  
author: heyunjiang

## 概述

这里包含了 http, http2, https 系列总结，也作为 koa 核心实现的预备知识，可以结合 [计算机基础/http1、http2简介](计算机基础/网络-专题-http.md) 来了解

## 1 http

1. http.agent：负责管理 http 客户端的连接持久性和重用
2. http.ClientRequest：由 http.request() 创建对象实例
3. http.Server：继承自 net.Server，由 http.createServer() 创建对象实例
4. http.ServerResponse：作为 http server request 事件的第二个参数，通常用于设置响应头、状态吗、状态msg
5. http.IncomingMessage：作为 http server request 事件的第一个参数，通常用户访问响应状态、消息头、数据

常用方法：  
1. http.createServer()：创建 http 服务器，结果为 http.Server 实例
2. http.get()：是不带请求体的 http.request
3. http.request()：发出 http 请求，可以指定远程服务器地址、端口，也可以指定请求 headers、method、protocol、timeout 等

## 2 http.ServerResponse 类

在使用 `http.createServer(options, requestListener)` 启动服务器之后，在 requestListener callback 或 request 事件时，作为第二个参数 response 传入

服务器返回消息给客户端  
1. response.write(data, encoding)
2. response.end([data[, encoding]][, callback])

每个 response 必须调用 end 方法结束本次请求，调用之后表示通知服务器本次请求已经完成
