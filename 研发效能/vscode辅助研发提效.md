# vscode辅助研发提效

time: 2021.1.12  
author: heyunjiang

## 背景

日常使用 vscode 编程，但是对于它的使用技巧、基本能力不太了解，更不用说其内部原理。  
目前遇到的问题：在 .vscode 目录中配置的编辑器配置，在保存文件时格式会乱，自己不熟悉这块，不会改。  
想达到的目标：学会使用 vscode 基本技巧，提升开发速度、debug 能力、编码规范，形成团队规范

## 1 常用快捷键

1. 块注释：option + shift + A
2. 光标移动最前：command + <- ，增加 shift 表示选择
3. 回到上一光标位置：command + u
4. 重复多选：command + d
5. 文件整体格式化：option + shift + f
6. 选中部分格式化：command + k 无效
7. 段落上移：option + 向上箭头
8. 多光标：option + 点击
9. 快速打开文件：command + p，包含文件使用历史
10. 快速跳到行数：ctrl + g

## 2 汉化

1. 打开配置面板：command + shift + p 
2. 输入 language，选择配置显示语言环境
3. 选择 zh-cn，或者选择安装其他语言，并安装
4. 重启 vscode

## 3 编辑器自定义设置内容

1. 文本：字体、字号、cursor、white-space、word-wrap 等常规 css 设置
2. 光标：cursor 样式
3. 查找：首部行、是否所有文件
4. 字体
5. 格式化设置：粘贴时保存、保存时格式化、延迟时间
6. 缩略图
7. 拼写建议：智能提示系列
8. 文件编码
9. 各扩展配置

## 4 prettier 插件踩坑

1. prettier 配置，可以是在 .vscode/settings.json 中存在，也可以是 .prettierrc 中存在，并且 .prettierrc 优先级最高
2. 如果编辑器打开了包含 .prettierrc 文件的目录，则会读取它，否则不会
3. 同时打开多个项目，不同层级的 prettier 配置，可能会影响到当前项目

## 参考文章

[sf vscode 教程](https://segmentfault.com/a/1190000017949680)  
[prettier 使用介绍](https://juejin.cn/post/6844903832485363720#heading-4)
