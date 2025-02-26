// Aura Weapon class
class AuraWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, 'aura');
        
        // Set up aura properties
        this.radius = this.config.radius;
        this.activeEnemies = new Set();
        
        // Pulse effect variables
        this.pulseSize = 0;
        this.pulseGrowing = true;
    }
    
    // Fire the weapon (applies damage to enemies in range)
    fire() {
        // Get all active enemies
        const enemies = this.scene.enemyPools ? 
            Object.values(this.scene.enemyPools)
                .flatMap(pool => pool.getActiveObjects()) : 
            [];
        
        // Clear active enemies set
        this.activeEnemies.clear();
        
        // Check each enemy for distance
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            
            // If enemy is in range, apply damage
            if (distance <= this.radius) {
                enemy.takeDamage(this.damage * (this.scene.game.loop.delta / 1000));
                this.activeEnemies.add(enemy);
            }
        });
        
        // Draw aura effect
        this.drawAuraEffect();
        
        // Call parent method to handle cooldown
        super.fire();
    }
    
    // Draw aura effect
    drawAuraEffect() {
        this.graphics.clear();
        
        // Update pulse effect
        if (this.pulseGrowing) {
            this.pulseSize += 0.5;
            if (this.pulseSize >= 10) {
                this.pulseGrowing = false;
            }
        } else {
            this.pulseSize -= 0.5;
            if (this.pulseSize <= 0) {
                this.pulseGrowing = true;
            }
        }
        
        // Draw main aura circle
        this.graphics.fillStyle(0x00ffff, 0.2);
        this.graphics.fillCircle(this.player.x, this.player.y, this.radius);
        
        // Draw aura border
        this.graphics.lineStyle(2, 0x00ffff, 0.8);
        this.graphics.strokeCircle(this.player.x, this.player.y, this.radius);
        
        // Draw pulse effect
        this.graphics.lineStyle(3, 0x00ffff, 0.5);
        this.graphics.strokeCircle(this.player.x, this.player.y, this.radius - this.pulseSize);
        
        // Draw connections to affected enemies
        this.graphics.lineStyle(1, 0x00ffff, 0.4);
        this.activeEnemies.forEach(enemy => {
            this.graphics.lineBetween(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
        });
    }
    
    // Upgrade the weapon
    upgrade(upgradeType) {
        const result = super.upgrade(upgradeType);
        
        // Additional upgrade for radius if damage is upgraded
        if (upgradeType === 'damage') {
            this.radius += 5;
        }
        
        return result;
    }
} 