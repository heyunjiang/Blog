# web-vitals

time: 2021-05-08 19:15:13  
author: heyunjiang

目标  
1. 明确最新的衡量标准
2. 了解 polyfill 实现

## 特性介绍

在 chrome-dev-tool rendering 中，勾选上 `Core Web Vitals` 即可展示界面的3个核心数值  
1. LCP: largest contentful paint，页面最大块内容渲染完毕时间，即页面主要内容渲染时间
2. FID: first input delay
3. CLS: comulative layout shift，累计布局偏移，即渲染过程中是否有出现元素位置发生偏移

以往的 FCP、DOMContentLoaded、load 没有多大的衡量意义

## 1. LCP

表示页面最大图像或文本块的渲染时间，要求在 2.5s 内完成最大内容块的绘制

最大内容块类型如下  
1. img 标签加载的 `图像` 或 css url 加载的背景图
2. 包含 `文本节点` 或其他内联元素的 `块级元素`

## 2. CLS

测量视觉稳定性，即渲染过程中是否有出现元素位置发生偏移，要求该值小于 0.1

我们在开发过程中，有可能出现如下情况导致元素偏移  
1. 图片加载之后撑大了空间
2. 动态内容加载之后，后续内容偏移

应该提前预留位置，实现 loading 或骨架屏，让用户无错位感觉

## 参考文章

[chrome 90 Web Vitals](https://developer.chrome.com/blog/new-in-devtools-90/#cwv)  
[掘金 - 性能之 web 性能关键点(web vitals)](https://juejin.cn/post/6854573212177694733)
