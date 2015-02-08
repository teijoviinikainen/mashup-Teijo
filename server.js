var express = require('express')
var router = require('./router');

var app = express()
app.use('/api/query/books', router);

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})