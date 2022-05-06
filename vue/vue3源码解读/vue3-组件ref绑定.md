# 组件 ref 绑定

time: 2022-05-06 20:37:59  
author: heyunjiang

## 背景

最近在写 composables 时，发现通过 ref + setup 绑定组件时，抽离在 composables 中的 ref 无法获取到 instance

## vue3 组件 ref 绑定原理

官网这么说：在渲染上下文中暴露 root，并通过 ref="root"，将其绑定到 div 作为其 ref。在虚拟 DOM 补丁算法中，如果 VNode 的 ref 键对应于渲染上下文中的 ref，则 VNode 的相应元素或组件实例将被分配给该 ref 的值。这是在虚拟 DOM 挂载/打补丁过程中执行的，因此模板引用只会在初始渲染之后获得赋值。

对于渲染上下文暴露 root 不太懂，但是大致知道是在 patch 算法中实现的 ref 绑定。

patch 绑定 ref 源码  
```javascript
const patch: PatchFn = (
  n1,
  n2,
  container,
  anchor = null,
  parentComponent = null,
  parentSuspense = null,
  isSVG = false,
  slotScopeIds = null,
  optimized = __DEV__ && isHmrUpdating ? false : !!n2.dynamicChildren
) => {
  // 组件渲染相关代码省略
  // set ref
  if (ref != null && parentComponent) {
    setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2)
  }
}
```

在组件渲染完成之后，会有一个 setRef 操作  
```javascript
export function setRef(
  rawRef: VNodeNormalizedRef,
  oldRawRef: VNodeNormalizedRef | null,
  parentSuspense: SuspenseBoundary | null,
  vnode: VNode,
  isUnmount = false
) {
  const refValue =
    vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
      ? getExposeProxy(vnode.component!) || vnode.component!.proxy
      : vnode.el
  const value = isUnmount ? null : refValue

  const { i: owner, r: ref } = rawRef
  const refs = owner.refs === EMPTY_OBJ ? (owner.refs = {}) : owner.refs
  const setupState = owner.setupState

  refs[ref] = value
  if (hasOwn(setupState, ref)) {
    setupState[ref] = value
  }
}
```

总结  
1. setRef 会将声明的 ref 属性如果和组件 ref 属性同名，则会设置 `ref.value === instance.expose`
2. 写法规范：在声明 composables 时，定义的 ref 也需要 export 出来，在组件中引入实现绑定
