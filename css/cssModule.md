## 使用方式

通过 `import` 方式，引入到js文件

`import styles from "./style.css"`

> 说明：css-loader内置了css module，但是也可以使用 `react-css-modules` 来使用css module

## 规范要求

1. 命名：小驼峰，最好不要使用 `class-name` 方式命名css

## 使用技巧

### 1. :global、:local

默认是local，只能通过Import入js文件才能使用

### 2. composes: 在css中使用继承

文件内css

``` css
.className {
  color: green;
  background: red;
}

.otherClassName {
  composes: className;
  color: yellow;
}
```

引入外部css

``` css
.otherClassName {
  composes: className from "./style.css";
}
```

引入global css

``` css
.otherClassName {
  composes: globalClassName from global;
}
```

> 注意：在使用多个composes的时候，引入外部文件，因为不能保证属性的插入顺序，所以不要对同一个class使用重复属性
> 最好保持class的单一作用性(类似组件单一作用)
