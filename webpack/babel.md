## babel

这里总结了如下内容

1. babel 定义与功能
2. babel 怎么用
3. 相关功能查询(plugins、preset)
4. 自己定制babel插件或preset

time: 2018.5.9

### 关于babel

babel 只是一个编译器，将你写的代码进行编译，分三个阶段：解析、转换、生成

可以在webpack、浏览器、编辑器等工具里面使用babel，babel都为其制定了使用方式及相关工具

### 怎么用

目前我用babel，主要是用来编译我写的es6/7/8代码

使用方式：`webpack` 或 `babel-cli` 

这里记录一下如何使用 `babel-cli` 

**babel-cli**

[babel中文网](https://babeljs.cn/docs/usage/cli/)

1. 局部安装：`npm install babel-cli -S`，我选择局部安装，用在我的cli工具里面
2. 配置preset: `npm install babel-preset-env` 用于编译es6及最新ecmascript
3. 配置`package.json`或`.babelrc`
4. 执行命令： `babel es6 -d bin`

### 相关功能查询

上面总结了babel的基础用法，`babel-preset-env` 里面只是包含了标准的es用法编译，对于一些还处于草案中的语法来说，想要用它怎么办，或者说写着写着代码，然后babel编译不通过了，怎么办

这个时候需要来查询一下我们什么功能语法 `babel` 不支持了，然后再查找 babel 对应的 `plugins` 或 `preset` ，[地址](https://babeljs.cn/docs/plugins/)

### 自我定制

还没有做过相关 babel 插件开发
