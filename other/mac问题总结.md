# 常见问题

time: 2020.10.27  
author: heyunjiang

## 背景

使用 mac 1年半了，偶尔会遇到一些问题，通过查资料也能解决，这里总结一些常见问题，方便后续快速解决同类问题

## 1 npm 等全局命令失效

问题描述：今天在电脑重启之后，通过 bash 启动 npm 命令，发现提示 `npm command not find`，输入 `node -v` 等命令都无效，不能查找到自己安装的全局命令

问题分析：  
1. nodejs 安装在 `usr/local/bin/node` 下，其他的 `npm i -g` 安装的也在这个目录下
2. `.bash_profile`：该文件作为环境变量的配置文件，对当前用户生效。文件输出的是 `export PATH=$PATH;`

解决方案： `open ~/.bash_profile` 修改配置为 `export PATH=/usr/local/bin:$PATH;`，就能找到 npm 对应目录了

结论：目前对 mac 系统了解较少，限于简单使用，这里记录的是问题与解决方案，没有深入原理

## 2 mac 常用命令

1. 
