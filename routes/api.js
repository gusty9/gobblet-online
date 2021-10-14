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
        let auth_token = login_utils.generate_random_data(30);
        dbconn.create_new_user(email, name, hash, salt, auth_token).then(user_created => {
            console.log(user_created);
            if (user_created) {
                res.redirect('/home');
            } else {
                res.redirect('/register');
            }
        });
    } else {
        //error creating the user
        console.log('test3');
        res.redirect('/register')
    }
});

module.exports = router;
