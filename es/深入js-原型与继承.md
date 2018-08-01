# 原型与继承

**关键词**：`构造函数`、`原型`、`实例`、`原型链`、`继承`

目录

1. 原型链
2. 实现继承的3种方式

> 原型：也称为实例原型，是一个对象，构造函数的 `prototype` 属性指向的就是原型，由构造函数创建的实例有个 `__proto__` 属性，指向的也是原型

## 1 原型链

![prototype](./prototype.png)

## 2 实现继承的3种方式

继承的本质：一个对象获取另一个对象的属性

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

### 2.2 直接对象继承

 `var children = Object.create(obj)`，这里obj为直接对象 `{}`

### 2.3 函数式继承

在函数内部对 parent 对象操作，返回一个新对象 children，children 选择性获取 parent 的部分属性

> 说明：第3种方式与前2种有很大的区别，前2种都继承了父亲的所有属性，第三种继承部分父亲属性，并且可以隐藏操作细节，不允许实例直接访问属性值，实现对父亲属性的保护，通过闭包。
