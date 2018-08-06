# Symbol

目录

1. 关键点
2. 作为属性名的遍历
3. Symbol.for() Symbol.keyFor()
4. 内置的Symbol值

## 1 关键点

1 第7种类型

```javascript
let s = Symbol();

typeof s
// "symbol"
```

2 唯一

```javascript
// 没有参数的情况
let s1 = Symbol();
let s2 = Symbol();

s1 === s2 // false

// 有参数的情况
let s1 = Symbol('foo');
let s2 = Symbol('foo');

s1 === s2 // false
```

3 不能与其他类型进行运算

```javascript
let sym = Symbol('My symbol');

"your symbol is " + sym
// TypeError: can't convert symbol to string
`your symbol is ${sym}`
// TypeError: can't convert symbol to string
```

但是可以转为字符串和布尔值，不能转为数字

```javascript
let sym = Symbol('My symbol');

String(sym) // 'Symbol(My symbol)'
Boolean(sym) // true
```

4 作为属性读取

不能使用 `.` 读取，因为对象通过 . 读取，后面是只能是字符串，对于变量，只能是 `obj[mySymbol]` 方式

> 魔术字符串：在代码中多次出现，作为一个具体的值(string | number)，应该尽量消除魔术字符串，改由清晰的变量代替

5 Symbol.iterator

任意实现了该接口的数据结构，都可以遍历，例如使用 `for of` ， `...`

已知实现该接口的有：array, generator, Set, Map

未实现该接口的有：object, 普通函数

> 基础类型就不用说了，比如 boolean, string, number, undefined, null

## 2 作为属性名的遍历

由于 `for..in` 、 `for..of` 、 `Object.keys()` 、 `Object.getOwnPropertyNames()` 、`JSON.stringify()` 会过滤掉 Symbol 作为的属性名字段

遍历 `Symbol` ：`Object.getOwnPropertySymbols()`、`Reflect.ownKeys()`

```javascript
// Object.getOwnPropertySymbols()
const obj = {};
let a = Symbol('a');
let b = Symbol('b');

obj[a] = 'Hello';
obj[b] = 'World';

const objectSymbols = Object.getOwnPropertySymbols(obj);

objectSymbols
// [Symbol(a), Symbol(b)]
```

```javascript
// Reflect.ownKeys()
let obj = {
  [Symbol('my_key')]: 1,
  enum: 2,
  nonEnum: 3
};

Reflect.ownKeys(obj)
//  ["enum", "nonEnum", Symbol(my_key)]
```

## 3 Symbol.for() Symbol.keyFor()

Symbol是用于表示唯一的值，及时是 `Symbol()` 这样构建的2个变量，也是不相等的。有时又需要通过字符串去调用一个Symbol，就需要用到 `Symbol.for()`

```javascript
Symbol.for("bar") === Symbol.for("bar")
// true

Symbol("bar") === Symbol("bar")
// false
```

`Symbol.keyFor()` 返回一个使用 `Symbol.for("bar")` 创建的 Symbol 类型的 `key` ，比如这里就返回 `bar`

```javascript
let s1 = Symbol.for("foo");
Symbol.keyFor(s1) // "foo"

let s2 = Symbol("foo");
Symbol.keyFor(s2) // undefined
```

**注意**：使用 `Symbol.keyFor()` 创建的值，是全局环境，可以在不同的iframe及worker中访问

## 4 内置的Symbol值

1 `Symbol.hasInstance`: 作为构造器的属性，当它的实例调用 `instanceof` 时，其实调用的是对象的这个方法

```javascript
class MyClass {
  [Symbol.hasInstance](foo) {
    return foo instanceof Array;
  }
}

[1, 2, 3] instanceof new MyClass() // true

// 其实调用的就是 MyClass[Symbol.hasInstance]([1, 2, 3])
```

2 `Symbol.isConcatSpreadable`:用以决定数组使用 `concat` 方法是，是否展开

```javascript
let arr1 = ['c', 'd'];
['a', 'b'].concat(arr1, 'e') // ['a', 'b', 'c', 'd', 'e']
arr1[Symbol.isConcatSpreadable] // undefined

let arr2 = ['c', 'd'];
arr2[Symbol.isConcatSpreadable] = false;
['a', 'b'].concat(arr2, 'e') // ['a', 'b', ['c','d'], 'e']
```

3. `Symbol.species`: 作为构造器的属性，用以解决衍生对象的原型问题

```javascript
class MyArray extends Array {
  static get [Symbol.species]() { return Array; }
}

const a = new MyArray();
const b = a.map(x => x);

b instanceof MyArray // false
b instanceof Array // true
```

如果不在 MyArray 中指定 `Symbol.species` 属性，那么由 a 生成的 b ，也应该是 MyArray 的实例

主要用途：有些类库是在基类的基础上修改的，如果子类使用继承的方式，作者希望返回基类的实例，而不是子类的实例

与 `Symbol.hasInstance` 的关系：2者都可以判断实例的原型，但是 `Symbol.species` ，是在实例调用自身的构造函数时，会调用 `Symbol.species` 指定的对象，功能更加强大一点

> 其他的内置 Symbol 值在学习了class之后，再回来总结，不然现在总结起来太辛苦了
