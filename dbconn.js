const Pool = require('pg').Pool;
const login_utils = require('./utils/login_utils');
const conn = new Pool({
    user:       'api',
    host:       'localhost',
    database:   'goblet',
    password:   '#secret_api_password!#1234AAA#',
    port:       '5432'
});

/**
 * Create a new user and store them in the database
 * @param email
 *          validated email address
 * @param name
 *          validated name
 * @param pass_hash
 *          password + salt hashed
 * @param salt
 *          salt stored with password
 * @param auth_key
 *          auth key for cont auth
 * @returns {Promise<boolean>}
 *          return true if the user has been successfully created or false if errors
 */
module.exports.create_new_user = async (email, name, pass_hash, salt, auth_key) => {
    let queryText = 'INSERT INTO player(email, name, pass_hash, salt, auth_key) VALUES ($1, $2, $3, $4, $5);'
    let user_created = false;
    try {
        await conn.query('BEGIN');
        await conn.query(queryText, [email, name, pass_hash, salt, auth_key], (err, results) => {
            if (err) {
                conn.query('ROLLBACK');
            }
        });
        await conn.query('COMMIT', (err, results) => {
            if (err) {
                conn.query('ROLLBACK');
            }
        });
        user_created = true;
    } catch (er) {
        conn.query('ROLLBACK');
    }
    return user_created;
};

module.exports.login_user = async(email, password) => {
    let auth_key;
    try {
        await conn.query('BEGIN');
        let salt;
        let hashed_pass;
        let player_id;
        await conn.query('SELECT * FROM player WHERE email = $1', [email], (err, results) => {
            if (err || results.rowCount !== 1) {
                conn.query('ROLLBACK');
                return auth_key;
            }
            player_id = results.rows[0].player_id;
            salt = results.rows[0].salt;
            hashed_pass = results.rows[0].pass_hash;
        });
        //compare the hash and the salt to the one in the db
        if (hashed_pass === login_utils.get_hashed_password(password + salt)) {
            auth_key = login_utils.generate_random_data(30);
            await conn.query('UPDATE player SET auth_key = $1 WHERE player_id = $2', [auth_key, player_id], (err, results) => {
                if (err) {
                    conn.query('ROLLBACK');
                    return null;
                }
            });
            await conn.query('COMMIT');
        }
    } catch (err) {
        conn.query('ROLLBACK');
    }
    return auth_key
}

module.exports.is_user_authenticated = async(auth_key) => {
    let player_id;
    try {
        await conn.query('SELECT * FROM player WHERE auth_key = $1', [auth_key], (error, results) => {
            if (error) {
                throw error;
            }
            if (results.rows.length > 0) {
                player_id = results.rows[0].player_id;
            }
        });
    } catch (err) {

    }
    return player_id;
}

