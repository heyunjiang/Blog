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
3. `${}` 用于嵌入变量

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


