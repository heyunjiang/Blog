# this

## 结论

1. this指向的是函数被调用的对象，谁调用函数，this就指向谁
2. 未适用 `use strict` 的时候，如果 this 的值为 `undefined`，那么js解释器会将其指向全局对象
3. this的指向，是在函数被调用的时候确定的(也就是创建函数执行上下文的时候确定的)
4. `globalThis` 在任何作用域下都是指向的最顶层对象

问：什么时候this的值为undefined?

答：当函数被对象调用的时候，它的this就指向这个对象。如果函数独立调用，那么它的this就为undefined。但是在其他类型语言中，函数独立调用，它的this指向的是外部环境的this

## 原理

需要从ecmascript规范中来看
