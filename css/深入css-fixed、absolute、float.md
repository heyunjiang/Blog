# fixed absolute float 区别

time: 2018.8.8

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

相对于用户直接看到的浏览器窗口 window

## absolute

相对于文档 document

上面之所以还能看到，是因为滚动的不是它的父元素，而是整个document，但是它只是脱离了其父元素的文档流，还在整个 document 之中；而 fixed 是脱离整个 document

## float