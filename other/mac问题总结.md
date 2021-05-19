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

## 2 mac 常用知识

1. `~`: 我们使用 `cd ~/.nvm` 命令进入 .nvm 模块时，前缀 ~ 表示当前用户目录 `Users/xxx/`
2. `$HOME`：同 `~`

## 3 mac 环境变量

环境变量的作用，是我们使用命令时，可以省去前缀，让系统自动去配置好的环境变量中去匹配。比如 `nvm use 14.7.0` 表示使用 nodejs 14.7.0 版本，而 mac 本身是没有 nvm 命令的，它是怎么查找的呢？  
在我们安装 nvm 时，有执行一个命令 

> export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
> [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

export 表示在当前用户的 `~/.bash_profile` 上添加 nvm 的环境变量，最终结果是 `export NVM_DIR="$HOME/.nvm"`

问题：环境变量有哪些配置方式呢？分别对应哪些文件？

### 3.1 shell 基本知识

1. sh: Bourne Shell, mac 默认 shell, 在所有 unix 系统上可用
2. bash: linux 默认 shell，兼容 sh，并增加了一些特性，比如补全命令，命令历史等
3. ksh：完全兼容 sh，并结合了 c shell 的优点

### 3.2 mac 环境变量配置文件

mac 默认采用 sh，其配置文件加载顺序如下  
1. /etc/profile 系统最高优先级
2. /etc/bashrc 系统第二优先级
3. /etc/paths 系统第三优先级
4. /etc/paths.d 系统第四优先级
5. ~/.bash_profile 用户最高优先级
6. ~/.profile 用户第二优先级
7. ~/.bashrc 用户第三优先级

### 3.3 添加环境变量的方法

系统级别：修改 /etc/paths ? 如何实践  
用户级别：通常修改 ~/.bash_profile

查看环境变量：`cat ~/.bash_profile`，`echo $PATH`, `export -p`  
添加环境变量：修改 `~/.bash_profile`, 使用 `export 命令`

环境变量的第二个作用，就是添加环境参数，提供给应用程序读取，通常使用 export 命令添加，但是有效期只会在当前终端有效，新起一个就会丢失

## 参考文章

[mac 环境变量设置](https://juejin.cn/post/6844903885727858701)  
[macOS/Linux 环境变量设置](https://zhuanlan.zhihu.com/p/25976099)
