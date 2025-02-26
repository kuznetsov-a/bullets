// Hammer Weapon class
class HammerWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, 'hammer');
        
        // Set up hammer properties
        this.rotationSpeed = this.config.rotationSpeed;
        this.distance = this.config.distance;
        this.angle = 0;
        
        // Create hammer head
        this.hammerHead = scene.physics.add.sprite(0, 0, 'hammer');
        this.hammerHead.setActive(true);
        this.hammerHead.setVisible(false); // We'll draw it manually
        
        // Set up hammer head physics
        this.hammerHead.setCircle(15);
        
        // Track enemies that have been hit in current swing
        this.hitEnemies = new Set();
    }
    
    // Update method called every frame
    update() {
        // Update hammer position
        this.updateHammerPosition();
        
        // Draw hammer
        this.drawHammer();
        
        // Check for collisions with enemies
        this.checkCollisions();
        
        // Call parent update for firing logic
        super.update();
    }
    
    // Update hammer position based on rotation
    updateHammerPosition() {
        // Update angle
        this.angle += this.rotationSpeed * this.scene.game.loop.delta;
        
        // Calculate new position
        const x = this.player.x + Math.cos(this.angle) * this.distance;
        const y = this.player.y + Math.sin(this.angle) * this.distance;
        
        // Update hammer head position
        this.hammerHead.setPosition(x, y);
    }
    
    // Draw hammer graphics
    drawHammer() {
        this.graphics.clear();
        
        // Draw hammer head (circle)
        this.graphics.fillStyle(0xaaaaaa);
        this.graphics.fillCircle(this.hammerHead.x, this.hammerHead.y, 15);
        
        // Draw hammer handle (line from player to hammer head)
        this.graphics.lineStyle(5, 0x8B4513);
        this.graphics.lineBetween(
            this.player.x, this.player.y,
            this.hammerHead.x, this.hammerHead.y
        );
    }
    
    // Check for collisions with enemies
    checkCollisions() {
        // Get all active enemies
        const enemies = this.scene.enemyPools ? 
            Object.values(this.scene.enemyPools)
                .flatMap(pool => pool.getActiveObjects()) : 
            [];
        
        // Check each enemy for collision with hammer head
        enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                this.hammerHead.x, this.hammerHead.y,
                enemy.x, enemy.y
            );
            
            // If enemy is hit by hammer and hasn't been hit in this swing
            const hitRadius = 15 + enemy.body.radius;
            if (distance <= hitRadius && !this.hitEnemies.has(enemy)) {
                enemy.takeDamage(this.damage);
                
                // Add to hit enemies set
                this.hitEnemies.add(enemy);
                
                // Visual feedback for hit
                this.scene.tweens.add({
                    targets: enemy,
                    alpha: 0.5,
                    duration: 100,
                    yoyo: true
                });
            }
        });
    }
    
    // Fire the weapon (resets hit enemies)
    fire() {
        // Reset hit enemies set
        this.hitEnemies.clear();
        
        // Call parent method to handle cooldown
        super.fire();
    }
    
    // Upgrade the weapon
    upgrade(upgradeType) {
        const result = super.upgrade(upgradeType);
        
        // Additional upgrade for rotation speed if cooldown is upgraded
        if (upgradeType === 'cooldown') {
            this.rotationSpeed *= 1.1;
        }
        
        // Additional upgrade for distance if damage is upgraded
        if (upgradeType === 'damage') {
            this.distance += 5;
        }
        
        return result;
    }
    
    // Clean up resources
    destroy() {
        if (this.hammerHead) {
            this.hammerHead.destroy();
        }
        super.destroy();
    }
} 