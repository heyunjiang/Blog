# 源码解读-keepAlive

time: 2021-05-12 10:15:48  
author: heyunjiang

## 1 基础知识

1. `缓存` 不活动的动态组件实例，而不是销毁他们，在下次激活的时候，用户会看到之前操作的状态被保留
2. 被 keep-alive 包裹的动态组件及其子元素，都会存在 `activated` 和 `deactivated` 2个生命周期钩子
3. 直接子元素 `只允许有一个`，超出则组件不会被缓存
4. include, exclude 可以条件控制组件是否缓存，操作组件名；max 可以控制最多有多少组件被缓存起来，在达到峰值时，最久缓存没有被访问的组件则会被销毁，将最新的加进去

```javascript
// 编译前
<keep-alive>
  <component :is="currentComponents" :hello="1" />
</keep-alive>
// 编译后
_c('keep-alive',[_c(_vm.currentComponents,{tag:"component",attrs:{"hello":1}})
```

还是在 createElement 中来看，在查找实例 `vm.$options.components` 时，能找到 `keep-alive` 组件，我们来看看它是如何控制的

## 2 初次渲染流程

在组件通过 createElement、createComponents 生成 vnode 之后，通过 patch.createComponent 渲染中，会调用 componentVnodeHooks.init 来初始化组件，keep-alive 组件也一样  
```javascript
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */)
    }
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```

componentVNodeHooks 组件 vnode 初始化、销毁、更新相关入口
```javascript
const componentVNodeHooks = {
  // 初始化组件入口
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive 组件更新
      const mountedNode: any = vnode 
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      // 所有组件初次渲染，实例化组件
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance // 表示当前渲染组件的环境
      )
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },
  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },
  // 销毁组件入口
  destroy (vnode: MountedComponentVNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy()
      } else {
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}
```

调用 init 方法后，keep-alive 组件生成了自己的 vm 实例，调用自身 vm.$mount 开始渲染组件。  
走到 vm.$mount，会按正常组件渲染  
1. 会实例化一个 watcher
2. vm._render 调用 render 生成 vnode，通常这个 vnode 就是唯一子组件对应的 vnode，并且会设置 `vnode.data.keepAlive = true`, 缓存在 keep-alive `vm.cache` 中
3. vm._patch 渲染生成 keep-alive component 实例，实例内部再次调用 mountComponent 方法
4. 唯一子组件走正常渲染流程

来看看 keep-alive 组件部分源码  
```javascript
export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created () {
    this.cache = Object.create(null)
    this.keys = []
  },

  render () {
    const slot = this.$slots.default
    const vnode: VNode = getFirstComponentChild(slot)
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key)
      } else {
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
```

keepalive 壳子主要功能  
1. 缓存已经生成的 vnode 节点
2. 新生成的节点如果在 include 中，并且在缓存中，会把缓存好的 vm 实例赋值给新的 vnode 节点

## 3 销毁 keep-alive 唯一直接子元素组件流程

1. 顶层组件再次生成新的 vnode tree，执行 patch，前后 vdom diff，递归 patch
2. 在判断没有新的 vnode 时，会执行销毁旧 vnode 操作，调用 invokeDestroyHook 函数，也就是 componentVNodeHooks.destroy
3. 在 componentVNodeHooks.destroy 中，如果是普通组件，则调用普通组件的 vm.$destroy 方法，断开与父 vnode 的联系；
如果是 keepAlive 唯一直接子元素组件，则调用 deactivateChildComponent，则不会销毁组件，会标识 vm._inactive = true，并调用 deactivated 钩子

lifecycle.js deactivateChildComponent 组件流程
```javascript
export function deactivateChildComponent (vm: Component, direct?: boolean) {
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    callHook(vm, 'deactivated')
  }
}
```

## 4 恢复 keep-alive 唯一直接子元素组件流程

1. 继续通过 slot 生成 vnode 对象，并读取 keep-alive.cache 中的 vnode.componentInstance 属性，`vnode.componentInstance = oldVnode.componentInstance`
2. 在组件 patch 时，调用 componentVNodeHooks.init 时，走到 `componentVNodeHooks.prepatch` 方法，执行 updateChildComponent, updateChildComponent 作为 keep-alive 子组件的独有渲染方法
3. updateChildComponent 作用：更新之前缓存的 vm 实例与父组件的绑定，更新 $attrs, $listeners, props
4. 此刻组件还没有 patch 完毕，继续走 patch.createComponent，通过 `vnode.elm = vnode.componentInstance.$el` 生成 vnode.elm，然后 insert 插入 parentNode 节点，完成渲染

lifecycle.js updateChildComponent 源码
```javascript
export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren

  vm.$attrs = parentVnode.data.attrs || emptyObject
  vm.$listeners = listeners || emptyObject

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }

  // update listeners
  listeners = listeners || emptyObject
  const oldListeners = vm.$options._parentListeners
  vm.$options._parentListeners = listeners
  updateComponentListeners(vm, listeners, oldListeners)
}
```

## 总结归纳

1. keep-alive 会生成 vm 实例，缓存了内部顶层 slot 组件的 vnode 对象
2. 同普通组件一样，实际 patch 是执行 render 函数返回的 vnode
3. keep-alive 效果是缓存了 slot 组件的实例，后续是直接恢复实例，从而达到组件状态保存效果
