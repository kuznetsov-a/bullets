// Spawner class for managing enemy spawning
class Spawner {
    constructor(scene) {
        this.scene = scene;
        
        // Set up spawn properties
        this.baseSpawnInterval = CONFIG.enemies.baseSpawnInterval;
        this.spawnRateGrowth = CONFIG.enemies.spawnRateGrowth;
        
        // Create enemy pools for each enemy type
        this.enemyPools = {
            walker: new ObjectPool(scene, Monster, null, 20),
            charger: new ObjectPool(scene, Monster, null, 15),
            tank: new ObjectPool(scene, Monster, null, 10),
            shooter: new ObjectPool(scene, Monster, null, 10)
        };
        
        // Create enemy projectile pool
        this.enemyProjectiles = new ObjectPool(scene, EnemyProjectile, null, 30);
        
        // Make enemy pools accessible from scene
        this.scene.enemyPools = this.enemyPools;
        this.scene.enemyProjectiles = this.enemyProjectiles;
        
        // Set up spawn timer
        this.spawnTimer = null;
        
        // Track player level for spawn rate calculation
        this.lastPlayerLevel = 0;
    }
    
    // Start spawning enemies
    start() {
        // Set up spawn timer
        this.updateSpawnRate();
        
        // Start spawning
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.getCurrentSpawnInterval(),
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }
    
    // Stop spawning enemies
    stop() {
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
    }
    
    // Update spawn rate based on player level
    updateSpawnRate() {
        if (!this.scene.player) return;
        
        // Check if player level has changed
        if (this.scene.player.level !== this.lastPlayerLevel) {
            this.lastPlayerLevel = this.scene.player.level;
            
            // Update spawn timer
            if (this.spawnTimer) {
                this.spawnTimer.delay = this.getCurrentSpawnInterval();
            }
        }
    }
    
    // Get current spawn interval based on player level
    getCurrentSpawnInterval() {
        // Calculate spawn interval reduction based on player level
        const levelFactor = Math.pow(this.spawnRateGrowth, this.lastPlayerLevel);
        return this.baseSpawnInterval / levelFactor;
    }
    
    // Spawn a random enemy
    spawnEnemy() {
        if (!this.scene.player || !this.scene.player.active) return;
        
        // Choose enemy type based on weights
        const enemyType = this.chooseEnemyType();
        
        // Get spawn position
        const spawnPos = this.getSpawnPosition();
        
        // Get enemy from pool
        const enemy = this.enemyPools[enemyType].get(spawnPos.x, spawnPos.y, { type: enemyType });
        
        if (enemy) {
            // Set initial velocity towards player
            const angle = Phaser.Math.Angle.Between(
                spawnPos.x, spawnPos.y,
                this.scene.player.x, this.scene.player.y
            );
            
            const speed = CONFIG.enemies.types[enemyType].speed;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            enemy.setVelocity(vx, vy);
        }
    }
    
    // Choose enemy type based on weights and player level
    chooseEnemyType() {
        // Base weights
        const weights = {
            walker: 10,
            charger: 5,
            tank: 3,
            shooter: 2
        };
        
        // Adjust weights based on player level
        if (this.lastPlayerLevel >= 3) {
            weights.charger += 3;
            weights.tank += 1;
        }
        
        if (this.lastPlayerLevel >= 5) {
            weights.shooter += 2;
            weights.tank += 2;
        }
        
        if (this.lastPlayerLevel >= 8) {
            weights.charger += 2;
            weights.shooter += 3;
        }
        
        // Calculate total weight
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        
        // Choose random value
        const random = Math.random() * totalWeight;
        
        // Find selected enemy type
        let cumulativeWeight = 0;
        for (const [type, weight] of Object.entries(weights)) {
            cumulativeWeight += weight;
            if (random < cumulativeWeight) {
                return type;
            }
        }
        
        // Fallback
        return 'walker';
    }
    
    // Get spawn position (outside screen but inside world bounds)
    getSpawnPosition() {
        const camera = this.scene.cameras.main;
        const player = this.scene.player;
        
        // Calculate spawn area (outside camera view but inside world bounds)
        const margin = 100; // Distance outside camera view
        const minDistance = 200; // Minimum distance from player
        
        // Choose a random angle
        const angle = Math.random() * Math.PI * 2;
        
        // Calculate base position (on a circle around the player)
        const distance = minDistance + Math.random() * 100;
        let x = player.x + Math.cos(angle) * distance;
        let y = player.y + Math.sin(angle) * distance;
        
        // Ensure position is within world bounds
        x = Phaser.Math.Clamp(x, 0, this.scene.physics.world.bounds.width);
        y = Phaser.Math.Clamp(y, 0, this.scene.physics.world.bounds.height);
        
        return { x, y };
    }
    
    // Update method called every frame
    update() {
        // Update spawn rate based on player level
        this.updateSpawnRate();
    }
    
    // Clean up resources
    destroy() {
        this.stop();
        
        // Clean up enemy pools
        Object.values(this.enemyPools).forEach(pool => {
            pool.releaseAll();
        });
        
        // Clean up projectile pool
        this.enemyProjectiles.releaseAll();
    }
} 