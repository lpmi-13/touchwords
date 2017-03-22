
var width = screen.width;
var height = screen.height;

var portrait = checkOrientation(width, height)

function checkOrientation(width, height) {
  return height > width; 
}

  var heightMultiplier = portrait ? .7 : .75;
  var game = new Phaser.Game(width * .8, height * heightMultiplier, Phaser.CANVAS, 'gameDiv', { preload: preload, create: create, update: update});

function preload() {
}

var emitter;
var bonusEmitter;
var displaySpelling;
var wordToCorrect;
var promptText;
var inputRectangle;
var level = 0;
var scoreText;
var score = 0;
var progress = 0;
var timeLabel;
var livesPool;
var wordPool;
var scorePool;
var bonusScorePool;
var deletePool;
var deleteButton;
var clearLeftButton;
var heartPool;
var clickedArray = [];
var consonantArray = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'];
var vowelArray = ['a','e','i','o','u'];

function create() {
  game.levelData = JSON.parse(game.cache.getText('leveldata')); 
  var levelVars = game.levelData.levelVariables[level];

  var background = game.add.tileSprite(0, 0, levelVars.backgroundWidth, levelVars.backgroundHeight, levelVars.background);

  var resizeX = game.world.width/levelVars.backgroundWidth;
  var resizeY = game.world.height/levelVars.backgroundHeight;

  background.tileScale.x = resizeX;
  background.tileScale.y = resizeY;

  var scoreFontSize = portrait ? '2.8em Georgia' : '3.5em Georgia';

  scoreText = game.add.text(5, 5, 'Points: '+ score, {font: scoreFontSize, fill: '#0095DD'});

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
      var increaseScoreTextFont = portrait ? '3em Georgia' : '4.5em Georgia';
      var increaseScoreText = game.add.text(sprite.x, sprite.y, '+10', {font: increaseScoreTextFont, fill: '#0095DD'}, scorePool);
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

  var wordInfo = levelVars.verbs;

  var words = Object.keys(levelVars.verbs);
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

        var wordFontSize = portrait ? '3em Arial Black' : '4.5em Arial Black';

	var word = game.add.text(game.world.randomX, game.world.height, words[randomNumber], { font: wordFontSize, fill: "#c51b7d"}, wordPool);

	wordsArray.push(randomNumber);
        if (wordsArray.length > 10) {
          wordsArray.shift();
        }

	word.stroke = "d377ae";
	word.strokeThickness = 3;
	word.setShadow(2,2, "#333333", 2, true, false);
	word.data = {
		regular : wordInfo[words[randomNumber]].regular,
		answer : wordInfo[words[randomNumber]].correction
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
	  scoreText.setText('Points: ' + score);
	  progress += 1; 
	  if (progress == levelVars.progressTotal) {
	      levelUpTransition();
	  }
	  sprite.kill();
      } else {
	  flash();
	  loseLife();
      }
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

    var levelUpFontSize = portrait ? '2.5em Georgia' : '8em Georgia';

    levelUpText = game.add.text(game.world.centerX, -150, 'You passed the level!!!', {font: levelUpFontSize,fill:'#0095DD'});

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
    game.load.image('preloader', 'static/touchwords/assets/images/loading.png');

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;  

},

  create: function() {
    game.stage.backgroundColor = '#000000';
    game.state.start('load');
  }

};

var loadState = {
  preload: function() {

    game.load.image('logo','static/touchwords/assets/images/logo.png');
    game.load.text('leveldata', 'static/touchwords/js/levels.json');

    game.load.image('heart', 'static/touchwords/assets/images/Heart.png');
    game.load.image('button', 'static/touchwords/assets/images/roundedColoredButton.png');
    game.load.image('deleteButton', 'static/touchwords/assets/images/clear.png');
    game.load.image('clearLeftButton', 'static/touchwords/assets/images/left.png');
    game.load.bitmapFont('digitalFont', 'static/touchwords/assets/fonts/font.png', 'static/touchwords/assets/fonts/font.fnt');
    game.load.image('level1Background', 'static/touchwords/assets/images/voodoo_cactus_island_scaled.png');
    game.load.image('level2Background', 'static/touchwords/assets/images/fishbgexp_scaled.jpg');
    game.load.image('level3Background', 'static/touchwords/assets/images/cloudsinthedesert_scaled.png');
    game.load.image('diamond', 'static/touchwords/assets/images/diamond.png');
    var loadingBar = game.add.sprite(0, game.world.height - 50, 'preloader');
    var loadingBarResizeX = game.world.width/387;
    loadingBar.scale.setTo(loadingBarResizeX,1);
    var statusText = game.add.text(game.world.centerX, game.world.height - 130, 'Loading...', {fill: 'white'});
    statusText.anchor.setTo(0.5);
    game.load.setPreloadSprite(loadingBar);

  },
  loadUpdate: function() {
    var progressAmount = game.load.progress;
    if (progressAmount === 100) {
      this.loadComplete();
    };
  },
  loadComplete: function() {
      game.state.start('splashScreen');
  }
};

