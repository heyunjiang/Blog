# node-cluster  

time: 2020.12.29  
author: heyunjiang

## 基础知识

cluster 模块可以创建共享端口的系列子进程，目标是充分利用设备多核，合理处理负载问题

1. 引入 cluster：require('cluster')
2. cluster.isMaster：是否是主进程
3. cluster.isWorker：是否是子进程
4. cluster.fork([env])：创建新的工作进程
5. cluster.schedulingPolicy：调度策略，不太明白
6. cluster.settings：只读对象，改变通过 cluster.setupMaster(settings) 来实现
7. cluster.setupMaster(settings)：用于修改默认的 fork 行为

## worker

worker 包含了公共进程的所有的公共信息数据，访问方式  
1. 主进程： cluster.workers
2. 子进程：cluster.worker

理解：操作 worker 可以像操作进程一样，比如可以监听 disconnect、message 等事件，可以执行 kill、send 等方法
