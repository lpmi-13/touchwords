Touchwords.Preloader = function(game) {
  this.ready = false;
};

Touchwords.Preloader.prototype = {
  preload: function() {
    this.preloadBar = this.add.sprite(10, 30, 'preloadbar');
    this.load.setPreloadSprite(this.preloadbar);

    //load image assets and show progress in loader bar
    this.load.text('leveldata', '../static/js/levels.json');
    this.load.image('heart', '../static/assets/images/Heart.png');
    this.load.image('button', '../static/assets/images/roundedColoredButton.png');
    this.load.image('deleteButton', '../static/assets/images/deleteButton');
    this.load.image('level1Background', '../static/assets/images/voodoo_cactus_island_scaled.png');
    this.load.image('level2Background', '../static/assets/images/fishbgexp_scaled.jpg');
    this.load.image('level3Background', '../static/assets/images/cloudsinthedesert_scaled.png');
    this.load.image('diamond', '../static/assets/images/diamond.png');
  },
  loadComplete: function() {
    this.ready = true;
  },
  update: function() {
    if (this.ready === true) {
      this.state.start('Game');
    }
  }
};
