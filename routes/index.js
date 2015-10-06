var express = require('express');
var router = express.Router();
var request = require('request');
var geocoder = require('geocoder');

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.query['lenderID']) {
		request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '/loans.json', function(err, response, body) {
			var requestResponse = JSON.parse(body)
			if(requestResponse['loans'] == undefined) {
				res.redirect('/');
			} else {
				//console.log(body) // Prints out full contents of JSON

				var numPages = requestResponse['paging']['pages'] // Need for later, only testing on one page right now
				var loansPerPage = requestResponse['paging']['page_size']
				var total = requestResponse['paging']['total'] // Add a counter to stop nested loop when necessary
				var counter = 0
				var places = []
				var source 


				for(var i = 0; i < numPages; i++) {
					for(var j = 0; j < loansPerPage; j++) {
						//access different pages here ----------------------------------------- TODO
						var tempLocation = requestResponse['loans'][j]['location']
						var longLat = tempLocation['geo']['pairs'].split(' ')
						places.push([parseFloat(longLat[1]), parseFloat(longLat[0])
							//name: tempLocation['town'] + ', ' + tempLocation['country'],
							//location: {
							//	longitude: parseFloat(longLat[0]),
							//	latitude: parseFloat(longLat[1])
							//}
						])
						counter++
						if(counter == total) {
							break;
						}
					}
				}

				
				// Use places to plot ()
				////// Places -> need to get rid of undefined & make cities more consitent (PILAR -> Pilar)

				//console.log(places) // Don't delete, good for debugging
				request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '.json', function(err, response, body1) {
				// can access user image in here
				var requestResponse1 = JSON.parse(body1)
				// console.log(body);
				var location = requestResponse1['lenders'][0] 
						geocoder.geocode(location['whereabouts'] + location['country_code'], function ( err, data ) {
					if(err) throw err;
					source = data['results'][0]['geometry']['location']
  					res.render('results', {lenderID: req.query['lenderID'], places: JSON.stringify(places), source: JSON.stringify(source)});
				});
		});

				//res.render('results', {lenderID: req.query['lenderID'], places: JSON.stringify(places), source: JSON.stringify(source)});
			}
		})
	} else {
		res.render('index')
	}
});

module.exports = router;