//notes
//1. superpacks in game.js are now referred to as lifepacks
//2. superpacks in this (game2.js) activate superlasers

corgiGame.Game2 = function(game) {
    this.background;
    this.corgiPup; //player
    this.cursors; //controls
    this.distanceLeft; //space left to travel
    this.totalSpaceLeft; //total amount of space left to travel
    this.totalSpace;
    this.enemySpeed; //speed at which the enemies are currently traveling
    this.speed; //speed at which the background image moves
    this.lasers; //group of lasers
    this.enemyLasers; //enemy's lasers
    this.superLasersA; //group of superlasers if you get the superpack
    this.superLasersB; // superlasers a,b,c are the three different lasers (directions) that will be fired
    this.superLasersC;
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
    this.lifepack; //lifepack sprite
    this.minLifepackRate; //the min rate at which lifepacks are released
    this.maxLifepackRate; //the max rate at which lifepacks are released
    this.lastLifepack; //when the last lifepack was released
    this.superpack; //superpack sprite
    this.lastSuperpack; //when the last superpack was released
    this.superLasers; //boolean which turns true during superpack collision and activates superlasers
    this.superLaserTime; //time superlasers stay active
    this.superLaserActivationTime; //last time super lasers activated
    this.startTime;
    this.lives; //number of lives
    this.livesText; //text for displaying number of lives
    this.winText; //text that displays 'Congrats you win!'
    this.laser1;
    this.laser2;
    this.explosion; //sounds
};

