## 高阶组件(高阶函数)

这里记录了我学习高阶组件总结的方法与注意事项

### 最基础的高阶组件

第一版: 传参验证，这里验证是否是数组

```javascript
/*
 * HOC-arrayVerify
 * @require func 需要修饰的函数
 * @return ()=>{}
 * designer: heyunjiang
 * time: 2018.5.8
 */
const _hocArrayVerify = (func)=>{
  return (data)=>{
    if(data&&!Array.isArray(data)) {
      console.error('param is not an array for '+ func.prototype.constructor.name +' method')
    } else {
      return func(data)
    }
  }
}
```

**高阶组件的思想**

目的就是为需要封装的组件进行预操作，预操作可能包含参数验证、插入参数、闭包状态控制

1. 本身作为一个函数
2. 返回一个函数
3. 返回函数接收实际参数
4. 返回函数执行时，首先进行验证，同时执行被包裹组件函数
5. 高阶组件就是一个没有副作用的纯函数，高阶组件既不会修改input原组件，也不会使用继承复制input原组件的行为(引用自react官网)

**注意点**

1. 在执行被包裹组件函数的时候，使用 `return` 可以让高阶组件链式调用 
