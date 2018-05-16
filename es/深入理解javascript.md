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

**问：1.什么是作用域？**

答：作用域就是变量和常量的起效范围，只能在该范围内访问该变量

**问：2.作用域有哪些类型？**

答：按作用范围，分为：`全局作用域`、`函数作用域`、`块级作用域(es6)`; 
按作用域链调用顺序，分为：`词法作用域(静态作用域)`、`动态作用域`，javascript采用词法作用域

**问：3.词法作用域和动态作用域怎么区分？**

答：之所以叫词法作用域，词，单词，就是代码编写的时候确定的作用域，动态作用域，就是在代码运行的时候确定

```javascript
/* 例1. 词法作用域 */

var value = 1;
function foo() {console.log(value);}

function bar() {var value = 2;foo();}

bar();
```

**例子分析**：最终输出1，因为javascript采用词法作用域，函数的作用域在编码创建的时候就确定了，运行foo，先查找foo函数本身有没有value，foo本身没有，沿着作用域链向上层查找，找到的上级为value=1。如果采用动态作用域，那么作用域链上级的value就应该是2了

**问：4.作用域链又是什么？是怎么定义的？**

答：作用域链为一个数组栈，保存的是当前函数执行上下文的变量对象+父级执行上下文的变量对象(直到全局作用域)。

> 因为操作作用域链只可能在函数中操作，所以这里说的作用域链就是函数的作用域链，也就是函数变量所在的执行上下文的作用域链属性

关键词：`[[scope]]`、`[[Scopes]]`、`执行上下文`、`执行上下文栈`

创建步骤：在函数执行前创建，执行后销毁，类似钩子函数执行时期

1. 在函数创建的时候，就为其创建了一个内部属性 `[[scope]]`，它的值为一个数组，保存父级执行上下文的作用域链。
2. 在函数正式执行之前，为其创建执行上下文的时候，才为其创建作用域链，也就是其执行上下文添加 `[[Scopes]]` 属性，依次把 `[[scope]]` 、 `函数活动对象AO`(当前函数内部的变量、函数声明)入栈，也就是添加到 `[[Scopes]]` 中，然后函数才真正执行，为 `AO` 赋值，也就是函数内部变量赋值了。
3. 执行完毕，函数的执行上下文出栈被销毁，函数执行上下文中的作用域链也被销毁了。

> 总结：因为函数的内部属性 `[[scope]]` 保存了其父级执行上下文的作用域链，所以函数作用域在其创建的时候就确定了，在其他任何地方调用的值都一样


### 2.2 错误处理

错误处理机制（throw， try/catch 以及用户自定义错误类型的能力）

### 2.3 7大基本类型

boolean, number, string, null, undefined, object, symbol

基本类型：boolean, number, string, null, undefined, symbol

引用类型：object (object, function, array)

> 什么是引用类型？

### 2.4 原型链

继承等

### 2.5 内置对象

全局对象、函数

### 2.6 严格模式

### 2.7 编码规则

基本原则：采用unicode编码

> unicode是国际通用编码，编码为unicode编码，分为utf-8,utf-16,utf-32；它的字符集叫unicode字符集

**charAt,charCodeAt,codePointAt**

返回对应字符串的 `字符` 、 `unicode编码` 、 `Unicode 编码单元 > 0x10000的unicode编码`

**fromCharCode,fromCodePoint**

由对应unicode编码返回字符串

**decodeURI、encodeURI、decodeURIComponent、encodeURIComponent**

encodeURI：

encodeURIComponent：

## 3. 客户端的 javascript

javascript + dom + bom

## 4. 服务器端的 javascript

javascript + fr等对象(nodejs)






> 调试javascript代码：在firefox中按 `shift f4` 可以打开代码草稿纸，更方便js代码的书写

# javascript语法和数据类型

****

1. javascript `区分大小写` ，使用 `unicode` 字符集
2. 从左到右进行扫描，然后将一条一条的 `指令` 进行解释
3. `三种声明` ：变量、局部变量、常量
4. javascript的变量类型是 `动态变量` 的，所以在声明变量后为其赋予不同类型的值都是可以的
5. `-号运算符`：'34'-4=30;'34'+4='344';
6. `标签语句`：定义标签语句。使用 `break label` 和 `continue label` 可以直接跳转到标签语句，执行对应的break或continue
7. `try-catch` 可以使用 throw 抛出任意值的错误，捕获并处理
8. `默认参数和剩余参数`：es6支持默认参数和剩余参数
9. `箭头函数的this`：箭头函数能够捕捉闭包上下文的this
10. `delete`：删除一个对象或一个对象的属性或数组的一个元素，然后空出的位置变成undefined
11. `void`：表示一个表达式不返回任何值。常用在链接的void(0)
12. `2e4`：数字的指数表示形式，表示20000，后面接4个零
13. `Number对象`：几大属性：MAX_VALUE、MIN_VALUE
14. `特殊字符串`: '\xA9'16进制转义序列表示'©'，'\u00A9'Unicode转义序列表示'©'

17. `Intl`：是ECMASCRIPT国际化API的命名空间对象，它的三个属性方法：NumberFormat()、DateTimeFormat()、Collator(),分别用于处理数字国际化、日期国际化、字符串比较排序国际化
> 用的很少

18. 正则表达式需要仔细重新学
19. `length`：返回的是数组最后一个元素的索引值加1，所以不是元素的个数，对于悉数数组使用length要慎重
20. `map set`：map键值，允许键值都可以是任意值，不像Object限制键为字符串；set结构，只允许内部元素唯一，不能重复


## javascript 预定义函数

顶级的内建函数

1. parseInt()
2. parseFloat()
3. isNaN()
4. isFinite()--是否是有限的数值
5. eval()--字符串->可执行的源代码
6. uneval()--源代码->字符串
7. decodeURI
8. encodeURI
9. decodeURIComponent: 将%20的转成空格、加号的等
10. encodeURIComponent: 空格、加号等转成对应的%20等

# javascript new Date()

返回今年剩余天数

```

	var today = new Date();
	var endYear = new Date(1995, 11, 31, 23, 59, 59, 999); // 设置日和月，注意，月份是0-11
	endYear.setFullYear(today.getFullYear()); // 把年设置为今年
	var msPerDay = 24 * 60 * 60 * 1000; // 每天的毫秒数
	var daysLeft = (endYear.getTime() - today.getTime()) / msPerDay;
	var daysLeft = Math.round(daysLeft); //返回这一年剩下的天数

```

