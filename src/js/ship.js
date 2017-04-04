if(require){
  var enums = require('./enums.js');
  var Field = enums.Field;
  var Orientation = enums.Orientation;
  var Direction = enums.Direction;
  var ShipState = enums.ShipState;
  var Position = require('./position.js');
}

function Ship(size, orientation, position, state, hitMask){
  this.size = size;
  this.orientation = orientation || Orientation.H;
  this.position = position || new Position(0, 0);
  this.state = state || ShipState.IN_STOCK;
  this.hitMask = typeof (hitMask) !== 'undefined' ? hitMask : Ship.defaultHitMask(this.state, this.size);
}

Ship.defaultHitMask = function(state, size){
  switch (state) {
  case ShipState.IN_STOCK:
  case ShipState.PLACING:
  case ShipState.PLACED:
    return 0;
  case ShipState.HIT:
    return 1;
  case ShipState.DESTROYED:
    return ~(-1 << size);
  }
}

Ship.prototype = {
  isPlaced: function(){
    return this.state == ShipState.PLACED || this.state == ShipState.HIT || this.state == ShipState.DESTROYED;
  },
  fits: function(){
    return this.left >= 0 && this.top >= 0 && this.right < 10 && this.bottom < 10;
  },
  occupies: function(column, row){
    if(arguments.length == 1){
      if(!(column instanceof Position))
        column = new Position(column);
      row = column.row;
      column = column.column;
    }
    var here = this.position;
    switch (this.orientation) {
    case Orientation.H:
      return row == here.row && column >= here.column && column < here.column + this.size;
    case Orientation.V:
      return column == here.column && row >= here.row && row < here.row + this.size;
    }
  },
  touches: function(ship){
    var here = this.getBounds();
    var there = ship.getBounds();
    --here.left;
    --here.top;
    ++here.right;
    ++here.bottom;
    return here.left <= there.right && there.left <= here.right && here.top <= there.bottom && there.top <= here.bottom;
  },
  isFieldHit: function(column, row){
    if(this.state == ShipState.IN_STOCK || this.state == ShipState.PLACING || this.state == ShipState.PLACED)
      return false;
    if(arguments.length == 1){
      if(!(column instanceof Position))
        column = new Position(column);
      row = column.row;
      column = column.column;
    }
    if(!this.occupies(column, row))
      return false;
    if(this.state == ShipState.DESTROYED)
      return true;
    if(!this.hitMask)
      return false;
    if(this.state == ShipState.HIT){
      var range = Math.max(column - this.position.column, row - this.position.row);
      return !!(this.hitMask & (1 << range));
    }
  },
  getBounds: function(){
    return {
      left: this.left,
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      width: this.width,
      height: this.height
    };
  },
  getFields: function(){
    var fields = [], i, start;
    switch (this.orientation) {
    case Orientation.H:
      for (start = this.position.column, i = 0; i < this.size; ++i)
        fields.push(new Position(start + i, this.position.row));
      break;
    case Orientation.V:
      for (start = this.position.row, i = 0; i < this.size; ++i)
        fields.push(new Position(this.position.column, start + i));
    }
    return fields;
  },
  getValidNeighbors: function(){
    const
    bounds = this.getBounds();
    var neighbors = [], i;
    for (i = bounds.left - 1; i <= bounds.right; ++i)
      neighbors.push(new Position(i, bounds.top - 1));
    for (i = bounds.top - 1; i <= bounds.bottom; ++i)
      neighbors.push(new Position(bounds.right + 1, i));
    for (i = bounds.right + 1; i >= bounds.left; --i)
      neighbors.push(new Position(i, bounds.bottom + 1));
    for (i = bounds.bottom + 1; i >= bounds.top; --i)
      neighbors.push(new Position(bounds.left - 1, i));
    return neighbors.filter(function(p){
      return p.isValid();
    });
  },
  getHitFields: function(){
    switch (this.state) {
    case ShipState.IN_STOCK:
    case ShipState.PLACING:
    case ShipState.PLACED:
    default:
      return [];
    case ShipState.DESTROYED:
      return this.getFields();
    case ShipState.HIT:
      var fields = [], here = this.position;
      for (var i = this.size - 1, mask = 1 << i; i >= 0; mask >>= 1, --i)
        if(this.hitMask & mask)
          fields.push(new Position(here.column, here.row).shift(this.orientation, i));
      return fields;
    }
  },
  clamp: function(){
    this.left = Math.max(0, this.left);
    this.right = Math.min(9, this.right);
    this.top = Math.max(0, this.top);
    this.bottom = Math.min(9, this.bottom);
  },
  hitField: function(column, row){
    if(arguments.length == 1){
      if(!(column instanceof Position))
        column = new Position(column);
      row = column.row;
      column = column.column;
    }
    var range = Math.max(column - this.position.column, row - this.position.row);
    this.hitMask |= (1 << range);
    if(this.hitMask === ~(-1 << this.size))
      this.state = ShipState.DESTROYED;
    else
      this.state = ShipState.HIT;
    return this.state;
  }
}

Object.defineProperty(Ship.prototype, 'width', {
  get: function(){
    switch (this.orientation) {
    case Orientation.H:
      return this.size;
    case Orientation.V:
      return 1;
    }
  }
});

Object.defineProperty(Ship.prototype, 'height', {
  get: function(){
    switch (this.orientation) {
    case Orientation.H:
      return 1;
    case Orientation.V:
      return this.size;
    }
  }
});

Object.defineProperty(Ship.prototype, 'left', {
  get: function(){
    return this.position.column;
  },
  set: function(value){
    this.position.column = value;
  }
});

Object.defineProperty(Ship.prototype, 'top', {
  get: function(){
    return this.position.row;
  },
  set: function(value){
    this.position.row = value;
  }
});

Object.defineProperty(Ship.prototype, 'right', {
  get: function(){
    return this.position.column + this.width - 1;
  },
  set: function(value){
    this.position.column = value - this.width + 1;
  }
});

Object.defineProperty(Ship.prototype, 'bottom', {
  get: function(){
    return this.position.row + this.height - 1;
  },
  set: function(value){
    this.position.row = value - this.height + 1;
  }
});

if(module && module.exports){
  module.exports = Ship;
}