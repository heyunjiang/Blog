# fixed absolute float 区别

time: 2018.8.8

update: 2018.8.14

总体来说，3者都是脱离文档流，但是3者又有不同

案例：今天在做友空间用友plm首页的时候，将一个盒子里面的按钮组设置为

```css
.sliderBtns {
    position: absolute;
    border: 1px solid #a5a5a5;
    background-color: white;
    padding: 2px 4px;
    width: 30vw;
    bottom: -30px;
    border-radius: 5px;
    z-index: 1;
    transition: bottom .3s ease;
}
```

并且其父元素设置了

```css
#main-content {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: #eaeaea;
    padding: 0 8px;
}
```

但是，它还是能够通过滚动页面看到它

然后我将其设置为 fixed ，随便怎么滚动都不能看到了

## fixed

相对于用户直接看到的浏览器窗口 window 定位

## absolute

相对于文档 document 定位

上面之所以还能看到，是因为滚动的不是它的父元素，而是整个document，但是它只是脱离了其父元素的文档流，还在整个 document 之中；而 fixed 是脱离整个 document

## float

设计的最初目的是文字环绕效果，多用于文字环绕图片，之后也用于布局 hack 。

如果子元素全部为 float ，那么父元素不会被默认撑开

说它脱离文档流是怎么回事呢？

示例

```html
<style>
  header span { float: left; }
</style>
<header>
  <span>Home</span>
  <span>Search</span>
  <span>Button</span>
</header>
<div id="root">
  <div>hello world</div>
</div>
```

运行结果

![float](../images/float.png)

可以看到，`hello world` 和3个 span 的 content 全部挨在一起了

既然说它脱离文档流，它脱离的是什么文档流呢？

猜想：

1. `float`: 根据上述实例，float脱离的文档流，只是脱离的它父元素的文档流，始终包裹在其父元素中
2. `position: absolute` : 脱离的文档流，是脱离的 document 文档流，包裹在其最近祖先元素表现为 relative 或 absolute 之中，或者在 document 之中，但是始终包裹在 document 文档之中
3. `position: fixed` : 脱离的文档流，是脱离的 document 文档流，但是它已经不包含在 document 之中了，它只是包含在 window 这个窗体之中

## 参考文章

1. [mdn-float](https://developer.mozilla.org/zh-CN/docs/CSS/float)
2. [mdn-bfc](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context)
