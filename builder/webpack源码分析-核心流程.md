# webpack 源码分析-核心流程

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

思考1: 如果我面试别人，问哪些 webpack 问题，才算是有价值、有深度的呢？  
1. 独立 npm 包构建时如果不把 elementui 打进去，或者说干脆不引用 elementui，子项目能成功使用这个 npm 包吗？为什么？
2. webpack 构建的核心流程是什么？
3. 你调试 webpack 时遇到了哪些问题？tapable 回调地狱，比如在 normalize entry 生成 module 对象流程，解决方案是查看调用栈及全局搜索关键字
4. loader 执行顺序，rules 和 use 执行都是倒序

思考2：本期缕了一下 webpack 构建的核心流程，心里有以下几个问题  
1. 本期缕清楚了，隔半年之后还能说清楚吗？多面试几次回答一下，再来补充遗漏点
2. webpack 整体架构需要再整理一份
3. webpack 构建的亮点是什么？有哪些待优化的点？
4. webpack5 模块联邦特性了解。其他项目暴露 chunk，当前项目主动拉取

## 1 疑问

1. ✔ 配置的 extenal 没有包含在结果 bundle 中，那构建结果是什么样子？使用当前包的项目是怎么使用相关组件的呢？
2. ✔ 打包结果代码是如何组织运行起来的？代码拆分之后怎么合理运行，也就是 webpack 打包结果是如何有效运行？
3. ✔ 异步组件如何加载处理？也就是说，runtime 是如何懒加载模块的？webpackJsonp。异步组件会打包成独立的 chunk，可以通过 chunkFileName 来规范命名
4. 热更新原理是啥？
5. sourcemap 原理
6. output 中 path 和 publicPath 有什么区别？libary 又是啥意思？
7. chunkFileName 指定的长效缓存是啥？chunkFileName 只是用于 import 异步加载的 chunk 命名设置
8. webpack 的 runtime 和 manifest 是啥？
9. ✔ loader 对文件的处理，是在依赖模块遍历过程中处理的，还是进入指定目录统一处理之后再遍历？是遍历到了再用 loader 去处理
10. ✔ module.rules 解析顺序是啥？通过 use 使用的多个 loader 执行顺序是啥？倒序
11. compiler 和 compilation 的主要职责是什么？

最近要解决的问题  
1. ✔ 构建加速：公共组件构建速度慢，通过 dll 缓存优化
2. 构建规范化

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
2. 准备工作：配置读取和处理，环境变量准备，实例化 compiler 对象，加载 plugin，调用 compiler.run 开启构建入口
3. 编译：根据入口文件，查找并生成相关依赖图，每个文件执行对应 loader；在遍历依赖文件的依赖，执行递归处理；整体流程会触发很多 hooks
4. 打包：将依赖输出打包到同一个 chunk 中
5. 输出结果文件，commonjs、umd 等

### 3.1 命令 - 执行 webpack 命令

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

### 3.2 准备 - webpack 实例化 compiler、compilation 对象

一、在 buildCommand 内部主要是调用 webpack 执行入口  
```javascript
// createCompiler
this.webpack = require(process.env.WEBPACK_PACKAGE || 'webpack');
compiler = this.webpack(config.options, callback)
```

webpack-cli 内部也是调用的 webpack 来实例化 compiler 对象。(webpack-cli 感觉是一个命令行交互工具，读取配置，传给 webpack 来使用)  
webpack 入口文件 lib/index.js 输出了 webpack 函数，内部调用 webpack.js，来看看 webpack.js 执行哪些操作

二、webpack.js 初始化
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

归纳分析 `webpack 入口`  
1. 校验 options 参数
2. 调用 createCompiler 生成 compiler 对象
3. compiler.run() 开始整个构建流程

