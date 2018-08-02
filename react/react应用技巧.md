# react 应用技巧

time: 2018.8.02

## 1 ref 属性

15版本之前：ref 属性设置方式 `ref={this.myRef}`

15及以后版本：ref 属性设置方式 `ref = {(input) => {this.input = input}}`

应用技巧及场景

```javascript
// 在使用 antd 提供的 input 时，直接向input设置默认值，不用再通过 this.input.value 方式设置默认值了
<Input ref={(input) => { input&&(input.refs.input.value = modalGlobalShares.selectedEnterprise.permissionNumber); }} />
```
