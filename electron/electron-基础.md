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

### 源码目录解析

## 3 electron-forge

用于创建、打包、发布 electron 应用的工具

## 4 electron 构建

目标：自定义构建 electron，包括 chromium 定制  
初版目标：根据 electron 构建流程，输出构建好的 electron  
二版目标：切换 chromium 软链，输出包含定制化的 electron

### 4.1 electron 自动 build-tools

electron 自动构建工具，集成了相关工具操作：  
1. `depot_tools`: 获取 chromium 及相关包
2. `gclient`: chromium 获取代码的工具
3. `gn`: ninja 项目生成工具，使用 ninja 来构建项目
4. `ninja`: chromium 构建工具

> 安装 python3 `brew install python3`，python 2 和 3 差异较大，不兼容，需要升级到 3

### 4.2 自定义构建 electron

1. `export GIT_CACHE_PATH="${HOME}/.git_cache"`
2. `export NODE_TLS_REJECT_UNAUTHORIZED=0`
3. depot_tools/gsutil.py import ssl
4. Application/python3/Install Certificates.command 双击安装证书

## 参考文章

[mac 环境变量设置](https://juejin.cn/post/6844903885727858701)  
[electron 自动构建工具 build-tools](https://github.com/electron/build-tools)  
[depot_tools](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up)
[v8 编译指墙](https://www.cwiki.cn/archives/mac%E4%B8%8Bv8android%E7%BC%96%E8%AF%91%E6%8C%87%E5%A2%99)
[v8 build](https://v8.dev/docs/build)
[python3 安装ssl](https://stackoverflow.com/questions/52805115/certificate-verify-failed-unable-to-get-local-issuer-certificate)
