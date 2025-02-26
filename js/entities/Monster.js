/**
 * Monster - Base class for all enemy types
 */
class Monster {
    /**
     * Create a new monster
     * @param {Phaser.Scene} scene - The scene the monster belongs to
     * @param {string} type - Monster type from CONFIG.ENEMIES
     */
    constructor(scene, type) {
        this.scene = scene;
        this.type = type;
        this.config = CONFIG.ENEMIES[type];
        
        // Create sprite based on type
        const texture = `enemy-${this.config.name.toLowerCase()}`;
        this.sprite = scene.physics.add.sprite(0, 0, texture);
        this.sprite.setActive(false).setVisible(false);
        
        // Set up physics body
        this.sprite.body.setSize(40, 40);
        this.sprite.setScale(this.config.scale);
        
        // Monster stats
        this.hp = this.config.hp;
        this.speed = this.config.speed;
        this.damage = this.config.damage;
        this.xp = this.config.xp;
        
        // For shooter type
        this.lastFireTime = 0;
        this.fireRate = this.config.fireRate || 0;
    }
    
    /**
     * Reset monster for reuse from object pool
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    reset(x, y) {
        // Reset position
        this.sprite.setPosition(x, y);
        this.sprite.setActive(true).setVisible(true);
        
        // Reset stats
        this.hp = this.config.hp;
        
        // Reset shooter timer
        if (this.type === 'SHOOTER') {
            this.lastFireTime = 0;
        }
    }
    
    /**
     * Update monster logic
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Skip if not active
        if (!this.sprite.active) return;
        
        // Get player position
        const player = this.scene.player.sprite;
        
        // Calculate direction to player
        const dx = player.x - this.sprite.x;
        const dy = player.y - this.sprite.y;
        
        // Normalize direction
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only move if player is within a certain range (optimization)
        if (distance < 1000) {
            // Move towards player
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Set velocity
            this.sprite.setVelocity(
                dirX * this.speed,
                dirY * this.speed
            );
            
            // For shooter type, fire at player
            if (this.type === 'SHOOTER' && distance < 500) {
                this.tryFireAtPlayer(time);
            }
        } else {
            // Stop moving if player is too far
            this.sprite.setVelocity(0, 0);
        }
        
        // Rotate to face player
        this.sprite.rotation = Math.atan2(dy, dx);
    }
    
    /**
     * Apply damage to the monster
     * @param {number} amount - Amount of damage to apply
     */
    takeDamage(amount) {
        this.hp -= amount;
        
        // Flash the sprite
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.5,
            duration: 50,
            yoyo: true
        });
        
        // Check if dead
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    /**
     * Handle monster death
     */
    die() {
        // Find the pool this monster belongs to
        const pool = this.scene.enemyPools[this.type];
        
        // Return to pool
        if (pool) {
            pool.release(this);
        }
        
        // Deactivate sprite
        this.sprite.setActive(false).setVisible(false);
    }
    
    /**
     * Try to fire a projectile at the player (for shooter type)
     * @param {number} time - Current time
     */
    tryFireAtPlayer(time) {
        // Only for shooter type
        if (this.type !== 'SHOOTER') return;
        
        // Check cooldown
        if (time - this.lastFireTime < this.fireRate) return;
        
        // Update last fire time
        this.lastFireTime = time;
        
        // Get player position
        const player = this.scene.player.sprite;
        
        // Calculate direction to player
        const dx = player.x - this.sprite.x;
        const dy = player.y - this.sprite.y;
        
        // Normalize direction
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            this.sprite.x,
            this.sprite.y,
            'enemy-projectile'
        );
        
        // Set up projectile
        projectile.setVelocity(
            dirX * this.config.projectileSpeed,
            dirY * this.config.projectileSpeed
        );
        
        projectile.damage = this.config.projectileDamage;
        
        // Add to projectile group
        this.scene.projectileGroup.add(projectile);
        
        // Set up collision with player
        this.scene.physics.add.overlap(
            projectile,
            this.scene.player.sprite,
            (proj, player) => {
                // Apply damage to player
                this.scene.player.takeDamage(proj.damage);
                
                // Destroy projectile
                proj.destroy();
            }
        );
        
        // Set up collision with obstacles
        this.scene.physics.add.collider(
            projectile,
            this.scene.obstacleGroup,
            (proj) => {
                // Destroy projectile
                proj.destroy();
            }
        );
        
        // Destroy after time
        this.scene.time.delayedCall(3000, () => {
            if (projectile.active) {
                projectile.destroy();
            }
        });
    }
} 