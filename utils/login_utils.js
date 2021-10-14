const crypto = require('crypto');

/**
 * validate password to my given password policy
 * @param password
 *          The password to match
 * @returns {*|boolean}
 *          True if valid password, false otherwise
 */
module.exports.validate_password = (password) => {
    return password.match(/[a-z]/g) && password.match(
        /[A-Z]/g) && password.match(
        /[0-9]/g) && password.match(
        /[^a-zA-Z\d]/g) && password.length >= 8;
}

/**
 * generate random data of length len. Useful for salting etc.
 * @param len
 *          length of random data
 * @returns {string}
 *          random hex string of length len
 */
module.exports.generate_random_data = (len) => {
    return crypto.randomBytes(len).toString('hex');
}

/**
 * hash the users password
 * @param password
 *          the password to be hashed
 * @returns {string}
 *          the hashed password
 */
module.exports.get_hashed_password = (password) => {
    const sha256 = crypto.createHash('sha256');
    return sha256.update(password).digest('base64');
}