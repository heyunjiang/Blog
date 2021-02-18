# node-timer

time: 2020.12.30  
author: heyunjiang

## 基础知识

1. 定时器函数是全局的，同浏览器环境一样，直接使用 setTimeout 即可
2. 定时器函数在 nodejs 环境中实现方式，不同于浏览器，采用了 nodejs 特有的事件循环机制
3. setImmediate()：nodejs 此轮事件循环结束时调用的函数，也就是放在事件队列尾。同浏览器的 setTimeout
4. setTimeout() | setInterval()：当定时器到点时调用的函数。没有事件队列吗？有的，是在每次事件循环时，都会去执行到时的回调函数

> setImmediate 和 setTimeout 除了可以设置 delay 时间外，还有什么区别？  
> 答：setTimeout delay 最小为1，最大不能超过 21 亿

## nodejs 事件循环

## 参考文章

[nodejs 事件循环](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#setimmediate-vs-settimeout)
