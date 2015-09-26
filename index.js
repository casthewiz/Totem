var express = require('express'),
    app = express(),
    http = require('http'),
    path = require('path'),
    server = require('http').Server(app)
    Db = require('mongodb').Db;
    Connection = require('mongodb').Connection;
    Server = require('mongodb').Server;
    BSONVar = require('mongodb').BSON;
    ObjectID = require('mongodb').ObjectID;

var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI ||
      'mongodb://user:user@ds051893.mongolab.com:51893/totemvault'

    mongo.Db.connect(mongoUri, function (err, db) {
      db.collection('mydocs', function(er, collection) {
        collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
        });
      });
    });


app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.render('index.html');
});

app.get('/new-password', function(request, response){

})

app.get('/new-user', function(request, response){

})

app

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
