# parcel

time: 2020.5.13  

## 基本使用总结

1. 直接使用 parcel 在已有 webpack, vue 项目中，是不行的，构建不通过

2. 构建 vue 单文件组件，可以使用 @vue/cli-service，用于构建项目、库、web components 都可以。但是如果涉及到最新 es 语法，则需要 babel 配置支持

3. 发布 vue 组件 npm 包，我们可以发布为独立引入的 js 库，通过 require 引入组件；也可以发布为 vue 插件，通过 vue.use 饮用

4. 通过 parcel 打的包，只能在 parcel 启动的项目中使用，不能混合使用包含 es6 语法的项目，比如你使用了 `<script type="module">` 

这里总结一下 parcel 特点

1. 可以 0 配置启动一个 vue 或 react 项目，因为它本身会自动识别并转换相应代码

2. 它可以以一个 .vue, .html, .js 等任何文件作为一个打包入口

3. parcel 对任何资源有自身处理，不用再像 webpack 那样设置 css-loader, vue-loader 了

4. parcel 打的包，最好在 parcel 项目中使用，因为 parcel 包不能在 use stric 环境中使用

5. parcel 打包快，因为它使用了 cache 缓存 + 多核处理，后续可以快速启动一个项目来玩，同 @vue/cli-server 一样可以快速启动一个 .vue 文件

