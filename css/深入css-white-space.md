# 深入css white-space

time: 2021-07-06 14:33:38  
author: heyunjiang

## 1 基础知识

控制文字之间的空白及换行，可选值如下  
1. normal: 连续空白合并为一个，换行符视为空白，在盒子边界时自动换行
2. nowrap: 连续空白合并为一个，换行符视为空白，在盒子边界时不换行
3. pre: 连续空白被保留，只有遇到换行符才会换行
4. pre-wrap: 连续空白被保留，遇到换行符或者在盒子边界时自动换行
5. pre-line: 连续空白合并为一个，遇到换行符或者在盒子边界时自动换行
6. break-words: 连续空白字符被保留，并且在行尾占据空间，还可以在空格之间换行，内容也和空格一样，在遇到换行符或者在盒子边界时自动换行

总结使用场景  
1. 文本超出显示省略号：使用 nowrap
2. 文本换行风格：使用 normal 或者 pre-inline，主要是处理连续空白和自动换行

遇到的问题：在将浏览器中 dom 结构中的换行数据(没有明显包含 \n，但是是存在换行字符串)复制之后，在 console 中赋值给一个变量，赋值表达式还看得到明显换行，但是赋值计算之后则变成了 \n，则无法在浏览器中使用 `white-space: pre-inline` 来渲染出换行效果  
```javascript
let str = `But ere she from the church-door stepped
     She smiled and told us why:
'It was a wicked woman's curse,'
     Quoth she, 'and what care I?'

She smiled, and smiled, and passed it off
     Ere from the door she stept—`
str //
"But ere she from the church-door stepped\n     She smiled and told us why:\n'It was a wicked woman's curse,'\n     Quoth she, 'and what care I?'\n\nShe smiled, and smiled, and passed it off\n     Ere from the door she stept—"
```
可以看到换行已经变成了换行符 \n，那么现在该怎么渲染 str 达到换行效果呢？

## 2 和 overflow-wrap, word-break,  hyphens 的关系

white-space 是定义了空白及换行，那么 overflow-wrap 也是定义了换行，2者有什么联系？

1. overflow-wrap 用于处理长的英文单词是否中断换行，normal 表示不换行，break-word 表示可以中断
2. white-space 的自动换行属性 normal, pre-wrap, pre-line, break-words 都是指的单词间换行，不能控制长单词单词内换行
3. word-break 可以控制非英文(中文、日文等)等字符是否换行，keep-all 表示不换行

> word-wrap 是 ie 的属性，现在 css3 规范叫做 overflow-wrap，不过 word-wrap 是当作别名来使用

## 参考文章

[mdn](https://developer.mozilla.org/zh-CN/docs/Web/CSS/white-space)
