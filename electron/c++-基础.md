# c++-基础

time: 2021-05-27 11:28:36  
author: heyunjiang

c++ 学习的意义  
1. 读 nodejs, electron, chromium 源码的基础
2. 后续自己扩展？

## 背景

最近在做 electron 自定义构建，需要了解到 electron 源码、chrome patch 及 chromium 源码，目前对于 c++ 不了解，不知道入口函数在哪  
在 `e build` 执行构建时，也有可能遇到问题，需要知道大致问题所在

目前已有问题  
1. 入口是哪个 main
2. 模块之间是如何定义及使用的 预处理器
3. 第三方模块如何管理 所有代码加载到本地编译
4. 基本流程语法 if/else for 等
5. 运行环境 g++
6. 应用场景

> 同 python 学习一样

这里做个快速入门，方便简单看懂相关代码

## 1 基础语法

参考 electron 源码 `shell/app/electron_main.cc` 来学习  
```c++
// electron_main.h
#ifndef SHELL_APP_ELECTRON_MAIN_H_
#define SHELL_APP_ELECTRON_MAIN_H_
#include "content/public/app/content_main.h"
#endif  // SHELL_APP_ELECTRON_MAIN_H_

// electron_main.cc
#include "shell/app/electron_main.h"

#include <algorithm>
#include <cstdlib>

namespace {
  char* indicator = getenv(name);
  return indicator && indicator[0] != '\0';
}

int main(int argc, char* argv[]) {
#if defined(HELPER_EXECUTABLE) && !defined(MAS_BUILD)
  uint32_t exec_path_size = 0;
#endif  // defined(HELPER_EXECUTABLE) && !defined(MAS_BUILD)
  FixStdioStreams();
  return ElectronMain(argc, argv);
}
```

问题：头文件有啥用？头文件引入的模块，在 cc 中可以直接使用吗？  
答：可以，比如 c 中 stdio.h

基础语法  
1. 函数先声明，再使用
2. 模块引用：`#include <cstdio.h>`, `#include "myHeader.h"`, 模块包括系统标准库(由编译器提供)，自定义模块
3. 文件名：c 语言 `.c`, c++ `.cc, .cpp, .c, .cp`
4. 应用场景：硬件操作、更高级语言实现
5. 编译：GNU 的 gcc 编译器, macos 安装 xcode 即包含了 gcc 工具
6. 命名空间：定义 `namespace std {}`, 使用 `using namespace std` 或 `std::print`
7. 输出：`cout << "hello world"`
8. 预处理器：语法包含 `#include, #define, #if, #else, #line` 等，是编译过程的一个单独步骤，不是 c++ 语句代码
9. 预处理器 - 宏定义：使用 `#define macro-name replacement-text` 定义宏，后续所有变量都会被替换
10. 预处理器 - 条件编译：#if, #else
11. 头文件：包含宏定义、函数声明。#include 头文件之后，会在编译流程中走预处理。在 c 中必须写 cstdio.h, c++ 中可以省略 .h

## 参考文章

[c++ 语言教程](https://www.runoob.com/cplusplus/cpp-intro.html)  
[c 预处理器](https://www.runoob.com/cprogramming/c-preprocessors.html)  
[c++ 60分钟入门](http://c.biancheng.net/cpp/biancheng/cpp/jichu/)  
[c/c++ 学了能干什么](https://zhuanlan.zhihu.com/p/40317919)
