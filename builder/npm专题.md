# npm 基础

time: 2020.5.12

## 背景

最近在做公共组件规范的时候，知道了 node_modules 是在打包器打包时，从 package.json 的依赖中去寻找相应的库，从当前目录层级开始，往上查找，直到找到文件顶层。

当前最火的前端架构是

基本环境：nodejs  
包管理器：npm  
构建工具：webpack，parcel  
es转义：babel  

框架：vue, react

移动端：flutter

桌面：electron

npm 作为最流行的包管理器，在 `npm init -y` 之后，会生成一个 package.json 文件，保存相关包依赖。webpack 等构建工具，也都是依据 package.json 来查找相应包。  
自己使用了这么久的 npm ，对其完整知识点还没有有过一次总结，也没有归纳相应的问题，特此总结。

## 基础知识总结

1. 初始化：`npm init -y`，初始化为一个 npm 项目，生成 package.json 文件
2. 忽略部分文件：`.npmignore`，在需要发布为 npm 包时，可以忽略发布部分文件
3. 本地文件更新：`npm update`，执行之后，再执行 `npm outdated`，正常不会有其他输出
4. 全局安装、更新、卸载：增加 `-g` 参数即可
5. 发布流程：`npm adduser`, `npm whoami`, `npm login`, `npm version`, `npm publish`，可以使用 `--registry=http://` 来调整目标源
6. scoped package：以 `@scope/` 开头的包，通常也是私有包，发布 scoped package 时
7. 打标签：`npm dist-tag add <pkg>@<version> [<tag>]` 来打 tag，从而用户可以指定下载某个版本或标签的 package
8. 用户信息：`npm profile get|set` 可以列出用户信息，包含了 name, email, two factor auth, twitter, github 等，也可以修改密码
9. module：内部通常包含3要素：package.json, main, index.js。通常可以被其他模块 require 或 import 使用，一个 package 包含多个 module
10. The package.json file defines the package, The node_modules folder is the place Node.js looks for modules
11. 项目 import module 是从最近的 node_modules 查找，而不是通过 package.json 去查找依赖
12. `npm link`：用于本地开发链接多个仓库
13. 移除远程包：`npm unpublish` 和 `npm deprecate` 指定 package@version 
14. npm 常用钩子：`preinstall`, `postinstall` 可以在我们执行 `npm install` 的过程前后执行对应的 script 命令

