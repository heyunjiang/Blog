# 简体版 pwa 

前面总结了 [service worker](../browserAPI/webWorkers.md) 的知识，今天对它做一个简单的应用

由于service worker必须要求是https环境，如果我自己开发测试，还要去搭建一个https环境的话，那么有点麻烦(自己没有搭过，估计搭起来要费很多时间，后面再学吧)，所以就利用github自带的https实现

## 1 实现过程

### 1.1 准备工作

实现一个 `heyunjiang.github.io` 类似的网站，每个人都可以在自己的github上面创建一个。

### 1.2 本地缓存

如果直接将网页添加到主屏幕，那么它每次都会通过浏览器打开
