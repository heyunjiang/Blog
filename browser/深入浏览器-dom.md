# 深入浏览器-dom

document object model: 是 html 和 xml 文档的编程接口，提供了对文档的 `结构化表述` ，定义了一种方式提供给程序对该结构进行访问，从而改变文档的结构、样式和内容。 `这个结构是一个集合` ，也称之为树，每个节点的值是一个对象，包含该节点的属性和方法。`dom` 将页面和程序语言连接起来。

```javascript
// dom tree example
"people": {
    "person": [{
      "address": [{
        "@street": "321 south st",
        "@city": "denver",
        "@state": "co",
        "@country": "usa"
      }, {
        "@street": "123 main st",
        "@city": "arlington",
        "@state": "ma",
        "@country": "usa"
      }],
      "@first-name": "eric",
      "@middle-initial": "H",
      "@last-name": "jung"
    }
  ]
}
```

学习总结计划

1. ✔ w3school dom： element, document, attribute, event
2. ✔ mdn 补漏
3. ✔ 回顾所有dom api
4. ✔ 完善 1.4 常用 dom api 对比
5. dom 4 学习总结

目录

- 1 dom 大全归纳
  - 1.1 dom 基础知识
  - 1.2 节点属性
  - 1.3 常用 dom api
  - 1.4 常用 dom api 对比
- 2 不常见 dom 操作api
  - 2.1 浏览器可见性 api
  - 2.2 Element.accessKey
  - 2.3 Element.classList

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
3. nodeType : 元素节点 -> 1，属性节点 -> 2，文本节点 -> 3，注释节点 -> 8, 根节点 -> 9
4. innerHTML

### 1.3 常用 dom api

一：element api

1. appendChild() removeChild() replaceChild() insertBefore() *没有 insertAfter()*
2. innerHTML
3. style, className, id, lang, title: 节点常用属性 property 快捷访问或设置方式
4. `attributes`: 节点属性集合，伪数组， `NamedNodeMap`
5. childNodes, `hasChildNodes`: 节点的后代节点集合， NodeList
6. clientHeight, clientWidth: 元素可见高度、宽度
7. cloneNode(): 克隆节点及其后代，可选参数-boolean，true表示clone后代，false表示不clone后代，默认false
8. `compareDocumentPosition()`: a.compareDocumentPosition(b)，比较a,b两个节点的位置关系
9. contentEditable, dir, `isContentEditable()`
10. firstChild, lastChild, nextSibling, previousSibling, parentNode
11. getAttribute(), `getAttributeNode()`, removeAttribute(), `removeAttributeNode()`, setAttribute(), `setAttributeNode()`
12. hasAttribute(), `hasAttributes()`: 前者判断是否有某个属性，后者判断是否有属性
13. `isEqualNode()`: a.isEqualNode(b)，比较a,b两个节点是否相等
14. `isSameNode()`: a.isSameNode(b)，判断2个节点是否是同一节点
15. `normalize()`: 移除节点内部空的文本节点，连接相邻的文本节点(主要用于合并相邻文本节点)
16. `ownerDocument`: 返回节点所属 dom tree
17. `item()`: childNodes[0] === childNodes.item(0)
18. `textContent`: 返回节点及所有子节点的文本内容，包括 script 的内容
19. offsetHeight, offsetWidth, offsetLeft, offsetParent, offsetTop
20. scrollHeight, scrollWidth, scrollLest, scrollTop
21. `getBoundingClientRect()`: 返回元素大小及其相对于视口的位置，返回 `DOMRect` 对象; 如果要相对于网页左上角的位置，可以加上 window.scrollTop 或 window.scrollLeft 的值
22. `getClientRects()`: 返回元素 getBoundingClientRect() 集合，数组每一项代表每一行的 getBoundingClientRect() 数据。当元素为行内元素，然后跨行展示(多为span+文本)的时候，可以返回每一行数据的 getBoundingClientRect() 数据；当元素为块级元素，集合数组只有一项
23. `insertAdjacentElement(position, element)`: 将目标元素插入到节点的相对位置， position 有4个值： beforebegin, afterend, afterbegin, beforeend
24. `insertAdjacentHTML(position, text)`：类似 insertAdjacentElement ，只是它要求的是 element string 就行
25. `insertAdjacentText(position, element)`: 同 insertAdjacentElement ，但是它 ie 不支持
26. `matches(selectorString)`: 判断是否有对应子节点。selectorString 为 css 选择符。可以用 `matchesSelector()` 、 `querySelectorAll()` 替代判断， ie9+
27. `requestFullscreen()`: 发出异步请求，让元素进入全屏模式。需要加浏览器前缀使用： `webkitRequestFullScreen` 、 `mozRequestFullScreen` 、 `msRequestFullscreen`
28. `scrollIntoView()`: 让当前元素滚动到浏览器窗口的可视区域内
29. `innerText`: 表示一个节点及其后代的渲染文本内容
30. `getRootNode()`: 获取根节点，ie 不支持 (可以使用 ownerDocument 属性，都支持)
31. `contains(el)`: 判断当前节点是否有 el 这个子节点，ie5+
32. `addEventListener(type, listener ,{capture: Boolean, passive: Boolean, once: Boolean})`: 绑定事件， capture 表示是否在事件捕获阶段就触发； once 只触发一次，随后自动移除 listener ； passive 表示是否忽略 preventDefault 事件。

