const http = require('http')

const server = http.createServer(() => {
  console.log('hello, http server')
})

server.on('connect', (req) => {
  console.log('connect', req.headers)
})

server.on('request', (req, res) => {
  res.end('hello, client, your header is', req.rawHeaders)
})

server.listen(8001, () => {
  console.log('your server is listening on http://localhost:8001')
})
