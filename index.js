var express = require('express'),
    app = express(),
    http = require('http'),
    path = require('path'),
    server = require('http').Server(app),
    stdio = require('stdio'),
    asyncd = require('async'),
    Clarifai = require('./clarifai_node.js');

var mongojs = require('mongojs');
var mongoUri = 'mongodb://user:user@ds051893.mongolab.com:51893/totemvault';
var db = mongojs(mongoUri, ['users']);


Clarifai.initAPI("5asB7ajcwlUTo5oz4HkTIEpkioyzxv3WgMEPiVPB", "-bWq-UI43nFEriSGZm6tYexF47HcRFThGwCmjeAU" );

//auth flag
var authed = false;

var opts = stdio.getopt( {
	'print-results' : { description: 'print results'},
	'print-http' : { description: 'print HTTP requests and responses'},
	'verbose' : { key : 'v', description: 'verbose output'}
});
var verbose = opts["verbose"];
Clarifai.setVerbose( verbose );
if( opts["print-http"] ) {
	Clarifai.setLogHttp( true ) ;
}

if(verbose) console.log("using CLIENT_ID="+Clarifai._clientId+", CLIENT_SECRET="+Clarifai._clientSecret);

// Setting a throttle handler lets you know when the service is unavailable because of throttling. It will let
// you know when the service is available again. Note that setting the throttle handler causes a timeout handler to
// be set that will prevent your process from existing normally until the timeout expires. If you want to exit fast
// on being throttled, don't set a handler and look for error results instead.

Clarifai.setThrottleHandler( function( bThrottled, waitSeconds ) {
	console.log( bThrottled ? ["throttled. service available again in",waitSeconds,"seconds"].join(' ') : "not throttled");
});

function commonResultHandler( err, res ) {
	if( err != null ) {
		if( typeof err["status_code"] === "string" && err["status_code"] === "TIMEOUT") {
			console.log("TAG request timed out");
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "ALL_ERROR") {
			console.log("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "TOKEN_FAILURE") {
			console.log("TAG request received TOKEN_FAILURE. Contact Clarifai support if it continues.");
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "ERROR_THROTTLED") {
			console.log("Clarifai host is throttling this application.");
		}
		else {
			console.log("TAG request encountered an unexpected error: ");
			console.log(err);
		}
    return 0;
	}
	else {
    console.log(res["results"]);
    console.log(res["results"][0].result);
    resolveLock(res["results"][0].result);
		// if( opts["print-results"] ) {
		// 	// if some images were successfully tagged and some encountered errors,
		// 	// the status_code PARTIAL_ERROR is returned. In this case, we inspect the
		// 	// status_code entry in each element of res["results"] to evaluate the individual
		// 	// successes and errors. if res["status_code"] === "OK" then all images were
		// 	// successfully tagged.
		// 	if( typeof res["status_code"] === "string" &&
		// 		( res["status_code"] === "OK" || res["status_code"] === "PARTIAL_ERROR" )) {
    //
		// 		// the request completed successfully
		// 		for( i = 0; i < res.results.length; i++ ) {
		// 			if( res["results"][i]["status_code"] === "OK" ) {
		// 				console.log( 'docid='+res.results[i].docid +
		// 					' local_id='+res.results[i].local_id +
		// 					' tags='+res["results"][i].result["tag"]["classes"] )
		// 			}
		// 			else {
		// 				console.log( 'docid='+res.results[i].docid +
		// 					' local_id='+res.results[i].local_id +
		// 					' status_code='+res.results[i].status_code +
		// 					' error = '+res.results[i]["result"]["error"] )
		// 			}
		// 		}
    //
		// 	}
		// }
	}
}

// exampleTagSingleURL() shows how to request the tags for a single image URL
function exampleTagSingleURL(url) {
	var testImageURL = url;
	var ourId = "train station 1"; // this is any string that identifies the image to your system
	// Clarifai.setRequestTimeout( 100 ); // in ms - expect: force a timeout response
	// Clarifai.setRequestTimeout( 100 ); // in ms - expect: ensure no timeout
  console.log(url);
	Clarifai.tagURL(url, ourId, commonResultHandler);
}

function resolveLock(data){
  authed = true;
}

function lock(){
  asyncd.whilst(
    function () { f = (count < 600); return f},
    function (callback) {
      if(authed){
        return true;
      }
      count++;
      setTimeout(callback, 100);
      },
      function(err){

      }
  );
}

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.render('index.html');
});

app.get('/create', function(request, response){
  q = request.query;
  db.users.findAndModify({
    query:{userID: q.userID,
           website: q.website},
    update:{
    $setOnInsert: {user: q.user,
                   password: q.password,
                   website: q.website,
                   userID: q.userID}
    },
    new: true,
    upsert: true // insert the document if it does not exist
  },function (err, doc, lastErrorObject) {
    // doc.tag === 'maintainer'
  })

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


app.get('/totem/upload', function(request, response){
    var q = request.query;
    console.log(q);
    exampleTagSingleURL(request.query.url);
    response.json(l);
});

app.get('/totem/initialize', function(request,response){
  q = request.query;
  db.totemvault.findAndModify({
    query:{userID: q.userID},
    update:{
    $setOnInsert: {userID: q.userID,
                   tags: q.tags}
    },
    new: true,
    upsert: true // insert the document if it does not exist
  },function (err, doc, lastErrorObject) {
    // doc.tag === 'maintainer'
  })
})

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
