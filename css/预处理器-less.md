# less

time: 2018.8.10

之前学过sass, less，应用的层面都只在变量定义、嵌套、&等基础使用层面，对于 mixin 、 function 的使用非常少，今天在学习 antd 源码的时候，里面用到了 less 的这些功能，所以需要来回顾一下less

## 1 函数 | 混合

1.1 定义函数，可以设置默认值；

1.2 使用的时候，可以有传参与不传参；

1.3 使用的时候，可以执行加减乘除运算，less中的函数映射了javascript的函数功能，通常用于属性值和颜色运算

```less
@base-color: #111;

.rounded-corners (@radius: 5px) {
  border-radius: @radius;
  -webkit-border-radius: @radius;
  -moz-border-radius: @radius;
}

#header {
  .rounded-corners;
  color: @base-color * 3;
}
#footer {
  .rounded-corners(10px);
}
```

1.4 使用的时候，可以根据传参匹配

```less
.mixin (dark, @color) {
  color: darken(@color, 10%);
}
.mixin (light, @color) {
  color: lighten(@color, 10%);
}
.mixin (@_, @color) {
  display: block;
}

@switch: light;

.class {
  .mixin(@switch, #888);
}
```

## 2 变量名称拼接

通过 `@{}` 实现名称拼接，用在字符串中或者css类名

```less
@btn-prefix-cls: ~"@{ant-prefix}-btn";

.@{btn-prefix-cls} {}
```
