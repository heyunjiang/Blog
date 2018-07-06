# 常见知识归纳

## 1. 盒子模型

w3c： content, padding, border, margin

ie: content, margin, 其中 content 包含了 padding 和 border

## 2. css 选择器

常用

1. id 选择器： #myid
2. 类选择器： .myclass
3. 标签选择器： p
4. 后代选择器： li a
5. 子选择器： li > a
6. 通配符选择器： *
7. 伪类选择器： a:hover

不常用

1. 相邻选择器： h1 + p
2. 属性选择器：a[rel = "external"]

css3 新增伪类选择器

1. p:first-of-type
2. p:last-of-type
3. p:only-of-type 其父元素只有一个p类型的子元素的每个p元素
4. p:only-child 其父元素只有一个子元素的每个p元素
5. p:nth-child(2) 其父元素的第二子元素的每个p元素

## 3. css 三大特性

继承、层叠性、优先级

### 3.1 继承

什么是继承？哪些样式可以继承？哪些样式不可以继承？

继承：父节点具有某些属性样式，子节点没有设置这个样式，却能够表现出跟父节点相同的这个样式

> 虽说是经验之谈，但是我可以通过 chrome devtool 查看，在 Elements 下，查看 Styles，可以查看到选中节点的样式，其中有一栏 `Inherited from`，这里可以用于测试那些样式可以继承

可以继承的样式：

1. font-size font-family (font 系列)
2. color
3. text-align text-decoration (text 系列)
4. line-height

不可继承的样式： width padding border margin height

### 3.2 优先级

指一个节点，如果有多个相同的样式设定，如果确定采用哪一个

权重相同：

1. 同一来源：就近原则，谁最后被合并到节点上就采用谁
2. 不同来源：内联 > 嵌入 > 外部

权重不同：!important > id > class > tag

问题：当同一个元素设置了多个css选择器，那么如何判断优先级？

```html
<style>
#pid {height: 30px;}
.pstyle {height: 20px;}
p {height: 10px;}
</style>

<p class="pstyle" id="pid"></p>
```

> 根据 css 优先级，这里3种选择器，对应的权重不同，所以最后表现为 30px

### 3.3 层叠性

css 层叠性和优先级怎么区分？
