# electron-基础

time: 2021-05-13 16:27:25  
author: heyunjiang

## 背景

最近有一个需求，需要在 electron 中修改内置 chromium 相关模块功能，实现方案是替换 chromium 部分模块，或者完整替换。

自己先调研一下 electron 基本实现原理，看看 chromium 能随意切换版本不

## 1 踩坑记录

### 1.1 提示 `RequestError: unable to verify the first certificate`

在 electron install 时，其内部有个 postinstall 钩子，会调用 npm 去下载其他相关模块包，内部指定 npm install

原因：会去加载额外的证书，啥证书？

临时解决方案：  
1. npm config set strict-ssl false + export NODE_TLS_REJECT_UNAUTHORIZED=0 
2. 可以换个 wifi install

## 2 基础知识

## 3 electron-forge

用于创建、打包、发布 electron 应用的工具

## 参考文章
