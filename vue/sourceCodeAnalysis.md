## vue 源码解读

### 待求解的问题

1. 双向绑定实现原理([响应式原理](./vue响应式原理.md))
2. virtual dom vs react (需要对react的virtual dom也熟悉，2者做对比)

### 响应式原理源码模块

在 `core/instance/state.js`

initData(初始化state数据)主要是初始化data中的数据，将数据进行Observer，监听数据的变化，其他的监视原理一致，这里以data为例。

```javascript
function initData (vm: Component) {

  /*得到data数据*/
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}

  /*判断是否是对象*/
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }

  // proxy data on instance
  /*遍历data对象*/
  const keys = Object.keys(data)
  const props = vm.$options.props
  let i = keys.length

  //遍历data中的数据
  while (i--) {
    /*保证data中的key不与props中的key重复，props优先，如果有冲突会产生warning*/
    if (props && hasOwn(props, keys[i])) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${keys[i]}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(keys[i])) {
      /*判断是否是保留字段*/
      proxy(vm, `_data`, keys[i])
    }
  }
  // observe data
  observe(data, true /* asRootData */)
}
```

initData方法中，除了对data数据进行验证(是否为对象、属性是否与props冲突、属性是否与保留字冲突)，就是将data执行代理 `proxy`，和 `observe`了。

**1. proxy**

注意：这里执行的proxy，vue只会对根属性进行proxy

```javascript
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```
这里简单，通过proxy函数将data上面的数据代理到vm上，这样就可以用app.text代替app._data.text了

**2. observe**

observe 方法在 `core/observer/index`

观察者模式

注意这种写法: `let ob: Observer | void` ，这里为ob设置初始值，采用 `:` 符号，如果成功创建Observer实例则返回新的Observer实例，否则返回void

这里的 `__ob__` ，Vue的响应式数据都会有一个__ob__的属性作为标记，里面存放了该属性的观察器，也就是Observer的实例，防止重复绑定。

