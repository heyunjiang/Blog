# tree shake

time: 2022-03-28 14:11:24  
author: heyunjiang

## 背景

在做动态组件使用 vite 插件修改 $setup 支持时，代码如下  
```javascript
<component :is="$setup[route.path.replace('/', '')]" />
import ComponentA from './ComponentA.vue'
```

开发的 vite 插件如下  
```javascript
const customCompilerPlugin = () => {
  return {
    name: 'customCompilerPlugin',
    transform(code, id, opt) {
      if (/ComponentA.vue/.test(id)) {
        code = code.replace(/_resolveDynamicComponent\(_ctx\.\$setup/g, '_resolveDynamicComponent($setup')
      }
      return {
        code, 
        map: null
      }
    }
  }
}
```

编译结果  
```javascript
_createBlock(_resolveDynamicComponent($setup[$setup.route.path.replace("/", "")]))
```

选择已经成功替换了 `_ctx.$setup` 为 `$setup`，但是又带来了新的问题，引入的 ComponentA 被 tree shaking 摇树优化了。  
现在的目的  
1. tree shake 是在哪里做的？vue 本身，还是 vite or esbuild? esbuild.transformWithEsbuild
2. 如何把 ComponentA 给补充回来

## 1 tree shaking 原理

基础知识  
1. 目的是消除没有用到的代码，而不是不会执行的代码，因为 js 是解释性的
2. 基于 esm，因为 import export 是代码顶层，而不是 cjs require 可以在任何时刻可以加载
3. 处理范围：rollup 只处理函数和顶层 import 变量，不会处理 iife
4. webpack 本身不会做这个，需要使用 uglify.js 实现

## 2 通过插件定位，确定 vue tree shake 位置

因为 vite 插件可以控制顺序，通过在 `@vitejs/plugin-vue` 插件执行之前执行一个插件，查看 code 实现，发现如下  
1. 此刻时在 vite 核心插件执行完毕之后。核心插件包括哪些？
2. 此刻输入的还是 vue 组件源代码
3. 在 vue compiler 编译之后的插件输出 code ，就是 treeshaking 之后的代码

猜想：tree shaking 是在 vue 组件编译为 js 代码期间完成，应该是 vue compiler 实现的

vite pluginContainer transform 入口  
```javascript
export async function createPluginContainer(
  { plugins, logger, root, build: { rollupOptions } }: ResolvedConfig,
  moduleGraph?: ModuleGraph,
  watcher?: FSWatcher
) {
  const container: PluginContainer = {
    async transform(code, id, options) {
      for (const plugin of plugins) {
        result = await plugin.transform.call(ctx as any, code, id, { ssr })
      }
      return {
        code,
        map: ctx._getCombinedSourcemap()
      }
    }
  }
  return container
}
```

而在 `server/index.ts` 入口中，是直接调用的 resolveConfig  
```javascript
const config = await resolveConfig(inlineConfig, 'serve', 'development')
const container = await createPluginContainer(config, moduleGraph, watcher)
```

resolveConfig
```javascript
export async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development'
) {
  let config = inlineConfig
  const rawUserPlugins = (config.plugins || []).flat()
  const [prePlugins, normalPlugins, postPlugins] =
    sortUserPlugins(rawUserPlugins)
  const userPlugins = [...prePlugins, ...normalPlugins, ...postPlugins]
  const resolved = {
    ...
    plugins: userPlugins,
    ...
  }
  ;(resolved.plugins as Plugin[]) = await resolvePlugins(
    resolved,
    prePlugins,
    normalPlugins,
    postPlugins
  )
  return resolved
}
```

