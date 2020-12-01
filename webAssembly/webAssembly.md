# webAssembly

time: 2020.11.30  
author: heyunjiang

## 1 简介

概念简介  
1. 浏览器支持的第二种语言
2. 本身是一种编译结果，可以看成是字节码文件，不同于 js 的字节码文件，它是二进制的
3. 由 c/c++ 等语言编译而来，规范是要求能编译成 LLVM (low lever virture machine，比如 v8, jvm) 的运行时

特点  
1. 执行速度快
2. 跨平台，因为是基于 vm
3. 可以与 js 相互的同步调用，由 js 加载
4. 无自动 gc，需要开发者主动 gc

与 js 不同  
1. 运行速度：js 需要经历 解析、ast分析、字节码、ignition解释执行及优化，而 wasm 可以由 cpu 直接运行。所以 js 运行速度慢，而 wasm 运行速度快
2. 垃圾回收：js 自动垃圾回收，而 wasm 是需要主动垃圾回收
3. 可阅读性：js 可阅读，wasm 是二进制文件
4. 体积更小：wasm 编译结果是二进制代码
5. 性能更强大：wasm 未来支持多线程，尾调用优化等

显著缺点：  
1. 调试困难：浏览器目前对 wasm 调试支持不友好
2. 开发、维护成本高：需要使用 c/c++
3. 慢启动：属于 aot 类型，及需要先编译，而前端开发人员需要快速得到响应

问题：既然浏览器可以快速加载运行 wasm，是不是可以替换 js 了  
回答：目前基本不需要，浏览器端可以使用 worker 来实现多线程

## 2 基础知识

### 2.1 代码格式

文件后缀: `.wasm`

```webAssembly
(module
  (func $i (import "imports" "imported_func") (param i32))
  (func (export "exported_func")
    i32.const 42
    call $i))
```

```javascript
var importObject = {
    imports: {
        imported_func: arg => console.log(arg)
    }
};
```

## 3 使用场景

> 通常用于快速加载、处理资源文件

结合 wasm 运行速度快等特点，总结一下使用场景  
1. 其他语言运行在 web 环境
2. 支持 wasm 格式运行的环境：物联网、其他设备
3. 快速打开的游戏
4. 音视频处理

## 参考文章

[webassembly 中文官网](http://webassembly.org.cn/docs/use-cases/)  
[WebAssembly也用在网络和JavaScript环境之外](http://webassembly.org/docs/non-web/)
