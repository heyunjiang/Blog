# vue3 响应式系统

time: 2021.3.9  
author: heyunjiang

## 背景

归纳 vue3 响应式原理，同 vue2 的差异。  
目前已知：vue3 使用 proxy 代替 vue2 的 defineProperty  
并且，reactive 和 ref 是如何通知更新组件的，收集当前组件 vm 时机

## 1 响应式原理

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

### 1.1 reactive

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

### 1.2 ref

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

### 1.3 track
 
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

### 1.4 trigger

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

### 1.5 activeEffect

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

## 2 独立使用响应式系统

vue3 的响应式系统，也是一套发布-订阅系统 + 观察者模式  
1. 通过 proxy 实现对数据的监听
2. 通过 track 订阅，收集相关依赖函数
3. 通过 trigger 发布，执行对应函数

## 参考文章
