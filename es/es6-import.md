# import

time: 2018.9.11  
designer: heyunjiang

说明：一直对于 export、module.export、import、require 等的用法模糊不清，今天特地总结一下

## es6 模块化

设计思想是尽量的静态化，在编译的时候就能确定模块的依赖关系，以及输入和输出的变量，具体该怎么写呢？

曾经的 CommoneJS 和 AMD 模块，是在运行时确定的关系，因为这2者都是属于一种奇技淫巧，是在 js 层面搞的，而 es6 则是在 nodejs 层面搞的

### 1 import vs require

`let { stat, exists, readFile } = require('fs');`

使用 require 会把所有 fs 模块引入，然后再从 _fs 对象上读取这3个方法；

`import { stat, exists, readFile } from 'fs';`

使用 import ，会在编译时引入这3个模块，不会全部引入 fs 模块

所以，这2者的主要区别是

1. require 引入的是一个对象，import 引入的就是那3个模块
2. require 属于动态引入，import 属于静态引入，是在编译的时候就决定引入哪些模块的

### 2 export

不能写成

```javascript
// 写法一
const hello = 1;
export hello;
```

可以写成

```javascript
// 其他写法
export const hello = 1;

// 或者

const hello = 1;
export {hello}
```

问： 为什么写法一就不行呢？

答： export 输出必须为一个接口，不能输出一个值

> export 不能用在块级作用域中，只能位于顶层

### 3 export default

在模块中可以指定任意多个 `export { hello }` ，但是只能有一个 `export default hello`;

对应 import ，如果是 `export { hello }` ，则要采用 `import { hello } from ''` 方式；

如果是 `export default` ，则不用加大括号，采用 `import hello from ''`

### 4 commonjs vs es6

commonjs: `module.exports = {}` `require()`

es6: `export {}` `import from`

> 注意：最好不要混合加载
