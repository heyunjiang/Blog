## 功能简介

浏览器支持的第二种语言

实现功能：为现代浏览器提供新的性能特性和效果

> 怎么理解？

设计目的：不是为了手写代码，而是为诸如C、C++和Rust等低级源语言提供一个高效的编译目标

**适用目标**

1. 快速、高效、可移植: 通过利用常见的硬件能力，WebAssembly代码在不同平台上能够以接近本地速度运行。
2. 可读、可调试: WebAssembly是一门低阶语言，但是它有确实有一种人类可读的文本格式（其标准即将得到最终版本），这允许通过手工来写代码，看代码以及调试代码。
3. 保持安全: WebAssembly被限制运行在一个安全的沙箱执行环境中。像其他网络代码一样，它遵循浏览器的同源策略和授权策略。
4. 不破坏网络: WebAssembly的设计原则是与其他网络技术和谐共处并保持向后兼容。

> [WebAssembly也用在网络和JavaScript环境之外](http://webassembly.org/docs/non-web/)

## 基础知识

### 代码格式

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