三、来看看 createCompiler 是如何生成 compiler 对象
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
	new WebpackOptionsApply().process(options, compiler);
	compiler.hooks.initialize.call();
	return compiler;
};
```

归纳分析 `createCompiler` 函数执行  
1. 生成 webpack 配置对象 options：getNormalizedWebpackOptions，并合并默认的 webpack 配置对象
2. 调用 new Compiler，生成 compiler 实例对象，并把 options 挂载到 compiler 对象上
3. 加载 plugin：将 plugin 加载到 compiler 对象上
4. 根据应用 options 配置，内部加载各种插件，后续的很多 compiler.hooks 都是在这个阶段定义的
5. 调用钩子函数：环境准备、初始化结束

四、compiler.run 内部调用 compile 方法生成 `compilation` 对象  
```javascript
// Compiler
class Compiler extends Tapable {
  constructor(context) {
		this.hooks = {...};
  }
  run(callback) {
    this.compile(onCompiled)
  }
  compile(callback) {
		const params = this.newCompilationParams();
		this.hooks.beforeCompile.callAsync(params, err => {
			this.hooks.compile.call(params);
			const compilation = this.newCompilation(params);
			this.hooks.make.callAsync(compilation, err => {
				compilation.finish(err => {
					compilation.seal(err => {
						this.hooks.afterCompile.callAsync(compilation, err => {
							return callback(null, compilation);
						});
					});
				});
			});
		});
  }
  newCompilation(params) {
		const compilation = this.createCompilation();
		compilation.fileTimestamps = this.fileTimestamps;
		compilation.contextTimestamps = this.contextTimestamps;
		compilation.name = this.name;
		compilation.records = this.records;
		compilation.compilationDependencies = params.compilationDependencies;
		this.hooks.thisCompilation.call(compilation, params);
		this.hooks.compilation.call(compilation, params);
		return compilation;
  }
  createCompilation() {
		return new Compilation(this);
	}
}
```

归纳分析:   
1. 在调用 compile 方法时，按顺序触发了4种钩子：beforeCompile, compile, make, afterCompile
2. 生成 compilation 对象 new Compilation(this)
3. 调用 make 钩子，开启构建入口

> webpack 由于使用的是基于 tapable 的各种回调方法，源码阅读很不方便，断点调试也不太容易找到，需要去查看调用栈，查看 compilation 的核心方法是哪些地方调用的

### 3.3 入口 - 根据 entry 开始构建

compiler.compile 会实例化 compilation 对象，并调用 `make 钩子`。  

一、make 钩子定义：通过断点 + 调用栈 + 全局搜索查看，发现是在 SingleEntryPlugin.js 中定义的，格式如下  
```javascript
apply(compiler) {
  compiler.hooks.compilation.tap(
    "SingleEntryPlugin",
    (compilation, { normalModuleFactory }) => {
      compilation.dependencyFactories.set(
        SingleEntryDependency,
        normalModuleFactory
      );
    }
  );

  compiler.hooks.make.tapAsync(
    "SingleEntryPlugin",
    (compilation, callback) => {
      const { entry, name, context } = this;

      const dep = SingleEntryPlugin.createDependency(entry, name);
      compilation.addEntry(context, dep, name, callback);
    }
  );
}
```

归纳分析  
1. 通过 compilation 钩子给 compilation 对象注入 dependencyFactories 对象
2. make 内部是调用了 compilation.addEntry 方法

二、compilation addEntry  
```javascript
// 1 addEntry 调用 addModuleTree entry 入口加入模块 chain 中
addEntry(context, entry, name, callback) {
  this.hooks.addEntry.call(entry, name);
  this.addModuleTree(
    {
      context,
      dependency: entry,
      contextInfo: entryData.options.layer
        ? { issuerLayer: entryData.options.layer }
        : undefined
    },
    (err, module) => {
      this.hooks.succeedEntry.call(entry, name, module);
      return callback(null, module);
    }
  );
}
// 2 addModuleTree 参数 dependency 要求为对象，entry 会被封装为一个对象传入
addModuleTree({ context, dependency, contextInfo }, callback) {
  const Dep = /** @type {DepConstructor} */ (dependency.constructor);
  // moduleFactory 为 NormalModuleFactory 实例，是在生成 compilation 对象之后，调用 compiler.hooks.compilation.call(compilation, params) 来添加的 compilation.dependencyFactories map 属性
  const moduleFactory = this.dependencyFactories.get(Dep);
  this.handleModuleCreation(
    {
      factory: moduleFactory,
      dependencies: [dependency],
      originModule: null,
      contextInfo,
      context
    },
    err => {
      callback();
    }
  );
}
// 3 handleModuleCreation
handleModuleCreation( options, callback ) {
  this.factorizeModule(options, () => {})
}
// 4 factorizeModule
factorizeModule(options, callback) {
  this.factorizeQueue.add(options, callback);
}
// 5 constructor 中定义执行 _factorizeModule
this.factorizeQueue = new AsyncQueue({
  name: "factorize",
  parent: this.addModuleQueue,
  processor: this._factorizeModule.bind(this)
});
// 6 _factorizeModule
_factorizeModule(
  options,
  callback
) {
  factory.create(
    {
      contextInfo: {
        issuer: originModule ? originModule.nameForCondition() : "",
        issuerLayer: originModule ? originModule.layer : null,
        compiler: this.compiler.name,
        ...contextInfo
      },
      resolveOptions: originModule ? originModule.resolveOptions : undefined,
      context: context
        ? context
        : originModule
        ? originModule.context
        : this.compiler.context,
      dependencies: dependencies
    },
    (err, result) => {
      const newModule = result.module;
      callback(null, newModule);
    }
  )
}
```

三、module 初始化：分析 NormalModuleFactory.create 流程  
1. NormalModuleFactory hooks.factorize  
```javascript
const dependencyCache = new WeakMap();
class NormalModuleFactory extends Tapable {
  constructor(context, resolverFactory, options) {
    this.parserCache = Object.create(null);
		this.generatorCache = Object.create(null);
		this.hooks.factorize.tapAsync(
			{
				name: "NormalModuleFactory",
				stage: 100
			},
			(resolveData, callback) => {
				this.hooks.resolve.callAsync(resolveData, (err, result) => {
					this.hooks.afterResolve.callAsync(resolveData, (err, result) => {
						const createData = resolveData.createData;
						this.hooks.createModule.callAsync(
							createData,
							resolveData,
							(err, createdModule) => {
								if (!createdModule) {
									createdModule = new NormalModule(createData);
								}
								createdModule = this.hooks.module.call(
									createdModule,
									createData,
									resolveData
								);
								return callback(null, createdModule);
							}
						);
					});
				});
			}
		);
```

2. NormalModuleFactory hooks.resolver  
```javascript
// 核心解析逻辑 NormalModuleFactory.resolver callback 处理
this.hooks.resolve.tapAsync(
  {
    name: "NormalModuleFactory",
    stage: 100
  },
  (data, callback) => {
    const {
      contextInfo,
      context,
      dependencies,
      request,
      resolveOptions,
      fileDependencies,
      missingDependencies,
      contextDependencies
    } = data;
    const dependencyType =
      (dependencies.length > 0 && dependencies[0].category) || "";
    const loaderResolver = this.getResolver("loader");

    /** @type {ResourceData | undefined} */
    let matchResourceData = undefined;
    /** @type {string} */
    let requestWithoutMatchResource = request;
    const matchResourceMatch = MATCH_RESOURCE_REGEX.exec(request);
    if (matchResourceMatch) {
      let matchResource = matchResourceMatch[1];
      if (matchResource.charCodeAt(0) === 46) {
        // 46 === ".", 47 === "/"
        const secondChar = matchResource.charCodeAt(1);
        if (
          secondChar === 47 ||
          (secondChar === 46 && matchResource.charCodeAt(2) === 47)
        ) {
          // if matchResources startsWith ../ or ./
          matchResource = join(this.fs, context, matchResource);
        }
      }
      matchResourceData = {
        resource: matchResource,
        ...cacheParseResource(matchResource)
      };
      requestWithoutMatchResource = request.substr(
        matchResourceMatch[0].length
      );
    }

    const firstChar = requestWithoutMatchResource.charCodeAt(0);
    const secondChar = requestWithoutMatchResource.charCodeAt(1);
    const noPreAutoLoaders = firstChar === 45 && secondChar === 33; // startsWith "-!"
    const noAutoLoaders = noPreAutoLoaders || firstChar === 33; // startsWith "!"
    const noPrePostAutoLoaders = firstChar === 33 && secondChar === 33; // startsWith "!!";
    const rawElements = requestWithoutMatchResource
      .slice(
        noPreAutoLoaders || noPrePostAutoLoaders ? 2 : noAutoLoaders ? 1 : 0
      )
      .split(/!+/);
    const unresolvedResource = rawElements.pop();
    const elements = rawElements.map(identToLoaderRequest);

    const resolveContext = {
      fileDependencies,
      missingDependencies,
      contextDependencies
    };

    /** @type {ResourceDataWithData} */
    let resourceData;
    /** @type {string | undefined} */
    const scheme = getScheme(unresolvedResource);

    let loaders;

    const continueCallback = needCalls(2, err => {
      if (err) return callback(err);

      // translate option idents
      try {
        for (const item of loaders) {
          if (typeof item.options === "string" && item.options[0] === "?") {
            const ident = item.options.substr(1);
            if (ident === "[[missing ident]]") {
              throw new Error(
                "No ident is provided by referenced loader. " +
                  "When using a function for Rule.use in config you need to " +
                  "provide an 'ident' property for referenced loader options."
              );
            }
            item.options = this.ruleSet.references.get(ident);
            if (item.options === undefined) {
              throw new Error(
                "Invalid ident is provided by referenced loader"
              );
            }
            item.ident = ident;
          }
        }
      } catch (e) {
        return callback(e);
      }

      if (!resourceData) {
        // ignored
        return callback(null, dependencies[0].createIgnoredModule(context));
      }

      const userRequest =
        (matchResourceData !== undefined
          ? `${matchResourceData.resource}!=!`
          : "") +
        stringifyLoadersAndResource(loaders, resourceData.resource);

      const resourceDataForRules = matchResourceData || resourceData;
      const result = this.ruleSet.exec({
        resource: resourceDataForRules.path,
        realResource: resourceData.path,
        resourceQuery: resourceDataForRules.query,
        resourceFragment: resourceDataForRules.fragment,
        mimetype: matchResourceData ? "" : resourceData.data.mimetype || "",
        dependency: dependencyType,
        descriptionData: matchResourceData
          ? undefined
          : resourceData.data.descriptionFileData,
        issuer: contextInfo.issuer,
        compiler: contextInfo.compiler,
        issuerLayer: contextInfo.issuerLayer || ""
      });
      const settings = {};
      const useLoadersPost = [];
      const useLoaders = [];
      const useLoadersPre = [];
      for (const r of result) {
        if (r.type === "use") {
          if (!noAutoLoaders && !noPrePostAutoLoaders) {
            useLoaders.push(r.value);
          }
        } else if (r.type === "use-post") {
          if (!noPrePostAutoLoaders) {
            useLoadersPost.push(r.value);
          }
        } else if (r.type === "use-pre") {
          if (!noPreAutoLoaders && !noPrePostAutoLoaders) {
            useLoadersPre.push(r.value);
          }
        } else if (
          typeof r.value === "object" &&
          r.value !== null &&
          typeof settings[r.type] === "object" &&
          settings[r.type] !== null
        ) {
          settings[r.type] = cachedCleverMerge(settings[r.type], r.value);
        } else {
          settings[r.type] = r.value;
        }
      }

      let postLoaders, normalLoaders, preLoaders;

      const continueCallback = needCalls(3, err => {
        if (err) {
          return callback(err);
        }
        const allLoaders = postLoaders;
        if (matchResourceData === undefined) {
          for (const loader of loaders) allLoaders.push(loader);
          for (const loader of normalLoaders) allLoaders.push(loader);
        } else {
          for (const loader of normalLoaders) allLoaders.push(loader);
          for (const loader of loaders) allLoaders.push(loader);
        }
        for (const loader of preLoaders) allLoaders.push(loader);
        const type = settings.type;
        const resolveOptions = settings.resolve;
        const layer = settings.layer;
        if (layer !== undefined && !layers) {
          return callback(
            new Error(
              "'Rule.layer' is only allowed when 'experiments.layers' is enabled"
            )
          );
        }
        Object.assign(data.createData, {
          layer:
            layer === undefined ? contextInfo.issuerLayer || null : layer,
          request: stringifyLoadersAndResource(
            allLoaders,
            resourceData.resource
          ),
          userRequest,
          rawRequest: request,
          loaders: allLoaders,
          resource: resourceData.resource,
          matchResource: matchResourceData
            ? matchResourceData.resource
            : undefined,
          resourceResolveData: resourceData.data,
          settings,
          type,
          parser: this.getParser(type, settings.parser),
          parserOptions: settings.parser,
          generator: this.getGenerator(type, settings.generator),
          generatorOptions: settings.generator,
          resolveOptions
        });
        callback();
      });
      this.resolveRequestArray(
        contextInfo,
        this.context,
        useLoadersPost,
        loaderResolver,
        resolveContext,
        (err, result) => {
          postLoaders = result;
          continueCallback(err);
        }
      );
      this.resolveRequestArray(
        contextInfo,
        this.context,
        useLoaders,
        loaderResolver,
        resolveContext,
        (err, result) => {
          normalLoaders = result;
          continueCallback(err);
        }
      );
      this.resolveRequestArray(
        contextInfo,
        this.context,
        useLoadersPre,
        loaderResolver,
        resolveContext,
        (err, result) => {
          preLoaders = result;
          continueCallback(err);
        }
      );
    });

    this.resolveRequestArray(
      contextInfo,
      context,
      elements,
      loaderResolver,
      resolveContext,
      (err, result) => {
        if (err) return continueCallback(err);
        loaders = result;
        continueCallback();
      }
    );

    // resource with scheme
    if (scheme) {
      resourceData = {
        resource: unresolvedResource,
        data: {},
        path: undefined,
        query: undefined,
        fragment: undefined
      };
      this.hooks.resolveForScheme
        .for(scheme)
        .callAsync(resourceData, data, err => {
          if (err) return continueCallback(err);
          continueCallback();
        });
    }

    // resource without scheme and without path
    else if (/^($|\?)/.test(unresolvedResource)) {
      resourceData = {
        resource: unresolvedResource,
        data: {},
        ...cacheParseResource(unresolvedResource)
      };
      continueCallback();
    }

    // resource without scheme and with path
    else {
      const normalResolver = this.getResolver(
        "normal",
        dependencyType
          ? cachedSetProperty(
              resolveOptions || EMPTY_RESOLVE_OPTIONS,
              "dependencyType",
              dependencyType
            )
          : resolveOptions
      );
      this.resolveResource(
        contextInfo,
        context,
        unresolvedResource,
        normalResolver,
        resolveContext,
        (err, resolvedResource, resolvedResourceResolveData) => {
          if (err) return continueCallback(err);
          if (resolvedResource !== false) {
            resourceData = {
              resource: resolvedResource,
              data: resolvedResourceResolveData,
              ...cacheParseResource(resolvedResource)
            };
          }
          continueCallback();
        }
      );
    }
  }
);
```  

3. NormalModuleFactory. create  
```javascript
create(data, callback) {
  const dependencies = data.dependencies;
  const cacheEntry = dependencyCache.get(dependencies[0]);
  if (cacheEntry) return callback(null, cacheEntry);
  this.hooks.factorize.callAsync(resolveData, (err, module) => {
    const factoryResult = {
      module,
      fileDependencies,
      missingDependencies,
      contextDependencies
    };

    if (
      this.unsafeCache &&
      resolveData.cacheable &&
      module &&
      module.restoreFromUnsafeCache &&
      this.cachePredicate(module)
    ) {
      for (const d of dependencies) {
        unsafeCacheDependencies.set(d, factoryResult);
      }
      if (!unsafeCacheData.has(module)) {
        unsafeCacheData.set(module, module.getUnsafeCacheData());
      }
    }
    callback(null, factoryResult);
  });
}
```

归纳总结  
1. NormalModuleFactory 作用是生成文件对象 module，根据配置找到 module 需要的 loaders
2. create 方法会去查找依赖模块是否有缓存，如果有则直接返回缓存，如果没有才调用 hooks.factory 进行解析
3. hooks.resolver callback 主要是解析需要的相关 loader

compilation addEntry 步骤:  
1. addEntry：内部调用 addModuleTree，将 entry 作为 dependency 传入
2. addModuleTree：将 dependency 加入 module tree 的入口
3. handleModuleCreation：将 _factorizeModule 解析 module 加入异步队列，AsyncQueue 是如何执行？
4. _factorizeModule：调用 factory.create 解析 module，找到需要的 loader，生成 module 对象
5. 加入 moduleGraph 依赖图：执行 handleModuleCreation 回调，将 normalize 的 module 对象，加入 moduleGraph
6. buildModule 开始模块处理

### 3.4 构建 - module.build

handleModuleCreation 回调：构建初始化后的 module 对象
```javascript
// 加入依赖图
moduleGraph.setProfile(newModule, currentProfile);
// addModule 是将 module 加入依赖模块缓存
this.addModule(newModule, (err, module) => {
  this.buildModule(module, err => {
    this.processModuleDependencies(module, err => {
        callback(null, module);
      });
    });
  })
})

