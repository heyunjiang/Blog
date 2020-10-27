# git

time: 2019.6.7  
author: heyunjiang

## 1 背景

git 虽然日常使用，也能操作 clone, pull, push, merge, reset, revert, log 等一般操作，但是遇到了一些问题，却不知道如何解决，所以此刻再次完整学习一遍

## 2 遇到的问题

1. 多人开发，代码覆盖，不知道如何查找代码覆盖记录，怀疑是 reset 造成
2. 面对其他未知命令的不自信
3. git rm 与直接 rm 有什么区别
4. git cherry-pick
5. git revert 与 git reset 区别

## 3 归纳学习

1. git 作用：版本控制系统，跟踪文本文件的具体改动，但是不能跟踪非文本文件(图片，视频)的改动
2. git 版本指向：git 用 `HEAD` 表示当前版本，上一个版本是 `HEAD^` ,上一百个版本 `HEAD~100`
3. git 仓库：工作区、暂存区、本地仓库、远程仓库
4. git 原理：跟踪的是文件的修改，而不是文件本身

### 3.1 git diff

1. `git diff a.md`：用于比较工作区 `a.md` 文件相比本地仓库的区别，就是查看自己改了些什么

### 3.2 git log

1. `git log --pretty=oneline` 用于在一行展示提交记录
2. `git reflog` 用于记录每一次的操作命令，该命令用于记录自己的操作；属于本地操作记录，包括每次commit，即使不在 HEAD 指针链上；主要用于恢复 git reset --hard 引起的问题。同 git log 一样，也是基于 commit 操作

### 3.3 git reset

1. `git reset --hard commitId`：用于回滚到对应 commit 记录
2. `git reset HEAD readme.md`：用于撤销文件当前修改，不过是将暂存区的恢复到工作区

参数详解

1. --hard: `git reset --hard <commitId>`，撤销本次commit，并且不保存本次修改。注意，如果你 pull 下来了别人的，并且回滚到你之前的某个 commit ，很容易把别人的代码给搞没了
2. --soft: `git reset --soft <commitId>`，撤销本次commit，并且保存 add，恢复代码到暂存区
3. --mixed: 为默认参数，`git reset --mixed HEAD^`,等同于 `git reset HEAD^`。撤销本次 commit, 并且撤销本次 add ，恢复代码到工作区

> `git checkout -- readme.md` 用于撤销工作区的修改，原理就是用本地版本库中的文件替换工作区的文件

### 3.4 git push -u origin master

用于首次本地库与远程库关联提交

### 3.5 git merge 原理

是移动当前分支指针，指向目标分支指针

### 3.6 git stash

git stash 用于将工作区内容放到暂存区，然后去其他分支处理任务

### 3.7 删除分支

1. git branch -d feature 用于删除已经合并了内容的分支，但是不能删除未合并内容的分支
2. git branch -D feature 强行删除，不管合并内容与否

### 3.8 git rebase

把分叉的提交历史“整理”成一条直线，看上去更直观。缺点是本地的分叉提交已经被修改过了。一般不建议使用

将 dev 分支修改内容 copy 到 master，看起来就像是 master 修改记录，会丢失 dev 修改记录，但是看起来更简洁。有舍也有得

### 3.9 git tag

commit 打标签，也就是别名，方便查看，与 commitId 一样，具有语义化

### 3.10 git check-ignore

用于检查哪行配置导致忽略了这个文件

### 3.11 git config --global alias.ci commit

用于配置 git 命令的别名

### 3.12 git cherry-pick

目的：操作某一个分支中的一个或几个 commit 来操作

命令：`git cherry-pick commitId`, 该 commitId 是其他分支的提交，用于合并到当前分支来
