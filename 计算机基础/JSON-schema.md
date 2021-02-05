# JSON-schema

time: 2021.2.2  
author: heyunjiang

## 背景

最近在做 nodejs 配置读取模块，涉及到对配置文件的数据校验，这里做一个对 json 及 schema 的经验总结

## 1 schema 是什么

schema 是格式、规范，JSON schema 是定义了 JSON 数据格式的一套规范，有专门的 [JSON Schema](http://json-schema.org/) 规范  
存在的意义：规范化 json 格式校验，其他库实现皆以此为标准。比如定义了 type, properties 等属性，值为 nunber 整型时，type 为 integer，而 number 为小数型，type 为 number

## 2 为什么要做 json 数据格式校验

也就是说，做数据格式校验有什么收益？  
1. 尽早暴露数据格式问题，不用等到程序执行时再去发现问题，快速定位

## 3 example

可以通过 https://jsonschema.net/home 或 https://www.liquid-technologies.com/online-json-to-schema-converter 生成  
```javascript
export const configSchema = {
  "type": "object",
  "properties": {
    "appId": {
      "type": "integer"
    },
    "appSecret": {
      "type": "string"
    },
    "port": {
      "type": "integer"
    },
    "plugins": {
      "type": "array",
      "items": {}
    }
  },
  "required": [
    "appId",
    "appSecret",
    "port",
    "plugins"
  ]
}
```

## 4 AJV

```typescript
import Ajv from "ajv"
import { configSchema } from './Const'

export default class ConfigValid {
  private validate: any

  constructor() {
    const ajv = new Ajv()
    this.validate = ajv.compile(configSchema)
  }

  valid(data: object): boolean | [] {
    if (this.validate && this.validate(data)) {
      return true
    } else {
      return this.validate.errors
    }
  }
}
```

## 参考文章

[JSON Schema 快速入门](https://juejin.cn/post/6844903458097594381#heading-12)  
[JSON Schema 官网](http://json-schema.org/)  
[AJV](https://github.com/ajv-validator/ajv)  
