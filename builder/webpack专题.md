# webpack

time: 2018.8.23

[1.webpack 基础](#1-webpack-基础)  
 &nbsp; &nbsp; [1.1 webpack 简介](#11-webpack-简介)  
 &nbsp; &nbsp; [1.2 webpack 常用概念介绍](#12-webpack-常用概念介绍)  
 &nbsp; &nbsp; [1.3 常用Loader](#13-常用Loader)  
 &nbsp; &nbsp; [1.4 常用plugins](#14-常用plugins)  
 &nbsp; &nbsp; [1.5 监听、编译代码](#15-监听、编译代码)  
 &nbsp; &nbsp; [1.6 模块热替换--HMR](#16-模块热替换--hmr)  
 &nbsp; &nbsp; [1.7 生产环境构建](#17-生产环境构建)  
 &nbsp; &nbsp; [1.8 代码分离及懒加载](#18-代码分离及懒加载)  
 &nbsp; &nbsp; [1.9 客户端缓存](#19-客户端缓存)  
 &nbsp; &nbsp; [1.10 设置mode](#110-设置mode)  
[2.webpack 深入](#2-webpack-深入)  
[3.常见问题](#3-常见问题)  
&nbsp; &nbsp; [3.1 -4048](#3.1--4048)  

## 1 webpack 基础

### 1.1 webpack 简介

一句话：webpack就是一个打包器，将写的模块、组件打包成一个或多个文件。

文件打包：最终引入浏览器的是 html, css, js 文件，跟传统的一样，只是webpack打包生成的文件经过了压缩、混淆处理，根据 input 打包成不同的文件。平时写的时候，都是一个一个的组件写法，但是最终都会被打包成一个或多个文件。

文件处理：我们写的大多不是浏览器能直接识别的代码，而是要经过一系列预处理的，比如 es6, amd, cmd, less, sass 等，webpack 提供文件处理接口，我们可以加载 loader ，通过 loader 对不同文件类型进行处理，处理成浏览器能识别的代码，当然，这里处理的结果也是 `模块 -> 模块` ，处理之后再用 webpack 打包。这也是 webpack 经常要搭配 `babel` 处理 `es6` ，要搭配 `less-loader` 处理 `.less` 文件了。

特点：采用异步 I/O ，多层次缓存文件，构建与编译速度极快

将资源作为模块依赖，webpack 添加进资源图谱中然后处理，会有如下好处  
1. 脚本和样式表压缩、合并，减少网络请求
2. 文件丢失错误提前报错：在项目编译时就报错，而不是到使用时才报 404
3. 缓存：增加打包出来资源的名称 hash 值

> 因为 webpack 就是一个模块打包器，学习它的知识点，就是学习它的打包规则，包括统一入口、文件怎么处理、文件怎么输出。其他 webpack-dev-server 等都是附带的，衍生出来的，跟它本质工作没有多少关系

### 1.2 webpack 常用概念介绍

1. npx： nodejs 8.2 之后版本支持 `npx` 命令，用于调用webpack的二进制文件。具体怎么用？
2. 文件转译(编译): webpack自身只支持 `import` 和 `export` 的转译，如果要支持其他语法，比如es6/7/8/9的，需要使用 `bable` 或 `buble` 的loader
3. package.json 内的 script 命令：npm 命令；使用npx与npm不同，npx只是一种cli命令，功能相对于npm来说弱很多
4. webpack 配置文件加载：webpack默认加载 `webpack.config.js` ，可以通过 `--config` 在 `webpack` 命令中指定要加载的配置文件
5. 静态资源管理：通过 `file-loader` 等可以处理一系列的静态资源，包括css、图片、字体、xml、svg等
6. 输出bundle：可以通过设置多个入口文件控制输出多个bundle，以达到分离chunk目的，那么 bundle 和 chunk 到底什么区别？bundle 用于常规自己写的模块，chunk 用于包含一些不变的模块，比如第三方库
7. 开发时错误定位: 使用 `source map`，一个大家遵守约定的文件，通常用第三方库或插件来实现错误定位，比如 chrome-dev-tool
8. tree-shaking：删除代码中从来没有用到的代码。(前提：使用es6的import、export，和第三方压缩精简工具，比如uglifyjs)
9. chunk: 一个 chunk 就是生成一个 js 文件。由多个模块组合成一个chunk，构建出来的项目包含多个chunk，可以用于 chunk 异步加载，减少初始化时间。怎么定义哪些模块包含呢？使用 CommonsChunkPlugin 插件时，指定 name 和 entry 中的名称一致则可确定哪些模块需要导出一个 chunk

### 1.3 常用Loader

webpack 要求 loader 命名规则：`x-loader`

1. `style-loader`
2. `css-loader`
3. `sass-loader`--windows需要安装ruby
4. `less-loader`
5. `file-loader`
6. `url-loader`
7. `json-loader`
8. `babel-loader`
9. html-loader
10. markdown-loader
11. mocha-loader
12. eslint-loader
13. `vue-loader`

### 1.4 常用plugins

1. `html-webpack-plugin`--html模板
2. `clean-webpack-plugin`--清空生成的dist文件夹
3. `uglifyjs-webpack-plugin`--压缩并精简代码
4. `webpack.optimize.CommonsChunkPlugin`--提取公共代码到指定文件中，用于缓存

### 1.5 监听、编译代码

下面3种方式，都是通过以 `webpack.config.js` 作为入口文件，只是实现它的本地监听服务器方式不同

#### 1.5.1 webpack's Watch Mode

在 `package.json` 中增加一个script命令：

`"watch": "webpack --watch",`

这能实现监听资源文件的修改，修改保存之后webpack会立即更新重新编译代码，编译结束后继续保持监听状态

> 缺点：浏览器中运行的效果不会自动更新，需要刷新

#### 1.5.2 webpack-dev-server

能实现本地启动前端服务，其内置了一个简单web服务器，代码改动，自动编译并刷新浏览器

在webpack.config.js中配置并启动webpack-dev-server:

```javascript
devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000
  }
```

> 注意：webpack-dev-server版本不同，对应的webpack版本也不同，安装最新的就行  
> 缺点：会整个刷新浏览器

[webpack-dev-server配置地址](https://doc.webpack-china.org/configuration/dev-server)

#### 1.5.3 webpack-dev-middleware

作为一个wrapper，它用于把webpack处理后的文件传递给一个server。使用它是为了自定义服务器，方便更加细节的操作

> webpack-dev-server 在内部使用了它

### 1.6 模块热替换--HMR

模块热替换(Hot Module Replacement 或 HMR)

> 疑惑：在webpack-dev-server中增加hot:true时，更新代码，浏览器还是会刷新，增加与不增加还是一样的效果  
> 解惑：使用HMR的时候，在某些地方能实现不完全刷新更新页面，比如颜色等变化，跟dom更新的重绘与回流类似，这一点与 1.5 的监听、编译代码的效果有点小区别。

之所以修改样式不会刷新浏览器而更新界面，是因为 css-loader 实现了 css 的热更新。

****

修改 **react** 内容要实现不刷新浏览器，可以使用 `react-hot-loader` 模块

```javascript
import React from 'react'
import { hot } from 'react-hot-loader'
import styles from './index.less'

const Error = () => (<div className="content-inner">
  <div className={styles.error}>
    <h1>建设中</h1>
  </div>
</div>)

export default hot(module)(Error)
```

原理是什么？

### 1.7 生产环境构建

使用 `webpack-merge` 这个package，用以合并webpack的多个配置文件

一般可以设置如下三个配置文件

1. webpack.common.js
2. webpack.dev.js
3. webpack.prod.js

### 1.8 代码分离及懒加载

1. 多入口+ `CommonsChunkPlugin` ： 当存在多个bundle的时候，使用 ~~CommonsChunkPlugin~~ `SplitChunksPlugin` 提取公共部分
2. 动态导入(懒加载)： `import()` 、 `require.ensure`

```javascript
import(/* webpackChunkName: "print" */ './print').then(module => {
  var print = module.default;
  print();
});
```

### 1.9 客户端缓存

构建场景：确保webpack编译生成的文件能够被客户端缓存，在文件内容发生变化后，能够请求到新的文件

构建目标：通过webpack构建待缓存文件，分类：固定不变的类库构建、自身src代码构建

hash值变化策略：每次webpack构建命令执行，固定不变的类库的hash值保持不变，构建的自身src代码，当引入或删除组件的时候改变hash值

关键配置代码

```javascript
new webpack.HashedModuleIdsPlugin(),
new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor'
}),
new webpack.optimize.CommonsChunkPlugin({
  name: 'manifest'
})
```

使用 `HashedModuleIdsPlugin`，用于解决在entry中已经命名的chunk在使用 `CommonsChunkPlugin`打包后hash值变化的问题  
前后2次使用 `CommonsChunkPlugin` 的顺序要保证一致，因为webpack是根据解析顺序来控制hash值生成的

### 1.10 设置mode

从 `webpack4` 开始，webpack配置支持mode，参数为：'none | development | production'

开启之后，会明显提升构建速度

## 2 webpack 深入

### 2.1 cli api

`webpack -h` 列出所有配置项

使用这些api，可以实现统计配置、缓存设置、debug设置等辅助功能

### 2.2 包含统计信息的文件

`webpack --profile --json > compilation-stats.json`

这个json统计信息文件，包含了构建时间、chunks、module、错误信息等

### 2.3 模块方法

在平常编写模块、组件的时候，可以使用一下模块方法或属性

1. import()：动态加载
2. require.cache：缓存的模块数组，传入模块id可以获取对应模块缓存
3. require.resolve()：获取模块id
4. require.ensure()：异步加载，已经被 `import()` 替代
5. 标签模块：使用 `LabeledModulesPlugin` 插件，可以实现webpack的标签式模块导入导出
6. require.context()：指定一系列完整依赖，便于后面模块解析(优化解析)

比如：

```javascript
var context = require.context('components', true, /\.html$/);
var componentA = context.resolve('componentA');
```

格式：`require.context(directory:String, includeSubdirs:Boolean /* 可选的，默认值是 true */, filter:RegExp /* 可选的 */)`

目的：提升模块解析速度

7. require.include()：增加entry chunk，优化其他 `chunk` 模块依赖，提取公共模块
8. require.resolveWeak()：require.resolve的弱引用

> require.resolve获取到的模块会引入到bundle中，用于直接模块操作
> 而require.resolveWeak不会，用于逻辑判断

### 2.4 模块变量

这些变量，会在 webpack 编译的时候，替换为真正的功能，这里作为语法糖类似的存在

有 es6(commonjs)、nodejs、webpack 3个类型模块变量

1. module.loaded：模块正在执行/执行完成
2. module.hot：是否启用HMR
3. module.id
4. module.exports
5. exports：module.exports的引用简称
6. global
7. process
8. __dirname (2短下划线)
9. __filename
10. __resourceQuery：当前模块被引用时，传参获取
11. __webpack_public_path__：output.publicPath
12. 其他webpack特有内置变量

## 3 常见问题

### 3.1 -4048

使用npm install 的时候失败，提示 `errno -4048`，自己的解决办法，是把生成的`package-lock.json` 给删除了，然后重新加载就可以

查找资料，说的是缓存问题，虽然报错提示的是权限不足，但是很明显不是这个原因，按照指示，执行 `npm cache clean --force` 命令，依然执行失败(win32 x64)

另一种操作方式：将 `C:\Users\Administrator\AppData\Roaming\npm-cache\`这个类似目录下的文件全部清除，重新install一下就可以了

预估原因： 是即将要加载的包版本和cache中的版本冲突，新版本的npm对其的操作与旧版本不同

可以尝试重复npm install命令，也有可能原因是npm不稳定 


## 参考文章

[webpack 打包原理](https://segmentfault.com/a/1190000021494964?utm_source=sf-related)