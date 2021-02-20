# 正则表达式

目录

1. 基本语法
2. 捕获型分组与非捕获型分组的差别
3. 常用实例
4. 正则表达式多次匹配

## 1 基本语法

正则表达式分支： `/in|(([0-9])\:(\s)[aeiou])/`

正则表达式序列： `(([0-9])\:(\s)([aeiou]))`

正则表达式因子： `[0-9]`

正则表达式转义： `\s`

正则表达式分组： `(...)`

正则表达式字符集： `[aeiou]`

1个正则表达式分支 = 1个或多个正则表达式序列

1个正则表达式序列 = 1个或多个正则表达式因子

1个正则表达式因子 = 一个字符、一个分组、一个字符类或者一个转义序列

### 1.1 构建方式

#### 1.1.1 对象字面量

var regexp = /^1\d{10}$/

#### 1.1.2 RegExp对象

参数是字符串

var regexp = new RegExp("\d{11}", 'g')

参数是正则表达式

var regexp = new RegExp(/^[xyz]+/, 'g')

注意：如果第一个参数后面有修饰符，比如 `/^[xyz]+/gi` ，然后第二个参数 `g` 会覆盖掉前面的修饰符

### 1.2 RegExp对象方法

1. RegExp.prototype.exec: 表示匹配，成功返回数组
2. RegExp.prototype.test: 表示匹配，成功返回布尔值
3. RegExp.prototype[Symbol.match]：字符串的match方法调用对象，每次取出一个匹配
4. RegExp.prototype[Symbol.replace]：字符串的replace方法调用对象
5. RegExp.prototype[Symbol.search]：字符串的search方法调用对象
6. RegExp.prototype[Symbol.split]：字符串的split方法调用对象
7. RegExp.prototype[Symbol.matchAll]：字符串的matchAll方法调用对象，直接取出所有匹配

### 1.3 正则表达式属性

由对象字面量或RegExp对象构建的正则表达式，都有如下属性

1. RegExp.prototype.unicode： 来判断一个正则表达式是否设置了u属性修饰符
2. RegExp.prototype.sticky： 来判断一个正则表达式是否设置了y属性修饰符
3. RegExp.prototype.flags: 返回所有的修饰符
4. RegExp.prototype.dotAll：来判断一个正则表达式是否设置了s属性修饰符
5. RegExp.prototype.lastIndex: 表示下次匹配开始位置

### 1.4 常见字符

1. ^ : 字符串开头
2. $ : 字符串结尾
3. (?:...) : 非捕获型分组
4. (...) : 捕获型分组
5. ()? : 分组可选
6. [...] : 字符集，匹配其中任意一个即可，可以使用 `-` 来表示范围
7. A-Za-z : 表示从A到Z和从a到z，总共52个字母
8. \ : 转义字符，将特殊字符作普通字符处理，将普通字符作特殊字符处理
9. {0, 3} : 0到3次
10. + : 至少一次
11. * : 任意次数
12. . : 匹配除换行符 `\n` 以外的所有字符
13. \d : 数字，等价 `[0-9]`
14. \D : 非数字，等价 `[^0-9]`
15. \s \S : 空白，非空白
16. \w : 数字+字母，等价 `[0-9A-Za-z]`
17. \W : 非数字字母，等价 `[^0-9A-Za-z]`
18. \f \n \r \t \b : 对应换页符、换行符、回车符、制表符、字边界标识
19. \1 \2 \3 : 表示对捕获型分组的引用
20. \u : unicode 字符
21. | : 取或运算符
22. \p{} : 匹配unicode 某种属性的对应字符
23. \P{} : 不匹配unicode 某种属性的对应字符

> 不可以单独使用 `\p`，必须加描述 `\p{Script=Greek}`

### 1.5 修饰符

1. g : 全局
2. m : 表示多行，每行都执行一次匹配
3. i : 忽略大小写
4. u : 支持unicode，能正确处理四个字节的 UTF-16 编码
5. y : 同 `g` 修饰符类似，也是全局匹配。区别是g是上次匹配之后剩余位置存在匹配就行，y要求必须从上次匹配结束位置开始进行匹配，也叫做 `sticky(粘连)` 匹配(可以理解为 `y` 修饰符隐含了头部匹配表示 `^`)
6. s : 让 `.` 能够代表任意的单个字符(除开始符 ^、结束符 $)，包括4字节的utf-16字符、行终止符

