# flexible(flexbox)

time: 2020.12.13  
author: heyunjiang

目前主流浏览器已经全部支持

目录

1. 基本概念
2. 容器属性
3. 项目属性
4. 基本特征
5. 疑问
6. 参考文章

## 1 基本概念

水平主轴： `main axis` `main start` `main end`
垂直交叉轴： `cross axis` `cross start` `cross end`

## 2 容器属性

`display: flex;` `display: inline-flex;`

子元素的 `float`、`clear`、`vertical-align`属性将失效；  
并且子元素的宽度统一由内容决定，或者子元素有明确指定 flex-basis、width、height 属性

1. `flex-direction`: row | row-reverse | column | column-reverse (方向)
2. `flex-wrap`: nowrap | wrap | wrap-reverse (是否换行及换行后的行为)
3. `flex-flow`: row nowrap (前2个的合写版本，默认水平横轴换行)
4. `justify-content`: flex-start | flex-end | start | end | center | stretch | space-between | space-around | space-evenly (flex 和 grid 多列水平方向布局))
5. `align-items`: flex-start | flex-end | start | end | center | stretch (定义 flex 盒子直接子节点的垂直方向布局)
6. `align-content`: flex-start | flex-end | start | end | center | stretch | space-between | space-around | space-evenly (flex 多行和 grid 垂直方向布局)

> 注意：若设置 `flex-direction: column`，则此时主轴为交叉轴，操作 `justify-content` 则变为垂直方向的对齐方式

## 3 子元素属性

这是定义在容器内每个子元素上的属性

1. `order`: 1 (数字越小、排列越靠前)
2. `flex-grow`: 0 (子元素放大比例，0表示不放大，分配给当前子元素容器剩余可用空间)
3. `flex-shrink`: 0 (子元素缩小比例，0表示不缩小，分配给当前子元素容器剩余可用空间)
4. `flex-basis`: auto | 100px (设置子元素初始宽度)
5. `flex`: flex-grow flex-shrink flex-basis 的合写
6. `align-self`: flex-start | flex-end | start | end | center | stretch (定义 flex 盒子直接子节点的垂直方向布局，属于单个元素定义，默认继承父元素)

## 4 基本特征

如果父元素设置了 `display: flex;` ，那么它的后代是怎么表现呢？后代分块级与行内分析  
> 总结：如果父元素设置为 `display: flex;`， 那么它的子元素表现为 `display: block` ，并且子元素宽度由其内容宽度决定，高度如果没有自己设置，则会从祖先继承

### 4.1 块级 display: block

```html
<header>
  <div>Home</div>
  <div>Search</div>
  <div>Button</div>
</header>
```

如果不给 header 设置任何样式，那么它就只是一个语义化的标签，默认 `display: block;` ，后代几个div表现就是 `display: block;` ，但是每个div独占一行；

如果给 header 设置 `display: flex;` ，那么它的后代是什么表现呢？答：它的后代几个div表现的还是 `display: block;`，但是每个div的宽度只有它本身内容的宽度了。

原因：如果只给父元素 header 设置为 flex ，那么它会默认带上 `flex-direction: row;flex-wrap: nowrap;` ,它的后代元素 div 会被浏览器设置一个 width 属性默认值，这个默认值是由div的内容所占实际宽度决定；在给 header 设置 flex 之前，后代元素 div 也会被浏览器设置一个 width 属性默认值，这个默认值则是默认100%宽度的

### 4.2 行内 display: inline

```html
<header>
  <span>Home</span>
  <span>Search</span>
  <span>Button</span>
</header>
```

在设置 `display: flex;` 之前，是会排在一行，span 默认是 `display: inline` ，但是span之间会有 `空隙` ，这个是浏览渲染引擎在解析的时候，如果是行内元素，默认会把多个空格或换行渲染成一个空格；  
设置了 flex 之后，后代 span 就表现为 block ，此时跟 div 表现一致了。

### 4.3 display: inline-block

表现跟 display: inline 一致

> inline 与 inline-block 有什么区别？可以补充一下3者表现差异( +block )

## 5 疑问

既然有 `align-self` 控制单个项目在垂直交叉轴上对齐方式，那有控制单个项目在水平主轴上对齐方式的吗？  
答：设置 flex-direction: column 即可控制元素水平方向的布局了

1. space-around 是如何控制左右空白距离的

## 参考文章

[grid 布局](https://mp.weixin.qq.com/s/1Xm69dW-A4wgcknhohzLoA)  
[mdn flex](https://developer.mozilla.org/zh-CN/docs/Glossary/Flex)
