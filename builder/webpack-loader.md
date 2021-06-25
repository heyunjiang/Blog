# webpack-loader

time: 2021-04-19 18:55:14  
author: heyunjiang

## 1 基本语法

```javascript
exports.default = function(source) {
  console.log('[loaderTest]:', typeof source, source, this)
  return source.replace(/webpack/g, 'real webpack 111');
}
```

1. this：特指 loaderContext 对象，包含了 addDependency、dependency、async 等属性或方法，待后续有 loader 开发任务时，再来完善
2. 输入源文件字符串
3. 输出文件字符串

## 2 本地开发

通过在 modules.rules 中配置独立项，或加入到已有的 rule.use 中，都按倒序执行

```javascript
module: {
    rules: [
        {
            test: /\.js$/,
            use: ['babel-loader', {
                loader: path.resolve(__dirname, './src/loaderTest.js')
            }],
            exclude: /node_modules/
        }
    ]
}
```

## 3 核心 api

### 3.1 this 对象

loader 中的 this 对象，是通过 NormalModule.createLoaderContext 生成的 loaderContext 对象，可以拿到 compiler, compilation, webpack options 等对象，也包含了 addDependency 等属性方法

### 3.2 loader-utils

`import loaderUtils from 'loader-utils'`

1. loaderUtils.getOptions(this) 获取 loader 的配置
2. loaderUtils.parseQuery(this.resourceQuery) 根据字符串 query string 转换为 object
3. loaderUtils.stringifyRequest
...

## 4 常用场景

1. 文件文字替换：比如老项目文字批量替换

## 5 工作原理

loader 负责对文字源 string 处理，用法准则如下  
1. 简单易用，单一性原则
2. 使用链式传递
3. 模块化输出 module.exports.default
4. 无状态
5. 使用 loader-utils
6. 记录 loader 依赖，使用 this.addDependency

在执行 normalModuleFactory.create 解析模块时，如果模块名匹配到相关 rule，则会将 rule 中对应的 loader 加入到 loaders 数组中；
然后 normalModule.doBuild 调用 runLoaders 来为模块执行对应的 loader，生成 source 和 ast，再根据 ast 去生成对应的依赖

问题：loader 最终输出的是 javascript 代码，在处理 css 时，最终的 js 代码是啥样子？看看 css-loader
