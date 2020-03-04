# 目录规范

time: 2020.3.4

## 规范

这里总结一下 vue 目录规范

```bash
├── build                      # webpack.config.js
├── config                     # webpack 快捷配置
├── public                     # 静态资源
│   └── index.html             # html模板
├── src                        # 源代码
│   ├── api                    # api 统一管理入口
│   ├── assets                 # 主题 字体等静态资源
│   │   ├── image              # 图片
│   │   ├── json               # json数据
│   │   ├── svg                # svg
│   │   ├── icon               # 字体
│   │   └── styles             # 样式文件
│   ├── components             # 公用组件
│   │   ├── bizComponents      # 通用业务组件
│   │   └── commonComponents   # 跨项目通用组件
│   ├── layout                 # 布局组件
│   ├── locales                # i18n
│   ├── router                 # 路由
│   ├── service                # service
│   ├── store                  # store
│   ├── utils                  # 公用方法集合
│   ├── pages                  # 业务逻辑文件夹
│   ├── App.vue                # 根元素
│   └── main.js                # 入口文件
│   └── i18n.js                # i18n入口
├── .eslintrc.js               # eslint 配置项
├── .eslintignore              # eslint 忽略文件
├── .gitignore                 # git忽略文件
├── .npmrc                     # npm配置文件
├── README.md                  # 描述
├── .editorconfig              # 某些格式化基准
├── .babel.config.js           # babel-loader 配置
├── postcss.config.js          # postcss 配置
└── package.json               # package.json
└── package-lock.json          # 依赖包锁文件
```
