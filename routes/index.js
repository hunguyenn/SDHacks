var express = require('express');
var router = express.Router();
var request = require('request');
var geocoder = require('geocoder');

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.query['lenderID']) {
		request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '.json', function(err, response, body1) {
			// can access user image in here
			var requestResponse1 = JSON.parse(body1)
			if (requestResponse1['lenders'] == undefined) {
				res.render('/'); // invalid lender ID
			} else {
				var places = [];
				var source;
				var numPages;
				var loansPerPage;
				var total;
				var counter = 0;

				request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '/loans.json', function(err, response, body) {
					var requestResponse = JSON.parse(body);
					numPages = requestResponse['paging']['pages'];
					loansPerPage = requestResponse['paging']['page_size'];
					total = requestResponse['paging']['total']; // Add a counter to stop nested loop when necessary

					// make into function
					for (var i = 0; i < loansPerPage; i++) {
						var tempLocation = requestResponse['loans'][i]['location'];
						var longLat = tempLocation['geo']['pairs'].split(' ');
						places.push([parseFloat(longLat[1]), parseFloat(longLat[0])]);
					}

					function addPlaces(numPages, loansPerPage, page, total, callback) {
						// console.log(page)						
						request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '/loans.json?page=' + page, function(err, response, body3) {
							if(err) throw err;
							var tempArray = [];
							var requestResponse2 = JSON.parse(body3);
							numPages = requestResponse2['paging']['pages'];
							loansPerPage = requestResponse2['paging']['page_size'];
							total = requestResponse2['paging']['total']; // Add a counter to stop nested loop when necessary
							// console.log(requestResponse2)
							// make into function
							var upperLimit = loansPerPage;
							if(numPages == page) {
								upperLimit = total % loansPerPage;
							}
							for (var i = 0; i < upperLimit; i++) {
								var tempLocation = requestResponse2['loans'][i]['location'];
								var longLat = tempLocation['geo']['pairs'].split(' ');
								tempArray.push([parseFloat(longLat[1]), parseFloat(longLat[0])]);
							}
							//console.log(tempArray);
							callback(tempArray);
						});
					}

					//put all this shit in a callback
					if (numPages > 1) {
						for (var j = 2; j <= numPages; j++) {
							addPlaces(numPages, loansPerPage, j, total, function(x){
								places.concat(x);
							});
						}
					}

					
					//console.log(places)
					var location = requestResponse1['lenders'][0];
					geocoder.geocode(location['whereabouts'] + location['country_code'], function(err, data) {
						if (err) throw err;
						source = data['results'][0]['geometry']['location']
						res.render('results', { // render here
							lenderID: req.query['lenderID'],
							places: JSON.stringify(places),
							source: JSON.stringify(source)
						});
					});
				});

			}
		});
	} else {
		res.render('/'); // no lender id = ___ in url
	}








	// 		request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '/loans.json', function(err, response, body) {
	// 			var requestResponse = JSON.parse(body) //stringify this and add to an array of strings?
	// 				//console.log(body) // Prints out full contents of JSON

	// 				var numPages = requestResponse['paging']['pages']
	// 				var loansPerPage = requestResponse['paging']['page_size']
	// 				var total = requestResponse['paging']['total'] // Add a counter to stop nested loop when necessary
	// 				var counter = 0

	// 				for (var i = 1; i <= numPages; i++) {
	// 					//access different pages here ----------------------------------------- TODO
	// 					i
	// 					for (var j = 0; j < loansPerPage; j++) {
	// 						var tempLocation = requestResponse['loans'][j]['location']
	// 						var longLat = tempLocation['geo']['pairs'].split(' ')
	// 						places.push([parseFloat(longLat[1]), parseFloat(longLat[0])
	// 							//name: tempLocation['town'] + ', ' + tempLocation['country'],
	// 							//location: {
	// 							//	longitude: parseFloat(longLat[0]),
	// 							//	latitude: parseFloat(longLat[1])
	// 							//}
	// 						])
	// 						counter++
	// 						if (counter == total) {
	// 							break;
	// 						}
	// 					}
	// 				}

	// 				// Use places to plot ()
	// 				////// Places -> need to get rid of undefined & make cities more consitent (PILAR -> Pilar)

	// 				//console.log(places) // Don't delete, good for debugging
	// 				request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '.json', function(err, response, body1) {
	// 					// can access user image in here
	// 					var requestResponse1 = JSON.parse(body1)
	// 						// console.log(body);
	// 					var location = requestResponse1['lenders'][0]
	// 					geocoder.geocode(location['whereabouts'] + location['country_code'], function(err, data) {
	// 						if (err) throw err;
	// 						source = data['results'][0]['geometry']['location']
	// 						res.render('results', {
	// 							lenderID: req.query['lenderID'],
	// 							places: JSON.stringify(places),
	// 							source: JSON.stringify(source)
	// 						});
	// 					});
	// 				});

	// 				//res.render('results', {lenderID: req.query['lenderID'], places: JSON.stringify(places), source: JSON.stringify(source)});
	// 			}
	// 		})
	// 	} else {
	// 		res.render('index')
	// 	}
});

module.exports = router;

// var express = require('express');
// var router = express.Router();
// var request = require('request');
// var geocoder = require('geocoder');

// /* GET home page. */
// router.get('/', function(req, res, next) {
// 	if (req.query['lenderID']) {
// 		request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '/loans.json', function(err, response, body) {
// 			var requestResponse = JSON.parse(body) //stringify this and add to an array of strings?
// 			if (requestResponse['loans'] == undefined) {
// 				res.redirect('/');
// 			} else {
// 				//console.log(body) // Prints out full contents of JSON

// 				var numPages = requestResponse['paging']['pages']
// 				var loansPerPage = requestResponse['paging']['page_size']
// 				var total = requestResponse['paging']['total'] // Add a counter to stop nested loop when necessary
// 				var counter = 0
// 				var places = []
// 				var source

// 				for (var i = 1; i <= numPages; i++) {
// 					//access different pages here ----------------------------------------- TODO
// 					i
// 					for (var j = 0; j < loansPerPage; j++) {
// 						var tempLocation = requestResponse['loans'][j]['location']
// 						var longLat = tempLocation['geo']['pairs'].split(' ')
// 						places.push([parseFloat(longLat[1]), parseFloat(longLat[0])
// 							//name: tempLocation['town'] + ', ' + tempLocation['country'],
// 							//location: {
// 							//	longitude: parseFloat(longLat[0]),
// 							//	latitude: parseFloat(longLat[1])
// 							//}
// 						])
// 						counter++
// 						if (counter == total) {
// 							break;
// 						}
// 					}
// 				}

// 				// Use places to plot ()
// 				////// Places -> need to get rid of undefined & make cities more consitent (PILAR -> Pilar)

// 				//console.log(places) // Don't delete, good for debugging
// 				request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '.json', function(err, response, body1) {
// 					// can access user image in here
// 					var requestResponse1 = JSON.parse(body1)
// 					// console.log(body);
// 					var location = requestResponse1['lenders'][0]
// 					geocoder.geocode(location['whereabouts'] + location['country_code'], function(err, data) {
// 						if (err) throw err;
// 						source = data['results'][0]['geometry']['location']
// 						res.render('results', {
// 							lenderID: req.query['lenderID'],
// 							places: JSON.stringify(places),
// 							source: JSON.stringify(source)
// 						});
// 					});
// 				});

// 				//res.render('results', {lenderID: req.query['lenderID'], places: JSON.stringify(places), source: JSON.stringify(source)});
// 			}
// 		})
// 	} else {
// 		res.render('index')
// 	}
// });

// module.exports = router;