```javascript
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

既然 `observe` 作为 `Observer` 的实例，这里也没有看出怎么执行的观察者，来看看 `Observer`

**3. Observer**

```javascript
/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    //将Observer实例绑定到data的__ob__属性上面去，之前说过observe的时候会先检测是否已经有__ob__对象存放Observer实例了
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      /*
          如果是数组，将修改后可以截获响应的数组方法替换掉该数组的原型中的原生方法，达到监听数组数据变化响应的效果。
          这里如果当前浏览器支持__proto__属性，则直接覆盖当前数组对象原型上的原生数组方法，如果不支持该属性，则直接覆盖数组对象的原型。
      */
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      /*遍历数组的每一个成员进行observe*/
      this.observeArray(value)
    } else {
      /*如果是对象则直接walk进行绑定*/
      this.walk(value)
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      /* 这里的defineReactive就很重要了， 对vue实例中的data对象进行每个属性defineReactive绑定*/
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    /*数组需要遍历每一个成员进行observe*/
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```
这里的 `defineReactive` 就需要再去分析

**4. defineReactive**

defineReactive的作用是通过Object.defineProperty为数据定义上getter\setter方法，进行依赖收集后闭包中的Deps会存放Watcher对象。触发setter改变数据的时候会通知Deps订阅者通知所有的Watcher观察者对象进行试图的更新。

```javascript
/**
 * Define a reactive property on an Object.
 */
 /*为对象defineProperty上在变化时通知的属性*/
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: Function
) {
  /*在闭包中定义一个dep对象*/
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  /*如果之前该对象已经预设了getter以及setter函数则将其取出来，新定义的getter/setter中会将其执行，保证不会覆盖之前已经定义的getter/setter。*/
  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set

  /*对象的子对象递归进行observe并返回子节点的Observer对象*/
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      /*如果原本对象拥有getter方法则执行*/
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        /*进行依赖收集，为自己添加了观察者, watcher*/
        dep.depend()
        if (childOb) {
          /*子对象进行依赖收集，其实就是将同一个watcher观察者实例放进了两个depend中，一个是正在本身闭包中的depend，另一个是子元素的depend*/
          childOb.dep.depend()
        }
        if (Array.isArray(value)) {
          /*是数组则需要对每一个成员都进行依赖收集，如果数组的成员还是数组，则递归。*/
          dependArray(value)
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      /*通过getter方法获取当前值，与新值进行比较，一致则不需要执行下面的操作*/
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        /*如果原本对象拥有setter方法则执行setter*/
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      /*新的值需要重新进行observe，保证数据响应式*/
      childOb = observe(newVal)
      /*dep对象通知所有的观察者*/
      dep.notify()
    }
  })
}
```

这里用到的 `Dep` ，看看是什么东西，`depend`、`notify` 方法有什么作用

**5. Dep**

Dep就是一个发布者，可以订阅多个观察者，依赖收集之后Deps中会存在一个或多个Watcher对象，在数据变更的时候通知所有的Watcher

```javascript
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  /*添加一个观察者对象*/
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  /*移除一个观察者对象*/
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  /*依赖收集，当存在Dep.target的时候添加观察者对象*/
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  /*通知所有订阅者*/
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null
/*依赖收集完需要将Dep.target设为null，防止后面重复添加依赖。*/
```

这里dep的 `depend` 就是收集依赖，添加观察者对象

`notify` 是通知watcher，有需要更新的了

再看看 `watcher` 是什么

**6. watcher**

Watcher是一个观察者对象。依赖收集以后Watcher对象会被保存在Deps中，数据变动的时候会由于Deps通知Watcher实例，然后由Watcher实例回调cb进行视图的更新。

```javascript
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: ISet;
  newDepIds: ISet;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ) {
    this.vm = vm
    /*_watchers存放订阅者实例*/
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    /*把表达式expOrFn解析成getter*/
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function () {}
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
   /*获得getter的值并且重新进行依赖收集*/
  get () {
    /*将自身watcher观察者实例设置给Dep.target，用以依赖收集。*/
    pushTarget(this)
    let value
    const vm = this.vm

    /*
      执行了getter操作，看似执行了渲染操作，其实是执行了依赖收集。
      在将Dep.target设置为自生观察者实例以后，执行getter操作。
      譬如说现在的的data中可能有a、b、c三个数据，getter渲染需要依赖a跟c，
      那么在执行getter的时候就会触发a跟c两个数据的getter函数，
      在getter函数中即可判断Dep.target是否存在然后完成依赖收集，
      将该观察者对象放入闭包中的Dep的subs中去。
    */
    if (this.user) {
      try {
        value = this.getter.call(vm, vm)
      } catch (e) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      }
    } else {
      value = this.getter.call(vm, vm)
    }
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    /*如果存在deep，则触发每个深层对象的依赖，追踪其变化*/
    if (this.deep) {
      /*递归每一个对象或者数组，触发它们的getter，使得对象或数组的每一个成员都被依赖收集，形成一个“深（deep）”依赖关系*/
      traverse(value)
    }

    /*将观察者实例从target栈中取出并设置给Dep.target*/
    popTarget()
    this.cleanupDeps()
    return value
  }

  /**
   * Add a dependency to this directive.
   */
   /*添加一个依赖关系到Deps集合中*/
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
   /*清理依赖收集*/
  cleanupDeps () {
    /*移除所有观察者对象*/
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
   /*
      调度者接口，当依赖发生改变的时候进行回调。
   */
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      /*同步则执行run直接渲染视图*/
      this.run()
    } else {
      /*异步推送到观察者队列中，由调度者调用。*/
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
   /*
      调度者工作接口，将被调度者回调。
    */
  run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        /*
            即便值相同，拥有Deep属性的观察者以及在对象／数组上的观察者应该被触发更新，因为它们的值可能发生改变。
        */
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        /*设置新的值*/
        this.value = value

        /*触发回调渲染视图*/
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
   /*获取观察者的值*/
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
   /*收集该watcher的所有deps依赖*/
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
   /*将自身从所有依赖收集订阅列表删除*/
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      /*从vm实例的观察者列表中将自身移除，由于该操作比较耗费资源，所以如果vm实例正在被销毁则跳过该步骤。*/
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}
```

****
这里采用的是观察者模式，与发布/订阅模式不同

总结归纳：vue为data对象的每一个根属性都 new 了一个发布者，当调动该对象的set方法时，会主动去通知观察者执行更新

观察者模式与发布/订阅模式不同，2者调度中心不同，发布订阅由中间事件传递，观察者由绑定基础对象自己通知观察者更新
****

### vue virtual dom 模块

同react一样，vue也是将真实dom抽象出一层虚拟dom，然后建立映射关系。

这里的虚拟dom，是一个javascript对象，这个对象记录了真实dom的相关信息，如下伪代码：

```javascript
{
    tag: 'div'
    data: {
        class: 'test'
    },
    children: [
        {
            tag: 'span',
            data: {
                class: 'demo'
            }
            text: 'hello,VNode'
        }
    ]
}
```
对应的真实dom，渲染之后是这样子的

```html
<div class="test">
    <span class="demo">hello,VNode</span>
</div>
```

用户每次操作dom的时候，vue是通过监听数据变化来更新视图，这里就涉及到了vue的事件，这里暂不做分析。

当数据变化，vue的数据属于响应式数据，采用发布订阅的观察者模式，当数据变化，就通知订阅者可以判断处理了。

这里涉及到2个关键点：virtual dom树的diff算法和如何更新真实dom

#### virtual dom树的diff算法

这里做个大致原理总结，因为只是简单看了源码，也没有具体分析。

diff算法，是对虚拟树前后vnode进行比较，寻找他们不同节点，只更新不同节点，跟react不同的是，vue是处理细粒度的，只追踪更新需要更新的点，react则是会将变化的节点及其子树全部一起更新。

#### 如何更新真实dom

在什么时候更新真实dom呢？

在diff出需要更新virtual dom的时候，在更新的钩子函数中操作，真实dom在虚拟dom树上有映射关系

```javascript
/*VNode节点对应的Dom实例*/
  const elm = vnode.elm
```

vue 为不同平台做了一层适配，浏览器、weex等平台，不同平台的钩子函数不同。浏览器为例，包含 create、update、delete 等钩子，就是vue的生命周期
