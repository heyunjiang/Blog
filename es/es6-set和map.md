# es6-set和map

time: 2021.3.11  
author: heyunjiang

## 背景

在阅读 vue3 源码时，看到 track 收集依赖时，广泛使用了 Map, weakMap 数据结构，之前自己是熟悉使用 array, object 来操作。  
现在总结一下 set, map 的基础语法，对比 array, object 来看有什么优点

## 1 基础语法

Set, Map 作为宿主环境提供的全局对象，是作为构造函数使用 `const s = new Set()`

### 1.1 Set

构造函数接受数组或具有 iterable 接口的其他数据结构

实例属性和方法
1. set.size: 返回内部成员总数
2. set.add()
3. set.delete()
4. set.has()
5. set.clear()
6. set.keys()
7. set.values()
8. set.entries()
9. set.forEach()

特点  
1. keys 和 values 返回结果一致，因为 set 没有键名，只有键值。entries 的2个参数也是一样的
2. set 的遍历顺序就是插入顺序，也就是说通过4个原型遍历 set 结构，是按原顺序的，这点和 Object.prototype.forEach 的遍历不确定性是不同的
3. 也可以通过 ... 和 for of 遍历

### 1.2 WeakSet

和 Set 不同点  
1. WeakSet 只支持对象
2. 
