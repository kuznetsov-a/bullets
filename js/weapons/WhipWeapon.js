/**
 * WhipWeapon - Swings in an arc, hitting multiple enemies
 */
class WhipWeapon extends Weapon {
    /**
     * Create a new whip weapon
     * @param {Phaser.Scene} scene - The scene the weapon belongs to
     * @param {Player} player - The player that owns this weapon
     */
    constructor(scene, player) {
        super(scene, player, 'WHIP');
        
        // Whip-specific properties
        this.arc = this.config.arc; // Arc angle in degrees
        this.range = this.config.range; // Range of the whip
        
        // Create whip sprite
        this.sprite = scene.add.sprite(0, 0, 'whip');
        this.sprite.setVisible(false);
        this.sprite.setDepth(7);
        this.sprite.setOrigin(0, 0.5); // Set origin to left center for rotation
        
        // Animation state
        this.swinging = false;
        this.swingAngle = 0;
        this.swingDirection = 1;
    }
    
    /**
     * Update weapon logic
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Update whip position to follow player
        this.sprite.setPosition(this.player.sprite.x, this.player.sprite.y);
        
        // Update swing animation
        if (this.swinging) {
            this.updateSwing(delta);
        }
        
        // Check if we can fire
        if (!this.swinging && this.canFire(time)) {
            this.fire(time);
        }
    }
    
    /**
     * Fire the weapon
     * @param {number} time - Current time
     */
    fire(time) {
        super.fire(time);
        
        // Play sound
        this.scene.sound.play('sound-shoot', { volume: 0.3 });
        
        // Start swing animation
        this.startSwing();
    }
    
    /**
     * Start swing animation
     */
    startSwing() {
        // Set swinging state
        this.swinging = true;
        
        // Determine swing direction based on target
        let targetAngle;
        
        if (this.scene.isMobile()) {
            // For mobile, swing in the direction of movement
            const vx = this.player.sprite.body.velocity.x;
            const vy = this.player.sprite.body.velocity.y;
            
            // If not moving, swing in random direction
            if (vx === 0 && vy === 0) {
                targetAngle = Math.random() * Math.PI * 2;
            } else {
                // Swing in direction of movement
                targetAngle = Math.atan2(vy, vx);
            }
        } else {
            // For desktop, swing towards mouse
            const pointer = this.scene.input.activePointer;
            const dx = pointer.worldX - this.player.sprite.x;
            const dy = pointer.worldY - this.player.sprite.y;
            targetAngle = Math.atan2(dy, dx);
        }
        
        // Set initial angle
        this.swingAngle = targetAngle - (this.arc * Math.PI / 360); // Convert half arc to radians
        this.swingDirection = 1;
        
        // Show whip
        this.sprite.setVisible(true);
        
        // Set whip scale based on range
        this.sprite.scaleX = this.range / 100; // Assuming whip texture is 100px wide
    }
    
    /**
     * Update swing animation
     * @param {number} delta - Time since last update
     */
    updateSwing(delta) {
        // Calculate swing speed (complete swing in 250ms)
        const swingSpeed = (this.arc * Math.PI / 180) / 250 * delta * 2;
        
        // Update angle
        this.swingAngle += swingSpeed * this.swingDirection;
        
        // Set rotation
        this.sprite.rotation = this.swingAngle;
        
        // Check if swing is complete
        const halfArcRadians = this.arc * Math.PI / 360;
        const startAngle = this.swingAngle - (swingSpeed * this.swingDirection);
        const endAngle = this.swingAngle;
        
        // Check for enemies hit by the swing
        this.checkSwingHit(startAngle, endAngle);
        
        // If we've completed the full arc, end the swing
        if (this.swingDirection > 0 && this.swingAngle >= startAngle + (halfArcRadians * 2)) {
            this.endSwing();
        }
    }
    
    /**
     * End swing animation
     */
    endSwing() {
        this.swinging = false;
        this.sprite.setVisible(false);
    }
    
    /**
     * Check for enemies hit by the swing
     * @param {number} startAngle - Start angle of the swing segment
     * @param {number} endAngle - End angle of the swing segment
     */
    checkSwingHit(startAngle, endAngle) {
        // Get all active enemies
        const enemies = [];
        for (const type in this.scene.enemyPools) {
            this.scene.enemyPools[type].getActiveObjects().forEach(enemy => {
                enemies.push(enemy);
            });
        }
        
        // Check each enemy
        enemies.forEach(enemy => {
            // Calculate angle to enemy
            const dx = enemy.sprite.x - this.player.sprite.x;
            const dy = enemy.sprite.y - this.player.sprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Normalize angles for comparison
            const normalizedStartAngle = Phaser.Math.Wrap(startAngle, 0, Math.PI * 2);
            const normalizedEndAngle = Phaser.Math.Wrap(endAngle, 0, Math.PI * 2);
            const normalizedAngle = Phaser.Math.Wrap(angle, 0, Math.PI * 2);
            
            // Check if enemy is within range and arc
            if (distance <= this.range) {
                let inArc = false;
                
                // Handle wrap-around
                if (normalizedEndAngle < normalizedStartAngle) {
                    inArc = normalizedAngle >= normalizedStartAngle || normalizedAngle <= normalizedEndAngle;
                } else {
                    inArc = normalizedAngle >= normalizedStartAngle && normalizedAngle <= normalizedEndAngle;
                }
                
                if (inArc) {
                    // Damage enemy
                    enemy.takeDamage(this.damage);
                    
                    // Play hit sound
                    this.scene.sound.play('sound-hit', { volume: 0.2 });
                }
            }
        });
    }
    
    /**
     * Upgrade the weapon
     * @param {string} upgradeType - Type of upgrade
     */
    upgrade(upgradeType) {
        // Call parent upgrade method
        const result = super.upgrade(upgradeType);
        
        if (result) {
            // Handle whip-specific upgrades
            const upgradeValue = this.getNextUpgradeValue(upgradeType);
            
            switch (upgradeType) {
                case 'arc':
                    this.arc += upgradeValue;
                    break;
                case 'range':
                    this.range += upgradeValue;
                    break;
            }
        }
        
        return result;
    }
    
    /**
     * Get weapon data for saving
     * @returns {Object} Weapon data
     */
    getData() {
        const data = super.getData();
        
        // Add whip-specific properties
        data.arc = this.arc;
        data.range = this.range;
        
        return data;
    }
    
    /**
     * Load weapon data
     * @param {Object} data - Weapon data
     */
    loadData(data) {
        super.loadData(data);
        
        // Load whip-specific properties
        this.arc = data.arc;
        this.range = data.range;
    }
} 