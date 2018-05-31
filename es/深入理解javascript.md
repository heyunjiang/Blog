# javascript 语言解释

javascript属于弱类型语言，包含通用语言的语法规则，比如逻辑控制if-else、try-catch等

****

## 1. javascript 语言简介

是一门跨平台、面向对象的轻量级脚本语言, 在宿主中通过连接环境对象来实现可控制编程。

ECMA: 欧洲信息与通信系统标准化协会

ECMASCRIPT：该协会发布的标准javascript规范

ECMAScript 文档并不是旨在帮助脚本程序员；编写脚本时请参考  JavaScript 文档。

## 2. javascript 基本详细内容

### 2.1 词法作用域

作用域定义、作用域链、静态/动态作用域

> 作用域链与原型链有什么区别？

### 2.2 错误处理

错误处理机制（throw， try/catch 以及用户自定义错误类型的能力）

### 2.3 7大变量类型

boolean, number, string, null, undefined, object, symbol

基本类型：boolean, number, string, null, undefined, symbol

引用类型：object (object, function, array)

> 记一句：Set去重内部采用 `Same-value-zero equality` 算法，类似 `===` 区别是其NaN等于自身

### 2.4 原型链

**关键词**：`构造函数`、`原型`、`实例`、`原型链`

> 原型：也称为实例原型，是一个对象，构造函数的 `prototype` 属性指向的就是原型，由构造函数创建的实例有个 `__proto__` 属性，指向的也是原型

### 2.5 内置对象

全局对象、函数

### 2.6 严格模式

### 2.7 编码规则

基本原则：采用unicode字符集

> unicode是国际通用字符集，编码为utf编码，分为utf-8,utf-16,utf-32；它的字符集叫unicode字符集

**charAt,charCodeAt,codePointAt**

返回对应字符串的 `字符` 、 `unicode编码` 、 `Unicode 编码单元 > 0x10000的unicode编码`

**fromCharCode,fromCodePoint**

由对应unicode编码返回字符串

**decodeURI、encodeURI、decodeURIComponent、encodeURIComponent**

encodeURI：

encodeURIComponent：

### 2.8 闭包及应用场景

归纳：闭包就是在函数作用域外能够访问到函数作用域内的变量

好处：隐藏具体实现细节

应用场景：面向对象应用、立即执行函数(提前验证)、函数柯里化、函数延迟执行、扩展原型对象方法

## 3. 客户端的 javascript

javascript + dom + bom

## 4. 服务器端的 javascript

javascript + fr等对象(nodejs)

> 调试javascript代码：在firefox中按 `shift f4` 可以打开代码草稿纸，更方便js代码的书写


# javascript new Date()

返回今年剩余天数

```javascript
	var today = new Date();
	var endYear = new Date(1995, 11, 31, 23, 59, 59, 999); // 设置日和月，注意，月份是0-11
	endYear.setFullYear(today.getFullYear()); // 把年设置为今年
	var msPerDay = 24 * 60 * 60 * 1000; // 每天的毫秒数
	var daysLeft = (endYear.getTime() - today.getTime()) / msPerDay;
	var daysLeft = Math.round(daysLeft); //返回这一年剩下的天数

```

