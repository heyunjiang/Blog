# web存储

## 1 存储分类

### 1.1 按数据模型

1. 结构化：预定义字段的表格中存储数据： `sql` ， `indexedDB`
2. 键值： `nosql` ， `哈希表` ， `cache api` ，`apache cassandra`
3. 字节流：简单模型，可变长度、不透明字节字符串形式： `文件系统` 、 `云端存储服务`

### 1.2 按存储时间

1. 会话持久化：保存在网页会话或浏览器标签活跃时，浏览器关闭则数据自动清除，如： `session storage`
2. 设备持久化：保存在指定设备中，跨会话和浏览器标签，长期有效，如： `cache storage` 、 `localstorage`
3. 全局持久化：跨会话和设备保存数据，最可靠的数据持久化，如： `服务器存储` 、 `云存储`

### 1.3 所有浏览器存储比较

数据来源于[lavas](https://lavas.baidu.com/pwa/offline-and-cache-loading/web-storage/overview)

| API     | 数据模型  |  持久化  | 浏览器支持 | 事务处理 | 异步/同步 |
| -------- | :-----: | :----:   | :----:    | :----:  | :----:    |
| file system | 字节流 | 设备 | 52% | 不支持 | 异步 |
| cloud storage | 字节流 | 全局 | 100% | 不支持 | 两者都有 |
| cookie | 结构化 | 设备 | 100% | 不支持 | 同步 |
| websql | 结构化 | 设备 | 77% | 支持 | 异步 |
| indexedDB | 混合 | 设备 | 83% | 支持 | 异步 |
| cache storage | 键值 | 设备 | 60% | 不支持 | 异步 |
| session storage | 键值 | 设备 | 93% | 不支持 | 同步 |
| local storage | 键值 | 设备 | 93% | 不支持 | 同步 |

从上表可以看出：localstorage、sessionstorage属于同步存储，而cachestorage属于异步存储，这也是 `service worker` 只能使用 `cachestorage` 的原因

对于大部分存储，可以通过查看 chrome -> Application ，可以看到这些存储数据
