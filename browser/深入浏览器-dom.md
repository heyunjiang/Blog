# 深入浏览器-dom

document object model

目录

- 1 dom 大全归纳
  - 1.1 dom 基础知识
  - 1.2 节点属性
  - 1.3 常用 dom api
- 2 不常见 dom 操作api
  - 2.1 浏览器可见性 api

## 1 dom 大全归纳

### 1.1 dom 基础知识

1. 每个 window 对象，都有一个 `document` 属性，指向的是 `dom tree`
2. dom tree 的根节点是 `html`
3. 文本节点：除了元素节点外，文本也是节点(在现代浏览器中文本节点与元素节点处理方式有何异同？)
4. 属性节点：元素节点里面的属性，也称为属性节点

例如

`<a href="https://github.com/heyunjiang">heyunjiang</a>`

元素节点：`a` ，属性节点：`href` ，文本节点：`heyunjiang`

### 1.2 节点属性

1. nodeName : 文本节点始终是 `#text`
2. nodeValue : 文本节点是文本本身；属性节点是属性值
3. nodeType : 元素节点 -> 1，属性节点 -> 2，文本节点 -> 3，注释节点 -> 8
4. innerHTML

### 1.3 常用 dom api

操作方式 `node.`

1. appendChild() removeChild() replaceChild() insertBefore()
2. innerHTML
3. style : 获取或设置样式
4. document.documentElement: 全部文档
5. document.body: 文档主体

> 注意：没有 insertAfter()

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
3. [w3school](http://www.w3school.com.cn/tags/index.asp)
