# egg 学习总结

time: 2018.11.08  
update: 2020.11.10  
update: 2021-09-26 10:32:48

## 1 为什么学习 egg

1. 掌握服务器中间层开发，做数据 api 转发
2. 提升 js 能力

## 2 带着问题

1. 启动的 nodejs 服务，如果只做中间层，其在整个应用中的架构中是什么位置？如果与其他服务通信？
2. egg 是如何同 koa 整合的？
3. 数据库为什么要使用 orm，或者说使用 orm 有什么好处？
4. egg-mysql 插件工作原理是什么？
5. egg 应用的启动流程？
6. egg loader 是什么？通过 egg-core 查看
7. egg 本身作为一个最基础的框架，被应用使用

## 3 egg 知识点

重要架构：约定 + 配置  
1. controller
2. service
3. 静态资源
4. middleware
5. 路由
6. 单元测试
7. nunjucks 模板渲染

内置对象：Application, Context, Request, Response, Controller, Service, Helper, Config, Logger

### 3.1 路由总结

在学习过 php, nestjs, eggjs 之后，发现后端路由匹配都是统一模式，归纳如下

1. router 和 controller 一一匹配
2. 子路由和控制器方法匹配

### 3.2 config 配置

config 目录中的配置，可以通过 `app.config` 全局获取到

```bash
config
|- config.default.js
|- config.prod.js
|- config.unittest.js
|- config.local.js
```

### 3.3 middlerware

中间件执行时机：在匹配到中间件指定规则时执行，先于业务代码  
中间件的定位是拦截用户请求  
中间件的使用方式：应用 + 插件 + 路由

```javascript
// 开发结构
// app/middleware/robot.js
// options === app.config.robot
module.exports = (options, app) => {
  return async function robotMiddleware(ctx, next) {
    const source = ctx.get('user-agent') || '';
    const match = options.ua.some(ua => ua.test(source));
    if (match) {
      ctx.status = 403;
      ctx.message = 'Go away, robot.';
    } else {
      await next();
    }
  }
};

// config/config.default.js
// 应用使用 robot 中间件
exports.middleware = [
  'robot'
];
// 路由使用
router.verb('path-match', middleware1, ..., middlewareN, app.controller.action);
// robot's configurations
exports.robot = {
  ua: [
    /Baiduspider/i,
  ]
};
```

### 3.4 单元测试

1. 存放在 test 目录下
2. 使用 egg-bin 工具测试

测试格式如下：  
```javascript
// test/app/middleware/robot.test.js
const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/app/middleware/robot.test.js', () => {
  it('should block robot', () => {
    return app.httpRequest()
      .get('/')
      .set('User-Agent', "Baiduspider")
      .expect(403);
  });
});
```

### 3.5 扩展

在 app/extend 目录下，app/extend/{application, context, request, response, helper}.js 来扩展相应对象

### 3.6 插件

使用插件：app/config/plugin.js  
定义插件：app/lib/plugin/  
使用插件：app[plugin_name][plugin_method]

插件本身就是一个 mini 的 app，用于实现一些特定的功能，可插拔，通常包含以下功能：service, middleware, config, extend 等，但是不包括 router, controller，自身也不能定义 plugin.js，能声明其他插件依赖，但是不能决定其他插件的开启与否。

### 3.7 定时任务

应用场景

1. 定时上报应用状态
2. 定时从远程接口更新本地缓存
3. 定时进行文件切割、临时文件删除

### 3.8 内置对象

Application  
1. 从 koa 继承而来
2. 每个应用只会实例化一个
3. 在基于 controller, service 基类的实例中, 使用 this.app, this.ctx.app 访问 application 对象

Context  
1. 从 koa 继承而来
2. 每个请求都会实例化一个
3. 会将 service 挂载到 context 对象上，所以可以通过 this.ctx.service.hello 来获取
4. 在基于 controller, service 基类的实例中, 使用 this.ctx 访问 context 对象

还有 Controller, Service, Request, Response, Helper, Config, Logger, Subscription 对象

## 4 数据库

这里总结下 mysql 使用技巧  
1. egg 插件：egg-typeorm
2. typeorm: orm 组件库
3. orm：object-relationship-mapping，是关系型数据库的面向对象模式实现

ORM 简要总结  
1. class - table，一个类对应一个 table 表
2. object - record，一个 object 对应一条数据
3. attribute - record value，一个 object 属性对应一条数据中的某列值

总结：  
1. orm 是一种关系型数据库操作由面向对象方式的操作规范，而 typeorm 是一个 orm 的 `数据库框架`

## 5 egg 源码解读

基础背景  
1. egg 继承 koa 实现
2. 使用 loader 实现了 controller, service 等模块的加载和处理
3. egg 本身

## 参考文章

[egg 官网](https://eggjs.org/zh-cn/basics/schedule.html)  
[orm 阮一峰](http://www.ruanyifeng.com/blog/2019/02/orm-tutorial.html)  
[github typeorm](https://github.com/typeorm/typeorm)
