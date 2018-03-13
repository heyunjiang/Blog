## 说明

这里记录了web开发时，在ios(iphone)环境下的开发技巧总结

## 1. 菜单及a标签导航需要点击2次问题

在其他平台只需要点击一次，在iphone上，就需要点击2次

### 原因

在菜单或a标签上设置了css的hover属性，第一次点击，ios实现的是hover效果，第二次点击才真正执行click或touch事件

### 解决方案

在菜单或a标签的文字包裹一层 `span` ，在span上添加点击事件

## 2. ios 缩放失效

`<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />`

在ios10以前可以，现在不行了

## 