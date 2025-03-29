import { Config } from './Config.js';

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;
        
        // UI containers
        this.mainHUD = scene.add.container(0, 0).setScrollFactor(0);
        this.levelUpMenu = scene.add.container(0, 0).setScrollFactor(0).setVisible(false);
        this.gameOverMenu = scene.add.container(0, 0).setScrollFactor(0).setVisible(false);
        
        // Create UI elements
        this.createHUD();
        this.createLevelUpMenu();
        this.createGameOverScreen();
        
        // Track if level up menu is active
        this.isLevelUpActive = false;
        
        // Make sure UI is on top
        this.mainHUD.setDepth(100);
        this.levelUpMenu.setDepth(101);
        this.gameOverMenu.setDepth(102);
    }
    
    createHUD() {
        const { width, height } = this.scene.sys.game.config;
        
        // Create HP bar
        this.hpBarBg = this.scene.add.rectangle(20, 20, 200, 20, 0x000000, 0.7).setOrigin(0, 0);
        this.hpBar = this.scene.add.rectangle(20, 20, 200, 20, 0xff0000, 1).setOrigin(0, 0);
        this.hpText = this.scene.add.text(125, 30, "HP: 100/100", { 
            fontFamily: 'Arial', 
            fontSize: 14,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Create XP bar
        this.xpBarBg = this.scene.add.rectangle(20, 50, 200, 10, 0x000000, 0.7).setOrigin(0, 0);
        this.xpBar = this.scene.add.rectangle(20, 50, 0, 10, 0x00ff00, 1).setOrigin(0, 0);
        this.levelText = this.scene.add.text(125, 65, "Level: 1", { 
            fontFamily: 'Arial', 
            fontSize: 14,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Create weapon slots
        this.weaponSlots = [];
        
        for (let i = 0; i < Config.MAX_WEAPONS; i++) {
            const x = 20 + i * 45;
            const y = 90;
            
            // Slot background
            const slotBg = this.scene.add.rectangle(x, y, 40, 40, 0x333333, 0.7)
                .setOrigin(0, 0);
            
            // Cooldown overlay
            const cooldownOverlay = this.scene.add.rectangle(x, y, 40, 40, 0x000000, 0.5)
                .setOrigin(0, 0);
            
            // Weapon icon placeholder
            const iconBg = this.scene.add.rectangle(x + 20, y + 20, 30, 30, 0x666666, 0.5)
                .setOrigin(0.5);
            
            // Level text
            const levelText = this.scene.add.text(x + 5, y + 5, "1", { 
                fontFamily: 'Arial', 
                fontSize: 10,
                color: '#ffffff'
            });
            
            this.weaponSlots.push({
                background: slotBg,
                cooldownOverlay: cooldownOverlay,
                iconBackground: iconBg,
                levelText: levelText,
                weaponIndex: i
            });
        }
        
        // Add all elements to HUD container
        this.mainHUD.add([
            this.hpBarBg, 
            this.hpBar, 
            this.hpText,
            this.xpBarBg,
            this.xpBar,
            this.levelText
        ]);
        
        for (const slot of this.weaponSlots) {
            this.mainHUD.add([
                slot.background,
                slot.cooldownOverlay,
                slot.iconBackground,
                slot.levelText
            ]);
        }
    }
    
    createLevelUpMenu() {
        const { width, height } = this.scene.sys.game.config;
        
        // Background overlay
        this.levelUpBg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0);
        
        // Title text
        this.levelUpTitle = this.scene.add.text(width / 2, height / 4, "LEVEL UP!", { 
            fontFamily: 'Arial', 
            fontSize: 32,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create options
        this.levelUpOptions = [];
        this.levelUpOptionTexts = [];
        
        for (let i = 0; i < 4; i++) {
            const y = height / 3 + i * 60;
            
            const optionBg = this.scene.add.rectangle(width / 2, y, 300, 50, 0x666666, 0.8)
                .setOrigin(0.5)
                .setInteractive();
            
            const optionText = this.scene.add.text(width / 2, y, "Option " + (i + 1), { 
                fontFamily: 'Arial', 
                fontSize: 16,
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            optionBg.on('pointerover', () => {
                optionBg.fillColor = 0x888888;
            });
            
            optionBg.on('pointerout', () => {
                optionBg.fillColor = 0x666666;
            });
            
            this.levelUpOptions.push(optionBg);
            this.levelUpOptionTexts.push(optionText);
        }
        
        // Add all elements to level up container
        this.levelUpMenu.add([
            this.levelUpBg,
            this.levelUpTitle
        ]);
        
        for (let i = 0; i < this.levelUpOptions.length; i++) {
            this.levelUpMenu.add([
                this.levelUpOptions[i],
                this.levelUpOptionTexts[i]
            ]);
        }
    }
    
    createGameOverScreen() {
        const { width, height } = this.scene.sys.game.config;
        
        // Background overlay
        this.gameOverBg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0);
        
        // Game Over text
        this.gameOverTitle = this.scene.add.text(width / 2, height / 3, "GAME OVER", { 
            fontFamily: 'Arial', 
            fontSize: 48,
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Stats text
        this.gameOverStats = this.scene.add.text(width / 2, height / 2, "Level: 1\nKills: 0", { 
            fontFamily: 'Arial', 
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Restart button
        this.restartButton = this.scene.add.rectangle(width / 2, height * 2/3, 200, 50, 0x666666, 0.8)
            .setOrigin(0.5)
            .setInteractive();
        
        this.restartText = this.scene.add.text(width / 2, height * 2/3, "RESTART", { 
            fontFamily: 'Arial', 
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        this.restartButton.on('pointerover', () => {
            this.restartButton.fillColor = 0x888888;
        });
        
        this.restartButton.on('pointerout', () => {
            this.restartButton.fillColor = 0x666666;
        });
        
        this.restartButton.on('pointerdown', () => {
            this.scene.resetGame();
        });
        
        // Add all elements to game over container
        this.gameOverMenu.add([
            this.gameOverBg,
            this.gameOverTitle,
            this.gameOverStats,
            this.restartButton,
            this.restartText
        ]);
    }
    
    update() {
        if (this.isLevelUpActive) return;
        
        this.updateHPBar();
        this.updateXPBar();
        this.updateWeaponSlots();
    }
    
    updateHPBar() {
        const player = this.player;
        
        // Update HP bar width
        const hpPercent = player.hp / player.maxHp;
        this.hpBar.width = 200 * hpPercent;
        
        // Update HP text
        this.hpText.setText(`HP: ${Math.ceil(player.hp)}/${player.maxHp}`);
    }
    
    updateXPBar() {
        const player = this.player;
        
        // Calculate XP progress to next level (0 to 1)
        let xpProgress = 0;
        
        if (player.nextLevelXp > 0) {
            xpProgress = player.xp / player.nextLevelXp;
        }
        
        // Update XP bar width
        this.xpBar.width = 200 * xpProgress;
        
        // Update level text
        this.levelText.setText(`Level: ${player.level}`);
    }
    
    updateWeaponSlots() {
        for (let i = 0; i < this.weaponSlots.length; i++) {
            const slot = this.weaponSlots[i];
            const weapon = i < this.player.weapons.length ? this.player.weapons[i] : null;
            
            if (weapon) {
                // Show weapon info
                slot.iconBackground.fillColor = getWeaponColor(weapon.type);
                slot.levelText.setText(weapon.level.toString());
                
                // Update cooldown overlay
                const cooldownProgress = weapon.getCooldownProgress();
                slot.cooldownOverlay.height = 40 * (1 - cooldownProgress);
                slot.cooldownOverlay.y = 90 + 40 * cooldownProgress;
            } else {
                // Show empty slot
                slot.iconBackground.fillColor = 0x666666;
                slot.levelText.setText("");
                slot.cooldownOverlay.height = 0;
            }
        }
        
        // Helper function to get color based on weapon type
        function getWeaponColor(type) {
            switch (type) {
                case 'BULLET': return 0xffffff;
                case 'AURA': return 0x00ffff;
                case 'HAMMER': return 0xffaa00;
                case 'WHIP': return 0xffff00;
                default: return 0x666666;
            }
        }
    }
    
    showLevelUpOptions() {
        // Pause the game
        this.scene.physics.pause();
        this.isLevelUpActive = true;
        
        // Update level up title
        this.levelUpTitle.setText(`LEVEL UP! (${this.player.level})`);
        
        // Generate options
        const options = this.generateLevelUpOptions();
        
        // Update option text
        for (let i = 0; i < this.levelUpOptionTexts.length; i++) {
            if (i < options.length) {
                this.levelUpOptionTexts[i].setText(options[i].text);
                this.levelUpOptions[i].visible = true;
                this.levelUpOptionTexts[i].visible = true;
                
                // Clear previous listeners
                this.levelUpOptions[i].off('pointerdown');
                
                // Add new listener
                this.levelUpOptions[i].on('pointerdown', () => {
                    this.applyLevelUpOption(options[i]);
                    this.hideLevelUpMenu();
                });
            } else {
                // Hide extra options
                this.levelUpOptions[i].visible = false;
                this.levelUpOptionTexts[i].visible = false;
            }
        }
        
        // Show the menu
        this.levelUpMenu.setVisible(true);
    }
    
    generateLevelUpOptions() {
        const options = [];
        const player = this.player;
        
        // Add weapon upgrades for existing weapons
        for (let i = 0; i < player.weapons.length; i++) {
            const weapon = player.weapons[i];
            
            // Add damage upgrade
            options.push({
                type: 'upgrade',
                weaponIndex: i,
                upgradeType: 'damage',
                text: `Upgrade ${getWeaponName(weapon.type)} Damage (Lvl ${weapon.level} → ${weapon.level + 1})`
            });
            
            // Add cooldown upgrade
            options.push({
                type: 'upgrade',
                weaponIndex: i,
                upgradeType: 'cooldown',
                text: `Upgrade ${getWeaponName(weapon.type)} Fire Rate (Lvl ${weapon.level} → ${weapon.level + 1})`
            });
            
            // Add weapon-specific upgrades
            if (weapon.type === 'AURA') {
                options.push({
                    type: 'upgrade',
                    weaponIndex: i,
                    upgradeType: 'radius',
                    text: `Upgrade ${getWeaponName(weapon.type)} Radius (Lvl ${weapon.level} → ${weapon.level + 1})`
                });
            } else if (weapon.type === 'HAMMER') {
                options.push({
                    type: 'upgrade',
                    weaponIndex: i,
                    upgradeType: 'rotation',
                    text: `Upgrade ${getWeaponName(weapon.type)} Rotation Speed (Lvl ${weapon.level} → ${weapon.level + 1})`
                });
            } else if (weapon.type === 'WHIP') {
                options.push({
                    type: 'upgrade',
                    weaponIndex: i,
                    upgradeType: 'arc',
                    text: `Upgrade ${getWeaponName(weapon.type)} Arc Range (Lvl ${weapon.level} → ${weapon.level + 1})`
                });
            }
        }
        
        // Add new weapon options if not at max weapons
        if (player.weapons.length < Config.MAX_WEAPONS) {
            const availableTypes = player.getAvailableWeaponTypes();
            
            for (const type of availableTypes) {
                options.push({
                    type: 'newWeapon',
                    weaponType: type,
                    text: `New Weapon: ${getWeaponName(type)}`
                });
            }
        }
        
        // Randomize and limit options
        return Phaser.Utils.Array.Shuffle(options).slice(0, 4);
        
        // Helper function to get weapon name
        function getWeaponName(type) {
            switch (type) {
                case 'BULLET': return 'Bullet';
                case 'AURA': return 'Aura';
                case 'HAMMER': return 'Hammer';
                case 'WHIP': return 'Whip';
                default: return 'Unknown';
            }
        }
    }
    
    applyLevelUpOption(option) {
        if (option.type === 'upgrade') {
            this.player.upgradeWeapon(option.weaponIndex, option.upgradeType);
        } else if (option.type === 'newWeapon') {
            this.player.addWeapon(option.weaponType);
        }
    }
    
    hideLevelUpMenu() {
        this.levelUpMenu.setVisible(false);
        this.isLevelUpActive = false;
        this.scene.physics.resume();
    }
    
    showGameOver() {
        // Update stats
        this.gameOverStats.setText(
            `Level: ${this.player.level}\n` +
            `Kills: ${this.scene.killCount}`
        );
        
        // Show game over menu
        this.gameOverMenu.setVisible(true);
    }
} 