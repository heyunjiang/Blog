# 编辑器图片处理与 pdf 生成

time: 2021-10-29 15:59:05  
author: heyunjiang

## 背景

项目有一个文档在线编辑需求，使用 `mavon-editor` 开源库来作为基本文本编辑，数据作为 string 文本存储在 mysql 数据库中。这里存在2点有挑战需求  
1. 编辑时插入图片，图片存储在什么地方？
2. 用户可以将编辑好的文本下载为 pdf 存储，如何实现？

## 1 编辑器图片处理

首先想的是传统文件存储在服务器，就是后端代码部署的服务器上，但是会随着每次容器镜像重新构建部署，已经存在的文件会丢失，所以这种方案已经不满足需求。

第二种直观想法，是把图片转成 base64 字符串，通常用于小图片的处理，并且图片不能过多，否则整个编辑的文本就非常大，我们的场景是用户可以任意输入，那么 base64 也否定了。

第三种想法，是借助外部存储，通用方案是使用 `对象存储服务`，对象存储是使用 key-value 形式存储。这里又分为业务服务器中转上传、`预签名上传`。预签名上传有个好处，是客户端(比如浏览器)直接链接对象存储服务器上传，速度比业务服务器中转要快，但是流程稍微麻烦一点。

我们采用的是第三种想法，使用预签名上传，关键代码如下

后端 nodejs 服务
```javascript
this.awsInstance = new AWS.S3(...)
// 生成上传签名 url
async createPutPreSignedUrl(query) {
  const params = {Bucket: this.app.config.bucketname, Key: query.fileName, Expires: 300, ContentType: query.ContentType}
  try{
    const result = this.awsInstance.getSignedUrl('putObject', params)
    return ResponseWrapper.success({
      url: result,
      fileName: query.fileName
    })
  }catch(e){
    return ResponseWrapper.fail(e)
  }
}
// 生成下载签名 url
async createGetPreSignedUrl(query) {
  const params = {Bucket: this.app.config.bucketname, Key: query.fileName, Expires: 300}
  try{
    const result = this.awsInstance.getSignedUrl('getObject', params)
    return ResponseWrapper.success({
      url: result,
      fileName: query.fileName
    })
  }catch(e){
    return ResponseWrapper.fail(e)
  }
}
```

前端文件上传与下载  
```javascript
// 图片上传与下载
async imgUploading(pos, $file) {
  const res = await createPutPreSignedUrl({ fileName: $file.name, ContentType: $file.type })
  await fetch(res.data.url, {
    method: 'put',
    headers: {
      'content-type': $file.type
    },
    body: $file,
    mode: 'cors'
  }).then(res => {
    const status = res.status
    if (status !== 200) {
      this.$message.error('图片上传失败！')
    }
  })

  const data = await createGetPreSignedUrl({ fileName: $file.name })
  this.$refs.mdEidt.$img2Url(pos, data.data.url)
}
```

至此，图片的管理已经得到了解决

## 2 pdf 下载方案探索

下载 pdf 方案也有多种，分为客户端实现和服务器实现  
客户端实现：  
1. 暴力实现：window.print()，但是无法实现部分 html 打印，并且也不能要求用户操作过多，一个成熟的产品肯定不会采用这种方案实现
2. jsPdf 插件：默认不支持中文，另外插件也不优雅
3. html 转图片：html2canvas 生成 canvas，然后使用 canvas api 生成图片，图片又不能复制文字，不考虑

服务端实现：  
1. 基于 phantomjs 实现的 `html-pdf` npm 包，社区实现，在 puppeteer 出现之后就停止维护了
2. puppeteer：是谷歌官方出品的 chromium headerless，可以通过 `npm i puppeteer -S` 实现安装，提供了 `page.pdf()` 方法快速生成 pdf 文件，同浏览器打印选择下载 pdf 一样的效果

### 2.1 puppeteer 生成 pdf

