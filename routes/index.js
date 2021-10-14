var express = require('express');
var router = express.Router();

/* Get index page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', (req, res) => {
  if (req.player_id) {
    res.redirect('/home');
  } else {
    res.render('login');
  }
});

router.get('/register', (req, res) => {
  if (req.player_id) {
    res.redirect('/home');
  } else {
    res.render('register');
  }
});

router.get('/home', (req, res) => {
  if (req.player_id) {
    res.render('home');
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
