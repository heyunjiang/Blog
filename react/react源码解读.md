# react源码阅读

time: 2018.7.20 - 2018.7.25

heyunjiang

目录

1. 为什么阅读源码
2. 步骤
3. 阅读源码要解决什么问题
4. 源码总结

## 一 为什么阅读源码

目前我已经深入学习了 html, js, dom (肯定需要补充学习)，接下来就是 react + nodejs 了。首先选择 react ，作为基本的前端能力(吃饭工具)。

之前有做过 react 的项目，但是都是停留在表面的基础应用，甚至是用的别人的集成框架，自己写的纯 react 项目写的不多，对 react 的应用主要体现在 `ReactDom.render` , `jsx` , `生命周期` , `extends React.Component`，`虚拟 dom` 。

现在需要对 react 深入学习，知晓它的内部实现原理，组织架构方式，方便以后 `bug 定位` 、 `项目扩展` 、 `项目组织架构优化` 、 `第三方工具搭配使用` ，甚至是自己写一套前端框架。

## 二 步骤

1. 回顾、熟悉已做项目
2. 回顾官网教程文档 (由于时间限制，本次回顾只看了大部分内容，在第一次课堂结束后再回顾)
3. 总结归纳问题
4. 开始阅读源码 [分析教程](https://gitee.com/zhufengpeixun/1.1.jsx)

## 三 阅读源码要解决什么问题

### 1 react 整体组织架构是什么方式的？如果我要自己做套框架，需要做什么，怎么做？

### 2 react 是如何控制虚拟 dom 与真实 dom之间的联系？从几个方面来回答：结构、更新方式、性能

更新方式(协调)

1. 节点元素类型改变：如果一个节点元素类型发生改变，那么它及它的后代都会被重新创建
2. 节点元素属性改变：如果一个节点元素类型不变，属性改变，那么将只会更新它的属性
3. 组件props改变：如果一个组件元素类型不变，组件发生更新，那么react将保持实例不变，通过更新组件的 props 来触发更新，产生新元素，并在底层实例上依次调用 `componentWillReceiveProps()` 和 `componentWillUpdate()`，组件触发更新完毕。接下来调用 `render()` 方法，执行第一、二点进行更新
4. 列表更新：与前面3点不同，列表的项是一种相对稳定的结构，列表渲染需要增加一个 `key` 值，当每次插入或删除列表项的时候，通过对比key值，可以减少对比次数，增加更新效率。key 最好用 id 标识，如果用序号 index 标识，重新排序列表的时候，每项的 index 会发生变化，从而 key 变化，可能会产生意想不到的变化。key 要求在兄弟节点之间唯一，不用全局唯一

> key 应该是稳定的，否则将使得大量组件实例和dom节点进行不必要的重建，使得性能下降、丢失子组件的状态

### 3 jsx 如何编译？从几个方面来回答：jsx 特性、编译

特性

1. 会移除空行和开始、结尾处的空格，也会移除标签邻近的新行(回车)，字符串内部的换行会被替换成一个空格
2. 作为 `React.createElement(components, props, ...children)` 的语法糖
3. js 表达式需要用 `{}` 包裹起来
4. jsx 中的 boolean, null, undefined 会被忽略
5. 合成事件
6. 对html标签的处理

### 4 组件构建方式？有状态组件实现了什么功能？从几个方面来回答：有状态组件相对于无状态组件多了几样东西、组件通信方式、与 jsx 的联系、组件生命周期、钩子函数、设计目的

组件通信方式

1. 父子：props + callback
2. 兄弟：共同父亲
3. Context：全局数据，redux就是基于此实现，主要用于解决跨多个父亲节点传递props问题

> React.Fragment，语法糖 `<></>` ，用以解决 return 方法中保证只有一个根节点问题, 16版本以上提供

### 5 提供了哪些开放接口，用于和 router、flux 等第三方对接？

### 6 react ssr 服务端渲染原理

## 四 源码总结

源码地址：[facebook/react](https://github.com/facebook/react)

react 版本： v 0.3.3 stable

http-server: [http-server](https://github.com/indexzero/http-server)

本节属于本文重要章节，用以解决第三节提出的全部问题，还有额外再学习过程中归纳的知识、问题

### 1 针对问题1 react 整体组织架构是什么方式的？如果我要自己做套框架，需要做什么，怎么做？

#### 1.1 react架构方式

分为视图层和控制层

视图层：dom 层

控制层：virtual dom 层，包含数据 state, props 等，包含事件挂载、setState、生命周期等

通常框架内部分为功能与层次

功能：也可以说成功能模块、公共模块，也就是独立的可移植模块

层次：非通用模块，包含框架的全部数据结构和算法，包括提供的入口、第三方接口等

**3类组件**：ReactTextComponent(文字组件)、ReactNativeComponent(原生组件)、ReactCompositeComponent(复合组件，也就是自己命名的组件)

**3个层次**： 展示层(用户声明、创建虚拟组件，渲染虚拟组件，和真实dom打交道)、virtual 组件层、基础功能(所有公共代码，提供底层功能)

> 在阅读源码的时候，牢记react的这3个层次，看看目前看得源码属于哪个层次，实现了什么功能

#### 1.2 设计思路

****

课前 3 个问题

问题1：为什么要实现 react, 为了解决什么问题？

预答：加快开发速度；统一开发规范，方便维护；解决新手常犯的 **兼容** 、 **性能** 等问题

问题2：除了 dom-diff, virtual dom 外， react 还有其他什么创新吗？

预答：组件化(生命周期、钩子函数等)、数据管理(setState、单向数据流)、jsx(合成事件)

问题3：猜想 react 内部如何工作

预答：编译jsx成 react 能识别的对象，形成 virtual dom 与 真实dom；在控制层统一管理数据，更新进行 dom-diff，决定要更新 view 层的哪些dom；

****

课程总结

设计灵感：数据变化时，只更新变化的一部分，jq 和 template 做不到这点

设计核心：认为 ui 只是把数据通过映射关系变成另一种形式的数据，通过数据 -> ui ；这里的数据映射是通过虚拟组件实现，虚拟组件是 react 的核心； 数据 -> 虚拟组件 ->ui

### 2 react 对比传统 html, css, js 开发，解决了些什么问题，怎么解决的？

下面这些都是相对而言的，对于老手来说，react解决的这些问题都不是问题，只是对于初级来说，封装性更强，更容易上手，对于常规通用问题兼容封装了

1. 数据难以管理：flux/redux，传统的是为每个对象保存一份数据，但是数据不好组织、维护
2. 无法实现局部更新：dom-diff，传统的就是一堆操作原生dom节点，性能低下
3. 浏览器兼容：事件差异( 样式差异是在其他ui库中实现的 )

### 3 如何阅读 react 源码

和本次教程说到的一样，直接逐行扫描阅读是不行的，之前我读 react 15 的源码就是这样的，非常痛苦，但是读 redux、react-redux、dva 这些源码，我都能读下来。

失败的原因呢，是 react 源码过长，要讲究技巧阅读：基线法(低版本开始)、广度优先法(入口文件，先看注释，绘制模块关系图和时序图，再看函数具体实现)、调用栈调试发(入口文件，根据调用函数逐渐深入，熟悉调用栈的主线，了解react组件的运行机制)

> 广度优先法与调用栈调试法最大区别：前者是先统一根据注释及方法名总结所有函数模块，再精读实现原理；后者是顺着入口文件调用函数这条线，依次深入各个函数

### 4 针对问题3 jsx 如何编译？ 组件渲染与 jsx 编译

jsx 构造一个组件，将这个组件由 `React.renderComponent` 渲染到对应的真实dom节点上。

```javascript
// 例1 ： 组件渲染与 jsx 编译
var ExampleApplication = React.createClass({
    render: function() {
        var elapsed = Math.round(this.props.elapsed / 100);
        var seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0' );
        var message =
        'React has been successfully running for ' + seconds + ' seconds.';
        return <div>{message}</div>;
    }
});

React.renderComponent(
    <ExampleApplication elapsed={new Date().getTime() - start} />,
    document.getElementById('container')
);
```

> 15.0.0 之后的版本是 ReactDom.render

4.1 渲染过程：

1. 查找：查找挂载目标上是否已经存在一个与之对应、已经渲染过的 `component`
2. 如果没有找到：将该 `component` 与这个挂载目标关联信息保存下来，方便后续查询；调用 `mountComponentIntoNode`，将 `component` 挂载到挂载目标上 (虚拟 dom -> 真实 dom)
3. 如果找到：执行更新

```javascript
// 渲染过程，源码 renderComponent
// in /src/core/ReactMount.js

var instanceByReactRootID = {};

function getReactRootID(container) {
  // && 表达式，前者真才执行后一个，否则 undefined
  return container.firstChild && container.firstChild.id;
}

// 返回更新或挂载后的 component
renderComponent: function(nextComponent, container) {
    // 获得历史缓存的renderComponent记录
    var prevComponent = instanceByReactRootID[getReactRootID(container)];
    if (prevComponent) {
        // 问：constructor 是一个对象，能这么比较吗？答：能，必须2个指向的是同一个对象
        if (prevComponent.constructor === nextComponent.constructor) {
            var nextProps = nextComponent.props;
            // 保持滚动条不变
            ReactMount.scrollMonitor(container, function() {
                // 更新属性
                prevComponent.replaceProps(nextProps);
            });
            return prevComponent;
        } else {
            // 卸载之前的组件
            ReactMount.unmountAndReleaseReactRootNode(container);
        }
    }
    // 挂载事件
    ReactMount.prepareTopLevelEvents(ReactEventTopLevelCallback);
    // 注册，获取id
    var reactRootID = ReactMount.registerContainer(container);
    // 把历史id记录在 instanceByReactRootID 对象变量中
    instanceByReactRootID[reactRootID] = nextComponent;
    // 调用ReactComponent的createClass的返回结果，虚拟 dom -> 真实 dom
    nextComponent.mountComponentIntoNode(reactRootID, container);

    // 问题：为什么要先 ReactMount.registerContainer 获取 id，而不是直接 nextComponent.mountComponentIntoNode 执行挂载并返回id呢？

    return nextComponent;
}
```

4.2 jsx 编译过程

1. `return <div>{message}</div>` 会被编译成 `React.DOM.div(null, message)`，这是原生组件 `ReactNativeComponen`，原型是 `ReactNativeComponen`；这也解决了问题3中 jsx 特性，其对于 html 标签的处理，react 会将写在 jsx 中的标签转换成其自身的标签对象
2. `<ExampleApplication elapsed={new Date().getTime() - start} />` 会被编译成 `ExampleApplication( {elapsed:new Date().getTime() - start}, null )`，这是复合组件 `ReactCompositeComponent`，原型是 `ReactCompositeComponentBase`

这是 react 0.3 编译的结果，那么在 react 15 种编译的结果是否一样？

答： react 0.3 使用 `JSXTransformer.js` 编译jsx，调用 `React.createClass` 生成虚拟组件？；react 15 使用 `babel-preset-react` 来编译jsx，该 preset 包含4个插件，其中一个 `transform-react-jsx` 负责编译 jsx，调用 `React.createElement` 生成虚拟组件

> 总结：说明在 jsx 编译过程中，会将这2种类型的组件编译成 react 能识别的方法，也就是 js 引擎能识别的 js，这个过程叫做 jsx `预编译`
> 这里只是说了 jsx 会最终被编译成什么，复合组件会被编译成什么，但是没有说具体的编译过程

### 5 针对问题4 组件构建方式？组件创建、初始化及渲染

从例子1可以看到，创建组件是通过 `React.createClass` 方法，需要传入的是配置，包含初始化、属性、状态、生命周期钩子、渲染render、自定义函数等。(这也说明了框架是传入配置，我们通常所做的组件化编程，其实就是在写创建组件的配置)

> 说明：配置中的 `render` 不能为空，因为 react 组件需要根据 render 的返回值来渲染最终的页面元素，其他都可以为空

**5.1 组件创建**流程

1. 填写配置：通过 `React.createClass` 填写组件配置
2. 组件编译：预编译 jsx
3. 组件创建: 通过执行 `React.createClass` 创建组件

```javascript
// 组件创建 源码 createClass
// in /src/core/ReactCompositeComponent.js

//spec 就是填写的一系列配置
createClass: function(spec) {
    var Constructor = function(initialProps, children) {
      this.construct(initialProps, children);
    };
    // 1. 让 Constructor 继承 ReactCompositeComponentBase，所以通过 createClass 生成的组件都是复合组件
    // 2. 这2步是典型的继承
    // 3. react 做 dom-diff，是通过 Constructor 来判断组件相同，渲染判断更新也是通过 Constructor
    Constructor.prototype = new ReactCompositeComponentBase();
    Constructor.prototype.constructor = Constructor;

    mixSpecIntoComponent(Constructor, spec);
    invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    );

    // 为什么要多包装一层呢？答：为了保证每个生成得组件都是独立的，不被开发者修改到 Constructor 这个原型，因为这里被封装了一层 ConvenienceConstructor ，开发者也只能接触到它，接触不到 Constructor，这是对组件本身的一个保护
    var ConvenienceConstructor = function(props, children) {
      return new Constructor(props, children);
    };
    ConvenienceConstructor.componentConstructor = Constructor;
    ConvenienceConstructor.originalSpec = spec;
    return ConvenienceConstructor;
}
```

**5.2 组件实例化**过程

上面说到了 `createClass` 是如何创建组件，那么如何实例化这个创建好的组件呢？

通过 createClass 创建好组件，是作为 `renderComponent` 的第一个参数，用以渲染。

> 在 createClass 创建好的组件，实例化的第一步，就是会执行 Constructor 的 construct 函数， `this.construct(initialProps, children)` ， construct 是继承自 ReactCompositeComponentBase，而 ReactCompositeComponentBase 实现的又是 `ReactComponent.Mixin.construct`

组件实例化的过程：执行 construct 函数，为组件绑定 `props` 和 `children` ，绑定 `父组件指向` ，设置 `生命周期状态`

```javascript
// 组件创建 源码 construct
// in /src/core/ReactComponent.js

construct: function(initialProps, children) {
    this.props = initialProps || {};
    if (typeof children !== 'undefined') {
    this.props.children = children;
    }
    // 绑定父组件指向
    this.props[OWNER] = ReactCurrentOwner.current;
    // 设置生命周期为 UNMOUNTED
    this._lifeCycleState = ComponentLifeCycle.UNMOUNTED;
}
```

**5.3 组件渲染**过程

****

在填写 `createClass` 配置之后，预编译 `jsx` ，然后执行 `createClass` 创建组件；

> 为什么预编译在创建组件之前？因为 js引擎 不能识别 jsx ，需要先编译

创建好的组件在使用时进行实例化 `construct` ，然后就进入渲染阶段了。

整个流程： 填写配置 -> 预编译 jsx -> 创建组件 -> 组件实例化 -> 组件渲染

****

关键点

最重要4个函数： `ReactMount.renderComponent` 、 `ReactComponent.mountComponentIntoNode` 、 `ReactComponent._mountComponentIntoNode` 、 `ReactCompositeComponent.mountComponent`

最重要3个文件：ReactComponent.js、ReactCompositeComponent.js、ReactNativeComponent.js ，它们都有 `mountComponent` ，分别作用是 绑定ref、解析复合组件、生成真实dom组件

5.3.1 组件渲染的入口函数： ReactMount.renderComponent()

> 在 4.1 渲染过程 简要总结过渲染要经过哪些步骤，判断组件是否已经渲染，并把虚拟 dom -> 真实 dom ，所有虚拟 dom 维护在 `instanceByReactRootID` 对象中


在 ReactMount.renderComponent 中，是通过 mountComponentIntoNode 将虚拟 dom 渲染到真实 dom 的；开启一个事务，保证渲染阶段不会有什么事件触发，并阻断 componentDidMount 事件，待执行后执行

5.3.2 ReactComponent.mountComponentIntoNode()

> 问：事务是如何实现的呢？

```javascript
// 组件创建 源码 mountComponentIntoNode
// in /src/core/ReactComponent.js

mountComponentIntoNode: function(rootID, container) {
    var transaction = ReactComponent.ReactReconcileTransaction.getPooled();
    transaction.perform(
        this._mountComponentIntoNode,
        this,
        rootID,
        container,
        transaction
    );
    ReactComponent.ReactReconcileTransaction.release(transaction);
}
```

****

5.3.3 ReactComponent._mountComponentIntoNode

_mountComponentIntoNode 通过 ReactCompositeComponent.mountComponent() 获取待渲染组件的 innerHTML，然后将其渲染到 `container` 节点内部

```javascript
// 组件创建 源码 _mountComponentIntoNode
// in /src/core/ReactComponent.js

_mountComponentIntoNode: function(rootID, container, transaction) {
    var renderStart = Date.now();
    var markup = this.mountComponent(rootID, transaction);
    ReactMount.totalInstantiationTime += (Date.now() - renderStart);

    var injectionStart = Date.now();
      // Asynchronously inject markup by ensuring that the container is not in
      // the document when settings its `innerHTML`.
    var parent = container.parentNode;
    if (parent) {
        var next = container.nextSibling;
        parent.removeChild(container);
        container.innerHTML = markup;
        if (next) {
          parent.insertBefore(container, next);
        } else {
          parent.appendChild(container);
        }
    } else {
        container.innerHTML = markup;
    }
    ReactMount.totalInjectionTime += (Date.now() - injectionStart);
}
```

****

5.3.4 ReactCompositeComponent.mountComponent()

最复杂的一个函数，实现以下9个功能有

> _lifeCycleState：组件生命周期，用于校验 react 组件在在执行函数时状态值是否正确，只是用于给出报错提示；2个可枚举值： `MOUNTED` 、 `UNMOUNTED`
> _compositeLifeCycleState: 复合组件生命周期，用于保证 setState 流程不受其它行为影响

```javascript
// 组件创建 源码 mountComponent
// in /src/core/ReactCompositeComponent.js

mountComponent: function(rootID, transaction) {
    // 1 挂载组件 ref 属性到 this.refs 上，如果组件设置了 ref 属性才会有效
    ReactComponent.Mixin.mountComponent.call(this, rootID, transaction);

    // 2 设置组件生命周期状态值
    this._lifeCycleState = ReactComponent.LifeCycle.UNMOUNTED;
    this._compositeLifeCycleState = CompositeLifeCycle.MOUNTING;

    // 3 如果组件设置了 props ，则进行校验
    if (this.constructor.propDeclarations) {
      this._assertValidProps(this.props);
    }
    // 4 绑定this 这是在es6出现前的 之后呢？
    if (this.__reactAutoBindMap) {
      this._bindAutoBindMethods();
    }

    // 5 初始化 state
    this.state = this.getInitialState ? this.getInitialState() : null;
    this._pendingState = null;

    // 6 如果设置了 componentWillMount 生命周期函数，则执行，该函数中设置 setState 不会触发 re-render
    if (this.componentWillMount) {
      this.componentWillMount();
      // When mounting, calls to `setState` by `componentWillMount` will set
      // `this._pendingState` without triggering a re-render.
      if (this._pendingState) {
        this.state = this._pendingState;
        this._pendingState = null;
      }
    }

    // 7 如果设置了 componentDidMount 生命周期函数，则将其加入到 ReactOnDOMReady 队列中
    if (this.componentDidMount) {
      transaction.getReactOnDOMReady().enqueue(this, this.componentDidMount);
    }

    // 8 调用组件声明的 render 函数，并返回 ReactComponent render 之后的抽象实例(ReactComponsiteComponent或ReactNativeComponent)
    this._renderedComponent = this._renderValidatedComponent();

    // Done with mounting, `setState` will now trigger UI changes.
    this._compositeLifeCycleState = null;
    this._lifeCycleState = ReactComponent.LifeCycle.MOUNTED;

    // 9 _renderedComponent 是由 render 之后生成的组件实例；如果 _renderedComponent 是 ReactComponsiteComponent，那么它会重复 mountComponent 的这个过程；如果 _renderedComponent 是 ReactNativeComponent，那么它会调用 ReactNativeComponent 的 mountComponent 方法
    return this._renderedComponent.mountComponent(rootID, transaction);
}
```

```javascript
// 组件创建 源码 _assertValidProps
// in /src/core/ReactCompositeComponent.js

_assertValidProps: function(props) {
    var propDeclarations = this.constructor.propDeclarations;
    var componentName = this.constructor.displayName;
    for (var propName in propDeclarations) {
      var checkProp = propDeclarations[propName];
      if (checkProp) {
        checkProp(props, propName, componentName);
      }
    }
}
```

```javascript
// 组件创建 源码 _renderValidatedComponent
// in /src/core/ReactCompositeComponent.js

_renderValidatedComponent: function() {
    // 问：这里的 ReactCurrentOwner.current 有什么用？
    ReactCurrentOwner.current = this;
    var renderedComponent = this.render();
    ReactCurrentOwner.current = null;
    invariant(
      ReactComponent.isValidComponent(renderedComponent),
      '%s.render(): A valid ReactComponent must be returned.',
      this.constructor.displayName || 'ReactCompositeComponent'
    );
    return renderedComponent;
}
```

```javascript
// 组件创建 源码 mountComponent
// in /src/core/ReactNativeComponent.js

mountComponent: function(rootID, transaction) {
    ReactComponent.Mixin.mountComponent.call(this, rootID, transaction);
    assertValidProps(this.props);
    return (
      this._createOpenTagMarkup() +
      this._createContentMarkup(transaction) +
      this._tagClose
    );
}
```

****
