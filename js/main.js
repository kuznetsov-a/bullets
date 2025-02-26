// Game configuration
const gameConfig = {
    type: Phaser.AUTO,
    width: CONFIG.BASE_WIDTH,
    height: CONFIG.BASE_HEIGHT,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        GameScene
    ],
    pixelArt: true,
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CONFIG.BASE_WIDTH,
        height: CONFIG.BASE_HEIGHT,
        min: {
            width: CONFIG.MIN_WIDTH,
            height: CONFIG.MIN_HEIGHT
        },
        max: {
            width: CONFIG.MAX_WIDTH,
            height: CONFIG.MAX_HEIGHT
        },
        zoom: 1
    }
};

// Create the game instance
window.addEventListener('load', () => {
    // Set up responsive canvas
    const resizeGame = () => {
        if (window.game) {
            window.game.scale.refresh();
        }
    };
    
    // Add resize event listener
    window.addEventListener('resize', resizeGame);
    
    // Create game
    window.game = new Phaser.Game(gameConfig);
}); 