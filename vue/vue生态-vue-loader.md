# vue生态-vue-loader

time: 2020.5.27

## 背景

我们写完一个 vue 组件，需要在 webpack 配置中，使用 vue-loader 来转换一次，才能在项目中使用。  
问题：为什么要转换一次呢？vue 反正不是要编译吗？他们之间是什么关系？

> 写了这么久的 vue ，这点还不知道，有点搓了。

## 1. vue-loader 作用

1. 编译 `.vue` 格式的文件
2. 支持其他 webpack loader 来编译 template、js、css 模块
3. 支持自定义块，使用自定义 loader
4. 加载 template、css 引用的资源模块
5. 支持组件 css Module，所以我们可以写 `scoped css`, global css, `css in js 功能`, Composition 合成 (也就是直接指定使用其他类名，sass 功能重复)
6. scoped css：这一点与 css module 重复了，但是如果用户不开启 css module，这点就有用了
6. 支持了 .vue 的热重载

问题：  
1. 经过 vue-loader 处理过后的文件应该是什么？也就是说，我们编写的 .vue 组件，如果打包成一个 lib 库，是否需要包含 dependency 内容？
2. 如果不使用 vue-loader，我们的组件应该怎么写？也就是说 vue 直接可以支持的组件应该怎么写？ [答案](#1.2-vue-组件)

注意点  
1. 使用 scoped css 时，使用 class 来代替 p 等标签选择器，可以提升速度，因为

### 1.1 vue 应用

使用 Vue 构造函数：内部传入普通组件配置，包含 template、data 等选项，另外根示例需要包含 `el` 选项

```javascript
// 1. 使用 Vue 创建 vue 实例
new Vue({
  el: '#blog-post-demo',
  data: {
    posts: [
      { id: 1, title: 'My journey with Vue' },
      { id: 2, title: 'Blogging with Vue' },
      { id: 3, title: 'Why Vue is so fun' }
    ]
  }
})
```

使用 Vue.extend 构造新的实例，然后实例化它：可以作为一个组件使用，也可以直接 mount 到一个 dom 节点上

```javascript
// 2. 使用 Vue.extend 创建子类，内部构造器默认传入了一些配置
var Profile = Vue.extend({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  }
})
// 创建 Profile 实例，并挂载到一个元素上。
new Profile().$mount('#mount-point')
```

### 1.2 vue 组件

我们通常写的 .vue 组件，其实是会被 vue-loader 给处理成 vue 标准组件的。vue 官方组件配置如下

```javascript
// 3. 组件配置
{
  data: function () {
    return {
      count: 0
    }
  },
  template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
}
```

注册组件：全局注册 Vue.component('vue-name', {})，局部注册 {components: [{}]}

vue-loader 在编译之后，会将 .vue 文件编译成一个 .js 文件，包含 template 字段的配置对象。来看看 Vue.component 方法做了什么

```javascript
import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        // 如果是 Vue.component，并且第二个参数是配置对象，则使用 Vue.extend 实例化这个组件
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
```

从这个方法可以看出，我们在全局或者局部注册组件时，才会去调用 Vue.extend 去实例化一个组件，并且返回实例化后的组件  
在我们编写组件时，通过 vue-loader 处理之后，是不会去生成 vue 实例的

问：全局注册组件，和局部注册组件有什么区别？  
答：2者都是通过 Vue.extend 去实例化一个新组件，并把这个组件对象挂载在自身 vue 示例对象上。
在编译之后，执行 render 的 _createElement 生成 vnode 实例时，会去查找 `this.options.components` 对象，如果找到，则顺利执行 createComponent 方法生成 vnode 实例，如果找不到，则生成 html 自定义标签。
2者区别，全局注册，会在每个 vue 实例的 options.components 对象上都有这个全局组件属性，而局部注册，只有在当前组件实例上有这个组件属性。

```javascript
  // _createElement 源码
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  }
```

### 1.3 vue-loader 编译 .vue 文件

为了测验一下 vue-loader 会如何对 .vue 组件进行处理，我们用 parcel 来构建一个 .vue 组件，看看输出结果

```javascript
// test.vue
<template>
  <div class="hello">hello world</div>
</template>
<script>
/**
 * @title 
 * @desc 
 * @author heyunjiang
 * @date 
 */
export default {
  name: "",
  components: {},
  mixins: [],
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
}
</script>
<style lang="scss" scoped>
  .hello {
    color: red;
  }
</style>
```

将 test.vue 组件编译之后，得到如下结果

```javascript
/**
 * @title 
 * @desc 
 * @author heyunjiang
 * @date 
 */
var _default = {
  name: "",
  components: {},
  mixins: [],
  props: {},

  data() {
    return {};
  },

  computed: {},
  watch: {},

  created() {},

  mounted() {},

  methods: {}
};
exports.default = _default;
        var $5e88b2 = exports.default || module.exports;
      
      if (typeof $5e88b2 === 'function') {
        $5e88b2 = $5e88b2.options;
      }
    
        /* template */
        Object.assign($5e88b2, (function () {
          var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"hello"},[_vm._v("hello world")])}
var staticRenderFns = []

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: "data-v-5e88b2",
            functional: undefined
          };
        })());
```

结果分析：  
1. 文件类型变化：.vue 会变成 .js 文件
2. 我们所写的 template，会变成 export 对象的 render 函数，内部使用 vm.$createElement() 来构造了元素的创建，当调用 render 时才会去构造 vdom
3. css：会变成独立的一个 css 文件或者内部一个 css 对象，取决于用户的配置

归纳：  
1. 也就是说，我们编译之后的组件，其实也就是一个对象，Vue 通过注册识别这个对象，来渲染它。
2. vue 通过 Vue.extend 来解析这个组件，实例化为一个 vue 实例，从而渲染到一个节点上。

问题：  
1. 在非 vue 技术栈中，能否使用这个组件？

## 2. vue-loader 原理

## 参考文章

[vue loader 中文文档](https://vue-loader.vuejs.org/zh/#vue-loader-%E6%98%AF%E4%BB%80%E4%B9%88%EF%BC%9F)
