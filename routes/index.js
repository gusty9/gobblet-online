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
    dbconn.get_game_object(req.params.match_id).then((game_object) => {
      if (game_object) {
        console.log(game_object);
        res.render('match', {game_object: game_object, match_id: req.params.match_id});
      } else {
        res.redirect('/error/');
      }
    });
  } else {
    res.redirect( '/');
  }
});

module.exports = router;
