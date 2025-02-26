/**
 * AuraWeapon - Deals continuous damage in an area around the player
 */
class AuraWeapon extends Weapon {
    /**
     * Create a new aura weapon
     * @param {Phaser.Scene} scene - The scene the weapon belongs to
     * @param {Player} player - The player that owns this weapon
     */
    constructor(scene, player) {
        super(scene, player, 'AURA');
        
        // Aura-specific properties
        this.radius = this.config.radius;
        
        // Create aura sprite
        this.sprite = scene.add.sprite(0, 0, 'aura');
        this.sprite.setAlpha(0.5);
        this.sprite.setScale(this.radius / 100); // Assuming aura texture is 200x200
        this.sprite.setDepth(5);
        
        // Enemies hit in the last firing
        this.hitEnemies = new Set();
    }
    
    /**
     * Update weapon logic
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Update aura position to follow player
        this.sprite.setPosition(this.player.sprite.x, this.player.sprite.y);
        
        // Check if we can fire
        if (this.canFire(time)) {
            this.fire(time);
        }
    }
    
    /**
     * Fire the weapon
     * @param {number} time - Current time
     */
    fire(time) {
        super.fire(time);
        
        // Clear hit enemies set
        this.hitEnemies.clear();
        
        // Get all active enemies
        const enemies = [];
        for (const type in this.scene.enemyPools) {
            this.scene.enemyPools[type].getActiveObjects().forEach(enemy => {
                enemies.push(enemy);
            });
        }
        
        // Check each enemy for distance
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                enemy.sprite.x, enemy.sprite.y
            );
            
            // If within radius, damage enemy
            if (distance <= this.radius) {
                enemy.takeDamage(this.damage);
                this.hitEnemies.add(enemy);
            }
        });
        
        // Visual effect
        if (this.hitEnemies.size > 0) {
            // Flash aura
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.8,
                duration: 100,
                yoyo: true
            });
            
            // Play sound
            this.scene.sound.play('sound-hit', { volume: 0.1 });
        }
    }
    
    /**
     * Upgrade the weapon
     * @param {string} upgradeType - Type of upgrade
     */
    upgrade(upgradeType) {
        // Call parent upgrade method
        const result = super.upgrade(upgradeType);
        
        if (result) {
            // Handle aura-specific upgrades
            const upgradeValue = this.getNextUpgradeValue(upgradeType);
            
            switch (upgradeType) {
                case 'radius':
                    this.radius += upgradeValue;
                    this.sprite.setScale(this.radius / 100);
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
        
        // Add aura-specific properties
        data.radius = this.radius;
        
        return data;
    }
    
    /**
     * Load weapon data
     * @param {Object} data - Weapon data
     */
    loadData(data) {
        super.loadData(data);
        
        // Load aura-specific properties
        this.radius = data.radius;
        this.sprite.setScale(this.radius / 100);
    }
} 