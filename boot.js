var corgiGame = {};

corgiGame.Boot = function(game) {};

corgiGame.Boot.prototype = {


    create: function() {
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = false; // pause game on tab change
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.minWidth = 480;
        this.scale.minHeight = 480;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.stage.forcePortrait = true;  // force portrait mode
        this.scale.setScreenSize(true);  // true will force screen resize no matter what

        this.input.addPointer();
        this.stage.backgroundColor = '#171642';


        this.state.start('Preloader');
    }

};