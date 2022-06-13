# compiler

time: 2022-03-24 20:13:24  
author: heyunjiang

## 背景

最近想做 webpack loader ast 类似的分析处理 template 代码，场景是在 vue3 component.is 动态组件中，使用 script setup 时是直接使用的变量
```javascript
<component :is="$route.path.replace('/', '')" />
<script setup>
import A from 'A.vue'
</script>
```
此刻的组件 A 就不能被使用，应该改成如下写法
```javascript
<component :is="danymicComponents[$route.path.replace('/', '')]" />
<script setup>
import A from 'A.vue'
const danymicComponents = {
  A
}
</script>
```

想做的：不想声明额外的 danymicComponents 对象，考虑到 setup 中引入的组件，是挂载在 this.$setup 对象上，如果直接写成如下格式能识别就好了
```javascript
<component :is="$setup[$route.path.replace('/', '')]" />
<script setup>
import A from 'A.vue'
</script>
```

但是 `@vue/compiler-sfc` 编译的结果却是如下
```javascript
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return _createBlock(_ctx.$setup.danymicComponents[_ctx.$route.path.replace("/", "")])
}
```

想要的是  
```javascript
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return _createBlock($setup.danymicComponents[_ctx.$route.path.replace("/", "")])
}
```

现在就想做一个判断，如果代码中直接写了 $setup，就不再编译到 _ctx 上了

解决思路  
1. 通过 compiler 配置处理，看看 option 参数是否可以自定义部分编译逻辑
2. 通过 vite 插件处理源代码，借助 compiler ast 分析替换

自己在开发 vue3 项目时，有如下问题  
1. vue compiler 是否借助 ast 解析源码？是
2. 编译的大体流程是什么？descriptor，ast -> transform ast -> code generate

## 1 compiler 接入流程

vite 使用的是 `@vue/compiler-sfc` 来执行的编译，在 `@vitejs/plugin-vue` 中，调用编译的流程如下
```javascript
export default function vuePlugin(rawOptions: Options = {}): Plugin {
  return {
    buildStart() {
      options.compiler = options.compiler || resolveCompiler(options.root)
    },
    transform(code, id, opt) {
      return transformMain(
        code,
        filename,
        options,
        this,
        ssr,
        customElementFilter(filename)
      )
    }
  }
}
export function resolveCompiler(root: string): typeof _compiler {
  const compiler =
    tryRequire('vue/compiler-sfc', root) || tryRequire('vue/compiler-sfc') // 使用的就是 @vue/compiler-sfc
  return compiler
}

export async function transformMain(
  code: string,
  filename: string,
  options: ResolvedOptions,
  pluginContext: TransformPluginContext,
  ssr: boolean,
  asCustomElement: boolean
) {
  // 1 descriptor
  const { descriptor, errors } = createDescriptor(filename, code, options)
  // 2 script
  const { code: scriptCode, map } = await genScriptCode(
    descriptor,
    options,
    pluginContext,
    ssr
  )
  // 3 template
  let templateCode = ''
  let templateMap: RawSourceMap | undefined
  if (hasTemplateImport) {
    ;({ code: templateCode, map: templateMap } = await genTemplateCode(
      descriptor,
      options,
      pluginContext,
      ssr
    ))
  }
  // 4 styles
  const stylesCode = await genStyleCode(
    descriptor,
    pluginContext,
    asCustomElement,
    attachedProps
  )
  ...
}

export function createDescriptor(
  filename: string,
  source: string,
  { root, isProduction, sourceMap, compiler }: ResolvedOptions
): SFCParseResult {
  const { descriptor, errors } = compiler.parse(source, {
    filename,
    sourceMap
  })
  return { descriptor, errors }
}

async function genTemplateCode(
  descriptor: SFCDescriptor,
  options: ResolvedOptions,
  pluginContext: PluginContext,
  ssr: boolean
) {
  const template = descriptor.template!
  return transformTemplateInMain(
    template.content,
    descriptor,
    options,
    pluginContext,
    ssr
  )
}
export function transformTemplateInMain(
  code: string,
  descriptor: SFCDescriptor,
  options: ResolvedOptions,
  pluginContext: PluginContext,
  ssr: boolean
): SFCTemplateCompileResults {
  const result = compile(code, descriptor, options, pluginContext, ssr)
  return {
    ...result,
    code: result.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      '\n$1 _sfc_$2'
    )
  }
}
export function compile(
  code: string,
  descriptor: SFCDescriptor,
  options: ResolvedOptions,
  pluginContext: PluginContext,
  ssr: boolean
) {
  const filename = descriptor.filename
  const result = options.compiler.compileTemplate({
    ...resolveTemplateCompilerOptions(descriptor, options, ssr)!,
    source: code
  })
  return result
}
```

