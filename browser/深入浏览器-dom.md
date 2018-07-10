# 深入浏览器-dom

document object model

目录

- 1 dom 大全归纳
  - 1.1 dom 基础知识
  - 1.2 节点属性
  - 1.3 常用 dom api
  - 1.4 常用 dom api 对比
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

element api

1. appendChild() removeChild() replaceChild() insertBefore() *没有 insertAfter()*
2. innerHTML
3. style, className, id, lang, title: 长点常用属性快捷访问或设置方式
4. `attributes`: 节点属性集合，NamedNodeMap
5. childNodes, `hasChildNodes`: 节点的后代节点集合，NodeList
6. clientHeight, clientWidth: 元素可见高度、宽度
7. cloneNode(): 克隆节点及其后代，可选参数-boolean，true表示属性一并 clone
8. `compareDocumentPosition()`: a.compareDocumentPosition(b)，比较a,b两个节点的位置关系
9. contentEditable, dir, `isContentEditable()`
10. firstChild
11. getAttribute(), `getAttributeNode()`: 前者获取对应属性节点的值，后者获取对应属性节点
12. hasAttribute(), `hasAttributes()`: 前者判断是否有某个属性，后者判断是否有属性
13. 

document api

1. `document.documentElement`, document.body, document.head *没有 document.html*
2. 文档对象集合：document.all, document.anchors, document.forms, document.images, document.links
3. 文档属性结合：document.cookie, document.domain, document.lastModified, `document.referrer` (表示从哪儿来的), document.title, document.URL
4. 文档对象方法：document.open, document.close, document.write, document.writeln
5. document.documentElement.isDefaultNamespace(namespace)：检查 namespace 是否是默认的命名空间

#### 1.3.1 compareDocumentPosition 值说明

1. `1` 不在同一文档中
2. `2` b 在 a 之前
3. `4` b 在 a 之后
4. `8` b 包含 a
5. `16` a 包含 b
6. `32` 待定

问题：以下输出为什么是10, 10又代表什么

```javascript
<div id="hello"><p id="world">fa</p></div>

console.log(document.getElementById('world').compareDocumentPosition(document.getElementById('hello')))
```

### 1.4 常用 dom api 对比

clientHeight vs offsetHeight

## 2 不常见 dom 操作api

### 2.1 浏览器可见性 api

属于 h5 新的 dom api，也叫页面可见性 api

兼容：ie11+、ios safari10.3+

总共3部分组成

1 document.hidden

布尔值，表示当前页面是否处于浏览器最小化、后台标签页、预渲染状态中(浏览器被其他软件遮盖不算，因为浏览器只能判断自身bom、dom变化)

2 document.visibilityState

四个值

1. hidden: 浏览器最小化、后台标签页
2. visible: 当前标签页
3. prerender: 浏览器预渲染，页面还不可见
4. unloaded: 页面正在从内存中卸载

3 document.onvisibilitychange

当浏览器可见性变化的时候，触发的事件

## 参考文章

1. [w3school](http://www.w3school.com.cn/tags/index.asp)
2. [mdn-element](https://developer.mozilla.org/zh-CN/docs/Web/API/Element)
