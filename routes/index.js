var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.query['lenderID']) {
	request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '/loans.json', function(err, response, body) {
		var requestResponse = JSON.parse(body)
		if(requestResponse['loans'] == undefined) {
			res.redirect('/');
		} else {
			console.log(body) // Prints out full contents of JSON

			//var numPages = requestResponse['paging']['pages'] // Need for later, only testing on one page right now
			var loansPerPage = requestResponse['paging']['page_size']
			var total = requestResponse['paging']['page_size'] // Add a counter to stop nested loop when necessary
			var numPages = 1
			var places = []
			for(var i = 0; i < numPages; i++) {
				for(var j = 0; j < loansPerPage; j++) {
					var tempLocation = requestResponse['loans'][j]['location']
					var longLat = tempLocation['geo']['pairs'].split(' ')
					places.push({
						name: tempLocation['town'] + ', ' + tempLocation['country'],
						location: {
							longitude: parseFloat(longLat[0]),
							latitude: parseFloat(longLat[1])
						}
					})
				}
			}

			////// Places -> need to get rid of undefined & make cities more consitent (PILAR -> Pilar)

			console.log(places) // Don't delete, good for debugging

			res.render('results', {lenderID: req.query['lenderID']});
		}
	})
	} else {
		res.render('index')
	}
});

module.exports = router;