流程归纳  
1. 生成 descriptor ： compiler.parse 分析 source string
2. 生成 templateCode: compiler.compileTemplate(descriptor.template) 生成包含 code 的对象

## 2 compiler.parse

tryRequire('vue/compiler-sfc')，这里的 parse 也就是 `@vue/compiler-sfc` 里面的 parse，用于生成 descriptor 对象  
```javascript
import * as CompilerDOM from '@vue/compiler-dom'
export function parse(
  source: string,
  {
    ...
    compiler = CompilerDOM
  }: SFCParseOptions = {}
): SFCParseResult {
  const descriptor: SFCDescriptor = {...}
  const ast = compiler.parse(source, {...})
  ast.children.forEach(node => {...})
  const result = {
    descriptor,
    errors
  }
  return result
}
```

而 `@vue/compiler-dom` 里面调用的 parse 才是实际调用 `@vue/compiler/core` 里面的 baseParse 实现

```javascript
import {
  baseParse
} from '@vue/compiler-core'
export function parse(template: string, options: ParserOptions = {}): RootNode {
  return baseParse(template, extend({}, parserOptions, options))
}
```

baseParse 用于生成 ast，看下节分析

## 3 compiler.compileTemplate

这里作为 template 核心编译流程解析

1. `@vue/compiler-sfc` 初次调用 compileTemplate
```javascript
export function compileTemplate(
  options: SFCTemplateCompileOptions
): SFCTemplateCompileResults {
  return doCompileTemplate(options)
}
function doCompileTemplate({
  filename,
  id,
  scoped,
  slotted,
  inMap,
  source,
  ssr = false,
  ssrCssVars,
  isProd = false,
  compiler = ssr ? (CompilerSSR as TemplateCompiler) : CompilerDOM,
  compilerOptions = {},
  transformAssetUrls
}: SFCTemplateCompileOptions): SFCTemplateCompileResults {
  let { code, ast, preamble, map } = compiler.compile(source, {...})
  return { code, ast, preamble, source, errors, tips, map }
}
```
2. compileTemplate 调用 CompilerDOM.compile 生成 code, ast 等对象
3. CompilerDOM.compile 又调用 `@vue/compiler-core` baseCompile 方法实现
```javascript
export function baseCompile(
  template: string | RootNode,
  options: CompilerOptions = {}
): CodegenResult {
  const ast = isString(template) ? baseParse(template, options) : template
  const [nodeTransforms, directiveTransforms] =
    getBaseTransformPreset(prefixIdentifiers)

  transform(
    ast,
    extend({}, options, {
      prefixIdentifiers,
      nodeTransforms: [
        ...nodeTransforms,
        ...(options.nodeTransforms || []) // user transforms
      ],
      directiveTransforms: extend(
        {},
        directiveTransforms,
        options.directiveTransforms || {} // user transforms
      )
    })
  )

  return generate(
    ast,
    extend({}, options, {
      prefixIdentifiers
    })
  )
}
```

归纳一下 compiler 编译 template 流程  
1. 生成 ast：调用 `@vue/compiler-core` parse 生成 ast，这里使用正则匹配生成 vue 特定 ast 对象
2. 转换 ast 对象：处理 v-if, patchFlag 等 vue 语法
3. 再将 ast 生成 code：将转换后的 ast 生成目标 code

## 参考文章

[github doc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)