_buildModule(module, callback) {
  module.needBuild(
    {
      fileSystemInfo: this.fileSystemInfo,
      valueCacheVersions: this.valueCacheVersions
    },
    (err, needBuild) => {
      this.hooks.buildModule.call(module);
      this.builtModules.add(module);
      module.build(
        this.options,
        this,
        this.resolverFactory.get("normal", module.resolveOptions),
        this.inputFileSystem,
        err => {
          this._modulesCache.store(module.identifier(), null, module, err => {
            this.hooks.succeedModule.call(module);
            return callback();
          });
        }
      );
    }
  )
}
```

关键步骤：  
1. moduleGraph.setProfile(newModule, currentProfile);
2. module.build
3. processModuleDependencies

我们通过 normalModuleFactory `new NormalModule` 生成 module 对象。  
结果倒推：我们通过 module.build 之后构建 module 对象，并生成了 source 文件和内部相关依赖，那么它必然经过 loader 处理和 ast 分析。  
来看看 module 对象定义的 build 方法：  
```javascript
class NormalModule extends Module {
  // 1 build
  build(options, compilation, resolver, fs, callback) {
    this._source = null;
    this._ast = null;
    return this.doBuild(options, compilation, resolver, fs, err => {
      // 1.2 initBuildHash
      const handleParseResult = result => {
				this._initBuildHash(compilation);
				this._lastSuccessfulBuildMeta = this.buildMeta;
				return handleBuildDone();
			};
      // 1.3 生成快照
			const handleBuildDone = () => {
				const snapshotOptions = compilation.options.snapshot.module;
				compilation.fileSystemInfo.createSnapshot(
					startTime,
					this.buildInfo.fileDependencies,
					this.buildInfo.contextDependencies,
					this.buildInfo.missingDependencies,
					snapshotOptions,
					(err, snapshot) => {
						if (err) {
							this.markModuleAsErrored(err);
							return;
						}
						this.buildInfo.fileDependencies = undefined;
						this.buildInfo.contextDependencies = undefined;
						this.buildInfo.missingDependencies = undefined;
						this.buildInfo.snapshot = snapshot;
						return callback();
					}
				);
			};
      // 1.1 this.parser 就是 javascriptParser 对象，内部调用 require("acorn").Parser
      let result = this.parser.parse(this._ast || this._source.source(), {
        current: this,
        module: this,
        compilation: compilation,
        options: options
      });
      handleParseResult(result);
    })
  }
  // 2 doBuild
  doBuild(options, compilation, resolver, fs, callback) {
		const loaderContext = this.createLoaderContext(
			resolver,
			options,
			compilation,
			fs
    );
    const processResult = (err, result) => {
			const source = result[0];
			const sourceMap = result.length >= 1 ? result[1] : null;
      const extraInfo = result.length >= 2 ? result[2] : null;
      
			this._source = this.createSource(
				options.context,
				this.binary ? asBuffer(source) : asString(source),
				sourceMap,
				compilation.compiler.root
			);
			if (this._sourceSizes !== undefined) this._sourceSizes.clear();
			this._ast =
				typeof extraInfo === "object" &&
				extraInfo !== null &&
				extraInfo.webpackAST !== undefined
					? extraInfo.webpackAST
					: null;
			return callback();
		};
    runLoaders(
			{
				resource: this.resource,
				loaders: this.loaders,
				context: loaderContext,
				processResource: (loaderContext, resource, callback) => {
					const scheme = getScheme(resource);
					if (scheme) {
						hooks.readResourceForScheme
							.for(scheme)
							.callAsync(resource, this, (err, result) => {
								return callback(null, result);
							});
					} else {
						loaderContext.addDependency(resource);
						fs.readFile(resource, callback);
					}
				}
			},
			(err, result) => {
				this.buildInfo.fileDependencies = new LazySet();
				this.buildInfo.fileDependencies.addAll(result.fileDependencies);
				this.buildInfo.contextDependencies = new LazySet();
				this.buildInfo.contextDependencies.addAll(result.contextDependencies);
				this.buildInfo.missingDependencies = new LazySet();
				this.buildInfo.missingDependencies.addAll(result.missingDependencies);
				if (
					this.loaders.length > 0 &&
					this.buildInfo.buildDependencies === undefined
				) {
					this.buildInfo.buildDependencies = new LazySet();
				}
				for (const loader of this.loaders) {
					this.buildInfo.buildDependencies.add(loader.loader);
				}
				this.buildInfo.cacheable = result.cacheable;
				processResult(err, result.result);
			}
    );
  }
}
```

module.build 结果分析  
1. 生成 `_source` 对象：使用 runLoaders 方法处理 loader，生成目标 _source 对象，包含了源代码字符串、sourcemap 等
2. 生成 ast：使用 require("acorn").Parser 来解析生成 ast 
3. 生成 `module.dependencies` 对象：parser 内部解析 ast 并生成依赖添加到 module.dependencies

### 3.5 递归依赖 - module.dependencies

在 module.build 生成 _source 和 dependencies 对象之后，就回到 compilation._buildModule 回调中

一、加入缓存
```javascript
// _buildModule callback
this._modulesCache.store(module.identifier(), null, module, err => {
  this.hooks.succeedModule.call(module);
  return callback();
});
// this.handleModuleCreation.buildModule callback
this.processModuleDependencies(module, err => {
  callback(null, module);
});
```

二、解析依赖
```javascript
_processModuleDependencies(module, callback) {
  const dependencies = new Map();
  const sortedDependencies = [];

  let currentBlock = module;

  let factoryCacheKey;
  let factoryCacheValue;
  let factoryCacheValue2;
  let listCacheKey;
  let listCacheValue;

  const processDependency = dep => {
    this.moduleGraph.setParents(dep, currentBlock, module);
    const resourceIdent = dep.getResourceIdentifier();
    if (resourceIdent) {
      const category = dep.category;
      const cacheKey =
        category === esmDependencyCategory
          ? resourceIdent
          : `${category}${resourceIdent}`;
      const constructor = dep.constructor;
      let innerMap;
      let factory;
      if (factoryCacheKey === constructor) {
        innerMap = factoryCacheValue;
        if (listCacheKey === cacheKey) {
          listCacheValue.push(dep);
          return;
        }
      } else {
        factory = this.dependencyFactories.get(dep.constructor);
        innerMap = dependencies.get(factory);
        if (innerMap === undefined) {
          dependencies.set(factory, (innerMap = new Map()));
        }
        factoryCacheKey = constructor;
        factoryCacheValue = innerMap;
        factoryCacheValue2 = factory;
      }
      let list = innerMap.get(cacheKey);
      if (list === undefined) {
        innerMap.set(cacheKey, (list = []));
        sortedDependencies.push({
          factory: factoryCacheValue2,
          dependencies: list,
          originModule: module
        });
      }
      list.push(dep);
      listCacheKey = cacheKey;
      listCacheValue = list;
    }
  };

  const processDependenciesBlock = block => {
    if (block.dependencies) {
      currentBlock = block;
      for (const dep of block.dependencies) processDependency(dep);
    }
    if (block.blocks) {
      for (const b of block.blocks) processDependenciesBlock(b);
    }
  };

  processDependenciesBlock(module);
  this.processDependenciesQueue.increaseParallelism();

  asyncLib.forEach(
    sortedDependencies,
    (item, callback) => {
      this.handleModuleCreation(item, err => {
        callback();
      });
    },
    err => {
      this.processDependenciesQueue.decreaseParallelism();
      return callback(err);
    }
  );
}
```

_processModuleDependencies 归纳分析  
1. 解析 module.dependencies，生成解析好的 sortedDependencies 依赖数组，内部对 module.dependencies 项做资源 getResourceIdentifier 唯一标识
2. 遍历 sortedDependencies 数组调用 handleModuleCreation，再次走一遍 3.3 入口，包括 factory 解析初始化 module，在调用 module.build 构建模块，行成递归

递归解析完所有依赖，每个文件对应一个 module 对象，回到 compiler.compile hooks.make.callback

```javascript
// compilation._addEntryItem
this.hooks.succeedEntry.call(entry, options, module);
// compiler.compile
this.hooks.make.callAsync(compilation, err => {
  this.hooks.finishMake.callAsync(compilation, err => {
    process.nextTick(() => {
      compilation.finish(err => {
        compilation.seal(err => {
          this.hooks.afterCompile.callAsync(compilation, err => {
            return callback(null, compilation);
          });
        });
      });
    });
  });
});
```

至此，所有文件均转换成了对应的 module 对象，保存在 `compilation.modules` Set 对象中，module 关系保存在 `compilation.moduleGraph` 关系中。  
所有资源暂时还保存在内存中。

### 3.6 生成 chunk

在全部生成 module 对象之后，回到 `compilation.seal()`

```javascript

