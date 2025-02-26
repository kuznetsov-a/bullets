// Initialize the game when the window loads
window.addEventListener('load', function() {
    // Create Phaser game configuration
    const gameConfig = {
        type: Phaser.AUTO,
        width: CONFIG.width,
        height: CONFIG.height,
        backgroundColor: CONFIG.backgroundColor,
        parent: 'game-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [GameScene, LevelUpScene]
    };

    // Create the game instance
    const game = new Phaser.Game(gameConfig);

    // Handle window resize
    window.addEventListener('resize', function() {
        game.scale.resize(window.innerWidth, window.innerHeight);
    });

    // Prevent browser default behaviors for touch events
    document.addEventListener('touchstart', function(e) {
        if (e.target.nodeName !== 'CANVAS') return;
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', function(e) {
        if (e.target.nodeName !== 'CANVAS') return;
        e.preventDefault();
    }, { passive: false });
}); 