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
8. process.nextTick()：添加到队列末尾，并且在所有 i/o 执行前执行？需要熟悉 nodejs event loop
9. process.pid：返回进程 id
10. process.platform
11. process.ppid：父进程 id
12. process.send(message[, sendHandle[, options]][, callback])：与父进程 ipc 通信
13. process.stderr、process.stdin、process.stdout
14. process.uptime()：当前进程的运行时常，单位秒
15. process.version：返回 nodejs 版本

## 2 child_process 子进程
