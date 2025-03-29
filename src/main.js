import { GameScene } from './classes/GameScene.js';
import { Config } from './classes/Config.js';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 }
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);

// Handle resizing
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

// Prevent browser scaling on double-tap (mobile)
document.addEventListener('dblclick', (e) => {
    e.preventDefault();
}, { passive: false }); 