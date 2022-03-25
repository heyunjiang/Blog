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
2. 通过 vite 插件处理源代码，手动 ast 分析替换

## 1 compiler 基础知识

vite 使用的是 `@vue/compiler-sfc` 来执行的编译，在 `@vitejs/plugin-vue` 中，调用编译的流程如下
```javascript
export default function vuePlugin(rawOptions: Options = {}): Plugin {
  return {
    buildStart() {
      options.compiler = options.compiler || resolveCompiler(options.root)
    },
    transform(code, id, opt) {
      const { filename, query } = parseVueRequest(id)
      const descriptor = query.src
        ? getSrcDescriptor(filename, query)!
        : getDescriptor(filename, options)!

      if (query.type === 'template') {
        return transformTemplateAsModule(code, descriptor, options, this, ssr)
      }
    }
  }
}
export function resolveCompiler(root: string): typeof _compiler {
  // resolve from project root first, then fallback to peer dep (if any)
  const compiler =
    tryRequire('vue/compiler-sfc', root) || tryRequire('vue/compiler-sfc') // 使用的就是 @vue/compiler-sfc
  return compiler
}
export async function transformTemplateAsModule(
  code: string,
  descriptor: SFCDescriptor,
  options: ResolvedOptions,
  pluginContext: TransformPluginContext,
  ssr: boolean
) {
  const result = compile(code, descriptor, options, pluginContext, ssr)
  return {
    code: result.code,
    map: result.map
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
export function resolveTemplateCompilerOptions(
  descriptor: SFCDescriptor,
  options: ResolvedOptions,
  ssr: boolean
) {
  return {
    ...options.template,
    id,
    filename,
    scoped: hasScoped,
    slotted: descriptor.slotted,
    isProd: options.isProduction,
    inMap: block.src ? undefined : block.map,
    ssr,
    ssrCssVars: cssVars,
    transformAssetUrls,
    preprocessLang: block.lang,
    preprocessOptions,
    compilerOptions: {
      ...options.template?.compilerOptions,
      scopeId: hasScoped ? `data-v-${id}` : undefined,
      bindingMetadata: resolvedScript ? resolvedScript.bindings : undefined,
      expressionPlugins,
      sourceMap: options.sourceMap
    }
  }
}
```

归纳分析  
1. vuePlugin 使用了 `@vue/compiler-sfc` 作为编译工具 compiler
2. 传递给 vuePlugin 的参数 option 会透传给 compiler.compileTemplate 方法，该方法还接受了其他 vite 其他中间件处理后的源代码

现在开始分析 compiler.compileTemplate 的 option 配置

## 2 todo

目前 vue3 开发成为主流，它的生态比较完善：框架实现、编码工具支持、路由、状态管理、构建工具。  
怎么提高自己的职业能力呢？  
1. 精通 vue 系列：生态源码学习、优化实现方案、开源 pr 贡献
2. 前端能力：降本增效？前端生态实现，构建工具、错误监控及告警、mock、nodejs 等

思考在学习了 vue3 组件渲染流程、响应式原理、编译原理、vite 原理之后  
1. 自己在回答这些问题时，能对答如流吗
2. 结合实际组件思考，一个框架做了什么事情：约定代码编码格式、配套编码工具
3. 还有哪些事情可以完善、优化的

## 参考文章

[github doc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)
