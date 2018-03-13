最近做了一个文件下载的功能，需要在chrome、firefox、ie9+等主流浏览器中实现，还包括android和iphone的safari中实现下载

## 实现原理

通过ajax发起请求，server端返回一个请求数据流的url地址，然后通过生成a标签并点击它，或者使当前窗口重新加载返回的url地址，去请求服务端的文件数据流，浏览器会将数据流直接实现文件保存。(我们后台是java实现，返回的文件数据流，为什么不直接返回文件的uri呢，因为uri不能完全兼容，返回数据流能兼容)

## 实现代码

```
		const fileData = yield call( downloadFileStream, payload)
        if(fileData.statusCode == 200){
          try{
            if(typeof(fileData.data)=='object'&&fileData.data.url&&fileData.data.url.indexOf('http')!=-1){
                //检测是否是ios
                if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)&&document.body.clientWidth < 769){
                  window.location.href = fileData.data.url
                }
                let tempLink = document.createElement('a');
                tempLink.style.display = 'none';
                tempLink.href = fileData.data.url;
                tempLink.setAttribute('download', '');
                if (typeof tempLink.download === 'undefined') {
                  tempLink.setAttribute('target', '_blank');
                }
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
            }
            //错误提示
            if(typeof(fileData.data)=='object'&&fileData.data.lstFail&&fileData.data.lstSucc){
              if(fileData.data.lstFail.length>0){
                let errorMessage = '', succ = [], fail = []
                fileData.data.lstSucc.forEach(item=>{
                  succ.push(item.docName)
                })
                if(succ.length>0){
                  errorMessage += (succ.join(',')+'能下载，')
                }

                fileData.data.lstFail.forEach(item=>{
                  errorMessage += (item.docName+':'+item.failReason+' ')
                })
                message.error(errorMessage)
              }
            }else{message.error('服务器返回数据格式错误')}
          }catch(e){
            message.error(e)
          }
        }else {
          let msg
          fileData.statusCode>=500&&fileData.statusCode<600?msg='服务器错误':msg = fileData.message
          message.error(msg)
        }
```

## 注意点

1. 返回的是用于请求文档流的url，这个url对应后台一个方法
2. iphone和其他下载方式不一样，并且目前只能实现 `window.location.href` 方式下载。为什么？在 `const fileData = yield call( downloadFileStream, payload)` 之后调用 `a.click()` 或者 `window.open` 方式去下载，总是不成功，目前也在寻找原因