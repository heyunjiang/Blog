# 常见知识归纳

目录

[1. 盒子模型](#1-盒子模型)  
[2. css 选择器](#2-css-选择器)  
[3. css 三大特性](#3-css-三大特性)  
[4. css 字体](#4-css-字体)
[5. pointer events](#5-pointer-events)

## 1 盒子模型

w3c： content, padding, border, margin

ie: content, margin, 其中 content 包含了 padding 和 border

## 2 css 选择器

常用

1. id 选择器： #myid
2. 类选择器： .myclass
3. 标签选择器： p
4. 后代选择器： li a
5. 子选择器： li > a
6. 通配符选择器： *
7. 伪类选择器： a:hover

不常用

1. 相邻选择器： h1 + p
2. 属性选择器：a[rel = "external"]

css3 新增伪类选择器

1. p:first-of-type
2. p:last-of-type
3. p:only-of-type 其父元素只有一个p类型的子元素的每个p元素
4. p:only-child 其父元素只有一个子元素的每个p元素
5. p:nth-child(2) 其父元素的第二子元素的每个p元素

## 3 css 三大特性

继承、层叠性、优先级

### 3.1 继承

什么是继承？哪些样式可以继承？哪些样式不可以继承？

继承：父节点具有某些属性样式，子节点没有设置这个样式，却能够表现出跟父节点相同的这个样式

> 虽说是经验之谈，但是我可以通过 chrome devtool 查看，在 Elements 下，查看 Styles，可以查看到选中节点的样式，其中有一栏 `Inherited from`，这里可以用于测试那些样式可以继承

可以继承的样式：

1. font-size font-family (font 系列)
2. color
3. text-align text-decoration (text 系列)
4. line-height

不可继承的样式： width padding border margin height

### 3.2 优先级

指一个节点，如果有多个相同的样式设定，如果确定采用哪一个

权重相同：

1. 同一来源：就近原则，谁最后被合并到节点上就采用谁
2. 不同来源：内联 > 嵌入 > 外部

权重不同：!important > id > class > tag

问题：当同一个元素设置了多个css选择器，那么如何判断优先级？

```html
<style>
#pid {height: 30px;}
.pstyle {height: 20px;}
p {height: 10px;}
</style>

<p class="pstyle" id="pid"></p>
```

> 根据 css 优先级，这里3种选择器，对应的权重不同，所以最后表现为 30px

### 3.3 层叠性

css 层叠性和优先级怎么区分？

## 4 css 字体

time: 2018.10.25

今天做一个展示型的网页，移动端展示，需要设置字体，以为在 pc 上跑出了效果，手机端就能展示相应的字体，其实不然。浏览器能展示这个字体，是因为宿主环境自带了这种字体，比如 windows 就有微软雅黑、宋体等，但是 iphone 就没有，iphone 自带的中文字体是 `Heiti SC` ，英文字体是 `Helvetica`。

现在开始要处理字体、单位(px, rem)等 css 基本知识了，这里总结一下 css 字体。

基本原则

1. 浏览器能显示的字体，需要电脑或手机带这种字体才行
2. 使用 `@font-face {}` 引入字体
3. 字体文件太大会影响性能

获取字体：访问 [webfont-generator](https://www.fontsquirrel.com/tools/webfont-generator) ，上传 `ttf` 字体，然后转换生成下载 woff 、 eot 文件， eot 是 ie 专属， woff 是其他主流浏览器都可以用的。

应用字体

```css
@font-face {
  font-family: 'kaitiregular';
  src: url('../styles/simkai-webfont.woff2') format('woff2'),
       url('../styles/simkai-webfont.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

p {
  font-family: 'kaitiregular';
}
```

## 5 pointer events

time: 2018.11.06

最近做嵌套滚动时，出现了滚动联动问题，原因是 chrome 浏览器为 touchStart, touchMove 实现了事件默认 passive 值为 true ，可以通过设置 passive 为 false 解决这个问题，也可以通过设置 `touch-action` 属性为 `none` 实现。

touch-action： 控制该元素如何响应用户操作。可选值有 auto, none, manipulation, pan-x 等，功能是可控制用户点击、缩放等操作。

pointer-events： 控制元素是否成为鼠标事件的 target 。可选值有 auto, none 等
