const Pool = require('pg').Pool;
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
