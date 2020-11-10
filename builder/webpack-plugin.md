# webpack-plugin

time: 2020.11.10  
author: heyunjiang

plugin 用以处理 loader 不能完成的事，在 webpack 打包的流程中，监听特定钩子实现自定义功能

学习及开发方式：查看已有的 plugin 源码

## 原理

webpack 要求如下  
1. plugin 对象具有 `apply` 方法
2. apply 方法唯一参数 `compiler` 对象
3. compiler 钩子函数参数提供 `compilation` 对象和 `next` 方法
4. 监听钩子方式：compiler.plugin('emit')
5. compilation 对象提供如下属性：assets, chunks, chunk.files, fileTimestamps, modules, module.fileDependencies

## demo

```javascript
// 一个 JavaScript 命名函数。
function MyExampleWebpackPlugin() {

};

// 在插件函数的 prototype 上定义一个 `apply` 方法。
MyExampleWebpackPlugin.prototype.apply = function(compiler) {
  // 指定一个挂载到 webpack 自身的事件钩子。
  compiler.plugin('webpacksEventHook', function(compilation /* 处理 webpack 内部实例的特定数据。*/, callback) {
    console.log("This is an example plugin!!!");

    // 功能完成后调用 webpack 提供的回调。
    callback();
  });
};
```

## 参考文章

[webpack 参与贡献](https://www.webpackjs.com/contribute/)  
[Compiler 源码](https://github.com/webpack/webpack/blob/master/lib/Compiler.js) 查看各种 Compiler hook  
[Compilation 源码](https://github.com/webpack/webpack/blob/master/lib/Compilation.js) 查看 Compilation 各种 hook 及提供的资源
