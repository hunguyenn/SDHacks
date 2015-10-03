var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index')
});

router.get('/*', function(req, res, next) {
	request.get('http://api.kivaws.org/v1/teams/search.json?sort_by=member_count&q=' + req.params[0], function(err, response, body) {
		if(err) {
			console.log('invalid')
			res.render('index');
		} else {
			console.log(body)
			res.render('results', {lenderID: req.params[0]});
		}
	})
});

// router.get('/', function(req, res, next) {
// 	if(req.query['lenderID']) {
// 		var lender = req.query['lenderID']
// 		request	
// 			.get('http://api.kivaws.org/v1/lenders/' + lender + '.json', function(err, res, body) {
// 				if(!err && res.statusCode == 200) {
// 					console.log(body)
// 				} 
// 			})  
// 			.on('error', function(err) {
//     			res.redirect('/')
//   			})
// 		res.render('results', {lenderID: lender});
// 	}
// });

module.exports = router;