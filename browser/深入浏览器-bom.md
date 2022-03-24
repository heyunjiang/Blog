# 深入浏览器-bom

time: 2018.11.20

update: 2018.11.30

目录

[1 bom 内容](#1-bom-内容)  
&nbsp;&nbsp;[1.1 window](#1.1-window)  
&nbsp;&nbsp;[1.2 navigator](#1.2-navigator)  
&nbsp;&nbsp;[1.3 文档生命周期事件](#1.3-文档生命周期事件)  
[2 ie 专属](#2-ie-专属)

## 1 bom 内容

通常说的浏览器 bom 是什么呢？是浏览器对象模型，包含浏览器的一些信息，是浏览器提供的 api 供操作，主要有以下接口：window、navigator、history、indexedDB、cacheStorage、localStorage、sessionStorage、serviceWorker、screen

### 1.1 window

众多宿主环境中，浏览器实现全局对象 window ，nodejs 实现了全局对象 global。  
window 对象主要包含了浏览器 `几何大小`、`性能`、`移动`、`滚动`等 api

属性

1. window.applicationCache：返回应用缓存对象的引用
2. self.caches：返回与当前上下文相关的 CacheStorage 对象，多用在 service worker 存储离线资源
3. window.crypto：用于操作 getRandomValues() ，生成安全随机数
4. window.devicePixelRatio：返回当前物理设备与 css 像素分辨率的比值，比如我的雷神 ips 就是 1.25
5. window.frames：返回当前窗口的所有直接子窗口集合，但是有如下特点：`返回值同时是一个类数组和object`
6. window.fullScreen：返回 boolean ，表示是否在全屏模式下
7. window.innerHeight：返回浏览器窗口视口的高度，不包含标签栏，但是包含滚动条。同 window.innerWidth
8. window.outerHeight：返回浏览器整个的高度。同 window.outerWidth
9. self.isSecureContext：标识当前上下文是否安全，多用在 service worker 环境中
10. window.location：返回浏览器当前网址信息对象
11. window.locationbar：返回浏览器地址栏是否隐藏的对象 `{visible: true}`。同 window.menubar、window.personalbar
12. window.performance：返回网页加载过程的性能数据，主要包括加载时间、内存占用情况
13. window.screen：返回屏幕相关信息对象，包括显示器、浏览器等宽高信息
14. window.screenY：返回浏览器顶部距离桌面顶部的像素值。同 window.screenX
15. window.self：返回对当前 window 对象的引用
16. window.pageYOffset：返回浏览器滚动了多少距离。同 window.scrollY
17. window.top：返回窗口体系中的最顶层窗口的引用
18. window.frameElement: 返回当前 window 对象所在的元素，比如 `iframe` 或者 `embed`，如果 window 属于顶层，则返回 null
19. window.parent: 返回当前窗口的父窗口，如果 window 属于顶层，则返回自身

方法

1. window.getComputedStyle()：返回实时的节点的 `CSSStyleDeclaration` 对象信息，获取的是当前浏览器绘制的最终结果样式数据
2. window.matchMedia()：js 进行媒体查询，返回布尔值
3. window.moveTo(x, y)：将窗口移动到指定坐标位置，要求是通过 window.open 打开的窗口，并且只有一个标签页
4. window.moveBy(x, y)：窗口移动，便宜量，要求是通过 window.open 打开的窗口，并且只有一个标签页
5. window.postMessage()：安全地实现跨源通信，同一浏览器多个窗口之间跨域通信，结合 `window.addEventListener("message", receiveMessage, false);` 使用。注意：使用 `targetWindow.postMessage()` ，向谁发送消息，则谁使用 postMessage 方法
6. window.requestAnimationFrame(callback)：callback 会在浏览器下次绘制时执行
7. window.resizeBy(x, y)：调整窗口大小，要求是通过 window.open 打开的窗口，并且只有一个标签页
8. window.resizeTo(x, y)：调整窗口大小，要求是通过 window.open 打开的窗口，并且只有一个标签页
9. window.scrollTo(x, y)：滚动窗口到指定位置，可以设置平滑滚动，代替 window.scroll() 。不支持设置滚动时间
10. window.scroll(x, y)：滚动窗口到指定位置。不支持设置滚动时间
11. window.scrollBy(x, y)：滚动窗口，偏移量，不是滚动到指定位置。不支持设置滚动时间
12. window.stop()：浏览器停止加载资源，同点击浏览器的停止按钮
13. window.atob()：解码 base-64 编码过的字符串。编码使用 window.btoa()
14. window.getSelection()：获取用户选择的文本范围或光标的当前位置

### 1.2 navigator

navigator 属于用户代理，包含的也是 `地理位置`、`语言`、`代理信息`、`sendBeacon` 等信息

属性

1. navigator.geolocation：[定位](https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation/Using_geolocation)
2. navigator.language：返回所使用浏览器的语言，`"en"、"en-US"、"fr"、"es-ES"、"zh-cn"` 等
3. navigator.mimeTypes：返回一个可被浏览器识别的 [MimeType](https://developer.mozilla.org/zh-CN/docs/Web/API/MimeType) 列表
4. navigator.onLine：是否联网
5. navigator.userAgent：返回浏览器基本信息，字符串
6. navigator.platform：返回用户浏览器所在的系统平台类型

方法

1. navigator.javaEnabled()：是否启用了 java
2. navigator.sendBeacon(url, data)：向服务器发送数据，通常用于统计数据

> 无感发送数据方式：设置 img 的 src 属性；使用 navigator.sendBeacon 方法

### 1.3 文档生命周期事件

> 总结这节是为了增强对文档生命周期触发的事件印象。

浏览器物理位置信息，可以通过 window 对象获取，包括获取显示器高宽、浏览器高宽、浏览器视口高宽、滚动距离等。

document 获取节点位置信息可以通过 element 获取，包括节点本身高宽、节点视口高宽、节点相对于视口的坐标位置等。

那么文档从获取到加载完毕触发了哪些事件呢？对应 window.performance.timing 的哪些字段？

> html5 规范规定：window.onbeforeunload 可以忽略 window.showModalDialog、window.alert、window.confirm、window.prompt 的执行

主要是这6个事件：onloadstart、onload、onloadend、DOMContentLoaded、onbeforeunload、onunload

执行顺序：onloadstart -> onload -> DOMContentLoaded -> onloadend -> onbeforeunload -> onunload

> DOMFrameContentLoaded 只作用于 frames ，同 DOMContentLoaded

### 1.4 xhr vs fetch

区别  
1. xhr 基于原型对象，fetch 直接使用
2. xhr 基于事件配置，fetch 根据配置，返回 promise
3. httpcode 处理方式不同：xhr 非 200 会直接报错，fetch 在非 200 还是返回 resolved 的 promise，只有网络出现问题才会出错
4. cookie 默认携带：xhr 会携带，fetch 不会，必须显示指定 `credentials`
5. 请求取消：xhr 支持 abort 取消，fetch 不能取消
6. 进度提示：xhr 支持，fetch 不支持
7. fetch 可以搭配 caches api 实现：window fetch event + serviceworker + cache api
8. fetch 可以拦截 fetch 请求，所以可以处理跨域内容
9. fetch 支持 response 对流的处理

应用场景  
1. 普通网络请求直接使用 fetch
2. 文件上传、进度需要使用 xhr
3. 请求超时重传需要使用 xhr，因为需要取消

## 2 ie 专属

### 2.1 ie 浏览器模式、文本模式

只有ie才有这2个模式

优先级：文本模式 > 浏览器模式

浏览器模式: 用于切换ie版本(默认文档模式)、浏览器dom条件备注解析、user-agent

文本模式: 指定渲染引擎采用何种网页渲染方式

## 参考文章

[mdn navigator](https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator)  
[mdn window](https://developer.mozilla.org/zh-CN/docs/Web/API/Window)  
[mdn base 64 编码解码](https://developer.mozilla.org/zh-CN/docs/Web/API/WindowBase64/Base64_encoding_and_decoding)  
[mdn 事件类型一览表](https://developer.mozilla.org/zh-CN/docs/Web/Events)