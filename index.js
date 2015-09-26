var express = require('express'),
    app = express(),
    http = require('http'),
    path = require('path'),
    server = require('http').Server(app)

var mongojs = require('mongojs');
var mongoUri = 'mongodb://user:user@ds051893.mongolab.com:51893/totemvault';
var db = mongojs(mongoUri, ['users']);


app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.render('index.html');
});

app.get('/create', function(request, response){
  q = request.query;
  db.users.save({user: q.user,
                 password: q.password,
                 website: q.website,
                 userID: q.userID});

  response.json(request.query);
})

app.get('/read', function(request, response){
  q = request.query;
  var matchedCol = {};
  db.users.find({userID : q.userID, website: q.website}, function(err, docs){
    response.json(docs);
  });
})

app.get('/update', function(request,response){
  q = request.query;
  db.users.update({userID : q.userID, website: q.website},
                  {$set: {password: q.password}},
                  function(err, docs){
    response.json(docs);
  })
})

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
