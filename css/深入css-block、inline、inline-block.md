# block inline inline-block

time: 2018.8.14

这3者在我日常布局使用中，用的最多的是 block 与 inline-block，比如我不喜欢块级元素换行，然后我就设置它的 display 属性为 inline-block

今天来总结一下它们3者的联系

## 1 block

block 元素，也就是所说的块级元素，通常有 div, header, nav, footer, article 等元素

那么它的宽度呢？块级元素，大多数时候看到的就是它的宽度会占满一行，然后浏览器强制换行，所以在我脑海里就认为：如果一个元素是块级元素，那么它就会占满一行。真的是这样的吗？

或许我会立马想到 float ，当我给一个块级元素添加 float 属性的时候，它的 display 属性值依旧还是 block，但是却不是占满一行，而是默认表现为这个块级元素的内容所占宽度了。但是，float 设计的最初目的不是用于这个，它只适用于文字环绕效果

除了 float 之外，还有其他例子。比如 设置父元素为 `display: flex` ，那么子元素及时是块级元素，那么它的宽度也不会充满一行，而是由其内容长度决定，它的 display 属性依旧会是 block。

**总结**：

1. 一个块级元素宽度是否占满一行，取决于它父元素的表现，如果父元素占满一行，它才会占满一行，如果父元素属于特殊布局，则 display 为 block 的子元素也不能占满一行  
2. 给一个占满一行的块级元素设置width，它依旧会占满一行，浏览器依旧会强制换行

## 2 inline

行内元素，通常有 span, em, strong, code, cite 等

浏览器设置它的默认 display 属性为 inline ，它的宽度由其内容长度决定

特点：**给行内元素设置 width, height 无效，margin、padding 只有在水平方向上的有效，竖直方向上的无效**

## 3 inline-block

通常将一个行内元素设置为 inline-block 元素，是因为 inline-block 可以设置 width, height, margin, padding，但是又不占一行；即它拥有了块级元素及行内元素的一些特点

另外，设置成 inline-block，该元素就构成了一个bfc

默认为 inline-block 的元素：img, button, radio, checkbox, input 等

## 参考文章

1. [深入css-fixed、absolute、float](css/深入css-fixed、absolute、float.md)
