if(require){
  var enums = require('./enums.js');
  var Field = enums.Field;
  var ShipState = enums.ShipState;
  var Position = require('./position.js');
  var GameBoard = require('./game-board.js');
}

function Player(name){
  this.name = name;
  this.ownBoard = new GameBoard();
  this.board = new GameBoard();
}
Player.prototype = {
  placeOwnShips: function(){
    console.warn('not implemented');
  },
  takeHit: function(column, row){
    if(arguments.length == 1){
      if(!(column instanceof Position))
        column = new Position(column);
      row = column.row;
      column = column.column;
    }
    var field = this.ownBoard.fields[column][row];
    if(field != Field.SHIP){
      if(field == Field.EMPTY)
        this.ownBoard.fields[column][row] = Field.MISS;
      return Field.MISS;
    }
    var ship = this.ownBoard.map[column][row];
    var state = ship.hitField(column, row);
    if(state == ShipState.HIT){
      return this.ownBoard.fields[column][row] = Field.HIT;
    }else if(state == ShipState.DESTROYED){
      var shipFields = ship.getFields();
      for (var i = 0; i < shipFields.length; ++i)
        this.ownBoard.fields[shipFields[i].column][shipFields[i].row] = Field.DESTROYED;
      return Field.DESTROYED;
    }
  },
  chooseHit: function(){
    console.warn('not implemented');
  },
  handleHitResult: function(hit, hitResult){
    console.warn('not implemented');
  },
  isAlive: function(){
    return !!this.ownBoard.getAliveShips().length;
  }
}

if(module && module.exports){
  module.exports = Player;
}