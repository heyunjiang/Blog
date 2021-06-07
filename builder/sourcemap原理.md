# sourcemap原理

time: 2021-06-07 16:10:04  
author: heyunjiang

## 背景

我们都知道项目构建输出结果，js 文件是经过了压缩和混淆的，在日志收集和错误定位场景中，需要知道源代码的确切位置，这就需要使用 sourcemap 文件，将生成代码映射到源代码。  
这里就想知道是如何映射的？映射是到构建前的文件，还是构建后的？

## 1 预备知识

1. .map 文件为 sourcemap 文件，体积为压缩结果文件的 2 倍左右大小
2. 压缩文件为一个 chunk 时，通常会包含多个源文件，工作原理见 [webpack 源码分析-核心流程](builder/webpack-源码分析-核心流程.md)
3. chrome-dev-tool 自带 sourcemap 解析功能
4. 我们在使用 webpack 等构建工具打包时，会对源文件进行处理，比如 .vue 文件在经历 loader、plugin 等处理之后，会将 template 转成 render 函数

## 2 映射原理 - 自我分析

自己分析 .js .map 文件  
```javascript
// .js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([
  ["chunk-0ab089c0"],
  {
    "1cb9": function(t, e, n) {
      "use strict";
      n.r(e);
      var u = n("ee4e"),
        r = n.n(u);
      for (var a in u)
        "default" !== a &&
          (function(t) {
            n.d(e, t, function() {
              return u[t];
            });
          })(a);
      e["default"] = r.a;
    }
  }
]);
//# sourceMappingURL=chunk-0ab089c0.js.map

// .map
{
  "version": 3,
  "sources": [
    "webpack:///./src/views/xxxxxx/index.vue?8936",
    "webpack:///./src/views/xxxxxx/index.vue",
    "webpack:///./src/views/xxxxxx/index.vue?192c",
    "webpack:///./src/views/xxxxxx/index.vue?53b8",
    "webpack:///./src/views/xxxxxx/index.vue?738e"
  ],
  "names": [
    "component",
    "Object",
    "defineProperty",
    "exports",
    "value",
    "default",
    "_default",
    "name",
    "mounted",
    "this",
    "$nextTick",
    "methods",
    "render",
    "_vm",
    "_h",
    "$createElement",
    "_self",
    "_c",
    "_m",
    "staticRenderFns",
    "staticStyle",
    "_v"
  ],
  "mappings": "kHAAA,iHAA6W,eAAG,G,kCCAhX,oIAOIA,EAAY,eACd,aACA,OACA,QACA,EACA,KACA,KACA,MAIa,aAAAA,E,2CChBfC,OAAOC,eAAeC,EAAS,aAAc,CAC3CC,OAAO,IAETD,EAAQE,aAAU,EAQlB,IAAIC,EAAW,CACbC,KAAM,iBACNC,QAAS,WACPC,KAAKC,WAAU,gBAEjBC,QAAS,IAEXR,EAAQE,QAAUC,G,kCCpBlB,IAAIM,EAAS,WAAa,IAAIC,EAAIJ,KAASK,EAAGD,EAAIE,eAAsBF,EAAIG,MAAMC,GAAO,OAAOJ,EAAIK,GAAG,IACnGC,EAAkB,CAAC,WAAa,IAAIN,EAAIJ,KAASK,EAAGD,EAAIE,eAAmBE,EAAGJ,EAAIG,MAAMC,IAAIH,EAAG,OAAOG,EAAG,MAAM,CAACA,EAAG,IAAI,CAACG,YAAY,CAAC,QAAU,SAAS,CAACP,EAAIQ,GAAG,gBCDpK",
  "file": "static/js/chunk-0ab089c0.js",
  "sourcesContent": [
    "import mod from \"-!../../../../node_modules/cache-loader/dist/cjs.js??ref--12-0!../../../../node_modules/thread-loader/dist/cjs.js!../../../../node_modules/babel-loader/lib/index.js!../../../../node_modules/cache-loader/dist/cjs.js??ref--0-0!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./index.vue?vue&type=script&lang=js&\"; export default mod; export * from \"-!../../../../node_modules/cache-loader/dist/cjs.js??ref--12-0!../../../../node_modules/thread-loader/dist/cjs.js!../../../../node_modules/babel-loader/lib/index.js!../../../../node_modules/cache-loader/dist/cjs.js??ref--0-0!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./index.vue?vue&type=script&lang=js&\"",
    "import { render, staticRenderFns } from \"./index.vue?vue&type=template&id=6c70a1a4&\"\nimport script from \"./index.vue?vue&type=script&lang=js&\"\nexport * from \"./index.vue?vue&type=script&lang=js&\"\n\n\n/* normalize component */\nimport normalizer from \"!../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js\"\nvar component = normalizer(\n  script,\n  render,\n  staticRenderFns,\n  false,\n  null,\n  null,\n  null\n  \n)\n\nexport default component.exports",
    "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = void 0;\n//\n//\n//\n//\n//\n//\n//\nvar _default = {\n  name: 'AssetsDatabase',\n  mounted: function mounted() {\n    this.$nextTick(function () {});\n  },\n  methods: {}\n};\nexports.default = _default;",
    "var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0)}\nvar staticRenderFns = [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('p',{staticStyle:{\"padding\":\"20px\"}},[_vm._v(\"规划中...\")])])}]\n\nexport { render, staticRenderFns }",
    "export * from \"-!../../../../node_modules/cache-loader/dist/cjs.js?{\\\"cacheDirectory\\\":\\\"node_modules/.cache/vue-loader\\\",\\\"cacheIdentifier\\\":\\\"d98d040a-vue-loader-template\\\"}!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/cache-loader/dist/cjs.js??ref--0-0!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./index.vue?vue&type=template&id=6c70a1a4&\""
  ],
  "sourceRoot": ""
}

```

