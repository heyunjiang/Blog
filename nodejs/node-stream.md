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
4. Duplex流：在读写过程中可以转换或修改数据的流，比如 zlib.createDeflate, tcp socket, crypto 双工流；转换流有 zlib, crypto，特点是 readable 和 writable 是相关联的

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

### 5.1 可读流的两种读取模式

可读流的2种模式，是对 nodejs 流数据内部状态管理的一种抽象

1. flowing：流动模式，数据自动从底层系统读取，通过 EventEmitter 接口的事件尽可能快的提供给应用程序
2. pausing：暂停模式，必须显示调用 stream.read() 读取数据块

2者区别  
1. 流动模式简单，通过事件监听即可从可读流中获取数据
2. 暂停模式可以让开发者灵活控制数据生产

所有可读流默认为暂停模式，但是可以切换到流动模式。  
如果定义了 readable 事件句柄，则始终为暂停模式，通过 readable.read() 消费数据。  
从暂停模式切换到流动模式  
1. 添加 data 事件句柄
2. 调用 stream.resume()
3. 调用 stream.pipe() 将数据发送到可写流

也可以从流动模式切换到暂停模式  
1. 调用 stream.unpipe() 移除所有管道，并且会使 data 事件失效
2. 如果自身没有管道目标，则可以调用 stream.pause()；如果有管道，则 pause 无效

注意：  
1. 去除 data 事件句柄不能暂停流。如果有管道，数据依然会产生；如果没有管道，数据不产生
2. 只有提供了消费流或者忽略流的机制，可读流才会产生数据
3. 从暂停模式切换到流动模式，如果没有定义 data 事件或管道，则会丢失数据，后续不再产生数据

### 5.2 可读流的三种状态

1. readable.readableFlowing === null 表示没有提供消费流的机制，不会产生数据
2. readable.readableFlowing === false 调用 readable.pause | unpipe | 接受到背压，则会变成 false
3. readable.readableFlowing === true 如果原本处于 null，则直接绑定 data 事件，可切换到 true；如果原本为 false，则需要调用 readable.resume 并绑定 data 事件，或添加管道 ，才可以切换到 true

### 5.3 stream.readable 类

1. 支持的事件：close, data, error, end(可写流中写完为 finish), pause, readable, resume
2. readable.destroy(error)：销毁流，搭配 readable.destroyed
3. readable.isPaused()：注意是方法，不是属性
4. readable.pause()
5. readable.pipe(destination, options)：建立管道，将可读流数据导向可写流；返回的是可写流引用(应该是目标可读流，文档写错了)，可以链式调用
6. readable.read(size)：如果没有 size，则返回缓冲区中所有数据；通常需要搭配 while 循环使用读取
7. readable.resume()
8. readable.setEncoding('utf8)
9. readable.unpipe(destination)：destination 不传则会解绑所有管道
10. readable.unshift(chunk, encoding)：将数据放回缓冲区中，让其他消费者消费

## 6 实例

1. 可写流：fs.createWriteStream('file.txt')
2. 可读流：readable.on('data', cb)
3. 管道：readable.pipe()

## 7 手动实现可读可写流

## 参考文章
