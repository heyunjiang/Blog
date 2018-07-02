# 深入浏览器-dom

## 1 常见 dom 操作api

## 2 不常见 dom 操作api

### 2.1 浏览器可见性 api

属于 h5 新的 dom api，也叫页面可见性 api

兼容：ie11+、ios safari10.3+

总共3部分组成

#### 2.1.1 document.hidden

布尔值，表示当前页面是否处于浏览器最小化、后台标签页、预渲染状态中(浏览器被其他软件遮盖不算，因为浏览器只能判断自身bom、dom变化)

#### 2.1.2 document.visibilityState

4个值

1. hidden: 浏览器最小化、后台标签页
2. visible: 当前标签页
3. prerender: 浏览器预渲染，页面还不可见
4. unloaded: 页面正在从内存中卸载

#### 2.1.3 document.onvisibilitychange

当浏览器可见性变化的时候，触发的事件

## 参考文章

1. [markyun-blog](https://github.com/markyun/My-blog/tree/master/Front-end-Developer-Questions/Questions-and-Answers)
2. [what-happens-when](https://github.com/skyline75489/what-happens-when-zh_CN)
