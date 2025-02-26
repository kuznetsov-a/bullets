// Whip Weapon class
class WhipWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, 'whip');
        
        // Set up whip properties
        this.arcAngle = this.config.arcAngle;
        this.range = this.config.range;
        this.swingAngle = 0;
        this.swinging = false;
        
        // Animation properties
        this.swingDuration = 300; // ms
        this.swingStartTime = 0;
        this.swingDirection = 1; // 1 for clockwise, -1 for counter-clockwise
        
        // Track enemies that have been hit in current swing
        this.hitEnemies = new Set();
    }
    
    // Fire the weapon
    fire() {
        if (!this.swinging) {
            // Start a new swing
            this.swinging = true;
            this.swingStartTime = this.scene.time.now;
            
            // Choose a random direction to face (towards a random enemy or random direction)
            this.chooseSwingDirection();
            
            // Reset hit enemies
            this.hitEnemies.clear();
            
            // Call parent method to handle cooldown
            super.fire();
        }
    }
    
    // Choose direction to swing (towards nearest enemy or random)
    chooseSwingDirection() {
        // Get all active enemies
        const enemies = this.scene.enemyPools ? 
            Object.values(this.scene.enemyPools)
                .flatMap(pool => pool.getActiveObjects()) : 
            [];
        
        // Find the nearest enemy
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        // Set swing angle based on nearest enemy or random
        if (nearestEnemy && nearestDistance <= this.range * 1.5) {
            // Face towards the nearest enemy
            this.swingAngle = Phaser.Math.Angle.Between(
                this.player.x, this.player.y,
                nearestEnemy.x, nearestEnemy.y
            );
        } else {
            // Choose a random angle
            this.swingAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        }
        
        // Alternate swing direction
        this.swingDirection *= -1;
    }
    
    // Update method called every frame
    update() {
        // Handle swing animation and collision detection
        if (this.swinging) {
            this.updateSwing();
        }
        
        // Call parent update for firing logic
        super.update();
    }
    
    // Update swing animation and check for collisions
    updateSwing() {
        const elapsed = this.scene.time.now - this.swingStartTime;
        const progress = Math.min(elapsed / this.swingDuration, 1);
        
        // Calculate current angle of the swing
        const halfArcAngle = Phaser.Math.DegToRad(this.arcAngle / 2);
        const currentAngle = this.swingAngle + 
            this.swingDirection * Phaser.Math.Easing.Sine.InOut(progress) * halfArcAngle;
        
        // Draw whip
        this.drawWhip(currentAngle, progress);
        
        // Check for collisions
        this.checkCollisions(currentAngle, progress);
        
        // End swing when animation is complete
        if (progress >= 1) {
            this.swinging = false;
        }
    }
    
    // Draw whip graphics
    drawWhip(angle, progress) {
        this.graphics.clear();
        
        // Calculate whip points
        const segments = 10;
        const points = [];
        
        // Start at player position
        points.push({ x: this.player.x, y: this.player.y });
        
        // Calculate whip curve
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const segmentLength = this.range * t;
            
            // Add some curve to the whip
            const curveOffset = Math.sin(t * Math.PI) * 20 * this.swingDirection;
            const curveAngle = angle + Phaser.Math.DegToRad(curveOffset);
            
            const x = this.player.x + Math.cos(curveAngle) * segmentLength;
            const y = this.player.y + Math.sin(curveAngle) * segmentLength;
            
            points.push({ x, y });
        }
        
        // Draw whip segments with gradient color
        for (let i = 0; i < points.length - 1; i++) {
            const t = i / (points.length - 1);
            const width = 8 * (1 - t); // Thinner towards the tip
            const alpha = 0.8 - 0.6 * t; // More transparent towards the tip
            
            this.graphics.lineStyle(width, 0xffffff, alpha);
            this.graphics.lineBetween(
                points[i].x, points[i].y,
                points[i + 1].x, points[i + 1].y
            );
        }
        
        // Draw whip tip (small circle)
        const tip = points[points.length - 1];
        this.graphics.fillStyle(0xffffff, 0.9);
        this.graphics.fillCircle(tip.x, tip.y, 4);
        
        // Add swing effect (motion blur)
        if (progress > 0.1 && progress < 0.9) {
            const blurAlpha = 0.2;
            const blurAngle = angle - this.swingDirection * halfArcAngle * 0.2;
            const blurX = this.player.x + Math.cos(blurAngle) * this.range;
            const blurY = this.player.y + Math.sin(blurAngle) * this.range;
            
            this.graphics.lineStyle(2, 0xffffff, blurAlpha);
            this.graphics.lineBetween(this.player.x, this.player.y, blurX, blurY);
        }
    }
    
    // Check for collisions with enemies
    checkCollisions(angle, progress) {
        // Only check collisions during the middle of the swing
        if (progress < 0.2 || progress > 0.8) return;
        
        // Get all active enemies
        const enemies = this.scene.enemyPools ? 
            Object.values(this.scene.enemyPools)
                .flatMap(pool => pool.getActiveObjects()) : 
            [];
        
        // Calculate whip tip position
        const tipX = this.player.x + Math.cos(angle) * this.range;
        const tipY = this.player.y + Math.sin(angle) * this.range;
        
        // Check each enemy for collision with whip
        enemies.forEach(enemy => {
            if (!enemy.active || this.hitEnemies.has(enemy)) return;
            
            // Check if enemy is within the arc of the swing
            const enemyAngle = Phaser.Math.Angle.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            
            const angleDiff = Phaser.Math.Angle.Wrap(enemyAngle - this.swingAngle);
            const halfArcRad = Phaser.Math.DegToRad(this.arcAngle / 2);
            
            if (Math.abs(angleDiff) <= halfArcRad) {
                // Check if enemy is within range
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );
                
                if (distance <= this.range) {
                    // Check if enemy is near the whip line
                    const distToLine = Phaser.Geom.Line.DistanceToPoint(
                        new Phaser.Geom.Line(this.player.x, this.player.y, tipX, tipY),
                        new Phaser.Geom.Point(enemy.x, enemy.y)
                    );
                    
                    if (distToLine <= enemy.body.radius + 10) {
                        // Hit the enemy
                        enemy.takeDamage(this.damage);
                        this.hitEnemies.add(enemy);
                        
                        // Visual feedback for hit
                        this.scene.tweens.add({
                            targets: enemy,
                            alpha: 0.5,
                            duration: 100,
                            yoyo: true
                        });
                    }
                }
            }
        });
    }
    
    // Upgrade the weapon
    upgrade(upgradeType) {
        const result = super.upgrade(upgradeType);
        
        // Additional upgrade for arc angle if cooldown is upgraded
        if (upgradeType === 'cooldown') {
            this.arcAngle = Math.min(this.arcAngle + 10, 270);
        }
        
        // Additional upgrade for range if damage is upgraded
        if (upgradeType === 'damage') {
            this.range += 10;
        }
        
        return result;
    }
} 