if(require){
  var enums = require('./enums.js');
  var Field = enums.Field;
}

function Game(gameInterface, player1, player2){
  this.gi = gameInterface;
  this.players = [player1, player2];
}
Game.prototype = {
  start: function(currentTurn){
    this.players[0].placeOwnShips();
    this.players[1].placeOwnShips();
    this.currentTurn = currentTurn || 0;
    this.nextTurn();
  },
  nextTurn: function(){
    var self = this;
    this.makeMove().then(function(move){
      move.winner = self.checkWinner();
      return move;
    }).then(function(move){
      return self.gi.handleMove(self, move) || move;
    }).then(function(move){
      if(move.winner != null)
        self.gi.handleFinish(self, move.winner);
      else{
        move.currentTurn = self.determineCurrentTurn(move);
        Promise.resolve(self.gi.handleContinue(self, move)).then(function(){
          setTimeout(function(){
            self.nextTurn();
          }, 0);
        })
      }
    });
  },
  makeMove: function(){
    var currentPlayer = this.players[this.currentTurn];
    var opponent = this.players[1 - this.currentTurn];
    return Promise.resolve(currentPlayer.chooseHit()).then(function(hit){
      return Promise.resolve(opponent.takeHit(hit)).then(function(result){
        return {
          hit: hit,
          result: result
        };
      });
    }).then(function(hit){
      return Promise.resolve(currentPlayer.handleHitResult(hit.hit, hit.result)).then(function(response){
        hit.response = response;
        return hit;
      });
    });
  },
  determineCurrentTurn: function(move){
    if(move.result == Field.MISS)
      this.currentTurn = 1 - this.currentTurn;
    return this.currentTurn;
  },
  checkWinner: function(){
    if(!this.players[0].isAlive())
      return 1;
    if(!this.players[1].isAlive())
      return 0;
    return null;
  }
}

if(module && module.exports){
  module.exports = Game;
}