var splashScreenState = {
  preload: function() {
    preload();
  },
  create: function() {

    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.scale.refresh();


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

    var touchFontSize = portrait ? '1.6em Georgia' : '3.2em Georgia';

    var touchToStart = game.add.text(game.world.centerX, game.world.height - 35, 'touch the screen to start', {font: touchFontSize, fill: '#0095DD'});
    touchToStart.anchor.set(0.5);

    touchToStart.alpha = 1;
    var textTween = game.add.tween(touchToStart).to( { alpha: .25 }, 300, "Linear", true, 1, -1);
    textTween.yoyo(true, 300);

    game.input.onTap.addOnce(this.start, this);

  },
  start: function() {
    game.state.start('instructions');
  }
};


var instructionState = {
  preload: function() {
    preload();
  },
  create: function() {

    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
  
    game.scale.refresh();

    var instructionFontSize = portrait ? '1.75em Georgia' : '3.2em Georgia';

    var instructionsText = game.add.text(15,35, instructions, {font: instructionFontSize, fill: '#0095DD', wordWrap: true, wordWrapWidth:game.world.width*.85 });

    var continueFontSize = portrait ? '1.5em Georgia' : '3.2em Georgia';
    var continueOffsetY = portrait ? 25 : 50;

    var continueText = game.add.text(game.world.centerX, game.world.height - continueOffsetY, "touch the screen to continue...", {font: continueFontSize, fill: '#0095DD'});
    continueText.anchor.set(0.5);
    game.input.onTap.addOnce(this.start, this);  
  },

  start: function() {
    game.state.start('play');
  }

};

var playState = {
  create: function() {
    progress = 0;   
 create();
  },
  update: function() {
    update();
  }
};