归纳分析  
1. 在 .js .map 中都指明了互相依赖的是谁
2. sourcemap 文件是一个 json 对象文件，有一定格式: version, sources, names, mappings, file, sourcesContent, sourceRoot

## 3 映射原理 - 解密

sourcemap 对象属性  
1. version: sourcemap 规范版本
2. file: 压缩文件名
3. sourceRoot: 源文件地址目录
4. names: 转换前的变量和属性名
5. sourcesContent: 源文件内容数组
6. sources: 源文件名数组
7. mappings: 记录位置信息的字符串，核心内容

关键："mappings": "kHAAA,iHAA6W,eAAG,G"，采用 VLQ 编码，使用 5 位来表示一个联系的字符串，也就是一个单词  
1. 第一位表示 `压缩后` 的代码第几列(因为压缩后通常为一行，省去了行号)
2. 第二位表示 `sources` 第几个文件
3. 第三位表示 `转换前` 的第几行
4. 第四位表示 `转换前` 的第几列
5. 第五位表示 `names` 的第几个变量

注意：  
1. mappings 有可能有分号，分号表示压缩后的代码换行
2. mappings 开始表示从压缩后源码开始，会省去 webpack 插入的 window["webpackJsonp"] 等字符
3. mappings 第一个单元表示绝对的行列数，而后续所有单元都表示相对于前一个单元的位置，取的 `相对位置`
4. mappings 单元采用 base64 编码的字符表来表示字符单元

总结：我们知道了 sourcemap 文件中包含了映射的全部信息，包括源码、mappings 对象映射压缩后代码等，**每个 mapping 单元表示了压缩后单词所在哪个文件的哪行哪列对应哪个变量**

## 参考文章

[soucemap 详解 - 阮一峰](https://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)  
[sourcemap 是个啥](https://segmentfault.com/a/1190000020213957)  
[source map原理分析&vlq](http://www.qiutianaimeili.com/html/page/2019/05/89jrubx1soc.html)
