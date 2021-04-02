# webpack 源码分析

time: 2021-03-16 15:35:55
author: heyunjiang

目录  
1. 疑问
2. 打包结果分析
3. 关键源码分析
4. hmr 原理
5. sourcemap 原理
6. 缓存原理
7. 懒加载原理

思考: 如果我面试别人，问哪些 webpack 问题，才算是有价值、有深度的呢？  
1. 独立 npm 包构建时如果不把 elementui 打进去，或者说干脆不引用 elementui，子项目能成功使用这个 npm 包吗？为什么？

## 1 疑问

1. ✔ 配置的 extenal 没有包含在结果 bundle 中，那构建结果是什么样子？使用当前包的项目是怎么使用相关组件的呢？
2. ✔ 打包结果代码是如何组织运行起来的？代码拆分之后怎么合理运行，也就是 webpack 打包结果是如何有效运行？
3. 异步组件如何加载处理？也就是说，runtime 是如何懒加载模块的？webpackJsonp。异步组件会打包成独立的 chunk，可以通过 chunkFileName 来规范命名
4. 热更新原理是啥？
5. sourcemap 原理
6. output 中 path 和 publicPath 有什么区别？libary 又是啥意思？
7. chunkFileName 指定的长效缓存是啥？chunkFileName 只是用于 import 异步加载的 chunk 命名设置
8. webpack 的 runtime 和 manifest 是啥？
9. ✔ loader 对文件的处理，是在依赖模块遍历过程中处理的，还是进入指定目录统一处理之后再遍历？是遍历到了再用 loader 去处理
10. module.rules 解析顺序是啥？通过 use 使用的多个 loader 执行顺序是啥？

最近要解决的问题  
1. 构建加速：公共组件构建速度慢，通过 dll 缓存优化
2. 构建规范化

> webpack 功能不多，快速搞定源码阅读，给定2周时间，3.31 之前完成

## 2 打包结果分析

打包结果可以是 commonjs, umd 的，这里都列举一个结果外壳  
```javascript
// commonjs
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "fb15");
/******/ })
/************************************************************************/
/******/ ({

/***/ "00ee":
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__("b622");

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';


/***/ })
// 其他 id 及模块
});
```

```javascript
// umd
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Echarts"), require("vue"));
	else if(typeof define === 'function' && define.amd)
		define(["Echarts", ], factory);
	else if(typeof exports === 'object')
		exports["base-lib"] = factory(require("Echarts"), require("vue"));
	else
		root["base-lib"] = factory(root["Echarts"], root["Vue"]);
})((typeof self !== 'undefined' ? self : this), function(__WEBPACK_EXTERNAL_MODULE__164e__, __WEBPACK_EXTERNAL_MODULE__8bbf__) {
return /******/ 
  // 这里包含 common module.exports = 后面的内容
});
```

commonjs 模块模拟实现 `__webpack_require__`
``` javascript
// The require function
function __webpack_require__(moduleId) {
	// Check if module is in cache
	if(installedModules[moduleId]) {
		return installedModules[moduleId].exports;
	}
	// Create a new module (and put it into the cache)
	var module = installedModules[moduleId] = {
		i: moduleId,
		l: false,
		exports: {}
	};
	// Execute the module function
	modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	// Flag the module as loaded
	module.l = true;
	// Return the exports of the module
	return module.exports;
}
```

业务模块构建结果  
```javascript
var MCountCard_component = normalizeComponent(
  MCountCard_MCountCardvue_type_script_lang_ts_,
  MCountCardvue_type_template_id_db1ec106_scoped_true_render,
  MCountCardvue_type_template_id_db1ec106_scoped_true_staticRenderFns,
  false,
  null,
  "db1ec106",
  null
)
// component
var MCountCardvue_type_script_lang_ts_MCountCard = /*#__PURE__*/function (_Vue) {
  _inherits(MCountCard, _Vue);

  var _super = _createSuper(MCountCard);

  function MCountCard() {
    var _this;

    _classCallCheck(this, MCountCard);

    _this = _super.apply(this, arguments);
    _this.activeTab = '';
    return _this;
  }

  _createClass(MCountCard, [{
    key: "cardClick",
    value: function cardClick(info) {
      this.$emit('click', info);

      if (this.enableActive) {
        this.activeTab = info.key;
      }
    }
  }]);

  return MCountCard;
}(external_commonjs_vue_commonjs2_vue_root_Vue_default.a);

// render
var MCountCardvue_type_template_id_db1ec106_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[(_vm.showTitle)?_c('div',{staticClass:"title-container"},[_c('h3',{staticClass:"title-text"},[_vm._v("中文")]),(_vm.docUrl)?_c('div',{staticClass:"doc-box"},[_c('i',{staticClass:"el-icon-question primary-color"}),_c('a',{attrs:{"href":_vm.docUrl,"target":"_blank"}},[_vm._v("中文")])]):_vm._e()]):_vm._e(),_c('div',{staticClass:"card-container"},_vm._l((_vm.cardList),function(item){return _c('el-card',{key:item.key,staticClass:"box-card cleafix",class:{'box-card-children': item.children},attrs:{"attr":_vm.activeTab === item.key ? 'activeTab' : ''},nativeOn:{"click":function($event){return _vm.cardClick(item)}}},[(item.children)?[_c('div',{staticClass:"card-panel-title"},[_vm._v(_vm._s(item.name))]),_c('div',{staticClass:"card-child-container"},_vm._l((item.children),function(jtem){return _c('div',{key:jtem.key,staticClass:"card-child-box"},[_c('i',{staticClass:"icon-child",class:jtem.iconClass,style:({color: jtem.color})}),_c('div',{staticClass:"child-content"},[_c('div',{staticClass:"card-child-text"},[_vm._v(_vm._s(jtem.name))]),_c('div',{staticClass:"card-child-num",style:({color: jtem.color})},[_vm._v(_vm._s(_vm.cardData[jtem.key] >= 0 ? _vm.cardData[jtem.key] : '--'))])])])}),0)]:[(item.iconClass)?_c('i',{staticClass:"icon-base",class:item.iconClass,style:({color: item.color})}):[(item.key === 'totalCount')?_c('svg')]):_vm._e()],_c('div',{staticClass:"right-content"},[_c('div',{staticClass:"card-panel-text"},[_vm._v(_vm._s(item.name))]),_c('div',{staticClass:"card-panel-num",style:({color: item.color})},[_vm._v(_vm._s(_vm.cardData[item.key] >= 0 ? _vm.cardData[item.key] : '--'))])])]],2)}),1)])}
var MCountCardvue_type_template_id_db1ec106_scoped_true_staticRenderFns = []
```