核心还是调用了 plugin/resolvePlugins 方法  
```javascript
export async function resolvePlugins(
  config: ResolvedConfig,
  prePlugins: Plugin[],
  normalPlugins: Plugin[],
  postPlugins: Plugin[]
): Promise<Plugin[]> {
  const isBuild = config.command === 'build'

  const buildPlugins = isBuild
    ? (await import('../build')).resolveBuildPlugins(config)
    : { pre: [], post: [] }

  return [
    isBuild ? null : preAliasPlugin(),
    aliasPlugin({ entries: config.resolve.alias }),
    ...prePlugins,
    config.build.polyfillModulePreload
      ? modulePreloadPolyfillPlugin(config)
      : null,
    resolvePlugin({
      ...config.resolve,
      root: config.root,
      isProduction: config.isProduction,
      isBuild,
      packageCache: config.packageCache,
      ssrConfig: config.ssr,
      asSrc: true
    }),
    htmlInlineProxyPlugin(config),
    cssPlugin(config),
    config.esbuild !== false ? esbuildPlugin(config.esbuild) : null,
    jsonPlugin(
      {
        namedExports: true,
        ...config.json
      },
      isBuild
    ),
    wasmPlugin(config),
    webWorkerPlugin(config),
    workerImportMetaUrlPlugin(config),
    assetPlugin(config),
    ...normalPlugins,
    definePlugin(config),
    cssPostPlugin(config),
    config.build.ssr ? ssrRequireHookPlugin(config) : null,
    ...buildPlugins.pre,
    ...postPlugins,
    ...buildPlugins.post,
    // internal server-only plugins are always applied after everything else
    ...(isBuild
      ? []
      : [clientInjectionsPlugin(config), importAnalysisPlugin(config)])
  ].filter(Boolean) as Plugin[]
}
```

归纳总结  
1. vite 内置插件列表包含了：alias, resolvePlugin, html, css, esbuild, json, wasm, webWorker, asset, define, cssPost + buildPlugins
2. 在开发时，只使用了 vite pre 插件：alias, resolvePlugin, html, css, esbuild, json, wasm, webWorker, asset, define, cssPost
3. 因为使用了 esbuild 插件，所以 ts 是在 vue compiler 编译之前处理的？那 vue sfc ts 啥时候处理呢？

在 plugin-vue 中 transform 实现  
```javascript
return transformMain(code, filename, options, this, ssr, customElementFilter(filename));
```

transformMain 源码  
```javascript
export async function transformMain(
  code: string,
  filename: string,
  options: ResolvedOptions,
  pluginContext: TransformPluginContext,
  ssr: boolean,
  asCustomElement: boolean
) {
  const { code: scriptCode, map } = await genScriptCode(
    descriptor,
    options,
    pluginContext,
    ssr
  )
  let resolvedCode = output.join('\n')
  if (
    (descriptor.script?.lang === 'ts' ||
      descriptor.scriptSetup?.lang === 'ts') &&
    !descriptor.script?.src // only normal script can have src
  ) {
    const { code, map } = await transformWithEsbuild(
      resolvedCode,
      filename,
      { loader: 'ts', sourcemap: options.sourceMap },
      resolvedMap
    )
    resolvedCode = code
    resolvedMap = resolvedMap ? (map as any) : resolvedMap
  }

  return {
    code: resolvedCode,
    map: resolvedMap || {
      mappings: ''
    }
  }
}
```

结论：vue script 最终还是通过 esbuild.transformWithEsbuild 来编译 ts，同时实现 tree shaking

## 3 esbuild 实现

vite 中 tree shake 是通过 esbuild 实现的，并且不可以关闭。

问题: esbuild transform option treeShaking: false 有什么用？  
答： 启用该配置意味着 esbuild 不再支持 `/* @__PURE__ */` 注释与 `sideEffects` 字段。 然而它仍会对未用到的导入做自动 tree shaking，因为这不会依赖开发者注释

问题：`/* @__PURE__ */` 注释与 sideEffects 字段 有什么用?  
答：用于标识函数调用结果如果没有被使用，那么该函数也没有被调用。即忽略当前函数的调用

即然 vue3 无法阻止 tree shaking，那么怎么补回代码呢？

## 4 vite plugin 补全丢失的代码

即然通过配置无法阻止，那么后续补充也是一条思路

## 参考文章

1. [Tree-Shaking性能优化实践 - 原理篇](https://juejin.cn/post/6844903544756109319)
2. [Webpack Tree shaking 深入探究](https://juejin.cn/post/6844903687412776974)
3. [esbuild-treeshaking](https://esbuild.github.io/api/#tree-shaking)
