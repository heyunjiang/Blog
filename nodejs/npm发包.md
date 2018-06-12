# 如何使用 npm 发包

这里记录了如何使用npm发包，[学习地址](https://docs.npmjs.com/getting-started/publishing-npm-packages)

npm说的是，只要一个包拥有 `package.json` 文件，都可以发布到 npm 上去

例子：我要发布一个 `hyj-echarts-react` 的包，需要做哪些呢？

## 发包步骤

### 1 初始化项目

创建一个空文件夹，命名 `hyj-echarts-react` ，然后进入。

打开cmder，进入该目录。

`npm init` ，会创建一个 `package.json` 文件，默认信息就成

### 2 登录账户

使用 `npm whoami` 命令，测试是否已经登录了

```javascript
npm ERR! code ENEEDAUTH
npm ERR! need auth this command requires you to be logged in.
npm ERR! need auth You need to authorize this machine using `npm adduser`

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\Administrator\AppData\Roaming\npm-cache\_logs\2018-06-12T06_15_14_876Z-debug.log
```

我这边就提示我还没有登录，使用 `npm login` 登录到npm服务器(如果没有账户，可以使用 `npm adduser` 添加用户)

```javascript
$ npm login
Username: heyunjiang
Password:
Email: (this IS public) 18224487974@163.com
Logged in as heyunjiang on https://registry.npmjs.org/.
```

显示登录成功，可以再次使用 `npm whoami` 测试是否登录成功

### 3 项目准备

1. 准备一个 `.gitignore` 文件，指明哪些文件是不需要发布到npm仓库上去的
2. 选择一个合适的项目名称，在 `package.json` 的 `name` 字段中指定，我这里指定为 `hyj-echarts-react`
3. 创建一个 `readme.md` 文件，用以说明你这个包干嘛用的，怎么用
4. 创建 `src/index.js`，然后将 `package.json` 的 `main` 字段指向 `dist/index.js`

### 4 发包

使用 `npm publish` 命令，然后前往npm，查看你所属下的包

### 5 更新

每当项目修改，需要更新包的时候，先使用 `npm version 1.0.1` 更新版本，然后再次执行 `npm publish` 即完成更新
