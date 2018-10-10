# 关于 export default 结合 require 适用问题

常规模块导出有 `export default` 和 `module.exports`，一个是 es6 提供的，一个是 webpack 默认提供的 commonjs 语法，对应的引入有 `import` 和 `require`

## 1. 问题描述

基本环境： webpack4.1.2 babel-preset-env1.7.0

test.js

```javascript
export default {
  hello: 'world'
}
```

index.js

```javascript
const test = require('./test')
import test1 from './test'
console.log(test, test1)
```

**期望都输出**

```javascript
{
    hello: "world"
}
```

**最终输出**

```javascript
{
    default: {hello: "world"},
    __esModule: true,
    __proto__: Object
}
{
    hello: "world"
}
```

## 2. 分析

为什么 `require` 和 `import` 就不同呢？

**猜想-原因1**：webpack4对 `require` 的实现问题

我把webpack版本降低一下

结果：降低到 3.10.0 和 2.7.0 还是一样的结果，我换到另一个项目相同的webpack版本，也一样，另一个项目可以正常显示

看来与webpack版本无关

**猜想-原因2**: 本来就该是这样子，之前能成功是 `roadhog` 对 require 进行了扩展或重写

time: 2018.6.4

答： es6 与 commonjs 最好不要混合使用

update: 2018.10.08
