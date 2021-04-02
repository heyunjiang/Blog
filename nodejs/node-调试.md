# node-调试

time: 2020.12.22  
update: 2021-04-02 10:48:52  
author: heyunjiang

## 1 调试方式

1. console.log
2. node debugger、node inspector、vscode
3. 测试驱动开发（tdd | bdd）

直接在 nodejs 代码中插入 debugger 是没有效果的

## 2 webpack 调试

## 3 nodejs 调试

使用 `node inspect node.js` 启动，过程中使用如下命令输入  
1. cont, c：继续执行，类似 f8
2. next, n：单步执行下一步，类似 f10
3. step, s：单步进入
4. out, o：单步退出
5. pause：暂停执行代码
6. .exit：退出调试

## 参考文章

[狼叔：如何正确的学习Node.js](https://cnodejs.org/topic/5ab3166be7b166bb7b9eccf7)
