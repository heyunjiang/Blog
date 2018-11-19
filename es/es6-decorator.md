# decorator 学习总结

time: 2018.4.17

之前也简单学习过，知道它对类可以实现一层装饰，扩展类的行为、属性

问题：decorator 与 高阶函数的异同

上次面试，别人问到我这个问题，当时没有回答上来，都对这2个东西只是简单的了解，没有熟练的使用，没有去掌握其中的原理，一直是心中的一个遗憾

## derocrator 实现了什么功能

1. 对类的修饰，类名为第一个参数，修饰的是类的实例，不是直接操作的类，但是可以通过 `实例.prototype` 操作原型
2. 对类的属性修饰 (方法也是类的属性，类的属性的值有bool、number、function等，就是js的7大类型)
3. 不能用于函数，这个就是跟高阶组件最大的区别

**core-decorators** : 可用的第三方模块，提供常用的几种decorator：this绑定、readonly、父类方法覆盖判断

**基本格式**

```javascript
@decorator
class A {}

// 等同于

class A {}
A = decorator(A) || A;
```

### 1. decorator 传参 vs 不传参

**不传参**

> 默认需要修饰的类为第一个参数，这里的target，可以操作target.prototype增添属性

```javascript
@testable
class MyTestableClass {}

function testable(target) {
  target.isTestable = true;
}

MyTestableClass.isTestable // true
```

**传参**

```javascript
function testable(isTestable) {
  return function(target) {
    target.isTestable = isTestable;
  }
}

@testable(true)
class MyTestableClass {}
MyTestableClass.isTestable // true

@testable(false)
class MyClass {}
MyClass.isTestable // false
```

> 2者区别：decorator构造嵌套函数层级不同; 需要传参的decorator在使用的使用，相当于执行了一次 `@testable(true)`

### 2. 执行时机

decorator作为es6的语法，目前在常规浏览器中不能直接使用，所以它的执行，是在编译阶段执行的

### 3. 对类的属性的修饰

```javascript
class Person {
  @readonly
  name() { return `${this.first} ${this.last}` }
}
```

这里的 readonly 修饰类Person的name属性，它是怎么定义的呢？

```javascript
function readonly(target, name, descriptor){
  descriptor.writable = false;
  return descriptor;
}
```

用于修饰类的属性的decorator接收的为3个参数，这个是直接操作的类，不是它的实例，因为这个时候类还没有实例化，参数说明：

1. target: 修饰的类的原型，`Person.prototype`
2. name: 修饰的属性名称，这里是 `name`
3. descriptor: 修饰的属性的描述对象(descriptor包含了属性的枚举、值等)

### 4. decorator不可用于函数

阮一峰大神说的是存在函数提升，在声明函数的时候，decorator还没有被赋值，所以不可以作用于函数。

> 注：在使用 `babel-plugin-transform-decorators` 的时候，提示错误: `Leading decorators must be attached to a class declaration`，看来decorator还是只支持修饰类

```javascript
var counter = 0;

var add = function () {
  counter++;
};

@add
function foo() {
}
```

解释：为什么这里就不能成功呢？因为函数 `foo` 会存在函数提升，如果这里的 foo 是 `class foo {}` 就不会存在类提升。首先会函数提升，此时add的值都还是 `undefined` 。

> 问：这个解释有问题， decorator 的执行阶段是在编译阶段。

想要对函数进行处理，直接使用HOC包装就可以了，例如

```javascript
function doSomething(name) {
  console.log('Hello, ' + name);
}

function loggingDecorator(wrapped) {
  return function() {
    console.log('Starting');
    const result = wrapped.apply(this, arguments);
    console.log('Finished');
    return result;
  }
}

const wrapped = loggingDecorator(doSomething);
```

### 5. mixin & trait

2者主要功能：都是修饰器，可以为类增加属性，扩展类

但是trait更能强大，mixin自己写，trait使用第三方库 `traits-decorator` ，它提高了防止同名方法重复、排除方法及方法别名等功能

### decorator vs HOC(高阶组件)

相同点

1. 都能作用于类
2. 都能作用于类的属性

不同点

1. decorator只能作用于类，不能作用于普通方法，这是由es6及 `babel-plugin-transform-decorators` 限制了的，而HOC可以作用于普通方法 
2. 问题: decorator和HOC是否会对被修饰(组装)的方法的this指向问题，需要待尝试

> 绑定运算符（::）
