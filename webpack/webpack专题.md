## 要点

1. npx： nodejs 8.2 之后版本支持 `npx` 命令，用于调用webpack的二进制文件
2. 转译(编译): webpack自身只支持 `import` 和 `export` 的转译，如果要支持其他语法，比如es6/7/8/9的，需要使用 `bable` 或 `buble` 的loader
3. script命令：使用npx与npm不同，npx只是一种cli命令，功能相对于npm来说弱很多
4. 配置文件加载：webpack默认加载 `webpack.config.js` ，可以通过 `--config` 在 `webpack` 命令中指定要加载的配置文件
5. 静态资源管理：通过loader可以处理一系列的静态资源，包括css、图片、字体、xml、svg等
6. 输出bundle：可以通过设置多个入口文件控制输出多个bundle，以达到分离chunk目的
7. 开发时错误定位: 使用 `source map`
8. tree-shaking：删除代码中从来没有用到的代码。(前提：使用es6的import、export，和第三方压缩精简工具，比如uglifyjs)

## -4048

使用npm install 的时候失败，提示 `errno -4048`，自己的解决办法，是把生成的`package-lock.json` 给删除了，然后重新加载就可以

查找资料，说的是缓存问题，虽然报错提示的是权限不足，但是很明显不是这个原因，按照指示，执行 `npm cache clean --force` 命令，依然执行失败(win32 x64)

另一种操作方式：将 `C:\Users\Administrator\AppData\Roaming\npm-cache\`这个类似目录下的文件全部清除，重新install一下就可以了

预估原因： 是即将要加载的包版本和cache中的版本冲突，新版本的npm对其的操作与旧版本不同

> 可以尝试重复npm install命令，也有可能原因是npm不稳定

## 常用Loader

1. `style-loader`
2. `css-loader`
3. `sass-loader`--windows需要安装ruby
4. `file-loader`

## 常用plugins

1. `html-webpack-plugin`--html模板
2. `clean-webpack-plugin`--清空生成的dist文件夹
3. `uglifyjs-webpack-plugin`--压缩并精简代码
4. `webpack.optimize.CommonsChunkPlugin`--提取公共代码到指定文件中，用于缓存

## 深入webpack

### 一 runtime

### 二 manifest

### 三 监听、编译代码--重新加载(live reloading)

下面3种方式，都是通过以 `webpack.config.js` 作为入口文件，只是实现它的本地监听服务器方式不同

#### 1. webpack's Watch Mode

在 `package.json` 中增加一个script命令：

`"watch": "webpack --watch",`

这能实现监听资源文件的修改，修改保存之后webpack会立即更新重新编译代码，编译结束后继续保持监听状态

> 缺点：浏览器中运行的效果不会自动更新，需要刷新

#### 2. webpack-dev-server

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

[webpack-dev-server配置地址](https://doc.webpack-china.org/configuration/dev-server)

#### 3. webpack-dev-middleware

作为一个wrapper，它用于把webpack处理后的文件传递给一个server

> webpack-dev-server 在内部使用了它

使用它是为了自定义服务器，方便更加细节的操作

### 四 模块热替换--HMR

模块热替换(Hot Module Replacement 或 HMR)

> 疑惑：在webpack-dev-server中增加hot:true时，更新代码，浏览器还是会刷新，增加与不增加还是一样的效果
> 解惑：使用HMR的时候，在某些地方能实现不完全刷新更新页面，比如颜色等变化，跟dom更新的重绘与回流类似，这一点与第三点的监听、编译代码的效果有点小区别。

### 五 生产环境构建

使用 `webpack-merge` 这个package，用以合并webpack的多个配置文件

一般可以设置如下三个配置文件

1. webpack.common.js
2. webpack.dev.js
3. webpack.prod.js

### 六 代码分离及懒加载

1. 多入口+ `CommonsChunkPlugin` ： 当存在多个bundle的时候，使用 `CommonsChunkPlugin` 提取公共部分
2. 动态导入(懒加载)： `import()` 、 `require.ensure`

```javascript
import(/* webpackChunkName: "print" */ './print').then(module => {
  var print = module.default;
  print();
});
```

### 七 构建缓存

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

前后2次使用 `CommonsChunkPlugin` 的顺序要保证一直，因为webpack是根据解析顺序来控制hash值生成的

### 八 创建library

