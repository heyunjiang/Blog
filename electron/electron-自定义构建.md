# electron-自定义构建

time: 2021-05-26 16:49:59  
author: heyunjiang

## 1 基础构建步骤

1. 下载官方 electron 构建工具：npm i -g @electron/build-tools
2. 初始化项目结构，生成 yoyo 项目目录，内部包含了 .gclient 文件，作为 gclient 入口，并：`mkdir yoyo & cd yoyo`, `e init yoyo`
3. 拉取代码：`e sync -v --no-history`；会首先在 `~/.electron_build_tools/third_party/` 中安装 depot_tools，然后执行 `gclient` 命令
4. 等待代码拉取：这个过程会挺久
5. 构建打包: `e build`。最开始会加载 xcode

## 2 踩坑集合

### 2.1 xcode 和 macos version 不匹配

在使用最新版 electron 时，它内部要求的 xcode 版本为 12.4.0，但是这个版本的 xcode 又要求 macos 至少为 	macOS Catalina 10.15.4  
导致 e build 构建失败

解决方案  
1. 使用 electron 历史版本 `https://github.com/electron/electron@058222a9f1527698180e18e2ad64f1b714451d60` 来构建
2. 升级 macos 为最新版本系统

## 2 参考文章
