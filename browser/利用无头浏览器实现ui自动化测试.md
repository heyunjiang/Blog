# 利用无头浏览器实现ui自动化测试

time: 2019.9.12  
update: 2019.10.23  
author: heyunjiang

## 背景

以往自己的经验及技术能力，比较局限于做网页，比如我熟练掌握的那一套原生 html, css, js, es6, vue, react, webpack, 浏览器, git, nodejs 等，都是用于传统网页制作。一些场景也开发过，比如编辑器、devOps、甘特图、拖拽等等。一些常见问题都能解决，复杂的问题也能大部分解决，所以现在是中级前端工程师。  
之前的项目经验，也是做的一些非常偏业务的工作，一个人也能hold住全场，也能带人一起开发。但是内心不甘于做写普通的业务，许多技术不能得到深入，所以一直在寻找这个突破口。  
如今团队测试ui自动化是个问题，有缘接触到了 poppeteer，也就是传说中的 headless chromium，能通过 nodejs 实现一些操作 chrome 浏览器，内心非常激动，想通过无头浏览器来实现一套 ui 自动化的功能，作为自身的一个技术亮点，也是业务亮点。

## 1 puppeteer 功能简介

先看看 puppeteer 能做什么事情

1. UI 自动化测试，接口测试
2. 屏幕截图，生成 pdf 等
3. 浏览器插件测试
4. ssr预渲染 

我们看来看看如何实现 ui 自动化测试

## 2 登录自动化实现

### 2.1 安装 puppeteer

我们选择安装完整版

```javascript
npm i puppeteer
```

> 完整版包含了最新版本的 chromium ，install 的时候会有几百M，所以稍等一会。我是选择的 cnpm 注册的 taobao 镜像，所以会快很多。

### 2.2 打开网页

```javascript
const puppeteer = require('puppeteer');

(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch({
    args: ['-ignore-certificate-errors'],
    headless: false // 启动界面
  });
  // 打开页面
  const page = await browser.newPage();
  // 开启拦截请求
  await page.setRequestInterception(true);
  page.on('load', () => {
    const url = browser.target().url();
    // 如果是登录页面，则执行自动登录
    if(/login/.test(url)) {
        logauto(page);
    }
  })
  // 进入项目
  await page.goto('https://example.com', {
      waitUntil: 'networkidle2',
      timeout: 60000
  });
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();
```

### 2.3 自动登录

自动登录的实现逻辑：

1. 获取页面元素
2. 填入内容
3. 点击登录

```javascript
const logauto = async (page) => {
  // 获取页面元素
  const userNameInput = await page.$('#username');
  const passwordInput = await page.$('#password');
  const loginbtn = await page.$('.login[name="submit"]');
  // 输入内容
  await userNameInput.type('username');
  await passwordInput.type('password');
  // 点击登录
  loginbtn.click();
}
```

## 3 总结

因为各种因素，没有实现一套完整的自动化测试脚本，只做了自动登录。有一点收获：掌握了 ui 自动化测试、接口自动化测试的实现方案与相关经验。

有趣的是，在做登录自动化时，遇到了公司统一登录的一个漏洞，可以绕过登录验证码直接登录系统，自己在成功尝试之后，也将这个漏洞反馈到相关开发人员，解决了公司一个安全隐患，说大不大，说小也不小。

