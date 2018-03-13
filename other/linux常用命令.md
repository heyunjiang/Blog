1. `mkdir` 创建目录
2. `mkdir -p` /dir/dir/ 创建多级目录
3. `touch node.js` 创建空文件
4. `rmdir` 删除目录(-rf 强制删除)
5. `rm -rf` 强制删除目录或文件
6. `cp` 复制 -r ：目录 -p : 连同文件属性一起复制 -d：链接属性一起复制 -a ：相当于 -pdr ，所以常用为 `cp` 或 `cp -a `
7. `ll` 等同于 ls -l
8. `mv` 剪切或更名
9. `ln` 创建软、硬连接：软连接：跟windows的快捷方式一样，文件id号不一样；硬连接：创建一个同原文件相同的指引文件，修改或删除任意一个不影响，文件id号一样。**注意：**在创建软连接的时候，原文件要写绝对路径，不能是相对路径，除非是在这个目录下创建软连接。
10. `locate` 快速查找文件位置
11. `whereis ls` 查找命令 ls 所在位置
12. `which ls`  ls 命令的位置与别名
13. `find` 查找路径 find +起始路径 -name +名称 ，也可以把 `-name` 换成 `-iname` 不区分大小写，`-nouser` ，无所有者的文件；也可以根据时间，大小，i编号节点等属性查找文件。
14. `find . -name hello -exec + 命令 + {} \`根据前面找到的文件然后执行后面的命令
15. `grep` 搜索字符串，在文件中去查找包含关键字的行
16. `shutdown` 关机 -c: 取消前一个关机命令，-h：关机，-r：重启
17. 关机：halt，poweroff,init 0。这3个没有shutdown安全
18. 重启：reboot, init 6
19. `cat` 查看文件内容
20. `logout` 退出登录
21. `zip` 压缩命令
22. `unzip` 解压缩 -r 表示操作目录，通用
23. `gzip` 压缩为 gz ,原文件不保留，如果压缩目录，只是会将目录中所有文件都压缩为gz文件
24. `gzip -d` 或 `gunzip` ，解压缩gz文件
25. `bzip2` 压缩为bz2文件 ， 加 -k 保留原文件，不能压缩目录
26. `bzip2 -d` 或 `bunzip2` ，解压缩
27. `tar` 将目录打包 -cvf 打包， -xvf 解打包
28. `tar -zcvf` 打包并压缩为 .tar.gz ，`tar -jcvf`打包并压缩为.tar.bz2格式的 ，解压缩将 c 变成 x 就行了
29. `mount` 查看挂载 ;`-a` 依据/etc/fstab 内容，开始挂载;开启自动挂载 /etc/fstab ；remount,umount;
30. `w`: 查看系统中已经登陆的用户信息
31. `who`: 查看简单用户信息
32. `last`: 历史登录信息
33. `lastlog`: 所有用户最后一次登录时间



> tips: 1个扇区为512byte;
> 
> 常见压缩格式：zip,gz,bz2,tar.gz,tar.bz2
> 
> 防火墙开关命令：service iptables start/stop