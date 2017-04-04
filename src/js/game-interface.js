function GameInterface(game){
  this.game = game;
}

GameInterface.prototype = {
  handleMove: function(game, move){
    console.warn('not implemented')
  },
  handleFinish: function(game, winner){
    console.warn('not implemented')
  },
  handleContinue: function(game, move){
    console.warn('not implemented')
  }
}

if(module && module.exports){
  module.exports = GameInterface;
}
