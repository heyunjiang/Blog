# html 标签语义化

目录

1. 常用标签
2. html5 种常用标签使用规范
3. 如何理解html语义化

## 1 常用标签

1. `p` 段落
2. `span` 用于单独设置样式，无语义
3. `&nbsp;` 空格
4. `br` 换行
5. `hr` 分割横线
6. `pre` 保留原样式，样式标签
7. `ul li` 无序列表，默认带圆点
8. `ol li` 有序列表，默认123
9. `div` 容器，添加名称用于表示属于哪一个模块
10. `a, a 中 title` 超链接，默认蓝色，title表示鼠标滑过显示什么文字
11. `a 中 target="_blank"` 表示新开窗口
12. `a 中 mailto:` 发送邮件，`cc` 抄送地址，`bcc` 密件抄送地址， `;` 多个收件人、抄送、密件抄送人，`subject`邮件主题，`body` 邮件内容
13. `img` 图片，alt: 加载失败时展示文字，title：鼠标滑过展示文字
14. `map area` 可点击区域的图像映射
15. `embed` 引入的内容，插件、pdf
16. `i` 斜体
17. `del ins` 删除、插入文字，多用在商品打折

### 1.1 块级元素、行内元素、空元素

**块级元素**：默认 `display` 属性为 `block`

div, p, h1, ul, ol, li, dl, dt, dd

nav, header, footer, article, address, aside

**行内元素**：默认 `display` 属性为 `inline-block`

span, b, a, img, input, select, em, strong...

abbr, i, del, ins, dfn, code, samp, cite, kbd...

**空元素**：没有内部html的元素，多是指 `<img />` 类型，可以自闭的元素

img, input, meta, link, br, hr...

base, col, area, embed...

> 6种斜体标签：i, address, cite, var, dfn, em 。只有 i 是样式标签，其他皆是语义标签

### 1.2 语义化-引用

1. `q` 短文本引用 ，浏览器会自动添加上双引号
2. `blockquote` 长文本引用，浏览器会自动添加左右缩进
3. `cite` 定义引用，参考文献、期刊标题，斜体

### 1.3 语义化-文章

1. `p` 段落
2. `h1 h2` 文章标题
3. `em strong` 强调文字短语。(em斜体，strong加粗，strong强调程度强于em)
4. `address` 地址，默认斜体
5. `code` 一行代码展示，语义标签
6. `ul li` 无序列表，默认带圆点
7. `ol li` 有序列表，默认123
8. `dl dt dd` 定义列表
9. `a, a 中 title` 超链接，默认蓝色，title表示鼠标滑过显示什么文字
10. `a 中 target="_blank"` 表示新开窗口
11. `a 中 mailto:` 发送邮件，`cc` 抄送地址，`bcc` 密件抄送地址， `;` 多个收件人、抄送、密件抄送人，`subject`邮件主题，`body` 邮件内容
12. `img` 图片，alt: 加载失败时展示文字，title：鼠标滑过展示文字
13. `map area` 可点击区域的图像映射
14. `abbr` 定义缩写，title 属性，鼠标悬浮展示全名
15. `aside` 定义相关内容
16. `article` 定义文章
17. `figure` 定义插图
18. `figcaption` 插图图像的标题
19. `dfn` 标记特殊术语或短语，也可助于创建文档的索引或术语表，斜体
20. `samp` 计算机样式文本
21. `kbd` 键盘文本
22. `var` pre 或 code 中使用，斜体

### 1.4 table

1. `table, tbody, tr, th, td, col, colgroup` 表格专用。tbody：添加了这个标签，只有在完整加载表格之后才显示，否则加载一部分就显示一部分
2. `table 的 summary 属性` 用于在 table 中增强可读性，不会显示在浏览器中
3. `table 的 caption` 表格标题，位于表格正上方

### 1.5 form

1. `form action method` 表单
2. `input type name value` 输入框
3. `textarea rows cols` 文本域
4. `input type=radio/checkbox value name checked=checked` 单选/复选框
5. `select option value selected=selected`下拉列表框
6. `select multipe=multiple`多选，按住ctrl多选
7. `input type=submit|reset` 提交 | 重置
8. `label` 用于点击该标签时，触发此标签所绑定的控件点击属性
9. `fieldset` 表单组件分组，附带默认边框等属性样式
10. `legend` 表单组件分组，分组命名，配合 fieldset 使用

### 1.6 布局

1. `nav` 导航
2. `header` 页眉
3. `footer` 页脚
4. `div p span`
5. `ul li ol dl dt dd`

### 1.7 head 里面使用的标签

#### 1.7.1 link

link：`<link rel="stylesheet" type="text/css" href="theme.css" />`

link.rel: 规定当前文档与被链接文档之间的关系，stylesheet, license, icon, tag...

link.type: 规定被链接文档的 MIME 类型，值为 MIME_type

link.href: 规定被链接文档的位置， url

link.media: 规定被链接文档将被显示在什么设备上， meida_query

link.hreflang: 规定被链接文档中文本的语言，language_code

link.sizes: 规定被链接资源的尺寸，仅当 link.rel === icon 起效

> 2018.7.3 14:03 总结到 link 标签

## 2 html5 种常用标签使用规范

### 2.1 强调、加粗、标识文本时

使用 `<h1> - <h6>` 表示标题，使用 `<em>` 表示强调的文本，使用 `<strong>` 表示重要文本，使用 `<mark>` 表示标注的/突出显示的文本

`<b>` 同样具有加粗的功能，但是它只是一个样式标签，并非语义标签

语义标签：strong, h1, em, strong, mark, del, ins, code, dfn, samp, var ...

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
