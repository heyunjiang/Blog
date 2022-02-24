# setup

time: 2022-02-24 14:33:11  
author: heyunjiang

这里记录 setup 使用时遇到的问题

## 1 setup 编译结果

普通 script 配置型编译结果
```javascript
const __default__ = {
    computed: {
        xxx() {
            return this.$store.state.xxx;
        }
    },
    mounted() {
        this.$store.dispatch("xxx");
        this.$store.dispatch("xxx");
    }
};
```

setup 编译结果
```javascript
import {ref} from "/node_modules/.vite/vue.js?v=221ddc95";
import {QuestionFilled} from "/node_modules/.vite/@element-plus_icons-vue.js?v=221ddc95";
import TaskSummary from "/src/views/tableList/TaskSummary.vue";
import TaskFailTable from "/src/views/tableList/Tables/TaskFailTable.vue?t=1645669030560";
import projectSummaryRepository from "/src/composables/projectSummaryRepository.ts?t=1645669030560";
const _sfc_main = /* @__PURE__ */
_defineComponent({
    ...__default__,
    setup(__props, {expose}) {
        expose();
        const activeName = ref("taskFail");
        const taskTypesDesc = {};
        const {summaryData} = projectSummaryRepository();
        const __returned__ = {
            activeName,
            taskTypesDesc,
            summaryData,
            QuestionFilled,
            TaskSummary,
            TaskFailTable
        };
        Object.defineProperty(__returned__, "__isScriptSetup", {
            enumerable: false,
            value: true
        });
        return __returned__;
    }
});
```

## 2 setup 源码执行流程

在 app.mount 时，会调用组件的渲染流程，其中包含了 createVnode, render，其中 render 是直接调用 patch 来处理 vnode 的渲染；  
在 patch 内部，如果判断为组件，则会走 mountComponent，内部包含了 createComponentInstance、setupComponent、setupRenderEffect;  
而 setup 则是在 setupComponent 时调用

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
3. setup 返回的对象属性值，是保存在实例的 setupState 上的

## 3 setupState 是什么时候被调用的？

一般指的是在 render 函数中的节点去使用这些变量值。那么 render 函数又是啥时候被调用的？  
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
  const _component_router_view = _resolveComponent("router-view");
  return _openBlock(),
  _createElementBlock("div", _hoisted_1, [_createElementVNode("div", _hoisted_2, [_createVNode($setup["LeftMenu"])]), _createElementVNode("div", _hoisted_3, [_createVNode(_component_router_view)])]);
}
```

可以看到，编译结果直接使用了 $setup 对象。

思考：我们代码中是否可以直接使用 $setup 对象  
答：实例上只存在 setupState，$setup 只是函数定义的参数名；
如果直接使用 setupState，其实访问的是 _ctx.setupState，也是不行的；
我们使用 getCurrentInstance 呢？也拿不到组件属性，为什么？
