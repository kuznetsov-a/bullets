/**
 * BootScene - Initial scene for game setup
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load minimal assets needed for the loading screen
        this.load.image('loading-background', 'assets/images/loading-background.png');
        this.load.image('loading-bar', 'assets/images/loading-bar.png');
    }

    create() {
        // Set up any game-wide settings
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        
        // Initialize game state manager
        window.gameState = new GameState();
        
        // Proceed to the preload scene
        this.scene.start('PreloadScene');
    }
} 