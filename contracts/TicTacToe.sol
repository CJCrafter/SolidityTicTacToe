// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TicTacToe {

    event OnWin(Player player);

    enum Player {
        NONE, X, O
    }

    Player[3][3] public board;
    Player public whoseTurn = Player.X;

    function play(uint _x, uint _y) public {
        require(_x >= 0 && _x < 3, "x should be in range [0, 3)");
        require(_y >= 0 && _y < 3, "y should be in range [0, 3)");
        require(board[_y][_x] == Player.NONE, "That position has already been played");

        board[_y][_x] = whoseTurn;

        bool isWin = checkWin(whoseTurn);
        if (isWin) {
            emit OnWin(whoseTurn);
        }

        // Switch players
        if (whoseTurn == Player.X) {
            whoseTurn = Player.O;
        } else {
            whoseTurn = Player.X;
        }
    }

    function reset() public {
        for (uint i = 0; i < 3; i++) {
            for (uint j = 0; j < 3; j++){
                board[i][j] = Player.NONE;
            }
        }
        whoseTurn = Player.X;
    }

    function checkWin(Player player) public view returns (bool) {
        for (uint i = 0; i < 3; i++) {
            if (board[i][0] == player && board[i][1] == player && board[i][2] == player) {
                return true;
            }
            if (board[0][i] == player && board[1][i] == player && board[2][i] == player) {
                return true;
            }
        }

        if (board[0][0] == player && board[1][1] == player && board[2][2] == player) {
            return true;
        }
        if (board[2][0] == player && board[1][1] == player && board[0][2] == player) {
            return true;
        }

        return false;
    }
}
