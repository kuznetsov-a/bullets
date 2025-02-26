// Base Monster class
class Monster extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'monster');
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up monster properties (will be initialized in init())
        this.health = 0;
        this.maxHealth = 0;
        this.damage = 0;
        this.speed = 0;
        this.size = 0;
        this.color = 0xffffff;
        this.type = '';
        this.xpValue = 0;
        
        // Set up monster graphics
        this.monsterGraphics = scene.add.graphics();
        
        // Set up physics body
        this.setCircle(16); // Default size, will be updated in init()
        this.setBounce(0.5);
        this.setCollideWorldBounds(true);
        
        // Set inactive by default
        this.setActive(false);
        this.setVisible(false);
    }
    
    // Initialize monster with specific type
    init(config) {
        // Set monster type
        this.type = config.type;
        
        // Get monster config
        const monsterConfig = CONFIG.enemies.types[this.type];
        
        // Set properties from config
        this.health = monsterConfig.health;
        this.maxHealth = monsterConfig.health;
        this.damage = monsterConfig.damage;
        this.speed = monsterConfig.speed;
        this.size = monsterConfig.size;
        this.color = monsterConfig.color;
        this.xpValue = monsterConfig.xp;
        
        // Update physics body size
        this.body.setCircle(this.size / 2);
        
        // Reset any existing movement
        this.setVelocity(0, 0);
        
        // Draw monster graphics
        this.updateMonsterGraphics();
        
        // For shooter type, set up shooting timer
        if (this.type === 'shooter') {
            this.shootCooldown = monsterConfig.shootCooldown;
            this.lastShot = 0;
            this.projectileSpeed = monsterConfig.projectileSpeed;
        }
        
        return this;
    }
    
    // Update monster graphics
    updateMonsterGraphics() {
        this.monsterGraphics.clear();
        
        // Draw monster body
        this.monsterGraphics.fillStyle(this.color);
        this.monsterGraphics.fillCircle(this.x, this.y, this.size / 2);
        
        // Draw health bar
        const healthPercent = this.health / this.maxHealth;
        const barWidth = this.size;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.size / 2 - 10;
        
        // Background
        this.monsterGraphics.fillStyle(0x000000, 0.5);
        this.monsterGraphics.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        this.monsterGraphics.fillStyle(0x00ff00);
        this.monsterGraphics.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Add type-specific details
        switch (this.type) {
            case 'walker':
                // Simple walker has no special graphics
                break;
                
            case 'charger':
                // Charger has a pointed front
                const angle = this.body.velocity.length() > 10 ? 
                    Math.atan2(this.body.velocity.y, this.body.velocity.x) : 0;
                
                const pointX = this.x + Math.cos(angle) * (this.size / 2);
                const pointY = this.y + Math.sin(angle) * (this.size / 2);
                
                this.monsterGraphics.fillStyle(0xffff00);
                this.monsterGraphics.fillCircle(pointX, pointY, 5);
                break;
                
            case 'tank':
                // Tank has a shield-like outer ring
                this.monsterGraphics.lineStyle(3, 0x0000ff, 0.8);
                this.monsterGraphics.strokeCircle(this.x, this.y, this.size / 2 + 3);
                break;
                
            case 'shooter':
                // Shooter has a targeting reticle
                this.monsterGraphics.lineStyle(1, 0x00ff00, 0.8);
                this.monsterGraphics.strokeCircle(this.x, this.y, this.size / 2 + 5);
                
                // Draw crosshairs
                this.monsterGraphics.lineStyle(1, 0x00ff00, 0.6);
                this.monsterGraphics.lineBetween(
                    this.x - 10, this.y,
                    this.x + 10, this.y
                );
                this.monsterGraphics.lineBetween(
                    this.x, this.y - 10,
                    this.x, this.y + 10
                );
                break;
        }
    }
    
    // Take damage
    takeDamage(amount) {
        this.health -= amount;
        
        // Check if monster is defeated
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        // Update graphics to show new health
        this.updateMonsterGraphics();
        return false;
    }
    
    // Monster death
    die() {
        // Award XP to player
        if (this.scene.player) {
            const leveledUp = this.scene.player.addXP(this.xpValue);
            
            // If player leveled up, we don't need to do anything else
            // as the level up scene will handle pausing the game
            if (leveledUp) {
                this.cleanup();
                return;
            }
        }
        
        // Increment kill counter
        this.scene.enemiesKilled++;
        
        // Check for power-up spawn
        if (this.scene.enemiesKilled % CONFIG.powerUps.spawnRate === 0) {
            this.scene.spawnPowerUp(this.x, this.y);
        }
        
        // Death animation
        this.scene.tweens.add({
            targets: this.monsterGraphics,
            alpha: 0,
            scale: 1.5,
            duration: 200,
            onComplete: () => {
                this.cleanup();
            }
        });
    }
    
    // Clean up resources
    cleanup() {
        this.monsterGraphics.clear();
        this.setActive(false);
        this.setVisible(false);
        this.body.reset(0, 0);
    }
    
    // Update method called every frame
    update() {
        if (!this.active) return;
        
        // Move towards player
        this.moveTowardsPlayer();
        
        // Handle type-specific behavior
        this.handleTypeBehavior();
        
        // Update graphics
        this.updateMonsterGraphics();
    }
    
    // Move towards the player
    moveTowardsPlayer() {
        if (!this.scene.player || !this.scene.player.active) return;
        
        // Calculate direction to player
        const dx = this.scene.player.x - this.x;
        const dy = this.scene.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only move if not too close to player
        if (distance > this.size / 2 + this.scene.player.size / 2) {
            // Normalize direction and apply speed
            const vx = dx / distance * this.speed;
            const vy = dy / distance * this.speed;
            
            this.setVelocity(vx, vy);
        } else {
            // We've collided with the player, deal damage
            this.scene.player.takeDamage(this.damage * (this.scene.game.loop.delta / 1000));
        }
    }
    
    // Handle type-specific behavior
    handleTypeBehavior() {
        switch (this.type) {
            case 'charger':
                // Charger moves faster when farther from player
                const distance = Phaser.Math.Distance.Between(
                    this.x, this.y,
                    this.scene.player.x, this.scene.player.y
                );
                
                const speedMultiplier = Math.min(distance / 200, 2);
                this.body.velocity.scale(speedMultiplier);
                break;
                
            case 'shooter':
                // Shooter fires projectiles at player
                this.handleShooterBehavior();
                break;
                
            case 'tank':
                // Tank is slower but takes more damage
                // (This is handled by the config values)
                break;
        }
    }
    
    // Handle shooter-specific behavior
    handleShooterBehavior() {
        if (!this.scene.player || !this.scene.player.active) return;
        
        const now = this.scene.time.now;
        
        // Check if it's time to shoot
        if (now - this.lastShot >= this.shootCooldown) {
            this.shoot();
            this.lastShot = now;
        }
    }
    
    // Shoot a projectile at the player
    shoot() {
        // Get a projectile from the pool
        if (!this.scene.enemyProjectiles) return;
        
        const projectile = this.scene.enemyProjectiles.get(this.x, this.y);
        
        if (projectile) {
            // Calculate direction to player
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                this.scene.player.x, this.scene.player.y
            );
            
            // Fire projectile
            projectile.fire(this.x, this.y, angle, this.projectileSpeed, this.damage);
            
            // Visual feedback for shooting
            this.scene.tweens.add({
                targets: this,
                alpha: 0.7,
                duration: 50,
                yoyo: true
            });
        }
    }
}

