# vue3渲染流程

time: 2022-01-21 10:56:50

## 1 渲染流程

vue3 渲染入口是 `createApp(rootComponent).mount('#id')`

### 1.1 全局 createApp 生成应用实例

在 runtime-dom 模块，export 2 个关键 api

runtime-dom index.ts 入口文件调用 createRenderer 生成 createApp  
```javascript
import {
  createRenderer
} from '@vue/runtime-core'
function ensureRenderer() {
  return renderer || (renderer = createRenderer<Node, Element>(rendererOptions))
}
// use explicit type casts here to avoid import() calls in rolled-up d.ts
export const render = ((...args) => {
  ensureRenderer().render(...args)
}) as RootRenderFunction<Element>

export const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args)
  const { mount } = app
  app.mount = (containerOrSelector: Element | ShadowRoot | string): any => {
    const container = normalizeContainer(containerOrSelector)
    if (!container) return
    const component = app._component
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML
    }
    // clear content before mounting
    container.innerHTML = ''
    const proxy = mount(container, false, container instanceof SVGElement)
    if (container instanceof Element) {
      container.removeAttribute('v-cloak')
      container.setAttribute('data-v-app', '')
    }
    return proxy
  }

  return app
}) as CreateAppFunction<Element>
```

归纳总结  
1. runtime-dom 作为统一入口，输出 createApp，render 2大核心 api，只需要传入组件配置对象即可
2. createRenderer 用户生成 createApp 工厂方法，createApp 生成实际 app

createRenderer 是调用 baseCreateRenderer，内部构造提供 createApp 和 render  
`createApp`：createRenderer 生成的工厂函数，生成实际 app 对象  
`render`：可以在 createApp 内部使用，也可以独立使用，用以渲染 vnode 对象到 domContainer，内部调用 patch 渲染，也就是 vue2 的 `vm._update` 方法，内部调用的 `Vue.prototype.__patch__`

