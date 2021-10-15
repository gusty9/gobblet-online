var express = require('express');
var router = express.Router();
const login_utils = require('../utils/login_utils');
const game_utils = require('../utils/game_utils')
const dbconn = require('../dbconn');


/**
 * A new user requesting an account
 */
router.post('/register', (req, res) => {
    let {name, email, password, confirm_password} = req.body;
    if (password === confirm_password && login_utils.validate_password(password)) {
        let salt = login_utils.generate_random_data(16);
        let hash = login_utils.get_hashed_password(password + salt);
        let auth_key = login_utils.generate_random_data(30);
        dbconn.create_new_user(email, name, hash, salt, auth_key).then((user_created) => {
            if (user_created) {
                res.cookie('auth_key', auth_key)
                res.redirect('/home');
            } else {
                res.redirect('/register');
            }
        });
    } else {
        //error creating the user
        res.redirect('/register')
    }
});

/**
 * A user posting email and password credentials to authenticate
 */
router.post('/login', (req, res) => {
    let {email, password} = req.body;
    dbconn.login_user(email, password).then((auth_key) => {
        if (auth_key) {
            res.cookie('auth_key', auth_key);
            res.redirect('/home');
        } else {
            res.redirect('/login');
        }
    });
});

/**
 * call from the user to create a new game.
 * Check that the user is verified, then redirect them to their match
 */
router.post('/create_game', (req, res) => {
    if (req.player_id) {
        let blank_board = game_utils.create_blank_board(req.player_id);
        dbconn.create_new_game(req.player_id, blank_board).then((match_id) => {
            res.redirect('/match/' + match_id);
        });
    } else {
        res.redirect('/error');
    }
});

/**
 * Request for when a user is attempting to join a new match based on match id
 */
router.post('/join_game', (req, res) => {
    if (req.player_id) {
        let { match_id } = req.body;
        dbconn.add_player2_to_match(match_id, req.player_id).then((created) => {
            if (created) {
                res.redirect('/match/' + match_id);
            } else {
                res.redirect('/home/');
            }
        });
    }
});

module.exports = router;
