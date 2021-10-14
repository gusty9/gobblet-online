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
    const client = await conn.connect();
    let queryText = 'INSERT INTO player(email, name, pass_hash, salt, auth_key) VALUES ($1, $2, $3, $4, $5) RETURNING player_id'
    let user_created = null;
    try {
        await client.query('BEGIN');
        await client.query(queryText, [email, name, pass_hash, salt, auth_key], (err, results) => {
            if (err) {
                client.query('ROLLBACK');
            }
        });
        await client.query('COMMIT', (err, results) => {
            if (err) {
                client.query('ROLLBACK');
            }

            console.log(user_created);
        });
        user_created = true;
    } catch (er) {
        client.query('ROLLBACK');
    }
    finally {
        client.release();
    }
    return user_created;
};

/**
 * access the database and attempt to log in a user given their email and password
 * @param email
 *          login email attempt
 * @param password
 *          login password attempt
 * @returns {Promise<string>}
 *          the users auth_key, or null if they aren't correctly authenticated
 */
module.exports.login_user = async(email, password) => {
    let auth_key;
    const client = await conn.connect();
    try {
        await client.query('BEGIN');
        let salt;
        let hashed_pass;
        let player_id;
        await client.query('SELECT * FROM player WHERE email = $1', [email], (err, results) => {
            if (err || results.rowCount !== 1) {
                client.query('ROLLBACK');
                return auth_key;
            }
            player_id = results.rows[0].player_id;
            salt = results.rows[0].salt;
            hashed_pass = results.rows[0].pass_hash;
        });
        //compare the hash and the salt to the one in the db
        if (hashed_pass === login_utils.get_hashed_password(password + salt)) {
            auth_key = login_utils.generate_random_data(30);
            await client.query('UPDATE player SET auth_key = $1 WHERE player_id = $2', [auth_key, player_id], (err, results) => {
                if (err) {
                    client.query('ROLLBACK');
                    return null;
                }
            });
            await client.query('COMMIT');
        }
    } catch (err) {
        client.query('ROLLBACK');
    } finally {
        client.release();
    }
    return auth_key
}

/**
 * Check if a user is authenticated based on the authkey stored in their cookies
 * @param auth_key
 *          the auth key to test
 * @returns {Promise<*>}
 *          the player_id of the authenticated player, null if unauthenticated
 */
module.exports.is_user_authenticated = async(auth_key) => {
    let player_id = null;
    const client = await conn.connect();
    try {
        await client.query('SELECT * FROM player WHERE auth_key = $1', [auth_key], (error, results) => {
            if (error) {
                throw error;
            }
            if (results.rows.length > 0) {
                player_id = results.rows[0].player_id;
            } else {
                return player_id;
            }
        });
    } catch (err) {
        throw (err);
    } finally {
        client.release();
    }

    return player_id;
}

/**
 * Create a new match. Create a new board and assign it as blank.
 * @param p1_id
 *          the player id of the user creating the match
 * @param board
 *          the initial board - typically in the untouched state
 * @returns {Promise<void>}
 *          the match id if successfully created, null otherwise
 */
module.exports.create_new_game = async(p1_id, board) => {
    //to create a new game
    // 1 -> create a new board and get the board id
    // 2 -> insert into match the board id and player1_id
    // 3 -> return the match_id
    let match_id;
    const client = await conn.connect();
    try {
        await client.query('BEGIN');
        let board_id;
        await client.query('INSERT INTO board(board_state) VALUES ($1) RETURNING board_id', [board.toString()], (err, results) => {
            if (err) {

                client.query('ROLLBACK');
                return match_id;
            }
            board_id = results.rows[0].board_id;
        });
        await conn.query('INSERT INTO match(player_1_id, board_id) VALUES ($1, $2) RETURNING match_id', [p1_id, board_id], (err, results) => {
            if (err) {
                client.query('ROLLBACK');
                return match_id;
            }
            match_id = results.rows[0].match_id;
        });
        await client.query('COMMIT');
    } catch(err) {
        client.query('ROLLBACK');
    } finally {
        client.release();
    }
    return match_id;
}

module.exports.get_game_object = async (match_id) => {
    let game_object;
    const client = await conn.connect();
    try {

        await client.query('BEGIN');
        await client.query('SELECT player_1_id, player_2_id, board_state FROM match, board WHERE match.match_id = $1 AND match.boad_id = board.board_id', [match_id], (err, results) => {
            if (err) {
                client.query('ROLLBACK');
                return game_object;
            }
            game_object = results.rows[0];
        });
        await client.query('COMMIT');
    } catch (err) {
        client.query('ROLLBACK');
        return game_object
    } finally {
        client.release();
    }
}

