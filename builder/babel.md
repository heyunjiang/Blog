# babel

这里总结了如下内容

1. babel 定义与功能
2. babel 怎么用
3. 相关功能查询(plugins、preset)
4. 自己定制babel插件或preset

time: 2018.5.9

update: 2018.8.7

目录

1. 关于 babel
2. 怎么用
3. 相关功能查询
4. 自我定制
5. 常用 babel npm 库说明

## 1 关于babel

babel 只是一个编译器，将你写的代码进行编译，分三个阶段：解析(parsing)、转换(transforming)、生成(generation)

可以在webpack、浏览器、编辑器等工具里面使用babel，babel都为其制定了使用方式及相关工具

现在我掌握到什么程度：能熟练运用常用babel plugins，还没有尝试自己编写

## 2 怎么用

目前我用babel，主要是用来编译我写的es6/7/8代码

使用方式：`webpack` 或 `babel-cli`

这里记录一下如何使用 `babel-cli`

babel-cli

[babel中文网](https://babeljs.cn/docs/usage/cli/)

1. 局部安装：`npm install babel-cli -S`，我选择局部安装，用在我的cli工具里面
2. 配置preset: `npm install babel-preset-env` 用于编译es6及最新ecmascript
3. 配置`package.json`或`.babelrc`
4. 执行命令： `babel es6 -d bin`

## 3 相关功能查询

上面总结了babel的基础用法，`babel-preset-env` 里面只是包含了标准的es用法编译，对于一些还处于草案中的语法来说，想要用它怎么办，或者说写着写着代码，然后babel编译不通过了，怎么办

这个时候需要来查询一下我们什么功能语法 `babel` 不支持了，然后再查找 babel 对应的 `plugins` 或 `preset` ，[地址](https://babeljs.cn/docs/plugins/)

## 4 自我定制

还没有做过相关 babel 插件开发

## 5 常用 babel npm 库说明

1. `@babel/cli` babel 的 cli 工具，可以独立使用，让其执行 babel 编译的功能命令
2. `@babel/preset-env` 对 es2015, es2016, es2017 and latest 版本新语法进行编译支持
3. `@babel/polyfill` 因为 `@babel/preset-env` 只 tranforms syntax，不会识别 promise、weakmap、generator 等，现在不是所有浏览器都默认支持这些，所以需要 polyfill 来支持兼容。适用于 app 和 cli tool，不适用于库，因为它会修改全局的东西
4. `@babel/runtime`: 类似 `babel-polyfill` 的东西，但是它适用于库，不适用于 app 或 cli tool。主要特点按需引入 `babel-runtime/regenerator` ，自动引入 `babel-runtime/core-js` 提供 promise、set 等新对象，移除内联的 babel helper 并使用 `babel-runtime/helpers` 代替。`@babel/plugin-transform-runtime` 用于开发版， 而 `@babel/runtime` 用于生产环境
5. `@babel/core` babel 核心文件
6. `@babel/preset-react` 对 react 支持，主要是 jsx
7. `babel-preset-stage-2` 对 es6 新特性，在 draft 阶段，支持，已经包含 `syntax-dynamic-import` 、 `transform-class-properties` 、 `tranform-decorators` 了

> 说明：使用 `babel-preset-env` 及 `@babel/preset-env` 的区别是，前者是发布的稳定版本，后者是随时更新的版本，不稳定，但是支持的特性更多。开发的时候还是选择稳定版本的吧，不然浪费时间在不稳定版本上，目前学习的重心不再 babel 上，以后专门学习 babel 的时候再回头学习开发版本的 babel
