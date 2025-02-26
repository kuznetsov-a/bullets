/**
 * PreloadScene - Loads all game assets
 */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();
        
        // Load all game assets
        this.loadAssets();
    }

    createLoadingBar() {
        // Add loading background
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'loading-background');
        
        // Create loading bar
        const loadingBar = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'loading-bar');
        
        // Set up progress bar animation
        this.load.on('progress', (value) => {
            loadingBar.scaleX = value;
        });
        
        // Clean up when loading complete
        this.load.on('complete', () => {
            loadingBar.destroy();
        });
    }

    loadAssets() {
        // Player assets
        this.load.image('player', 'assets/images/player.png');
        
        // Enemy assets
        this.load.image('enemy-walker', 'assets/images/enemy-walker.png');
        this.load.image('enemy-charger', 'assets/images/enemy-charger.png');
        this.load.image('enemy-tank', 'assets/images/enemy-tank.png');
        this.load.image('enemy-shooter', 'assets/images/enemy-shooter.png');
        this.load.image('enemy-projectile', 'assets/images/enemy-projectile.png');
        
        // Weapon assets
        this.load.image('bullet', 'assets/images/bullet.png');
        this.load.image('aura', 'assets/images/aura.png');
        this.load.image('hammer', 'assets/images/hammer.png');
        this.load.image('whip', 'assets/images/whip.png');
        
        // Power-up assets
        this.load.image('powerup-health', 'assets/images/powerup-health.png');
        this.load.image('powerup-speed', 'assets/images/powerup-speed.png');
        this.load.image('powerup-fire-rate', 'assets/images/powerup-fire-rate.png');
        
        // UI assets
        this.load.image('ui-background', 'assets/images/ui-background.png');
        this.load.image('ui-weapon-slot', 'assets/images/ui-weapon-slot.png');
        this.load.image('ui-hp-bar', 'assets/images/ui-hp-bar.png');
        this.load.image('ui-xp-bar', 'assets/images/ui-xp-bar.png');
        
        // Map assets
        this.load.image('map-background', 'assets/images/map-background.png');
        this.load.image('obstacle', 'assets/images/obstacle.png');
        
        // Menu assets
        this.load.image('menu-background', 'assets/images/menu-background.png');
        this.load.image('button', 'assets/images/button.png');
        
        // Level up assets
        this.load.image('level-up-background', 'assets/images/level-up-background.png');
        this.load.image('level-up-option', 'assets/images/level-up-option.png');
        
        // Audio assets
        this.load.audio('music-main', 'assets/audio/music-main.mp3');
        this.load.audio('sound-shoot', 'assets/audio/sound-shoot.mp3');
        this.load.audio('sound-hit', 'assets/audio/sound-hit.mp3');
        this.load.audio('sound-level-up', 'assets/audio/sound-level-up.mp3');
        this.load.audio('sound-powerup', 'assets/audio/sound-powerup.mp3');
    }

    create() {
        // Proceed to the main menu
        this.scene.start('MainMenuScene');
    }
} 