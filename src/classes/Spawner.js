import { Config } from './Config.js';
import { Enemy } from './Enemy.js';

export class Spawner {
    constructor(scene) {
        this.scene = scene;
        this.baseSpawnRate = 1500; // ms between spawns
        this.currentSpawnRate = this.baseSpawnRate;
        this.maxActiveEnemies = 50;
        this.enemyPool = {
            BASIC: [],
            FAST: [],
            TANK: [],
            SHOOTER: []
        };
        this.spawnTimer = null;
        this.active = true;
        
        // Start spawning
        this.startSpawning();
    }
    
    startSpawning() {
        // Clear any existing timer
        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }
        
        // Start new timer
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.currentSpawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }
    
    stop() {
        this.active = false;
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
    }
    
    updateSpawnRate(playerLevel) {
        // Increase spawn rate with player level
        this.currentSpawnRate = this.baseSpawnRate / Math.pow(Config.ENEMY_SPAWN_RATE_GROWTH, playerLevel - 1);
        
        // Update timer
        if (this.spawnTimer) {
            this.spawnTimer.delay = this.currentSpawnRate;
        }
    }
    
    spawnEnemy() {
        if (!this.active) return;
        
        // Check if we've reached max enemies
        const activeEnemies = this.scene.enemies.countActive();
        if (activeEnemies >= this.maxActiveEnemies) return;
        
        // Determine spawn position (off-screen but nearby player)
        const spawnPos = this.getSpawnPosition();
        
        // Determine enemy type to spawn
        const enemyType = this.getEnemyTypeToSpawn();
        
        // Get an enemy from the pool or create a new one
        const enemy = this.getEnemyFromPool(enemyType, spawnPos.x, spawnPos.y);
        
        // Initialize the enemy if it's new
        if (enemy.hp <= 0) {
            enemy.initStats();
        }
    }
    
    getSpawnPosition() {
        const player = this.scene.player.sprite;
        const camera = this.scene.cameras.main;
        const margin = 100;
        const minDistance = 300;
        const maxDistance = 500;
        
        // Pick random angle
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = Phaser.Math.FloatBetween(minDistance, maxDistance);
        
        // Calculate position
        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;
        
        // Ensure the position is within world bounds
        const worldBounds = this.scene.physics.world.bounds;
        const clampedX = Phaser.Math.Clamp(x, worldBounds.x + margin, worldBounds.right - margin);
        const clampedY = Phaser.Math.Clamp(y, worldBounds.y + margin, worldBounds.bottom - margin);
        
        return { x: clampedX, y: clampedY };
    }
    
    getEnemyTypeToSpawn() {
        // As player progresses, spawn more varied and difficult enemies
        const playerLevel = this.scene.player.level;
        let types = ['BASIC'];
        
        if (playerLevel >= 2) types.push('FAST');
        if (playerLevel >= 4) types.push('TANK');
        if (playerLevel >= 6) types.push('SHOOTER');
        
        // Give higher chance to spawn advanced enemies at higher levels
        let weights = [1]; // BASIC
        
        if (playerLevel >= 2) weights.push(playerLevel >= 5 ? 1.5 : 0.7); // FAST
        if (playerLevel >= 4) weights.push(playerLevel >= 7 ? 1.3 : 0.5); // TANK
        if (playerLevel >= 6) weights.push(playerLevel >= 9 ? 1.2 : 0.3); // SHOOTER
        
        // Normalize weights
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        weights = weights.map(w => w / totalWeight);
        
        // Cumulative weights for selection
        let cumulativeWeights = [];
        let cumulativeWeight = 0;
        for (const weight of weights) {
            cumulativeWeight += weight;
            cumulativeWeights.push(cumulativeWeight);
        }
        
        // Select a type based on weights
        const roll = Math.random();
        for (let i = 0; i < cumulativeWeights.length; i++) {
            if (roll <= cumulativeWeights[i]) {
                return types[i];
            }
        }
        
        // Fallback
        return 'BASIC';
    }
    
    getEnemyFromPool(type, x, y) {
        // Look for an inactive enemy in the pool
        for (const enemy of this.enemyPool[type]) {
            if (!enemy.sprite || !enemy.sprite.active) {
                // Reactivate the enemy
                if (enemy.sprite) {
                    enemy.sprite.setActive(true);
                    enemy.sprite.setVisible(true);
                    enemy.sprite.x = x;
                    enemy.sprite.y = y;
                    enemy.hp = enemy.maxHp;
                } else {
                    enemy.createSprite(x, y);
                    enemy.setupPhysics();
                }
                return enemy;
            }
        }
        
        // No inactive enemy found, create a new one
        const enemy = new Enemy(this.scene, x, y, type);
        this.enemyPool[type].push(enemy);
        return enemy;
    }
    
    // For persistent game state
    toJSON() {
        return {
            currentSpawnRate: this.currentSpawnRate,
            maxActiveEnemies: this.maxActiveEnemies
        };
    }
    
    fromJSON(data) {
        this.currentSpawnRate = data.currentSpawnRate || this.baseSpawnRate;
        this.maxActiveEnemies = data.maxActiveEnemies || 50;
        
        // Restart spawning with new rate
        this.startSpawning();
    }
} 