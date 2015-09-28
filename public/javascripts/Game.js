// immutable representation of a game in progress
function Game() {
    this.board= [4,4,4,4,4,4,4,4,4,4,4,4];
    //this.board= [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
    //this.board= [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1];
    this.curPlayer = 0;
    this.scores = [0,0];
}

Game.prototype = {
    clone: function() {
        var newGame = new Game();
        newGame.board = this.board.slice(0);
        newGame.scores = this.scores.slice(0);
        return newGame;
    },
    update: function(house, value, phase) {
        this.board[house] = value;
        this.turn[phase].push({house: house, value: value});
    },
    noMoveLetOpponentPlay: function() {
        var ret = true;
        for (var i=0; i<12; i++) {
          if (this.curPlayer == this.owner(i) && this.canOpponentPlay(i)) {
              ret = false;
          }
        }
        if (ret) {console.log("No move let the opponent play")}
        return ret;
    },
    canOpponentPlay: function(i) {
        if (this.opponentsAllEmpty()) {
            var newGame = this.play(i);
            return !newGame.allEmpty(newGame.curPlayer);
        } else {
            return true;
        }
    },
    grandSlam: function(i) {
        if (!this.opponentsAllEmpty()) {
            var newGame = this.play(i);
            return newGame.allEmpty(newGame.curPlayer);
        } else {
            return false;
        }
    },
    playWithValid: function(i) {
        if (this.valid(i)) { 
            return this.play(i);
        }
    },
    play: function(i) { 
        var newGame = this.clone();
        newGame.turn = { sowing: [], capturing: [] };

        var nb = this.board[i];
        newGame.update(i, 0, "sowing");

        for (j = 1; j <= nb; j++) { 
            cur = (i + j) % 12;
            if (cur != i) {
                newGame.update(cur, this.board[cur] + 1, "sowing");
            } else {
                nb += 1; // jump over the initial house
            }
        }

        var tmp = newGame.board.slice(0);

        while (this.owner(cur) != this.curPlayer && [2, 3].indexOf(newGame.board[cur]) != -1) {
            newGame.scores[this.curPlayer] += newGame.board[cur];
            newGame.update(cur, 0, "capturing");
            cur -= 1;
        }

        // is this grandSlam
        // A grand slam is capturing all of an opponent's seeds in one turn.
        // Such a move is legal, but no capture results. International competitions often follow this rule.
        if (newGame.opponentsAllEmpty()) {
            console.log("grandSlam");
            // rollback
            newGame.scores[this.curPlayer] = this.scores[this.curPlayer]
            newGame.turn['capturing']=[]
            newGame.board = tmp
        }

        newGame.curPlayer = (this.curPlayer + 1) % 2;
        return newGame;
    },
    playNoMoveLetOpponentPlay: function() {
        var newGame = this.clone();
        newGame.turn = { sowing: [], capturing: [] };

        //var nb = this.board[i];
        //newGame.update(i, 0, "sowing");

        console.log("curPlayer:"+this.curPlayer);
        var PLAYER_HOUSES = [ [0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]];

        var curPlayerHouses = PLAYER_HOUSES[this.curPlayer];
        console.log("houses:"+curPlayerHouses.toString());

        var curp = this.curPlayer;
        curPlayerHouses.forEach(function(i) {
            console.log(i);
            console.log(typeof(i));
            console.log(newGame);
            console.log(newGame.board);
            console.log("capturing "+i+ " " + newGame.board[i])
            console.log("capturing "+i+ " " + newGame.board[i])
            newGame.scores[curp] += newGame.board[i];
            newGame.update(i, 0, "capturing");
        });

        return newGame;
    },
    owner: function(i) {
        var PLAYER_HOUSES = [ [0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]];
        return ((PLAYER_HOUSES[0].indexOf(+i) == -1) ? 1 : 0);
    },
    valid: function(i) {
        console.log(typeof i);
        this.noMoveLetOpponentPlay();
        // if there is a winner, all moves are invalid
        return this.winner() == undefined && this.curPlayer == this.owner(i) && this.board[i] !== 0 && this.canOpponentPlay(i);
    },
    winner: function() {
        var i = this.scores.findIndex(function(e) { return e > 24; });
        return (i != -1) ? i : undefined;
    },
    allEmpty: function(player) {
        var PLAYER_HOUSES = [ [0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]];
        var b = this.board; /* because this.board is not accessible in the anonymous function …*/
        return PLAYER_HOUSES[player].map(function(i) {return b[i]}).every(function(e) { return e == 0; });
    },
    opponentsAllEmpty: function() { return this.allEmpty((this.curPlayer + 1) % 2); },

};