var bonusState = {
  create: function() {
    game.stage.backgroundColor = '#2B4970';
    var bonusCount = 0;
    var minutes;
    var seconds;

    var gameWidth = game.world.width;
    var gameHeight = game.world.height;

    var bonusScoreTextFont = portrait ? '3em Georgia' : '4.5em Georgia';
    var bonusScoreText = game.add.text(5, 5, 'Points: ', {font: bonusScoreTextFont, fill: '#ffffff'});
    bonusScoreText.setText('Points: ' + score);

    game.levelData = JSON.parse(game.cache.getText('leveldata')); 
    var levelVars = game.levelData.levelVariables[level];
    this.startTime = new Date();
    this.totalTime = levelVars.bonusTime;
    this.timeElapsed = 0;

    this.createTimer();

    function updateTimer() {

    var currentTime = new Date();
    var timeDifference = this.startTime.getTime() - currentTime.getTime();

    this.timeElapsed = Math.abs(timeDifference / 1000);

    var timeRemaining = this.totalTime - this.timeElapsed;
    minutes = Math.floor(timeRemaining / 60);
    seconds = Math.floor(timeRemaining) - (60 * minutes);

    if (Math.floor(timeRemaining) == 0) {
      timeExpired();
    }

    var result = (minutes < 10) ? '0' + minutes : minutes;

    result += (seconds < 10) ? ':0' + seconds : ':' + seconds;

    timeLabel.text = result;
 }

    function startBonusLossFade() {
      game.camera.fade(0x000000, 1500, true);
      game.camera.onFadeComplete.add(bonusLossFadeComplete,this);
    }

    function bonusLossFadeComplete() {
      game.time.events.resume();
      game.state.start('levelUp');
    }

    function timeExpired() {
      timeLabel.destroy();
      var timeExpiredFont = portrait ? 32 : 64;
      var timeExpired = game.add.bitmapText(game.world.width - 5, 5, 'digitalFont', '00:00', timeExpiredFont);
      timeExpired.anchor.set(1, 0);
      timeExpired.fill = '#ffffff';
      buttonPool.callAll('kill');
      letterPool.callAll('kill');
      deletePool.callAll('kill');
      displaySpelling.setText('');
      wordToCorrect.setText('');
      promptText.setText('');

      inputRectangle.destroy();

      var timesUpFont = portrait ? '3em Arial' : '12em Arial';

      var lossText = game.add.text(this.game.world.centerX, this.game.world.centerY, 'TIME\'S UP', {font: timesUpFont , fill: '#ff0000'}); lossText.anchor.setTo(0.5);
      game.time.events.add(Phaser.Timer.SECOND * 3, startBonusLossFade, this );
      }
    var gameTimer = game.time.events.loop(100, updateTimer, this);

    var buttonPool = game.add.group();
    buttonPool.enableBody = true;
    var letterPool = game.add.group();
    var numberOfRowElements = 6;

    var elementFontSize = portrait ? '3.8em Arial' : '8.5em Arial';
    var elementGutterWidth = portrait ? .075 : .2;

    var style = {font: elementFontSize, fill: '#000000', align: 'center'};
    var screenGutterWidth = gameWidth * elementGutterWidth;
    var elementWidth = (gameWidth - (screenGutterWidth*2))/numberOfRowElements;

    var elementHeight = (game.world.height/6);
    var elementWidthMultiplier = portrait ? .8 : .85;
    var elementHeightMultiplier = portrait ? .65 : .85;

    var buttonScaleX = (elementWidth * elementWidthMultiplier)/53;
    var buttonScaleY = (elementHeight * elementHeightMultiplier)/40;

    function renderBonusItem() {
      var displayItem = clickedArray[bonusCount].text;
      var displayArray = displayItem.split('');
      var answer = clickedArray[bonusCount].answer;
      var wordItem = clickedArray[bonusCount].answer.split('');

      var uniqueArray = displayArray.filter(function(obj) {
        return wordItem.indexOf(obj) == -1;
      });

      var numberOfTotalLetters = numberOfRowElements * 2;

      var mixedArray = unique(wordItem.concat(uniqueArray));
      var numberOfExistingLetters = mixedArray.length;

      for (var x = 0; x < numberOfTotalLetters - numberOfExistingLetters; x++) {
	var vowelArrayNumber = game.rnd.integerInRange(0, vowelArray.length - 1);
	var consonantArrayNumber = game.rnd.integerInRange(0, consonantArray.length - 1);
	if (mixedArray.indexOf(vowelArray[vowelArrayNumber]) > -1) {
	  mixedArray.push(consonantArray[consonantArrayNumber]);
	} else {
	  mixedArray.push(vowelArray[vowelArrayNumber]);
	}
      }

      var shuffledWord = shuffle(mixedArray);

      var promptFontSize = portrait ? '3em Georgia' : '5em Georgia';
      var correctionFontSize = portrait ? '3.25em Georgia' : '6em Georgia';

      promptText = game.add.text(game.world.centerX, game.world.height * .2, 'correct this word: ', {font: promptFontSize, fill: '#dc9a41'});
    wordToCorrect = game.add.text(game.world.centerX, game.world.height * .3, displayItem, {font: correctionFontSize, fill :'#dc9a41'});

      promptText.anchor.set(0.5);
      promptText.stroke = 'AA9239';
      promptText.strokeThickness = 3;

      wordToCorrect.anchor.set(0.5);
      wordToCorrect.stroke = 'AA9239';
      wordToCorrect.strokeThickness = 3;

      for (var j = 0; j < shuffledWord.length; j++) {
        var row = Math.floor(j / numberOfRowElements);
        var column = Math.floor(j % numberOfRowElements);

        var xPos = (column * elementWidth) + screenGutterWidth;
        var yPos = (game.world.height * .9 ) - (row * elementHeight);
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

    deletePool = game.add.group();

    deleteButton = game.add.sprite(game.world.width - screenGutterWidth, game.world.height * .9, 'deleteButton');
    deleteButton.inputEnabled = true;
    deleteButton.anchor.set(0.5);
    deleteButton.scale.set(buttonScaleX,buttonScaleY);
    deleteButton.events.onInputDown.add(clearAllLetters,this);

    clearLeftButton = game.add.sprite(game.world.width - screenGutterWidth, (game.world.height * .9) - elementHeight, 'clearLeftButton');
    clearLeftButton.inputEnabled = true;
    clearLeftButton.anchor.set(0.5);
    clearLeftButton.scale.set(buttonScaleX, buttonScaleY);
    clearLeftButton.events.onInputDown.add(deleteLetter,this);

    deletePool.add(deleteButton);
    deletePool.add(clearLeftButton);

  var rectangleWidth = portrait ? game.world.width * .85 : game.world.width * .65;
  var rectangleHeight = game.world.height * .15;
  var bmd = game.add.bitmapData(rectangleWidth, rectangleHeight);

  bmd.ctx.beginPath();
  bmd.ctx.rect(0,0, rectangleWidth, rectangleHeight);
  bmd.ctx.fillStyle = '#ffffff';
  bmd.ctx.fill();
  inputRectangle = game.add.sprite(game.world.centerX, game.world.centerY, bmd);
  inputRectangle.anchor.setTo(0.5,0.5);

  var spellText = "";
  var spellTextFontSize = portrait ? '4em Georgia' : '8em Georgia';
  displaySpelling = game.add.text(game.world.centerX, game.world.centerY, spellText, {font: spellTextFontSize, fill: '#000000', align: 'center'});

    displaySpelling.anchor.set(0.5);

    function spellCheck(sprite,pointer) {
      if (spellText.length > 9 ) {
        return false;
      }
      spellText += sprite.data.letter;
      displaySpelling.setText(spellText);
      if (spellText == answer) {
        addBonusScore();
        score += 50;
 	bonusScoreText.setText('Points: ' + score);
        bonusCount++;
        if (level === 2 && bonusCount == clickedArray.length) {
          displaySpelling.setText('');
          wordToCorrect.setText('');
          promptText.setText('');
	  buttonPool.setAll('inputEnabled', false);
	  deleteButton.inputEnabled = false;
	  clearLeftButton.inputEnabled = false;
	  stopClockCountPointsFinal();
        } else if (bonusCount == clickedArray.length) {
          clickedArray = [];
          displaySpelling.setText('');
          wordToCorrect.setText('');
          promptText.setText('');
	  buttonPool.setAll('inputEnabled', false);
	  deleteButton.inputEnabled = false;
	  clearLeftButton.inputEnabled = false;
	  stopClockCountPoints();
        } else {
          clearScreen();
          renderBonusItem();
        }
      }
    }


    bonusScorePool = game.add.group();
    bonusScorePool.setAll('anchor.x', 0.5);
    bonusScorePool.setAll('anchor.y', 0.5);
    bonusScorePool.enableBody = true;
    bonusScorePool.physicsBodytype = Phaser.Physics.ARCADE;

    function addBonusScore() {
      var oldBonusText = bonusScorePool.getFirstExists();
      if (oldBonusText) {
        var increaseBonusScoreText = oldBonusText.reset(sprite.x,sprite.y);
      } else {
        var increaseBonusScoreTextFont = portrait ? '3.5em Georgia' : '5em Georgia';
        var increaseBonusScoreText = game.add.text(displaySpelling.x, displaySpelling.y, '+50', {font: increaseBonusScoreTextFont, fill: '#000000'}, bonusScorePool);
    }
      increaseBonusScoreText.anchor.setTo(0.5);
      increaseBonusScoreText.fontWeight = 'bold';
      increaseBonusScoreText.body.velocity.setTo(0,-200);
      return increaseBonusScoreText;
    }

    function stopClockCountPoints() {
        game.time.events.add(Phaser.Timer.SECOND * 3, startBonusWinFade, this );
        bonusEmitter = game.add.emitter(game.world.width - 5, 5, 2000);
        bonusEmitter.makeParticles('diamond');
        bonusEmitter.minRotation = 0;
        bonusEmitter.maxRotation = 0;
        bonusEmitter.gravity = 0;
        bonusEmitter.start(false, 2500, 10);
	var totalSeconds = (minutes * 60) + seconds;
	var totalPointsToAdd = totalSeconds * 10;
	score += totalPointsToAdd;
 	bonusScoreText.setText('Points: ' + score);
	destroyTimer();
        game.time.events.remove(gameTimer);
    }

    function stopClockCountPointsFinal() {
	game.time.events.add(Phaser.Timer.SECOND * 3, startFinalWinFade, this);
        var bonusEmitter = game.add.emitter(game.world.width - 5, 5, 2000);
        bonusEmitter.makeParticles('diamond');
        bonusEmitter.minRotation = 0;
        bonusEmitter.maxRotation = 0;
        bonusEmitter.gravity = 0;
        bonusEmitter.start(false, 1000, 15);
	var totalSeconds = (minutes * 60) + seconds;
	var totalPointsToAdd = totalSeconds + 10;
	score += totalPointsToAdd;
	bonusScoreText.setText('Points: ' + score);
	destroyTimer();
        game.time.events.remove(gameTimer);
    }

    function deleteLetter(sprite,pointer){
      spellText = spellText.substring(0, spellText.length - 1);
      displaySpelling.setText(spellText);
    }

    function clearAllLetters(sprite,pointer) {
      spellText = '';
      displaySpelling.setText(spellText);
    }

    function destroyTimer() {
      timeLabel.destroy();
    }

    function clearScreen() {
      buttonPool.callAll('kill');
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
  },
  createTimer: function() {
    var timeLabelFont = portrait ? 32 : 64;
    timeLabel = game.add.bitmapText(game.world.width - 5, 5, 'digitalFont', '00:00', timeLabelFont);
    timeLabel.anchor.setTo(1,0);
    timeLabel.align = 'center';
  },

  start: function() {
    game.state.start('levelUp');
  }
};


var progressState = {
  create: function() {
    level++;
    game.stage.backgroundColor = 0x000000;

    var continueTextFontSize = portrait ? '2.5em Georgia' : '4em Georgia';

    var continueText = game.add.text(game.world.centerX, game.world.centerY, "Touch the screen to continue to the next level!!!", {font: continueTextFontSize,fill: '#0095DD', wordWrap: true, wordWrapWidth:width*.65 });
    continueText.anchor.set(0.5);
    game.input.onTap.addOnce(this.start, this);
  },
  start: function() {
    game.state.start('play');
  }
};

var winState = {
  create: function() {
    game.stage.backgroundColor = 0x000000;

    var winTextFont = portrait ? '2.5em Georgia' : '4em Georgia';
    var winText = game.add.text(game.world.centerX,game.world.centerY, "THAT'S ALL, YOU WIN!!!", {font: winTextFont, fill:'#0095DD', wordWrap: true, wordWrapWidth: width*.65});
    winText.anchor.set(0.5);

    var finalScoreTextFont = portrait ? '2.5em Georgia' : '3.5em Georgia';
    var finalScoreText = game.add.text(game.world.centerX, game.world.centerY + (game.world.height * .25), 'Final Score: ' + score, {font: finalScoreTextFont, fill:'#0095DD'});
    finalScoreText.anchor.set(0.5);

    var continueTextFont = portrait ? '1.5em Georgia' : '3em Georgia';
    var continueText = game.add.text(game.world.centerX, game.world.height -50, "Touch the screen to play again...", {font: continueTextFont, fill: '#0095DD',wordWrap: true, wordWrapWidth:width*.65 });
    continueText.anchor.set(0.5);
    game.input.onTap.addOnce(this.start, this);
  },
  start: function() {
    level = 0;
    score = 0;
    game.state.start('play');
  }
};


var loseState = {
  create: function() {
    game.stage.backgroundColor = 0x000000;

    var instructionsTextFont = portrait ? '2.5em Georgia' : '4em Georgia';
    var instructionsText = game.add.text(game.world.centerX, game.world.centerY, "GAME OVER", {font: instructionsTextFont, fill:'#0095DD'});
    instructionsText.anchor.set(0.5);

    var continueTextFont = portrait ? '1.5em Georgia' : '3em Georgia';
    var continueText = game.add.text(game.world.centerX, game.world.height - 50, "Touch the screen to play again...", {font: continueTextFont, fill:'#0095DD', wordWrap: true, wordWrapWidth:width*.65});
    continueText.anchor.set(0.5);  
      game.input.onTap.addOnce(this.start, this);
  },
  start: function() {
    level = 0;
    score = 0;
    game.state.start('play');
  }
};

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('splashScreen', splashScreenState);
game.state.add('instructions', instructionState);
game.state.add('play', playState);
game.state.add('levelUp', progressState);
game.state.add('bonus', bonusState);
game.state.add('win', winState);
game.state.add('lose', loseState);

game.state.start('boot');
