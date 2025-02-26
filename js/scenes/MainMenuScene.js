/**
 * MainMenuScene - Game main menu
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Add background
        this.add.image(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2, 'menu-background')
            .setDisplaySize(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // Add title
        this.add.text(CONFIG.GAME_WIDTH / 2, 100, 'BULLET HEAVEN', {
            fontFamily: 'Arial',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        // Check if there's a saved game
        const hasSavedGame = window.gameState.hasSavedGame();
        
        // Create buttons
        this.createButton(CONFIG.GAME_WIDTH / 2, 250, 'NEW GAME', () => {
            window.gameState.resetGame();
            this.scene.start('GameScene');
        });
        
        if (hasSavedGame) {
            this.createButton(CONFIG.GAME_WIDTH / 2, 350, 'CONTINUE', () => {
                this.scene.start('GameScene');
            });
        }
        
        // Add version info
        this.add.text(CONFIG.GAME_WIDTH - 10, CONFIG.GAME_HEIGHT - 10, 'v1.0', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff'
        }).setOrigin(1, 1);
        
        // Add controls info
        const controlsText = this.isMobile() ? 
            'CONTROLS: TAP AND DRAG TO MOVE' : 
            'CONTROLS: WASD OR ARROW KEYS TO MOVE';
            
        this.add.text(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT - 50, controlsText, {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    /**
     * Create a button with text and callback
     */
    createButton(x, y, text, callback) {
        // Create button background
        const button = this.add.image(x, y, 'button')
            .setInteractive()
            .setScale(2);
            
        // Add button text
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add hover effect
        button.on('pointerover', () => {
            button.setTint(0xcccccc);
        });
        
        button.on('pointerout', () => {
            button.clearTint();
        });
        
        // Add click callback
        button.on('pointerdown', () => {
            button.setTint(0x999999);
        });
        
        button.on('pointerup', () => {
            button.clearTint();
            callback();
        });
        
        return { button, buttonText };
    }
    
    /**
     * Check if the device is mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
} 