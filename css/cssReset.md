## reset

### 1. 什么是reset

浏览器自带默认样式，比如 `margin: 8px;`等，这不是我们想要得，然后我们就要对其进行重置，也就是 `css reset`

进行reset的时候，最好不要使用 `* {margin: 0; padding: 0;}` ，因为这样是造成性能浪费，最好是将你使用到的元素进行reset

> 问：这样为什么会造成性能问题？css的性能问题常见有哪些

### 2. user agent stylesheet

**chrome**

1. body {display: block;margin: 8px;}

**ie11**

1. body {display: block;margin: 8px;}

**firefox57.0.4**

1. body {display: block;margin: 8px;}

### 3. doctype

`document type`

作用：让宿主环境按照指定规则解析 html 与 css

说明：它不是一个标签，而是一个指令

**html4 与 html5的重大区别**

html4需要对DTD进行引用，DTD有transitional、strict、frameset 3种值

html5不要说明DTD，也没有DTD，它只有一个值，只需要 `<!DOCTYPE HTML>` 或 `<!doctype html>`

因为html4是基于 SGML，html5没有基于它

**关于SGML**

SGML：标准通用标记语言

html4和xml都是基于它来的

html5不是基于sgml的