> 视口：浏览器视口，就是浏览器标签栏以下的那个物理窗口

二：document api

1. `document.documentElement`, document.body, document.head *没有 document.html*
2. 文档对象集合：document.all, document.anchors, document.forms, document.images, document.links
3. 文档属性结合：document.cookie, document.domain, document.lastModified, `document.referrer` (表示从哪儿来的), document.title, document.URL
4. 文档对象方法：document.open, document.close, document.write, document.writeln
5. document.documentElement.isDefaultNamespace(namespace)：检查 namespace 是否是默认的命名空间
6. document.documentElement.namespaceURI: 任意节点都可以访问
7. `document.documentElement.contains(el)`: 判断 document 是否拥有 el 这个节点

问：为什么 html 的 `namespaceURI` 总是 `http://www.w3.org/1999/xhtml`?

三：attributes api (属性节点 api)

element.getAttributeNode(); // 必须加参数

element.attributes，返回该节点的所有属性节点结合，伪数组;

伪数组方法

1. getNamedItem()
2. item(): 同 `[0]`
3. length
4. removeNamedItem()
5. setNamedItem()

每一个属性节点有下列属性或方法

1. name
2. namespaceURI
3. value
4. specified
5. localName
6. prefix

四：dom event api

HTMLElement，继承自 Element, Node, EventTarget 接口；通常用到的 `div, p` 等，继承自 HTMLElement

event 句柄(执行方式 element.onxxx)

1. `onabort`: 图像的加载被中断
2. `onerror`: 图像或文档加载出错
3. `onload`: 图像或文档加载成功
4. `onanimationcancel`: 当动画意外中断时触发
5. `onanimationiteration`: 当动画运行到最后一帧时触发 草案中， chrome -> webkit
6. `onloadstart, onload, onloadend`：执行顺序依次是 'loadstart' fires first, then 'load', then 'loadend'
7. `onselect, onselectionchange, onselectstart`: 当文字被选中时触发的事件
8. `onresize`：通常绑定在 window 对象身上，表示窗口大小改变事件
9. `onsubmit, onreset`： 用于表单

event 属性

1. cancelBubble: ie
2. fromElement: ie
3. keyCode: ie
4. offsetX, offsetY: ie
5. returnValue: ie
6. srcElement: ie
7. toElement: ie
8. x, y: ie
9. bubbles: 是否是冒泡事件
10. cancelable: 是否拥有可取消默认动作的权限，如果设置为 false ，那么就不能使用 preventDefault() ，否则报错
11. currentTarget: 当前事件监听的元素
12. target: 触发事件的元素
13. eventPhase: 返回事件传播的当前阶段 捕获 -> 1, 正常 -> 2, 冒泡 -> 3
14. timeStamp: 事件生成的日期和时间
15. type: 事件名称

