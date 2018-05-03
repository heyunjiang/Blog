## 如何构建自己的cli工具

我构建自己的cli工具的目的，是为了让自己封装的webpack及其配置可定制性更高，自己熟悉的配置不用重复配置，自己也能方便随时修改

### 为什么不去用已有的cli工具呢？

已有的cli工具，比如我接触到的 `roadhog`、`create-react-app`等， 都是自己封装好了的， 可定制性不高， 不能满足我的常规需求

### cli工作原理

1. 使用 `npm install xxx --global` 命令，全局安装你的cli，就能在任何目录下使用你的命令了
2. 在 `package.json` 中，添加 `"bin": {"mww": "./bin/mww.js"},` 字段，指定入口文件
3. 创建 `bin/mww.js`，在里面就可以做你想做的事了(操作nodejs)

> 注意事项：一定要在bin目录下的入口文件中指定 `#!/usr/bin/env node` ，这个是指示系统运行环境，以node运行

### 进一步需要，安装项目配置文件及自动 install 常规依赖

前面实现了 cli 的基本功能，我进一步的需求是想执行 `mww new xxx` 就能安装常规依赖

需要实现的功能

1. 解析命令参数

这里使用 `commander.js` 库

```javascript
var program = require('commander');
program
    .command('new')
    .description('create filefold in current working directory')
    .option('-u, --uninstall', 'Whether to install node_modules')
    .action(function(options) {
        const foldName = program.args[0]
        if(typeof(foldName) !== 'string') {
            console.log('请输入项目名称')
            process.exit(1)
        }
        /*1. 创建工程目录*/
        addFileFold(foldName)
        /*2. 进入工程目录*/
        process.chdir(join(process.cwd(), foldName))
        /*3. 复制工程文件*/
        fileCopy(function(){
            //复制完毕
            if (!program.args[1].uninstall) {
                /*4. 执行 npm install*/
                excute(function(code) {
                    createSuccess(foldName)
                })
            } else {
                createSuccess(foldName)
            }
        })
    });
program.parse(process.argv);
```


[commander中文](https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md)

2. 创建工程目录

创建目录： `require('fs').mkdirpSync`

创建文件： 可以预先定义好文件结构，需要时直接拷贝过去 `require('fs').copyFile` 或者 `require('fs').appendFile`

复制文件夹(也就是预先定义好的配置文件系列): `vinyl-fs`

```javascript
vfs.src(['**/*', '!node_modules/**/*'], {cwd: src, cwdbase: true, dot: true})
	    .pipe(vfs.dest(dest))
	    .on('end', function() {
	      cb()
	    })
	    .resume();
```

3. cli 工具自动执行 `npm install` 命令

执行命令： `require('child_process').spawn` ，通过构建一个子进程来执行

```javascript
const runner = require('child_process').spawn(resolved, ['install'])
```

