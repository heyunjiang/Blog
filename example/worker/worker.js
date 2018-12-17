onmessage = function(e) {
    console.log(e)
}
throw new Error('hello worker')
