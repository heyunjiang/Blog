# proxy

time: 2021.3.10  
author: heyunjiang

## 背景

proxy 作为 defineProperty 的替代 api，在 vue3 的响应式系统中作为核心依赖，需要对 proxy 做个系统学习

## 1 基本语法

proxy 可以对任何 js 类型(简单类型，function, array, object, Symbol)数据做代理，defineProperty 是只能对 plain object 做代理，并且是在属性层面的代理。  
proxy 基本语法格式，返回的 proxy 当作原有对象的一切操作  
```javascript
var proxy = new Proxy(target, handler = {
  get(target, propKey, receiver) {
    return Reflect.get(target, propKey)
  }
});
```

其中 handler 支持的属性格式如下  
> 如果 handler 不做任何处理，则访问原对象  
1. get(target, propKey, receiver) 拦截对象属性的读取，包括数组下标访问，返回值由自定义的 handler 函数决定
2. set(target, propKey, value, receiver) 拦截对象属性的设置，返回布尔值
3. has(target propKey) 拦截 `propKey in proxy` 的操作，返回布尔值
4. deleteProperty(target, propKey) 拦截 `delete proxy[propKey]` 的操作，返回布尔值
5. ownKeys(target) 拦截 `Object.keys(proxy) | for ... in`，返回数组
6. getOwnPropertydescriptor(target, propKey) 拦截 Object.getOwnPropertydescriptor，返回对象
7. defineProperty(target, propKey, propDesc) 拦截 Object.defineProperty，返回布尔值
8. preventExtensions(target) 拦截 Object.preventExtensions，返回布尔值，这个是啥属性？
9. getPrototypeOf(target) 拦截 Object.getPrototypeOf，返回对象
10. isExtensible(target) 拦截 Object.isExtensible，返回布尔值
11. setPrototypeOf(target, proto) 拦截 Object.setPrototypeOf，返回布尔值
12. apply(target, object, args) 拦截 proxy 作为普通函数调用
13. construct(target, args) 拦截 proxy 作为构造函数调用

问题：  
1. 如果判别一个对象是 Set or Map or Object？可以使用 instanceof
2. 能拦截数组下标访问吗？proxy 可以拦截，下标也就是数组这个对象上的属性
3. vue3 为什么还需要对数组方法做拦截？
4. proxy 对象解构赋值之后还具备响应式吗？明显不具备

## 2 Reflect

Reflect 是 es6 为操作对象提供的 api，不同于 Object 的是  
1. Reflect 支持更多的 api
2. Reflect 对错误更友好
3. 与 proxy 方法一一对应，proxy 可以修改默认行为，但是可以通过 Reflect 拿到原始行为

Reflect 支持如下静态方法  
1. Reflect.apply(target, thisArg, args) 执行普通函数
2. Reflect.construct(target, args) 执行构造函数，等同于 new target
3. Reflect.get(target, name, receiver) 获取对象属性值；如果对象属性为函数，并且是 getter，那么会将 receiver 作为函数内部的 this 对象
4. Reflect.set(target, name, value, receiver) 设置对象属性值；如果对象属性为函数，则 value 作为函数的参数；如果是函数的 getter，那么会将 receiver 作为函数内部的 this 对象，并且会触发原对象的 Proxy.defineProperty 拦截
5. Reflect.defineProperty(target, name, desc)
6. Reflect.deleteProperty(target, name)
7. Reflect.has(target, name)
8. Reflect.ownKeys(target)
9. Reflect.isExtensible(target)
10. Reflect.preventExtensions(target)
11. Reflect.getOwnPropertyDescriptor(target, name)
12. Reflect.getPrototypeOf(target)
13. Reflect.setPrototypeOf(target, prototype)


## 参考资料
