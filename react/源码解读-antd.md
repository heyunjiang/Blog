# antd源码解读

阅读版本：antd 3+

time: 2018.8.06

为什么要阅读源码？要解决些什么问题？自己想要一些什么收获？怎么阅读

目录

1. 为什么要阅读源码？
2. 要解决些什么问题？
3. 怎么阅读？
4. 归纳总结

## 1 为什么要阅读源码？

想要深入了解这个产品，因为它在我日常项目中用到非常多，github 上已经超过 3w star，深入学习了解它对我个人的帮助是很大的

源码中有些接口是没有对外暴露的，这样学习可以寻找到一些隐藏的接口信息

## 2 要解决些什么问题？

1. antd 是如何设计的？它的设计价值观、设计原则及设计模式是怎样的？
2. 它是如何组织自己的开源项目的？有什么值得学习借鉴并改进的地方？我要做怎么做？
3. 学习它的组件化开发思想，html, css, js, react 配合使用技巧总结

## 3 怎么阅读？

入口：[官网](https://ant.design)

搭配：[github/ant-design](https://github.com/ant-design/ant-design/)

总结：该文档

应用：[hyj-base](https://github.com/hyj-young/hyj-base)

## 4 归纳总结

### 4.1 设计价值观

> antd 基于 `确定` 和 `自然` 的设计价值观，通过模块化的解决方案，降低冗余的生产成本，让设计者专注于更好的用户体验

问：设计价值观有哪些？分别代表什么含义

**设计价值观**：用于判断设计好坏的内在标准。这个标准又是什么？按照有效设计实践遵循规则，提供具体设计问题的向导和一般解决方案

#### 4.1.1 自然

视觉系统为主：通过提炼自然界的客观规律，并运用到界面设计中，创建更有层次的产品体验

后期加入听觉系统、触觉系统等，创建多维、更真实的产品体验

行为执行：辅助用户有效决策、减少用户的额外操作，节省用户脑力和体力，让人机交互更为自然

#### 4.1.2 确定

优秀的产品研发状态：高确定性、低熵值

1. 保持克制：聚焦在最有价值的产品功能打磨，并用尽可能少的设计元素将其表达，有的能做但是选择不做。完美不在于无以附加，而在于无可删减。
2. 面向对象：抽象对象，增强界面设计的灵活性和可维护性，减少设计者的主观干扰，降低系统的不确定性，就是降低熵值。
3. 模块化设计：通用模块抽象，提供有限接口与其他模块互动，最终减少系统的复杂度，进而增强可靠性及可维护性

问题：这里存在一个过度封装，比如我想用其中一个组件，组件能满足我大部分的需求使用，但是有一小点，我要对其做一点个性化的设计，而antd又没有提供对应的接口，那么我就可能需要做些强制性样式或功能修改，很可能去动源码

### 4.2 组件

阅读完官网的所有信息，包含设计语言、组件，组件下的快速上手、cli脚手架、主题、国际化等，开始了我的组件源码阅读，转战github

clone ant-design ，npm install, npm start，运行的效果跟官网的一样，就可以调试以及查看组件源码

antd源码阅读注意事项

1. 网页是由 `md` 文件构建
2. 组件是用 `ts` + `less` 构建
3. 使用 `tsx`: typescript 的 jsx
4. `@types/react`: `npm install -S react @types/react` ，这里是额外获取的 react 的声明文件
5. 使用 `tsconfig.json` 配置文件，可以使用 `awesome-typescript-loader` 配合 webpack 使用

入口：`Button 组件` 作为入口

#### 4.2.1 组件导出

```javascript
import Button from './button';
import ButtonGroup from './button-group';

export { ButtonProps, ButtonShape, ButtonSize, ButtonType } from './button';
export { ButtonGroupProps } from './button-group';

Button.Group = ButtonGroup;
export default Button;
```

同时支持 export 及 export default

#### 4.2.2 typescript 配置

在看到 tsx 的时候，有的东西看不懂，然后就去学习 ts 。antd 内部 ts 配置是在 `const getWebpackConfig = require('antd-tools/lib/getWebpackConfig');` antd-tools 这个 npm 包里面的配置

#### 4.2.3 组件样式设置

1. `components/style/themes/default.less` 全局默认配置样式，这里面分模块端定义样式变量，包括 colors, font, padding, border, icon, link, animation, outline, disableStates, shadow, buttons, checkbox, radio, radioButtons, mediaQueries, grid, layout, zIndex, form, input, toolTip, popover, modal, progress, menu, darkTheme, spin, table, tag, timePicker, carousel, badge, rate, card, tabs, backtop, avatar, switch, pagination, breadcrumb, slider, tree, collapse, message
2. `components/style/mixins/index.less` 里面都是 less 函数式(混合)的写法，包括 size, square, reset, motion, iconfont, clearfix, placeholder
3. `./mixin.less` 全是为 button 定制的 mixin
4. `./index.less` button 主要样式

> 我这里不学习它的颜色计算面的知识，具体在 components/style/color/colorPalette.less 中，里面有使用 less function 等

#### 4.2.4 Button 组件

4.2.4.1 Button className

```javascript
    // 变量作为 key，使用 [string]: value
    // 模板字符串，使用 `${}`
    const classes = classNames(prefixCls, className, {
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-${shape}`]: shape,
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-icon-only`]: !children && icon,
      [`${prefixCls}-loading`]: loading,
      [`${prefixCls}-clicked`]: clicked,
      [`${prefixCls}-background-ghost`]: ghost,
      [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar,
    });
```

4.2.4.2 Button jsx

根据是否传入 `href` 属性，判断是否是超链接还是按钮

```jsx
    if ('href' in rest) {
      return (
        <a
          {...rest}
          className={classes}
          onClick={this.handleClick}
        >
          {iconNode}{kids}
        </a>
      );
    } else {
      const { htmlType, ...otherProps } = rest;

      return (
        <button
          {...otherProps}
          type={htmlType || 'button'}
          className={classes}
          onClick={this.handleClick}
        >
          {iconNode}{kids}
        </button>
      );
    }
```

### 4.3 技巧总结

#### 4.3.1 判断是否是2中文汉字

```javascript
const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
```

### 4.3.2 获取当前 component 实例的真实 dom 节点

```javascript
import { findDOMNode } from 'react-dom';

// Fix for HOC usage like <FormatMessage />
const node = (findDOMNode(this) as HTMLElement);
const buttonText = node.textContent || node.innerText;
```

`findDOMNode` ：使用 ReactDOM 提供的这个方法

`node.textContent || node.innerText` ：使用 textContent ，会返回当前节点及其所有子节点的文本内容，包含 script 内部

> 为什么不用 innerText ?答：因为访问这个属性虽然不会获取到 script 内容，但是它会强制浏览器触发重绘

### 4.4 隐藏接口

1. Button 组件 `prefixCls` prop: 最好不改，默认 ant-btn ；改了可以自定义样式

### 4.5 阅读 Button 组件源码总结

1. 组件设计模式：原来这些庞大的开源项目开发的组件，也跟我自己做项目设计的组件一样的：通过 props 控制组件、预定义 less 变量、有状态与无状态组件、默认 props 与 默认 state
2. 自己需要解决的问题：px em 异同；letter-spacing word-spacing；防抖与节流

## 5 开源项目
