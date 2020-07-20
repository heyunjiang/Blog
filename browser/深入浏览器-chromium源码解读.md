# chromium源码解读

time: 2020.7.14  
author: heyunjiang

## 说明

本篇文章只是对 chromium 少部分源码解读总结，用以解决以下问题

1. 之前总结的浏览器渲染过程印证：包括渲染流水线、事件循环
2. chromium 和 v8 项目的关系了解

鉴于本身对 c/c++ 掌握甚少，以及 chromium 本身工程过于庞大，所以只有少量关键代码总结

## 1 关键目录介绍

源码顶层目录就很长，这里总结以下关键的、需要的目录说明

```bash
- chrome：chromium浏览器主程序模块实现代码，核心代码，包含浏览器外壳、导航栏、标签栏、加载图标等
- cc：chromium合成器实现
- content：一个多进程沙箱浏览器渲染页面的核心代码，实现了网页要求的各种标准、gpu 加速
- net：为chromium开发的网络功能库
- sandbox：沙箱项目，阻止渲染器修改系统
```

## 2 content 模块解析

```bash
- browser : 程序后台。负责所有 I/O 操作，及与子进程的通信。它跟 renderer 通信来管理 网页。
- common : 由 content 模块中不同进程共享的文件(browser, renderer, plugin 等)。
- gpu : GPU 进程的代码，用于 3D 合成和 3D API。
- plugin : 用于在其他进程中运行插件的代码。
- ppapi_plugin : Pepper 插件进程的代码。
- renderer : 每个 tab 子进程的代码。它内嵌了 WebKit, 并通过 browser 进行 I/O 操作。
- utility : 沙箱进程中执行随机操作所需要的代码。当 browser 进程需要对不受信任的数据做操作时，会调用它。
- worker ： 运行 HTML5 Web Worker 的代码。
```

### 2.1 renderer 渲染源码分析

入口文件：content/renderer/renderer_main.cc

```c++
int RendererMain(const MainFunctionParams& parameters) {
  // 初始化 - blink 内核
  blink::Platform::InitializeBlink();
  // 初始化 - 跨平台
  platform.PlatformInitialize();
  // 初始化 - WebRTC
  InitializeWebRtcModule();
  // 沙箱激活
  if (need_sandbox) {
    should_run_loop = platform.EnableSandbox();
    need_sandbox = false;
  }
  // 激活渲染主线程
  new RenderThreadImpl(run_loop.QuitClosure(), std::move(main_thread_scheduler));
}
```



## 参考文章

[简书-chromium 目录结构](https://www.jianshu.com/p/4afe92418bd9)  
[chromium源码阅读--Browser进程初始化](https://www.cnblogs.com/danxi/p/7685629.html)
