# 原型与继承

**关键词**：`构造函数`、`原型`、`实例`、`原型链`、`继承`

目录

1. 原型链
2. 实现继承的3种方式
3. 原型对象注意事项

> 原型：也称为实例原型，是一个对象，构造函数的 `prototype` 属性指向的就是原型，由构造函数创建的实例有个 `__proto__` 属性，指向的也是原型

## 1 原型链

由原型组成的一条链，原型为一个对象，它有 `__proto__` 属性，指向父类的 `prototype` 属性

![prototype](./prototype.png)

`__proto__`：该属性是任何对象都有的属性

`prototype`: 该属性是函数才有的属性

## 2 实现继承的3种方式

继承的本质：一个对象获取另一个对象的属性

> 一个对象的属性，通常是保存在原型上，所以说继承也可以说是子类原型获取父类原型属性

### 2.1 伪类继承

`children.prototype = new Parent()`

比如 react 中实现的继承

```javascript
createClass: function(spec) {
    var Constructor = function(initialProps, children) {
      this.construct(initialProps, children);
    };
    Constructor.prototype = new ReactCompositeComponentBase();
    Constructor.prototype.constructor = Constructor;
    mixSpecIntoComponent(Constructor, spec);
    invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    );

    var ConvenienceConstructor = function(props, children) {
      return new Constructor(props, children);
    };
    ConvenienceConstructor.componentConstructor = Constructor;
    ConvenienceConstructor.originalSpec = spec;
    return ConvenienceConstructor;
}
```

> 问题：为什么 `Constructor.prototype.constructor = Constructor;` 单独设置 constructor 属性呢？  
> 答：在实例化后，实例.__proto__.constructor 指向的是原函数类。伪类继承，目的是完全获取父类 prototype 上的值，但是不想获取不该要的 constructor 属性。

### 2.2 直接对象继承

 `var children = Object.create(obj)`，这里obj为直接对象 `{}`

### 2.3 函数式继承

在函数内部对 parent 对象操作，返回一个新对象 children，children 选择性获取 parent 的部分属性

> 说明：第3种方式与前2种有很大的区别，前2种都继承了父亲的所有属性，第三种继承部分父亲属性，并且可以隐藏操作细节，不允许实例直接访问属性值，实现对父亲属性的保护，通过闭包。

## 3 原型对象注意事项

```javascript
function Hello() {}

Hello.prototype.world = 'hello world';

const hello = new Hello()
```

### 3.1 原型是一个对象

原型，怎么获取原型，怎么看？

构造器 Hello.prototype 和实例 hello.__proto__ 属性都是指向原型对象

原型对象：包含构造器和 __proto__ 属性，该属性指向 Object，构造器就是 Hello 函数。

```javascript
{
  world: "hello world",
  Constructor: Hello(),
  __proto__: Object
}
```

### 3.2 实例没有 prototype 属性

prototype 是只存在于构造器中，实例不具备这个属性，实例具有 __proto__ 属性，指向原型对象。

所以说，构造器的 prototype 属性和实例的 __proto__ 属性，都指向原型对象。

### 3.3 构造器也有 __proto__ 属性

构造器也是 Function 的实例，它自然也有原型对象 `Hello.__proto__ === Function.prototype;//true`

问： 构造器的 __proto__ 属性，与构造器原型对象的 __proto__ 属性什么关系？

答： 并没有什么关系。构造器原型对象的 __proto__ 指向的是 Object 的原型对象。反而构造器原型对象的 constructor 的 __proto__ 属性，它就是构造器的 __proto__ 属性，即 `Hello.__proto__ = Hello.prototype.constructor.__proto__`
