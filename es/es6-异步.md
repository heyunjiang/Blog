# generator、promise、async

time: 2018.8.02

## 1 promise

promise 作为异步编程的一种解决方案

## 2 generator

> generator 是 es6 提供的一种异步变成的解决方案

generator是一个状态机，内部保存的是多个状态

****

### 2.1 例子

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();
hw.next();
hw.next();
hw.next();
hw.return();
```

****

### 2.2 特性

1. 函数名 * 开头：但是不限制写在具体位置，只要在函数名之前就行
2. yield 表达式：函数执行暂停标志
3. generator 函数调用方式与普通函数一样，但是它不立即执行，返回的是一个指向内部状态的指针对象，也就是generator的遍历器对象，该对象实现了 Symbol.iterator 接口。每次获取下一个状态，需要调用这个遍历器对象的 `next` 方法，获取到的状态是一个对象，如 `{value: "hello", done: false}`
4. 因为 generator 函数执行返回的是一个实现了 iterator 接口的对象，可以直接赋值给对象的 iterator 属性，就可以使用 for of , ... 遍历了

### 2.3

> 学完 generator 的第一个部分简介了

## async
