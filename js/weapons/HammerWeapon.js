/**
 * HammerWeapon - Rotates around the player, damaging enemies on contact
 */
class HammerWeapon extends Weapon {
    /**
     * Create a new hammer weapon
     * @param {Phaser.Scene} scene - The scene the weapon belongs to
     * @param {Player} player - The player that owns this weapon
     */
    constructor(scene, player) {
        super(scene, player, 'HAMMER');
        
        // Hammer-specific properties
        this.radius = this.config.radius;
        this.rotationSpeed = this.config.rotationSpeed;
        this.count = 1; // Number of hammers
        
        // Create hammer sprites
        this.sprites = [];
        this.createHammers();
        
        // Rotation angle
        this.angle = 0;
        
        // Enemies hit recently (to prevent multiple hits)
        this.hitEnemies = new Map(); // enemy -> time last hit
    }
    
    /**
     * Create hammer sprites
     */
    createHammers() {
        // Clear existing sprites
        this.sprites.forEach(sprite => sprite.destroy());
        this.sprites = [];
        
        // Create new sprites
        for (let i = 0; i < this.count; i++) {
            const sprite = this.scene.add.sprite(0, 0, 'hammer');
            sprite.setDepth(6);
            this.sprites.push(sprite);
        }
    }
    
    /**
     * Update weapon logic
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Update rotation angle
        this.angle += this.rotationSpeed * (delta / 1000);
        
        // Update hammer positions
        this.updateHammerPositions();
        
        // Check for collisions with enemies
        this.checkCollisions(time);
        
        // Clean up hit enemies map (remove entries older than 500ms)
        this.hitEnemies.forEach((hitTime, enemy) => {
            if (time - hitTime > 500) {
                this.hitEnemies.delete(enemy);
            }
        });
    }
    
    /**
     * Update hammer positions based on rotation angle
     */
    updateHammerPositions() {
        const angleStep = (Math.PI * 2) / this.count;
        
        this.sprites.forEach((sprite, index) => {
            const hammerAngle = this.angle + (angleStep * index);
            
            // Calculate position
            const x = this.player.sprite.x + Math.cos(hammerAngle) * this.radius;
            const y = this.player.sprite.y + Math.sin(hammerAngle) * this.radius;
            
            // Update position and rotation
            sprite.setPosition(x, y);
            sprite.rotation = hammerAngle + Math.PI / 2; // Adjust for sprite orientation
        });
    }
    
    /**
     * Check for collisions with enemies
     * @param {number} time - Current time
     */
    checkCollisions(time) {
        // Get all active enemies
        const enemies = [];
        for (const type in this.scene.enemyPools) {
            this.scene.enemyPools[type].getActiveObjects().forEach(enemy => {
                enemies.push(enemy);
            });
        }
        
        // Check each hammer against each enemy
        this.sprites.forEach(sprite => {
            enemies.forEach(enemy => {
                // Skip if enemy was hit recently
                if (this.hitEnemies.has(enemy) && time - this.hitEnemies.get(enemy) < 500) {
                    return;
                }
                
                // Check distance
                const distance = Phaser.Math.Distance.Between(
                    sprite.x, sprite.y,
                    enemy.sprite.x, enemy.sprite.y
                );
                
                // If close enough, damage enemy
                if (distance <= 40) { // Assuming hammer and enemy both have ~20px radius
                    enemy.takeDamage(this.damage);
                    this.hitEnemies.set(enemy, time);
                    
                    // Play hit sound
                    this.scene.sound.play('sound-hit', { volume: 0.2 });
                    
                    // Visual effect
                    this.scene.tweens.add({
                        targets: sprite,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 100,
                        yoyo: true
                    });
                }
            });
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
            // Handle hammer-specific upgrades
            const upgradeValue = this.getNextUpgradeValue(upgradeType);
            
            switch (upgradeType) {
                case 'radius':
                    this.radius += upgradeValue;
                    break;
                case 'rotationSpeed':
                    this.rotationSpeed += upgradeValue;
                    break;
                case 'count':
                    this.count += upgradeValue;
                    this.createHammers();
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
        
        // Add hammer-specific properties
        data.radius = this.radius;
        data.rotationSpeed = this.rotationSpeed;
        data.count = this.count;
        
        return data;
    }
    
    /**
     * Load weapon data
     * @param {Object} data - Weapon data
     */
    loadData(data) {
        super.loadData(data);
        
        // Load hammer-specific properties
        this.radius = data.radius;
        this.rotationSpeed = data.rotationSpeed;
        this.count = data.count;
        
        // Recreate hammers
        this.createHammers();
    }
} 