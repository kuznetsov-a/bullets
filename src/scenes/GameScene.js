// Main game scene
class GameScene extends Phaser.Scene {
    constructor() {
        super('gameScene');
    }
    
    // Initialize scene
    init() {
        // Game state
        this.enemiesKilled = 0;
        this.gameOver = false;
        
        // Track resize events
        this.scale.on('resize', this.handleResize, this);
    }
    
    // Preload assets
    preload() {
        // We're using vector graphics, so no assets to preload
    }
    
    // Create game objects
    create() {
        // Set up world bounds
        this.physics.world.setBounds(0, 0, CONFIG.map.width, CONFIG.map.height);
        
        // Create game state manager
        this.gameState = new GameState(this);
        
        // Create map with obstacles
        this.createMap();
        
        // Create player
        this.createPlayer();
        
        // Create spawner
        this.spawner = new Spawner(this);
        
        // Create UI manager
        this.uiManager = new UIManager(this);
        
        // Set up camera to follow player
        this.cameras.main.setBounds(0, 0, CONFIG.map.width, CONFIG.map.height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        
        // Start enemy spawning
        this.spawner.start();
        
        // Start autosave
        this.gameState.startAutosave();
        
        // Set up power-up group
        this.powerUps = this.physics.add.group();
        
        // Set up collisions
        this.setupCollisions();
    }
    
    // Create map with obstacles
    createMap() {
        // Create map graphics
        this.mapGraphics = this.add.graphics();
        
        // Draw background
        this.mapGraphics.fillStyle(0x111111);
        this.mapGraphics.fillRect(0, 0, CONFIG.map.width, CONFIG.map.height);
        
        // Draw grid lines
        this.mapGraphics.lineStyle(1, 0x333333, 0.5);
        
        // Vertical lines
        for (let x = 0; x < CONFIG.map.width; x += 200) {
            this.mapGraphics.lineBetween(x, 0, x, CONFIG.map.height);
        }
        
        // Horizontal lines
        for (let y = 0; y < CONFIG.map.height; y += 200) {
            this.mapGraphics.lineBetween(0, y, CONFIG.map.width, y);
        }
        
        // Create obstacles
        this.obstacles = this.physics.add.staticGroup();
        
        // Generate random obstacles
        for (let i = 0; i < CONFIG.map.obstacleCount; i++) {
            // Random position
            const x = Phaser.Math.Between(100, CONFIG.map.width - 100);
            const y = Phaser.Math.Between(100, CONFIG.map.height - 100);
            
            // Random size
            const size = Phaser.Math.Between(
                CONFIG.map.obstacleSize.min,
                CONFIG.map.obstacleSize.max
            );
            
            // Create obstacle
            const obstacle = this.obstacles.create(x, y, 'obstacle');
            obstacle.setVisible(false); // We'll draw it manually
            
            // Set up physics body
            obstacle.body.setSize(size, size);
            obstacle.body.updateFromGameObject();
            
            // Draw obstacle
            this.mapGraphics.fillStyle(0x666666);
            this.mapGraphics.fillRect(x - size / 2, y - size / 2, size, size);
            
            // Add border
            this.mapGraphics.lineStyle(2, 0x888888);
            this.mapGraphics.strokeRect(x - size / 2, y - size / 2, size, size);
        }
    }
    
    // Create player
    createPlayer() {
        // Check for saved game
        const savedGame = this.gameState.loadGame();
        
        // Create player at center of map
        this.player = new Player(
            this,
            CONFIG.map.width / 2,
            CONFIG.map.height / 2
        );
        
        // If we have a saved game, restore player state
        if (savedGame) {
            this.restoreGameState(savedGame);
        } else {
            // Give player initial weapon
            this.player.addWeapon('bullet');
        }
    }
    
    // Restore game state from saved data
    restoreGameState(savedGame) {
        // Restore player stats
        this.player.health = savedGame.player.health;
        this.player.level = savedGame.player.level;
        this.player.xp = savedGame.player.xp;
        this.player.xpToNextLevel = CONFIG.leveling.getXpForLevel(this.player.level);
        
        // Restore weapons
        savedGame.player.weapons.forEach((weaponData, index) => {
            if (!weaponData) return;
            
            // Add weapon
            this.player.addWeapon(weaponData.type);
            
            // Restore weapon level and stats
            const weapon = this.player.weapons[index];
            weapon.level = weaponData.level;
            weapon.damage = weaponData.damage;
            weapon.cooldown = weaponData.cooldown;
        });
        
        // Restore game stats
        this.enemiesKilled = savedGame.gameStats.enemiesKilled || 0;
    }
    
    // Set up collisions
    setupCollisions() {
        // Player collides with obstacles
        this.physics.add.collider(this.player, this.obstacles);
        
        // Enemies collide with obstacles
        Object.values(this.spawner.enemyPools).forEach(pool => {
            this.physics.add.collider(pool.group, this.obstacles);
        });
        
        // Enemies collide with each other
        Object.values(this.spawner.enemyPools).forEach(pool1 => {
            Object.values(this.spawner.enemyPools).forEach(pool2 => {
                this.physics.add.collider(pool1.group, pool2.group);
            });
        });
        
        // Bullets collide with obstacles
        this.physics.add.collider(
            this.spawner.enemyProjectiles.group,
            this.obstacles,
            (projectile) => {
                this.spawner.enemyProjectiles.release(projectile);
            }
        );
        
        // Bullets collide with player
        this.physics.add.overlap(
            this.player,
            this.spawner.enemyProjectiles.group,
            (player, projectile) => {
                player.takeDamage(projectile.damage);
                this.spawner.enemyProjectiles.release(projectile);
            }
        );
        
        // Player collects power-ups
        this.physics.add.overlap(
            this.player,
            this.powerUps,
            this.collectPowerUp,
            null,
            this
        );
    }
    
    // Spawn a power-up
    spawnPowerUp(x, y) {
        // Choose random power-up type
        const types = Object.keys(CONFIG.powerUps.types);
        const type = types[Phaser.Math.Between(0, types.length - 1)];
        
        // Create power-up
        const powerUp = this.powerUps.create(x, y, 'powerUp');
        powerUp.setVisible(false); // We'll draw it manually
        
        // Set power-up properties
        powerUp.type = type;
        powerUp.color = CONFIG.powerUps.types[type].color;
        powerUp.setCircle(15);
        
        // Create graphics for power-up
        const graphics = this.add.graphics();
        
        // Draw power-up
        graphics.fillStyle(powerUp.color, 0.8);
        graphics.fillCircle(x, y, 15);
        
        // Add pulsing animation
        this.tweens.add({
            targets: graphics,
            alpha: 0.5,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Store graphics reference
        powerUp.graphics = graphics;
        
        // Add lifespan
        this.time.delayedCall(10000, () => {
            if (powerUp.active) {
                powerUp.graphics.destroy();
                powerUp.destroy();
            }
        });
        
        return powerUp;
    }
    
    // Collect power-up
    collectPowerUp(player, powerUp) {
        // Apply power-up effect
        player.applyPowerUp(powerUp.type);
        
        // Destroy power-up
        powerUp.graphics.destroy();
        powerUp.destroy();
    }
    
    // Handle game over
    handleGameOver() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        
        // Stop enemy spawning
        this.spawner.stop();
        
        // Show game over UI
        this.uiManager.showGameOver();
        
        // Save final game state
        this.gameState.saveGame();
    }
    
    // Handle window resize
    handleResize() {
        // Update UI
        if (this.uiManager) {
            this.uiManager.resize();
        }
    }
    
    // Update game state
    update(time, delta) {
        if (this.gameOver) return;
        
        // Update player
        if (this.player) {
            this.player.update();
        }
        
        // Update spawner
        if (this.spawner) {
            this.spawner.update();
        }
        
        // Update UI
        if (this.uiManager) {
            this.uiManager.update();
        }
        
        // Update power-ups
        this.powerUps.getChildren().forEach(powerUp => {
            if (powerUp.graphics) {
                powerUp.graphics.x = powerUp.x;
                powerUp.graphics.y = powerUp.y;
            }
        });
    }
} 