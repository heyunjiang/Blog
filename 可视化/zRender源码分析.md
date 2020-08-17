# zRender 源码分析

time: 2020.8.17  
author: heyunjiang

## 背景

1. 使用 zrender 绘制了 gantt
2. 使用 canvas 开发过简单的 ui，没有深入使用
3. 了解了可视化实现方案，对 canvas 的 api 封装库 zrender 实现感兴趣

## 1 zrender 使用问题总结

1. 事件绑定在顶层 canvas 对象上，是如何精确定位到具体元素对象上的呢？
2. 绘制元素除了坐标精确定位之外，还有其他实现方案吗？
3. 绘制 rect 对象，zrender 封装独立对象实现了哪些功能？

另外，自己还有以下目的学习源码  
1. 对 zrender 实现有全面了解的兴趣
2. 辅助建立自己的可视化体系
