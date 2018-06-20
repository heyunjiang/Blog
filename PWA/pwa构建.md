# pwa

progressive web app

> 问：为什么说它就是渐进式的呢？什么是渐进式？
> 答：渐进式增强，新技术没有完全普及，先应用普及的技术

目录

1. pwa 特性
2. pwa 中的存储
3. 将站点添加到首屏

## 1 pwa 特性

1. 可靠性：离线或网络差环境下也能快速加载并展现，不会白屏，安全(service worker + cache storage + https)
2. 体验：快速响应，并且有平滑的动画响应用户操作(浏览器支持pwa + App Shell)
3. 粘性：原生应用体验，添加到桌面(mainifest.json + push nofification)
4. 渐进式：适用于所有浏览器，渐进式增强(?怎么理解)
5. 持续更新：始终是最新的，无版本和更新问题(每次有更新，就替换原有旧版本)

## 2 pwa 中的存储

具有明确uri的资源：cache api

所有其他数据：indexedDB

## 3 将站点添加到首屏

本步骤将实现添加站到到应用首屏，包括应用图标、启动页、独立应用等

### 3.1 manifest.json

创建一个 `manifest.json` 文件，内容格式如下

```json
{
  "name": "character search", // 打开后网页名称
  "short_name": "password", // 图标下的名称
  "icons": [
    {
  	  "src": "/android-chrome-192x192.png",
  	  "sizes": "192x192",
  	  "type": "image/png"
  	},
  	{
  	  "src": "/android-chrome-512x512.png",
  	  "sizes": "512x512",
  	  "type": "image/png"
  	}
  ],
  "start_url": "./index.html", // 默认加载页
  "theme_color": "#181743", // 主题
  "background_color": "#141415", // 启动背景颜色
  "display": "standalone" // 启动类型，通常设置 standalone、fullscreen
}
```

关键点：图标及图标尺寸，浏览器会从 icons 中选择最接近 128dp 的图片作为启动画面图像

### 3.2 引入 manifest.json

在应用入口文件 `index.html` 中引入 `manifest.json`

`<link rel="manifest" href="/manifest.json">`

## 4 实现缓存

****

参考文章

1. [lavas pwa](https://lavas.baidu.com/pwa/README)
