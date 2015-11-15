var express = require('express');
var http = require('http');
var url = require('url');
var bodyParser = require('body-parser');
var app = express();
var pg = require('pg');
var port = process.env.PORT || 5000
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type');
  next();
});

app.listen(port);
console.log('Listening at ' + port);

app.get('/', function (req, res) {
    
    if(req.query.overview_polyline != undefined){
    	overview_polyline = JSON.parse(req.query.overview_polyline);
    	for(var i=0; i<overview_polyline.length; i++){
    		getDistance(overview_polyline[i].lat, overview_polyline[i].lng)
    	}
    } else {
      window.alert('Directions request failed due to ' + status);
    }
});

function getDistance (i, lat, lng) {
	var totalDistance = 0;
	for(var j=0; j<records.length; j++){
		// console.log(lat, lng, parseFloat(records[j].lat), parseFloat(records[j].lng))
		if(getDistanceFromLatLonInKm(lat, lng, parseFloat(records[j].lat), parseFloat(records[j].lng), 'K') < 0.1){
			totalDistance++;
		}
	
	}
	console.log("i=" + i + ", totalDistance=" + totalDistance)
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var radlon1 = Math.PI * lon1/180
	var radlon2 = Math.PI * lon2/180

	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	if(isNaN(dist)){
		return 0;
	}
	return dist
}

var records = [];

var inputFile='Major_Crime.csv';

var parser = parse({delimiter: ','}, function (err, data) {
  async.eachSeries(data, function (line, callback) {
  	var x = line[11];
  	console.log(records.length)
  	var start_pos1 = x.indexOf('(') + 1;
	var end_pos1 = x.indexOf(',',start_pos1);

	var start_pos2 = x.indexOf(',') + 2;
	var end_pos2 = x.indexOf(')',start_pos2);

  	// console.log(x.substring(start_pos1, end_pos1), x.substring(start_pos2, end_pos2))
  	records.push({
      	lat: x.substring(start_pos1, end_pos1),
        lng: x.substring(start_pos2, end_pos2),
        date: line[4]
    });
      // console.log(records.length)
      // if(line[121] == "bonniepalmer@msn.com"){
      
      // console.log(line[121])
  // }
      callback();
    // });
  });
}
);
fs.createReadStream(inputFile).pipe(parser);