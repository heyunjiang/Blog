# git 代码提交规范

time: 2019.6.26  
author: heyunjiang

## 背景

自己总结这篇文章，目的是提高自己项目工程化能力，团队协作 git 代码提交规范

## 1 commit message

常规是自己使用 `git commit -m "message"` 来提交 commit ，为了方便统一 commit 类型，团队统一管理，commit 度量，我们选择工具来做 commit

```nodejs
npm install -g commitizen

npm install -D cz-conventional-changelog
```

然后使用 `git-cz` 来替代 `git commit -m` 命令

## 参考文章

[优雅的提交你的 git commit message](https://juejin.im/post/5afc5242f265da0b7f44bee4)