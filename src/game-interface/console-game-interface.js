if(require){
  var GameInterface = require('../game-interface.js');
}

function ConsoleGameInterface(){
  GameInterface.call(this);
}

ConsoleGameInterface.prototype = Object.create(GameInterface.prototype);
var proto = {
  handleMove: function(game, move){
    this.printBoards(game.players[1].board, game.players[0].board);
  },
  handleFinish: function(game, winner){
    console.log('Player ' + game.players[winner].name + ' wins');
    this.printBoards(game.players[0].ownBoard, game.players[1].ownBoard);
  },
  handleContinue: function(game, move){
    console.log('It\'s ' + game.players[move.currentTurn].name + '\'s move');
  },
  printBoards: function(left, right){
    left = left.toString().split(/\n/);
    right = right.toString().split(/\n/);
    var combined = left.map(function(s, i){
      return s + '   ' + right[i];
    }).join('\n');
    console.log(combined);
  }
}

for ( var key in proto){
  ConsoleGameInterface.prototype[key] = proto[key];
}

if(module && module.exports){
  module.exports = ConsoleGameInterface;
}