上面写了 createApp 生成实际 app，这个只是用法，createApp 是怎么生成的呢？  
```javascript
// runtime-core apiCreateApp.ts
export function createAppAPI<HostElement>(
  render: RootRenderFunction,
  hydrate?: RootHydrateFunction
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent, rootProps = null) {
    const context = createAppContext()
    const installedPlugins = new Set()

    let isMounted = false

    const app: App = (context.app = {
      _uid: uid++,
      _component: rootComponent as ConcreteComponent,
      _props: rootProps,
      _container: null,
      _context: context,

      version,

      get config() {
        return context.config
      },

      set config(v) {
        if (__DEV__) {
          warn(
            `app.config cannot be replaced. Modify individual options instead.`
          )
        }
      },

      use(plugin: Plugin, ...options: any[]) {
        if (installedPlugins.has(plugin)) {
          __DEV__ && warn(`Plugin has already been applied to target app.`)
        } else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin)
          plugin.install(app, ...options)
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin)
          plugin(app, ...options)
        } else if (__DEV__) {
          warn(
            `A plugin must either be a function or an object with an "install" ` +
              `function.`
          )
        }
        return app
      },

      mixin(mixin: ComponentOptions) {
        if (__FEATURE_OPTIONS_API__) {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin)
            // global mixin with props/emits de-optimizes props/emits
            // normalization caching.
            if (mixin.props || mixin.emits) {
              context.deopt = true
            }
          } else if (__DEV__) {
            warn(
              'Mixin has already been applied to target app' +
                (mixin.name ? `: ${mixin.name}` : '')
            )
          }
        } else if (__DEV__) {
          warn('Mixins are only available in builds supporting Options API')
        }
        return app
      },

      component(name: string, component?: Component): any {
        if (__DEV__) {
          validateComponentName(name, context.config)
        }
        if (!component) {
          return context.components[name]
        }
        if (__DEV__ && context.components[name]) {
          warn(`Component "${name}" has already been registered in target app.`)
        }
        context.components[name] = component
        return app
      },

      directive(name: string, directive?: Directive) {
        if (__DEV__) {
          validateDirectiveName(name)
        }

        if (!directive) {
          return context.directives[name] as any
        }
        if (__DEV__ && context.directives[name]) {
          warn(`Directive "${name}" has already been registered in target app.`)
        }
        context.directives[name] = directive
        return app
      },

      mount(
        rootContainer: HostElement,
        isHydrate?: boolean,
        isSVG?: boolean
      ): any {
        if (!isMounted) {
          const vnode = createVNode(
            rootComponent as ConcreteComponent,
            rootProps
          )
          // store app context on the root VNode.
          // this will be set on the root instance on initial mount.
          vnode.appContext = context

          // HMR root reload
          if (__DEV__) {
            context.reload = () => {
              render(cloneVNode(vnode), rootContainer, isSVG)
            }
          }

          if (isHydrate && hydrate) {
            hydrate(vnode as VNode<Node, Element>, rootContainer as any)
          } else {
            render(vnode, rootContainer, isSVG)
          }
          isMounted = true
          app._container = rootContainer
          // for devtools and telemetry
          ;(rootContainer as any).__vue_app__ = app

          if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
            devtoolsInitApp(app, version)
          }

          return vnode.component!.proxy
        } else if (__DEV__) {
          warn(
            `App has already been mounted.\n` +
              `If you want to remount the same app, move your app creation logic ` +
              `into a factory function and create fresh app instances for each ` +
              `mount - e.g. \`const createMyApp = () => createApp(App)\``
          )
        }
      },

      unmount() {
        if (isMounted) {
          render(null, app._container)
          if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
            devtoolsUnmountApp(app)
          }
          delete app._container.__vue_app__
        } else if (__DEV__) {
          warn(`Cannot unmount an app that is not mounted.`)
        }
      },

      provide(key, value) {
        if (__DEV__ && (key as string | symbol) in context.provides) {
          warn(
            `App already provides property with key "${String(key)}". ` +
              `It will be overwritten with the new value.`
          )
        }
        // TypeScript doesn't allow symbols as index type
        // https://github.com/Microsoft/TypeScript/issues/24587
        context.provides[key as string] = value

        return app
      }
    })

    return app
  }
}
```

这个函数长了一点，不过却是我们 vue 实例对象的核心 api 实现，包含了 app.use、app.mount, 有必要展示出来

归纳总结  
1. 在 runtime-core 模块中调用 createAppAPI 生成 createApp 方法。 createApp 生成 app 应用实例对象
2. app.mount 使用根组件作为入口，createVNode 生成根 vnode ；在 renderer.ts 中声明的 render 方法是将 vnode tree 渲染为真实 dom tree
3. app._context 是全局实例配置描述对象，包含了全局组件、全局 mixin、全局指令、插件、全局配置、optionsCache weakmap 等
4. 生成 vnode 时机：是在 app.mount 方法执行时，才调用 createVNode 生成 vnode，然后 render 来渲染 dom

而 vue2 与vue3类似的流程是  
1. vue2 是通过 `new Vue` 生成实例 app 对象
2. app.$mount 使用的是 vm._update 来渲染真实 dom
3. 生成 vnode 时机：app.$mount 使用的是 mountComponent 来渲染，内部是通过 `vm._update(vm._render(), hydrating)`，通过 vm._render 生成 vnode，通过 vm._update 来渲染 vnode
4. 前期准备，vue2 是通过执行 mixin 来准备 vue.prototype 基本结构，vue3 是直接暴露 createApp，内部 component, vnode 基本结构是代码就写好了的

### 1.2 app.mount 渲染入口，先生成 vnode tree

在生成 app 实例之后，开发者手动调用 app.mount 挂载渲染，其内部依次调用 `createVNode`, `render` 方法  
createVNode 接受传入 createApp 的组件参数，这个组件参数是什么呢？

#### 1.2.1 defineComponent 生成组件对象

我们知道根组件是作为 createApp 的参数，这里有几个疑问  
1. createApp 可以直接接受一个 .vue 组件对象，那么 .vue 编译结果是什么呢？
2. createApp 可以接受配置 render 不？

App.vue 编译部分结果  
```javascript
import LeftMenu from "/src/components/LeftMenu.vue";
import {createVNode as _createVNode, createElementVNode as _createElementVNode, resolveComponent as _resolveComponent, openBlock as _openBlock, createElementBlock as _createElementBlock, pushScopeId as _pushScopeId, popScopeId as _popScopeId} from "/node_modules/.vite/vue.js?v=221ddc95";
import _export_sfc from "/@id/plugin-vue:export-helper";

