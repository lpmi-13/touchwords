Touchwords.Midloader = function(game){
};

Touchwords.Midloader.prototype = {
  preload: function() {
    preload();
  },
  create: function() {
    console.log('Midloadstate');

    this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
  
    this.scale.refresh();

    var instructionsText = this.add.text(15,35, instructions, {font: '1.75em Georgia', fill: '#0095DD', wordWrap: true, wordWrapWidth:this.world.width*.85 });

    if (portrait){
      var continueText = this.add.text(game.world.centerX, game.world.height - 25, "touch the screen to continue...", {font: "1.5em Georgia", fill: '#0095DD'});
      continueText.anchor.set(0.5);
      this.input.onTap.addOnce(this.start, this);  
    } else { 
      var continueText = this.add.text(game.world.centerX, game.world.height - 50, "touch the screen to continue...", {font: "1.5em Georgia", fill: '#0095DD'});
      continueText.anchor.set(0.5);
      this.input.onTap.addOnce(this.start, this);  
    }
  },
  
  start: function() {
    game.state.start('play');
  }

};

