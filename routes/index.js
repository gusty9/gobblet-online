var express = require('express');
var router = express.Router();
var dbconn = require('../dbconn');
var game_utils = require('../utils/game_utils');

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
        let view_object = game_utils.game_object_to_view_object(game_object.board_state);
        console.log(view_object);
        res.render('match', {view_object: view_object, match_id: req.params.match_id});
      } else {
        res.redirect('/error/');
      }
    });
  } else {
    res.redirect( '/');
  }
});

module.exports = router;
