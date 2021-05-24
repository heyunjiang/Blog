# electron-集成chromium原理

time: 2021.5.24  
author: heyunjiang

## 背景

在自定义构建 electron 时，使用 `electron/build-tools` 工具来构建，需要使用如下步骤  
1. e init hello
2. e sync -v
3. e build

## 1 基本代码组织

在使用 `e sync` 拉取所需代码时，会走如下步骤  
1. 使用 depot_tools.gclient 工具，读取当前目录的 .gclient 文件，找到 electron 入口
2. 加载 electron 代码，放到 `src/electron` 下
3. 读取 `src/electron/DEPS` 文件，加载 deps 依赖，deps 对象 key 表示存放目录，value object 包含了 url 和 condition，通过修改 url 可以指定依赖地址，实现 chromium 源码修改集成
4. chromium 等代码放在在 `src/` 下

归纳：通过 depot_tools gclient 工具，将 electron、chromium、nodejs 拉取到同一个项目中，通过 DEPS 文件指定依赖

## 2 build 原理