结果分析：  
1. 结果执行方式：使用定义函数的立即执行模式 `(function(modules) {})({'fb15': (function() {})})`
2. 核心加载器：`__webpack_require__`, 这个是 webpack 输出的加载模块器，它是 commonjs require 的模拟实现，其内部又实现了 commonjs 模块执行的环境，属于模拟实现了 module, exports
3. 对于 external，commonjs 是通过 require('Echarts') 来加载相关模块，这要求对应项目有对应 npm 包；如果是 amd，则通过 define 来加载；否则使用 root['Echarts']，也就是 window.Echarts 来加载全局对象；所以对于配置了 external 的项目，需要目标环境提供相应的 npm 包或全局对象
4. 模块组织方式：是统一包装在一个 plainObject 对象中，每个模块对应一个模块 id，通过 `__webpack_require__` 去加载实现；commonjs 模块结果还是保留了之前的 commonjs 写法，比如 module.exports, require 等；es6 会编译成 commonjs 风格？
5. 业务代码模块：从 index.js 入口开始，将找到的所有依赖模块，都打包在一起，放在 'fb15' 这个入口模块中；所有的内部 exports, import 都改成了 var 来声明。都放置在 `fb15` 模块中，所以这个模块格外大

## 3 关键源码分析

通过第二点的打包结果分析，已经大致能分析出 webpack 核心打包原理  
1. 打包命令 `webpack`
2. 准备工作：配置读取，环境变量准备，实例化 compiler 对象，加载 plugin
3. 编译：根据入口文件，查找相关依赖，每个文件执行对应 loader；在遍历依赖文件的依赖，执行递归处理；不同生命周期执行 plugin
4. 打包：将依赖输出打包到同一个 chunk 中
5. 输出结果文件，commonjs、umd 等

### 3.1 入口执行 webpack 命令

通过 webpack package.json bin 入口，可以看到 webpack 是通过调用 webpack-cli 去执行 `webpack` 命令；webpack-cli 定义了 WebpackCLI class，实例化然后调用 run 方法。  
run 方法内部，定义了系列命令，包含 build, help, version 等。使用 `commander` 解析用户命令行交互，然后执行 `loadCommandByName` 方法。

```javascript
// loadCommandByName
const loadCommandByName = async (commandName, allowToInstall = false) => {
    const isBuildCommandUsed = isCommand(commandName, buildCommandOptions);
    const isWatchCommandUsed = isCommand(commandName, watchCommandOptions);

    if (isBuildCommandUsed || isWatchCommandUsed) {
        const options = this.getBuiltInOptions();

        await this.makeCommand(
            isBuildCommandUsed ? buildCommandOptions : watchCommandOptions,
            isWatchCommandUsed ? options.filter((option) => option.name !== 'watch') : options,
            async (entries, options) => {
                if (entries.length > 0) {
                    options.entry = [...entries, ...(options.entry || [])];
                }

                await this.buildCommand(options, isWatchCommandUsed);
            },
        );
    } else {
        ...
    }
};
```

总结归纳：入口 loadCommandByName 执行 webpack 等命令，会有如下步骤  
1. getBuiltInOptions 获取 options
2. makeCommand 检查依赖
3. buildCommand 生成 compiler 对象，从入口 entry 解析文件

### 3.2 实例化 compiler 对象

在 buildCommand 内部主要是实例化 compiler 对象 `this.createCompiler(options, callback)`

