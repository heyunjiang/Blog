## 如何构建自己的cli工具

我构建自己的cli工具的目的，是为了让自己封装的webpack及其配置可定制性更高，自己也能方便随时修改

### 为什么不去用已有的cli工具呢？

已有的cli工具，比如我接触到的 `roadhog`、`create-react-app`等， 都是自己封装好了的， 可定制性不高， 不能满足我的常规需求

### cli工作原理

1. 使用 `npm install xxx --global` 命令，全局安装你的cli，就能在任何目录下使用你的命令了
2. 在 `package.json` 中，添加 `"bin": {"mww": "./bin/mww.js"},` 字段，指定入口文件
3. 创建 `bin/mww.js`，在里面就可以做你想做的事了(操作nodejs)

### 进一步需要，自动 install 常规依赖

前面实现了 cli 的基本功能，我进一步的需求是想执行 `mww new xxx` 就能安装常规依赖

需要实现的功能

1. 创建目录及文件 

创建目录： `require('fs').mkdirpSync`

创建文件： 可以预先定义好文件结构，需要时直接拷贝过去 `require('fs').copyFile` 或者 `require('fs').appendFile`

2. cli 工具自动执行 `npm install` 命令

执行命令： `require('child_process').spawn` ，通过构建一个子进程来执行

### 最后一步，添加定制的 webpack 配置并运行 webpack

这里采用 nodejs 运行 webpack, 因为webpack支持函数方式启动

