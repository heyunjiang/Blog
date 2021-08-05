# npm 基础

time: 2020.5.12

## 背景

最近在做公共组件规范的时候，了解到在打包器打包时，从 node_modules 中去寻找相应的库，从当前目录层级开始，往上查找，直到找到文件顶层。

当前最火的前端架构是

基本环境：nodejs  
包管理器：npm  
构建工具：webpack，rollup, parcel，vite  
es转义：babel  
框架：vue, react  
移动端：flutter  
桌面：electron

npm 作为最流行的包管理器，在 `npm init -y` 之后，会生成一个 package.json 文件，保存相关包依赖。webpack 等构建工具，也都是依据 package.json 来查找相应包。  
自己使用了这么久的 npm ，对其完整知识点还没有有过一次总结，也没有归纳相应的问题，特此总结。

## 1 基础知识总结

nodejs 作为前端开发环境，使用 npm 作为包管理器，第三方包放在 node_modules 目录中，使用 package.json 来描述模块信息

1. 初始化：`npm init -y`，初始化为一个 npm 项目，生成 package.json 文件
2. 忽略部分文件：`.npmignore`，在需要发布为 npm 包时，可以忽略发布部分文件
3. 本地文件更新：`npm update`，执行之后，再执行 `npm outdated`，正常不会有其他输出
4. 全局安装、更新、卸载：增加 `-g` 参数即可
5. 发布流程：`npm adduser`, `npm whoami`, `npm login`, `npm version`, `npm publish`，可以使用 `--registry=http://` 来调整目标源
6. scoped package：以 `@scope/` 开头的包，通常也是私有包，发布 scoped package 时
7. 打标签：`npm dist-tag add <pkg>@<version> [<tag>]` 来打 tag，从而用户可以指定下载某个版本或标签的 package
8. 用户信息：`npm profile get|set` 可以列出用户信息，包含了 name, email, two factor auth, twitter, github 等，也可以修改密码
9. module 概念：内部通常包含3要素：package.json, main, index.js。通常可以被其他模块 require 或 import 使用，一个 package 包含多个 module
10. The package.json file defines the package, The node_modules folder is the place Node.js looks for modules
11. 项目 import module 是从最近的 node_modules 查找，而不是通过 package.json 去查找依赖
12. `npm link`：用于本地开发链接多个仓库
13. 移除远程包：`npm unpublish` 和 `npm deprecate` 指定 package@version 
14. npm 常用钩子：`preinstall`, `postinstall` 可以在我们执行 `npm install` 的过程前后执行对应的 script 命令

较深入问题：  
1. webpack 是显示从 node_modules 中去查找模块吗？
2. package.json 字段 type 表示什么？
3. module, main 加载优先级是啥？
4. 为什么我 install 一个 webpack 就会在 node_modules 下面生产多个模块？
5. 一个项目中不同的模块指定了不同的 webpack 版本，最终使用的是哪个？

在学习分析 npm package.json 文档，和实践学习 webpack 之后，问题解答：  
1. 

### 1.1 包入口

node_modules 下的包入口有多种方式  
1. 默认是以 `index.js` 作为入口
2. `main` 字段表示作为 nodejs modules 的核心入口
3. `browser` 字段表示作为 browser 核心入口

### 1.2 可执行命令 bin

通过在 package.json 中的 bin 字段指明可执行命令及其可执行文件路径，可以添加对应的命令到环境中, `{ "bin" : { "myapp" : "./cli.js" } }`  
1. 本地：添加到 `./node_modules/.bin/`
2. 全局：添加到 `/usr/local/bin/`

### 1.3 版本前缀 ~

[major, minor, patch]

1. `version`: 严格匹配
2. `>version`: 版本必须大于
3. `>=version`: etc
4. `<version`: etc
5. `<=version`: etc
6. `~1.2.3`: 版本大于等于 1.2.3，小于 1.3.0
7. `^1.2.3`: major大于0时，<= 2.0.0；major等于0，则不能超过minor；minor也为0，则版本不可变更
8. `1.2.x`: 1.2.0, 1.2.1 都行，就是不能 1.3.1

总结：～ 表示不能超过中间的 minor 版本，^ 在版本大于1时，不能超过主要 major+1 版本，^ 在版本小于1时，不能超过 minor+1 版本

## 2 npm link

通常我们全局安装的包在 `/usr/local/lib/node_modules` 目录下，全局安装的命令在 `/usr/local/bin` 下，可以使用 `npm prefix -g` 来查看我们全局安装的路径

1. npm link：在当前需要共享的项目下执行 npm link，会将 package.json 中的 name 作为软链包命名，链接到全局包路径下，也就是 `/usr/local/lib/node_modules`
2. npm link name：在全局包路径下去找包，然后将其安装到当前业务项目中，name 采用的是软链包中 package.json 中的 name，不用自己拼前缀
3. 简写 `npm link ../hello`，表示在当前项目中，先进入上级的 hello 项目中，执行 npm link，然后回到当前项目，执行 npm link hello

疑问：npm link 有效期多久？link 和 install 会互相覆盖吗？

## 3 dependencies 分类作用

1. dependencies: 生产环境实际需要用到的依赖，也就是项目运行最小依赖，缺了项目就跑不起来；别人在使用你的包时，也会安装对应模块，
2. devDependencies：开发时用到，主要涉及到构建工具、工具的配置、插件等；别人在使用你的包时，也不会 install devDependencies 中的模块
3. peerDependencies：指定项目中包的版本，可以不安装当前包，如果安装了，就要符合 peerDependencies 中指定的版本，否则会给出警告。npm 版本1，2会默认安装，3-6不会安装，7会默认安装。
啥场景？兼容性限制，通过指定 package.json 中的字段 engines,os,cpu 等可以限制包
4. optionalDependencies：告诉 npm，如果一些包安装失败了也继续
5. bundledDependencies：打包结果需要包含 bundledDependencies 中指定的包。哈场景？

## 参考文章

[dependencies](https://segmentfault.com/a/1190000009927946)  
[npm link](https://docs.npmjs.com/cli/v7/commands/npm-link)  
[npm 中文文档](https://www.npmjs.cn/)  
[npm package.json 文档](https://www.npmjs.cn/files/package.json/)  
[npm semver version](https://www.npmjs.cn/misc/semver/)

