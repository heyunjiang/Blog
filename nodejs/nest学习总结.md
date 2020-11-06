# nest 学习总结

time: 2020.11.05  
author: heyunjiang

## 1 基础知识点

1. 模块化：module。内部支持 import 其他 module，加载子 controllers，注入 services，导出 service 实例、module 实例
2. 控制器 controller 负责处理 http 请求，具体细节交给 service 处理
3. service 作为 provider，负责提供给模块调用，采用注入依赖，由控制器构造函数实例化

1. 全局注册模块：@Global()修饰 + 根模块 import
2. 动态模块：forRoot() 可以同步或异步（Promise）返回动态模块

> 已经看到 中间件部分，转道学习 egg 了，项目需要

## 2 相关问题

1. service 是如何实现不同 module 之前实例共享的？通过模块的 exports 数组中导出 service 即实现共享实例