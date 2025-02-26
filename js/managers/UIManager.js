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
        
        // Store screen dimensions
        this.screenWidth = scene.scale.width;
        this.screenHeight = scene.scale.height;
        
        // Create UI elements
        this.createHPBar();
        this.createXPBar();
        this.createWeaponSlots();
        this.createLevelText();
        
        // Position UI elements based on current screen size
        this.positionUIElements();
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
     * Handle screen resize
     * @param {number} width - New screen width
     * @param {number} height - New screen height
     */
    resize(width, height) {
        // Update stored dimensions
        this.screenWidth = width;
        this.screenHeight = height;
        
        // Reposition UI elements
        this.positionUIElements();
    }
    
    /**
     * Position UI elements based on screen size
     */
    positionUIElements() {
        // Calculate UI scale based on screen size
        const baseWidth = CONFIG.BASE_WIDTH;
        const baseHeight = CONFIG.BASE_HEIGHT;
        const scaleX = this.screenWidth / baseWidth;
        const scaleY = this.screenHeight / baseHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Apply minimum and maximum scale limits
        const uiScale = Phaser.Math.Clamp(scale, 0.5, 1.5);
        
        // Position HP bar
        const hpBarWidth = 200 * uiScale;
        const hpBarHeight = 20 * uiScale;
        const hpBarPadding = 10 * uiScale;
        
        this.hpBarBg.setPosition(hpBarPadding, hpBarPadding);
        this.hpBarBg.setDisplaySize(hpBarWidth, hpBarHeight);
        
        this.hpBarFill.setPosition(hpBarPadding, hpBarPadding);
        this.hpBarFill.setDisplaySize(hpBarWidth, hpBarHeight);
        
        this.hpText.setPosition(hpBarPadding + hpBarWidth / 2, hpBarPadding + hpBarHeight / 2);
        this.hpText.setFontSize(14 * uiScale);
        
        // Position XP bar
        const xpBarWidth = 200 * uiScale;
        const xpBarHeight = 10 * uiScale;
        const xpBarY = hpBarPadding + hpBarHeight + 5 * uiScale;
        
        this.xpBarBg.setPosition(hpBarPadding, xpBarY);
        this.xpBarBg.setDisplaySize(xpBarWidth, xpBarHeight);
        
        this.xpBarFill.setPosition(hpBarPadding, xpBarY);
        // Width is updated in updateXPBar()
        this.xpBarFill.setDisplaySize(this.xpBarFill.displayWidth, xpBarHeight);
        
        // Position level text
        const levelTextY = xpBarY + xpBarHeight + 5 * uiScale;
        this.levelText.setPosition(hpBarPadding, levelTextY);
        this.levelText.setFontSize(14 * uiScale);
        
        // Position weapon slots
        this.positionWeaponSlots(uiScale);
    }
    
    /**
     * Position weapon slots based on screen size
     * @param {number} scale - UI scale factor
     */
    positionWeaponSlots(scale) {
        const slotSize = 40 * scale;
        const slotPadding = 5 * scale;
        const startX = this.screenWidth - slotSize - slotPadding;
        const startY = slotPadding;
        
        for (let i = 0; i < this.weaponSlots.length; i++) {
            const slot = this.weaponSlots[i];
            const y = startY + (slotSize + slotPadding) * i;
            
            // Position and scale the background
            slot.bg.setPosition(startX, y);
            slot.bg.setDisplaySize(slotSize, slotSize);
            
            // Position the icon (if it exists)
            if (slot.icon) {
                slot.icon.setPosition(startX, y);
                slot.icon.setDisplaySize(slotSize * 0.8, slotSize * 0.8);
            }
            
            // For the cooldown graphics, we don't need to set display size
            // We'll redraw it in the updateWeaponSlots method
            // Just clear it for now
            if (slot.cooldown) {
                slot.cooldown.clear();
            }
        }
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
        
        // Create slots
        for (let i = 0; i < CONFIG.MAX_WEAPONS; i++) {
            // Slot background
            const bg = this.scene.add.image(
                this.screenWidth - 60,
                60 + (i * 70),
                'ui-weapon-slot'
            ).setOrigin(0.5);
            
            // Cooldown overlay (using graphics for pie chart style cooldown)
            const cooldown = this.scene.add.graphics();
            
            // Weapon icon (if weapon exists)
            const icon = this.scene.add.sprite(
                this.screenWidth - 60,
                60 + (i * 70),
                'bullet'
            ).setVisible(false);
            
            // Add to container
            this.container.add([bg, cooldown, icon]);
            
            // Store reference
            this.weaponSlots.push({
                bg: bg,
                cooldown: cooldown,
                icon: icon
            });
        }
    }
    
    /**
     * Update HP bar
     */
    updateHPBar() {
        const player = this.scene.player;
        
        // Update HP bar fill
        const hpPercent = player.hp / player.maxHp;
        const hpBarWidth = this.hpBarBg.displayWidth * hpPercent;
        this.hpBarFill.setDisplaySize(hpBarWidth, this.hpBarFill.displayHeight);
        
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
        const xpBarWidth = this.xpBarBg.displayWidth * xpPercent;
        this.xpBarFill.setDisplaySize(xpBarWidth, this.xpBarFill.displayHeight);
        
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
        for (let i = 0; i < this.weaponSlots.length; i++) {
            const slot = this.weaponSlots[i];
            const weapon = player.weapons[i];
            
            if (weapon) {
                // Show weapon icon
                slot.icon.setVisible(true);
                slot.icon.setTexture(weapon.type.toLowerCase());
                
                // Update cooldown overlay
                const cooldownPercent = Math.max(0, 1 - ((time - weapon.lastFireTime) / weapon.cooldown));
                
                if (cooldownPercent > 0) {
                    // Draw cooldown overlay
                    slot.cooldown.clear();
                    slot.cooldown.fillStyle(0x000000, 0.5);
                    slot.cooldown.beginPath();
                    
                    // Get the center of the slot
                    const centerX = slot.bg.x;
                    const centerY = slot.bg.y;
                    const radius = slot.bg.displayWidth / 2;
                    
                    // Draw the cooldown arc
                    slot.cooldown.moveTo(centerX, centerY);
                    slot.cooldown.arc(
                        centerX,
                        centerY,
                        radius,
                        -Math.PI / 2,
                        -Math.PI / 2 + (Math.PI * 2 * cooldownPercent),
                        true
                    );
                    slot.cooldown.closePath();
                    slot.cooldown.fill();
                } else {
                    // Clear cooldown overlay
                    slot.cooldown.clear();
                }
            } else {
                // Hide weapon icon
                slot.icon.setVisible(false);
                
                // Clear cooldown overlay
                slot.cooldown.clear();
            }
        }
    }
} 