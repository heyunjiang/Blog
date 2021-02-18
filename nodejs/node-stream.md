# node-stream

time: 2020.2.18  
author: heyunjiang

## 背景

通过 nodejs stream 对流加深理解

## 1 流是什么

流是处理流式数据的抽象接口。那什么又是流式数据呢？流式数据是基于 string、Buffer 来实现的  
而 nodejs stream 模块又是用于构建实现了流接口的对象，注意是用于构建对象。

例子：http 请求和 process.stdout 都是流的实例，本质基于 stream 实现  
所有的流都是 EventEmitter 的实例。有什么用？  
创建流时，流会基于 string | Buffer 工作，并且以对象模式运作

## 2 流的类型

1. 可读流：fs.createReadStream
2. 可写流：fs.createWriteStream
3. 可读可写流：net.socket
4. Duplex流：在读写过程中可以转换或修改数据的流，比如 zlib.createDeflate

## 3 流的缓冲

在 [缓冲和视图](../es/es6-缓冲和视图.md) 中，总结了 javascript 实现二进制数据的读写，是通过提供中间缓冲层实现，而这个中间缓冲层是由 ArrayBuffer 实现，对应宿主环境提供视图层来实现对缓冲层的读写，比如 Int32Array、DataView、StringView 等。  
在 nodejs stream 中，流就是二进制数据或字符串的集合，同样也采用了缓冲区，内部由 buffer 实现，使用 writable.writableBuffer、readable.readableBuffer 来读取。

> 问题：缓冲层是有多大的存储限制？会不会存在溢出？谁可以控制？  
> 答：可缓冲的数据大小，由流构造函数的 highWaterMark 参数决定，其指定了字节的总数或对象的总数。不会存在溢出，因为一旦达到指定阈值，则会停止将底层资源数据加入缓冲区中，并且已经加入缓冲区中的数据，会一直等待流的消费者读取消费。

一些关键函数：  
1. 缓冲区 ->读取 底层资源数据：readable._read()
2. 开发者 ->写入 缓冲区：writable.write(chunk) 写入缓冲区可写流

> 问题：为什么需要缓冲区呢？直接提供对底层数据读取不好吗？  
> 答：1. 解决读写不一致的问题 2. 

## 4 可写流

所有可写流都实现了 `stream.Writable | stream.Readable` 类定义的接口，常见可写流如下  
1. http request, response
2. fs 的可写流
3. zlib 流
4. crypto 流
5. tcp socket
6. 子进程 stdin，process.stdout, process.stderr

stream.Writable class  
1. 支持的事件：close, drain, error, finish, pipe, unpipe
2. writable.cork()、writable._writev()、writable.uncork()：将数据都写入到缓冲区，而不是底层数据，这可能会占用很大内存，目的是解决出现行头阻塞问题。writable.writableCorked
3. writable.destory(error)：销毁流，后续通过 writable.destroyed 来判断是否被销毁了
4. writable.end(chunk, encoding, cb)：后续通过 writable.writableEnded 判断
5. writable.setDefaultEncoding()
6. writable.writableFinished：在触发 finish 事件之后变为 true
7. writable.writableHighWaterMark：读取构造函数的 highWaterMark 阈值
8. writable.write(chunk, encoding, cb)：chunk 必须是字符串、Buffer、Unit8Array

## 5 可读流

两种读取模式  
1. flowing：流动模式
2. pausing：暂停模式

## 参考文章
