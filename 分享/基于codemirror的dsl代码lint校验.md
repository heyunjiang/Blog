# 基于codemirror的dsl代码lint校验

time: 2022-07-26 15:27:58

## 背景

最近在做基于 antv x6 实现的流程图，选择它是因为可以实现丰富的自定义节点。除了流程图拖拽实现定制外，产品还提供了 json 版 dsl 给用户，实现 coding 快速修改节点信息  
这里的需求如下  
1. 代码编辑器
2. 代码 lint 实时校验

编辑器市面最火的有 codemirro 和 monaco，选择 codemirror 的原因  
1. 项目架构支持 cjs npm module，而 monaco 是只有 esm 的，简单起见选择了 codemirror
2. codemirror 更加轻量，附加功能通过 addon 添加，monaco 全包含，开箱即用

## 分享点

1. codemirror 介绍：使用方式、features
2. dsl 介绍
3. dsl 流程图代码同步
4. lint 实现架构

## lint 实现架构

1. lint addon
2. lint option `{message, severity, from, to}`
3. line tokens anynasis

## 参考文章

[dsl](https://zhuanlan.zhihu.com/p/110757158)  
[codemirror 5](https://codemirror.net/5/index.html)
