var express = require('express');
var router = express.Router();

/* Get index page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

module.exports = router;
