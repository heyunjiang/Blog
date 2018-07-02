# html 标签语义化

目录

1. 常用标签
2. html5 种常用标签使用规范
3. 如何理解html语义化

## 1 常用标签

1. `p` 段落
2. `h1 h2` 文章标题
3. `em strong` 强调文字短语。(em斜体，strong加粗，strong强调程度强于em)
4. `span` 用于单独设置样式，无语义
5. `q` 短文本引用 ，浏览器会自动添加上双引号
6. `blockquote` 长文本引用， 浏览器会自动添加左右缩进
7. `&nbsp;` 空格
8. `br` 换行
9. `hr` 分割横线
10. `address` 地址，默认斜体
11. `code` 一行代码展示
12. `pre` 预展示样式，多用于展示多行代码
13. `ul li` 无序列表，默认带圆点
14. `ol li` 有序列表，默认123
15. `div` 容器，添加名称用于表示属于哪一个模块
16. `table,tbody,tr,th,td`  表格专用。tbody：添加了这个标签，只有在完整加载表格之后才显示，否则加载一部分就显示一部分
17. `table 的 summary 属性` 用于在 table 中增强可读性，不会显示在浏览器中
18. `caption` 表格标题，位于表格正上方
19. `a,a中title` 超链接，默认蓝色，title表示鼠标滑过显示什么文字
20. `a中target="_blank"` 表示新开窗口
21. `a中mailto:` 发送邮件，`cc` 抄送地址，`bcc` 密件抄送地址， `;` 多个收件人、抄送、密件抄送人，`subject`邮件主题，`body` 邮件内容
22. `img` 图片，alt: 加载失败时展示文字，title：鼠标滑过展示文字
23. `form action method` 表单
24. `input type name value` 输入框
25. `textarea rows cols` 文本域
26. `input type=radio/checkbox value name checked=checked` 单选/复选框
27. `select option value selected=selected`下拉列表框
28. `select multipe=multiple`多选，按住ctrl多选
29. `input type=submit` 提交
30. `input type=reset` 重置
31. `for` 无效果，用于点击该标签时，触发此标签所绑定的控件点击属性

## 2 html5 种常用标签使用规范

### 2.1 强调、加粗、标识文本时

使用 `<h1> - <h6>` 表示标题，使用 `<em>` 表示强调的文本，使用 `<strong>` 表示重要文本，使用 `<mark>` 表示标注的/突出显示的文本

`<b>` 同样具有加粗的功能，但是它只是一个样式标签，并非语义标签

语义标签：strong, h1, em, strong, mark, del, code ...

样式标签：b, i, u, s, pre ...

> 注意：也可以使用 css 的 font 一系列属性来设置文本样式

### 2.2 doctype

`document type`

作用：让宿主环境按照指定规则解析 html 与 css

> 说明：它不是一个标签，而是一个指令、规则

html4 及 xml 是基于标准通用标记语言 SGML，html 4的 doctype 有3种值，transitional、strict、frameset；而html5 不是基于 SGML 的，它的 doctype 只有一个值：html

## 3 如何理解html语义化

1. 合理利用标签：让正确的标签做正确的事，标签语义化
2. 便于浏览器、搜索引擎解析：语义化让页面内容更结构化，结构更清晰
3. 独立于css：即使没有css，页面也是容易阅读的
4. 利于seo: 便于搜索引擎的爬虫解析，确定上下文，确定关键字的权重
5. 便于阅读、维护：开发人员方便

这也说明了我们在开发的时候，选择合理的标签的重要性

## 4 用标签鉴别 h5

1. doctype值： html
2. 使用 h5 标签： article、address等
