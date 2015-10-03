var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.query['lenderID']) {
		res.render('results', {lenderID: req.query['lenderID']});
	} else {
		res.render('index');
	}
});

module.exports = router;
