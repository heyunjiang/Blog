# 深入浏览器-bom

time: 2018.11.20

目录

[1 bom 内容](#1-bom-内容)  
&nbsp;&nbsp;[1.1 window](#1.1-window)  
[2 ie 专属](#2-ie-专属)

## 1 bom 内容

通常说的浏览器 bom 是什么呢？是浏览器对象模型，包含浏览器的一些信息，是浏览器提供的 api 供操作，主要有以下接口：window、navigator、history、indexedDB、cacheStorage、localStorage、sessionStorage

### 1.1 window

众多宿主环境中，浏览器实现全局对象 window ，nodejs 实现了全局对象 global。

属性

1. window.applicationCache：返回应用缓存对象的引用
2. self.caches：返回与当前上下文相关的 CacheStorage 对象，多用在 service worker 存储离线资源
3. window.crypto：用于操作 getRandomValues() ，生成安全随机数
4. window.devicePixelRatio：返回当前物理设备与 css 像素分辨率的比值
5. window.frames：返回当前窗口的所有直接子窗口集合，但是有如下特点：返回值同时是一个类数组和object
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

方法

1. window.getComputedStyle()：返回实时的节点的 `CSSStyleDeclaration` 对象信息，获取的是当前浏览器绘制的最终结果样式数据
2. window.matchMedia()：js 进行媒体查询，返回布尔值
3. window.moveTo(x, y)：将窗口移动到指定坐标位置，要求是通过 window.open 打开的窗口，并且只有一个标签页
4. window.postMessage()：安全地实现跨源通信，同一浏览器多个窗口之间跨域通信，结合 `window.addEventListener("message", receiveMessage, false);` 使用
5. window.requestAnimationFrame(callback)：callback 会在浏览器下次绘制时执行
6. window.resizeBy(x, y)：调整窗口大小，要求是通过 window.open 打开的窗口，并且只有一个标签页
7. window.resizeTo(x, y)：调整窗口大小，要求是通过 window.open 打开的窗口，并且只有一个标签页
8. window.scrollTo()：滚动窗口到指定位置。不支持设置滚动时间
9. window.stop()：浏览器停止加载资源，同点击浏览器的停止按钮
10. window.atob()：解码 base-64 编码过的字符串。编码使用 window.btoa()
11. window.getSelection()：获取用户选择的文本范围或光标的当前位置

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