> 行终止符：换行符、回车符、行分隔符、段分隔符

### 1.6 g 与 y 异同

相同点：都是全局匹配

不同点：

1. `y` 每次匹配时从上次匹配结束位置匹配， `g` 则是每次匹配时剩余匹配字符串存在匹配则行
2. 对于 `replace` 、 `match` 等方法，使用 `g` 会一次性全部匹配，使用 `y` 则每次匹配一轮，然后需要手动多次匹配

```javascript
// 针对不同点1
var s = 'aaa_aa_a';
var r1 = /a+/g;
var r2 = /a+/y;

r1.exec(s) // ["aaa"]
r2.exec(s) // ["aaa"]

r1.exec(s) // ["aa"]
r2.exec(s) // null，因为这里是以 _ 开头的
```

```javascript
// 针对不同点2
var regg = /a/g
'aaxa'.replace(regg,'-') // '--x-'

var regy = /a/y
'aaxa'.replace(regy,'-') // '-axa'
'aaxa'.replace(regy,'-') // 'a-xa'
'aaxa'.replace(regy,'-') // 'aaxa' 就是没有替换

var reggy = /a/gy
'aaxa'.replace(reggy,'-') // '--xa'
```

**总结**：g可以用于全局匹配，但是 y 属于 `伪全局匹配` ， y 是粘连匹配，且需要多次手动匹配，不具备 g 完整的全局匹配

### 1.7 匹配分组设置名称

```javascript
const RE_DATE = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

const matchObj = RE_DATE.exec('1999-12-31');
const year = matchObj.groups.year; // 1999
const month = matchObj.groups.month; // 12
const day = matchObj.groups.day; // 31
```

为 `matchObj` 增加了一个新属性 `groups`

## 2 捕获型分组与非捕获型分组的差别

1. 写法: 捕获型分组： `(\d{11})` , 非捕获型分组： `(?:(\w)*)`
2. 用途： 捕获型通常用于表示确定存在，一定要匹配上的字符，而非捕获型分组通常用于可选的
3. 分组编号： 捕获型分组有从1开始的编号，非捕获型分组不拥有编号，并且不影响捕获型分组的编号

## 3 常用实例

### 3.1 匹配11位手机号码

```javascript
var number = "18224487974";
var parse_number = /^1\d{10}$/
parse_number.test(number) // true
```

### 3.2 匹配网址

```javascript
var str = "www.baidu.com/pathname?hello=world#fragment"
var parse_url = /^(?:([a-zA-Z]*):)?(?:\/{0,3})?([0-9\.a-zA-Z]+)(?::(\d*))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:\#(.*))?$/
parse_url.exec(str) // return  arr
```

### 3.3 寻找单词重复出现次数

```javascript
var str = '我 you 我 he yy'
var parse_same = /([A-Za-z\u00C0-\u1FFF\u2800-\uFFFD]+)\s+/gi
console.log(parse_same.exec(str))
```

## 4 正则表达式多次匹配

之前写 `exec` 匹配的时候，以为匹配一次就结束了。后面看到es6的y修饰符的时候，才知道匹配可以执行多次

```javascript
// exec 多次匹配
var s = 'aaa_aa_a';
var r1 = /a+/g;

r1.exec(s) // ['aaa']
r1.exec(s) // ['aa']
r1.exec(s) // ['a']
r1.exec(s) // null
r1.exec(s) // ['aaa']
```

当正则表达式存在 `g` 或 `y` 的时候，每次执行 `exec` 匹配，会保存字符串上次匹配到的位置，然后下一次匹配会从上一次匹配结束的位置开始(匹配的还是原字符串，只是正则对象的 `lastIndex` 值变化了)。如果上一次匹配返回的结果是 `null` 那么下次匹配又会从头开始

如果正则表达式不存在 `g` 或 `y`，那么它就不会多次匹配，每次匹配的时候，都是从头开始

> String.prototype.replace也是可以匹配多次的

> 可以在第一次匹配的时候，指定 `r1.lastIndex` 值，表示从哪个位置开始匹配

## 参考文章

[mdn 正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)
