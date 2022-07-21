# pnpm

## 1 pnpm 基础

1. install 速度快于 yarn, npm
2. 安装：npm i pnpm -g
3. 非扁平化的 node_modules 结构：顶层只保留了明确 install 的包软链，实际包是存在于 .pnpm 目录下，并且是作为硬链存在，该目录下的才是同 npm, yarn 的平铺效果

## 2 pnpm 对比 yarn、npm 有什么优势

1. 节省磁盘空间：所有项目共享依赖，文件都存储在硬盘某位置，依赖都是作为硬链，而 npm 和 yarn 则是拷贝；不同版本只会下载差异文件
2. 速度更快：npm, yarn 都是需要解析文件依赖树，然后才下载文件，最后写入文件；而 pnpm 是 并行处理每个依赖，边解析边下载边写入

## 参考文章

[pnpm 特点](https://zhuanlan.zhihu.com/p/352437367)  
[pnpm benchmark](https://pnpm.io/benchmarks)  
[pnpm 中文](https://pnpm.io/zh/)  
