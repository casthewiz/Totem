var express = require('express'),
    app = express(),
    http = require('http'),
    path = require('path'),
    server = require('http').Server(app)


app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.render('index.html');
});


server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
