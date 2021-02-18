# 进程与子进程

time: 2020.12.23  
author: heyunjiang

## 1 process 进程

全局变量 process，提供了当前进程的信息，也可以直接操作进程

1. process.on('beforeExit', cb) 监听全局事件，比如 message, exit 等
2. process.argv：启动时传入的命令行参数
3. process.cwd()：返回当前工作目录
4. process.env：返回包含用户环境的对象
5. process.getegid()：返回进程的有效组 id？不太清楚
6. process.kill(pid)
7. process.memoryUsage()：查看当前进程内存使用情况，包含 v8，v8 关联的 c++ 占用内存，所有内存等
8. process.nextTick()：添加到 nodejs event loop 任务的下一个 nextTick 队列，在当前任务执行完毕就会执行 nextTick 任务
9. process.pid：返回进程 id
10. process.platform
11. process.ppid：父进程 id
12. process.send(message[, sendHandle[, options]][, callback])：与父进程 ipc 通信
13. process.stderr、process.stdin、process.stdout
14. process.uptime()：当前进程的运行时常，单位秒
15. process.version：返回 nodejs 版本

## 2 child_process 子进程

包含了 process 的部分能力，比如 kill, pid 等方法，这里归纳一些子进程特色

1. 模块引入：require('child_process')
2. child_process.spawn 异步衍生子进程，spawnSync 同步实现
3. 父子进程通信：message 事件 + send() 实现
4. 管道数据：process.stderr、process.stdin、process.stdout，这3个管道默认会在父子进程中创建

核心是 spawn | spawnSync，下面这些方法都是基于这2者来实现

1. child_process.exec()：衍生 shell 并且在 shell 中运行命令，同步 execSync
2. child_process.execFile()：直接衍生命令而不先衍生 shell，同步 execFileSync
3. child_process.fork()：衍生新的 nodejs 进程
