if(require){
  var enums = require('./enums.js');
  var Field = enums.Field;
  var Orientation = enums.Orientation;
  var Direction = enums.Direction;
  var ShipState = enums.ShipState;
  var Position = require('./position.js');
  var Ship = require('./ship.js');
}

function GameBoard(){
  this.init();
}

GameBoard.prototype = {
  init: function(){
    this.fields = Array.apply(0, Array(10)).map(function(x){
      return Array.apply(0, Array(10)).fill(Field.EMPTY);
    });
    this.map = Array.apply(0, Array(10)).map(function(x){
      return Array.apply(0, Array(10)).fill(null);
    });
    this.ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1].map(function(size){
      return new Ship(size);
    });
  },
  getPlacedShips: function(){
    return this.ships.filter(function(ship){
      return ship.isPlaced();
    });
  },
  getAliveShips: function(){
    return this.ships.filter(function(ship){
      return ship.state != ShipState.DESTROYED;
    });
  },
  isPlaceEmpty: function(ship){
    var shipFields = ship.getFields();
    for (var i = 0; i < shipFields.length; ++i)
      if(this.fields[shipFields[i].column][shipFields[i].row] !== Field.EMPTY)
        return false;
    return true;
  },
  isPlaceTouching: function(ship){
    var placedShips = this.getPlacedShips();
    for (var i = 0; i < placedShips.length; ++i){
      var localShip = placedShips[i];
      if(localShip === ship)
        return false;
      if(localShip.touches(ship))
        return true;
    }
    return false;
  },
  canPlaceShip: function(ship){
    return ship.fits() && this.isPlaceEmpty(ship) && !this.isPlaceTouching(ship);
  },
  placeShip: function(ship){
    if(ship.isPlaced())
      this.unplaceShip(ship)
    ship.state = ShipState.PLACING;
    var shipFields = ship.getFields();
    for (var i = 0; i < shipFields.length; ++i){
      var field = shipFields[i];
      this.fields[field.column][field.row] = Field.SHIP;
      this.map[field.column][field.row] = ship;
    }
    ship.state = ShipState.PLACED;
  },
  unplaceShip: function(ship){
    for (var i = 0; i < 10; ++i){
      for (var j = 0; i < 10; ++j)
        if(this.map[i][j] === ship){
          this.map[i][j] = null;
          this.fields[i][j] = Field.EMPTY;
        }
    }
    ship.state = ShipState.IN_STOCK;
  },
  unplaceAllShips: function(){
    for (var i = 0; i < this.ships.length; ++i)
      this.unplaceShip(this.ships[i]);
  },
  getPlaceOptions: function(size, orientation){
    var testShip = new Ship(size, orientation);
    var options = [];
    for (var i = 0; i < 10; ++i){
      testShip.position.column = i;
      for (var j = 0; j < 10; ++j){
        testShip.position.row = j;
        if(this.canPlaceShip(testShip))
          options.push(new Position(i, j));
      }
    }
    return options;
  },
  toString: function(){
    var lines = ['┌──────────┐'];
    var map = {}
    map[Field.EMPTY] = ' ';
    map[Field.SHIP] = '█';
    map[Field.HIT] = '░';
    map[Field.DESTROYED] = 'X';
    map[Field.MISS] = '·'
    for (var i = 0; i < 10; ++i){
      var symbols = [];
      for (var j = 0; j < 10; ++j)
        symbols.push(map[this.fields[j][i]]);
      lines.push('│' + symbols.join('') + '│')
    }
    lines.push('└──────────┘');
    return lines.join('\n');
  }
}

if(module && module.exports){
  module.exports = GameBoard;
}