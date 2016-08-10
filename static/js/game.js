var width = screen.width;
var height = screen.height;

var game = new Phaser.Game(width*.8, height*.8, Phaser.SHOW_ALL, 'gameDiv', { preload: preload, create: create, update: update});



function preload() {

  game.load.image('background', 'static/assets/images/stones.png');

}

var scoreText;
var score = 0;
var livesText;
var lives = 3;
var wordPool;

function create() {
  game.stage.backgroundColor = 0xbdbdbd;

  game.add.tileSprite(0, 0, width*.8, height*.8, 'background');
  scoreText = game.add.text(5,5, 'Points: 0', {font: '18px Arial', fill: '#0095DD'});
  livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, {font: '18px Arial', fill: '#0095DD'});
  livesText.anchor.set(1,0);

  game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;


  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;

  game.physics.startSystem(Phaser.Physics.ARCADE);


  wordPool = game.add.group();
  wordPool.enableBody = true;
  wordPool.physicsBodytype = Phaser.Physics.ARCADE;

  wordPool.setAll('anchor.x', 0.5);
  wordPool.setAll('anchor.y', 0.5);

  wordPool.setAll('outOfBoundsKill', true);
  wordPool.setAll('checkWorldbounds', true);

  var verbs = {
	'walked':{regular:true},
	'talked':{regular:true},
	'asked':{regular:true},
	'touched':{regular:true},
	'sayed':{regular:false},
	'getted':{regular:false},
	'goed':{regular:false},
	'wanted':{regular:true},
	'believed':{regular:true},
	'eated':{regular:false},
	'basked':{regular:true},
	'discussed':{regular:true},
	'knowed':{regular:false},
	'thinked':{regular:false},
	'comed':{regular:false},
	'started':{regular:true},
	'chatted':{regular:true},
	'brewed':{regular:true},
	'seed':{regular:false},
	'taked':{regular:false},
	'chewed':{regular:true}
  }


  var words = Object.keys(verbs);
  var length = words.length;
  function createWord() {
	var randomNumber = game.rnd.integerInRange(0,length-1);
	var word = game.add.text(game.world.randomX, height, words[randomNumber], { font: "22px Arial Black", fill: "#c51b7d"}, wordPool);
	word.stroke = "d377ae";
	word.strokeThickness = 6;
	word.setShadow(2,2, "#333333", 2, true, false);
	word.data = {
		regular : verbs[words[randomNumber]].regular
	}
	word.inputEnabled = true;
	word.events.onInputDown.add(test, this);

	word.body.velocity.setTo(game.rnd.integerInRange(-300,300),game.rnd.integerInRange(-300,-100));
	word.body.collideWorldBounds = true;
	word.body.bounce.set(1);
	return word;
  }


  game.physics.arcade.checkCollision.down = false;

  game.time.events.loop(2000, createWord, this);


  function test(sprite, pointer) {
      if (!sprite.data.regular) {
  	  score += 10;
	  scoreText.setText('Points: ' + score);	  
	  sprite.kill();
      } else {
	  loseLife();
      }
  }

  function loseLife() {
      lives--;
      livesText.setText('Lives: ' + lives);
      if (!lives) {
        game.state.start('lose');
      }
  }

  game.scale.refresh();
 // game.input.onUp.add(function() {
 //   console.log("up");
 // });

  //game.input.onTap.add(function() {
   // console.log("tap");
 // });
}

function update() {


}

var bootState = {
  create: function() {
    console.log("Bootstate");
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.state.start('load');
  }
};

var loadState = {
  preload: function() {
    preload();
  },
  create: function() {
    console.log('Loadstate');

    var instructionsText = game.add.text(30,50, instructions, {font: '25px Arial White', fill: '#0095DD', wordWrap: true, wordWrapWidth: 500});
    var continueText = game.add.text(30, game.world.height - 50, "Press any key to continue...", {font: "25px Arial White", fill: '#0095DD'});

//  var wkey = game.input.keyboard.addKey(Phaser.Keyboard.W);
//  wkey.onDown.addOnce(this.start, this);
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


var loseState = {
  create: function() {
    console.log('loseState');
    var instructionsText = game.add.text(30, 50, "GAME OVER", {font:'28px Arial White',fill:'#0095DD'});
    var continueText = game.add.text(30, game.world.height - 50, "Press any key to continue...", {font:'22px Arial White',fill:'#0095DD'});  

//    var wkey = game.input.keyboard.addKey(Phaser.Keyboard.W);
//    wkey.onDown.addOnce(this.start, this);
      game.input.onTap.addOnce(this.start, this);
  },
  start: function() {
    game.state.start('play');
  }
};

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('play', playState);
game.state.add('lose', loseState);

game.state.start('boot');
