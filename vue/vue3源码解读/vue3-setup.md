# 【vue3】为什么我们能直接使用定义在 setup 中的数据？

time: 2022-02-24 14:33:11  
author: heyunjiang

setup 作为 vue3 的核心功能，内部定义的响应式数据是如何被组件使用的呢，一起来看看 setup 的被执行流程

## 1 setup 编译结果

先来看看 `<script setup>` 组件的编译结果(简单可以使用 vite 本地开发，通过浏览器查看加载的 vue 文件即可)

源代码
```javascript
<script lang="ts" setup>
import { ref } from 'vue'
const filterString = ref('')
</script>

<template>
  <el-input v-model="filterString" />
</template>
```
编译结果
```javascript
import { ref } from "/dist2/node_modules/.vite/vue.js?v=ede3a932";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  setup(__props, { expose }) {
    expose();
    const filterString = ref("");
    const __returned__ = { filterString };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { resolveComponent as _resolveComponent, openBlock as _openBlock, createBlock as _createBlock } from "/dist2/node_modules/.vite/vue.js?v=ede3a932";
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_el_input = _resolveComponent("el-input");
  return _openBlock(), _createBlock(_component_el_input, {
    modelValue: $setup.filterString,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.filterString = $event)
  }, null, 8, ["modelValue"]);
}
import _export_sfc from "/dist2/@id/plugin-vue:export-helper";
export default /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/Users/80245690/Desktop/project/dataspherestudio/web/packages/taskAnalysis/src/App.vue"]]);
```
在 vue3渲染流程 文章中说明了 _defineComponent, _export_sfc 的具体说明。这里简要总结  
1. _defineComponent 传入什么就返回什么，_sfc_main 就是一个 plain object {}
2. _export_sfc 是将参数赋值给 sfc 组件对象，也就是说将 render 函数添加到了 _sfc_main 对象上，最终返回的还是 _sfc_main 对象

总结归纳：  
1. template 编译为 _sfc_render 函数，也就是 component.render 函数
2. setup 编译为组件的 setup 函数属性，其内部定义的变量会被封装为返回对象属性

## 2 setup 函数被调用流程

在 app.mount 时，会调用组件的渲染流程，其中包含了 createVnode, render，其中 render 是直接调用 patch 来处理 vnode 的渲染；  
在 patch 内部，如果判断为组件，则会走 mountComponent，内部包含了 createComponentInstance、setupComponent、setupRenderEffect;  
> vue3 渲染流程可以查看另一篇文章
**而 setup 则是在 setupComponent 时调用**

setupComponent
```javascript
export function setupComponent(
  instance: ComponentInternalInstance,
  isSSR = false
) {
  isInSSRComponentSetup = isSSR

  const { props, children } = instance.vnode
  const isStateful = isStatefulComponent(instance)
  initProps(instance, props, isStateful, isSSR)
  initSlots(instance, children)

  const setupResult = isStateful
    ? setupStatefulComponent(instance, isSSR)
    : undefined
  isInSSRComponentSetup = false
  return setupResult
}
```

可以看到 setupComponent 主要是处理组件的 props, slot children, setup 函数处理
setupStatefulComponent 调用 setup
```javascript
function setupStatefulComponent(
  instance: ComponentInternalInstance,
  isSSR: boolean
) {
  const Component = instance.type as ComponentOptions
  instance.accessCache = Object.create(null)
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers))
  const { setup } = Component
  if (setup) {
    const setupContext = (instance.setupContext =
      setup.length > 1 ? createSetupContext(instance) : null)

    setCurrentInstance(instance)
    pauseTracking()
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      ErrorCodes.SETUP_FUNCTION,
      [__DEV__ ? shallowReadonly(instance.props) : instance.props, setupContext]
    )
    resetTracking()
    unsetCurrentInstance()

    if (isPromise(setupResult)) {
    } else {
      handleSetupResult(instance, setupResult, isSSR)
    }
  } else {
    finishComponentSetup(instance, isSSR)
  }
}
```

在 setupComponent.setupStatefulComponent 中调用了 setup 函数，返回的对象被 handleSetupResult 处理
```javascript
export function handleSetupResult(
  instance: ComponentInternalInstance,
  setupResult: unknown,
  isSSR: boolean
) {
  if (isFunction(setupResult)) {
    if (__SSR__ && (instance.type as ComponentOptions).__ssrInlineRender) {
      instance.ssrRender = setupResult
    } else {
      instance.render = setupResult as InternalRenderFunction
    }
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance, isSSR)
}
```

总结归纳：  
1. setup 是在组件生成 vnode 之后，在 patch.mountComponent 生成组件实例时才会调用
2. 如果 setup 返回了函数，则会作为组件的 render 方法。说明 render 会在之后被调用，也就是说 vnode tree 是在组件一边生成 vnode，一边渲染为真实 dom 流程中逐渐完善的
3. setup 返回的对象属性值，是保存在实例的 setupState 属性上的，即 `instance.setupState`

## 3 setupState 是什么时候被调用的？

通常我们定义在 setup 中的数据，比如 `const filterString = ref('')` 定义的 ref 变量，是直接在 template 中使用 `v-model` 读取；而 template 又会最终编译为组件配置的 render 函数。  
那么 setupState 通常是在 render 函数中的 createElement 节点去使用这些变量值。那么 render 函数又是啥时候被调用的？  
初步猜测，是在实际渲染 vnode 时，也就是在 setupRenderEffect 中调用  
setupRenderEffect.componentUpdateFn 中一段代码  
```javascript
const subTree = (instance.subTree = renderComponentRoot(instance))
patch(
  null,
  subTree,
  container,
  anchor,
  instance,
  parentSuspense,
  isSVG
)
```
在 renderComponentRoot 中，执行了 render  
```javascript
result = normalizeVNode(
  render!.call(
    proxyToUse,
    proxyToUse!,
    renderCache,
    props,
    setupState,
    data,
    ctx
  )
)
```

在 render 中传入了 props, setupState, data, ctx 对象，render 咋用这些数据的呢？  
还是回到编译结果上来看  
```javascript
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_el_input = _resolveComponent("el-input");
  return _openBlock(), _createBlock(_component_el_input, {
    modelValue: $setup.filterString,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.filterString = $event)
  }, null, 8, ["modelValue"]);
}
```
可以看到，编译结果直接使用了 $setup 对象，也就是 instance.setupState 对象。

全文总结  
1. `<script setup>` 最终编译为组件配置属性 setup 函数
2. setup 函数在组件生成实例之后，调用 `setupComponent` 初始化时执行的，函数返回值赋予了 instance.setupState
3. setupState 是作为组件 render 的第四个参数，而 template 编译为 render 函数时，指定定义了第四个参数为 $setup，整体约定实现了 setup 返回值的使用

思考：我们代码中是否可以直接使用 $setup 对象  
答：实例上只存在 setupState，$setup 只是函数定义的参数名；
如果直接使用 setupState，其实访问的是 _ctx.setupState，也是不行的；
我们使用 getCurrentInstance 呢？也拿不到组件属性，为什么？
