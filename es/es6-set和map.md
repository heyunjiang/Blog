# es6 set和map

time: 2021.3.11  
author: heyunjiang

## 背景

在阅读 vue3 源码时，看到 track 收集依赖时，广泛使用了 Map, weakMap 数据结构，之前自己是熟悉使用 array, object 来操作。  
现在总结一下 set, map 的基础语法，对比 array, object 来看有什么优点

## 1 基础语法

Set, Map 作为宿主环境提供的全局对象，是作为构造函数使用 `const s = new Set()`

### 1.1 Set

构造函数接受数组或具有 iterable 接口的其他数据结构，并且数组的每一项要求是对象

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
2. WeakSet 添加的对象，属于对对象的弱引用，垃圾回收器不会考虑它的影响
3. WeakSet 不能遍历，也没有 size 属性，因为内部弱引用的对象随时可能被垃圾回收器回收掉，无法保证遍历时对象是否存在，可能遍历之后对象就消失了

WeakSet 支持的方法  
1. weakset.add()
2. weakset.delete()
3. weakset.has()

### 1.3 Map

Object 要求只能以 string 作为 key，而 Map 对象是支持任意值作为 key，包括非 string 的所有类型  
Map 构造函数要求是数组或具有 iterable 接口的其他数据结构，并且数组的每一项要求是 length = 2 的数组，分别代表 key, value

实例属性和方法  
1. map.size：返回内部成员总数
2. map.set(key, value): 这点和 set.add() 不同
3. map.get(key): set 没有
4. map.has(key)
5. map.delete(key)
6. map.clear(): 同 set 一样，清除所有成员
7. map.keys()
8. map.values()
9. map.entries()
10. map.forEach()

注意事项  
1. 只有对同一个对象的引用，也就是内存地址一样，map 才会视为同一个键
2. 同 set 一样，Map 的遍历顺序就是插入顺序

### 1.4 WeakMap

和 Map 不同点  
1. WeakMap 只接受对象作为 key
2. WeakMap 添加的对象，属于对对象的弱引用，垃圾回收器不会考虑它的影响
3. WeakMap 不能遍历，也没有 size 属性，因为内部弱引用的对象随时可能被垃圾回收器回收掉，无法保证遍历时对象是否存在，可能遍历之后对象就消失了

这些不同点和 WeakSet 一样

## 2 weak 应用场景

set, map 在日常项目中就会用到，因为它能带给我们 array, object 不能提供的能力  
但是 weak 的大特性是其对内部对象的弱应用，有哪些使用场景呢？  
文档说的是对 dom 元素的引用，那我再看完 vue3 track 收集依赖再来回答这个问题