const _sfc_main = /* @__PURE__ */
_defineComponent({
    setup(__props, {expose}) {
        expose();
        const __returned__ = {
            LeftMenu
        };
        Object.defineProperty(__returned__, "__isScriptSetup", {
            enumerable: false,
            value: true
        });
        return __returned__;
    }
});

function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_view = _resolveComponent("router-view");
  return _openBlock(),
  _createElementBlock("div", _hoisted_1, [_createElementVNode("div", _hoisted_2, [_createVNode($setup["LeftMenu"])]), _createElementVNode("div", _hoisted_3, [_createVNode(_component_router_view)])]);
}
export default /* @__PURE__ */
_export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7ba5bd90"], ["__file", "/Users/80245690/Desktop/project/dataspherestudio/web/packages/taskAnalysis/src/App.vue"]]);
```

编译结果分析  
1. esm function return 可以返回多个值？第一个参数不返回，只返回最后一个
2. 组件使用 `_export_sfc` 包裹返回，第一个参数是使用 `_defineComponent` 生成的对象，组件 setup 和配置式组件最终都会编译成 _defineComponent 函数包裹的对象
3. tempalte 最终编译为使用 `_createElementBlock`、`_createElementVNode`、`_createVNode` 函数组成的数组

_export_sfc 函数执行返回的是什么，通过编译代码结果反推 `var EXPORT_HELPER_ID = "plugin-vue:export-helper";` + `import _export_sfc from '${EXPORT_HELPER_ID}'`，
发现 _export_sfc 就是 vite 的 `plugin-vue` 中 `helper.ts` 导出的函数，来看看代码实现  
```javascript
export default (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
}
```
它就是一个包裹器，将 props 添加到对应的组件上而已，也就是将 render 属性添加到 _sfc_main 对象上。实际还是看看 `_defineComponent` 返回的是什么  
defineComponent 是 vue 提供的一个全局 api  
```javascript
export function defineComponent(options: unknown) {
  return isFunction(options) ? { setup: options, name: options.name } : options
}
```
defineComponent 内部是直接返回的组件配置对象，但是它实现了 ts 的函数多重重载，控制了返回值的类型，用于手动编写渲染函数、tsx、ide 工具的支持

#### 1.2.2 createVNode 生成 vnode 对象

现在已经知道了，传入 createVNode 其实就是普通的 object 对象，每个组件内部有自己的 render 方法；而 createVNode 是调用的 createBaseVNode 创建 vnode 对象
继续看看 createBaseVNode 实现  
```javascript
function createBaseVNode(
  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag = 0,
  dynamicProps: string[] | null = null,
  shapeFlag = type === Fragment ? 0 : ShapeFlags.ELEMENT,
  isBlockNode = false,
  needFullChildrenNormalization = false
) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
  } as VNode
  return vnode
}
```
总结归纳  
1. 实际 vnode 对象也就是一个普通的 plain object
2. vnode 对象内部保存了 appContext、children 等上下文关系

### 1.3 render 将 vnode tree 渲染为真实 dom

根据 createVNode 生成的 vnode 作为入口，调用 mountComponent 来渲染组件

render 函数
```javascript
const render: RootRenderFunction = (vnode, container, isSVG) => {
  if (vnode == null) {
    if (container._vnode) {
      unmount(container._vnode, null, null, true)
    }
  } else {
    patch(container._vnode || null, vnode, container, null, null, null, isSVG)
  }
  flushPostFlushCbs()
  container._vnode = vnode
}
```

内部通过 patch 来渲染真实 dom，和 vue2 vm._update 内部使用的 `vm.__patch__` 一样
不过内部 patch 实现有所差异，vue3 内部判断相对 vue2 多一些，因为 vue3 支持 fragment 渲染

vue3 patch 实现
```javascript
const patch: PatchFn = (
  n1,
  n2,
  container
) => {
  const { type, ref, shapeFlag } = n2
  switch (type) {
    case Text:
      processText(n1, n2, container, anchor)
      break
    case Comment:
      processCommentNode(n1, n2, container, anchor)
      break
    case Fragment:
      processFragment(...)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(...)
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        processComponent(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        )
      } else if (shapeFlag & ShapeFlags.TELEPORT) {
        ;(type as typeof TeleportImpl).process(
          n1 as TeleportVNode,
          n2 as TeleportVNode,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
          internals
        )
      } else if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
        ;(type as typeof SuspenseImpl).process(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
          internals
        )
      }
  }

  // set ref
  if (ref != null && parentComponent) {
    setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2)
  }
}
```

总结归纳 patch  
1. patch 做为 render 直接调用的方法，用于处理 vnode
2. patch 内部对 vnode 类型做判断处理针对渲染，支持 text, comment, fragment, element, component, teleport, suspense 等类型

processComponent 内部实现是调用 mountComponent 初次渲染或 updateComponent 做更新渲染

#### 1.3.1 mountComponent 渲染组件

在 render 的 patch 函数中，是通过对 vnode 的类型来判断渲染，如果是组件，则会执行 mountComponent；而 mountComponent 才会涉及到组件的实例化流程

mountComponent  
```javascript
const mountComponent: MountComponentFn = (
  initialVNode,
  container,
  anchor,
  parentComponent,
  parentSuspense,
  isSVG,
  optimized
) => {
  // 生成组件基本结构数据，object
  const instance: ComponentInternalInstance = (initialVNode.component = createComponentInstance(
    initialVNode,
    parentComponent,
    parentSuspense
  ))
  // 封装 setup 函数需要的参数对象，执行 setup，生成响应式数据，将 setup 返回值绑定到组件实例 instance 上
  setupComponent(instance)
  setupRenderEffect(
    instance,
    initialVNode,
    container,
    anchor,
    parentSuspense,
    isSVG,
    optimized
  )
}
```

#### 1.3.2 vue 组件实例化流程

mountComponent 内部三个方法调用就执行了 vue 组件实例化流程，其方法说明  
1. createComponentInstance 生成组件实例对象必要参数：在 runtime-core 中定义了 component.ts 组件模块，内部定义了 createComponentInstance 方法，它只返回了实例对象需要的必要参数
2. setupComponent 方法将组件中定义的 props、slot 添加到 instance 对象上，并且调用 setupStatefulComponent 方法处理 setup 配置函数，获取 setup 执行结果。
在末尾有执行 finishComponentSetup 函数，内部有兼容 vue2 的配置型组件，调用 applyOptions 处理，包含了 beforeCreate, created, data, methods, watch, computed 等配置处理，内部也调用了 vue3 的响应式 api watch, computed 等做响应处理，同时也兼容了 vue2 的 beforeDestroy 等废弃 api
3. setupRenderEffect 作为 mountComponent 的最后渲染函数

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

applyOptions  
```javascript
export function applyOptions(instance: ComponentInternalInstance) {
  const options = resolveMergedOptions(instance)
  const publicThis = instance.proxy! as any
  const ctx = instance.ctx
  shouldCacheAccess = false
  if (options.beforeCreate) {
    callHook(options.beforeCreate, instance, LifecycleHooks.BEFORE_CREATE)
  }

  const {...} = options

  const checkDuplicateProperties = __DEV__ ? createDuplicateChecker() : null
  if (injectOptions) {}
  if (methods) {}
  if (dataOptions) {}
  shouldCacheAccess = true
  if (computedOptions) {}
  if (watchOptions) {}
  if (provideOptions) {}
  if (created) {
    callHook(created, instance, LifecycleHooks.CREATED)
  }

  function registerLifecycleHook(
    register: Function,
    hook?: Function | Function[]
  ) {
    if (isArray(hook)) {
      hook.forEach(_hook => register(_hook.bind(publicThis)))
    } else if (hook) {
      register((hook as Function).bind(publicThis))
    }
  }

  registerLifecycleHook(onBeforeMount, beforeMount)
  registerLifecycleHook(onMounted, mounted)
  registerLifecycleHook(onBeforeUpdate, beforeUpdate)
  registerLifecycleHook(onUpdated, updated)
  registerLifecycleHook(onActivated, activated)
  registerLifecycleHook(onDeactivated, deactivated)
  registerLifecycleHook(onErrorCaptured, errorCaptured)
  registerLifecycleHook(onRenderTracked, renderTracked)
  registerLifecycleHook(onRenderTriggered, renderTriggered)
  registerLifecycleHook(onBeforeUnmount, beforeUnmount)
  registerLifecycleHook(onUnmounted, unmounted)
  registerLifecycleHook(onServerPrefetch, serverPrefetch)

  if (__COMPAT__) {
    if (
      beforeDestroy &&
      softAssertCompatEnabled(DeprecationTypes.OPTIONS_BEFORE_DESTROY, instance)
    ) {
      registerLifecycleHook(onBeforeUnmount, beforeDestroy)
    }
    if (
      destroyed &&
      softAssertCompatEnabled(DeprecationTypes.OPTIONS_DESTROYED, instance)
    ) {
      registerLifecycleHook(onUnmounted, destroyed)
    }
  }

  if (isArray(expose)) {}

  // options that are handled when creating the instance but also need to be
  // applied from mixins
  if (render && instance.render === NOOP) {
    instance.render = render as InternalRenderFunction
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs
  }

  // asset options.
  if (components) instance.components = components as any
  if (directives) instance.directives = directives
  if (
    __COMPAT__ &&
    filters &&
    isCompatEnabled(DeprecationTypes.FILTERS, instance)
  ) {
    instance.filters = filters
  }
}
```

核心 setupRenderEffect
```javascript
const setupRenderEffect: SetupRenderEffectFn = (
    instance,
    initialVNode,
    container,
    anchor,
    parentSuspense,
    isSVG,
    optimized
  ) => {
    // create reactive effect for rendering
    instance.update = effect(function componentEffect() {
      if (!instance.isMounted) {
        let vnodeHook: VNodeHook | null | undefined
        const { el, props } = initialVNode
        const { bm, m, parent } = instance

        // beforeMount hook
        if (bm) {
          invokeArrayFns(bm)
        }
        // onVnodeBeforeMount
        if ((vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode)
        }
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
        initialVNode.el = subTree.el
        // mounted hook
        if (m) {
          queuePostRenderEffect(m, parentSuspense)
        }
        // onVnodeMounted
        if ((vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode
          queuePostRenderEffect(() => {
            invokeVNodeHook(vnodeHook!, parent, scopedInitialVNode)
          }, parentSuspense)
        }
        instance.isMounted = true
        // #2458: deference mount-only object parameters to prevent memleaks
        initialVNode = container = anchor = null as any
      } else {
        // updateComponent
        // This is triggered by mutation of component's own state (next: null)
        // OR parent calling processComponent (next: VNode)
        let { next, bu, u, parent, vnode } = instance
        let originNext = next
        let vnodeHook: VNodeHook | null | undefined
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next, optimized)
        } else {
          next = vnode
        }

        // beforeUpdate hook
        if (bu) {
          invokeArrayFns(bu)
        }
        // onVnodeBeforeUpdate
        if ((vnodeHook = next.props && next.props.onVnodeBeforeUpdate)) {
          invokeVNodeHook(vnodeHook, parent, next, vnode)
        }
        const nextTree = renderComponentRoot(instance)
        const prevTree = instance.subTree
        instance.subTree = nextTree

        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el!)!,
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          isSVG
        )
        
        next.el = nextTree.el
        if (originNext === null) {
          // self-triggered update. In case of HOC, update parent component
          // vnode el. HOC is indicated by parent instance's subTree pointing
          // to child component's vnode
          updateHOCHostEl(instance, nextTree.el)
        }
        // updated hook
        if (u) {
          queuePostRenderEffect(u, parentSuspense)
        }
        // onVnodeUpdated
        if ((vnodeHook = next.props && next.props.onVnodeUpdated)) {
          queuePostRenderEffect(() => {
            invokeVNodeHook(vnodeHook!, parent, next!, vnode)
          }, parentSuspense)
        }
      }
    }, __DEV__ ? createDevEffectOptions(instance) : prodEffectOptions)
  }
