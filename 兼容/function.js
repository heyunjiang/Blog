/* getOS */
function getOs(){
	var agent = navigator.userAgent.toLowerCase(),opera = window.opera;
	var browser = {
		ie:/(msie\s|trident.*rv:)([\w.]+)/.test(agent),
		opera:( !!opera && opera.version ),
		webkit:( agent.indexOf( ' applewebkit/' ) > -1 ),
		mac:( agent.indexOf( 'macintosh' ) > -1 ),
		quirks:( document.compatMode == 'BackCompat' )
	}
	return browser;
}
/*bindEvent*/
function bindEvent(type, func){
	if(this.addEventListener){
		this.addEventListener(type, func);
	}else if(this.attachEvent){
		this.attachEvent('on'+type, func);
	}
}

/* 0.1 + 0.2 = 0.3 */
function numberPlus(arr) {
	if(!Array.isArray(arr)) {return arr}
	return arr.reduce(function(pre, value) {
		let len1 = pre.toString().split('.')[1] || '';
		let len2 = value.toString().split('.')[1] || '';
		let maxLen = Math.pow(10, Math.max(len1.length, len2.length))
		return (pre*maxLen + value*maxLen)/maxLen
	})
}


/*get event*/
var e = window.event||e;
/*get target*/
var ele = e.srcElement ? e.srcElement:e.target;


/*注意：以上这些写法，在每次调用的时候都要进行一次判断，可以考虑采用惰性函数写法*/