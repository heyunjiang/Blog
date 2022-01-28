# http

![架构图](../images/http2.jpg)

目录

[1 基础知识](#1-基础知识)  
[2 http 基本优化要点](#2-http-基本优化要点)  
[3 http1.1相较与http1.0的优点](#3-http1.1相较与http1.0的优点)  
[4 https相较与http1.1的区别](#4-https相较与http1.1的区别)  
[5 将网站改造成https](#5-将网站改造成https)  
[6 SPDY](#6-SPDY)  
[7 http2【重点】](#7-http2【重点】)  
[8 有了http2，不用再做哪些优化](#8-有了http2，不用再做哪些优化)  
[9 tls 握手](#9-tls-握手)  
[10 tcp 基础](#10-tcp-基础)  
[11 慢启动](#11-慢启动)  
[12 http 缓存](#12-http-缓存)

## 1 基础知识

1. http协议建立在tcp协议之上，http协议的性能瓶颈及其性能优化都是针对tcp操作的
2. 目前在未应用https或http2之前，默认都是http1.1
3. https是运行在ssl/tls上的安全协议
4. spdy基于https，支持多路复用与header压缩，提高效率，拥有https的优点
5. http2是spdy的升级版本，支持2进制解析，拥有spdy的优点

http 请求模型

```http
# http post 请求头
POST /plmPortal/platForm/getPlatFormByEnterprise HTTP/1.1
Host: plmcloud.yonyou.com
Connection: keep-alive
Content-Length: 82
Accept: application/json, text/plain, */*
Origin: http://plmcloud.yonyou.com
User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36
Content-Type: application/json;charset=UTF-8
Referer: http://plmcloud.yonyou.com/plmPortal/dist/
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=43B8D7A60DFE3A8BC8EA3D28D87070A;

# http post 响应头
HTTP/1.1 200 OK
Server: Apache-Coyote/1.1
Content-Type: text/javascript;charset=UTF-8
Content-Length: 91
Date: Thu, 01 Nov 2018 10:42:09 GMT
```

常见 http 请求头字段解析

1. Host: 客户端域名
2. Connecttion：连接方式，keep-alive 表示长连接
3. Accept：希望接收到数据格式
4. Origin：源域
5. User-agent：客户端代理信息
6. Content-Type：请求数据体数据格式
7. Cookie
8. cache-control：缓存时间控制，单位 s

常见响应头字段解析

1. Server：服务器代理信息
2. Content-type：服务器返回数据类型，可以是 json, html, stream 等
3. Date：日期
4. Connection：连接方式， keep-alive 表示长连接
5. Last-modify：上次更新日期，通常用于静态资源文件
6. Etag
7. Cache-control：缓存时间控制，单位 s。no-cache 表示协商缓存，携带 Etag 发起验证请求；no-store 表示没有缓存；max-age 设置有效期；public 中间人可以缓存
8. Set-cookie

[cache 原理](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching)

### 1.1 内容协商

内容协商，指客户端和服务端协商资源表示形态，比如通过 `accept-encoding: gzip` 表示期望经过 gzip 压缩。通常包含如下信息  
1. accept-encoding
2. accept-language

### 1.2 定长包体

定长包体：如果 content-length 指定，那么接收端就会严格按照该参数来处理，如果实际数据 length 大于 content-length，那么接收方只会接收到指定长度的数据；如果实际数据 length 小于 content-length，那么接收方接收不到任何数据；
不定长包体：如果 http header 包含了 `Transfer-Encoding: Chunk`，那么 content-length 就会失效

### 1.3 分片下载

通过 http header Range 字段，指定接收的二进制数据长度，比如 `curl http://www.xxx.xxx?hello.txt -H 'Range: byte=10-14'` 表示获取 txt 文件的第11-15个字符。
1. 服务器会为这整个下载流程生成一个 `ETag` 指纹
2. response http code: 206 partial content
3. response Content-Range: bytes 123-129/129
4. request Range: bytes=123-。如果服务器不支持 Range header，那么会返回 200 全部的内容
5. 如果请求多段 Range:bytes=1-5,7-9，那么服务器会返回 `Content-Type: multipart/byteranges;boundary`

### 1.4 条件请求

响应头部  
1. Etag: W"xsdfsa"，W 表示 weak 弱验证器，不要 W 表示强验证器
2. Last-Modify: Http Date ，表示资源上次修改时间

请求头部  
1. If-Match: Etag
2. If-None-Match: Etag
3. If-Modify-Since: Http Date
4. If-Unmodify-Since: Http Date
5. If-Range: Etag/Http Date

应用场景  
1. 缓存更新，在缓存过期之后，可以通过 Etag or Http Date 去验证缓存是否失效。304 表示 not-modify，可以继续使用缓存，那后续还会验证是否失效吗？200 表示缓存更新
2. 增量更新，在分片下载和暂停下载时，可以使用 `If-Unmodify-Since` 或 `If-Match` 判断是否有更新。412 表示验证失败，需要重新获取所有数据
3. 更新丢失问题，在共同更新资源时，可以使用乐观锁保证第一个更新成功，后续的更新必须把第一次的更新获取到本地再更新。使用 `If-None-Match: Etag` 条件请求头来判断是否有更新

## 2 http 基本优化要点

### 2.1 带宽

目前网络基础建设得到很大提升，带宽不是影响的主要因素

### 2.2 延迟

1. 浏览器阻塞(对于同一域名，一般只有仅限的几个连接，超过被阻塞)
2. dns查询：浏览器获取目标服务器的Ip地址
3. 建立连接：每次连接都经历3次握手和慢启动

### 2.3 数据明文传输

改为加密传输

### 2.4 tcp3次握手

每次传输数据时，都需要重新建立连接，增加了大量的延迟时间。为什么需要三次握手？

> 怎么解决？  
> 保持长链接

### 2.5 header携带的内容过大

每次传输，header的内容都几乎不怎么变化，浪费空间

> 怎么解决？  
> 长链接、压缩

### 2.6 `connection: keep-alive` 使用过多

使用过多会对服务器造成过大的压力

> 怎么解决？  
> 只使用一个长链接，复用

## 3 http1.1相较与http1.0的优点

1. 缓存机制更多：增加更多的缓存策略
2. 带宽优化：支持请求部分资源，而不是整个对象(206 partial content)
3. 错误状态码增多：409表示请求的资源与资源的当前状态发生冲突，410表示服务器的资源被永久性删除
4. 增加host：服务器可以配置多个虚拟主机
5. 保持长连接：`connection: keep-alive`，减少tcp每次的连接(连续请求)

## 4 https相较与http1.1的区别

1. https需要ca安全证书
2. 端口不同： http 80，https 443
3. https传输内容加密
4. https有效防止运营商劫持
5. 对服务器压力更大：密钥计算，消耗cpu资源

## 5 将网站改造成https

1. 购买并安装CA证书
2. https存在ssl握手过程，不优化会存在速度降低

## 6 SPDY

1. 多路复用：降低延迟，对于每一个连接，都可以重复使用，发送多条消息
2. header压缩
3. 基于https协议加密
4. 主动推送：同名称静态文件单个请求，多个推送

> 注意：高版本的chrome对spdy已经不支持

## 7 http2【重点】

### 7.1 http2 相较于 http1 特点  

1. 多路复用：基于同一个 tcp 链接，可以实现多个 stream 流
2. 传输的数据量减小：头部压缩，data 数据是二进制数据
3. 主动推送
4. 仅在应用层协议做的变更，还是基于 tcp, ip 来实现

http2 可以基于 tls 实现，也可以基于 tcp 实现。不同实现，对应的简称不同  
1. 基于 tls，简称 h2。浏览器只支持 h2
2. 基于 tcp，简称 h2c

http2 的缺陷  
1. tcp + tls 握手时间过长
2. 队头阻塞问题：tcp 要求发送和接收的顺序保持一致，如果网络出现丢包，那么对应流在重传之前，就可能会出现剩余 ip 报文被阻塞在队列中，也就是原本并发的流，却收到阻塞变成串行

### 7.2 流、消息、帧

1. 建立一个 tcp 链接，保持长链接
2. 后续数据传递的是帧 frame，通过 wireshark 转包的都是一个一个的帧，也就是说实际请求就有 tcp + h2帧 构成
3. 每个帧会有一个 `streamId`，通过在应用层形成的流概念，体现了多路复用，即多 stream 复用一个 tcp 链接
4. 帧数据格式分多种：头部 header、data、priority、ping、push_promise(服务器推送) 等，每种类型对应自己的 type。每个 stream 要包含一个或多个帧。服务器按顺序发送帧，客户端组装，浏览器展示出来的每个请求还是独立查看
5. 消息是一种概念，每个流里面有1个或多个消息。消息也就是请求，浏览器会在 network 有体现
6. 在同一个 tcp 链接种，客户端发起的请求 `streamId 为奇数`，服务端发起的推送请求 streamId 为偶数
7. 每次建立一个新的 stream, 其 streamId 就必须往上增加，直到达到每个 tcp 链接对应的 stream 个数，然后会新建立 tcp 链接

### 7.3 HPACK 头部压缩算法

1. 使用 `静态字典序号` 表示常用的头部：比如 2 表示 `:method: get`，7 表示 `:scheme: https`
2. 使用 `haffman编码` 表示常用头部的复杂值，比如 `19: Haffman('/resource')`
3. 动态表是啥？动态编码算法，暂时不考虑

haffman 编码  
1. 原理：出现概率大的符号采用较短的编码，出现概率小的符号使用较长的编码
2. 静态 haffman 编码：`haffman 编码表`，使用指定数字表示常见的英文字母，整体位数缩短，自然提交就小了。比如一个字母使用一个字节表示，而 haffman 编码就可以使用 5 位来表示，可以达到 8:5 的压缩比，方便后续还原。而常见的比如 1 可以使用 `00001` 表示，不常见的 3 就使用 `011001` 表示，8:5 只是大致概率

### 7.4 服务器主动推送

在建立好一个 tcp 链接之后，后续可以传递不同类型的 frame 数据，而服务器推送也是此刻传递的。  
问题：这个 tcp 链接可以保持多久？因为服务器推送是可能很久之后才推送  
回答：服务器推送是基于已经建立好的 tcp 链接，如果之前的 tcp 关闭了，那么不会推送。这点不同于 websocket 一直保持的链接

基本知识
1. 服务器首先返回 frame type = push_promise 格式的帧，该帧中指明了具体数据所在的流 `push_promise_stream_id`
2. 接下来服务器会返回其他 frame，就包含了 header, data 帧

应用场景：  
1. 资源预先推送：比如 html 中包含多个 css, js 链接，在请求了第一个 html 之后，服务器就可以持续推送其他资源链接，客户端缓存

### 7.5 stream 状态

基础知识：同一个 tcp 链接上，可以同时存在多个 open 状态的 stream，然后传递 frame 帧数据。实际网络请求中，我们只有帧传递，流的状态是通过帧来表示

流的状态及帧  
1. idle：流初始化之后，状态为 idle，后续可以发送或接收 frame 数据，进入 open、reserved(local)、reserved(remote)
2. open：流在初始化之后，收到或发送 header 帧之后，进入 open 状态
3. reserved：流在初始化之后，收到或发送 push_promise 帧之后，进入 reserved 状态或直接 closed
4. half_closed：半关闭状态，表示后续不会再进行发送和响应。流在 reserved 状态，收到或发送 header 帧之后，即进入半关闭状态；流在 open 状态，收到或发送 end_stream 帧之后，进入半关闭状态
5. closed: 关闭状态。在 open 状态，如果收到或发送 reset_stream 帧，则直接关闭流；还可以有 half_closed 和 reserved 在操作之后进入 closed 状态

应用场景：取消请求，在 http1 中直接关闭 tcp 链接 (abort) 即可，在 http2 中则需要发送 RST_STREAM 帧来关闭当前流，而不影响其他流。在发送 RST_STREAM 时，包含了响应的错误码，这里暂时没有总结

stream 优先级：流的优先级，原因是我们请求 html, css, js, image 数据时的优先级不同。通过 frame.priority 帧 + weight 权重来控制流的优先级

### 7.6 stream 流控

除了在 tcp 层做拥塞控制，h2 提供了 http 层面的流控。  
为什么需要流控？  
1. stream 数量过多，会争夺 tcp 的流控制权，可能会导致 流阻塞
2. 代理服务器的内存有限，如果流过多会占用更多的内存

基本原则  
1. 流是应用层面的概念，也就是说应用层 http 也实现了流的拥塞控制
2. 由接收端设定上线，发送端遵循，通过 `WINDOW_UPDATE` 控制帧的 `window_size_increment` 字段来设定空间就这么大
3. 只有 data 帧会遵守流控，其他如 header 则不会
4. 流控不能被设置关闭，并且默认窗口都是 65535 字节
5. 流控仅正对 tcp 链接的两端，即代理服务器不透传 WINDOW_UPDATE 帧，那实际是如何控制的呢？

如何控制？  
1. 数据体积控制：接收端传递 WINDOW_UPDATE 帧给发送端，告诉发送端窗口就这么大。达到上线之后，则需要排队等候或者建立新的 tcp 链接
2. 流数量限制：也可以通过 `SETTINGS_MAX_CONNECT_STREAMS` 来控制 open 或 half_closed 状态的流的数量。达到上线则不再当前 tcp 链接上创建更多的流了，而是需要建立新的 tcp 链接

### 7.7 流的意义

流在网络中的体现，主要有 streamId, 状态，优先级等，那么流存在的意义是什么，如果我们直接基于 tcp 传递帧数据，没有流的相关东西，会怎么样？

1. 充分利用 tcp 性能：通过open流的数量、应用层拥塞窗口设置实现流控，解决 tcp 控制权争夺、代理服务器内存有限问题，实现多路复用
2. 保证资源完整性：同一资源的相关帧都在同一个流中，不会出现跨流、跨 tcp，结合流的优先级，保证资源请求及时性，不会出现部分资源等待太久问题
3. 为头部压缩提供环境：头部信息压缩 + 二进制 data 数据在流中存在，实现性能优化
4. 为服务器推送提供环境：streamId 为偶数即表示服务器推送

### 7.8 grpc 中应用 http2

grpc 框架是基于 http2 来实现服务器与服务器之间的通信。  
首先也是建立 tcp 链接，然后发送帧，此刻的帧是 grpc 帧，浏览器中的是 http2 帧

### 7.9 传输2进制数据

为什么传输二进制数据？底层网线和光缆不都是传输的二进制数据吗？  

1. http1.x 超文本传输协议，使用文本传输数据，比如 `hello234`，tcp 是传输二进制数据，ip 分二进制包
2. tcp 是将上层 http 的文本给转换成二进制？
3. http2 是直接处理为二进制数据，不需要 tcp 转换？
4. 文本数据，指的是宿主环境解析二进制数据之后呈现给用户的格式，用户编码使用的文本，后续也通过宿主环境解析处理为二进制数据
5. http2 是一种协议，浏览器和服务器可选
6. http2 和 http1.x 不同，在二进制数据处理上，http2 是自己处理，http1.x 是交给 tcp 处理

### 7.x h2 相关问题

1. http2 是在应用层上做的调整，如果充分利用 tcp 的性能呢？流控
2. 浏览器发起的请求都是 https://，服务器是怎么识别为 http2 的呢？在建立 tls 链接时，浏览器提供 h1, h2 让服务器选择，服务器主动选择
3. http1 浏览器对请求有个数限制，http2 有没有？也有，不过是不固定，h2 对同一个tcp链接中的流个数有限制，每个流可能对应多个消息请求
4. 为什么以二进制格式传递数据，整个体积就小了？
5. tcp 链接可以保持多久？
6. h2 为什么要存在流的概念，直接传递帧数据有什么问题？流的意义
7. 每个帧是怎么知道它所属哪个资源(消息)？即如何组装为一条消息？frameId，每个 frame 中包含了完整的消息需要的所有 frameId 集合
8. h2 如何配置? http2.createServer

## 8 有了http2，不用再做哪些优化

1. HTTP2对数据进行二进制分帧，
2. 在http和tls之间增加的一层分帧层
3. 每个分片包含分片信息和header压缩信息
4. 通过一个tcp连接，无序地传输分片，然后再在接收端组装
5. 而不必考虑代码合并或者sprite图优化了(所有需要的资源一次性地给你，然后分片无序传输给你)
6. 这个唯一的tcp连接是一个双工字节流连接，服务器主动推送资源
7. 分片之间存在优先级，解决了资源阻塞问题

## 9 tls 握手

2018 年更新到 tls 1.3

问题：  
1. tls 加密套件每个模块的作用?
2. 如果解决中间人攻击？证书
3. 对称加密的密钥是如何生成及共享的？通过安全套件生成，安全套件包含了 tls 版本、可用的加密算法、可用的压缩算法
4. 对称加密的加密原理是什么？异或运算，通过对称加密的密钥

握手阶段：在tcp3次握手之前，会有 tls 1.3 `二次握手`  
1. 客户端->服务端：clientHello，`安全套件列表`：可用的tls版本、可用的加密算法集合、可用的压缩算法，`客户端公钥列表`每个安全套件对应的客户端公钥
2. 服务端->客户端：serverHello、，`采用的安全套件`：采用的tls版本、采用的加密算法、采用的压缩算法，`ca证书`，`服务端公钥`

工作过程：2次握手结束之后，然后就普通 http 通信了，不过数据都采用公钥、私钥搭配进行加密传输。`搭配加密`是使用公钥和私钥 + 加密算法(比如AES)进行加密数据，属于对称加密

### 9.1 对称加解密算法 AES

加密步骤  
1. 明文分组：将明文数据拆分为 16 字节的分组，每个分组为 4*4 的矩阵
2. 末尾填充：最后一组明文需要填充为16字节，选择填充算法(按位填充、随机填充等)
3. 将每个明文分组使用 `AES 加密器` 和 `密钥` 加密，得到加密分组。异或加密(每轮加密的密钥都会做相应密钥转换)
4. 拼接加密组，得到加密数据

### 9.2 非对称加密算法 RSA

1. 公钥加密，只有私钥解密
2. 非堆成加密速度较慢，通常只是生成对称加密密钥时使用
3. 可以使用 openssl 库生成私钥，然后根据私钥生成公钥
4. 密钥是 `.pem` 格式，可以直接对普通文件加密，得到 `.en` 格式文件

### 9.3 证书认证签名流程

基础知识
1. pki 证书体系
2. 证书链：根证书认证机构、权威认证机构
3. 浏览器内置证书链，`通过验证证书合法性来判断公钥有效性`
4. 证书生成：权威机构通过申请者提供的公钥和信息，使用自己的私钥加密生成证书，浏览器和应用者服务器可以通过机构的公钥进行解密校验

不同类型的证书加密效率一致，只是对不同用户的身份认证流程不同，证书类型：  
1. dv 证书：domain validated 域名认证证书，免费
2. ov 证书：organization validated 机构认证证书，昂贵
3. ev 证书：extended validated 扩展证书，更昂贵，通常是一些其他机构

### 9.4 ECDH 密钥交换

RSA 加密算法有个问题：中间人可以把所有报文都保存下来，直到破解了服务器上的私钥，那么就可以对所有客户端发送的报文进行解密

tls1.3通过减少支持低复杂度的安全套件，来解决 tls1.2及之前版本的 freak 攻击。通常 tls1.3 支持的安全套件只有3-5个

tls1.3 ECDH 密钥交换流程  
1. 第一次握手：客户端生成公钥、私钥，握手时将公钥传递给服务端
2. 第二次握手：服务端生成公钥、私钥，握手时将公钥传递给客户端
3. 数据交互：客户端基于自己的私钥和服务端的公钥生成对称加密密钥，加密数据传递给服务端
4. 数据交互：服务端基于自己的私钥和客户端的公钥生成对称加密密钥，解密客户端的数据

说明  
1. ECDH 客户端和服务端通过密钥生成算法生成的对称密钥都是一样的
2. tls1.3 握手只有一个 rtt，也就是只有2次握手，而 tls1.2 是需要四次握手的

问题：ECDH 密钥交换流程中，服务端是动态生成的公钥私钥吗？那之前申请证书时产生的公钥和及时生成的公钥一样吗？

### 9.5 tls1.3 0 rtt 实现

tls 初始使用2次握手实现链接建立，也就是一个rtt。有如下方案改成0rtt  
1. sessionId：和之前生成的公钥私钥匹配，通过有效期判断之前的公钥私钥是否可以用。sessionId 存放在内存中，客户端每次把 sessionId 带上
2. sessionTicket：大致原理同 sessionId，不同点是服务器不存储 session，而是每次解密验证 sessionTicket 合理性，类似 jwt

0rtt 面临的 `重放攻击`：中间人拿到这条报文数据，不需要解密，不停重发这条消息即可，相当于数据库中的状态会一直被重置。解决方案是配置合理的过期时间

## 10 tcp 基础

tcp首部、ip首部有啥作用：从 http 到 tcp，再从 tcp 到 ip，每次都会包裹一层对应的首部，那么这个首部有啥作用？

1. tcp 首部包含了源端口、目的端口、序号、确认号、窗口值等
2. ip 首部包含了版本号、首部长度、数据总长度、ip分片标示号、可经过的路由器数(ttl)、源 ip、目的 ip

### 10.1 tcpdump 抓包

1. 安装 tcpdump 工具
2. tcpdump 命令

tcpdump 命令参数  
1. -D：查看对应设备，比如网卡、本地环回地址，`tcpdump -D`
2. -i：制定对应设备，默认 eth0，`tcpdump -i lo`
3. -c：控制抓取报文条数，`tcpdump -c 100`
4. -s：指定每条报文最大字节数，默认 262144 字节
5. -w：保存到指定文件中，`tcpdump -c 2 -w a`

搭配其他参数使用: `tcpdump -c 100 host www.baidu.com and port 443`

### 10.2 tcp 三次握手

1. 客户端 -> 服务端，传递 syn，其值为序列号 `seq: xxx`
2. 服务端 -> 客户端，传递 syn+ack，ack 值也是序列号，`ack: xxx`
3. 客户端 -> 服务端：传递 ack + data 数据

0次握手：tcp fast open 快速建立链接，使用 cookie 表示状态，即之前已经链接过了，这次不需要三次握手链接了。下次发起 tcp 请求直接带上 cookie 即可

### 10.3 netstat

使用 `netstat` 命令查看当前设备的网络状态  
1. -a: 显示所有链接和侦听端口
2. -n: 以数字显示地址和端口
3. -r: 显示路由表
4. -s: 显示每个协议的统计信息
5. -o(windows): 相关进程id
6. -b(windows): 可执行程序名字
7. -p(linux): 可执行程序名字

## 11 慢启动

关键词： `超时重传`、`tcp窗口`、`接收承受最大窗口`、`发送拥塞窗口`

1. 通信开始时，发送方的拥塞窗口大小为 1。每收到一个 ACK 确认后，拥塞窗口翻倍。
2. 由于指数级增长非常快，很快地，就会出现确认包超时。
3. 此时设置一个“慢启动阈值”，它的值是当前拥塞窗口大小的一半。
4. 同时将拥塞窗口大小设置为 1，重新进入慢启动过程。
5. 由于现在“慢启动阈值”已经存在，当拥塞窗口大小达到阈值时，不再翻倍，而是线性增加。
6. 随着窗口大小不断增加，可能收到三次重复确认应答，进入“快速重发”阶段。
7. 这时候，TCP 将“慢启动阈值”设置为当前拥塞窗口大小的一半，再将拥塞窗口大小设置成阈值大小（也有说加 3）。
8. 拥塞窗口又会线性增加，直至下一次出现三次重复确认应答或超时。

[慢启动及原理传输](http://blog.csdn.net/book_zhouqingjun216/article/details/51812786)

## 12 http 缓存

time: 2021-04-21 14:33:48  
参考文章 [mdn http cache](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching)

缓存分类  
1. 私有缓存：即用户浏览器缓存，通过 http get 下载的资源，提供给用户浏览器前进后退、离线查看、减少多余请求等
2. 共享缓存：即 isp 或公司环境代理，保存在中间服务器上的缓存资源，通常代理缓存会返回 response.headers.age 表示共享缓存有效期

### 12.1 http cache-control 控制缓存

1. no-store：不要缓存
2. no-cache：协商缓存，每次会发请求到服务器(发的什么请求，options 吗？)，携带缓存时间验证参数，未过期则返回 304，使用本地缓存
3. public：共享缓存，可以被中间人缓存
4. private：只能被浏览器缓存
5. max-age=31536000：强缓存，距离请求开始的缓存时间秒数，存储在 memory or disk
6. must-revalidate：缓存校验，每次使用时，都需要去校验是否有效

cache-control: no-cache 位于  
1. response: 表示资源走协商缓存
2. request: 表示资源不会默认走本地缓存和代理缓存，都会向服务器发起请求。如果服务器强行返回 304，则还是会取缓存

chrome 勾选 disable-cache 就会在 http request header 加上 `cache-control: no-cache` 字段，并且强行向服务器发起请求，不会主动走缓存(说明勾选 disable-cache 不是只修改了 http request header)

问题：  
1. 304 是从哪里读取的缓存？memory or disk?
2. 存储在 memory or disk，是有何根据？
3. 缓存时间控制属性 freshness_lefttime: max-age, smax-age, expires, 预估时间 优先级？smax-age > max-age > expires > 预估时间(rfc 文档建议(downloadDate - Last-Modified) / 10)

[从浏览器的Disable cache谈起](https://juejin.cn/post/6844904145057480718)

### 12.2 缓存过期

缓存过期的判断方式: `freshness_lefttime > Age`  
freshness_lefttime: smax-age, max-age, expires, 预估时间  
Age: 表示原服务器发出响应到使用缓存的请求发出时，因为请求的数据可能是缓存在中间缓存服务上。通常请求中包含了 Age header

过期处理：  
1. 浏览器命中缓存，如果响应 cache-control 包含了 `max-stale: 60`，那么在 60s 内都可以使用
2. 否则会发起请求携带 `if-none-match` +  `Etag` 或 `if-modified-since` (如果请求资源 response 返回了 Etag，后续 request 验证缓存过期会带上) 到服务器监测资源是否有更新
3. 没有更新服务器返回 304，继续使用缓存，下次请求依然会去验证，不过每次因为不需要数据的传输，速度还是很快
4. 如果服务器验证 `if-none-match` 或 `if-modified-since` 已过期，则会返回最新资源，客户端再次根据 cache-control 来更新缓存，把之前旧的缓存删除

问题：如果还在缓存有效期内，如何强更新呢？  
答：设置 `cache-control: must-revalidate`；点击浏览器刷新按钮；浏览器偏好设置里设置Advanced->Cache为强制验证缓存；vary 校验

vary 校验缓存使用规则：请求服务器最新资源时，服务器除了返回 cache-control 外，还返回了 `vary: Content-Ecoding` 字段；在通过 cache-control 添加了资源缓存后，后续资源请求需要携带缓存资源 vary 要求的 http header 字段及值，匹配上才可以使用缓存，因为需要保证每次的数据格式一致

### 12.3 缓存实践

不同的资源对应不同的缓存策略  
通常来说，js, css 是不经常发生变化，但是 html 是经常发生变化的。在 spa 应用中，变化的 js 的 hash 值是会变化的。
1. html: 不缓存，或者缓存很短。cache-ctrol: no-store
2. js库、css库: cache-control: max-age=10年
3. js普通文件、css普通文件: cache-control: no-cache + etag | last-modify 来协商缓存

## 13 http3

quic 协议，也叫 http3，是基于 udp 实现了 tcp 之前的相关功能，还是基于 http2 的 api 实现  
1. 在浏览器中的体现为 `Protocol = http/2 + quic/43`
2. quic 实现了拥塞控制、丢包重传、tls 1.3、多路复用 (multiStreaming)
3. 链接迁移：通过 frame 帧中的 CID(connection id) 控制目标
4. 解决了对头阻塞问题：udp 没有队列概念，不要求按顺序到达，也就是说流的数据来了，谁先完整就先处理谁
5. 1个 rtt 解决握手问题
6. 0个 rtt 恢复会话握手，即使用上次建立链接生成的密钥信息

## 参考文章

[混合内容升级 https](https://juejin.cn/post/6844904101826789389)  
[知乎 如何看待 http3](https://www.zhihu.com/question/302412059)  
[http3 了解](https://http3-explained.haxx.se/zh/)  
[二进制编码传输协议](https://segmentfault.com/a/1190000022356844)  
[http 传输文本还是二进制](https://segmentfault.com/q/1010000006670932)
