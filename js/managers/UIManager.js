/**
 * UIManager - Handles all UI elements in the game
 */
class UIManager {
    /**
     * Create a new UI manager
     * @param {Phaser.Scene} scene - The scene the UI belongs to
     */
    constructor(scene) {
        this.scene = scene;
        
        // Create UI container
        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0); // Fix to camera
        this.container.setDepth(100);
        
        // Create UI elements
        this.createHPBar();
        this.createXPBar();
        this.createWeaponSlots();
        this.createLevelText();
    }
    
    /**
     * Update UI elements
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Update HP bar
        this.updateHPBar();
        
        // Update XP bar
        this.updateXPBar();
        
        // Update weapon slots
        this.updateWeaponSlots(time);
    }
    
    /**
     * Create HP bar
     */
    createHPBar() {
        // HP bar background
        this.hpBarBg = this.scene.add.image(10, 10, 'ui-hp-bar')
            .setOrigin(0, 0)
            .setTint(0x333333)
            .setDisplaySize(200, 20);
        
        // HP bar fill
        this.hpBarFill = this.scene.add.image(10, 10, 'ui-hp-bar')
            .setOrigin(0, 0)
            .setTint(0xff0000)
            .setDisplaySize(200, 20);
        
        // HP text
        this.hpText = this.scene.add.text(110, 20, '', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Add to container
        this.container.add([this.hpBarBg, this.hpBarFill, this.hpText]);
    }
    
    /**
     * Create XP bar
     */
    createXPBar() {
        // XP bar background
        this.xpBarBg = this.scene.add.image(10, 35, 'ui-xp-bar')
            .setOrigin(0, 0)
            .setTint(0x333333)
            .setDisplaySize(200, 10);
        
        // XP bar fill
        this.xpBarFill = this.scene.add.image(10, 35, 'ui-xp-bar')
            .setOrigin(0, 0)
            .setTint(0x00ff00)
            .setDisplaySize(0, 10);
        
        // Add to container
        this.container.add([this.xpBarBg, this.xpBarFill]);
    }
    
    /**
     * Create level text
     */
    createLevelText() {
        // Level text
        this.levelText = this.scene.add.text(10, 50, 'Level: 1', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#ffffff'
        });
        
        // Add to container
        this.container.add(this.levelText);
    }
    
    /**
     * Create weapon slots
     */
    createWeaponSlots() {
        this.weaponSlots = [];
        this.weaponCooldowns = [];
        this.weaponIcons = [];
        
        // Create slots
        for (let i = 0; i < CONFIG.MAX_WEAPONS; i++) {
            // Slot background
            const slot = this.scene.add.image(
                CONFIG.GAME_WIDTH - 60,
                60 + (i * 70),
                'ui-weapon-slot'
            ).setOrigin(0.5);
            
            // Cooldown overlay
            const cooldown = this.scene.add.graphics();
            
            // Weapon icon (if weapon exists)
            const icon = this.scene.add.sprite(
                CONFIG.GAME_WIDTH - 60,
                60 + (i * 70),
                'bullet'
            ).setVisible(false);
            
            // Add to arrays
            this.weaponSlots.push(slot);
            this.weaponCooldowns.push(cooldown);
            this.weaponIcons.push(icon);
            
            // Add to container
            this.container.add([slot, cooldown, icon]);
        }
    }
    
    /**
     * Update HP bar
     */
    updateHPBar() {
        const player = this.scene.player;
        
        // Update HP bar fill
        const hpPercent = player.hp / player.maxHp;
        this.hpBarFill.setDisplaySize(200 * hpPercent, 20);
        
        // Update HP text
        this.hpText.setText(`${player.hp}/${player.maxHp}`);
    }
    
    /**
     * Update XP bar
     */
    updateXPBar() {
        const player = this.scene.player;
        
        // Update XP bar fill
        const xpPercent = player.xp / player.nextLevelXp;
        this.xpBarFill.setDisplaySize(200 * xpPercent, 10);
        
        // Update level text
        this.levelText.setText(`Level: ${player.level}`);
    }
    
    /**
     * Update weapon slots
     * @param {number} time - Current time
     */
    updateWeaponSlots(time) {
        const player = this.scene.player;
        
        // Update each slot
        for (let i = 0; i < CONFIG.MAX_WEAPONS; i++) {
            const weapon = player.weapons[i];
            
            if (weapon) {
                // Show weapon icon
                this.weaponIcons[i].setVisible(true);
                this.weaponIcons[i].setTexture(weapon.type.toLowerCase());
                
                // Update cooldown overlay
                const cooldownPercent = Math.max(0, 1 - ((time - weapon.lastFireTime) / weapon.cooldown));
                
                if (cooldownPercent > 0) {
                    // Draw cooldown overlay
                    this.weaponCooldowns[i].clear();
                    this.weaponCooldowns[i].fillStyle(0x000000, 0.5);
                    this.weaponCooldowns[i].beginPath();
                    this.weaponCooldowns[i].moveTo(CONFIG.GAME_WIDTH - 60, 60 + (i * 70));
                    this.weaponCooldowns[i].arc(
                        CONFIG.GAME_WIDTH - 60,
                        60 + (i * 70),
                        30,
                        -Math.PI / 2,
                        -Math.PI / 2 + (Math.PI * 2 * cooldownPercent),
                        true
                    );
                    this.weaponCooldowns[i].closePath();
                    this.weaponCooldowns[i].fill();
                } else {
                    // Clear cooldown overlay
                    this.weaponCooldowns[i].clear();
                }
            } else {
                // Hide weapon icon
                this.weaponIcons[i].setVisible(false);
                
                // Clear cooldown overlay
                this.weaponCooldowns[i].clear();
            }
        }
    }
} 