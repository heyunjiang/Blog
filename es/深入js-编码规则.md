# 编码规则

这里为什么要总结这篇文章，因为编码在平时用的很少，但是也算是弥补了自己内心对js编码这一块的空缺，让自己以后面对编码不再恐惧，自己也明白了js采用unicode字符集和utf-16编码

**关键词**：字节、fromCodePoint、codePointAt、encodeURI、encodeURIComponent

## 1 基础知识

javascript 采用 `unicode` 字符集；平时编码我们采用 `utf-8` 编写代码，用以保证在所以国家网页正常展示；但是存储在内存中的数据，javascript 采用 `UTF-16` 编码，也就是 `UCS-2`编码方式

### 位、字节、字关系

位：`bit` , 计算机存储数据的最小单位，每一位状态只能是0或1

字节：`Byte` , `1Byte = 8bit` ，计算机存储的基本计量单位(与bit最小存储单位不同)。1个字节存储1个英文字母和半个汉字，即 `1Byte = 1字母`，`2Byte = 1个汉字`

字：8位机，字长8位，`1个字 = 8位 = 1Byte`；16位机，字长16位，`1个字 = 16位 = 2Byte`。计算机数据处理和运算的单位

## 2 编码类型

### 2.1 ASCII

编码范围：大写字母、小写字母、一些符号，仅支持英文，不支持汉字等其他语言

编码长度：一个字节

### 2.2 Unicode

编码范围：所有语言，包括汉字、英文、韩文等

编码长度：2个字节(如果非常偏僻的字符，4个字节)，现在长度已经不止2字节了

概念：作为一种编码方法，为每种语言中的每个字符设定了统一并且唯一的二进制编码。

存储：所有的文字都采用2个字节存储，二进制，英文编码高位字节填0

**表示**：`\u` + 一组十六进制。这里十六进制长度分多个平面，第0号平面采用4位十六进制，1号平面采用5位或6位，其他平面更长。第0号平面最重要，中文的范围为 `4E00-9FA5`。

> `\` 是为了转义，`一组`表示可能是多个十六进制
> javascript 允许直接采用unicode表示直接表示字符

例子：`"\u0061" // "a"`

码点：unicode表示后面的十六进制就是码点，`0061`就是码点

### 2.3 utf-8

编码范围：所有语言，包括汉字、英文、韩文等

编码长度：可变长编码。常用 `英文字母 = 1Byte`，`汉字 = 3Byte`，生僻字符编码成4-6个字节

存储：跟unicode不同，采用可变长字节数存储，二进制

> 作为unicode的子集，2者存储方式不同

设计目的：扩展unicode，通过屏蔽位和移位操作实现快速读写，增加排序、查找等速度

**utf-8作为unicode的子编码**

### 2.4 utf-16

编码范围：所有语言，包括汉字、英文、韩文等

编码长度：可边长编码，最少2byte

## 3 javascript 中的编码

javascript 采用 unicode 字符集，utf-16 编码

### 3.1 fromCharCode、fromCodePoint

`String.fromCharCode`：unicode字符(它的10进制表示法) -> 字符串

`String.fromCharCode(65,66,67) //A, B, C`

`String.fromCodePoint`: unicode字符(它的10进制表示法) -> 字符串 ，比 fromCharCode 更全面，es6新增的

### 3.2 charAt、charCodeAt、codePointAt

`String.prototype.charAt` : 返回字符串中索引字符 `"hello".charAt(0) //h`

`String.prototype.charCodeAt` ：返回字符串中索引字符对应的unicode字符 `"ABC".charCodeAt(0) //65`

`String.prototype.codePointAt` ：返回字符串中索引字符对应的unicode字符 `"ABC".codePointAt(0) //65`，比 charCodeAt 更全面，es6新增的，`'𠮷'.codePointAt(0).toString(16) //20bb7`

> 这里的65是十六进制的10进制表示法，转化成16进制应该是41，因为unicode采用的是16进制表示法。这一点在mdn上没有明确说出来，需要注意

```javascript
'A'.codePointAt(0) //65
'A'.codePointAt(0).toString(16) //41
'\u0041' // A
'\u{41}' // A
```

> codePointAt 与 fromCodePoint 互补

### 3.3 decodeURI、encodeURI、decodeURIComponent、encodeURIComponent

`encodeURI` ：对URI整体编码，替换所有部分字符，不能被替换的 `& + = #` 等

`encodeURIComponent` ：对URI整体编码，用1到4个转义序列来表示这些需要编码的字符，但是它能替换 `& + = #` 等。它会将参数当做uri的尾部参数进行编码

**2者相同点**

都是对URI编码

**2者不同点**

1. 编码范围不同： encodeURI 不会对 `; , / ? : @ & = + $ 字母 数字 - _ . ! ~ * ' ( ) #` 编码， encodeURIComponent 不会对 `字母、数字、(、)、.、!、~、*、'、-和_` 编码。所以 encodeURIComponent 编码范围更广

2. 应用场景：如果需要在编码后，再使用这个url，那么使用 encodeURI ，如果需要对 uri 的参数进行编码，使用 encodeURIComponent

> 问题：他们是将什么格式的编码转义成什么格式的编码？

答：unicode -> 16进制的转义序列

### 3.4 escape、unescape

针对字符串，已经被废弃，使用 encodeURI、encodeURIComponent 替代

### 3.5 btoa、atob

> 主要用于base64操作

btoa： 将字符串(ASCII编码)转换成base64编码

atob： 将base64编码转换成字符串(ASCII编码)

## 4 中文编码

1. `GB2312` : ASCII + 简体中文，一个汉字占用2个字节，英文占1个字节 
2. `BIG5`： ASCII + 繁体中文，一个汉字占用2个字节，英文占1个字节
3. `GBK`：ASCII + 简体中文 + 繁体中文，一个汉字占用2个字节，英文占1个字节
4. `UTF-8`：万国码，占用字节可变长，一个汉字占3个字节
5. `GB18030`：ASCII + 简体中文 + 繁体中文 + 日文 + 朝鲜语等，占用字节可变长

## 5 数组及字符串的 `length`

声明：array、string 的 `length` 属性，不代表我们常规理解的数组元素个数、字符串的元素个数

**array.length**: 表示数组中最大数字下标 + 1

```javascript
var arr = []
arr[1000] = 1
arr.length // 1001
```

解释：js中的数组就是对象，跟java或者其他类型语言不通，js没有数组这种数据结构。js中的数组就是对象，它的原型是 `Array.prototype`，`Array.prototype` 的原型就是 `Object.prototype`，即 `[].__proto__.__proto__ = Object.prototype`

> 所以在遍历数组的时候，最好使用 `for of` 或 `for in` 循环，因为它能正确识别元素个数

**string.length**: 表示字符串中的字符个数

> mdn: 该属性返回字符串中字符编码单元的数量

```javascript
'abc'.length // 3
'𠮷'.length // 2
```

解释：js 字符串的 length 属性的值如果不等于自身字符的个数，那么它必然存在Unicode码点大于0xFFFF的字符，因为 js 采用 utf-16编码规则，每个字符占2个字节，超出 0xFFFF 的字符，js 默认它占2个字符，也就是4个字节

> 所以在遍历字符串的时候，最好使用 `for of` 循环，因为它能正确识别占双字符的元素
