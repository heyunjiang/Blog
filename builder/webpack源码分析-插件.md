# webpack 源码分析-插件

time: 2021-04-12 20:20:22  
author: heyunjiang

## 1 步骤

compiler 对象实例化前后关键代码如下  
```javascript
// 0. 解析配置
options = new WebpackOptionsDefaulter().process(options);
// 1. 实例化 compiler 对象
compiler = new Compiler(options.context);
// 2. 加载插件
for (const plugin of options.plugins) {
	if (typeof plugin === "function") {
		plugin.call(compiler, compiler);
	} else {
		plugin.apply(compiler);
	}
}
// 3. 根据配置，应用 webpack 自身的系列插件，注册众多 hooks 命令
compiler.options = new WebpackOptionsApply().process(options, compiler);
// 4. compiler.run 开始编译
compiler.run(callback);
```

归纳：  
1. 插件格式要求为函数，或者拥有 apply 属性的对象。这点类似 vue-cli-service，不过后者要求只能函数，后者是在内部将插件函数转换为拥有 apply 属性的对象
2. 插件执行时机，是在 compiler 实例化之后，compiler.run 之前。这点同于 vue-cli-service
