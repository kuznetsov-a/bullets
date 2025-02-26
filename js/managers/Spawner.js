/**
 * Spawner - Handles enemy spawning
 */
class Spawner {
    /**
     * Create a new spawner
     * @param {GameScene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        
        // Spawn settings
        this.baseSpawnRate = CONFIG.ENEMY_SPAWN_RATE_BASE;
        this.spawnRateGrowth = CONFIG.ENEMY_SPAWN_RATE_GROWTH;
        this.spawnDistance = CONFIG.ENEMY_SPAWN_DISTANCE;
        
        // Spawn timer
        this.nextSpawnTime = 0;
        
        // Enemy type weights (chance of spawning)
        this.enemyWeights = {
            WALKER: 100,
            CHARGER: 0,
            TANK: 0,
            SHOOTER: 0
        };
        
        // Update enemy weights based on player level
        this.updateEnemyWeights();
    }
    
    /**
     * Update spawner logic
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Check if it's time to spawn
        if (time >= this.nextSpawnTime) {
            // Spawn an enemy
            this.spawnEnemy();
            
            // Calculate next spawn time
            const spawnRate = this.calculateSpawnRate();
            this.nextSpawnTime = time + spawnRate;
        }
        
        // Update enemy weights based on player level
        this.updateEnemyWeights();
    }
    
    /**
     * Calculate current spawn rate based on player level
     * @returns {number} Spawn rate in ms
     */
    calculateSpawnRate() {
        // Get player level
        const level = this.scene.player.level;
        
        // Calculate spawn rate reduction factor
        const factor = Math.pow(this.spawnRateGrowth, level - 1);
        
        // Calculate spawn rate
        return this.baseSpawnRate / factor;
    }
    
    /**
     * Update enemy weights based on player level
     */
    updateEnemyWeights() {
        // Get player level
        const level = this.scene.player.level;
        
        // Update weights based on level
        if (level >= 2) {
            this.enemyWeights.CHARGER = 50;
        }
        
        if (level >= 4) {
            this.enemyWeights.TANK = 30;
        }
        
        if (level >= 6) {
            this.enemyWeights.SHOOTER = 40;
        }
        
        // Increase difficulty as level increases
        if (level >= 10) {
            this.enemyWeights.WALKER = 70;
            this.enemyWeights.CHARGER = 70;
            this.enemyWeights.TANK = 50;
            this.enemyWeights.SHOOTER = 60;
        }
    }
    
    /**
     * Spawn an enemy
     */
    spawnEnemy() {
        // Check if we've reached the max enemies
        let totalEnemies = 0;
        for (const type in this.scene.enemyPools) {
            totalEnemies += this.scene.enemyPools[type].getActiveCount();
        }
        
        if (totalEnemies >= CONFIG.MAX_ENEMIES) {
            return;
        }
        
        // Select enemy type based on weights
        const type = this.selectEnemyType();
        
        // Calculate spawn position
        const spawnPos = this.calculateSpawnPosition();
        
        // Spawn the enemy
        this.scene.spawnEnemy(type, spawnPos.x, spawnPos.y);
    }
    
    /**
     * Select an enemy type based on weights
     * @returns {string} Enemy type
     */
    selectEnemyType() {
        // Calculate total weight
        let totalWeight = 0;
        for (const type in this.enemyWeights) {
            totalWeight += this.enemyWeights[type];
        }
        
        // Generate random value
        const random = Math.random() * totalWeight;
        
        // Select type based on weights
        let cumulativeWeight = 0;
        for (const type in this.enemyWeights) {
            cumulativeWeight += this.enemyWeights[type];
            if (random <= cumulativeWeight) {
                return type;
            }
        }
        
        // Fallback to WALKER
        return 'WALKER';
    }
    
    /**
     * Calculate spawn position
     * @returns {Object} Spawn position {x, y}
     */
    calculateSpawnPosition() {
        // Get player position
        const playerX = this.scene.player.sprite.x;
        const playerY = this.scene.player.sprite.y;
        
        // Generate random angle
        const angle = Math.random() * Math.PI * 2;
        
        // Calculate position at distance from player
        const x = playerX + Math.cos(angle) * this.spawnDistance;
        const y = playerY + Math.sin(angle) * this.spawnDistance;
        
        // Clamp to world bounds
        const clampedX = Phaser.Math.Clamp(x, 50, CONFIG.WORLD_WIDTH - 50);
        const clampedY = Phaser.Math.Clamp(y, 50, CONFIG.WORLD_HEIGHT - 50);
        
        return { x: clampedX, y: clampedY };
    }
} 