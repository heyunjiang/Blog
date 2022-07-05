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
3. vue-cli 插件有哪些能力？vue-cli 是如何管理插件调用？
4. vue-cli create 做了什么？

## 1 项目场景需求

1. 支持框架、语言、构建工具的任意组合，比如 vue3 + vite + ts
2. 个性化增加、修改内部文件，比如指定项目渲染 template 结构、修改 main.ts、package.json 等
3. preset 保存个性化配置
4. 快速开发 .vue 文件，隐藏 package.json, main.js 等文件：改功能不属于初始化能力，需要脚手架实现

## 2 实现方案分析

vite  
1. 支持 prompts 问题与用户交互，包括文件已经存在、name valid、模板选择
2. 生成的项目需要用户手动 install and run dev
3. package.json: name, bin, main
4. 生成项目方式：template copy
可复用点：create-vite, prompts。暂时不采用 template copy 方式生成子项目？

vue-cli 插件  
1. service: 修改 webpack 配置，添加 script 命令
2. prompts: 用户交互
3. generator: 修改老文件、添加新文件、扩展 package.json

vue-cli preset  
1. preset.json: 项目配置、插件列表及插件配置
2. generator: 生成或修改文件
3. prompts：用户交互
> 可以看出 preset 自身是和插件能力有重叠

vue-cli create 流程  
1. project valid
2. feature prompt select：用户可以选择 ts, vuex 等 feature
3. 加载 preset
4. 初始化插件参数
5. 生成 package.json 文件，完善 .pnpm 配置，git 初始化
6. install 加载插件，并 resolvePlugins 初始化插件，里面就包含了 prompts 的解析
7. 执行 generator，执行插件函数。render template 生成新文件、修改主文件、修改 package.json
8. install 加载 generator 修改后的 package.json
9. 生成 readme.md
10. 完成，提示 success
可复用点：preset, 插件, 交互通过参数

vite 是项目 copy，vue-cli 是插件生成项目，插件优点  
1. 可以外部定制插件，指定加载
2. 可以扩展已经生成好的项目
3. 还可以通过 preset 保存个性化的项目配置

## 3 实现方案技术要点

### 3.1 npm, yarn, pnpm 管理工具 create 命令依赖

npm create，即 npm init 的 alias，`npm create <initializer>`，例如 `npm create vite@latest vite-test -- --template vue-ts` 即可初始化一个 vue-ts 项目
详细执行步骤  
1. npm create 调用 npm init
2. 远程查找 create-vite@latest pkg，然后判断是否已经下载到本地，没有则提示 Need to install the following packages `create-vite`，用户输入 y 则会通过 npx 加载 create-vite 到本地
3. 创建或直接初始化 vite-test 项目
4. 调用 npx 执行 create-vite package.json bin 添加的 bin 命令，参数依次传入

## 参考文章

[npm init](https://www.npmjs.cn/cli/init/)
