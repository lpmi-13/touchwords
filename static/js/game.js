
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
  return height > width; 
}

if (portrait) {
  var game = new Phaser.Game(width*.8,height*.7, Phaser.CANVAS, 'gameDiv', {preload: preload, create: create, update: update});
  } else {

  var game = new Phaser.Game(width*.8, height*.75, Phaser.CANVAS, 'gameDiv', { preload: preload, create: create, update: update});
  }

function preload() {


//  var loadingBar = game.add.sprite(0, game.world.height - 100, 'preloader');
//  var loadingBarResizeX = game.world.width/387;
//  loadingBar.scale.setTo(loadingBarResizeX,1);  
//  var statusText = game.add.text(game.world.centerX, game.world.height - 130, 'Loading...', {fill: 'white'});
//  statusText.anchor.setTo(0.5);
//  game.load.setPreloadSprite(loadingBar);


  game.load.text('leveldata', 'static/touchwords/js/levels.json');

  game.load.image('heart', 'static/touchwords/assets/images/Heart.png');
  game.load.image('button', 'static/touchwords/assets/images/coloredButton.png');
  game.load.image('deleteButton', 'static/touchwords/assets/images/deleteButton.png');

  game.load.image('level1Background', 'static/touchwords/assets/images/voodoo_cactus_island_scaled.png');
  game.load.image('level2Background', 'static/touchwords/assets/images/fishbgexp_scaled.jpg');
  game.load.image('level3Background', 'static/touchwords/assets/images/cloudsinthedesert_scaled.png');
  game.load.image('diamond', 'static/touchwords/assets/images/diamond.png');
}

var emitter;
var level = 0;
var scoreText;
var score = 0;
var livesPool;
var wordPool;
var scorePool;
var heartPool;
var clickedArray = [];

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

console.log('resizeX is ' + resizeX);
console.log('resizeY is ' + resizeY);
background.tileScale.x = resizeX;
background.tileScale.y = resizeY;

  scoreText = game.add.text(5,5, 'Points: 0/' + levelVars.mustScore , {font: '1.8em Georgia', fill: '#0095DD'});

  heartPool = game.add.group();

  for (var i = 4; i > 1; i--) {
    heartSprite = game.add.sprite(game.world.width - (20*i), 5, 'heart');
    heartSprite.scale.set(0.075,0.075);
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


  var wordsArray = [];

  var words = Object.keys(verbs);
  var length = words.length;

  function createRandom() {
    return game.rnd.integerInRange(0, length - 1);
  }

  function createWord() {
	var randomNumber = (function() {
            var number = createRandom();
            while (wordsArray.indexOf(number) > -1) {
              number = createRandom();
            } 
	return number;
        })();

	var word = game.add.text(game.world.randomX, game.world.height, words[randomNumber], { font: "3em Arial Black", fill: "#c51b7d"}, wordPool);

	console.log('random number is ' + randomNumber);
	console.log('word = ' + words[randomNumber]);
	console.log('wordsArray is ' + wordsArray);

	wordsArray.push(randomNumber);
        if (wordsArray.length > 10) {
          wordsArray.shift();
        }

	word.stroke = "d377ae";
	word.strokeThickness = 3;
	word.setShadow(2,2, "#333333", 2, true, false);
	word.data = {
		regular : verbs[words[randomNumber]].regular,
		answer : verbs[words[randomNumber]].correction
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
          clickedArray.push({text:sprite.text,answer:sprite.data.answer});
	  diamondBurst(sprite);
          addScore(sprite);
  	  score += 10;
	  scoreText.setText('Points: ' + score + '/' + levelVars.mustScore);	  
//	  if (levelVars.title == 'level3' && score == levelVars.mustScore) {
  //            winTransition();
          if (score == levelVars.mustScore) {
	      levelUpTransition();
	  }
	  sprite.kill();
      } else {
	  flash();
	  loseLife();
      }
  }

//  function winTransition() {
//    wordPool.callAll('kill');
//    if (portrait) {
//      levelUpText = game.add.text(game.world.centerX, -150, 'You passed the level!!!', {font: '2.5em Georgia',fill:'#0095DD'});
//    } else {
//      levelUpText = game.add.text(game.world.centerX, -150, 'You passed the level!!!', {font: '8em Georgia', fill: '#0095DD'});
//    }
    
//    levelUpText.anchor.set(0.5);
//    var tweenTransition = game.add.tween(levelUpText).to( {y: game.world.centerY }, 4000, Phaser.Easing.Bounce.Out, true);
//    game.time.events.pause();
//    tweenTransition.onComplete.add(startWinFade, this);
//  }

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
      levelUpText = game.add.text(game.world.centerX, -150, 'You passed the level!!!', {font: '2.5em Georgia',fill:'#0095DD'});
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
    game.state.start('bonus');
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
    game.load.image('logo','static/touchwords/assets/images/logo.png');
    game.load.image('preloader', 'static/touchwords/assets/images/loading.png');

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
      var resizeX = (game.world.width/logoWidth);
      var resizeY = (game.world.height/logoHeight)/2;
      gameLogo.scale.setTo(resizeX,resizeY);

    } else {
      var gameLogo = game.add.sprite(game.world.centerX,game.world.centerY/2,'logo');
      gameLogo.anchor.set(0.5);
    } 
   
    var touchToStart = game.add.text(game.world.centerX, game.world.height - 35, 'touch the screen to start', {font: "1.6em Georgia", fill: '#0095DD'});
    touchToStart.anchor.set(0.5);
    
    touchToStart.alpha = 1;
    var textTween = game.add.tween(touchToStart).to( { alpha: .25 }, 300, "Linear", true, 1, -1);
    textTween.yoyo(true, 300);
    
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
    create();
  },
  update: function() {
    update();
  }
};

