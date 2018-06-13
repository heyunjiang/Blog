# string

1. 字符串的扩展
2. 模板字符串
3. 模板编译
4. 标签模板

## 1 字符串的扩展

```javascript
// startsWith、endsWith、includes
let s = 'Hello world!';

s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 0) // true

// repeat 参数取整，如果是字符串，会隐式转换成数字
'x'.repeat(3)

// 字符串补全长度
'x'.padStart(5, 'ab') // 'ababx'
'x'.padEnd(5, 'ab') // 'xabab'

```

## 2 模板字符串

```javascript
`Hello ${name}, how are you ${time}?`
```

特性

1. 如果使用模板字符串表示多行字符串，所有的空格、缩进、换行都会被保留在输出之中
2. `trim()` 方法可以消除首尾换行和空格
3. `${}` 用于嵌入变量(任何js表达式都行)
4. 支持嵌套

```javascript
// 嵌套例子
let arr = ['hello', 'cheng', 'du']

console.log(`<ul>
  <li>first</li>
  <li>second</li>
  ${arr.map(item=>{
    return `<li>${item}</li>`
  })}
</ul>`.trim())

// 结果，多了逗号，可以采用数组.join方法去掉逗号，这里默认增加逗号
<ul>
  <li>first</li>
  <li>second</li>
  <li>hello</li>,<li>cheng</li>,<li>du</li>
</ul>
```

## 3 模板编译

编译的原理：string.replace + 正则表达式

```javascript
// 待编译源码
let template = `
<ul>
  <% for(let i=0; i < data.supplies.length; i++) { %>
    <li><%= data.supplies[i] %></li>
  <% } %>
</ul>
`;

// 编译函数
function compile(template){
  const evalExpr = /<%=(.+?)%>/g;
  const expr = /<%([\s\S]+?)%>/g;

  template = template
    .replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`')
    .replace(expr, '`); \n $1 \n  echo(`');

  template = 'echo(`' + template + '`);';

  let script =
  `(function parse(data){
    let output = "";

    function echo(html){
      output += html;
    }

    ${ template }

    return output;
  })`;

  return script;
}

// 用法
let parse = eval(compile(template));
div.innerHTML = parse({ supplies: [ "broom", "mop", "cleaner" ] });
//   <ul>
//     <li>broom</li>
//     <li>mop</li>
//     <li>cleaner</li>
//   </ul>
```

## 4 标签模板

### 4.1 标签模板基础语法

标签模板，就是在函数名称后紧跟模板字符串，没有括号，模板字符串作为参数传入，如：

```javascript
alert`123`
// 等同于
alert(123)
```

### 4.2 模板字符串带变量

```javascript
let a = 5;
let b = 10;
tag`Hello hello ${ a + b } world ${ a * b }`;

// 等同于
tag(['Hello hello ', ' world ', ''], 15, 50);

// tag
function tag(stringArr, ...values) {
  let msg = '', i
  for(i = 0; i<values.length; i++) {
    msg += stringArr[i] + values[i]
  }
  msg += stringArr[i]
  return msg
}
```

例子解释：当模板字符串带变量时，函数的第一个参数就是模板字符串中不包含变量的部分，后面剩余的参数就是所有变量或表达式对应的值

所以 `tag` 函数参数实际的值是：

1. 第一个参数：`['Hello hello ', ' world ', '']`
2. 第二个参数：15
3. 第三个参数：50

规律总结：**stringArr.length = values.length + 1**

> stringArr还有一个属性，stringArr.raw，保存的是 stringArr 的转义版本

### 4.3 标签模板应用场景

标签模板的应用场景，也就是模板字符串带来的特性应用场景，就是在字符串中可以插入变量或表达式、保留换行与空白

1 多语言转换，国际化处理

```javascript
i18n`Welcome to ${siteName}, you are visitor number ${visitorNumber}!`
```

2 过滤 html 字符串

```javascript
let sender = 'hello'
let message =
  SaferHTML`<p>${sender} has sent you a message.</p>`;

function SaferHTML(templateData) {
  let s = templateData[0];
  for (let i = 1; i < arguments.length; i++) {
    let arg = String(arguments[i]);

    // Escape special characters in the substitution.
    s += arg.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    // Don't escape special characters in the template.
    s += templateData[i];
  }
  return s;
}
```

3 规范输入

去掉多余的换行符与空白字符

```javascript
let hello = 'world'
let html = stripIndents`

	<span>1<span>
	<span> 2<span>

		<span>${hello}<span>
`;
function stripIndents(str, ...args) {
  let result = ''
  for(let i=0;i<args.length;i++) {
  	result += str[i] + args[i]
  }
  result += str[str.length-1]
  result = result.trim()
  result = result.replace(/^\s*/gm, '')
  console.log(result)
  return result
}
```

输出

```javascript
<span>1<span>
<span> 2<span>
<span>world<span>
```

## 5 String.raw()

`raw` 方法出现的目的，就是用以解决标签模板需要实现的基本功能：转义、变量替换

> 变量替换在模板标签中直接就能实现
> raw方法只提供基本功能，如果需要更高级的功能，需要自己写标签模板处理函数

```javascript
String.raw`Hi\n${2+3}!`;
// 返回 "Hi\\n5!"

String.raw`Hi\u000A!`;
// 返回 "Hi\\u000A!"
```

## 6 模板字符串的限制

模板字符串遇到不合法字符串的转义，会报错

```javascript
console.log(String.raw`<p> \unicode has sent you a message.</p>`)
// SyntaxError: Invalid Unicode escape sequence
```

如果有需要在标签模板里面嵌入其他语言，语法格式不同，遇到js保留字或符号时(在其他语言中这不是保留字)，就会报错

> es2018 不报错，改为 undefined 了
