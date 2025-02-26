// UIManager class for handling HUD elements
class UIManager {
    constructor(scene) {
        this.scene = scene;
        
        // Create UI container
        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0); // Fix to camera
        
        // Create graphics object for drawing UI elements
        this.graphics = scene.add.graphics();
        this.graphics.setScrollFactor(0);
        this.container.add(this.graphics);
        
        // Create text objects
        this.healthText = scene.add.text(20, 20, 'HP: 100/100', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.healthText.setScrollFactor(0);
        this.container.add(this.healthText);
        
        this.levelText = scene.add.text(20, 50, 'Level: 0', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.levelText.setScrollFactor(0);
        this.container.add(this.levelText);
        
        this.xpText = scene.add.text(20, 80, 'XP: 0/10', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.xpText.setScrollFactor(0);
        this.container.add(this.xpText);
        
        this.killsText = scene.add.text(20, 110, 'Kills: 0', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.killsText.setScrollFactor(0);
        this.container.add(this.killsText);
        
        // Create weapon slot UI
        this.weaponSlots = [];
        for (let i = 0; i < CONFIG.weapons.maxWeapons; i++) {
            const slot = {
                background: null,
                icon: null,
                cooldownOverlay: null,
                text: null
            };
            
            this.weaponSlots.push(slot);
        }
        
        // Initialize weapon slots
        this.initWeaponSlots();
        
        // Create XP bar
        this.xpBar = {
            background: null,
            fill: null
        };
        
        this.initXPBar();
    }
    
    // Initialize weapon slots UI
    initWeaponSlots() {
        const slotSize = 60;
        const padding = 10;
        const startX = this.scene.cameras.main.width - (slotSize + padding) * CONFIG.weapons.maxWeapons;
        const startY = 20;
        
        for (let i = 0; i < this.weaponSlots.length; i++) {
            const slot = this.weaponSlots[i];
            const x = startX + i * (slotSize + padding);
            const y = startY;
            
            // Create slot background
            slot.background = this.scene.add.rectangle(x + slotSize / 2, y + slotSize / 2, slotSize, slotSize, 0x333333, 0.7);
            slot.background.setScrollFactor(0);
            slot.background.setStrokeStyle(2, 0xffffff, 0.8);
            this.container.add(slot.background);
            
            // Create cooldown overlay
            slot.cooldownOverlay = this.scene.add.rectangle(x + slotSize / 2, y + slotSize / 2, slotSize, slotSize, 0x000000, 0.5);
            slot.cooldownOverlay.setScrollFactor(0);
            slot.cooldownOverlay.setOrigin(0.5, 0);
            slot.cooldownOverlay.setVisible(false);
            this.container.add(slot.cooldownOverlay);
            
            // Create slot text (for weapon level)
            slot.text = this.scene.add.text(x + 5, y + 5, '', {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff'
            });
            slot.text.setScrollFactor(0);
            this.container.add(slot.text);
            
            // Create weapon icon (placeholder)
            slot.icon = this.scene.add.text(x + slotSize / 2, y + slotSize / 2, '?', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            });
            slot.icon.setScrollFactor(0);
            slot.icon.setOrigin(0.5, 0.5);
            this.container.add(slot.icon);
        }
    }
    
    // Initialize XP bar
    initXPBar() {
        const barWidth = this.scene.cameras.main.width - 40;
        const barHeight = 10;
        const barX = 20;
        const barY = this.scene.cameras.main.height - 30;
        
        // Create background
        this.xpBar.background = this.scene.add.rectangle(barX + barWidth / 2, barY + barHeight / 2, barWidth, barHeight, 0x333333, 0.7);
        this.xpBar.background.setScrollFactor(0);
        this.xpBar.background.setStrokeStyle(1, 0xffffff, 0.8);
        this.container.add(this.xpBar.background);
        
        // Create fill
        this.xpBar.fill = this.scene.add.rectangle(barX, barY, 0, barHeight, 0x00ff00, 0.8);
        this.xpBar.fill.setScrollFactor(0);
        this.xpBar.fill.setOrigin(0, 0);
        this.container.add(this.xpBar.fill);
    }
    
    // Update UI elements
    update() {
        if (!this.scene.player) return;
        
        // Update health text
        this.healthText.setText(`HP: ${Math.ceil(this.scene.player.health)}/${this.scene.player.maxHealth}`);
        
        // Update level text
        this.levelText.setText(`Level: ${this.scene.player.level}`);
        
        // Update XP text
        this.xpText.setText(`XP: ${this.scene.player.xp}/${this.scene.player.xpToNextLevel}`);
        
        // Update kills text
        this.killsText.setText(`Kills: ${this.scene.enemiesKilled || 0}`);
        
        // Update weapon slots
        this.updateWeaponSlots();
        
        // Update XP bar
        this.updateXPBar();
        
        // Update power-up indicators
        this.updatePowerUpIndicators();
    }
    
    // Update weapon slots UI
    updateWeaponSlots() {
        const weapons = this.scene.player.weapons;
        
        for (let i = 0; i < this.weaponSlots.length; i++) {
            const slot = this.weaponSlots[i];
            const weapon = weapons[i];
            
            if (weapon) {
                // Update weapon icon
                let iconText = '?';
                switch (weapon.type) {
                    case 'bullet':
                        iconText = '•';
                        break;
                    case 'aura':
                        iconText = '○';
                        break;
                    case 'hammer':
                        iconText = '⚒';
                        break;
                    case 'whip':
                        iconText = '~';
                        break;
                }
                slot.icon.setText(iconText);
                
                // Update weapon level text
                slot.text.setText(`Lv ${weapon.level}`);
                
                // Update cooldown overlay
                const progress = weapon.getCooldownProgress();
                if (progress < 1) {
                    slot.cooldownOverlay.setVisible(true);
                    slot.cooldownOverlay.height = slot.background.height * (1 - progress);
                    slot.cooldownOverlay.y = slot.background.y - slot.background.height / 2 + slot.background.height * progress;
                } else {
                    slot.cooldownOverlay.setVisible(false);
                }
            } else {
                // Empty slot
                slot.icon.setText('');
                slot.text.setText('');
                slot.cooldownOverlay.setVisible(false);
            }
        }
    }
    
    // Update XP bar
    updateXPBar() {
        const player = this.scene.player;
        const progress = player.xp / player.xpToNextLevel;
        const barWidth = this.xpBar.background.width - 2; // Account for stroke
        
        this.xpBar.fill.width = barWidth * progress;
    }
    
    // Update power-up indicators
    updatePowerUpIndicators() {
        // Clear previous indicators
        this.graphics.clear();
        
        const player = this.scene.player;
        const indicatorY = 140;
        let indicatorX = 20;
        
        // Draw speed boost indicator
        if (player.powerUps.speed.active) {
            this.graphics.fillStyle(0xffff00, 0.8);
            this.graphics.fillCircle(indicatorX + 10, indicatorY + 10, 10);
            this.graphics.fillStyle(0x000000, 0.8);
            this.graphics.fillText('S', indicatorX + 5, indicatorY + 5);
            indicatorX += 30;
        }
        
        // Draw fire rate boost indicator
        if (player.powerUps.fireRate.active) {
            this.graphics.fillStyle(0x00ffff, 0.8);
            this.graphics.fillCircle(indicatorX + 10, indicatorY + 10, 10);
            this.graphics.fillStyle(0x000000, 0.8);
            this.graphics.fillText('F', indicatorX + 5, indicatorY + 5);
        }
    }
    
    // Resize UI elements when the game is resized
    resize() {
        // Update XP bar position and size
        const barWidth = this.scene.cameras.main.width - 40;
        const barY = this.scene.cameras.main.height - 30;
        
        this.xpBar.background.width = barWidth;
        this.xpBar.background.x = 20 + barWidth / 2;
        this.xpBar.background.y = barY + 5;
        
        this.xpBar.fill.y = barY;
        
        // Update weapon slots position
        const slotSize = 60;
        const padding = 10;
        const startX = this.scene.cameras.main.width - (slotSize + padding) * CONFIG.weapons.maxWeapons;
        
        for (let i = 0; i < this.weaponSlots.length; i++) {
            const slot = this.weaponSlots[i];
            const x = startX + i * (slotSize + padding);
            
            slot.background.x = x + slotSize / 2;
            slot.cooldownOverlay.x = x + slotSize / 2;
            slot.text.x = x + 5;
            slot.icon.x = x + slotSize / 2;
        }
    }
    
    // Show game over UI
    showGameOver() {
        // Create semi-transparent overlay
        const overlay = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);
        this.container.add(overlay);
        
        // Create game over text
        const gameOverText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 50,
            'GAME OVER',
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        gameOverText.setScrollFactor(0);
        gameOverText.setOrigin(0.5, 0.5);
        this.container.add(gameOverText);
        
        // Create stats text
        const statsText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 20,
            `Level: ${this.scene.player.level}\nKills: ${this.scene.enemiesKilled}`,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        );
        statsText.setScrollFactor(0);
        statsText.setOrigin(0.5, 0.5);
        this.container.add(statsText);
        
        // Create restart button
        const restartButton = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 100,
            200,
            50,
            0x00ff00,
            0.8
        );
        restartButton.setScrollFactor(0);
        restartButton.setInteractive();
        this.container.add(restartButton);
        
        const restartText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 100,
            'RESTART',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        restartText.setScrollFactor(0);
        restartText.setOrigin(0.5, 0.5);
        this.container.add(restartText);
        
        // Add restart button event
        restartButton.on('pointerdown', () => {
            // Clear saved game
            if (this.scene.gameState) {
                this.scene.gameState.clearSavedGame();
            }
            
            // Restart the scene
            this.scene.scene.restart();
        });
    }
} 