var bonusState = {
  create: function() {
    console.log('bonus round!');
    console.log(clickedArray);
    game.stage.backgroundColor = '#2B4970';
    var bonusCount = 0;
    var text;
    var square;

    var gameWidth = game.world.width;
    var gameHeight = game.world.height;


    this.startTime = new Date();
    this.totalTime = 120;
    this.timeElapsed = 0;

    this.createTimer();

    function updateTimer() {

      var currentTime = new Date();
      var timeDifference = this.startTime.getTime() - currentTime.getTime();

      this.timeElapsed = Math.abs(timeDifference / 1000);

      var timeRemaining = this.totalTime - this.timeElapsed;
      var minutes = Math.floor(timeRemaining / 60);
      var seconds = Math.floor(timeRemaining) - (60 * minutes);

      var result = (minutes < 10) ? '0' + minutes : minutes;

      result += (seconds < 10) ? ':0' + seconds : ':' + seconds;

      this.timeLabel.text = result;
    }

    var gameTimer = game.time.events.loop(100, updateTimer, this);

    var buttonPool = game.add.group();
    buttonPool.enableBody = true;
    var letterPool = game.add.group();
    var numberOfElements = 6;

    if (portrait) {
      var style = {font: '4.5em Arial', fill: '#000000', align: 'center'};
      var screenGutterWidth = gameWidth * .1;
      var elementWidth = (gameWidth - (screenGutterWidth*2))/numberOfElements;
    } else {
      var style = {font: '8.5em Arial', fill: '#000000', align: 'center'};
      var screenGutterWidth = gameWidth * .2;
      var elementWidth = (gameWidth - (screenGutterWidth*2))/numberOfElements;
    }

      var elementHeight = (game.world.height/6);

      var buttonScaleX = (elementWidth * .85)/53;
      var buttonScaleY = (elementHeight * .85)/40;
        console.log('game.world.width = ' + game.world.width);
        console.log('game width: ' + gameWidth);
        console.log('number of elements: ' + numberOfElements);
        console.log('element width: ' + elementWidth);
        console.log('buttonScaleX: ' + buttonScaleX);
        console.log('buttonScaleY: ' + buttonScaleY);

    function renderBonusItem() {
      console.log('the current count is: ' + bonusCount);
      console.log(clickedArray.length);
      var displayItem = clickedArray[bonusCount].text;
      var displayArray = displayItem.split('');
      var answer = clickedArray[bonusCount].answer;
      var wordItem = clickedArray[bonusCount].answer.split('');
      console.log(wordItem);

      var uniqueArray = displayArray.filter(function(obj) {
        return wordItem.indexOf(obj) == -1
      });

      var mixedArray = unique(wordItem.concat(uniqueArray));

      var shuffledWord = shuffle(mixedArray);

      var promptText = game.add.text(game.world.centerX, game.world.height * .2, 'correct this word: ', {font: '5em Georgia', fill: '#dc9a41'});
      promptText.anchor.set(0.5);
      var wordToCorrect = game.add.text(game.world.centerX, game.world.height * .3, displayItem, {font: '6em Georgia', fill :'#dc9a41'});
      wordToCorrect.anchor.set(0.5);
      wordToCorrect.stroke = 'AA9239';
      wordToCorrect.strokeThickness = 3;


      for (var j = 0; j < shuffledWord.length; j++) {
        var row = Math.floor(j / numberOfElements);
        var column = Math.floor(j % numberOfElements);

//        console.log('row is ' + row);
//      console.log('column is ' + column);

        var xPos = (column * elementWidth) + screenGutterWidth;
        var yPos = (game.world.height - 100) - (row * elementHeight);

//      console.log('xPos is ' + xPos);
        console.log('yPos is ' + yPos);
        console.log('game.world.height - 100 = ' + (game.world.height - 100));

        var button = game.add.sprite(xPos, yPos, 'button');
        button.anchor.set(0.5);
        button.inputEnabled = true;
        button.data.letter = shuffledWord[j];
        button.events.onInputDown.add(spellCheck, this);
        button.scale.set(buttonScaleX,buttonScaleY);
        buttonPool.add(button);

        var letterSprite = game.add.text(xPos, yPos, shuffledWord[j], style);
        letterSprite.anchor.set(0.5);
        letterPool.add(letterSprite);
      }


    var deleteButton = game.add.sprite(game.world.width - screenGutterWidth, game.world.height - 100, 'deleteButton');
    deleteButton.inputEnabled = true;
    deleteButton.anchor.set(0.5);
    deleteButton.scale.set(buttonScaleX,buttonScaleY);
    deleteButton.events.onInputDown.add(deleteLetter,this);

var spellText = "";

    var displaySpelling = game.add.text(game.world.centerX, game.world.centerY, spellText, {font:"8em Georgia", fill: '#AA6339', align: 'center'});

    displaySpelling.anchor.set(0.5);

    console.log('the level is: ' + level);

    function spellCheck(sprite,pointer) {
      spellText += sprite.data.letter;
      displaySpelling.setText(spellText);
      if (spellText == answer) {
        console.log('you got it!');
        bonusCount++;
        if (level === 2 && bonusCount == clickedArray.length) {
          startFinalWinFade();
        } else if (bonusCount == clickedArray.length) {
          clickedArray = [];
          startBonusWinFade();
        }  else {
          clearScreen();
          renderBonusItem();
        }
      }
    }

    function deleteLetter(sprite,pointer){
      spellText = spellText.substring(0, spellText.length - 1);
      displaySpelling.setText(spellText);
    }

    function clearScreen() {
      console.log('killing all buttons');
      buttonPool.callAll('kill');
      console.log('killing all letters');
      letterPool.callAll('kill');
      displaySpelling.setText('');
      wordToCorrect.setText('');
      promptText.setText('');
    }

    function startBonusWinFade() {
      game.camera.fade(0x000000, 1500, true);
      game.camera.onFadeComplete.add(bonusWinFadeComplete,this);
    }

    function bonusWinFadeComplete() {
      game.time.events.resume();
      game.state.start('levelUp');
    }

    function startFinalWinFade() {
      game.camera.fade(0x000000, 1500, true);
      game.camera.onFadeComplete.add(finalWinFadeComplete,this);
    }

    function finalWinFadeComplete() {
      game.time.events.resume();
      game.state.start('win');
    }
  }

  renderBonusItem();
//    game.input.onTap.addOnce(this.start, this);
  },
  createTimer: function() {
    this.timeLabel = this.game.add.text(this.game.world.centerX, 40, '00:00', {font: '4em Arial', fill: '#fff'});
    this.timeLabel.anchor.setTo(0.5,0);
    this.timeLabel.align = 'center';
  },

  start: function() {
    game.state.start('levelUp');
  }
};


var progressState = {
  create: function() {
    level++;
    console.log('LevelUp!!');
    game.stage.backgroundColor = 0x000000;
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
game.state.add('bonus', bonusState);
game.state.add('win', winState);
game.state.add('lose', loseState);

game.state.start('boot');
