# 模块化

time: 2018.9.11  
update: 2020.7.7  
update: 2021-06-10 19:24:58
author: heyunjiang

目录  
背景  
1. es6 模块化设计思想
2. import
3. export
4. import()
5. 模块加载
6. javascript code module

## 背景

使用 vue, react 组件化开发很久了，一直都是按照指定的模式开发，虽然说没有啥问题，但是也不知道个中缘由。  
在项目日常开发中，有遇到如下问题：  
1. 我在某个局部组件中引入 `Vue` 对象，然后修改 Vue.prototype 属性，会影响到我们全局的 `new Vue` 对象吗？会，因为 import 模块在编译时就打包在了一起， new Vue 是在模块引入之后才执行的；如果是动态加载的模块，则不会收到影响
2. 在使用 import 引入模块内部属性时，打包时会把源文件打进去吗？也就是说打包之后的最终结果是啥？babel 遵循的是浏览器要求的规范吗？会把源文件打进去，并且执行它，babel 是将 es6 -> es5 执行，import 是由 webpack 处理成 es5 代码打包在一起
3. import 引入的属性，我们可以直接修改它吗？不可以

## 1 es6 模块化设计思想

es6 模块化实现，是浏览器自身实现的 api，在执行代码时，发现需要 import 组件，会发起 http 请求，如果之前已经请求过的会被缓存。  
而 commonjs 模块化，主要是 nodejs 的应用，通过 require 关键字加载模块，运行时引入模块并缓存起来。

问题：
1. 为什么说 es6 模块化是编译时确定依赖关系呢？我的es6代码不需要编译呀？在 v8 执行 js 也只是有个语法分析词法分析，生成 ast，然后预执行代码 + 正式解释执行代码，也没有编译执行，就算是 jit 也只是对热点代码的处理，并不是全局的编译执行。2021-06-10 19:35:17
2. es6 模块是如何加载与执行的？从缓存来看

## 2 import 

import 输入属性要点  
1. 输入的变量不可更改：但是变量对象的属性可以更改，并且由于是引用关系，实际修改的是同一堆内存中的值，所以其他使用到的模块也能感知到。最好不要修改 import 的属性值
2. import 命令执行方式：首先引入模块文件，再从模块文件输出变量
3. 创建变量：输入的变量方式，属于创建变量的新方式，其他方式还有 let, const, var, function。都会在代码扫描(编译阶段)存在变量提升，属于 var 方式提升，可以提前访问？

```javascript
// a.js
import Hello from 'b.js';
var foo = '234';

// b.js
let world = 12;
export default world;
```

上述代码的执行流程

1. 获取到 a.js 代码，ast 生成
2. 编译阶段：创建 a.js 的执行上下文，并且伴随 Hello, foo 的提升。解析到需要加载 b.js 文件
3. 处理 b.js: 遇到引入 b.js 文件，又开始 b.js 文件的 ast 生成，编译、调用栈、字节码阶段；也就是说，遇到加载 b.js 文件，在执行 a.js 之前，会先去完整执行 b.js 文件
4. 保存 b.js 的调用栈：因为传递的是引用关系，具体查值还是要进对应的执行上下文
5. 继续执行 a.js 代码：生成字节码文件、机器码，开始执行代码

> import 本质是连接2个模块的变量

## 3 export

输出格式要求  
1. 输出引用关系：定义变量前增加 export，比如 `export const hello = 1`
2. export {}：特殊格式，输出属性集合，内部也是引用关系，不是直接输出值，属于连续 export 的简写方式
3. export default：特殊格式，输出默认属性的引用关系。本质上，等同于 `export {ad as default}`，即输出一个名为 `default` 的变量。只能有一个 `export default`

总结：export 输出必须为一个接口，输出的是模块属性引用关系，不能输出一个值；而 export {} 、export default 属于特殊的输出引用关系方式，也是常用的输出格式。

> export 和 import 不能用在块级作用域中，只能位于顶层

## 4 import()

同 import 直接加载模块不同，import() 方法用于异步加载模块，返回 promise 对象。在浏览器和 nodejs 中都有实现。

## 5 模块加载

### 5.1 浏览器加载模块

传统浏览器加载方式 

``` javascript
<script type="application/javascript" src="path/to/myModule.js"></script>
<script type="application/javascript" src="path/to/myModule.js" defer></script> // 页面渲染完再按顺序执行
<script type="application/javascript" src="path/to/myModule.js" async></script> // 加载完就执行，暂停渲染
```

es6 模块加载

```javascript
<script type="module" src="./foo.js"></script> // 默认带有 defer 属性，异步加载，不需要再设置 defer 属性
```

### 5.2 nodejs 记载模块

commonjs 方式

1. commonjs 模块引入的是值引入，与 es6 的指针引入不同

```javascript
var mod = require('./lib');

moduel.exports = {}
```

es modules 方式

1. 如果想使用 import export 命令，则需要指定文件后缀名 `.mjs` 或者 package.json `type = module`
2. 如果目录在 package.json 中指定了 `main` 字段，则会直接去加载 main 指定路径文件。也可以指定 exports 字段，优先级 exports > main

> 我们在日常业务开发中，通常都是使用 nodejs 环境，让 webpack 处理一下 import export。我们平时写的 import export，都是 es module，但是 webpack 打包结果不一样，是啥原因呢。  
> 答：是为了兼容不支持 esm 的浏览器

## 6 javascript code module

1. `.js`：es6 之前支持的 js 文件格式
2. `.mjs`：浏览器支持的标准 es module 格式，使用 import, export 实现
3. `.jsm`：js module，非标准(2020.10.26)

不同于 esmodule，js code module 是独立的 js 代码块，没有特殊的导出对象  
使用方式如下  
```javascript
// 定义 jsm，文件格式为 jsm
var bar = {
  name : "bar",
  size : 3
};
```

```javascript
// 使用 jsm，这个URL必须是在磁盘上的一个文件
Components.utils.import("resource://app/my_module.jsm");
// 卸载 jsm
Components.utils.unload()
```

特性  
1. jsm 被加载之后由浏览器缓存起来，后续所有其他地方引用组件，是属于对象内存共享，不同于 esm 的独立
2. 引入方式：resource(常用), chrome mainfest

## 参考文章

[es6 阮一峰](https://es6.ruanyifeng.com/#docs/module)  
[js code module](https://developer.mozilla.org/zh-CN/docs/Mozilla/JavaScript_code_modules)
