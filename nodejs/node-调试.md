# node-调试

time: 2020.12.22  
update: 2021-04-02 10:48:52  
author: heyunjiang

## 1 调试方式

通常我们项目开发，调试有如下三种方法
1. console.log
2. node debugger、node inspector、vscode
3. 测试驱动开发（tdd | bdd）

直接在 nodejs 代码中插入 debugger 是没有效果的，本文着重学习第二点，而 debug 又有三种方式  
1. 直接通过 cmd 工具调试 nodejs，调试命令需要自己输入，使用不是太方便
2. 使用 chrome 调试：在 cmd 中 inspect 启动项目并打断点之后，在浏览器中输入 chrome://inspect 来启动浏览器调试
3. 使用编辑器调试：vscode 中 `command shift D` 进入调试模块，并通过配置项目项目的 launch.json 配置启动项目，即可使用编辑器自带的 nodejs 调试工具

## 2 nodejs 调试

使用 `node inspect node.js` 启动，过程中使用如下命令输入  
1. cont, c：继续执行，跳过当前 breakpoint，类似 f8
2. next, n：单步执行下一步，类似 f10
3. step, s：单步进入
4. out, o：单步退出
5. pause：暂停执行代码
6. .exit：退出调试
7. setBreakpoint('script.js', 1, 'num < 4'): 在 script.js 文件中，第一行，当 num < 4 时会中断
8. watch？
9. run, restart, kill？

## 3 启用 chrome 辅助调试

nodejs v8 检查器允许 chrome 开发者工具和 nodejs 实例相连，以便进行调试和性能分析。

1. 启动 nodejs 应用：`node inspect hello.js`
2. 浏览器导航输入 `chrome://inspect` 打开工具栏
3. 选择对应程序调试：在 Remote Target 中，选择对应 nodejs 应用，点击 `inspect` 即可打开调试小窗口
4. f8, f10 调试，并且小窗口会加载源码

## 4 启用 vscode 辅助调试

1. 切换到调试模式：选择左侧工具栏-调试，也就是小虫子，或者输入 `command shift D`
2. 添加调试配置：点击调试按钮右侧的 select 框，选择目标项目添加配置，打开 `launch.json` 配置文件
3. 选择 nodejs 调试：选择 nodejs 调试之后，在 launch.json 中会增加一条配置，注意修改目标启动文件地址
4. 代码中插入 debugger，或者对应行前面点击添加小红点
5. 点击调试旁边的绿色启动按钮，即可进入调试代码

launch.json 环境变量  
1. workspaceFolder：当前项目目录
2. file：launch.json 所在的目录

### 4.1 launch.json 配置开发

使用 vscode 调试模式，会在目标项目下生成 .vscode 目录，目录下有 launch.json 配置文件，描述的就是调试相关信息，这里学习分析一下。  
基本格式如下（这里采用的是 npm 启动命令）

```javascript
// npm 启动
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch via NPM",
      "cwd": "${workspaceFolder}/",
      "runtimeExecutable": "npm",
      "runtimeArgs": [
        "run-script",
        "debug"
      ],
      "args": [],
      "port": 9229
    }
  ]
}
// 对应目录的 package.json 配置
"scripts": {
  "debug": "node inspect ./node_modules/@vue/cli-service/bin/vue-cli-service.js build",
  "build": "vue-cli-service build", 
},
```

参数分析  
1. type: node 表示在 node 环境，如果是 php 环境则修改为 php，浏览器环境则为 chrome
2. request: launch 表示新启应用调试，attach 表示链接已经启动的程序来调试
3. runtimeExecutable：表示使用 npm 命令启动
4. runtimeArgs：启动的环境变量参数，按顺序拼接
5. args: 程序启动参数，与 runtimeArgs 不同的是，args 不用作环境变量参数
6. port: v8 监视器启动的 websocket 监听端口
7. cwd: 指定目录

注意：  
1. 通过非 node 命令启动，不方便增加 inspect 参数，需要在 vue-cli-service bin 入口文件中，首行修改为 #!/usr/bin/env node inspect
2. 通过 node 命令启动，需要指明 inspect
3. 多个配置只有第一个会起效？
4. 如果没有启动 inspect，将不会有输出 console.log

## 5 webpack 调试

上面三种调试方法，都是需要指定调试的入口文件的。而我的 webpack 项目，是通过 npm 启动的，引用的 node_modules 下的 webpack 资源，这种情况应该怎么调试呢？  
是否需要独立在 webpack 项目中启动调试模式?不需要

通常我们的项目是通过 npm 启动，比如 `webpack` 或 `vue-cli-service build`，当前命令内部调用当前 node_modules 目录下对应的资源，如果我们想 在 npm 模式以调试模式启动，有2种方法  
1. 修改命令入口 `node inspect ./node_modules/@vue/cli-service/bin/vue-cli-service.js build`
2. 修改资源文件启动配置项 `#!/usr/bin/env node inspect`

2种方式都可以启动调试模式

## 6 调试原理

1. 核心模块：nodejs 调试，是使用了 v8 检查器，v8 检查器提供核心能力，默认启动 websocket 并监听 9229 端口
2. 协议通信：基于 [chrome 开发者工具协议](https://chromedevtools.github.io/devtools-protocol/)，实现与 chrome、vscode 调试通信
3. 中断处理：开发者入侵代码设置断点或通过工具设置之后，即可控制 js 代码执行是否中断

## 问题

1. webpack 能够调试，是因为它本身是 commonjs 可执行代码，当然可以使用 node 调试。那 vue 项目，如何调试 vue 呢？因为 vue 本身是打包后的代码，那也只能调试打包后的结果
2. webpack 能通过调用 bin/webpack.js 来启动调试，vue-cli-service 能调试 webpack 吗？能，入口设置为 vue-cli-service, webpack 中打断点就好了

## 参考文章

[狼叔：如何正确的学习Node.js](https://cnodejs.org/topic/5ab3166be7b166bb7b9eccf7)  
[vscode launch.json 开发](https://www.barretlee.com/blog/2019/03/18/debugging-in-vscode-tutorial/)  
[nodejs 调试原理](https://www.barretlee.com/blog/2015/10/07/debug-nodejs-in-command-line/)  
[vscode 官网调试 nodejs](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
