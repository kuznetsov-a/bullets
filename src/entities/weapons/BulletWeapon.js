// Bullet Weapon class
class BulletWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, 'bullet');
        
        // Create bullet group
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true
        });
        
        // Set firing angle (random initial direction)
        this.angle = Phaser.Math.Between(0, 360);
    }
    
    // Fire the weapon
    fire() {
        // Create a bullet
        const bullet = this.bullets.get(this.player.x, this.player.y);
        
        if (bullet) {
            // Initialize bullet
            bullet.fire(this.player.x, this.player.y, this.angle, this.config.projectileSpeed, this.damage);
            
            // Rotate firing angle slightly for next shot (spiral pattern)
            this.angle = (this.angle + 15) % 360;
            
            // Draw firing effect
            this.drawFiringEffect();
        }
        
        // Call parent method to handle cooldown
        super.fire();
    }
    
    // Draw firing effect
    drawFiringEffect() {
        this.graphics.clear();
        
        // Draw muzzle flash
        const flashRadius = 10;
        const flashX = this.player.x + Math.cos(Phaser.Math.DegToRad(this.angle)) * (this.player.size / 2);
        const flashY = this.player.y + Math.sin(Phaser.Math.DegToRad(this.angle)) * (this.player.size / 2);
        
        this.graphics.fillStyle(0xffff00, 0.8);
        this.graphics.fillCircle(flashX, flashY, flashRadius);
        
        // Fade out effect
        this.scene.tweens.add({
            targets: this.graphics,
            alpha: 0,
            duration: 100,
            onComplete: () => {
                this.graphics.clear();
                this.graphics.alpha = 1;
            }
        });
    }
    
    // Clean up resources
    destroy() {
        this.bullets.clear(true, true);
        super.destroy();
    }
}

// Bullet class
class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        
        // Add to scene
        scene.add.existing(this);
        
        // Set up bullet properties
        this.speed = 0;
        this.damage = 0;
        this.lifespan = 0;
        this.range = CONFIG.weapons.types.bullet.range;
        
        // Set up bullet graphics (SVG-style circle)
        this.bulletGraphics = scene.add.graphics();
    }
    
    // Fire the bullet
    fire(x, y, angle, speed, damage) {
        this.setActive(true);
        this.setVisible(true);
        
        // Set position
        this.setPosition(x, y);
        
        // Set properties
        this.speed = speed;
        this.damage = damage;
        
        // Set velocity based on angle
        const vx = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
        const vy = Math.sin(Phaser.Math.DegToRad(angle)) * speed;
        this.setVelocity(vx, vy);
        
        // Set rotation to match direction
        this.setRotation(Phaser.Math.DegToRad(angle));
        
        // Set lifespan based on range and speed
        this.lifespan = this.range / speed * 1000; // Convert to milliseconds
        
        // Draw bullet
        this.drawBullet();
    }
    
    // Draw bullet graphics
    drawBullet() {
        this.bulletGraphics.clear();
        
        // Draw bullet (yellow circle)
        this.bulletGraphics.fillStyle(0xffff00);
        this.bulletGraphics.fillCircle(this.x, this.y, 5);
        
        // Draw trail
        this.bulletGraphics.fillStyle(0xffff00, 0.5);
        const trailLength = 10;
        const trailX = this.x - Math.cos(this.rotation) * trailLength;
        const trailY = this.y - Math.sin(this.rotation) * trailLength;
        this.bulletGraphics.fillCircle(trailX, trailY, 3);
    }
    
    // Update method called every frame
    update(time, delta) {
        // Update lifespan
        this.lifespan -= delta;
        
        // Deactivate if lifespan is over
        if (this.lifespan <= 0) {
            this.setActive(false);
            this.setVisible(false);
            this.bulletGraphics.clear();
            return;
        }
        
        // Update graphics
        this.drawBullet();
    }
} 