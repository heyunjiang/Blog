## flexible(flexbox)

目前主流浏览器已经全部支持

display新属性值

`display: flex;` `display: inline-flex;`

子元素的 `float`、`clear`、`vertical-align`属性将失效

### 基本概念

水平主轴： `main axis` `main start` `main end`
垂直交叉轴： `cross axis` `cross start` `cross end`

### 容器属性

1. `flex-direction`: row | row-reverse | column | column-reverse (方向)
2. `flex-wrap`: nowrap | wrap | wrap-reverse (是否换行)
3. `flex-flow`: row nowrap (前2个的合写版本，默认水平横轴换行)
4. `justify-content`: flex-start | flex-end | center | space-between | space-around (在水平主轴上对齐方式)
5. `align-items`: flex-start | flex-end | center | baseline | stretch (在垂直交叉轴上对齐方式)
6. `align-content`: flex-start | flex-end | center |stretch | space-between | space-around (多个轴线在空间上对齐方式)

> 注意：若设置 `flex-direction: column`，则此时主轴为交叉轴，操作 `justify-content` 则变为垂直方向的对齐方式

### 项目属性

这是定义在容器内每个项目上的属性

1. `order`: 1 (数字越小、排列越靠前)
2. `flex-grow`: 1 (项目放大比例，每个项目设置不同，可以设置其对应占据空间比例，0表示不放大)
3. `flex-shrink`: 1 (项目缩小比例，每个项目设置不同，可以设置其对应占据空间比例，0表示不缩小)
4. `flex-basis`: auto | 100px (设置项目主轴空间)
5. `flex: flex`-grow flex-shrink flex-basis 的合写
6. `align-self`: auto | flex-start | flex-end | center | baseline | stretch (垂直交叉轴的时候，定义单个元素的对齐方式，默认继承父元素)

### 疑问

既然有 `align-self` 控制单个项目在垂直交叉轴上对齐方式，那有控制单个项目在水平主轴上对齐方式的吗？

> 答： 我们编写文档流的时候，都是从左往右，从上往下的普通流(默认)，不管垂直交叉轴还是水平主轴，都是从左往右。
> 当创建主轴水平flex盒子的时候，不能再控制单个item再去往左往右便宜了，空间已经被占完了。所以不存在这种对齐方式

