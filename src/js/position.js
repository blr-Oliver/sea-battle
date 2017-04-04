if(require){
  var enums = require('./enums.js');
  var Orientation = enums.Orientation;
  var Direction = enums.Direction;
}

function Position(column, row){
  if(arguments.length == 1){
    row = Array.prototype.slice.call(column, 1).join('');
    column = column[0];
  }
  if(typeof (column) === 'string'){
    column = column[0].toUpperCase();
    this.column = ~(~Position.COLUMNS.ru.indexOf(column) || ~Position.COLUMNS.en.indexOf(column));
  }else if(typeof (column) === 'number')
    this.column = column;
  if(typeof (row) === 'string')
    this.row = row - 1;
  else if(typeof (row) === 'number')
    this.row = row;
}
Position.COLUMNS = Object.freeze({
  en: 'ABCDEFGHIJ',
  ru: 'АБВГДЕЖЗИК'
});
Position.isValid = function(column, row){
  return row >= 0 && row < 10 && column >= 0 && column < 10;
}
Position.prototype = {
  isValid: function(){
    return Position.isValid(this.column, this.row);
  },
  translate: function(columns, rows){
    this.column += columns;
    this.row += rows;
    return this;
  },
  shift: function(direction, distance){
    switch (direction) {
    case Direction.UP:
      return this.translate(0, -distance);
    case Direction.RIGHT:
    case Orientation.H:
      return this.translate(distance, 0);
    case Direction.DOWN:
    case Orientation.V:
      return this.translate(0, distance);
    case Direction.LEFT:
      return this.translate(-distance, 0);
    }
  },
  toString: function(){
    return this.columnSymbol + this.rowSymbol;
  }
}
Object.defineProperty(Position.prototype, 'columnSymbol', {
  get: function(){
    return Position.COLUMNS.en[this.column];
  }
})
Object.defineProperty(Position.prototype, 'rowSymbol', {
  get: function(){
    return String(this.row + 1);
  }
})
if(module && module.exports){
  module.exports = Position;
}