/**
 * Create a blank game board with player 1 as the current player.
 * @param p1_id
 * @returns a game board in the initial state
 */
module.exports.create_blank_board = (p1_id) => {
    return {
        current_turn: 'p1',
        p1_r: [[1,1,1,1],[1,1,1,1],[1,1,1,1]],
        p2_r: [[2,2,2,2],[2,2,2,2],[2,2,2,2]],
        board: [
            [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
            [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
            [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
            [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
        ]
    }
}

/**
 * return the index of the first nonzero digit + 1 (for displaying - 0 is no piece present)
 * @param arr
 *          the array to check
 */
let get_top_index = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] > 0) {
            return i + 1;
        }
    }
    return 0;
}

/**
 * determine which player has the top piece of this array
 * @param arr
 *          the array to check
 */
let get_owner = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] > 0) {
            return arr[i];
        }
    }
    return 0;
}

/**
 * convert the raw game object to one for html viewing - hide what is beneath the pieces to the end user
 * @param game_object
 *          raw game data
 * @returns
 *          formatted data for the view engine
 */
module.exports.game_object_to_view_object = (game_object) => {
    console.log(game_object);
    let ret = {};
    for (let i = 1; i <= 2; i++) {
        for (let j = 0; j <= 2; j++) {
            if (i === 1) {
                ret['r' + i + j] = get_top_index(game_object.p1_r[j]);
            } else {
                ret['r' + i + j] = get_top_index(game_object.p2_r[j]);
            }
        }
    }
    for (let i = 0; i <= 3; i++) {
        for (let j = 0; j <= 3; j++) {
            ret['b' + i + j] = {
                owner: get_owner(game_object.board[i][j]),
                top: get_top_index(game_object.board[i][j])
            };
        }
    }
    return ret;
}