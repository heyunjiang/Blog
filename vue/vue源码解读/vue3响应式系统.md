# vue3 响应式系统

time: 2021.3.9  
author: heyunjiang

## 背景

归纳 vue3 响应式原理，同 vue2 的差异。  
目前已知：vue3 使用 proxy 代替 vue2 的 defineProperty，但是 vue2 的 dep + watcher 对象是被什么代替了呢？  
并且，reactive 和 ref 是如何通知更新组件的，收集当前组件 vm 时机

## 1 响应式流程

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

与 vue2 不同的是  
1. vue2 Vue 对象在引入之后，会立马初始化一系列 mixin，而 vue3 是只暴露一系列 api，比如 createApp
2. 

### 1.2 render 渲染

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

## 参考文章
