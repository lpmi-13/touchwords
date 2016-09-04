var width = screen.width;
var height = screen.height;

var portrait = checkOrientation(width, height)

function logAllThings() {
  console.log('the screen width is ' + screen.width);
  console.log('the screen height is ' + screen.height);
  console.log('the game world width is ' + game.world.width);
  console.log('the game world height is ' + game.world.height);
}



function checkOrientation(width, height) {
  if (height > width) {
    return true;
  } else {
    return false;
  }
}

var game = new Phaser.Game(width*.8, height*.6, Phaser.SHOW_ALL, 'gameDiv', { preload: preload, create: create, update: update});


function preload() {
  game.load.text('leveldata', 'static/js/levels.json');

  game.load.image('heart', 'static/assets/images/Heart.png');

  game.load.image('level1Background', 'static/assets/images/voodoo_cactus_island.png');
  game.load.image('level2Background', 'static/assets/images/fishbgexp.jpg');
  game.load.image('level3Background', 'static/assets/images/cloudsinthedesert.png');
  game.load.image('diamond', 'static/assets/images/diamond.png');
}

var emitter;
var level = 0;
var scoreText;
var score = 0;
var livesPool;
var wordPool;
var scorePool;
var heartPool;

function create() {
  game.levelData = JSON.parse(game.cache.getText('leveldata')); 
  var levelVars = game.levelData.levelVariables[level];

console.log(levelVars);

  game.stage.backgroundColor = 0x000000;

var background = game.add.tileSprite(0, 0, levelVars.backgroundWidth, levelVars.backgroundHeight, levelVars.background);

var resizeX = game.world.width/levelVars.backgroundWidth;
var resizeY = game.world.height/levelVars.backgroundHeight;

logAllThings();
console.log('the backgroundWidth = ' + levelVars.backgroundWidth);
console.log('the backgroundHeight = ' + levelVars.backgroundHeight);


background.tileScale.x = resizeX;
background.tileScale.y = resizeY;

  scoreText = game.add.text(5,5, 'Points: 0/' + levelVars.mustScore , {font: '1.8em Georgia', fill: '#0095DD'});

  heartPool = game.add.group();

  for (var i = 1; i < 4; i++) {
    heartSprite = game.add.sprite(game.world.width - (35*i), 5, 'heart');
    heartSprite.scale.set(0.1,0.1);
    heartPool.add(heartSprite);
  }

  var heartCount = heartPool.countLiving();

  game.physics.startSystem(Phaser.Physics.ARCADE);

  scorePool = game.add.group();
  scorePool.setAll('anchor.x', 0.5);
  scorePool.setAll('anchor.y', 0.5);
  scorePool.enableBody = true;
  scorePool.physicsBodytype = Phaser.Physics.ARCADE;

  function addScore(sprite) {
    var oldText = scorePool.getFirstExists();
    if (oldText) {
      var increaseScoreText = oldText.reset(sprite.x,sprite.y);
    } else {
      var increaseScoreText = game.add.text(sprite.x, sprite.y, '+10', {font: '3em Georgia', fill: '#0095DD'}, scorePool);
    }
    increaseScoreText.body.velocity.setTo(0,-200);
    return increaseScoreText;
  }

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

  var spawnLoop = game.time.events.loop(levelVars.timeToSpawn, createWord, this);

  emitter = game.add.emitter(0,0,100);
  emitter.makeParticles('diamond');
  emitter.gravity = 200;

  function test(sprite, pointer) {
      if (!sprite.data.regular) {
	  diamondBurst(sprite);
          addScore(sprite);
  	  score += 10;
	  scoreText.setText('Points: ' + score + '/' + levelVars.mustScore);	  
	  if (levelVars.title == 'level3' && score == levelVars.mustScore) {
              winTransition();
          } else if (score == levelVars.mustScore) {
	      levelUpTransition();
	  }
	  sprite.kill();
      } else {
	  flash();
	  loseLife();
      }
  }

  function winTransition() {
    wordPool.callAll('kill');
    if (portrait) {
      levelUpText = game.add.text(game.world.centerX, -150, 'You passed the level!!!', {font: '2em Georgia',fill:'#0095DD'});
    } else {
      levelUpText = game.add.text(game.world.centerX, -150, 'You passed the level!!!', {font: '8em Georgia', fill: '#0095DD'});
    }
    
    levelUpText.anchor.set(0.5);
    var tweenTransition = game.add.tween(levelUpText).to( {y: game.world.centerY }, 4000, Phaser.Easing.Bounce.Out, true);
    game.time.events.pause();
    tweenTransition.onComplete.add(startWinFade, this);
  }

  function startWinFade() { 
    game.camera.fade(0x000000, 1500, true);
    game.camera.onFadeComplete.add(winFadeComplete,this);
  }

  function winFadeComplete() {
    game.time.events.resume();
    game.state.start('win');
  }

  function levelUpTransition() {
    wordPool.callAll('kill');

    if (portrait) {
      levelUpText = game.add.text(game.world.centerX, -150, 'You passed the level!!!', {font: '2em Georgia',fill:'#0095DD'});
    } else {
      levelUpText = game.add.text(game.world.centerX,-150, 'You passed the level!!!',{font:'8em Georgia',fill:'#0095DD'});
    }

    levelUpText.anchor.set(0.5);
    var tweenTransition = game.add.tween(levelUpText).to( { y: game.world.centerY }, 4000, Phaser.Easing.Bounce.Out, true);
    game.time.events.pause();
    tweenTransition.onComplete.add(startProgressFade, this);
  }

  function  startProgressFade() {
    game.camera.fade(0x000000, 1500, true);
    game.camera.onFadeComplete.add(progressFadeComplete,this); 
 }

  function progressFadeComplete() {
    game.time.events.resume();
    game.state.start('levelUp');
  }

  function flash() {
    game.camera.flash(0xff0000,300);
    game.camera.shake(0.05,300);
  }

  function diamondBurst(sprite) {
    emitter.x = sprite.x;
    emitter.y = sprite.y;

   

    emitter.start(true, 1000, null, 5);

    //game.time.events.add(2000, destroyEmitter, this);
  }


//this function breaks everything, so not calling it
//  function destroyEmitter() {
//    emitter.destroy();
//  }

  function loseLife() {
      heartCount--;
      var heart = heartPool.getFirstAlive();
      heart.kill();
      console.log(heartCount);
      if (!heartCount) {
        startLoseFade();
      }
  }


  function startLoseFade() {
    game.camera.fade(0x000000, 1500,true);
    wordPool.callAll('kill');
    game.time.events.add(1500,loseFadeComplete, this);
  }

  function loseFadeComplete() {
     game.state.start('lose');
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
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;  

},

  create: function() {
    console.log("Bootstate");
//    logAllThings();
    if (portrait){
      var logoWidth = 296;
      var logoHeight = 207;
      var gameLogo = game.add.sprite(game.world.centerX,game.world.centerY/2,'logo');
      gameLogo.anchor.set(0.5);
      var resizeX = (game.world.width/logoWidth)/2;
      var resizeY = (game.world.height/logoHeight)/2;
      gameLogo.scale.setTo(resizeX,resizeY);
      var touchToStart = game.add.text(game.world.centerX, game.world.height - 35, 'touch the screen to start', {font: "1.6em Georgia", fill: '#0095DD'});
      touchToStart.anchor.set(0.5);
    } else {
      var gameLogo = game.add.sprite(game.world.centerX,game.world.centerY/2,'logo');
      gameLogo.anchor.set(0.5);
      var touchToStart = game.add.text(game.world.centerX, game.world.height - 35, 'touch the screen to start', {font: "1.6em Georgia", fill: '#0095DD'});
      touchToStart.anchor.set(0.5);
    }    
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

var instructionsText = game.add.text(15,35, instructions, {font: '1.75em Georgia', fill: '#0095DD', wordWrap: true, wordWrapWidth:game.world.width*.85 });

  if (portrait){
    var continueText = game.add.text(game.world.centerX, game.world.height - 25, "touch the screen to continue...", {font: "1.5em Georgia", fill: '#0095DD'});
    continueText.anchor.set(0.5);
    game.input.onTap.addOnce(this.start, this);  
  } else { 
    var continueText = game.add.text(game.world.centerX, game.world.height - 50, "touch the screen to continue...", {font: "1.5em Georgia", fill: '#0095DD'});
    continueText.anchor.set(0.5);
    game.input.onTap.addOnce(this.start, this);  
  }
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
    console.log('Level Up!!'); game.stage.backgroundColor = 0x000000;
    var continueText = game.add.text(game.world.centerX, game.world.centerY, "Touch the screen to continue to the next level!!!", {font: '2.5em Georgia',fill: '#0095DD', wordWrap: true, wordWrapWidth:width*.65 });
    continueText.anchor.set(0.5);
    game.input.onTap.addOnce(this.start, this);
  },
  start: function() {
    game.state.start('play');
  }
};

var winState = {
  create: function() {
    console.log('winState');
    game.stage.backgroundColor = 0x000000;
    var winText = game.add.text(game.world.centerX,game.world.centerY, "THAT'S ALL, YOU WIN!!!", {font:'2.5em Georgia',fill:'#0095DD', wordWrap: true, wordWrapWidth: width*.65});
    winText.anchor.set(0.5);
    var continueText = game.add.text(game.world.centerX, game.world.height -50, "Touch the screen to play again...", {font:'1.5em Georgia', fill: '#0095DD',wordWrap: true, wordWrapWidth:width*.65 });
    continueText.anchor.set(0.5);
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
    game.stage.backgroundColor = 0x000000;
    var instructionsText = game.add.text(game.world.centerX, game.world.centerY, "GAME OVER", {font:'2.5em Georgia',fill:'#0095DD'});
    instructionsText.anchor.set(0.5);
    var continueText = game.add.text(game.world.centerX, game.world.height - 50, "Touch the screen to play again...", {font:'1.5em Georgia',fill:'#0095DD', wordWrap: true, wordWrapWidth:width*.65});
    continueText.anchor.set(0.5);  
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
