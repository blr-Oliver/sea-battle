if(require){
  var enums = require('../enums.js');
  var Field = enums.Field;
  var Orientation = enums.Orientation;
  var Direction = enums.Direction;
  var ShipState = enums.ShipState;
  var Position = require('../position.js');
  var Ship = require('../ship.js');
  var GameBoard = require('../game-board.js');
  var Player = require('../player.js');
}

function ComputerPlayer(name){
  Player.call(this, name || 'Computer');
}
ComputerPlayer.prototype = Object.create(Player.prototype);
var proto = {
  placeOwnShips: function(){
    var shipsPlaced = 0;
    while(shipsPlaced < 10){
      for (shipsPlaced = 0; shipsPlaced < this.ownBoard.ships.length; ++shipsPlaced){
        var ship = this.ownBoard.ships[shipsPlaced];
        var hOptions = this.ownBoard.getPlaceOptions(ship.size, Orientation.H);
        var vOptions = this.ownBoard.getPlaceOptions(ship.size, Orientation.V);
        var totalOptions = hOptions.length + vOptions.length;
        if(totalOptions == 0)
          break;
        var chozen = Math.floor(Math.random() * totalOptions);
        if(chozen < hOptions.length){
          ship.position.column = hOptions[chozen].column;
          ship.position.row = hOptions[chozen].row;
          ship.orientation = Orientation.H;
        }else{
          chozen -= hOptions.length;
          ship.position.column = vOptions[chozen].column;
          ship.position.row = vOptions[chozen].row;
          ship.orientation = Orientation.V;
        }
        this.ownBoard.placeShip(ship);
      }
      if(shipsPlaced < 10)
        this.ownBoard.unplaceAllShips();
    }
  },
  handleHitResult: function(hit, hitResult){
    switch (hitResult) {
    case Field.MISS:
      this.board.fields[hit.column][hit.row] = Field.MISS;
      break;
    case Field.DESTROYED:
      if(this.hotShip){
        this.hotShip.fields.push(hit);
        this.orientHotShip();
        this.handleDestroyed(this.hotShip.fields.length, this.hotShip.fields[0], this.hotShip.orientation);
        this.hotShip = null;
      }else
        this.handleDestroyed(1, hit, Orientation.H);
      break;
    case Field.HIT:
      this.board.fields[hit.column][hit.row] = Field.HIT;
      if(this.hotShip)
        this.hotShip.fields.push(hit);
      else
        this.hotShip = {
          fields: [hit]
        };
      break;
    }
  },
  handleDestroyed: function(size, position, orientation){
    var ship = this.board.ships.find(function(ship){
      return ship.size == size && ship.state != ShipState.DESTROYED;
    });
    ship.position.column = position.column;
    ship.position.row = position.row;
    ship.orientation = orientation;
    ship.state = ShipState.DESTROYED;
    var shipFields = ship.getFields();
    for (var i = 0; i < shipFields.length; ++i)
      this.board.fields[shipFields[i].column][shipFields[i].row] = Field.DESTROYED;
    this.markMissAroundDestroyed(ship);
  },
  markMissAroundDestroyed: function(ship){
    var neighbors = ship.getValidNeighbors();
    for (i = 0; i < neighbors.length; ++i)
      this.board.fields[neighbors[i].column][neighbors[i].row] = Field.MISS;
  },
  chooseHit: function(){
    if(this.hotShip){
      return this.chooseFollowHit();
    }else{
      var aliveShips = this.board.getAliveShips().reduce(function(count, ship){
        count[ship.size]++;
        return count;
      }, Array(5).fill(0));
      var options = [];
      for (var i = 0; i < 10; ++i)
        for (var j = 0; j < 10; ++j){
          if(this.board.fields[i][j] == Field.EMPTY){
            var option = new Position(i, j);
            option.score = this.countPossibleShips(i, j, aliveShips);
            options.push(option);
          }
        }
      options.sort(function(p1, p2){
        return p2.score - p1.score;
      });
      var maxScore = options[0].score;
      var bestOptionCount = options.findIndex(function(p){
        return p.score < maxScore;
      });
      if(!~bestOptionCount)
        bestOptionCount = options.length;
      return options[Math.floor(Math.random() * bestOptionCount)];
    }
  },
  countPossibleShips: function(column, row, aliveShips){
    var result = aliveShips[1];
    var testShip = new Ship(1);
    var orientations = [Orientation.H, Orientation.V];
    for (var i = 2; i <= 4; ++i){
      var multiplier = aliveShips[i];
      if(multiplier > 0){
        testShip.size = i;
        var count = 0;
        for (var j = 0; j < i; ++j){
          for (var k = 0; k < 2; ++k){
            testShip.orientation = orientations[k];
            testShip.position.column = column;
            testShip.position.row = row;
            testShip.position.shift(testShip.orientation, -j);
            if(testShip.fits() && this.board.isPlaceEmpty(testShip))
              ++count;
          }
        }
        result += count * multiplier;
      }
    }
    return result;
  },
  orientHotShip: function(){
    var hotShip = this.hotShip;
    if(hotShip){
      hotShip.fields.sort(function(p1, p2){
        return (p1.row - p2.row) || (p1.column - p2.column);
      });
      if(!hotShip.orientation && hotShip.fields.length > 1){
        if(hotShip.fields[0].row == hotShip.fields[1].row)
          hotShip.orientation = Orientation.H;
        else
          hotShip.orientation = Orientation.V;
      }
    }
  },
  chooseFollowHit: function(){
    var hotShip = this.hotShip, self = this;
    var directions;
    this.orientHotShip();
    if(hotShip.orientation)
      directions = hotShip.orientation == Orientation.H ? [Direction.LEFT, Direction.RIGHT] : [Direction.UP,
          Direction.DOWN];
    else
      directions = [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN];
    var options = directions.map(function(direction){
      var baseField;
      switch (direction) {
      case Direction.LEFT:
      case Direction.UP:
        baseField = hotShip.fields[0];
        break;
      case Direction.RIGHT:
      case Direction.DOWN:
        baseField = hotShip.fields[hotShip.fields.length - 1];
      }
      var testPosition = new Position(baseField.column, baseField.row), score = -1;
      do{
        testPosition.shift(direction, 1);
        ++score;
      }while(testPosition.isValid() && self.board.fields[testPosition.column][testPosition.row] == Field.EMPTY);
      return {
        direction: direction,
        score: score,
        base: baseField
      };
    });
    options.sort(function(o1, o2){
      return o2.score - o1.score;
    });
    var maxScore = options[0].score;
    var bestOptionCount = options.findIndex(function(o){
      return o.score < maxScore;
    })
    if(!~bestOptionCount)
      bestOptionCount = options.length;
    var chozen = options[Math.floor(Math.random() * bestOptionCount)];
    var hit = new Position(chozen.base.column, chozen.base.row);
    hit.shift(chozen.direction, 1);
    return hit;
  }
}

for(var key in proto){
  ComputerPlayer.prototype[key] = proto[key]; 
}

if(module && module.exports){
  module.exports = ComputerPlayer;
}