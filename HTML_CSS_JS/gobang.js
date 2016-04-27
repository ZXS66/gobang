const LEN = 15;	// the size of gameboard is LEN * LEN
const CELL_BASE_SIZE = 40;	// the size of each chess, in px
const PADDING = 40;

// get index of the first object(include Array, but not Function) by value, regardless the same reference or not
Array.prototype.indexOfObject = function (obj) {
    var objStr = JSON.stringify(obj), idx = -1;
    this.forEach(function (d, i) {
        var tmpStr = JSON.stringify(d);
        if (tmpStr === objStr) {
            idx = i;
            return;
        }
    });
    return idx;
};
// get counts of val (strict equality) in this Array
Array.prototype.countsOf = function (val) {
    var count = 0;
    this.forEach(function (d) {
        if (d === val) count++;
    });
    return count;
};
(function (len, cell_base_size, padding) {
    const ROLE_FLAG = { USER: 1, AI: 2, NA: 0 };

    var $board;	// reference for DOM #gameboard group.board
    var board = []; // represents for current game progress
    var isUserTurn = true, isGameOver = false;

    var clickHandler = function (event) {
		if (isGameOver) return;
        var pos = getPosition(event);
        if (board[pos[0]][pos[1]]) {
            return; // already has chess here
        }
        drawChess(pos);
        isUserTurn = false;
		isGameOver = checkpoint();
        if (isGameOver) return;
        // AI turn
        var ai_pos = AI(board);
        drawChess(ai_pos);
        isUserTurn = true;
		isGameOver = checkpoint();
        if (isGameOver) return;
    };

    var setInitialState = function () {
            var tmpLen = len - 1;
            for (var i = 0; i <= tmpLen / 2; i++) {
                board[i] = [];
                board[tmpLen - i] = [];
                for (var j = 0; j <= tmpLen / 2; j++) {
                    board[i][j] = board[i][tmpLen - j] = board[tmpLen - i][j] = board[tmpLen - i][tmpLen - j] = ROLE_FLAG.NA;
                }
            }
        },
		getPosition = function(evt){
            return [evt.offsetY, evt.offsetX].map(function (d) { return parseInt((d - padding) / cell_base_size); });
		},
        getWiner = function () {
            for (var i = 0; i < len; i++) {
                for (var j = 0; j <= len - 5; j++) {
                    // horizental
                    if (board[i][j] && board[i][j] === board[i][j + 1] && board[i][j + 1] === board[i][j + 2] && board[i][j + 2] === board[i][j + 3] && board[i][j + 3] === board[i][j + 4])
                        return board[i][j];
                    // vertical
                    if (board[j][i] && board[j][i] === board[j + 1][i] && board[j + 1][i] === board[j + 2][i] && board[j + 2][i] === board[j + 3][i] && board[j + 3][i] === board[j + 4][i])
                        return board[j][i];
                    // cross, slash
                    if (i <= (len - 5) && board[i][j] && board[i][j] === board[i + 1][j + 1] && board[i + 1][j + 1] === board[i + 2][j + 2] && board[i + 2][j + 2] === board[i + 3][j + 3] && board[i + 3][j + 3] === board[i + 4][j + 4])
                        return board[i][j];
                    // cross, backslash
                    if (i >= 4 && board[i][j] && board[i][j] === board[i - 1][j + 1] && board[i - 1][j + 1] === board[i - 2][j + 2] && board[i - 2][j + 2] === board[i - 3][j + 3] && board[i - 3][j + 3] === board[i - 4][j + 4])
                        return board[i][j];
                }
            }
            return ROLE_FLAG.NA;
        },
        isATie = function () {
            var isATie = true;
            for (var i = 0; i < len; i++) {
                if (!isATie) break;
                for (var j = 0; j < len; j++) {
                    if (!board[i][j]) { //if (board[i][j] === ROLE_FLAG.NA) {
                        isATie = false;
                        break;
                    }
                }
            }
            return isATie;
        },
        drawChess = function (pos) {
            board[pos[0]][pos[1]] = isUserTurn ? ROLE_FLAG.USER : ROLE_FLAG.AI;
            $board.circle(cell_base_size - (cell_base_size) / 10).addClass("chess").addClass(isUserTurn ? "user" : "ai").move(pos[1] * cell_base_size, pos[0] * cell_base_size);
        },
        checkpoint = function () {
            // check if user/AI win
            var winner = getWiner();
            if (winner) {
                if (confirm((winner === ROLE_FLAG.USER ? "You" : "Computer") + " Win!\n\nTry again?")) {
                    restart();
					return false;
                }
                return true;
            }
            // check if tied (NO more space for any chess)
            var _isTie = isATie();
            if (_isTie) {
                if (confirm("So sad, you and computer are on a tie. :(\n\nTry again?")) {
                    restart();
					return false;
                }
                return true;
            }
            return false;
        };

    var restart = function () {
        setInitialState();
        isUserTurn = true;
		//isGameOver = false;
        $board.clear();
    };
    window.onload = function () {
        var gb = SVG("gameboard");
        var sizeInPx = cell_base_size * len;
        gb.size(sizeInPx, sizeInPx);
        // drawing background lines after loaded
        var tmpPos = cell_base_size / 2;
        var grp_bg = gb.group().addClass("background");//background
        while (tmpPos < cell_base_size * len) {
            grp_bg.line(0, tmpPos, sizeInPx, tmpPos).addClass("line");//horizontal
            grp_bg.line(tmpPos, 0, tmpPos, sizeInPx).addClass("line");//vertical
            tmpPos += cell_base_size;
        }
        $board = gb.group().addClass("board");
        // add click listener
        document.getElementById("gameboard").addEventListener("click", clickHandler);
        // start game auto
        restart();
    };
    // AI implement
    var AI = (function () {
        var _allWinMethods = [];
        // get all win methods
        var i, j;
        for (i = 0; i < len; i++) {
            for (j = 0; j <= len - 5; j++) {
                // horizental
                _allWinMethods.push([[i, j], [i, j + 1], [i, j + 2], [i, j + 3], [i, j + 4]]);
                // vertical
                _allWinMethods.push([[j, i], [j + 1, i], [j + 2, i], [j + 3, i], [j + 4, i]]);
                // cross, slash
                if (i <= len - 5)
                    _allWinMethods.push([[i, j], [i + 1, j + 1], [i + 2, j + 2], [i + 3, j + 3], [i + 4, j + 4]]);
                // cross, backslash
                if (i >= 4)
                    _allWinMethods.push([[i, j], [i - 1, j + 1], [i - 2, j + 2], [i - 3, j + 3], [i - 4, j + 4]]);
            }
        }
        var calcWeight = function (board) {
            // get all ai/user chesses
            var _aiChesses = [], _userChesses = [];
            board.forEach(function (rowVal, rowIdx) {
                rowVal.forEach(function (colVal, colIdx) {
                    if (colVal === ROLE_FLAG.AI)
                        _aiChesses.push([rowIdx, colIdx]);
                    else if (colVal === ROLE_FLAG.USER)
                        _userChesses.push([rowIdx, colIdx]);
                });
            });
            var scoreBoard = [], score = 0, chess;
            // get weight of each remaining position
            for (var i = 0; i < len; i++) {
                scoreBoard[i] = [];
                for (var j = 0; j < len; j++) {
                    if (board[i][j]) {
                        scoreBoard[i][j] = 0;   // already has chess here
                        continue;
                    }
                    chess = [i, j]; score = 0;
                    _allWinMethods.forEach(function (method) {
                        var idx = method.indexOfObject(chess);
                        if (idx === -1)
                            return;     // behavior as continue in for loop
                        var roles = zero2FiveExcept(idx).map(function (num) {
                            return method[num];
                        }).map(function (pos) {
                            if (_aiChesses.indexOfObject(pos))
                                return ROLE_FLAG.AI;
                            else if (_userChesses.indexOfObject(pos))
                                return ROLE_FLAG.USER;
                            else return ROLE_FLAG.NA;
                        }); // get others positions' chess in this method
                        var countsOfAIChesses = roles.countsOf(ROLE_FLAG.AI),
                            countsOfUserChesses = roles.countsOf(ROLE_FLAG.USER);
                        // below numbers need tuning
                        if (countsOfAIChesses && countsOfUserChesses) {
                            // both AI and user has chess(es) in this method
                            //score += 0;
                        } else if (countsOfAIChesses === 4)
                            score += 250;
                        else if (countsOfUserChesses === 4)
                            score += 100;
                        else if (countsOfAIChesses === 3)
                            score += 80;
                        else if (countsOfUserChesses === 3)
                            score += 70;
                        else if (countsOfAIChesses === 2)
                            score += 50;
                        else if (countsOfUserChesses === 2)
                            score += 40;
                        else if (countsOfAIChesses === 1)
                            score += 20;
                        else if (countsOfUserChesses === 1)
                            score += 10;
                    });
                    scoreBoard[i][j] = score;
                }
            }
            return scoreBoard;
        };
        var zero2FiveExcept = function (num) {
            if (num >= 0 && num < 5) {
                return [0, 1, 2, 3, 4].filter(function (d) { return d !== num; });
            }
            return [];
        }
        // get the best position
        return function (board) {
            var scoreBoard = calcWeight(board);
            // find out the highest weight position
            var i = j = maxWeight = 0;
            scoreBoard.forEach(function (rowVal, rowIdx) {
                rowVal.forEach(function (colVal, colIdx) {
                    if (colVal > maxWeight) {
                        maxWeight = colVal;
                        i = rowIdx; j = colIdx;
                    }
                });
            });
            return [i, j];
        };
    })();
})(LEN, CELL_BASE_SIZE, PADDING);
