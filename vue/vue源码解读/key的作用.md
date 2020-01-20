# key的作用

time: 2020.1.16  
author: heyunjiang

## 1 背景

已掌握 key 的作用  
1. for 循环时用于优化渲染
2. 用于组件更新，重新完整执行生命周期

遇到的问题  
1. 在 for 循环时，多个组件拥有了相同的 key，组件的渲染顺序、props值都出现了问题

## 2 渲染流程

先回顾一下渲染流程，在组件数据更新时，vue 会执行如下流程

```javascript
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  updateComponent = () => {
    // vm._render 返回的是一个 vnode 节点对象
    vm._update(vm._render(), hydrating)
  }
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  
  return vm
}
```

### 2.1 vm._render()

```javascript
Vue.prototype._render = function (): VNode {
    const { render, _parentVnode } = vm.$options
    vnode = render.call(vm._renderProxy, vm.$createElement)
}
```

render 是编译生成的 render 函数，保存在 vue 实例的 $options 属性上，每次调用，都会内部递归调用 createElement 函数，生成一个新的 vnode tree

### 2.2 vm._update()

vm._update() 将前后 vnode tree 做 vdom tree diff 更新

```javascript
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
  }

  function patchVnode () {
    if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
  }
```

vm._update() 内部调用 patch 进行 vdom diff 渲染  
如果是执行更新，patch 内部主要是调用 updateChildren 函数进行 children vdom diff

```javascript
  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(newCh)
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        // 寻找是否之前有这个 key 的节点
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        // 如果没有找到这个节点
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          // 如果找到这个节点
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }
```

updateChildren 方法就是 vue vdom diff 的算法实现，归纳一下  
1. 每个组件从根节点开始比较
2. 在多个后代时，通过 key 值、首节点、尾节点、首尾节点、尾首节点，实现快捷查找比较，判断是否是相同节点，提升查找性能
3. key 值用于提升查找速度，通过 key 可以实现旧节点复用、新节点新增

### 2.3 sameVnode

在渲染函数 patchVnode 中，是通过 sameVnode 来判断2个 vnode 是否是统一节点

```javascript
// sameVnode 通过比较前后 key 是否相等
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```

### 2.4 patchVnode

这里具体分析一下 patchVnode 方法，看一下各个参数作用

```javascript
function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }
    // 拿到旧节点的 ele
    const elm = vnode.elm = oldVnode.elm

    let i
    const data = vnode.data
    // 执行 prepatch 钩子函数
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    
    // 如果新节点 vnode 下面不是 text
    if (isUndef(vnode.text)) {
      // 1 如果新旧 vnode 下面都有后代，则递归比较所有后代
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        // 2 如果只有新 vnode 下面有后代，旧节点没有 children
        if (process.env.NODE_ENV !== 'production') {
          // 只有在非生产模式才会去验证重复 key，并且报错
          checkDuplicateKeys(ch)
        }
        // 如果旧节点之前有文字，则先清空文字
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        // 在 ele 下面增加节点
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        // 3 如果只有旧节点下面有后代，而新节点没有后代，则清空旧节点的后代
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // 4 如果新旧节点都没有 children，则设置当前 ele 元素为空
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // 5 如果新节点下面是 text，并且和旧节点的 text 不同，则更新
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }
```

参数分析：结合 updateChildren 和 patchVnode 方法，总结一下 patchVnode 方法参数  
1. oldVnode：旧的 vnode 节点
2. vnode：新的 vnode 节点
3. insertedVnodeQueue：待渲染的 vnode 队列
4. ownerArray：如果是 children 循环更新，则是 ch 对象
5. index：当前 vnode 在 ownerArray 中的下标
6. removeOnly：是否只是移除 children 中的一项

可以看出  
1. vue vdom diff 采用深度优先遍历算法，递归更新所有后代
2. 

## 参考文章
