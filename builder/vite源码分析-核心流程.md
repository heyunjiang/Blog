# vite源码分析-核心流程

time: 2022-03-07 17:34:53  
author: heyunjiang

## 背景

vite 核心功能  
1. 依赖预构建
2. 开发服务器 + hmr
3. ts 处理

学习目的  
1. `done` vite 是如何编译 ts？调用的 esbuild.transform api
2. `done` vue3 组件是如何被编译的？看看 @vitejs/plugin-vue 如何处理。vue 插件调用了 compiler api，`options.compiler.compileTemplate`，也就是调用的 `vue/compiler-sfc` 编译 api
3. `done` umd, cjs 如何被处理为 esm？esbuild.build
4. 有的时候，同时存在 script setup + script 时，dev 开发没问题，build 之后访问变量会出现问题？是 compiler 的问题？
5. vite 插件时如何被调用的？无非初始化 + 每个钩子递归调用插件

为了解决心中的疑问，特此来分析源码实现。来看看核心流程

## 1 dev 启动流程

入口 bin/vite.js, `require('../dist/node/cli')`，使用 cac 类似 command 库识别命令，如果是 dev 命令，则会执行如下代码  
```javascript
const { createServer } = await import('./server')
const server = await createServer({})
await server.listen()
```

### 1.1 createServer 启动本地 devserver 服务

createServer 核心流程
```javascript
const config = await resolveConfig(inlineConfig, 'serve', 'development')
const httpsOptions = await resolveHttpsConfig()
const middlewares = connect() as Connect.Server
const httpServer = await resolveHttpServer(serverConfig, middlewares, httpsOptions)
const ws = createWebSocketServer(httpServer, config, httpsOptions)

const watcher = chokidar.watch(path.resolve(root), {})
const moduleGraph: ModuleGraph = new ModuleGraph()
const container = await createPluginContainer(config, moduleGraph, watcher)
watcher.on('change', async (file) => {})

const postHooks: ((() => void) | void)[] = []
for (const plugin of config.plugins) {
  if (plugin.configureServer) {
    postHooks.push(await plugin.configureServer(server))
  }
}
middlewares.use(...)
postHooks.forEach((fn) => fn && fn())

await container.buildStart({})
server._optimizeDepsMetadata = await optimizeDeps()

server.listen() // 调用 httpServerStart 开始监听服务
```

总结步骤事项  
1. 识别 config 配置，生成 `config` 对象
2. 生成 `httpServer`, `ws` 2个服务器对象
3. watcher
4. 插件容器 container
5. watcher 监听文件变更、新增、删除，实现 hmr
6. 加载内置及自定义 http middleware 插件
7. 执行 `buildStart` 钩子
8. optimizer.optimizeDeps() 执行优化
9. 启动 http 服务

optimizeDeps 做了什么事情呢？

### 1.2 optimizeDeps

通过官网信息，大致可以知道 vite 此刻是做依赖预构建，

```javascript
import { init, parse } from 'es-module-lexer'
import { build } from 'esbuild'
export async function optimizeDeps(
  config: ResolvedConfig,
  force = config.server.force,
  asCommand = false,
  newDeps?: Record<string, string>, // missing imports encountered after server has started
  ssr?: boolean
) {
  const dataPath = path.join(cacheDir, '_metadata.json')
  fs.mkdirSync(cacheDir, { recursive: true })
  // 添加 package.json 目的是让缓存中的文件都被识别为 esm
  writeFile(
    path.resolve(cacheDir, 'package.json'),
    JSON.stringify({ type: 'module' })
  )
  let ({ deps, missing } = await scanImports(config))

  const flatIdDeps: Record<string, string> = {}
  await init
  for (const id in deps) {
    const flatId = flattenId(id)
    const filePath = (flatIdDeps[flatId] = deps[id])
    const entryContent = fs.readFileSync(filePath, 'utf-8')
    let exportsData: ExportsData
    try {
      exportsData = parse(entryContent) as ExportsData
    } catch {}
    for (const { ss, se } of exportsData[0]) {
      const exp = entryContent.slice(ss, se)
      if (/export\s+\*\s+from/.test(exp)) {
        exportsData.hasReExports = true
      }
    }
    idToExports[id] = exportsData
    flatIdToExports[flatId] = exportsData
  }

  const start = performance.now()
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: Object.keys(flatIdDeps),
    bundle: true,
    format: 'esm',
    target: config.build.target || undefined,
    external: config.optimizeDeps?.exclude,
    logLevel: 'error',
    splitting: true,
    sourcemap: true,
    outdir: cacheDir,
    ignoreAnnotations: true,
    metafile: true,
  })
  const meta = result.metafile!
  const cacheDirOutputPath = path.relative(process.cwd(), cacheDir)

  for (const id in deps) {
    const entry = deps[id]
    data.optimized[id] = {
      file: normalizePath(path.resolve(cacheDir, flattenId(id) + '.js')),
      src: entry,
      needsInterop: needsInterop(
        id,
        idToExports[id],
        meta.outputs,
        cacheDirOutputPath
      )
    }
  }
  writeFile(dataPath, JSON.stringify(data, null, 2))
  debug(`deps bundled in ${(performance.now() - start).toFixed(2)}ms`)
  return data
}
```
步骤分析总结  
1. 创建 cachedir，也就是 node_modules/.vite/
2. scanImports 扫描分析所有依赖并收集
3. 首先通过 parse 分析依赖是否有 es export
4. 对非 esm 使用 esbuild 构建，这里是对每个 import 入口做一次 build，格式是生成 esm
5. 构建结果写入缓存

问题归纳  
1. 这里知道了预构建转 esm 是使用的 esbuild 实现
2. 重写导入是在哪儿处理的呢？

接下来，分析代码 transform 流程

```javascript

```

## 2 插件

在解决 vue3 编译问题，想要实现类似 ast 解析处理特定代码问题，就了解了 vite 如何编译 vue 的。  
vue 组件的编译，是通过 @vitejs/plugin-vue 实现的。
```javascript

```
在查看这个插件源码时，发现它提供了 vite 插件要求的几个配置：buildStart, load, transform 等，先对 vite 插件做个基础学习总结

1. vite-plugin-inspect 可以检查插件的中间状态，可以体验使用
2. 插件提供配置，在 vite.config.js 中被顺序调用，可以配置优先级

通用钩子: 在 build 时直接使用 rollup，在 dev 时创建插件容器调用 rollup 钩子。咋理解？  
1. options：读取配置
2. buildStart：服务启动
3. resolveId
4. load: 加载模块文件时处理，返回代码
5. transform：通常用于代码编译，输入编译前的 code，输出编译后的 code
6. buildEnd
7. closeBundle

vite 特有钩子  
1. config: vite 配置解析之前调用，可以改变 vite.config.js 文件
2. configResolved
3. configServer: 配置开发服务器，可以添加一下 dev 时的中间件
4. transformIndexHtml：处理 index.html 入口文件，返回新的 html 字符串
5. handleHotUpdate：自定义 hmr 处理

## 3 rollup 基础

1. 本身是一个模块打包器，也就是会把众多小模块打包成大的模块
2. 可以作为 library 和 application
3. 插件的作用：rollup 本身只做模块的打包，一些自定义打包行为可以通过插件来实现
4. 插件格式是同 vite 一样，对象配置方式

## 参考文章

1. [vite 官网](https://vitejs.bootcss.com/guide/api-plugin.html#universal-hooks)
2. [rollup 中文网](https://www.rollupjs.com/guide/plugin-development)
