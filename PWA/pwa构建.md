# pwa

progressive web app

> 问：为什么说它就是渐进式的呢？什么是渐进式？
> 答：渐进式增强，新技术没有完全普及，先应用普及的技术

目录

1. pwa 特性
2. pwa 中的存储
3. 将站点添加到首屏
4. 实现缓存

待实现功能：

1. 消息推送
2. https 实现
3. App Shell
4. CSP

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

关键点：

1. 图标及图标尺寸，浏览器会从 icons 中选择最接近 128dp 的图片作为启动画面图像
2. 桌面图标：html 中的 `meta` 值一定要跟 `manifest` 中的值一致

### 3.2 引入 manifest.json

在应用入口文件 `index.html` 中引入 `manifest.json`

`<link rel="manifest" href="/manifest.json">`

### 3.3 引导用户添加到主屏幕

奈何这是浏览器自己实现的，目前我也控制不了

1. manifest 文件完整
2. 至少2次访问，间隔不少于5s

## 4 实现缓存

通过 `service worker` + `cache storage` 实现缓存(可以查看[web存储](./web存储.md))

### 4.1 主线程注册 service worker

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw-test/sw.js', { scope: '/sw-test/' }).then(function(reg) {
      if(reg.installing) {
        console.log('Service worker installing');
      } else if(reg.waiting) {
        console.log('Service worker installed');
      } else if(reg.active) {
        console.log('Service worker active');
      }
    }).catch(function(error) {
      // registration failed
      console.log('Registration failed with ' + error);
    });
  }
}
```

### 4.2 service worker 执行缓存

```javascript
const version = 'v2'
const cachedFiles = [
  '/',
  '/index.html',
  '/app.js'
]

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        if(!response || response.status !== 200) {
          return response
        }

        let responseClone = response.clone();
        caches.open(version).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function (e) {
        return e;
      });
    }
  }));
});

```

### 4.3 缓存更新

更新主要是用于清除之前service worker缓存的文件，我要缓存新文件了

```javascript
self.addEventListener('activate', function (event) {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(function (cacheList) {
        return Promise.all(
          cacheList.map(function (cacheName) {
            if (cacheName !== version) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      ])
    );
});
```

### 4.4 ajax 数据处理

对于具有明确 uri 的资源，采用 cache api 实现缓存(ajax请求数据可以缓存)，对于其他数据，使用 indexedDB

> 关键点：在执行添加到主屏幕之前，要保证service worker的缓存执行完毕，这就需要做个引导添加，时机如何选择呢？如果缓存没有执行完毕，那么添加到主屏幕的应用，下次打开方式还是通过浏览器打开的。

****

参考文章

1. [lavas pwa](https://lavas.baidu.com/pwa/README)
