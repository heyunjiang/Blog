# vue-cli

time: 2021-04-08 16:53:32  
author: heyunjiang

## 背景

最近在了解 webpack 打包原理时，从一个 vue-cli 启动的项目入手，了解了 vue-cli 内部实现机制，这里做个总结

## 1 整体架构设计

vue-cli 是一个 nodejs 脚手架，通过 package.json bin 字段指定入口，然后调用 service 对象初始化并 run 跑起来，定义了如下对象  
1. Service 对象：作为 vue-cli 命令的入口对象，每次执行都会初始化一个实例。包含了什么功能？
2. PluginAPI：加载 vue-cli 的插件，注册相关插件命令

Service 作用  
1. 加载基本配置：vue.config.js 配置，合并自身 default 配置
2. 加载插件：包括内置的 build, help 等，package.json 中配置的插件
3. 加载 webpack 配置：生成 webpackChainFns 对象，处理 webpack chain 配置

PluginAPI 作用  
1. 注册插件
2. 注册 webpack 配置

思考：vue-cli-service 核心实现比较简洁，提供 Service class 对象，内部实现了基础配置、插件列表、webpack 配置数据保存。
run 方法执行做了初始化和执行命令2个操作，而初始化就包含了插件的执行。
这里有一个特点，我们在之前相关命令之前，会把我们注册的插件函数执行一遍，这是插件的核心调用逻辑。
而插件是能够修改 service 实例的基础配置、webpack 配置的，这就让我们对 webpack 的特定操作可以抽离出来，发布为 npm 等公共资源。

## 2 插件化实现

约定  
1. 只要 package.json 中 devDependencies 和 dependencies 中 install 了的插件，都会尝试去加载为 cli 插件，只要命名符合约定规范，在 Service.resolvePlugins 中有体现，而 vue.config.js 中可以传插件配置
2. service 插件要求输出一个函数(在 index.js 中输出)，接受参数：PluginApi + options，options 为 vue.config.js + vue-cli-service 默认配置的合并版本
3. 插件按顺序执行，buildin > pkg 加载的
4. 一个插件应包含 service(index.js) 入口，和可选的 generator、prompt、ui 文件

插件的作用  
1. 修改 webpack 配置：PluginApi.chainWebpack(fn), fn 接受 webpackConfig 参数，属于 webpack 链式操作
2. 添加新的 vue-cli-service 命令：通过 PluginApi.registerCommand 给 Service.commands 添加新的命令
3. 修改 package.json 配置
4. 增删改项目文件
5. 增加用户交互命令

执行流程  
第一步：构建插件。构造完毕，可以发布为 npm 包，name 命名为 `vue-cli-plugin-myPlugin` 格式  
```javascript
const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin')
module.exports = (api, options) => {
  // 修改 webpack chain 配置
  api.chainWebpack(webpackConfig => {
    webpackConfig
    .plugin('vue-auto-routing')
      .use(VueAutoRoutingPlugin, [
        {
          pages: 'src/pages',
          nested: true
        }
      ])
  })
  // 注册新的命令
  api.registerCommand(
    'greet',
    {
      description: 'Write a greeting to the console',
      usage: 'vue-cli-service greet'
    },
    () => {
      console.log(`👋  Hello`)
    }
  )
}
```

第二步：Service.resolvePlugins 加载插件源码。在 Service constructor 中会执行 resolvePlugins 函数，加载插件。  
```javascript
resolvePlugins (inlinePlugins, useBuiltIn) {
  const idToPlugin = id => ({
    id: id.replace(/^.\//, 'built-in:'),
    apply: require(id)
  })

  let plugins

  // 1 自身插件加载
  const builtInPlugins = [
    './commands/serve',
    './commands/build',
    './commands/inspect',
    './commands/help',
    // config plugins are order sensitive
    './config/base',
    './config/css',
    './config/prod',
    './config/app'
  ].map(idToPlugin)

  if (inlinePlugins) {
    plugins = useBuiltIn !== false
      ? builtInPlugins.concat(inlinePlugins)
      : inlinePlugins
  } else {
    // 2 package.json 中插件加载
    const projectPlugins = Object.keys(this.pkg.devDependencies || {})
      .concat(Object.keys(this.pkg.dependencies || {}))
      .filter(isPlugin)
      .map(id => {
        if (
          this.pkg.optionalDependencies &&
          id in this.pkg.optionalDependencies
        ) {
          let apply = () => {}
          try {
            apply = require(id)
          } catch (e) {
            warn(`Optional dependency ${id} is not installed.`)
          }

          return { id, apply }
        } else {
          return idToPlugin(id)
        }
      })
    plugins = builtInPlugins.concat(projectPlugins)
  }
  return plugins
}
```

