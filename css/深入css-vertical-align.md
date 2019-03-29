# 深入 vertical-align

time: 2019.3.28

背景：今天做一个垂直居中的功能，使用到了 vertical-align ，也忘记了该属性什么时候有效，什么时候又没有效果，发现自己并没有写文章记录这个属性，这里总结一下

## 1 问题

### 1.1 为什么 vertical-align 不起作用

在网红张的文章中说到：vertical-align 只有在元素表现为 inline、inline-block 中才会起作用，如果是 block ，则不会起作用

问题：如果当前元素的父元素为 display: flex 或者本身使用了 float 属性，则自身即使为 block ，它也是拥有的 inline-block 的特征，即不会占满一行，此刻 vertical-align 还会起作用吗？

问题：之前有人讲，vertical-align 居中，需要有同级元素才能居中，如果只有本身，是不会起作用的

### 1.2 vertical-align 属性是如何起作用的

css 参考手册上提到：vertical-align 是将当前元素放置在父元素的中间

## 2 mdn 规范

规定：vertical-align用来指定行内元素 (inline) 或表格单元格 (table-cell) 的对齐方式

## 参考文章

[张鑫旭-vertical-align](https://www.zhangxinxu.com/wordpress/2010/05/%E6%88%91%E5%AF%B9css-vertical-align%E7%9A%84%E4%B8%80%E4%BA%9B%E7%90%86%E8%A7%A3%E4%B8%8E%E8%AE%A4%E8%AF%86%EF%BC%88%E4%B8%80%EF%BC%89/)  
[mdn-vertical-align](https://developer.mozilla.org/zh-CN/docs/Web/CSS/vertical-align)
