var readlineSync = require('readline-sync');

var enums = require('../enums.js');
var Field = enums.Field;
var Position = require('../position.js');
var Player = require('../player.js');

function TerminalPlayer(name){
  Player.call(this, name);
  this.ownBoard = null;
  this.destroyedCount = 0;
}
TerminalPlayer.prototype = Object.create(Player.prototype);

var proto = {
  placeOwnShips: function(){
    readlineSync.keyInPause('Hit a key when ready');
  },
  takeHit: function(column, row){
    if(arguments.length == 1){
      if(!(column instanceof Position))
        column = new Position(column);
      row = column.row;
      column = column.column;
    }
    var position = new Position(column, row);
    var index = readlineSync.keyInSelect(['Miss', 'Hit', 'Destroyed'], 'What is at ' + position.toString() + '?', {
      cancel: false
    });
    var result = [Field.MISS, Field.HIT, Field.DESTROYED][index];
    this.destroyedCount += result == Field.DESTROYED;
    return result;
  },
  chooseHit: function(){
    return new Position(readlineSync.question('Where to hit?'));
  },
  handleHitResult: function(hit, hitResult){
    var text;
    switch (hitResult) {
    case Field.MISS:
      text = 'You missed';
      break;
    case Field.HIT:
      text = 'You hit a ship';
      break;
    case Field.DESTROYED:
      text = 'You destroyed a ship';
      break;
    }
    readlineSync.keyInPause(text);
  },
  isAlive: function(){
    return this.destroyedCount < 10;
  }
};

for ( var key in proto){
  TerminalPlayer.prototype[key] = proto[key];
}

module.exports = TerminalPlayer;
