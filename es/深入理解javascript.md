# javascript 语言解释

****

## javascript 语言特性

是一门跨平台、面向对象的轻量级脚本语言。

在宿主中通过连接环境对象来实现可控制编程。

## ECMAScript 包含了

1. 语法（解析规则，关键字，流程控制，对象初始化等）
2. 错误处理机制（throw， try/catch 以及用户自定义错误类型的能力）
3. 类型（布尔值，数字，字符串，函数，对象等）
4. 全局对象。 在浏览器环境中，window就是全局对象，这个对象拥有很多函数（parseInt， parseFloat， decodeURI， encodeURI等）
5. 基于原型的继承机制
6. 内置对象和函数（JSON，Math，Array.prototype 方法，Object introspection 方法等）
7. 严格模式

## 客户端的 javascript

javascript + dom + bom

## 服务器端的 javascript

javascript + fr等对象(nodejs)

## javascript 与 ECMASCRIPT

ECMA: 欧洲信息与通信系统标准化协会

ECMASCRIPT：该协会发布的标准javascript规范

ECMAScript 文档并不是旨在帮助脚本程序员；编写脚本时请参考  JavaScript 文档。


> 调试javascript代码：在firefox中按 `shift f4` 可以打开代码草稿纸，更方便js代码的书写

# javascript语法和数据类型

****

1. javascript `区分大小写` ，使用 `unicode` 字符集

> unicode是国际通用编码，编码为unicode编码，分为utf-8,utf-16,utf-32；它的字符集叫unicode字符集

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
15. `charAt,charCodeAt,codePointAt`：返回对应字符串的 `字符`、`unicode编码`、`Unicode 编码单元 > 0x10000的unicode编码`
16. `fromCharCode,fromCodePoint`：由对应unicode编码返回字符串
17. `Intl`：是ECMASCRIPT国际化API的命名空间对象，它的三个属性方法：NumberFormat()、DateTimeFormat()、Collator(),分别用于处理数字国际化、日期国际化、字符串比较排序国际化
> 用的很少

18. 正则表达式需要仔细重新学
19. `length`：返回的是数组最后一个元素的索引值加1，所以不是元素的个数，对于悉数数组使用length要慎重
20. `map set`：map键值，允许键值都可以是任意值，不像Object限制键为字符串；set结构，只允许内部元素唯一，不能重复
21. 面向对象需要仔细重新学
22. 学到javascript中级教程了
23. 


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
9. decodeURIComponent
10. encodeURIComponent

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

