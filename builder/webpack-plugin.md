# webpack-plugin

time: 2020.11.10  
author: heyunjiang

plugin 用以处理 loader 不能完成的事，在 webpack 打包的流程中，监听特定钩子实现自定义功能

## 1 原理

webpack 要求如下  
1. plugin 实例对象具有 `apply` 方法
2. apply 方法唯一参数 `compiler` 对象
3. compiler 钩子函数参数提供 `compilation` 对象和 `next` 方法
4. 监听钩子方式：compiler.plugin('emit')，compiler.hooks.emit.tapAsync()
5. compilation 对象提供如下属性：assets, chunks, chunk.files, fileTimestamps, modules, module.fileDependencies

## 2 demo

```javascript
function MyExampleWebpackPlugin() {};
MyExampleWebpackPlugin.prototype.apply = function(compiler) {
  compiler.hooks.emit.tapAsync('webpacksEventHook', function(compilation, callback) {
    callback();
  });
};
```

## 3 使用方式

```javascript
// webpack.config.js
const MyExampleWebpackPlugin = require('./src/MyExampleWebpackPlugin')
module.exports = {
  plugins: [
      new MyExampleWebpackPlugin()
  ]
}
```

## 参考文章

[webpack 参与贡献](https://www.webpackjs.com/contribute/)  
[Compiler 源码](https://github.com/webpack/webpack/blob/master/lib/Compiler.js) 查看各种 Compiler hook  
[Compilation 源码](https://github.com/webpack/webpack/blob/master/lib/Compilation.js) 查看 Compilation 各种 hook 及提供的资源