```

归纳总结  
1. setupRenderEffect 作为 effect 函数调用者，表示响应式系统在组件 mount 的时候才将渲染流程函数作为 activeEffect
2. 初次渲染、更新都是封装在 effect 函数中的
3. 与 vue2 主动 callhook 不同，vue3 是直接执行生命周期函数，比如 `invokeArrayFns(bm)`，其内部调用了4个生成周期函数：bm as beforeMount, m as mounted, bu as beforeUpdate, u as updated
4. 组件的 renderEffect 中，定义了 instance.update 方法，方便组件更新时直接调用
5. update 方法又使用了 renderComponentRoot 执行 render 方法生成组件内部的子 vnodeTree，然后调用 patch 渲染这颗 vnodeTree，形成递归

生命周期总结  
1. 在组件渲染 effect 中，也就是 setupRenderEffect，有4种生命周期：bm as beforeMount, m as mounted, bu as beforeUpdate, u as updated
2. 在组件 unmount 中会执行2种生命周期：beforeUnmount, unmounted
3. 在 setupComponent 嵌套调用的 applyOptions 中调用了2种生命周期：beforeCreate, created

### 1.4 vue2 diff vs vue3 diff

继续看看 setupRenderEffect 组件更新，如果已经 mounted，那么会走 patch(vnode1, vnode2) + updateComponent 做 diff 渲染

需要解决的点  
1. patch 对比优化时，时哪个标识可以跳过对比渲染 - patchFlag 标识，在 compiler 编译 template 为 _sfc_render 时会为 `_createElementBlock` 等方法添加 patchFlag 值
2. 组件渲染 diff 算法：双端对比保留原始节点，剩余节点获取最长公共子串，其余节点再 mount or unmount

updateComponent
```javascript
const updateComponent = (n1: VNode, n2: VNode, optimized: boolean) => {
    const instance = (n2.component = n1.component)!
    if (shouldUpdateComponent(n1, n2, optimized)) {
      instance.update()
    } else {
      // no update needed. just copy over properties
      n2.component = n1.component
      n2.el = n1.el
      instance.vnode = n2
    }
  }
