var width = screen.width;
var height = screen.height;

var game = new Phaser.Game(width*.8, height*.6, Phaser.SHOW_ALL, 'gameDiv', { preload: preload, create: create, update: update});


function preload() {
  game.load.text('leveldata', 'static/js/levels.json');

  game.load.image('level1Background', 'static/assets/images/voodoo_cactus_island.png');
  game.load.image('level2Background', 'static/assets/images/fishbgexp.jpg');
  game.load.image('level3Background', 'static/assets/images/cloudsinthedesert.png');
  game.load.image('diamond', 'static/assets/images/diamond.png');
}


var emitter;
var level = 0
var scoreText;
var score = 0;
var livesText;
var lives = 3;
var wordPool;

function create() {
  game.levelData = JSON.parse(game.cache.getText('leveldata')); 
  var levelVars = game.levelData.levelVariables[level];


  game.stage.backgroundColor = '#1A1A1A';

  game.add.tileSprite(0, 0, width*.8, height*.6, levelVars.background);
  scoreText = game.add.text(5,5, 'Points: 0', {font: '1.8em Georgia', fill: '#0095DD'});
  livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, {font: '1.8em Georgia', fill: '#0095DD'});
  livesText.anchor.set(1,0);


  game.physics.startSystem(Phaser.Physics.ARCADE);


  wordPool = game.add.group();
  wordPool.enableBody = true;
  wordPool.physicsBodytype = Phaser.Physics.ARCADE;

  wordPool.setAll('anchor.x', 0.5);
  wordPool.setAll('anchor.y', 0.5);

  wordPool.setAll('outOfBoundsKill', true);
  wordPool.setAll('checkWorldbounds', true);

  var words = Object.keys(verbs);
  var length = words.length;
  function createWord() {
	var randomNumber = game.rnd.integerInRange(0,length-1);
	var word = game.add.text(game.world.randomX, height, words[randomNumber], { font: "3em Arial Black", fill: "#c51b7d"}, wordPool);
	word.stroke = "d377ae";
	word.strokeThickness = 3;
	word.setShadow(2,2, "#333333", 2, true, false);
	word.data = {
		regular : verbs[words[randomNumber]].regular
	}
	word.inputEnabled = true;
	word.events.onInputDown.add(test, this);

	word.body.velocity.setTo(game.rnd.integerInRange(levelVars.velocityXlower,levelVars.velocityXhigher),game.rnd.integerInRange(levelVars.velocityYlower,levelVars.velocityYhigher));
	word.body.collideWorldBounds = true;
	word.body.bounce.set(1);
	return word;
  }


  game.physics.arcade.checkCollision.down = false;

  game.time.events.loop(levelVars.timeToSpawn, createWord, this);

  emitter = game.add.emitter(0,0,100);
  emitter.makeParticles('diamond');
  emitter.gravity = 200;

  function test(sprite, pointer) {
      if (!sprite.data.regular) {
	  diamondBurst(sprite);
  	  score += 10;
	  scoreText.setText('Points: ' + score);	  
	  if (levelVars.title == 'level3' && score == levelVars.mustScore) {
  game.state.start('win');
} else if (score == levelVars.mustScore)
 {
	    game.state.start('levelUp');
	  }
	  sprite.kill();
      } else {
	  flash();
	  loseLife();
      }
  }

  function flash() {
    game.camera.flash(0xff0000,500);
    game.camera.shake(0.05,500);
  }

  function diamondBurst(sprite) {
    emitter.x = sprite.x;
    emitter.y = sprite.y;

    emitter.start(true, 3000, null, 10);

    //game.time.events.add(2000, destroyEmitter, this);
  }


//this function breaks everything, so not calling it
  function destroyEmitter() {
    emitter.destroy();
  }

  function loseLife() {
      lives--;
      livesText.setText('Lives: ' + lives);
      if (!lives) {
        game.state.start('lose');
      }
  }

  game.scale.refresh();

}

function update() {


}

var bootState = {
  
  preload: function() {
    game.load.image('logo','static/assets/images/logo.png');

    /* this was a mistake, using height instead of width, but
       it seems to work, so leaving it for now */
    game.add.text(30, game.world.height - 35, 'tap the screen to start', {font: "1.6em Georgia", fill: '#0095DD'});
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;  

},

  create: function() {
    console.log("Bootstate");

    game.add.sprite(0,0,'logo');
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.input.onTap.addOnce(this.start, this);
  },

  start: function() {
    game.state.start('load');
  }
};

var loadState = {
  preload: function() {
    preload();
  },
  create: function() {
    console.log('Loadstate');

  game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  
  game.scale.refresh();

var instructionsText = game.add.text(15,35, instructions, {font: '1.75em Georgia', fill: '#0095DD', wordWrap: true, wordWrapWidth:width*.75 });
    var continueText = game.add.text(30, game.world.height - 50, "touch the screen to continue...", {font: "1.5em Georgia", fill: '#0095DD'});

    game.input.onTap.addOnce(this.start, this);  

},
  start: function() {
    game.state.start('play');
  }
};


var playState = {
  create: function() {
    console.log('Playstate');
    score = 0;
    lives = 3;
    create();
  },
  update: function() {
    update();
  }
};

var progressState = {
  create: function() {
    level++;
    console.log('Level Up!!');
    game.stage.backgroundColor = "#1A1A1A";
    var congratsText = game.add.text(30, 50, "You passed the level!!", {font: '2.5em Georgia',fill: '#0095DD', wordWrap: true, wordWrapWidth:width*.75 });
    var continueText = game.add.text(30, game.world.height - 50, "Touch the screen to continue to the next level!!!", {font: '1.5em Georgia',fill: '#0095DD', wordWrap: true, wordWrapWidth:width*.65 });
    game.input.onTap.addOnce(this.start, this);
  },
  start: function() {
    game.state.start('play');
  }
};

var winState = {
  create: function() {
    console.log('winState');
    game.stage.backgroundColor = '#1A1A1A';
    var winText = game.add.text(30,50, "YOU WIN!!!", {font:'2.5em Georgia',fill:'#0095DD'});
    var continueText = game.add.text(30, game.world.height -50, "Touch the screen to play again...", {font:'1.5em Georgia', fill: '#0095DD',wordWrap: true, wordWrapWidth:width*.65 });
    game.input.onTap.addOnce(this.start, this);
  },
  start: function() {
    level = 0;
    game.state.start('play');
  }
};


var loseState = {
  create: function() {
    console.log('loseState');
    game.stage.backgroundColor = '#1A1A1A';
    var instructionsText = game.add.text(30, 50, "GAME OVER", {font:'2.5em Georgia',fill:'#0095DD'});
    var continueText = game.add.text(30, game.world.height - 50, "Touch the screen to play again...", {font:'1.5em Georgia',fill:'#0095DD', wordWrap: true, wordWrapWidth:width*.65});  
      game.input.onTap.addOnce(this.start, this);
  },
  start: function() {
    level = 0;
    game.state.start('play');
  }
};

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('play', playState);
game.state.add('levelUp', progressState);
game.state.add('win', winState);
game.state.add('lose', loseState);

game.state.start('boot');
