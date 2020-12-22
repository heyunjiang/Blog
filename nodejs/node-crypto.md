# node-crypto

time: 2020.12.22  
author: heyunjiang

## 说明

之前做前端 open-api 预签名时，用到了这个模块，使用的是 md5 摘要加密实现方式，这里对 crypto 模块做个总结，目的  
1. 了解加密实现原理
2. 加密实现方式有哪些，各自应用场景

## 1 crypto 模块功能总结

1. crypto 提供的是加密功能，实现了对 OpenSSL 的 hash、HMAC、加密、解密、签名、验证功能的一整套封装
2. OpenSSL：是一个软件包，c 语言实现的，内部实现加密功能，实现了 SSL/TLS协议，能运行在常规 os 上，是否是业界通用的加密解密方案？

## 2 hash 摘要

Hash 类用于创建数据的 hash 摘要  
1. 使用 crypto.createHash('sha256') 生成 hash 实例
2. 使用方式一：可读流数据生成 hash 摘要
3. 使用方式二：使用 hash.update + hash.digest 生成 hash 摘要

```javascript
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

hash.update('要创建哈希摘要的数据');
hash.digest('hex')
```

问题：hash 摘要是什么东西？  
答：输出是 string | buffer，摘要也可说是数字签名

## 3 HMAC 摘要

HMAC 类用于创建加密的 HMAC 摘要，格式跟 hash 摘要一样  
1. 使用 crypto.createHmac('sha256', '密钥') 生成 hmac 实例
2. 使用方式一：可读流数据生成 hmac 摘要
3. 使用方式二：使用 hmac.update + hmac.digest 生成 hmac 摘要

```javascript
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', '密钥');

hmac.update('要创建 hmac 的数据');
hmac.digest('hex')
```

## 4 Sign

Sign 是用于生成签名  
1. 使用 crypto.createSign('SHA256') 生成 sign 实例
2. 使用方式一：作为可写流，写入要签名的数据，使用 sign.sign() 生成签名
3. 使用方式二：使用 sign.update() 和 sign.sign() 生成签名

```javascript
const crypto = require('crypto');

// 生成私钥、公钥
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const sign = crypto.createSign('SHA256');
sign.update('要生成签名的数据');
sign.end();
const signature = sign.sign(privateKey); // 私钥加密生成数字签名

const verify = crypto.createVerify('SHA256');
verify.update('要生成签名的数据');
verify.end();
verify.verify(publicKey, signature); // 公钥解密做验证
```

## 参考文章

[OpenSSL 维基百科](https://zh.wikipedia.org/zh-hans/OpenSSL)  
[nodejs 中文网 crypto 模块](http://nodejs.cn/api/crypto.html)  
[廖雪峰 nodejs](https://www.liaoxuefeng.com/wiki/1022910821149312/1023025778520640)
