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
/*get event*/
var e = window.event||e;
/*get target*/
var ele = e.srcElement ? e.srcElement:e.target;


/*注意：以上这些写法，在每次调用的时候都要进行一次判断，可以考虑采用惰性函数写法*/