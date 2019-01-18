# vultr 搭个梯子

time: 2019.01.18

目的是为了能够使用 google 搜索，百度搜索垃圾广告太多了，难受。

> 这篇文章带一些我搭建过程中遇到的一些问题，都总结成了注意事项

## 1 vultr vps 服务购买流程

进入 [官网](https://www.vultr.com/?ref=7772676-4F) ，目前新用户可以免费得 50 刀。

1. 注册用户
2. Billing - 添加 credit ，就是支付信息，我选择的是支付宝，充值了 10 刀
3. Servers - 添加服务器，选择 `Silicon Valley` + `centos 7 x64` + `$3.5/mo` ，其他默认
4. 等待服务器 installing 完毕，点击这条数据，查看服务器详情，包括 ip 地址 + 用户名 + 密码

> 注意事项  
> 1. 不要选择 2.5$ 的，ipv6 不好整  
> 2. 选择的节点要注意，如果后续 ssh 连不上的，可以删了这个服务器，重新选择一个不同的节点

## 2 使用 putty 搭建 ss 服务器

1. 连接 ssh ：打开 putty ,输入服务器 `ip`，默认端口 `22`， 选择 `ssh`, 点击 `open`
2. 登录：输入刚才 vultr 服务器信息
3. 登录成功，搭建 ss 服务器，输入以下命令

第一条命令：下载  
`wget --no-check-certificate https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks.sh`

第二条命令：权限设置  
`chmod +x shadowsocks.sh`

第三条命令：安装  
`./shadowsocks.sh 2>&1 | tee shadowsocks.log`

安装完成之后，会展示 ss 服务器的 ip + port + password + encryption 信息，ss 客户端填的就是这些

> 注意  
> 1. 如果 putty 连接不上，可能是 ip 被封了，需要重新在 vultr 上创建一个服务器  
> 2. encryption 服务选择 `aes-256-cfb` ，即输入 `7`  
> 3. ss 服务器安装了之后就一直处于运行状态

## 3 搭建 ss 客户端

windows 平台 [下载地址](https://pan.baidu.com/s/1TQ8mAO_txAzOZJKBHynbVA)

> 注意  
> 1. 下载不了请联系我  
> 2. ss windows 客户端在桌面右下角，需要右键启动服务

## 参考文章

[1 sf 参考文章](https://segmentfault.com/a/1190000015067117?utm_source=tag-newest)