```javascript
// createCompiler
this.webpack = require(process.env.WEBPACK_PACKAGE || 'webpack');
compiler = this.webpack(config.options, callback)
```

webpack-cli 内部也是调用的 webpack 来实例化 compiler 对象。(webpack-cli 感觉是一个命令行交互工具，读取配置，传给 webpack 来使用)  
webpack 入口文件 lib/index.js 输出了 webpack 函数，内部调用 webpack.js，来看看 webpack.js 执行哪些操作

```javascript
// webpack.js
module.exports = (options, callback) => {
  const create = () => {
    validateSchema(webpackOptionsSchema, options);
    let compiler;
    let watch = false;
    let watchOptions;
    compiler = createCompiler(options);
    watch = options.watch;
    watchOptions = options.watchOptions || {};
    return { compiler, watch, watchOptions };
  };
  try {
    const { compiler, watch, watchOptions } = create();
    if (watch) {
      compiler.watch(watchOptions, callback);
    } else {
      compiler.run((err, stats) => {
        compiler.close(err2 => {
          callback(err || err2, stats);
        });
      });
    }
    return compiler;
  } catch (err) {
    process.nextTick(() => callback(err));
    return null;
  }
}
```
```javascript
// createCompiler
const createCompiler = rawOptions => {
	const options = getNormalizedWebpackOptions(rawOptions);
	applyWebpackOptionsBaseDefaults(options);
	const compiler = new Compiler(options.context);
	compiler.options = options;
	new NodeEnvironmentPlugin({
		infrastructureLogging: options.infrastructureLogging
	}).apply(compiler);
	if (Array.isArray(options.plugins)) {
		for (const plugin of options.plugins) {
			if (typeof plugin === "function") {
				plugin.call(compiler, compiler);
			} else {
				plugin.apply(compiler);
			}
		}
	}
	applyWebpackOptionsDefaults(options);
	compiler.hooks.environment.call();
	compiler.hooks.afterEnvironment.call();
	new WebpackOptionsApply().process(options, compiler);
	compiler.hooks.initialize.call();
	return compiler;
};
```

归纳分析  
1. 生成 compiler 对象：通过调用 createCompiler 函数，调用 new Compiler，生成 compiler 实例对象
2. compiler.run()：开始编译
3. 加载 plugin：将 plugin 加载到 compiler 对象上
4. 调用钩子函数：环境准备、初始化结束

```javascript
// Compiler
// Compilation 看到 constructor 卡住了，代码太长了，需要再次阅读文档，可能需要打断点调试了
```

```javascript

```

## 4 webpack 源码架构分析

## 4 hmr 原理

### 4.1 应用程序中

1. 应用程序要求 hmr 模块检查更新
2. hmr 模块下载更新，通知应用程序
3. 应用程序收到请求，并要求 hmr 应用更新
4. hmr 应用更新

### 4.2 编译器中

编译器 compiler 是将源代码编译为目标 chunk + manifest，在需要更新时，编译器将编译结果，通过 update 事件发送出去，包含以下内容
1. 更新后的 manifest json 数据 (是独立文件吗？)
2. 一个或多个更新后的 chunk js 代码 (是独立文件吗？)

### 4.3 在模块中

模块可以实现 hmr 接口，来实现定制化的功能，不过这个是可选的，一版用不着

### 4.4 在 hmr 模块中

也就是 hmr runtime，衔接浏览器应用程序和 webpack 的。

## 5 sourcemap 原理

应用在 devtool 选项中，可用值如下
1. `none`：无 sourcemap，构建速度很快
2. `source-map`：完整映射，独立文件，在 bundle 中添加了引用注释，方便工具直接找到它；构建速度慢，应用于 `生产环境`
3. `hidden-source-map`：完整映射，独立文件，但是不在 bundle 中添加引用注释，对工具屏蔽，主要用于开发者自行分析；构建速度慢，应用于 `生产环境`
4. `nosources-source-map`：不包含完整源代码，但是可以映射堆栈跟踪；构建速度慢，应用于 `生产环境`
5. `eval`：映射到转换后的代码，而不是源代码；构建速度快，应用于 `开发环境`
6. `eval-source-map`：映射到源代码；初步构建速度慢，更新构建快，应用于 `开发环境` 的最佳实践
7. `cheap-eval-source-map`：类似于 eval-source-map，但是仅映射到行数，并且显示的是转换后的代码；构建速度一版，应用于 `开发环境`
8. 其他不适用于生产或开发环境，应用于第三方工具

## 6 缓存原理

1. 使用 CommonsChunkPlugin 插件，明确将第三方依赖库 react, vue 等拆分出来，作为客户端缓存文件，达到优化目的
2. 使用 HashedModuleIdsPlugin 插件，保证第三方库生成的 bundle hash 值不变

webpack 是如何实现拆分及保证 hash 值不变的呢？

## 纯前端技术问题

这里总结一下阅读 webpack 源码时，看到的模式技术点  
1. Object.freeze 有什么作用
2. commonjs require('./') 返回的是啥？

## 参考文章

[webpack5 中文](https://www.webpackjs.com/guides/caching/)
