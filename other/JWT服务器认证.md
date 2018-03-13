# 采用JWT实现更安全的身份认证

> 原文： [什么是JWT](http://www.jianshu.com/p/576dbf44b2ae)

## 对比JWT、session认证

#### 传统session cookie认证暴露出来的问题

`扩展性`： 用户登录之后，信息只能保存到此台服务器，对于多台服务器的话，就需要再次认证

`session`： 存储在服务器内存，所以用户登录过多，则服务器开销很大

`CSRF`：cookie传输容易被截取，用户很容易受到跨站请求伪造攻击(https能解决)

#### JWT认证

不用保存用户的登录信息，基于token认证机制。

操作流程：

1. 用户登录服务器
2. 服务器验证用户信息
3. 服务器返回token
4. 客户端存储token，每次请求都发送
5. 每次请求服务器验证token，并返回数据

> 问题：
> 
> 如果服务器不存储，那么如何验证用户是否登录了呢？
> 
> 服务器如何验证用户信息呢？因为token也可能被篡改

## JWT详解

JWT由3部分构成： header、payload、signature

**header**: 声明类型jwt、声明加密的算法HMAC SHA256，然后base64编码

**payload**: 载荷就是存放有效信息的地方

**signature**： 签证信息，由header+payload+secret加密编码

> example：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ`

每次使用在请求头里面添加Authorization，并加上Bearer标注

## 适用场景

1. 多台服务器单点登录，身份认证，办法token
2. 用户量庞大，减轻服务器压力

场景很多，想用就可以用到

## 总结

1. 保护好secret私钥，该私钥非常重要
2. 使用https协议
3. JWT是用于身份认证，安全还是要靠https来实现

## 问题解答

如果服务器不存储，那么如何验证用户是否登录了呢？

> 判断token是否过期，token有有效期

服务器如何验证用户信息呢？因为token也可能被篡改？

>能被篡改的只能是 `header`、`payload`部分，`signature`不能被修改，因为有`secret`，每次通过验证`header`和`payload`来和`signature`比较，如果被修改，那么这个JWT就失效，用户重新登录