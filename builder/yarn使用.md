# yarn

time: 2022-07-19 15:14:27

yarn 作为目前较火的包管理器，我们有项目也在使用它，这里总结一下相关功能

## 基础

1. yarn 提供 cli 命令行工具，实现了包的下载管理，也提供了线上搜索服务，但是注册表数据库还是使用的 npm 的
2. yarn 支持的 workspaces 实现了项目的 monorepo 能力
3. lerna 可以基于 yarn workspaces 实现 monorepo 能力
4. yarn.lock 锁定版本：在 yarn install 时会去找该文件的顶层配置，忽略嵌套的 dependency，因为所有 dependency 都可以在顶层找到；lockfile 的作用是告诉 yarn 指定加载包，可以节省查找和包容错处理时间
5. 常用命令：yarn add, yarn init, yarn install, yarn publish, yarn remove
6. yarn create react-app 会加载 create-react-app 并执行 bin 文件，它不是 yarn init 的别名，而 npm create 是 npm init 的别名
7. yarn install 快是因为它下载的包会缓存到指定位置，可以通过 yarn-offline-mirror 配置，并且会并行下载
8. 安装 yarn: npm i yarn -g
9. 查看 yarn 缓存：yarn cache dir，目前所有项目的包都缓存到这个位置
10. yarn 版本：1.x classic, 2.x modern
11. peerDependency 不会自动安装

yarn 相较于 npm 有什么优势？  
1. 下载速度更快：支持并行下载和缓存，但是 npm 新版本也优化了速度
2. 提示更加友好：install 中 npm 输出信息太多
3. 安全：yarn 会校验包的完整性

归纳：yarn 较于 npm 优势不大

## yarn 2

yarn2 又叫 yarn modern, yarn berry。相较于 yarn1 的优势

1. 更多特性：buildin-patch, changesets...
2. 速度更快：新的 install 策略
3. 可扩展：使用 yarn api 开发自定义的管理工具
4. 更稳定：解决了许多 issue
5. 新特性支持：yarn 2 全新架构能支持更好新特性开发支持

## 参考文章

[yarn 中文](https://yarn.bootcss.com/docs)  
[pnpm benchmark](https://pnpm.io/benchmarks)  
