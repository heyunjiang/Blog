/*
 * name: websocket 服务器
 * function: 用于浏览器 websocket 测试，当浏览器链接的时候，每隔1s返回浏览器的ip地址信息
 * design: ws
 * designer: heyunjiang
 * time: 2018.6.7
 */

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8181 });

wss.on('connection', function connection(ws, req) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  sendInternalFunc(ws, req)
});

const sendInternalFunc = (function() {
	let times = 4
	return function sendInternal(ws, req) {
		if(times > 0) {
	  		setTimeout(function(){
	  			ws.send(times+'-'+req.connection.remoteAddress);
	  			times--
	  			sendInternal(ws, req)
	  		}, 1000)
	  	}
	}
})()

console.log("socket is listening on 8181")