# nodejs 监控

time: 2021.1.6  
author: heyunjiang

## 1 背景

最近在学习 serverless 的过程中，接到做 node 监控需求。
主要是参考阿里 pandora 相关功能及实现原理。

## 2 pandora 功能总结

1. pandora 是 nodejs 应用的起停工具，它位于应用或应用框架与底层 nodejs 环境之间，提供中间能力
2. pandora 通过传入应用的启动入口文件启动
3. 监控内容包括：错误监控、应用健康监控、应用信息监控、进程信息监控、调用链路信息监控
4. 配置支持全局配置，通过启动参数传入，支持文件、npm 包
5. 监控进程：通过 Daemon 进程实现监控，占据 7002 端口
6. 

### 2.1 pandora 疑问汇总

1. pandora 是如何控制 nodejs 应用起停？
2. pandora 工具整体架构如何，为 nodejs 应用提供了什么功能？
3. 

### 2.2 监控问题汇总

1. 数据上报和主动获取，怎么设计场景？
2. 

## pandora 使用依赖库

1. source-map-support：为 node 应用提供 sourcemap，使用 v8 的 stack trace api
2. yargs：交互式 cli 构建工具
3. inquirer：也是交互式命令行用户工具

## 参考文章

[pandora 官网](https://www.midwayjs.org/pandora/zh-cn/guide/introduce.html#%E8%AE%BE%E8%AE%A1%E5%8E%9F%E5%88%99)
