# Symbol

## 1 关键点

1. 第7种类型

```javascript
let s = Symbol();

typeof s
// "symbol"
```

2. 唯一

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

3. 不能与其他类型进行运算

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