// Enemy Projectile class
class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemyProjectile');
        
        // Add to scene
        scene.add.existing(this);
        
        // Set up projectile properties
        this.speed = 0;
        this.damage = 0;
        this.lifespan = 2000; // 2 seconds
        
        // Set up projectile graphics
        this.projectileGraphics = scene.add.graphics();
        
        // Set up physics body
        this.body.setCircle(5);
        
        // Set inactive by default
        this.setActive(false);
        this.setVisible(false);
    }
    
    // Fire the projectile
    fire(x, y, angle, speed, damage) {
        this.setActive(true);
        this.setVisible(true);
        
        // Set position
        this.setPosition(x, y);
        
        // Set properties
        this.speed = speed;
        this.damage = damage;
        this.lifespan = 2000;
        
        // Set velocity based on angle
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.setVelocity(vx, vy);
        
        // Set rotation to match direction
        this.setRotation(angle);
        
        // Draw projectile
        this.drawProjectile();
    }
    
    // Draw projectile graphics
    drawProjectile() {
        this.projectileGraphics.clear();
        
        // Draw projectile (red circle)
        this.projectileGraphics.fillStyle(0xff0000);
        this.projectileGraphics.fillCircle(this.x, this.y, 5);
    }
    
    // Update method called every frame
    update(time, delta) {
        // Update lifespan
        this.lifespan -= delta;
        
        // Deactivate if lifespan is over
        if (this.lifespan <= 0) {
            this.setActive(false);
            this.setVisible(false);
            this.projectileGraphics.clear();
            return;
        }
        
        // Update graphics
        this.drawProjectile();
    }
} 