这里选择基于 puppeteer 实现的 [md-to-pdf](https://github.com/simonhaenisch/md-to-pdf) 来实现，它内部采用了 `Marked` 将 markdown 文件转换为 html，然后使用 puppeteer 渲染 html 并生成 pdf 文件  
看看核心代码  
```javascript
import { mdToPdf } from 'md-to-pdf'
await mdToPdf({ content }, { dest: 'pdf.pdf' })
```

一行代码就搞定了，生成了我们想要的 pdf 文件，满心欢喜准备发布测试
上线之后，测试发现了问题：下载文件一直提示下载失败。

md，本地开发没问题，线上一跑就出问题，登录线上容器环境查看错误日志，提示  
`.../chrome-linux/chrome: error while loading shared libraries: libatk-1.0.so.0: cannot open shared object file: No such file or directory`

本地我是 macos，线上是 centos，查到资料，看看官方咋提示  
```
Make sure all the necessary dependencies are installed. You can run ldd chrome | grep not on a Linux machine to check which dependencies are missing. The common ones are provided below.

CentOS Dependencies

alsa-lib.x86_64
atk.x86_64
cups-libs.x86_64
gtk3.x86_64
ipa-gothic-fonts
libXcomposite.x86_64
libXcursor.x86_64
libXdamage.x86_64
libXext.x86_64
libXi.x86_64
libXrandr.x86_64
libXScrnSaver.x86_64
libXtst.x86_64
pango.x86_64
xorg-x11-fonts-100dpi
xorg-x11-fonts-75dpi
xorg-x11-fonts-cyrillic
xorg-x11-fonts-misc
xorg-x11-fonts-Type1
xorg-x11-utils

After installing dependencies you need to update nss library using this command

yum update nss -y
```

官方明确说了缺少这些依赖，但是我要一个一个去装吗？继续查询解决方案，发现有一个 issue 里面，有提到一个完整的依赖解决方案  
```bash
# 安装库依赖
yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 -y

# 安装字体依赖
yum install ipa-gothic-fonts xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-utils xorg-x11-fonts-cyrillic xorg-x11-fonts-Type1 xorg-x11-fonts-misc -y
```

好，此刻我的依赖也安装好了，再次跑程序，下载文件，发现还在报错  
```
Running as root without --no-sandbox is not supported
```

至少不是报依赖问题了，发现有类似的 issue，我们给 puppeteer 启动参数添加 '--no-sandbox' 就好

```javascript
import { mdToPdf } from 'md-to-pdf'
await mdToPdf({ content }, {
  dest: 'pdf.pdf',
  launch_options: { args: ['--no-sandbox'] }
})
```

再次下载文件，终于成功把 pdf 给输出出来了

所有问题都解决了吗？  
更新后端代码服务，容器重新启动，之前安装的依赖全部丢失

### 2.2 生成私有 puppeteer 镜像服务

为了保证每次代码更新部署之后，我们的功能都正常使用，那就需要一个稳定的基础环境，这里采用公司云平台提供的私有镜像构建服务，镜像类型为基础镜像，也就是在打包镜像的时候需要的基础环境。
镜像类型分为  
1. 编辑镜像：在构建编译阶段提供的环境
2. 基础镜像：在将构建结果打包为镜像时需要的基础环境
3. 部署镜像：直接可以部署的镜像

在把 puppeteer 在 centos 需要的环境依赖全部打包为私有镜像之后，每次构建都有了这些依赖，项目也正常跑起来了

### 2.3 centos 字体问题

time: 2021-11-05 16:00:14

问题描述：今天功能提交测试，测试小伙伴说下载的 pdf 有问题，存在文字只显示了部分问题。谷歌了一下，发现是中文字体文件缺失问题  
问题分析：中文字体，没有找到 yum install 能加载的，其他人提供的方案都是说把自己机器上的中文字体文件上传到 centos 服务器。md-to-pdf 内部 html 支持的 `font-family: system-ui`，表示从当前系统中自动查找需要的字体

字体文件格式：ttc, ttf  
上传方式：可以通过 `rz` 命令尝试上传  
字体文件保存地址：`/usr/share/fonts/`  
需要执行相关命令  
1. `mkfontscale`
2. `mkfontdir`
3. `fc-cache`

测试能成功，但是正式跑还是不行。自己又搞了一个基础镜像，把字体放在对应目录下就好

## 3 在线编辑功能整体架构

1. 基础环境：包含 centos + nodejs 14 lts + puppeteer 依赖的私有镜像
2. 客户端：chromium 浏览器
3. 编辑器：mavon-editor + vue2
4. 业务服务器：nodejs + eggjs + puppeteer + aws-sdk
5. 对象存储服务：存储图片

## 参考文章

[puppeteer troubleshooting](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch)  
[puppeteer linux 依赖安装](https://github.com/puppeteer/puppeteer/issues/560#issuecomment-325224766)  
[puppeteer sandbox 问题](https://github.com/puppeteer/puppeteer/issues/3698)  
[md-to-pdf](https://github.com/simonhaenisch/md-to-pdf)  
[centos 安装字体](https://www.cnblogs.com/qtong/p/10875438.html)