第三部：Service.init 初始化，包括加载配置文件、执行插件、加载 webpack 配置  
```javascript
// Service.init 方法
init (mode = process.env.VUE_CLI_MODE) {
  // 1 加载 vue.config.js 配置，并和 defaults 配置合并
  const userOptions = this.loadUserOptions()
  this.projectOptions = defaultsDeep(userOptions, defaults())

  // 2 执行插件函数，传入 PluginAPI 实例和 cli 配置
  this.plugins.forEach(({ id, apply }) => {
    if (this.pluginsToSkip.has(id)) return
    apply(new PluginAPI(id, this), this.projectOptions)
  })

  // 3 应用 vue.config.js 中的 webpack 配置
  if (this.projectOptions.chainWebpack) {
    this.webpackChainFns.push(this.projectOptions.chainWebpack)
  }
  if (this.projectOptions.configureWebpack) {
    this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
  }
}
// PluginApi 注册插件、注册 webpack 配置
registerCommand (name, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = null
  }
  this.service.commands[name] = { fn, opts: opts || {}}
}
chainWebpack (fn) {
  this.service.webpackChainFns.push(fn)
}
```

第四步：执行 vue-cli-service 相关命令，比如 `vue-cli-service build`  
```javascript
// run 在 bin/vue-cli-service 入口命令处，在实例化 Service 之后执行的第一个方法，作为 Service 的入口
async run (name, args = {}, rawArgv = []) {
  const mode = args.mode || (name === 'build' && args.watch ? 'development' : this.modes[name])
  // 1 初始化
  this.init(mode)
  args._ = args._ || []
  let command = this.commands[name]
  const { fn } = command
  // 2 执行相关命令
  return fn(args, rawArgv)
}
```

## 3 build 插件源码分析

在加载好 webpack 相关配置后，我们来看看 build 是怎么执行 webpack 的

大致步骤如下  
1. 生成 webpack 配置
2. 调用 webpack 执行

vue-cli-service build 插件 build 方法
```javascript
async function build (args, api, options) {
  const fs = require('fs-extra')
  const path = require('path')
  const webpack = require('webpack')

  // 1 读取 webpack 配置
  let webpackConfig
  if (args.target === 'lib') {
    webpackConfig = require('./resolveLibConfig')(api, args, options)
  } else {
    webpackConfig = require('./resolveAppConfig')(api, args, options)
  }
  // 2 执行 webpack
  return new Promise((resolve, reject) => {
    webpack(webpackConfig)
  })
}
```

这里来看看是如何实现 webpack 配置转换的

```javascript
// resolveLibConfig
module.exports = (api, { entry, name, formats, filename, 'inline-vue': inlineVue }, options) => {
  const fullEntryPath = api.resolve(entry)
  function genConfig (format, postfix = format, genHTML) {
    const config = api.resolveChainableWebpackConfig()

    const browserslist = require('browserslist')
    const targets = browserslist(undefined, { path: fullEntryPath })
    const supportsIE = targets.some(agent => agent.includes('ie'))

    const webpack = require('webpack')
    config.plugin('need-current-script-polyfill')
      .use(webpack.DefinePlugin, [{
        'process.env.NEED_CURRENTSCRIPT_POLYFILL': JSON.stringify(supportsIE)
      }])

    // 压缩
    if (!/\.min/.test(postfix)) {
      config.optimization.minimize(false)
    }

    const entryName = `${filename}.${postfix}`
    config.resolve
      .alias
        .set('~entry', fullEntryPath)

    config.output.libraryTarget(format)
    const rawConfig = api.resolveWebpackConfig(config)
    let realEntry = require.resolve('./entry-lib.js')

    // 配置 externals
    rawConfig.externals = [
      ...(Array.isArray(rawConfig.externals) ? rawConfig.externals : [rawConfig.externals]),
      {
        ...(inlineVue || {
          vue: {
            commonjs: 'vue',
            commonjs2: 'vue',
            root: 'Vue'
          }
        })
      }
    ].filter(Boolean)
    // 配置 entry
    rawConfig.entry = {
      [entryName]: realEntry
    }
    // 配置 output
    rawConfig.output = Object.assign({
      library: libName,
      libraryExport: isVueEntry ? 'default' : undefined,
      libraryTarget: format,
      globalObject: `(typeof self !== 'undefined' ? self : this)`
    }, rawConfig.output, {
      filename: `${entryName}.js`,
      chunkFilename: `${entryName}.[name].js`,
      publicPath: ''
    })

    return rawConfig
  }

  // 生成 commonjs, umd, umd.min 三种模式结果
  const configMap = {
    commonjs: genConfig('commonjs2', 'common'),
    umd: genConfig('umd', undefined, true),
    'umd-min': genConfig('umd', 'umd.min')
  }

  const formatArray = (formats + '').split(',')
  const configs = formatArray.map(format => configMap[format])
  if (configs.indexOf(undefined) !== -1) {
    const unknownFormats = formatArray.filter(f => configMap[f] === undefined).join(', ')
    abort(
      `Unknown library build formats: ${unknownFormats}`
    )
  }

  return configs
}
```

webpack 配置转换，核心是自己实现了 rawConfig 对象，配置 entry, output, extenals 等，然后合并其他通过 webpack-chain 生成的 webpackConfig

## 4 收获总结

1. 一个成熟脚手架的实现思路
2. 插件化开发模式：核心模块 + 插件
3. webpack 封装实现
4. 其他小点：ora 控制台 loading；joi 实现 schema 创建及校验；通过 webpack-chain 生成 webpackConfig
