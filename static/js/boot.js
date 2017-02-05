var Touchwords = {};

Touchwords.Boot = function(game) {
};

Touchwords.Boot.prototype = {
  preload: function() {
    this.load.image('preloadbar', 'static/assets/images/loading.png')
  },
  create: function() {
    this.game.stage.backgroundColor = '#ffffff';
  },
  update: function() {
    this.state.start('Preloader');
  }
};
