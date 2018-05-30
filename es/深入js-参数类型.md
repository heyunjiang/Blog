## js 基本类型、引用类型、参数类型

关键词：`类型`、`内存`、`指针`

**7大变量类型**

boolean, number, string, null, undefined, object, symbol

**值类型与引用类型**

值类型：boolean, number, string, null, undefined, symbol

引用类型：object (object, function, array)

**什么是引用类型？**

答：引用类型的数据，其真实值在内存中分配一个地址001，然后我们访问的都是这个001地址，就是说为我们的变量分配的值是这个地址001，它作为一个指针，指向真实值。

**如何理解js中参数都是按值传递**

原则：在javascript中的参数传递都是按值传递

理解：这里的值，值得是变量的值。js的类型分为基本类型与引用类型，传的实参赋值给形参，就是把实参的值复制给形参。如果 `var obj = {}`，通常我们所说的 obj 的值是一个对象，其实这种说法是错误的，正确说法 obj 的值对这个对象的引用，因为这个 obj 变量在内存中对应的值是一个指针，这个指针就是这个对象 `{}` 的内存地址，所以说 obj 它是对这个对象的引用。那么如果将 obj 作为实参传递给函数，其实传递的是 obj 的值(指针)，也就是 `{}` 的内存地址。

```javascript
const arr = [{"hello": 'world'}, {"hello": 'world'}]
console.log(arr === arr, arr[0] === arr[1]) //true, false
```