event 方法

1. Event(typeArg, eventInit): 构造函数，自定义事件，使用 `dispatchEvent()` 触发，不支持ie
2. preventDefault(): 阻止事件的默认行为
3. stopPropagation(): 阻止冒泡
4. stopImmediatePropagation()：阻止相同事件的其他侦听器被调用，就是说如果同一个元素上绑定了多个事件，原本会按照绑定顺序依次执行
5. CustomEvent(typeArg, customEventInit)：创建一个自定义事件，继承自 `Event` 对象，使用 `dispatchEvent()` 触发，不支持ie
6. createEvent(), initEvent()

> 在 `非ie` 中，不再建议使用 createEvent() 与 initEvent() 创建自定义事件了；在 `ie` 中，必须使用 createEvent() 与 initEvent() 创建自定义事件

鼠标属性

1. altKey: 事件触发时，`ALT`是否被按下
2. ctrlKey: 事件触发时，`CTRL`是否被按下
3. metaKey: 事件触发时，`meta`是否被按下
4. shiftKey: 事件触发时，`SHIFT`是否被按下
5. button: 哪个鼠标按钮被点击
6. clientX，clientY: 鼠标相对于浏览器视口的距离
7. screenX，screenY: 鼠标相对于显示器视口的距离
8. offsetX, offsetY: 鼠标相对于当前 target 节点左上角的便宜位置
9. pageX, pageY: 鼠标相对于文档html的距离
10. x, y: 是 clientX, clientY 的别名

五：addEventListener 第三个参数详解

{capture, passive, once}

> 在旧版本的浏览器中，第三个参数为布尔值  
> 事件触发阶段：捕获阶段、元素阶段、捕获阶段  

在规范中，passive 默认为 `false` ；但是在某些浏览器的实现中，在 `touchStart` 和 `touchMove` 事件中，已经默认设置 passive 为 `true` ，所以无法调用 `e.preventDefault` 阻止浏览器主线程的滚动。  
解决方法是，通过显示设置 passive 的值为 false 来覆盖这个行为

```javascript
var passiveIfSupported = false;

try {
  window.addEventListener("test", null, Object.defineProperty({}, "passive", { get: function() { passiveIfSupported = { passive: true }; } }));
} catch(err) {}

window.addEventListener('scroll', function(event) {}, passiveIfSupported );
```

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

#### 1.3.2 isEqualNode 条件

判断2个节点是否相等，需要满足下列条件

1. 节点类型相同
2. 拥有相同的 nodeName, nodeValue, localName, nameSpaceURI
3. 所有后台均为相同的子节点
4. 拥有相同的属性和属性值(次序可以不一致)

#### 1.3.3 firstChild, lastChild, nextSibling, previousSibling, childNodes

这5个dom属性，会把空格、回车(换行符)当做文本节点来处理

解决方式: 都增加 `Element` ，比如 firstChild -> firstElementChild， childNodes -> children

#### 1.3.4 节点之间自由移动

1. 下一个兄弟：nextSibling、nextElementSibling
2. 上一个兄弟：previousSibling、previousElementSibling
3. 所有孩子：childNodes、children
4. 第一个孩子：firstChild、firstElementChild
5. 最后一个孩子：lastChild、lastElementChild
6. 父亲：parentNode

#### 1.3.5 节点详细位置属性

clientHeight: height + padding

offsetHeight: height + padding + border + margin + 水平滚动条高度

scrollHeight = scrollTop + clientHeight

element.getBoundingClientRect(): 返回一个对象，包含 left, top, right, bottom[, width, height, x,y]，都是相对于视口左上角而言。这个方法主要用于做节点定位，相对于浏览器定位，类似于 fixed 定位那种，相对于浏览器操作的

element.getClientRects(): 类似 getBoundingClientRect() ，但是当元素节点为行内元素，并且内容产生了换行，它就会返回每一行的 getBoundingClientRect() 数据。这个主要用于批量获取 getBoundingClientRect() 数据

