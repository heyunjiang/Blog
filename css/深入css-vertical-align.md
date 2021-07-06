# 深入 vertical-align

time: 2019.3.28

背景：今天做一个垂直居中的功能，使用到了 vertical-align ，也忘记了该属性什么时候有效，什么时候又没有效果，发现自己并没有写文章记录这个属性，这里总结一下

## 1 问题

### 1.1 为什么 vertical-align 不起作用

在网红张的文章中说到：vertical-align 只有在元素表现为 inline、inline-block 中才会起作用，如果是 block ，则不会起作用

问题：如果当前元素的父元素为 display: flex 或者本身使用了 float 属性，则自身即使为 block ，它也是拥有的 inline-block 的特征，即不会占满一行，此刻 vertical-align 还会起作用吗？  
答：不会，flex 和 float 都会使 vertical-align 失效，因为 flex 和 float 不是普通流式布局了

问题：之前有人讲，vertical-align 居中，需要有同级元素才能居中，如果只有本身，是不会起作用的  
答：是的，因为是控制同级兄弟元素对齐方式的

### 1.2 vertical-align 属性是如何起作用的

css 参考手册上提到：vertical-align 是将当前元素放置在父元素的中间

## 2 mdn 规范

规定：vertical-align用来指定行内元素 (inline) 或表格单元格 (table-cell) 的对齐方式

表格居中或其他对齐方式，浅显易懂，这里主要是归纳一下行内元素的对齐方式  
实践证明，其对行内块状元素也是有效

## 3 总结

1. vertical-align 指的是相对于兄弟 inline 或 inline-block 的对齐方式，不是相对于父元素的对齐方式；为什么可以设置较高图片 vertical-align 来控制同行的文字对齐，也可以设置文字 vertical-align 来控制文字对齐？
2. vertical-align 只对行内及行内块状元素起效， 不对普通块状元素起效
3. float 会使 vertical-align 属性失效，所以该属性的使用很有限制

## 参考文章

[张鑫旭-vertical-align](https://www.zhangxinxu.com/wordpress/2010/05/%E6%88%91%E5%AF%B9css-vertical-align%E7%9A%84%E4%B8%80%E4%BA%9B%E7%90%86%E8%A7%A3%E4%B8%8E%E8%AE%A4%E8%AF%86%EF%BC%88%E4%B8%80%EF%BC%89/)  
[mdn-vertical-align](https://developer.mozilla.org/zh-CN/docs/Web/CSS/vertical-align)
