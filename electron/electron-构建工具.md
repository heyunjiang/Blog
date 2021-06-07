# gn and ninja

time: 2021-05-31 17:24:06  
author: heyunjiang

## 基本概念

ninja：构建系统，取代了之前的 GNU make 构建系统  
gn：元构建系统，输入 BUILD.gn，输出 .ninja 配置文件

在我们构建 chromium 时，会先使用 gn 命令生成 .ninja 配置文件；然后使用 ninja 生成目标结果

## 参考文章

[ninja 和 gn](https://zhuanlan.zhihu.com/p/136954435)  
[ninja 构建系统](https://blog.csdn.net/yujiawang/article/details/72627121)  
[electron 构建指南](https://www.electronjs.org/docs/development/build-instructions-gn)

关键词  
静态库、动态库  
构建系统定义编译规则，比如 GNU
