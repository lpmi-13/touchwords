var Touchwords = {};

Touchwords.Boot = function(game) {
};

Touchwords.Boot.prototype = {
  preload: function() {
    this.load.image('logo', '../static/assets/images/logo.png');
    this.load.image('preloadbar', '../static/assets/images/loading.png')
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;  
  },
  create: function() {
    this.game.stage.backgroundColor = '#ffffff';
 
    var width = screen.width;
    var height = screen.height;
    var portrait = checkOrientation(width, height)

    if (portrait){
      var logoWidth = 296;
      var logoHeight = 207;
      var gameLogo = this.game.add.sprite(game.world.centerX,game.world.centerY/2,'logo');
      gameLogo.anchor.set(0.5);
      var resizeX = (game.world.width/logoWidth);
      var resizeY = (game.world.height/logoHeight)/2;
      gameLogo.scale.setTo(resizeX,resizeY);

    } else {
      var gameLogo = this.game.add.sprite(game.world.centerX,game.world.centerY/2,'logo');
      gameLogo.anchor.set(0.5);

      var touchToStart = this.game.add.text(game.world.centerX, game.world.height - 35, 'touch the screen to start', {font: "1.6em Georgia", fill: '#0095DD'});
      touchToStart.anchor.set(0.5);
    
      touchToStart.alpha = 1;
      var textTween = this.game.add.tween(touchToStart).to( { alpha: .25 }, 300, "Linear", true, 1, -1);
      textTween.yoyo(true, 300);
    
      this.input.onTap.addOnce(this.start, this);
    
  }
  start: function() {
    this.state.start('Preloader');
  }
};