#### 1.3.6 节点插入、删除

1. appendChild() removeChild() replaceChild() insertBefore() *没有 insertAfter()*
2. innerHTML
3. after() before() append() prepend() : ie 不支持
4. insertAdjacentElement(position, element)、insertAdjacentHTML(position, element)
5. insertAdjacentText(position, element)：ie 不支持
6. replaceWith(...nodes): ie 不支持

insertAdjacentHTML 的 `position` 取值

1. beforebegin: 元素本身前面
2. afterend: 元素本身后面
3. afterbegin: 元素第一个子节点前面，难理解命名
4. beforeend: 元素最后一个子节点后面，难理解命名

主要使用的有： `appendChild()` `removeChild()` `replaceChild()` `insertAdjacentHTML(position, element)`

#### 1.3.7 节点选择 HTMLCollection

1. getElementsByClassName()、getElementsByTagName()、getElementsByTagNameNS()
2. getElementById()
3. querySelector()、querySelectorAll()

#### 1.3.8 节点全屏 api

通常用于视频、音频的全屏播放

[全屏api](https://developer.mozilla.org/zh-CN/docs/Web/API/Fullscreen_API)

不总结太多，以后用到再学

1. element.requestFullscreen()
2. element.exitFullscreen()

#### 1.3.9 元素节点滚动 api

scrollIntoView()

基础支持：参数为 boolean：true -> 元素的顶端和其所在滚动区的可视区域的顶端对齐(github)， false -> 同 true 相反，底端对齐

高级支持：scrollIntoViewOptions，一个 object ，可以设置滚动的流畅度，`高版本 chrome 支持`

### 1.4 常用 dom api 对比

#### 一 clientHeight vs offsetHeight vs scrollHeight

答：clientHeight: 只读属性，表示 css `height` + `padding`，不包括 border，margin，水平滚动条高度，通常用于展示区域内容占用了多少空间。

offsetHeight: 只读属性，表示 `height` + `padding` + `border` + `margin` + `水平滚动条的高度`，通常用于展示节点占据的实际高度。offsetHeight 比 clientHeight 多了边框、外边距、水平滚动条高度。如果元素没有使用 `scale` 或类似的放大缩小属性，offsetHeight 与 getBoundingClientRect() 返回的高度一致，如果使用了放大或缩小属性，那么 offsetHeight 的值不变， `getBoundingClientRect()` 会返回实际渲染的高度，所以要操作浏览器物理定位，还是要使用 `getBoundingClientRect()`

scrollHeight: 只读属性，表示元素内容区域的实际大小，会返回可滚动内容的所有height + padding

#### 二 attribute vs property

property：为 dom 节点的 `属性` ，包括 attributes, className, scrollTop 等

attribute：为 dom 节点下面的 `属性节点` ，dom 属性 attributes 返回的就是该 dom 节点下所有属性节点的集合

```javascript
<a href="https://heyunjiang.github.io" id="testId" class="hello world">heyunjiang</a>

const ele = document.getElementById('testId');

// property
ele.className; // "hello world"
ele.classList; // ["hello", "world"]
ele.href; // "https://heyunjiang.github.io"

// attribute 通过 节点属性 attributes
const attributes = ele.attributes;
attributes.getNamedItem('id'); // 返回节点对象 id="testId"
// attribute 通过 节点方法
ele.getAttribute('id'); // "testId"
ele.getAttributeNode('id'); // 返回节点对象 id="testId"
```

#### 三 event.clientX vs event.screenX vs event.offsetX

clientX: 相对于浏览器定位

screenX：相对于显示器定位

offsetX：相对于 target 定位

#### 四 Node.textContent vs Node.innerText vs innerHTML

Node.textContent: 返回自身及后代所有元素的文本值，会获取 script 、 style 元素的内容， 会获取隐藏元素的文本，不会触发重绘，不会将文本解析为 html

Node.innerText: 返回自身及后代所有元素的 **渲染** 文本内容属性， 会触发重绘，不会将文本解析为 html

Node.innerHTML: 返回或插入 html 文本，会自动将文本解析为html

> 第四点总结：如果只是设置节点的文本属性，直接使用 `textContent`，性能更好、更安全，因为省去了解析为html这一步；获取当前浏览器渲染的文本内容使用 `innerText` ；获取 dom tree 的所有文本内容使用 `textContent` ；插入或设置 html string 使用 `innerHTML`

#### 五 isEqualNode vs isSameNode

isEqualNode: 判断2个节点是否特征相等，包括属性节点相同、内容相同、子节点相同，可以用去节点相同去重

isSameNode： 判断2个节点是否是同一个节点

#### 六 NodeList vs HTMLCollection

NodeList 接口提供了 forEach、entries、keys、values 方法，比如 querySelectorAll 实现的就是 NodeList 接口；

而 HTMLCollection 没有实现 forEach 等方法，比如 getElementsByTagName 实现的就是 HTMLCollection 接口

共同点：都提供了iterator接口，可以使用 for of 遍历

#### 七 closest() vs querySelector()

通常 querySelector() 系列，都是根据当前节点向下查找节点；

closest()是根据当前节点，向上查找节点，是最近的、满足选择条件的节点。

## 2 不常见 dom 操作api

属于对常见 dom api 的一个补充，多来自 mdn

属性

1. element.childElementCount: 返回后代元素节点个数，不包含文本节点
2. element.children: 返回后代元素节点集合，伪数组， `HTMLCollection`
3. element.onpointerover，同 onmouseover，它们之间区别：
4. element.prefix: 命名空间前缀， `dom4`，`ie 不支持`
5. element.shadowRoot、element.slot: 类似 vue 中的 slot， `高版本 chrome 支持`
6. element.runtimeStyle、element.currentStyle: `ie6 支持`

方法

1. element.after(): 在元素 element 之后插入节点，解决没有 `inserAfter` 问题，`ie 不支持`
2. element.before(): 在元素 element 之前插入节点，`ie 不支持`
3. element.animate(): 让元素执行动画，`chrome、firefox支持`
4. element.append(... nodes): 类似 appendChild() ，但是功能更强大，支持 DOMString、node、多个节点、无返回值， `ie 不支持`
5. element.attachShadow(): 为节点添加 shadowRoot, `高版本 chrome 支持`
6. element.closest(selectors): 返回特定选择器且离当前元素最近的祖先元素(可能是元素本身或null)，`ie 不支持`
7. element.getAttributeNames()：获取节点所有属性名集合，`ie 不支持`
8. element.getAttributeNodeNS(): 根据指定命名空间，返回节点对应的属性节点，同理还有 getAttributeNS(), setAttributeNS(), setAttributeNodeNS(), hasAttributeNS(), removeAttributeNS(), 但是没有 removeAttributeNodeNS() 和 hasAttributeNodeNS()
9. element.prepend(... nodes): 在元素的第一个子节点前插入节点，同 element.append(... nodes) ， `ie 不支持`
10. element.replaceWith(... nodes)：节点替换， `ie 不支持`
11. element.requestFullscreen(): 发出异步请求，让元素进入全屏模式。

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

### 2.2 Element.accessKey

以下元素支持 accesskey 属性：a, area, button, input, label, legend, textarea

通常按下快捷键的时候，让元素获得焦点

chrome: `alt` + `accessKey`

### 2.3 Element.classList

返回元素的class集合，只读属性，伪数组， `DOMTokenList`

方法：

1. add( string ) : 为 DOMTokenList 添加指定的值
2. remove( string ): 删除 DOMTokenList 中指定的值
3. item( number ): 返回 DOMTokenList 索引的值
4. toggle( string ): 如果 DOMTokenList 存在这个值，则删除，不存在则添加
5. contains( string ): 判断 DOMTokenList 是否存在这个值

兼容： ie10+

> 伪数组：DOMTokenList, HTMLCollection, NamedNodeMap, NodeList

## 参考文章

1. [w3school](http://www.w3school.com.cn/tags/index.asp)
2. [mdn-dom](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model)
