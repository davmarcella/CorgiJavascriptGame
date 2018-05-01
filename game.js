corgiGame.Game = function(game) {
    this.background;
    this.corgiPup; //player
    this.cursors; //controls
    this.distanceLeft; //space left to travel
    this.totalSpaceLeft; //total amount of space left to travel
    this.totalSpace;
    this.enemySpeed; //speed at which the enemies are currently traveling
    this.speed; //speed at which the background image moves
    this.lasers; //group of lasers
    this.lastShot; //when the last laser was fired
    this.firingRate; //the rate at which lasers are fired
    this.enemyPups; //group of enemies
    this.enemyPupArr; //array to store and reference enemies individually
    this.totalEnemies;
    this.gameover;
    this.burst; //green explosion
    this.corgiExplosion; //orange explosion
    this.score; //text that displays points/score
    this.points;
    this.gameoverText;
    this.lifepack; //lifepack group
    this.minLifepackRate; //the rate at which superpacks are released
    this.lastLifepack; //when the last lifepack was released
    this.startTime;
    this.lives; //number of lives
    this.livesText; //text for displaying number of lives
    this.winText; //text that displays 'Congrats you win!'
    this.laser1;
    this.laser2;
    this.explosion; //sounds
};

corgiGame.Game.prototype = {

    create: function() {
        this.gameover = false;
        this.totalSpace = 7000; //7000 is default
        this.totalSpaceLeft = this.totalSpace;
        this.enemySpeed = -70;//-70 is default
        this.speed = 2;
        this.lastShot = this.time.now;
        this.firingRate = 250; //250 is default
        this.minLifepackRate = 50000; //50k is default
        this.lastLifepack = this.time.now;
        this.totalEnemies = 3;
        this.points = 0;
        this.startTime = this.time.now;
        this.enemyPupArr = [];
        this.lives = scores.currentPlayer.lives;

        //setup world
        this.buildWorld();
        //setup lasers
        this.buildLasers();
        //setup enemies
        this.buildEnemies();
        //setup explosions
        this.buildEmitter();
    },

    //build functions
    buildWorld: function() {
        //create map/world
        this.background = this.game.add.tileSprite(0, 0, 1280, 620, 'background');
        this.distanceLeft = this.add.bitmapText(10, 10, 'eightbitwonder', 'percent completed:  ' + (100-((this.totalSpaceLeft/this.totalSpace)*100)).toFixed(), 20);
        this.score = this.add.bitmapText(10, 50, 'eightbitwonder', 'score: ' + this.points, 20);
        this.livesText = this.add.bitmapText(10, 90, 'eightbitwonder', 'lives: ' + this.lives, 20);
        //setup player
        this.corgiPup = this.add.sprite(150, 300, 'spaceCorgi');
        this.corgiPup.anchor.setTo(0.5, 0.5);
        this.corgiPup.scale.setTo(0.25, 0.25);
        this.corgiPup.enableBody = true;
        //create physics and controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.arcade.enable(this.corgiPup);
        this.corgiPup.body.collideWorldBounds = true;
        //setup lifepack
        this.lifepack = this.add.sprite(this.world.width+100, this.rnd.integerInRange(0,this.world.height-100), 'lifepack');
        this.lifepack.anchor.setTo(0.5, 0.5);
        this.lifepack.scale.setTo(0.1, 0.1);
        this.lifepack.enableBody = true;
        this.physics.enable(this.lifepack, Phaser.Physics.ARCADE);
        //setup sounds
        this.laser1 = this.add.audio('laser1');
        this.laser2 = this.add.audio('laser2');
        this.explosion = this.add.audio('explosion');

    },

    buildEmitter:function() {
        this.burst = this.add.emitter(0, 0, 80);
        this.burst.minParticleScale = 0.3;
        this.burst.maxParticleScale = 1.2;
        this.burst.minParticleSpeed.setTo(-60, 30);
        this.burst.maxParticleSpeed.setTo(60, -30);
        this.burst.makeParticles('explosion');
        this.corgiExplosion = this.add.emitter(0, 0, 80);
        this.corgiExplosion.minParticleScale = 0.3;
        this.corgiExplosion.maxParticleScale = 1.2;
        this.corgiExplosion.minParticleSpeed.setTo(-60, 30);
        this.corgiExplosion.maxParticleSpeed.setTo(60, -30);
        this.corgiExplosion.makeParticles('corgiExplosion');
    },

    buildLasers: function(){
        this.lasers = this.add.group();
        this.lasers.enableBody = true;
        this.lasers.physicsBodyType = Phaser.Physics.ARCADE;
        this.lasers.createMultiple(10, 'laser');
        this.lasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetLayer);
        this.lasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        this.lasers.setAll('checkWorldBounds', true);
    },

    buildEnemies: function() {
        this.enemyPups = this.add.group();

        for(var i=0; i <this.totalEnemies; i++){
            var pup = this.enemyPups.create(this.world.width, this.rnd.integerInRange(0,this.world.height-100), 'enemyPup', 'enemyPup0000');
            pup.scale.setTo(0.15, 0.15);
            this.physics.enable(pup, Phaser.Physics.ARCADE);
            pup.enableBody = true;
            pup.body.velocity.x = this.enemySpeed;
            pup.checkWorldBounds = true;
            //TODO: limit world bounds without collideWorldBounds;
            pup.events.onOutOfBounds.add(this.resetEnemy, this);
            this.enemyPupArr.push(pup);
        }
    },

    //action functions
    fireLaser: function() {
        var laser = this.lasers.getFirstExists(false);
        if(laser) {
            laser.reset(this.corgiPup.x+45, this.corgiPup.y-15);
            laser.body.velocity.x = 500;
            this.laser1.play();
        }
    },

    explode: function(ob){
        this.burst.y = ob.y;
        this.burst.x = ob.x;
        this.burst.start(true, 4000, null, 20);
        this.explosion.play();
    },

    corgiExplode: function(corgi){
        this.corgiExplosion.y = corgi.y;
        this.corgiExplosion.x = corgi.x;
        this.corgiExplosion.start(true, 4000, null, 20);
        this.explosion.play();
    },

    playerCollision: function(corgi, shep) {
        if(corgi.exists){
            shep.kill();
            corgi.kill();
            this.explode(shep);
            this.corgiExplode(corgi);
            if(this.lives > 0){
                this.lives -= 1;
                // respawn the corgi
                this.livesText.setText('lives: ' + this.lives);
                this.corgiPup = this.add.sprite(150, 300, 'spaceCorgi');
                this.corgiPup.anchor.setTo(0.5, 0.5);
                this.corgiPup.scale.setTo(0.25, 0.25);
                this.corgiPup.enableBody = true;
                this.physics.arcade.enable(this.corgiPup);
                this.corgiPup.body.collideWorldBounds = true;
                this.respawnEnemy(shep);

            }
            else{
                this.gameover = true;
                this.gameoverText = this.add.bitmapText(window.innerWidth/3.5, window.innerHeight/3.2, 'eightbitwonder', ' Game Over', 50);
                this.gameOver();
            }
        }
    },

    laserCollision: function(laser, shep) {
        if(shep.exists){
            laser.kill();
            shep.kill();
            this.explode(shep);
            this.points += 5;
            this.score.setText('score: ' + this.points);
            this.respawnEnemy(shep);
        }
    },

    superpackCollision: function(barrnana, corgi){
        if(barrnana.exists){
            barrnana.reset(this.world.width+100, this.rnd.integerInRange(0,this.world.height-100));
            barrnana.body.velocity.x = 0;
            this.lives += 1;
            scores.currentPlayer.lives += 1;
            this.livesText.setText('lives: ' + this.lives);
        }
    },

    sendSuperpack: function() {
        if(this.time.now - this.lastLifepack >= this.minLifepackRate && this.lifepack.x > this.world.width){
            this.lifepack.body.velocity.x = this.enemySpeed;
            this.lastLifepack = this.time.now;
        }
        else if (this.lifepack.x < 0){
            this.lifepack.reset(this.world.width+100, this.rnd.integerInRange(0,this.world.height-100));
        }
    },

    //reset functions
    resetLayer: function(laser) {
        laser.kill();
    },

    resetEnemy: function(pup) {
        if(pup.x < 0){
            if(this.gameover == false) {
                this.respawnEnemy(pup);
            }
        }
    },

    respawnEnemy: function(pup) {
        pup.reset(this.world.width, this.rnd.integerInRange(0,this.world.height-100));
        this.enemySpeed -= 5;
        pup.body.velocity.x = this.enemySpeed;
    },


    //update functions
    updateBackground: function() {
        //background speed
        if(this.totalSpaceLeft > 0) {
            this.totalSpaceLeft--;
            this.background.tilePosition.x -= (this.speed);
        }
        else {
            this.gameover = true;
            this.winText = this.add.bitmapText(window.innerWidth/5.5, window.innerHeight/3.2, 'eightbitwonder', 'Congrats! You Won!\nGet Ready For \nThe Next Level...', 50);
            // wait a few seconds to display text before continuing
            scores['currentPlayer'].score = this.points;
            var timer = this.time.create(false);
            timer.loop(4000, this.nextLevel, this);
            timer.start();

        }
        this.distanceLeft.setText('percent completed:  ' + (100-((this.totalSpaceLeft/this.totalSpace)*100)).toFixed());


    },

    updatePosition: function(){
        if (this.cursors.down.isDown)
            this.corgiPup.body.y += 20;

        else if (this.cursors.up.isDown)
            this.corgiPup.body.y += -20;

        if (this.cursors.right.isDown){
            //sets the firing rate
            if(this.time.now - this.lastShot >= this.firingRate) {
                this.lastShot = this.time.now;
                this.fireLaser();
            }
        }
    },

    updateEnemyPosition: function() {
        for(var i = 0; i<this.totalEnemies; i++){
            var pup = this.enemyPupArr[i];
            var velocityChange = this.rnd.integerInRange(1, 50);
            //limits the number of times it changes the y velocity
            if(velocityChange == 1){
                pup.body.velocity.y = this.rnd.integerInRange(-40, 40);
            }
            if(pup.body.y > 600 || pup.body.y < -100){
                this.respawnEnemy(pup);
            }
        }
    },

    update: function() {
        if(this.gameover == false) {
            this.physics.arcade.overlap(this.enemyPups, this.corgiPup, this.playerCollision, null, this);
            this.physics.arcade.overlap(this.lasers, this.enemyPups, this.laserCollision, null, this);
            this.physics.arcade.overlap(this.lifepack, this.corgiPup, this.superpackCollision, null, this);
            this.updatePosition();
            this.updateBackground();
            this.updateEnemyPosition();
            this.sendSuperpack();
        }
    },


    nextLevel: function() {
        this.state.start('Game2');
    },

    gameOver: function() {
        var prompt = "Your Score: " + this.points + "\n\nHigh Scores: \n\n" +
            "1)\tName: " + scores['top1'].name.substr(0,5) + "\t\tLevel: " + scores['top1'].level + "\t\tScore: " + scores['top1'].score +
            "\n2)\tName: " + scores['top2'].name.substr(0,5) + "\t\tLevel: " + scores['top2'].level + "\t\tScore: " + scores['top2'].score +
            "\n3)\tName: " + scores['top3'].name.substr(0,5) + "\t\tLevel: " + scores['top3'].level + "\t\tScore: " + scores['top3'].score +
            "\n4)\tName: " + scores['top4'].name.substr(0,5) + "\t\tLevel: " + scores['top4'].level + "\t\tScore: " + scores['top4'].score +
            "\n5)\tName: " + scores['top5'].name.substr(0,5) + "\t\tLevel: " + scores['top5'].level + "\t\tScore: " + scores['top5'].score;

        var player = window.prompt(prompt + "\n\nPlease enter name (5 chars only):", "_ _ _ _ _");
        if(player != null && player != ''){
            if(this.points > scores['top1'].score){
                scores['top5'] = JSON.parse(JSON.stringify(scores['top4']));
                scores['top4'] = JSON.parse(JSON.stringify(scores['top3']));
                scores['top3'] = JSON.parse(JSON.stringify(scores['top2']));
                scores['top2'] = JSON.parse(JSON.stringify(scores['top1']));
                scores['top1'].name = player;
                scores['top1'].score = this.points;
                scores['top1'].level = 1;
            } else if(this.points > scores['top2'].score){
                scores['top5'] = JSON.parse(JSON.stringify(scores['top4']));
                scores['top4'] = JSON.parse(JSON.stringify(scores['top3']));
                scores['top3'] = JSON.parse(JSON.stringify(scores['top2']));
                scores['top2'].name = player;
                scores['top2'].score = this.points;
                scores['top2'].level = 1;
            } else if(this.points > scores['top3'].score){
                scores['top5'] = JSON.parse(JSON.stringify(scores['top4']));
                scores['top4'] = JSON.parse(JSON.stringify(scores['top3']));
                scores['top3'].name = player;
                scores['top3'].score = this.points;
                scores['top3'].level = 1;
            } else if(this.points > scores['top4'].score){
                scores['top5'] = JSON.parse(JSON.stringify(scores['top4']));
                scores['top4'].name = player;
                scores['top4'].score = this.points;
                scores['top4'].level = 1;
            } else if(this.points > scores['top5'].score){
                scores['top5'].name = player;
                scores['top5'].score = this.points;
                scores['top5'].level = 1;

            }
            scores['currentPlayer'].score = 0;
            scores['currentPlayer'].level = 0;

            //save
            window.localStorage.setItem('scores', JSON.stringify(scores));
            console.log(scores);
        }
    },

};