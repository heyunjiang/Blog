# 深入理解 virtual dom

time: 2018.11.07

react 3层架构：用户层(编写代码 jsx、组件等)、虚拟 dom 层(在内存中维护虚拟 dom tree)、操作真实 dom 层(ReactDOM)

作为 react 的核心部分，在掌握了 react 面向用户层的写法之后，有必要深入去了解 virtual dom 层了。  
这一层作为用户层和底部真实 dom 的衔接层，看看 react 这这层做了什么操作

1. 实现 react 元素对象： input, select 等
2. 维护组件：组件生命周期、组件数据 state、组件 dom tree
3. setState
4. 组件更新机制

> web 组件中有 shadow dom

## 1 为什么要去学习虚拟 dom 呢？

react 采用数据驱动，当数据变化，执行更新算法，对比前后虚拟 dom tree ，然后调用第三层 reactDOM 更新真实 dom，更新浏览器的真实 dom tree。

虽然不用掌握虚拟 dom 相关知识也能完成项目开发任务，但是如果不去深究去内部实现原理，难免觉得这是我技能树上的一个空白区域，一个没有灵魂的躯体。所以为了让我的 react 技能更有灵魂，需要去掌握它。

## 2 分析前的问题

1. 生成的元素、组件是如何在内存中存储的，他们之间的关系是如何组织的，react-fiber 如何联系？
2. 更新算法与 dom-diff 是什么关系？
3. setState 为什么要实现异步更新，仅仅是效率吗？
4. 虚拟 dom tree 如何渲染到真实 dom 上？
5. 数据 state 和 virtual dom 是如何关联的？

## 3 解答问题

### 3.1 生成的元素、组件是如何在内存中存储的，他们之间的关系是如何组织的，react-fiber 如何联系？

jsx 编译后的结果通常是 `createElement( tag, attrs, child1, child2, child3 );` 这种样子的，是一个 plain object，所以维护起来也是这个样子

```javascript
// 虚拟 dom tree
{
  tag,
  attrs,
  children: {
    tag,
    attrs,
    children
  }
  children2,
  children3
}
```

这里的 tag ，元素和组件生成的不同，元素的 tag 是个字符串，而组件的 tag 则是一个函数

组件通常为一个 class 类或者一个函数，在实例化组件后，内存中就会保存该组件的实例。在初次渲染或更新的时候，会调用实例对应的生命周期方法，会生成真正的dom，作为属性添加到组件实例上，并渲染到浏览器。

**结论**：生成的元素保存在 virtual dom tree 中，vnode tree 同组件实例一样，都是保存在内存中的。

> 组件的 setState 方法、state 对象，是实现在 React.Component 父类中的

### 3.2 更新算法与 dom-diff 是什么关系？

dom-diff：就是更新的时候，用于判断 virtual dom tree 前后哪些部分变了，需要更新哪些部分。dom-diff 时一个更新过程，采用的 [更新算法](./基本使用-react.md#4.2-状态变化时，组件与其子组件如何变化，反应到浏览器更新时如何更新的？)

> 不同框架实现的 dom-diff 算法不同，有的是对比前后虚拟树，有的是直接比较虚拟树与真实树，react 采用更新算法是对比前后虚拟树  
> diff 过程中，diff 算法抽象独立出去，每次对同层节点做 diff 比较，然后递归遍历子节点

### 3.3 setState 为什么要实现异步更新，仅仅是效率吗？

最大的目的是为了提高效率，在每伦事件循环中，只更新一次

### 3.4 虚拟 dom tree 如何渲染到真实 dom 上？

渲染：`ReactDOM.render(<Element />, document.getElementById('root))`

render 函数的第一个参数，其实就是由 React.createElement 生成的虚拟 dom tree ，简写 `render(vnode, node)`

在调用 ReactDOM.render 的时候，如果虚拟 dom 节点是一个普通元素，那么会调用 `createElement()` 来创建一个节点；如果虚拟 dom 节点是一个组件，也就是一个函数，那么会调用 `createComponent` 来创建一个**组件的实例**。

生成的组件实例，会返回一个对象，该对象包含 `base` 属性，属性值是组件的虚拟 dom 对象集合，这样就可以调用 `createElement()` 来渲染组件了。在执行完 `createComponent()` 方法创建组件实例之后，会调用 `setComponentProps()` 来为组件添加 props 和 执行生命周期方法，并调用 `renderComponent()` 方法来渲染组件

> setState 方法也会调用 `renderComponent()` 来更新渲染组件

```javascript
// renderComponent() 示例代码
export function renderComponent( component ) {
    let base;
    const renderer = component.render();
    if ( component.base && component.componentWillUpdate ) {
        component.componentWillUpdate();
    }
    base = diff(component.base, renderer ); // 调用更新算法更新
    if ( component.base ) {
        if ( component.componentDidUpdate ) component.componentDidUpdate();
    } else if ( component.componentDidMount ) {
        component.componentDidMount();
    }

    component.base = base; // 为组件实例增加 base 属性，表示下次就该是更新了
    base._component = component;

}
```

### 3.5 数据 state 和 virtual dom 是如何关联的？

**前言**：react 和 vue 一样，都是数据驱动。在初始化的时候，数据格式就已经定义好，每个组件都是对应有固定的数据格式，只是在数据变化过程中，数据的值变化了而已。

vue 通过双向数据绑定，在 set 数据的时候，通过 watcher 通知数据变化；react 是通过 setState 通知数据变化。如果采用状态管理，是通过 reducer 或 mutations 更新数据，通知数据变化。

**问题**：数据变化了，是怎么通知 virtual dom tree 更新呢？从头比到脚吗？可能不是

state 数据只是保存在内存中的数据而已，组件或者 redux、vuex 能访问到他们。关键是调用 setState 或者 reducer 更新数据的时候，发生了什么。需要看看 react-redux 源码和 setState 源码分析。

发现通过 redux 获取、更新数据，其实还是会给每个 `connect()(component)` 的组件包裹一层组件，当调用 dispatch 成功更新数据之后，会在包裹的这层组件上调用 `this.setState({})` ，这个不更新任何数据，目的是调用 react 的 setState 方法，通知需要更新了，现在也是只需要看 setState 作何变化了。

[源码解读-react-redux](./源码解读-react-redux.md#3.2.2-connect-源码解读)  
[源码解读-setState](./源码解读-setState.md)

## 参考文章

[1 react 源码学习](https://www.yuque.com/ant-h5/react/pizqme)  
[2 从0开始实现一个 react](https://github.com/hujiulong/blog)
