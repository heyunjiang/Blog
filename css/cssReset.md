## reset

### 1. 什么是reset

浏览器自带默认样式，比如 `margin: 8px;`等，这不是我们想要得，然后我们就要对其进行重置，也就是 `css reset`

进行reset的时候，最好不要使用 `* {margin: 0; padding: 0;}` ，因为这样是造成性能浪费，最好是将你使用到的元素进行reset

> 问：这样为什么会造成性能问题？css的性能问题常见有哪些

### 2. user agent stylesheet

**chrome**

1. body {display: block;margin: 8px;}

**ie11**

1. body {display: block;margin: 8px;}

**firefox57.0.4**

1. body {display: block;margin: 8px;}
