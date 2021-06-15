# 居中实现的n种方法

time: 2021-06-15 10:33:46  
author: heyunjiang

## 背景

之前也做过很多种居中实现的需求，但是一直没有归纳总结，并且也是面试中常考点，这里做个总结  
居中实现总共有如下几种方式  
1. flex 实现水平 + 垂直居中
2. text-align: center 实现水平居中
3. height + line-height 实现垂直居中
4. margin auto 设置水平 + 垂直居中
5. absolute 实现水平 + 垂直居中

## 1 flex 实现水平 + 垂直居中

```css
.flex-center {
  display: flex;
  justify-content: center; // 水平
  align-items: center; // 垂直，需要设置父容器的高度才行
}
```

## 2 margin auto 设置水平 + 垂直居中

auto 表示占据宽度自适应。前提是 **自身本来就充满高宽**，然后修改自身的 width, height 属性 + margin auto 实现的水平垂直居中

div 水平居中  
```css
.margin-auto-center {
  width: 200px;
  margin: 0 auto;
}
```

div 垂直居中  
```css
.margin-auto-center {
  width: 200px;
  height: 200px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
```

## 参考文章

[csdn](https://blog.csdn.net/linshizhan/article/details/71521140)