corgiGame.Game2.prototype = {

    create: function() {
        this.gameover = false;
        this.totalSpace = 9000; //9000 is default
        this.totalSpaceLeft = this.totalSpace;
        this.enemySpeed = -70;
        this.speed = 2;
        this.lastShot = this.time.now;
        this.firingRate = 250; //250 is default
        this.minLifepackRate = 20000; //20k
        this.maxLifepackRate = 65000; //40k-50k
        this.lastLifepack = this.time.now;
        this.lastSuperpack = this.lastLifepack + 5000;
        this.totalEnemies = 4;
        this.points = scores['currentPlayer'].score;
        this.startTime = this.time.now;
        this.enemyPupArr = [];
        this.lives = 1;
        this.superLasers = false;
        this.superLaserTime = 10000;
        this.superLaserActivationTime = this.time.now;

        //setup world
        this.buildWorld();
        //setup lasers
        this.buildLasers();
        //setup enemies
        this.buildEnemies();
        //setup enemy lasers
        this.buildEnemyLasers();
        //setup super lasers
        this.buildSuperLasers();
        //setup explosions
        this.buildEmitter();
    },

    //build functions
    buildWorld: function() {
        //create map/world
        this.background = this.game.add.tileSprite(0, 0, 1280, 620, 'background2');
        this.distanceLeft = this.add.bitmapText(10, 10, 'eightbitwonder', 'percent completed:  ' + (100-((this.totalSpaceLeft/this.totalSpace)*100)).toFixed(), 20);
        this.score = this.add.bitmapText(10, 50, 'eightbitwonder', 'score: ' + this.points, 20);
        this.livesText = this.add.bitmapText(10, 90, 'eightbitwonder', 'lives: ' + this.lives, 20);
        //setup player
        this.corgiPup = this.add.sprite(150, 300, 'corgiPup');
        this.corgiPup.anchor.setTo(0.5, 0.5);
        this.corgiPup.scale.setTo(0.25, 0.25);
        this.corgiPup.enableBody = true;
        //create physics and controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.arcade.enable(this.corgiPup);
        this.corgiPup.body.collideWorldBounds = true;
        //setup lifepack
        this.lifepack = this.add.sprite(this.world.width+100, this.rnd.integerInRange(0, this.world.height-100), 'lifepack');
        this.lifepack.anchor.setTo(0.5, 0.5);
        this.lifepack.scale.setTo(0.1, 0.1);
        this.lifepack.enableBody = true;
        this.physics.enable(this.lifepack, Phaser.Physics.ARCADE);
        //setup superpack
        this.superpack = this.add.sprite(this.world.width+100, this.rnd.integerInRange(0, this.world.height-100), 'superpack');
        this.superpack.anchor.setTo(0.5, 0.5);
        this.superpack.scale.setTo(0.2, 0.2);
        this.superpack.enableBody = true;
        this.physics.enable(this.superpack, Phaser.Physics.ARCADE);
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
        this.burst.makeParticles('explosion2');
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
            var pup = this.enemyPups.create(this.world.width, this.rnd.integerInRange(0,this.world.height-100), 'enemyPup2', 'enemyPup2000');
            pup.scale.setTo(0.1, 0.1);
            this.physics.enable(pup, Phaser.Physics.ARCADE);
            pup.enableBody = true;
            pup.body.velocity.x = this.enemySpeed;
            pup.checkWorldBounds = true;
            //TODO: limit world bounds without collideWorldBounds;
            pup.events.onOutOfBounds.add(this.resetEnemy, this);
            this.enemyPupArr.push(pup);
        }
    },

    buildEnemyLasers: function() {
        this.enemyLasers = this.add.group();
        this.enemyLasers.enableBody = true;
        this.enemyLasers.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyLasers.createMultiple(30, 'laser2');
        this.enemyLasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetLayer);
        this.enemyLasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        this.enemyLasers.setAll('checkWorldBounds', true);
    },

    buildSuperLasers: function(){
        this.superLasersA = this.add.group();
        this.superLasersA.enableBody = true;
        this.superLasersA.physicsBodyType = Phaser.Physics.ARCADE;
        this.superLasersA.createMultiple(10, 'laser3a');
        this.superLasersA.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetLayer);
        this.superLasersA.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        this.superLasersA.setAll('checkWorldBounds', true);

        this.superLasersB = this.add.group();
        this.superLasersB.enableBody = true;
        this.superLasersB.physicsBodyType = Phaser.Physics.ARCADE;
        this.superLasersB.createMultiple(10, 'laser3a');
        this.superLasersB.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetLayer);
        this.superLasersB.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        this.superLasersB.setAll('checkWorldBounds', true);

        this.superLasersC = this.add.group();
        this.superLasersC.enableBody = true;
        this.superLasersC.physicsBodyType = Phaser.Physics.ARCADE;
        this.superLasersC.createMultiple(10, 'laser3a');
        this.superLasersC.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetLayer);
        this.superLasersC.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        this.superLasersC.setAll('checkWorldBounds', true);
    },

    //action functions
    fireLaser: function() {
        this.laser1.play();
        if(this.superLasers){
            this.fireSuperLaser();
        }
        else{
            var laser = this.lasers.getFirstExists(false);
            if(laser) {
                laser.reset(this.corgiPup.x+45, this.corgiPup.y-15);
                laser.body.velocity.x = 500;
            }
        }
    },

    fireSuperLaser: function(){
        var laser = this.superLasersA.getFirstExists(false);
        var laser2 = this.superLasersB.getFirstExists(false);
        var laser3 = this.superLasersC.getFirstExists(false);
        if(laser && laser2 && laser3) {
            laser.reset(this.corgiPup.x+45, this.corgiPup.y-15);
            laser2.reset(this.corgiPup.x+45, this.corgiPup.y-15);
            laser3.reset(this.corgiPup.x+45, this.corgiPup.y-15);
            laser.body.velocity.x = 500;
            laser2.body.velocity.x = 500;
            laser2.body.velocity.y = 50;
            laser3.body.velocity.x = 500;
            laser3.body.velocity.y = -50;
        }
    },

    fireEnemyLaser: function(enemy) {
        var laser = this.enemyLasers.getFirstExists(false);
        if(laser) {
            laser.reset(enemy.x-45, enemy.y);
            laser.body.velocity.x = -500;
            this.laser2.play();
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
            this.updateLives(); //ends game if out of lives
            this.respawnEnemy(shep);

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

    enemyLaserCollision: function(laser, corgi){
        if(corgi.exists){
            laser.kill();
            corgi.kill();
            this.corgiExplode(corgi);
            this.updateLives();
        }
    },

    lifepackCollision: function(barrnana, corgi){
        if(barrnana.exists){
            barrnana.reset(this.world.width+100, this.rnd.integerInRange(0,this.world.height-100));
            barrnana.body.velocity.x = 0;
            this.lives += 1;
            this.livesText.setText('lives: ' + this.lives);
        }
    },

    superpackCollision: function(aliapple, corgi) {
        if(aliapple.exists){
            aliapple.reset(this.world.width+100, this.rnd.integerInRange(0,this.world.height-100));
            aliapple.body.velocity.x = 0;
            this.superLasers = true;
            this.superLaserActivationTime = this.time.now;
        }
    },

    sendLifepack: function() {
        //sends it at a random time between min and max
        if(this.time.now - this.lastLifepack >= this.rnd.integerInRange(this.minLifepackRate, this.maxLifepackRate) && this.lifepack.x > this.world.width){
            this.lifepack.body.velocity.x = this.enemySpeed;
            this.lastLifepack = this.time.now;
        }
        else if (this.lifepack.x < 0){
            this.lifepack.reset(this.world.width+100, this.rnd.integerInRange(0,this.world.height-100));
        }
    },

    sendSuperpack: function() {
        //sends it at a random time between min and max
        if(this.time.now - this.lastSuperpack >= this.rnd.integerInRange(this.minLifepackRate, this.maxLifepackRate) && this.superpack.x > this.world.width){
            this.superpack.body.velocity.x = this.enemySpeed;
            this.lastSuperpack = this.time.now;
        }
        else if (this.superpack.x < 0){
            this.superpack.reset(this.world.width+100), this.rnd.integerInRange(0, this.world.height-100);
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
        this.enemySpeed -= 2.5;
        pup.body.velocity.x = this.enemySpeed;
    },


    //update functions
    updateLives: function() {
        if(this.lives > 0){
            this.lives -= 1;
            // respawn the corgi
            this.livesText.setText('lives: ' + this.lives);
            this.corgiPup = this.add.sprite(150, 300, 'corgiPup');
            this.corgiPup.anchor.setTo(0.5, 0.5);
            this.corgiPup.scale.setTo(0.25, 0.25);
            this.corgiPup.enableBody = true;
            this.physics.arcade.enable(this.corgiPup);
            this.corgiPup.body.collideWorldBounds = true;

        }
        else{
            this.gameover = true;
            this.gameoverText = this.add.bitmapText(window.innerWidth/3.5, window.innerHeight/3.2, 'eightbitwonder', 'Game Over', 50);
            this.gameOver();

        }
    },

    updateBackground: function() {
        //background speed
        if(this.totalSpaceLeft > 0) {
            this.totalSpaceLeft--;
            this.background.tilePosition.x -= (this.speed);
        }
        else {
            this.gameover = true;
            this.winText = this.add.bitmapText(window.innerWidth/5.5, window.innerHeight/3.2, 'eightbitwonder', 'Congrats! You Won!\nGet Ready For \nThe Next Level', 50);
            // wait a few seconds to display text before continuing
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

    updateSuperLasers: function() {
        if((this.time.now - this.superLaserActivationTime) >= this.superLaserTime){
            this.superLasers = false;
        }
    },

    updateEnemy: function() {
    //handles position and firing
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

            var shoot = this.rnd.integerInRange(1, 500);
            //limits the amount of shots the enemies can shoot 1 in 300 chance
            if(shoot == 1){
                this.fireEnemyLaser(pup);
            }
        }

    },

    update: function() {
        if(this.gameover == false) {
            this.physics.arcade.overlap(this.enemyPups, this.corgiPup, this.playerCollision, null, this);
            this.physics.arcade.overlap(this.lasers, this.enemyPups, this.laserCollision, null, this);
            this.physics.arcade.overlap(this.superLasersA, this.enemyPups, this.laserCollision, null, this);
            this.physics.arcade.overlap(this.superLasersB, this.enemyPups, this.laserCollision, null, this);
            this.physics.arcade.overlap(this.superLasersC, this.enemyPups, this.laserCollision, null, this);
            this.physics.arcade.overlap(this.lifepack, this.corgiPup, this.lifepackCollision, null, this);
            this.physics.arcade.overlap(this.superpack, this.corgiPup, this.superpackCollision, null, this);
            this.physics.arcade.overlap(this.enemyLasers, this.corgiPup, this.enemyLaserCollision, null, this);
            this.updatePosition();
            this.updateBackground();
            this.updateEnemy();
            this.updateSuperLasers();
            this.sendLifepack();
            this.sendSuperpack();
        }
    },


    //extra functions
    nextLevel: function() {
        this.state.start('Game3');
    },

    gameOver: function() {
        var prompt = "Your Score: " + this.points + "\n\nHigh Scores: \n\n" +
            "1)\tName: " + scores['top1'].name.substr(0,4) + "\t\tLevel: " + scores['top1'].level + "\t\tScore: " + scores['top1'].score +
            "\n2)\tName: " + scores['top2'].name.substr(0,4) + "\t\tLevel: " + scores['top2'].level + "\t\tScore: " + scores['top2'].score +
            "\n3)\tName: " + scores['top3'].name.substr(0,4) + "\t\tLevel: " + scores['top3'].level + "\t\tScore: " + scores['top3'].score +
            "\n4)\tName: " + scores['top4'].name.substr(0,4) + "\t\tLevel: " + scores['top4'].level + "\t\tScore: " + scores['top4'].score +
            "\n5)\tName: " + scores['top5'].name.substr(0,4) + "\t\tLevel: " + scores['top5'].level + "\t\tScore: " + scores['top5'].score;

        var player = window.prompt(prompt + "\n\nPlease enter name (5 chars only):", "_ _ _ _ _");
        if(player != null && player != ''){
            if(this.points > scores['top1'].score){
                scores['top5'] = JSON.parse(JSON.stringify(scores['top4']));
                scores['top4'] = JSON.parse(JSON.stringify(scores['top3']));
                scores['top3'] = JSON.parse(JSON.stringify(scores['top2']));
                scores['top2'] = JSON.parse(JSON.stringify(scores['top1']));
                scores['top1'].name = player;
                scores['top1'].score = this.points;
                scores['top1'].level = 2;
            } else if(this.points > scores['top2'].score){
                scores['top5'] = JSON.parse(JSON.stringify(scores['top4']));
                scores['top4'] = JSON.parse(JSON.stringify(scores['top3']));
                scores['top3'] = JSON.parse(JSON.stringify(scores['top2']));
                scores['top2'].name = player;
                scores['top2'].score = this.points;
                scores['top2'].level = 2;
            } else if(this.points > scores['top3'].score){
                scores['top5'] = JSON.parse(JSON.stringify(scores['top4']));
                scores['top4'] = JSON.parse(JSON.stringify(scores['top3']));
                scores['top3'].name = player;
                scores['top3'].score = this.points;
                scores['top3'].level = 2;
            } else if(this.points > scores['top4'].score){
                scores['top5'] = JSON.parse(JSON.stringify(scores['top4']));
                scores['top4'].name = player;
                scores['top4'].score = this.points;
                scores['top4'].level = 2;
            } else if(this.points > scores['top5'].score){
                scores['top5'].name = player;
                scores['top5'].score = this.points;
                scores['top5'].level = 2;

            }
            scores['currentPlayer'].score = 0;
            scores['currentPlayer'].level = 0;

            //save
            window.localStorage.setItem('scores', JSON.stringify(scores));
            console.log(scores);
        }
    },
};