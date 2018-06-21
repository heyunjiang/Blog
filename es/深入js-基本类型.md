# js 基本类型

关键词：`类型`、`内存`、`指针`

目录

1. 7大变量类型
2. 值类型与引用类型
3. 如何理解js中参数都是按值传递

## 1 7大变量类型

boolean, number, string, null, undefined, object, symbol

### 1.1 number

#### 1.1.1 number 一些知识点

`Infinity`：表示正无穷大的值

原型方法(实例方法)

1. Number.prototype.toString(): number -> string
2. Number.prototype.toFixed(): number -> string，保留小数点后几位
3. Number.prototype.toExponential(): number指数表示法，保留小数点后几位
4. Number.prototype.toPrecision(): number -> string，保留几位有效位
5. Number.prototype.toLocaleString(): number -> string

对象方法、属性

1. Number.parseInt(): string -> number 取整
2. Number.parseFloat(): string -> number 可以是浮点数
3. Number.isFinite(): 检测是否是有效数字
4. Number.isInteger(): 检测是否是整数，但是必须在53个二进制位之间，如果超过只会判断53位之间的
5. Number.isNaN()
6. Number.isSafeInteger(): 检测是否是安全整数，-(2^53 - 1) 到 (2^53 - 1) 之间
7. Number.MIN_VALUE: javascript能够表示的最小值
8. Number.MAX_VALUE: javascript能够表示的最大值
9. Number.MIN_SAFE_INTEGER：javascript能够表示的最小安全整数
10. Number.MAX_SAFE_INTEGER：javascript能够表示的最大安全整数
11. Number.EPSILON: 表示1到大于1的最小浮点数之间的差，因为js浮点数的计算是不准确的，引入 `EPSILON` 是用于表示误差能够接受的最小范围，如果在这个范围内，表示没有误差，例如 `(0.1+0.2-0.3)<Number.EPSILON // true`，这样就能判断浮点数运算的准确率了

#### 1.1.2 number 多种进制表示法

1. 二进制：`0b` 或 `0B`，0b111110111 === 503 // true
2. 八进制：`0o` 或 `0O`，0o767 === 503 // true (不再允许0开头了)
3. 十进制：`13`
4. 十六进制：`0x`

#### 1.1.3 number 的存储方式

整数和浮点数采用同样的存储方法，都采用 IEEE 754 标准(其他大多数语言同样)，数值存储为64位双精度格式，但是在js中，数值精度最多可以达到53个二进制位(1个隐藏位与52个有效位)，超过限度的会被丢弃。

#### 1.1.4 Math 扩展

1. Math.trunc(): 用于去除一个数的小数部分，返回整数部分，类似Number.parseInt()
2. Math.sign(): 用于判断一个数的正负值，返回值：`1, -1, 0, -0, NaN`
3. Math.cbrt(): 计算一个数的立方根，同等：`Math.pow(Math.abs(x), 1/3)`
4. Matn.clz32(): 返回一个数的32位无符号整数形式有多少个前导0，例如：`Math.clz32(0) // 32  Math.clz32(1) // 31  Math.clz32(1000) // 22`
5. Math.imul(): 返回2个数以32位带符号相乘的结果，因为js最多表示2^53，这里2个32位相乘就可以正常表示
6. Math.fround(): 返回一个数的32位单精度浮点数形式。主要作用，将64位双精度浮点数转为32位单精度浮点数
7. Math.hypot(): 返回所有参数的平方和的平方根(执行勾股定理)
8. Math.expm1(): `e^x - 1`，即 `Math.exp(x) - 1`
9. Math.log1p(): 返回 `1 + x` 的自然对数，即 `Math.log(1 + x)` (Math.log默认采用 e 为底数)
10. Math.log10(): 返回以 `10` 为底的x对数，如： `Math.log10(1) // 0`
11. Math.log2(): 返回以 `2` 为底的x对数，如： `Math.log2(1) // 0`
12. Math.sinh(): 正弦
13. Math.cosh()：余弦
14. Math.tanh()：正切
15. Math.asinh()：反正弦
16. Math.acosh()：反余弦
17. Math.atanh()：反正切

问题：这里的64位双精度，32位单精度是什么意思？与对应数值精度有什么关系？(64位双精度对应54,32位单进度对应24)

#### 1.1.5 指数运算符

`**` : `2 ** 2 //4`

### 1.2 函数

## 2 值类型与引用类型

值类型：boolean, number, string, null, undefined, symbol

引用类型：object (object, function, array)

问：什么是引用类型？

答：引用类型的数据，其真实值在内存中分配一个地址001，然后我们访问的都是这个001地址，就是说为我们的变量分配的值是这个地址001，它作为一个指针，指向真实值。

## 3 如何理解js中参数都是按值传递

原则：在javascript中的参数传递都是按值传递

理解：这里的值，值得是变量的值。js的类型分为基本类型与引用类型，传的实参赋值给形参，就是把实参的值复制给形参。如果 `var obj = {}`，通常我们所说的 obj 的值是一个对象，其实这种说法是错误的，正确说法 obj 的值对这个对象的引用，因为这个 obj 变量在内存中对应的值是一个指针，这个指针就是这个对象 `{}` 的内存地址，所以说 obj 它是对这个对象的引用。那么如果将 obj 作为实参传递给函数，其实传递的是 obj 的值(指针)，也就是 `{}` 的内存地址。

```javascript
const arr = [{"hello": 'world'}, {"hello": 'world'}]
console.log(arr === arr, arr[0] === arr[1]) //true, false
```
