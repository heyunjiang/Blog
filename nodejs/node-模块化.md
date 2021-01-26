# node-模块化

time: 2020.12.21  
author: heyunjiang

## 1 模块加载与导出

nodejs 默认使用 commonjs 模块，这里列举模块加载和使用方式  
1. require()：是在运行时加载，加载后生成模块缓存
2. 模块加载缓存：多次 require 同一个模块文件，该文件可能只会执行一次，后续被缓存起来。即使存在循环依赖，也只会加载一次
3. `模块缓存规则`：不同目录加载的文件，最终缓存的模块名字不一样，也就是会根据不同目录执行多次；依赖缓存名为当前模块的 node_modules 目录下
4. 核心模块：位于 nodejs 源码的 lib 目录下，nodejs 会默认首先加载核心模块，即使存在同名模块(即最好不要构建与核心模块同名的 npm 包)
5. exports.：导出资源使用 `exports.`
6. 模块循环加载：会将被循环依赖的模块的未执行完全副本交给当前模块，让当前模块读取
7. 默认后缀：如果未带依赖模块后缀，则按如下优先级查找：`.js .json .node`
8. 入口文件：nodejs 按如下优先级加载入口文件: package.json 中的 main 字端、index.js、index.node
9. node_modules 加载优先级：nodejs 加载局部 npm 包时，是从当前路径下的 node_modules 开始查找，然后查找父级目录，直到根目录，package.json 只是一个记录，不是查找依赖
10. NODE_PATH 环境变量：是一个以冒号分割的绝对路径列表，nodejs 可以通过加环境变量实现全局模块加载
11. `模块包装器`：nodejs 模块的执行是被 nodejs 封装在限定的一个函数中，函数参数提供了 exports, module, require, __filename, __dirname
12. __dirname: 模块当前的绝对路径目录名，不包含当前模块名
13. __filename: 模块当前的绝对路径，包含当前模块名
14. exports 是 module.exports 的简短引用方式，在实际模块执行之前，会将其赋值给 module.exports，**使用 exports = {} 是无用的**，这点要区别 es module
15. `require.cache` 用于查看和处理缓存文件
16. require.main 返回 module 对象，表示项目入口文件
17. require.resolve() 查看模块的位置，不会加载该模块，返回解析后的文件名
18. require.resolve.paths 查看模块的解析过程查找路径数组，同样不会加载模块

```javascript
// nodejs 模块包装器
(function(exports, module, require, __filename, __dirname) {
  // 模块代码执行区域
})
```

```javascript
// module 对象格式
{
  id: '.',
  path: '/absolute/path/to',
  exports: {},
  parent: null,
  filename: '/absolute/path/to/entry.js',
  loaded: false,
  children: [],
  paths:
   [ '/absolute/path/to/node_modules',
     '/absolute/path/node_modules',
     '/absolute/node_modules',
     '/node_modules' ]
}
```

```javascript
// require 的模拟实现方式
function require(/* ... */) {
  const module = { exports: {} };
  ((module, exports) => {
    // 模块代码在这。在这个例子中，定义了一个函数。
    function someFunc() {}
    exports = someFunc;
    // 此时，exports 不再是一个 module.exports 的快捷方式，
    // 且这个模块依然导出一个空的默认对象。
    module.exports = someFunc;
    // 此时，该模块导出 someFunc，而不是默认对象。
  })(module, module.exports);
  return module.exports;
}
```

## 2 module 对象

> 该 module 对象与模块包装器中的 module 不同，当前是 nodejs 的核心模块 module，需要通过 require or import 使用 `require('module').buildinModules`

1. module.builtinModules：罗列 nodejs 提供的所有模块名称，也就是内置核心模块
2. module.createRequire
3. module.syncBuiltinESMExports：初始化 es module 属性以匹配 commonjs exports，用以解决认为更改了 commonjs 对象后恢复
4. module.findSourceMap(path[, error])：查看文件对应的 sourcemap 文件
5. module.SourceMap 类

const sourcemap = new SourceMap(payload)
sourcemap.payload
sourcemap.findEntry(lineNumber, columnNumber)

> nodejs 内置了对 sourcemap 的操作

## 3 问题总结

1. 模块加载缓存，有什么优势与缺点？
2. 模块加载缓存，缓存的位置是那里？
3. 为什么 nodejs 模块可以直接使用 exports? 因为有模块包装器

## 参考地址

[nodejs 官网-模块化](http://nodejs.cn/api/modules.html)
