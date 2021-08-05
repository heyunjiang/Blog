# 源码解读-ref

time: 2021-08-05 20:49:23  
author: heyunjiang

## 1 遇到的问题

今天在做 jsx 渲染绑定 ref 时，遇到了一个问题：同样的写法，在 A 项目中能成功绑定到当前组件实例.$refs 上，在 B 项目则绑定不上去

解决步骤一：google 搜索 `vue jsx ref undefined` 关键词，无结果。看来不是什么通用的问题，多半是自己哪里写的有问题，于是自行解决。  
解决步骤二：思考解决方案，问题可能出现因素：jsx 渲染丢失 ref 属性、ref 绑定到子组件实例上了

## 2 jsx 如何编译

vue createElement 方法三个参数分别为：标签名、data配置对象、子节点数组  
其中 data配置对象中就包含了 ref 属性，也就是说，第一步可以判断构建结果是否有 ref 属性，就可以判断是否是 jsx 构建是否有问题了

我们编写的 template 和 jsx，在构建阶段，会被 vue.compiler 编译成 createElement 方法，可以直接看看构建结果  

编译前  
```javascript
renderContent: (h, item, formData) => {
  return (
    <MSpecification
      ref='specificationRef'
      isServiceTree={this.isServiceTree}
    >
    </MSpecification>
  )
}
```
编译后
```javascript
renderContent:function(t,r,n){
  return t(
    "MSpecification",
    {
      ref:"specificationRef",
      attrs:{isServiceTree:e.isServiceTree}
    }
  )
}
```

在构建的 chunk 文件中，createElement 的第二个参数对象是包含了 ref 属性的，说明 jsx 构建是没有问题的

## 3 ref 如何绑定

既然 jsx 已经成功编译成了 createElement 方法，并且包含了 ref 参数，那么 ref 是否一定会绑定到其定义的组件实例上呢？  
vue 官方文档有如下说明：  
> ref 被用来给元素或子组件注册引用信息。引用信息将会注册在父组件的 $refs 对象上

注册在父组件 $refs 对象上，这里父组件指的是啥？肯定不是 parentVnode，那是所写在的 .vue 文件对象所指的实例组件吗？

先说答案：  
1. 会直接绑定到其父组件的 $refs 属性上
2. 不一定会绑定到代码所写的组件上，因为可能存在作为另一个组件 slot 存在，那么会挂载到另一个组件上

那么 ref 在 vue 源码是在哪里绑定的呢？  
首先我们知道 createElement 方法的第二个参数会被保存到 vnode.data 对象上，在 vm._render 生成 vnode 之后，才会调用 vm._update 去渲染生成组件实例

registerRef 源码
```javascript
export function registerRef (vnode: VNodeWithData, isRemoval: ?boolean) {
  const key = vnode.data.ref
  if (!isDef(key)) return

  const vm = vnode.context
  const ref = vnode.componentInstance || vnode.elm
  const refs = vm.$refs
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = undefined
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref]
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref)
      }
    } else {
      refs[key] = ref
    }
  }
}
```

结果分析：  
1. vnode 会把 ref 注册到 vnode.context.$refs 属性上，ref 值为 vnode 指向的组件实例或者 ele 对象
2. ref 会注册到父组件 $refs 对象上，而不一定是当前编写的组件上

问题：  
1. vnode.context 是在哪里绑定的？指向的是那个组件？
2. 都是调用 registerRef 注册的吗？那 ref.js 中的 `export default` 输出的有啥用？

在组件初始化时，会调用 initRender 初始化组件，内部就绑定了 vm.$createElement 方法，固定了 context 为 vm 本身  
```javascript
vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
```
也就是说我们在调用 render 时，第一个传入的 createElement 参数就控制了当前生成的 vnode 实例的 context 对象值，即谁来编译，就指向谁

## 总结

1. render 的第一个参数 createElement 控制了 vnode.context 值
2. vnode.data.ref 会被绑定到父组件上，不一定是当前编写代码所在的组件
3. 通过 registerRef 方式绑定的 ref
