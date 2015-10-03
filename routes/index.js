var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.query['lenderID']) {
	request.get('http://api.kivaws.org/v1/lenders/' + req.query['lenderID'] + '.json', function(err, response, body) {
		requestResponse = JSON.parse(body)
		if(requestResponse['lenders'] == undefined) {
			res.redirect('/');
		} else {
			console.log(body)
			res.render('results', {lenderID: req.query['lenderID']});
		}
	})
	} else {
		res.render('index')
	}
});

module.exports = router;