/**
 * BulletWeapon - Fires projectiles in a set direction
 */
class BulletWeapon extends Weapon {
    /**
     * Create a new bullet weapon
     * @param {Phaser.Scene} scene - The scene the weapon belongs to
     * @param {Player} player - The player that owns this weapon
     */
    constructor(scene, player) {
        super(scene, player, 'BULLET');
        
        // Bullet-specific properties
        this.speed = this.config.speed;
        this.range = this.config.range;
        this.count = 1; // Number of bullets to fire at once
    }
    
    /**
     * Fire the weapon
     * @param {number} time - Current time
     */
    fire(time) {
        super.fire(time);
        
        // Play sound
        this.scene.sound.play('sound-shoot', { volume: 0.2 });
        
        // Get player position
        const x = this.player.sprite.x;
        const y = this.player.sprite.y;
        
        // Calculate firing angle(s)
        const angles = this.calculateFiringAngles();
        
        // Fire bullets
        angles.forEach(angle => {
            // Calculate velocity
            const velocityX = Math.cos(angle) * this.speed;
            const velocityY = Math.sin(angle) * this.speed;
            
            // Get bullet from pool
            const bullet = this.scene.projectilePools.BULLET.get(x, y, velocityX, velocityY);
            
            // Set bullet properties
            bullet.damage = this.damage;
            bullet.lifespan = this.range / this.speed * 1000; // Convert to ms
            bullet.born = time;
            
            // Add to projectile group
            this.scene.projectileGroup.add(bullet);
            
            // Set up auto-destroy after range is reached
            this.scene.time.delayedCall(bullet.lifespan, () => {
                if (bullet.active) {
                    this.scene.projectilePools.BULLET.release(bullet);
                    bullet.setActive(false).setVisible(false);
                }
            });
        });
    }
    
    /**
     * Calculate firing angles based on bullet count
     * @returns {Array} Array of angles in radians
     */
    calculateFiringAngles() {
        const angles = [];
        
        // Get mouse position or touch position
        let targetX, targetY;
        
        if (this.scene.isMobile()) {
            // For mobile, fire in the direction of movement
            const vx = this.player.sprite.body.velocity.x;
            const vy = this.player.sprite.body.velocity.y;
            
            // If not moving, fire in random direction
            if (vx === 0 && vy === 0) {
                const randomAngle = Math.random() * Math.PI * 2;
                targetX = this.player.sprite.x + Math.cos(randomAngle);
                targetY = this.player.sprite.y + Math.sin(randomAngle);
            } else {
                // Fire in direction of movement
                targetX = this.player.sprite.x + vx;
                targetY = this.player.sprite.y + vy;
            }
        } else {
            // For desktop, fire towards mouse
            const pointer = this.scene.input.activePointer;
            targetX = pointer.worldX;
            targetY = pointer.worldY;
        }
        
        // Calculate base angle
        const dx = targetX - this.player.sprite.x;
        const dy = targetY - this.player.sprite.y;
        const baseAngle = Math.atan2(dy, dx);
        
        // If only one bullet, fire straight
        if (this.count === 1) {
            angles.push(baseAngle);
            return angles;
        }
        
        // For multiple bullets, spread them out
        const spread = Math.PI / 8; // 22.5 degrees
        const step = (spread * 2) / (this.count - 1);
        
        for (let i = 0; i < this.count; i++) {
            const angle = baseAngle - spread + (step * i);
            angles.push(angle);
        }
        
        return angles;
    }
    
    /**
     * Upgrade the weapon
     * @param {string} upgradeType - Type of upgrade
     */
    upgrade(upgradeType) {
        // Call parent upgrade method
        const result = super.upgrade(upgradeType);
        
        if (result) {
            // Handle bullet-specific upgrades
            const upgradeValue = this.getNextUpgradeValue(upgradeType);
            
            switch (upgradeType) {
                case 'speed':
                    this.speed += upgradeValue;
                    break;
                case 'range':
                    this.range += upgradeValue;
                    break;
                case 'count':
                    this.count += upgradeValue;
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
        
        // Add bullet-specific properties
        data.speed = this.speed;
        data.range = this.range;
        data.count = this.count;
        
        return data;
    }
    
    /**
     * Load weapon data
     * @param {Object} data - Weapon data
     */
    loadData(data) {
        super.loadData(data);
        
        // Load bullet-specific properties
        this.speed = data.speed;
        this.range = data.range;
        this.count = data.count;
    }
} 