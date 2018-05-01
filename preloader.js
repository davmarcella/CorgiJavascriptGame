corgiGame.Preloader = function(game){
    this.ready = false;
};

corgiGame.Preloader.prototype = {

    preload: function () {
        this.load.image('background', 'images/background.png');
        this.load.image('background2', 'images/backgroundCity.png');
        this.load.image('background3', 'images/backgroundFarm.png');
        this.load.image('spaceCorgi', 'images/corgiPupper2withHelmet.png');
        this.load.image('corgiPup', 'images/corgiPupper2.png');
        this.load.image('enemyPup', 'images/enemy.png');
        this.load.image('enemyPup2', 'images/enemy2.png');
        this.load.image('enemyPup3', 'images/enemy3.png');
        this.load.image('laser', 'images/laser.png');
        this.load.image('laser2', 'images/laser2left.png');
        this.load.image('laser3a', 'images/laser3a.png');
        this.load.image('laser3b', 'images/laser3b.png');
        this.load.image('laser3c', 'images/laser3c.png');
        this.load.image('laser4', 'images/laser4left.png');
        this.load.image('explosion', 'images/greenExplosion.png');
        this.load.image('explosion2', 'images/blueExplosion.png');
        this.load.image('corgiExplosion', 'images/explosion.png');
        this.load.image('lifepack', 'images/barrnana.png');
        this.load.image('superpack', 'images/aliapple.png');
        this.load.bitmapFont('eightbitwonder', 'fonts/eightbitwonder.png', 'fonts/eightbitwonder.fnt');
        this.load.audio('laser1', 'sounds/laser1.mp3');
        this.load.audio('laser2', 'sounds/laser2.mp3');
        this.load.audio('explosion', 'sounds/explosion.mp3');
    },

    update: function () {
        this.ready = true;
        this.state.start('Game');
    }
};