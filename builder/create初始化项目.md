# create 初始化项目

time: 2022-07-04 11:08:04  
author: heyunjiang

## 背景

最近团队在做脚手架升级，目的是  
1. 兼容 vue3 + ts + qiankun + vite 技术栈
2. 定制化开发或融合一些提效工具

而我的任务是做项目初始化，利用 npm, pnpm, yarn 支持的 create 能力，参考 vue-cli, vite 工具的实现

脚手架功能：项目初始化、生成的项目结构、项目构建、构建工具配置、pkg release

## 问题

1. 第一步 create 时会提示 Need to install the following packages `create-xxx`：为什么需要先下载 pkg create？
2. 采用插件方式生成项目，如何动态修改 vue 等文件？插件如何组织，如何和其他功能插件区分？

## 1 实现方案分析

vite  
1. 支持 prompts 问题与用户交互，包括文件已经存在、name valid、模板选择
2. 生成的项目需要用户手动 install and run dev
3. package.json: name, bin, main
4. 生成项目方式：template copy
可复用点：create-vite, prompts。暂时不采用 template copy 方式生成子项目？

vue-cli

## 2 实现方案技术要点

### 2.1 npm, yarn, pnpm 管理工具 create 命令依赖

npm create，即 npm init 的 alias，`npm create <initializer>`，例如 `npm create vite@latest vite-test -- --template vue-ts` 即可初始化一个 vue-ts 项目
详细执行步骤  
1. npm create 调用 npm init
2. 远程查找 create-vite@latest pkg，然后判断是否已经下载到本地，没有则提示 Need to install the following packages `create-vite`，用户输入 y 则会通过 npx 加载 create-vite 到本地
3. 创建或直接初始化 vite-test 项目
4. 调用 npx 执行 create-vite package.json bin 添加的 bin 命令，参数依次传入

## 参考文章

[npm init](https://www.npmjs.cn/cli/init/)
