var express = require('express');
var router = express.Router();
var request = require('request');
var geocoder = require('geocoder');

/* GET home page. */

router.get('/error', function(req, res, next) {
	res.render('error', {message: 'oops'});
});

router.get('/', function(req, res, next) {
	if (req.query['lenderID']) {
		request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '.json', function(err, response, body1) {
			// can access user image in here
			if (!err) {
				var requestResponse1 = JSON.parse(body1);
				if (requestResponse1['lenders'] == undefined) {
					res.render('index'); // invalid lender ID
				} else {
					var source;
					var numPages;
					var loansPerPage;
					var total;
					var counter = 0;

					request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '/loans.json', function(err, response, body) {
						if (err) return;
						var requestResponse = JSON.parse(body);
						numPages = requestResponse['paging']['pages'];
						loansPerPage = requestResponse['paging']['page_size'];
						total = requestResponse['paging']['total']; // Add a counter to stop nested loop when necessary

						function addPages(numPages, loansPerPage, page, total, callback) {
							request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '/loans.json?page=' + page, function(err, response, body3) {
								if (err) throw err;
								var tempArray = [];
								var requestResponse2 = JSON.parse(body3);
								numPages = requestResponse2['paging']['pages'];
								loansPerPage = requestResponse2['paging']['page_size'];
								total = requestResponse2['paging']['total']; // Add a counter to stop nested loop when necessary
								var upperLimit = loansPerPage;
								if (numPages == page) {
									upperLimit = total % loansPerPage;
								}
								for (var i = 0; i < upperLimit; i++) {
									var tempLocation = requestResponse2['loans'][i]['location'];
									var longLat = tempLocation['geo']['pairs'].split(' ');
									tempArray.push([parseFloat(longLat[1]), parseFloat(longLat[0])]);
								}
								callback(tempArray, page);
							});
						}

						function addPlaces(numPages, total, callback) {
							var place = [];
							for (var j = 1; j <= numPages; j++) {
								addPages(numPages, loansPerPage, j, total, function(x, y) {
									place = place.concat(x);
									if (place.length == total) {
										callback(place);
									}
								});
							}
						}

						addPlaces(numPages, total, function(places) {
							var location = requestResponse1['lenders'][0];
							geocoder.geocode(location['whereabouts'] + location['country_code'], function(err, data) {
								if (err) throw err;
								source = data['results'][0]['geometry']['location'];
								res.render('results', { // render here
									lenderID: req.query['lenderID'],
									places: JSON.stringify(places),
									source: JSON.stringify(source)
								});
							});
						});
					});
				}
			} else {
				// handle no internetz
				res.render('error', {
					error: {
						status: 'NO INTERNETZ'
					}
				});
			}
		});
	} else {
		res.render('index'); // no lender id = ___ in url
	}
});

module.exports = router;