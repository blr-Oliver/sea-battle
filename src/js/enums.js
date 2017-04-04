var Field = Object.freeze({
  EMPTY: 'empty',
  SHIP: 'ship',
  HIT: 'hit',
  DESTROYED: 'destroyed',
  MISS: 'miss'
});

var Orientation = Object.freeze({
  H: 'horizontal',
  V: 'vertical'
});

var Direction = Object.freeze({
  UP: 'up',
  RIGHT: 'right',
  DOWN: 'down',
  LEFT: 'left'
});

var ShipState = Object.freeze({
  IN_STOCK: 'in_stock',
  PLACING: 'placing',
  PLACED: 'placed',
  HIT: 'hit',
  DESTROYED: 'destroyed'
});

if(module && module.exports){
  module.exports.Field = Field;
  module.exports.Orientation = Orientation;
  module.exports.Direction = Direction;
  module.exports.ShipState = ShipState;
}