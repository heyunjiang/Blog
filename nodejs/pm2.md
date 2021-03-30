# pm2

time: 2021-03-25 16:47:09  
author: heyunjiang

## 背景

最近搞了几套 pm2 部署 nodejs 服务，这里总结一下相关 pm2 知识

## 1 基础 nodejs 服务启动

通过 koa 启动一个 http 服务器，koa-static 实现静态文件服务器功能

```javascript
const Koa = require('koa')
const serve = require('koa-static')

const app = new Koa()
app.use(serve('./dist'))
app.listen(3000)
```

## 2 基础命令

1. 启动服务：pm2 start app.js，-i 支持集群模式 `pm2 start app.js -i max`，表示进程数，可取值：max，-1(所有 cpu.length - 1)，或指定进程数
2. 列举服务：pm2 list,ls,status
3. 停止服务：pm2 stop id,name,all
4. 重启服务：pm2 restart id,name,all
5. 删除服务记录：pm2 delete id,name,all
6. 获取服务详情：pm2 describe id,name
7. 热重启：pm2 reload id,name,all 与 restart 区别是服务无中断
8. 监控：pm2 monit；展示所有进程，占据的内存信息
9. 日志：pm2 logs，支持 --json,format；展示应用启停相关历史日志
10. 日志清空：pm2 flush
11. 更新日志：pm2 reloadLogs
12. 更新pm2：pm2 update

不知道含义的命令  
1. pm2 startup
2. pm2 save
3. pm2 unstartup
4. pm2 install module

## 3 问题

0. pm2 如何启动服务
1. reload 是如何实现热重启的？
2. 集群模式是如何运转?
3. -i 0 是啥意思？same as -i max

核心代码  
1. pm2.start
2. pm2.reload

## 参考文章

[pm2 github](https://github.com/Unitech/pm2)
