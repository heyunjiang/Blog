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
1. get(target, propKey, receiver) 拦截对象属性的读取，返回值由自定义的 handler 函数决定
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

问题：如果判别一个对象是 Set or Map or Object？可以使用 instanceof

## 参考资料
