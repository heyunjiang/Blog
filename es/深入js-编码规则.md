# 编码规则

## 1 基础知识

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

### 2.3 utf-8

编码范围：所有语言，包括汉字、英文、韩文等

编码长度：可变长编码。常用 `英文字母 = 1Byte`，`汉字 = 3Byte`，生僻字符编码成4-6个字节

**utf-8作为unicode的子编码**

### 2.4 utf-16

编码范围：所有语言，包括汉字、英文、韩文等

编码长度：可边长编码，最少2byte

## 3 javascript 中的编码

javascript 采用 unicode 编码

### 3.1 fromCharCode、fromCodePoint

`String.fromCharCode`：unicode -> 字符串

`String.fromCharCode(65,66,67) //A, B, C`

`String.fromCodePoint`: unicode -> 字符串 ，比 fromCharCode 更全面，es6新增的

### 3.2 charAt、charCodeAt、codePointAt

`String.prototype.charAt` : 返回字符串中索引字符 `"hello".charAt(0) //h`

`String.prototype.charCodeAt` ：返回字符串中索引字符对应的unicode字符 `"ABC".charCodeAt(0) //65`

`String.prototype.codePointAt` ：返回字符串中索引字符对应的unicode字符 `"ABC".codePointAt(0) //65`，比 charCodeAt 更全面，es6新增的

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

btoa： 将字符串(ASCII编码)转换成base64编码

atob： 将base64编码转换成字符串(ASCII编码)
