var express = require('express');
var router = express.Router();
const login_utils = require('../utils/login_utils');
const dbconn = require('../dbconn');

router.post('/register', (req, res) => {
    let {name, email, password, confirm_password} = req.body;
    console.log(req.body);
    if (password === confirm_password && login_utils.validate_password(password)) {
        let salt = login_utils.generate_random_data(16);
        let hash = login_utils.get_hashed_password(password + salt);
        let auth_key = login_utils.generate_random_data(30);
        dbconn.create_new_user(email, name, hash, salt, auth_key).then(user_created => {
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

router.post('/login', (req, res) => {
    let {email, password} = req.body;
    dbconn.login_user(email, password).then(auth_key => {
        if (auth_key) {
            res.cookie('auth_key', auth_key);
            res.redirect('/home');
        } else {
            res.redirect('/login');
        }
    });
});

module.exports = router;
