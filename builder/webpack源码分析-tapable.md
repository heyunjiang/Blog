# webpack 源码分析-tapable

time: 2021-04-12 20:21:54  
author: heyunjiang

## 1 基本使用

tapable 作为 webpack 的核心模块，几乎所有模块都 extends 了 tapable。  
tapable 提供钩子实现，步骤如下

第一步，定义钩子：实例化各钩子函数  
```javascript
class Car {
	constructor() {
		this.hooks = {
			accelerate: new SyncHook(["newSpeed"]),
			brake: new SyncHook(),
			calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
		};
	}
}
```

第二部，添加钩子事件：可以在同一钩子上，挂载多个事件，通过 tap, tapAsync, tapPromise 来挂载  
```javascript
const myCar = new Car();
myCar.hooks.brake.tap("WarningLampPlugin", () => warningLamp.on());
myCar.hooks.calculateRoutes.tapPromise("GoogleMapsPlugin", (source, target, routesList) => {
	return google.maps.findRoute(source, target).then(route => {
		routesList.add(route);
	});
});
myCar.hooks.calculateRoutes.tapAsync("BingMapsPlugin", (source, target, routesList, callback) => {
	bing.findRoute(source, target, (err, route) => {
		if(err) return callback(err);
		routesList.add(route);
		callback();
	});
});
myCar.hooks.calculateRoutes.tap("CachedRoutesPlugin", (source, target, routesList) => {
	const cachedRoute = cache.get(source, target);
	if(cachedRoute)
		routesList.add(cachedRoute);
})
```

第三部，触发钩子：实例通过 call, promise, callAsync 来触发钩子，传入需要的属性参数  
```javascript
class Car {
	setSpeed(newSpeed) {
		this.hooks.accelerate.call(newSpeed);
	}

	useNavigationSystemPromise(source, target) {
		const routesList = new List();
		return this.hooks.calculateRoutes.promise(source, target, routesList).then((res) => {
			return routesList.getRoutes();
		});
	}

	useNavigationSystemAsync(source, target, callback) {
		const routesList = new List();
		this.hooks.calculateRoutes.callAsync(source, target, routesList, err => {
			if(err) return callback(err);
			callback(null, routesList.getRoutes());
		});
	}
}
```

## 2 源码实现

## 3 抽离通用

## 参考文章

[tapable github](https://github.com/webpack/tapable)
