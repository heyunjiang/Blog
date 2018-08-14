# 说明

这里记录了web开发时，在ios(iphone)环境下的开发技巧总结

## 1 菜单及a标签导航需要点击2次问题

在其他平台只需要点击一次，在iphone上，就需要点击2次

### 原因

在菜单或a标签上设置了css的hover属性，第一次点击，ios实现的是hover效果，第二次点击才真正执行click或touch事件

### 解决方案

在菜单或a标签的文字包裹一层 `span` ，在span上添加点击事件

## 2 ios 缩放失效

`<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />`

在ios10以前可以，现在不行了

## 3 safari 种 window.open 失效

现象：在回调函数中，执行window.open方法会失效，但是可以执行 window.location.href

原因：在 sf 中查的资料，说到的是：如果用户主动操作(onclick, a)打开窗口，则不会被阻止，但是如果在回调函数中打开窗口，这就是非用户主动操作了，大多数浏览器会屏蔽掉

解决方案：

```javascript
var windowRef = window.open('', '_blank');
ajaxGet("request.php").then(function(response){
    // do some logic
    url = "somewhere.com";
    // open url
    if (isChrome) {
        window.open(url, '_blank');
    } else if (isSafari) {
        setTimeout(function(){
            windowRef.location = url;
        },10);
    }
})
```

应用场景：预览pdf，需要先获取文件地址，然后再打开文件
