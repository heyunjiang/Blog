# 内存管理与垃圾回收

time: 2019.01.22

> 在此之前，我也是认为 javascript 宿主环境会自己实现垃圾回收，开发人员不用去管理内存的释放

## 1 内存分配

当我们为一个变量赋值时，普通类型的就直接分配一个内存，对象类型的就需要为对象及其值都分配内存，也就是会存在一个地址，该地址指向具体的值。这些都是基础知识，不用过多记录。

## 2 垃圾回收

高级语言的解释器(宿主环境中的)嵌入了垃圾回收器，但是没有办法明确知道什么时候不再用它了，只能做一个近似的判断，所以在大型项目中，如果不主动回收内存，会存在很多内存被浪费了。

垃圾回收算法目前有2种：引用计数、标记清除

引用计数：判断一个对象是否有指向它的引用，如果没有，则表示该对象不再被需要了。因为存在一个循环引用问题，该算法已经被废弃。

标记清除：从根部(在 js 中就是全局对象)出发，定时扫描内存中的对象，凡是能够从根部到达的对象，则保留，否则无法触及到的对象则标记为 `无法到达的对象` ，稍后清除。

内存释放：`hello = null`

特殊：es6 提供了 WeakSet 和 WeakMap，表示对象的弱引用，是不计算入垃圾回收机制的。

## 3 内存泄漏

对于持续运行的服务进程，必须及时释放不再用的内存，否则内存占用越来越高，轻则影响系统性能，重则进程崩溃。

内存泄漏：对于不再使用到的内存，没有及时释放。

要知道内存泄漏的原理，就需要熟悉 `标记清除` 这个垃圾回收算法，总结一下它的特点

1. 从全局对象出发，垃圾回收器创建了一个 root 列表
2. 递归遍历检查，能达到的标记为激活，不能达到的标记为失效，稍后回收

****

四种常见的js内存泄漏

### 3.1  意外的全局变量

创建了额外的全局变量，没有使用了，垃圾回收器不会主动回收。

通常未定义的变量也叫做全局变量：

```javascript
function hello() {
    world = 'hello world';
}
```

解决方案：

1. 使用严格模式 `"use strict"`
2. 使用完毕将全局变量赋值为 `null`

问题：垃圾回收器既然从全局对象出发，这种定义的全局变量也是挂载在全局对象上的，为什么不主动回收呢？  
猜想：垃圾回收器从全局对象出发，必须要是显示声明 `window.hello` 才行

### 3.2 setInterval 定时器

如果使用 setInterval 定时任务，但是最后又不需要了，却没有清除它，则会造成内存泄漏

### 3.3 脱离 dom 的引用

```javascript
let hello = document.getElementById('button');
document.body.removeChild(document.getElementById('button'));
```

此刻 hello 还是保存了这个按钮对象，虽然按钮对象已经不再 dom 树中了。

### 3.4 闭包

```javascript
var theThing = null;
var replaceThing = function () {
  var originalThing = theThing;
  var unused = function () {
    if (originalThing)
      console.log("hi");
  };

  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log(someMessage);
    }
  };
};

setInterval(replaceThing, 1000);
```

不是所有定义了没有用的变量都会被垃圾回收器回收，如果该变量值是一个函数对象，函数内部引用了其他变量，构成闭包，那么即使该变量没有地方用到，也不会被垃圾回收器回收，会因为引用了其他变量的原因，持久保存在内存中，需要人为手动释放。

## 4 学习内存泄漏的意义

1. 规范写法
2. 提升解决问题能力

## 参考文章

[mdn 内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management)  
[github 木易杨 内存机制](https://github.com/yygmind/blog/issues/15)  
[github 木易杨 内存泄漏及如何避免](https://github.com/yygmind/blog/issues/16)
