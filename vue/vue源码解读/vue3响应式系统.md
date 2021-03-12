# vue3 响应式系统

time: 2021.3.9  
author: heyunjiang

## 背景

归纳 vue3 响应式原理，同 vue2 的差异。  
目前已知：vue3 使用 proxy 代替 vue2 的 defineProperty，但是 vue2 的 dep + watcher 对象是被什么代替了呢？  
并且，reactive 和 ref 是如何通知更新组件的，收集当前组件 vm 时机

## 1 渲染流程

### 1.1 全局 createApp

在 runtime-dom 模块，export 2 个关键 api

```javascript
// runtime-dom index.ts 入口文件
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

上面写了 createApp 生成实际 app，这个只是用法，是怎么生成的呢？  
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
1. createApp 生成 app 实例对象，通过函数返回的 plain object，保证每个 app 是唯一的
2. app.mount 使用的 render 来渲染真实 dom
3. app._context 是 vue 组件配置描述对象，包含了 app, config, mixin, components, directives, provides 属性
4. 生成 vnode 时机：是在 app.mount 方法执行时，才调用 createVNode 生成 vnode，然后 render 来渲染 dom

与 vue2 类似的是  
1. vue2 是通过 `new Vue` 生成实例 app 对象
2. app.$mount 使用的是 vm._update 来渲染真实 dom
3. 生成 vnode 时机：app.$mount 使用的是 mountComponent 来渲染，内部是通过 `vm._update(vm._render(), hydrating)`，通过 vm._render 生成 vnode，通过 vm._update 来渲染 vnode
4. 前期准备，vue2 是通过执行 mixin 来准备 vue.prototype 基本结构，vue3 是直接暴露 createApp，内部 component, vnode 基本结构是代码就写好了的

### 1.2 render 渲染

根据 createApp 生成的 vnode 作为入口，调用 mountComponent 来渲染组件

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

```javascript
// vue3 patch 实现
```

接下来学习点  
1. vue3 生命周期
2. vue3 diff 实现

### 1.3 mountComponent 渲染组件

在 render 的 patch 函数中，是通过对 vnode 的类型来判断渲染，如果是组件，则会执行 mountComponent

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
3. 与 vue2 主动 callhook 不同，vue3 是直接执行生命周期函数，比如 `invokeArrayFns(bm)`

### 1.4 vue2 diff vs vue3 diff

todo

## 2 响应式原理

```javascript
// demo
const count = ref(0)
const obj = reactive({
  count
})

obj.count++
obj.count // -> 1
count.value // -> 1
```

vue3 响应式系统入口是 ref + reactive，我们在 template, computed, methods 等组件地方使用到相关数据时，系统是如何将数据绑定到当前系统的呢？又是如何通过 proxy 通知更新的呢？  

### 2.1 reactive

先看 proxy 入口代码  
```javascript
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
export function reactive(target: object) {
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers
  )
}
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers // array, object 使用 baseHandlers, WeakSet, Map, WeakMap 使用 collectionHandlers，Set
  )
  return proxy
}
```

来看核心的 get, set  
```javascript
const get = /*#__PURE__*/ createGetter()
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    const targetIsArray = isArray(target)
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
    const res = Reflect.get(target, key, receiver)
    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}
const set = /*#__PURE__*/ createSetter()

function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    // don't trigger if target is something up in the prototype chain of original
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}
```

归纳总结：  
1. reactive 支持的数据类型 Array, Object, Set, WeakSet, Map, WeakMap
2. reactive 在内部是通过 track 收集依赖，trigger 触发更新，并没有涉及到具体的组件
3. 在访问属性时，才去 track

### 2.2 ref

这里看看 ref 对象定义

```javascript
class RefImpl<T> {
  private _value: T

  public readonly __v_isRef = true

  constructor(private _rawValue: T, public readonly _shallow = false) {
    this._value = _shallow ? _rawValue : convert(_rawValue)
  }

  get value() {
    track(toRaw(this), TrackOpTypes.GET, 'value')
    return this._value
  }

  set value(newVal) {
    if (hasChanged(toRaw(newVal), this._rawValue)) {
      this._rawValue = newVal
      this._value = this._shallow ? newVal : convert(newVal)
      trigger(toRaw(this), TriggerOpTypes.SET, 'value', newVal)
    }
  }
}
```

归纳总结  
1. 也是通过 track 收集依赖，trigger 触发更新
2. 在访问属性时，才去 track

### 2.3 track
 
```javascript
// track 源码
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}
```

track 源码解读  
1. 通过唯一对象 targetMap 来保存所有的 depsMap 对象
2. 每个属性关联一个 dep 对象
3. 每个 dep 对象关联了一个 activeEffect，这里可以看出 activeEffect 是唯一的

track 源码问题  
1. activeEffect是什么东西

### 2.4 trigger

```javascript
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target)
  const effects = new Set<ReactiveEffect>()
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect !== activeEffect || effect.allowRecurse) {
          effects.add(effect)
        }
      })
    }
  }
  // schedule runs for SET | ADD | DELETE
  // 将 dep 对象上的 activeEffect 添加到 effects 对象上
  if (key !== void 0) {
    add(depsMap.get(key))
  }
  // also run for iteration key on ADD | DELETE | Map.SET
  switch (type) {
    case TriggerOpTypes.SET:
      if (isMap(target)) {
        add(depsMap.get(ITERATE_KEY))
      }
      break
  }

  const run = (effect: ReactiveEffect) => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  }

  effects.forEach(run)
}
```

归纳总结：  
1. trigger 是通过获取对象属性的 dep 对象上绑定的 activeEffect 来触发更新

### 2.5 activeEffect

上面我们看到，通过 track 收集 activeEffect 对象，也只是通过 `dep.add(activeEffect)` 添加到了 dep 对象上  
在 trigger 中通过 `effect.options.scheduler(effect)` 或 `effect()` 来执行 activeEffect  
那么，activeEffect 是什么，又是如何通知组件更新的呢？

```javascript
let activeEffect: ReactiveEffect | undefined
export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  if (isEffect(fn)) {
    fn = fn.raw
  }
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    effect()
  }
  return effect
}
function createReactiveEffect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  const effect = function reactiveEffect(): unknown {
    if (!effect.active) {
      return options.scheduler ? undefined : fn()
    }
    if (!effectStack.includes(effect)) {
      cleanup(effect)
      try {
        enableTracking()
        effectStack.push(effect)
        activeEffect = effect
        return fn()
      } finally {
        effectStack.pop()
        resetTracking()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect
  effect.id = uid++
  effect.allowRecurse = !!options.allowRecurse
  effect._isEffect = true
  effect.active = true
  effect.raw = fn
  effect.deps = []
  effect.options = options
  return effect
}
```

归纳总结  
1. activeEffect 也就是当前活跃的 effect，全局唯一，是在 effect 函数执行时更新
2. 唯一入口 export function effect，也就是说，只要执行了 effect 函数，然后通过 reactive or ref 就可以使用响应式系统了

思考：通常 reactive 和 ref 是在 setup 函数中使用，而 setup 是在组件 beforeCreate 之前吗？什么时候添加的组件 effect 的呢？

## 3 独立使用响应式系统

vue3 的响应式系统，也是一套发布-订阅系统 + 观察者模式  
1. 通过 proxy 实现对数据的监听
2. 通过 track 订阅，收集相关依赖函数
3. 通过 trigger 发布，执行对应函数

## 参考文章
