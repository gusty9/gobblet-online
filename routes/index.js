var express = require('express');
var router = express.Router();
var dbconn = require('../dbconn');

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

router.get('/match/:match_id', (req, res) => {
  if (req.player_id) {
    let game_object = dbconn.get_game_object(req.params.match_id);
    res.render('match', {game_object: game_object});
  }

});

module.exports = router;