```

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

输出结果  
1. 压缩文件，内部包含了 `//# sourceMappingURL=` 格式，指定了对应 sourcemap 文件地址
2. sourcemap 文件，包含了压缩文件与源代码之间的映射关系

## 6 缓存原理

1. 使用 CommonsChunkPlugin 插件，明确将第三方依赖库 react, vue 等拆分出来，作为客户端缓存文件，达到优化目的
2. 使用 HashedModuleIdsPlugin 插件，保证第三方库生成的 bundle hash 值不变

webpack 是如何实现拆分及保证 hash 值不变的呢？

## 纯前端技术问题

这里总结一下阅读 webpack 源码时，看到的模式技术点  
1. Object.freeze 有什么作用：冻结对象，使对象属性不可增减，属性描述符也不可更改；但是如果属性的值是一个对象，则属性对象的属性是可以更改的，需要递归 freeze；(严格模式下修改冻结对象属性会报错中断)使用场景是什么呢？
2. Object.seal：封闭对象，唯一不同于 freeze，如果属性值描述符 writable = true，那么该属性就可以修改；seal 会比 freeze 要求低一点
3. Object.preventExtensions：阻止对象扩展，唯一不同于 seal，该对象属性是可以删除的
4. commonjs require('./') 返回的是啥？

## 参考文章

[webpack5 中文](https://www.webpackjs.com/guides/caching/)  
[mdn freeze](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)  
[webpack 源码解读](https://juejin.cn/post/6844903987129352206)