```

说明  
1. `shouldUpdateComponent` 会使用 vnode.patchFlag 判断是否需要更新
2. `instance.update()` 是再次调用了 setupRenderEffect 方法去更新组件

patchKeyedChildren diff 核心算法  
```javascript

```

### 1.5 vue 渲染流程总结

1. createApp 生成 app 应用实例
2. app.mount 调用 createVnode, render 方法
3. createVnode 生成 vnode 对象
4. render 渲染 vnode，内部调用 patch 方法
5. `patch` 判断为组件时，调用 mountComponent 开始渲染
6. mountComponent 内部依次调用 `createComponentInstance, setupComponent, setupRenderEffect` 生成组件实例和渲染
7. 组件 **setupRenderEffect.update** 方法内部，在 beforeMount 和 mounted 生命周期之间，使用了 renderComponentRoot 执行 **render** 方法生成组件内部的子 vnodeTree，然后调用 **patch** 渲染这颗 vnodeTree，形成递归

## 2 vue3 vs vue2

1. vue3 有应用实例，所有插件、mixin、全局配置是放在应用实例上的
2. 组件实例区别：vnode.component, vnode.appContext.components
3. 全局属性挂载：vue2.prototype, vue3.config.gloablProperties，可以通过 vnode.appContext 拿到应用环境对象
4. 独立 router：vue2 每个组件可以挂载自己独立的 router 对象，而 vue3 想要实现类似的功能，比如内部实现另一个 app 对象挂载 router

接下来要做的  
1. 对比 vue2, vue3 diff，文章 + 源码
2. 熟悉 vue2, vue3 组件渲染流程
3. 熟悉 vue3 相关 api ，并查阅核心实现
