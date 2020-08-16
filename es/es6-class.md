# class

time: 2020.8.3  
author: heyunjiang

## 背景

之前一直习惯与使用 function + prototype 来实现面向对象，加上 vue 2.x 也是这么实现，自己在 react 项目中，也没有过多使用 class，也仅限于普通使用。

学习动力：  
1. gantt-canvas 内部使用 class 定义对象，如何拆分属性并组合，这个是迫切的问题
2. vue 3.x 开始使用 class 替代 prototype 了
3. nodejs 都是使用 class

## 1 class 基础知识总结

1. 关键字 `class`
2. class 属于 es5 的 `语法糖`：js 基本类型没有 class，通过 typeof 判断一个 class，返回的是 `function`
3. 一个类必须有 `constructor` 方法
4. `prototype`：class 也有 prototype 属性，所以可以通过这个属性为 class 扩展属性和方法
5. 实例属性写法：写在 constructor 方法内部；在 class 内层顶部通过 `hello = "world"` 定义
6. 私有方法：约定通过 `_` 开头
7. 私有属性：约定通过 `#` 开头，私有方法也可以通过 `#` 开头
8. new.target：返回 class 对象名称，可以用于限定当前对象必须通过 new 访问、当前对象必须被继承实例化

## 2 static 关键字

用于指明静态方法

1. 通过 class.method 直接调用，不可通过 new 被实例使用
2. 可以被子类继承
3. 可以同时存在同名的 普通方法和静态方法，因为2者调用方式不一样
4. this 指向：static 方法 this 指向 class 本身，而普通方法 this 指向的是实例对象
5. `super`：super 关键字，表示类的一个全局对象，可以访问类的静态方法(非静态方法直接通过类名访问会报错)

静态属性：static hello = "world" 目前只是一个提案

## 3 继承

1. 通过 `extends` 关键字继承
2. 子类的 constructor 内部首行必须执行 `super()` 方法，代表调用父类的 constructor 方法，用以建立父类的属性和方法，生成 this 对象。不过此刻父类的 constructor 内部的属性 this 指向的是子类的实例对象了，也就是构建子类的 this 实例对象
3. `this` 对象实现方式差异：与 es5 不同的是，es6 class 对于 this 的实现，是将父类实例对象的属性和方法添加到子类的 this 对象上，然后由子类去修改
4. 静态方法会被继承：但是不会被实例化对象访问
5. `super` 对象：访问 `super.x` 表示访问的 `父类实例 | 父类原型` 的方法，也就是 `A.prototype.x`，注意不是父类的方法。而设置属性时 `super.x` 设置，此刻修改实例的属性，修改的也是子类 this 对象的属性，因为子类在 constructor 中通过 `super()` 将父类实例的属性，全部绑定在自身实例的 this 对象上了，所以 `super.x === this.x` 2者设置属性值都是一样的。(通常不建议使用 super 设置值，super 只用于读取值)
6. `prototype` 和 `__proto__` 属性：实例的 __proto__ 属性指向父类的 prototype 属性，而对象本身的 __proto__ 属性指向的是父类本身，es5 和 es6 都是一样
