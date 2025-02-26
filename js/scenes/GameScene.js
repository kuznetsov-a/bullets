/**
 * GameScene - Main gameplay scene
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.player = null;
        this.uiManager = null;
        this.spawner = null;
        this.levelUpActive = false;
        this.paused = false;
        this.killCount = 0;
        this.powerUpKillCounter = 0;
        
        // Object pools
        this.enemyPools = {};
        this.projectilePools = {};
        this.powerUpPool = null;
        
        // Groups
        this.enemyGroup = null;
        this.projectileGroup = null;
        this.obstacleGroup = null;
        this.powerUpGroup = null;
    }

    create() {
        // Create world bounds larger than the screen
        this.physics.world.setBounds(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
        
        // Create map
        this.createMap();
        
        // Create object pools
        this.createObjectPools();
        
        // Create physics groups
        this.createGroups();
        
        // Create player
        this.createPlayer();
        
        // Create obstacles
        this.createObstacles();
        
        // Create UI
        this.uiManager = new UIManager(this);
        
        // Create enemy spawner
        this.spawner = new Spawner(this);
        
        // Set up camera to follow player
        this.cameras.main.setBounds(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        
        // Set up collisions
        this.setupCollisions();
        
        // Set up input
        this.setupInput();
        
        // Start autosave timer
        this.autosaveTimer = this.time.addEvent({
            delay: CONFIG.AUTOSAVE_INTERVAL,
            callback: this.autosave,
            callbackScope: this,
            loop: true
        });
        
        // Start background music
        this.sound.play('music-main', { loop: true, volume: 0.5 });
        
        // Load game state if available
        if (window.gameState.hasSavedGame()) {
            this.loadGameState();
        }
    }
    
    update(time, delta) {
        if (this.paused || this.levelUpActive) return;
        
        // Update player
        this.player.update(time, delta);
        
        // Update enemies
        this.updateEnemies(time, delta);
        
        // Update spawner
        this.spawner.update(time, delta);
        
        // Update UI
        this.uiManager.update(time, delta);
    }
    
    createMap() {
        // Add tiled background
        const bgTile = this.add.tileSprite(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT, 'map-background')
            .setOrigin(0, 0)
            .setDepth(-1);
    }
    
    createObjectPools() {
        // Create enemy pools
        this.enemyPools.WALKER = new ObjectPool(
            () => new Monster(this, 'WALKER'),
            (obj, x, y) => obj.reset(x, y),
            20
        );
        
        this.enemyPools.CHARGER = new ObjectPool(
            () => new Monster(this, 'CHARGER'),
            (obj, x, y) => obj.reset(x, y),
            15
        );
        
        this.enemyPools.TANK = new ObjectPool(
            () => new Monster(this, 'TANK'),
            (obj, x, y) => obj.reset(x, y),
            10
        );
        
        this.enemyPools.SHOOTER = new ObjectPool(
            () => new Monster(this, 'SHOOTER'),
            (obj, x, y) => obj.reset(x, y),
            15
        );
        
        // Create projectile pools for each weapon type
        this.projectilePools.BULLET = new ObjectPool(
            () => this.physics.add.sprite(0, 0, 'bullet').setActive(false).setVisible(false),
            (obj, x, y, velocityX, velocityY) => {
                obj.setActive(true).setVisible(true);
                obj.setPosition(x, y);
                obj.setVelocity(velocityX, velocityY);
                obj.damage = 0; // Set by weapon when firing
                obj.lifespan = 0; // Set by weapon when firing
                obj.born = 0; // Set by weapon when firing
            },
            50
        );
        
        // Create power-up pool
        this.powerUpPool = new ObjectPool(
            () => this.physics.add.sprite(0, 0, 'powerup-health').setActive(false).setVisible(false),
            (obj, x, y, type) => {
                obj.setActive(true).setVisible(true);
                obj.setPosition(x, y);
                obj.setTexture(`powerup-${type.toLowerCase()}`);
                obj.powerUpType = type;
                obj.setScale(0.8);
                obj.body.setCircle(20);
            },
            10
        );
    }
    
    createGroups() {
        // Create physics groups
        this.enemyGroup = this.physics.add.group();
        this.projectileGroup = this.physics.add.group();
        this.obstacleGroup = this.physics.add.staticGroup();
        this.powerUpGroup = this.physics.add.group();
    }
    
    createPlayer() {
        // Create player at center of world
        this.player = new Player(
            this,
            CONFIG.WORLD_WIDTH / 2,
            CONFIG.WORLD_HEIGHT / 2
        );
    }
    
    createObstacles() {
        // Create random obstacles
        const numObstacles = 50;
        const obstacleRadius = 40;
        
        for (let i = 0; i < numObstacles; i++) {
            // Generate random position
            let x, y;
            let validPosition = false;
            
            // Keep trying until we find a valid position
            while (!validPosition) {
                x = Phaser.Math.Between(obstacleRadius, CONFIG.WORLD_WIDTH - obstacleRadius);
                y = Phaser.Math.Between(obstacleRadius, CONFIG.WORLD_HEIGHT - obstacleRadius);
                
                // Check distance from player
                const distFromPlayer = Phaser.Math.Distance.Between(
                    x, y, 
                    CONFIG.WORLD_WIDTH / 2, CONFIG.WORLD_HEIGHT / 2
                );
                
                // Valid if far enough from player start position
                validPosition = distFromPlayer > 200;
            }
            
            // Create obstacle
            const obstacle = this.obstacleGroup.create(x, y, 'obstacle');
            obstacle.setCircle(obstacleRadius);
            obstacle.setImmovable(true);
        }
    }
    
    setupCollisions() {
        // Player collides with obstacles
        this.physics.add.collider(this.player.sprite, this.obstacleGroup);
        
        // Enemies collide with obstacles
        this.physics.add.collider(this.enemyGroup, this.obstacleGroup);
        
        // Enemies collide with each other
        this.physics.add.collider(this.enemyGroup, this.enemyGroup);
        
        // Projectiles collide with obstacles
        this.physics.add.collider(this.projectileGroup, this.obstacleGroup, (projectile) => {
            this.projectilePools.BULLET.release(projectile);
            projectile.setActive(false).setVisible(false);
        });
        
        // Projectiles hit enemies
        this.physics.add.overlap(this.projectileGroup, this.enemyGroup, this.onProjectileHitEnemy, null, this);
        
        // Enemies hit player
        this.physics.add.overlap(this.player.sprite, this.enemyGroup, this.onEnemyHitPlayer, null, this);
        
        // Player collects power-ups
        this.physics.add.overlap(this.player.sprite, this.powerUpGroup, this.onPlayerCollectPowerUp, null, this);
    }
    
    setupInput() {
        // Set up keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        
        // Set up touch input for mobile
        if (this.isMobile()) {
            this.input.on('pointermove', (pointer) => {
                if (pointer.isDown) {
                    // Calculate direction from center of screen
                    const centerX = this.cameras.main.width / 2;
                    const centerY = this.cameras.main.height / 2;
                    
                    // Get direction vector
                    const dirX = pointer.x - centerX;
                    const dirY = pointer.y - centerY;
                    
                    // Normalize and set player velocity
                    const length = Math.sqrt(dirX * dirX + dirY * dirY);
                    if (length > 20) { // Deadzone
                        this.player.setVelocity(
                            (dirX / length) * CONFIG.PLAYER_SPEED,
                            (dirY / length) * CONFIG.PLAYER_SPEED
                        );
                    } else {
                        this.player.setVelocity(0, 0);
                    }
                }
            });
            
            this.input.on('pointerup', () => {
                this.player.setVelocity(0, 0);
            });
        }
    }
    
    updateEnemies(time, delta) {
        // Update all active enemies
        for (const enemyType in this.enemyPools) {
            this.enemyPools[enemyType].getActiveObjects().forEach(enemy => {
                enemy.update(time, delta);
            });
        }
    }
    
    spawnEnemy(type, x, y) {
        // Get enemy from pool
        const enemy = this.enemyPools[type].get(x, y);
        
        // Add to physics group
        this.enemyGroup.add(enemy.sprite);
        
        return enemy;
    }
    
    spawnPowerUp(x, y) {
        // Randomly select power-up type
        const types = Object.keys(CONFIG.POWERUPS);
        const type = types[Phaser.Math.Between(0, types.length - 1)];
        
        // Get power-up from pool
        const powerUp = this.powerUpPool.get(x, y, CONFIG.POWERUPS[type].name);
        
        // Add to physics group
        this.powerUpGroup.add(powerUp);
        
        return powerUp;
    }
    
    onProjectileHitEnemy(projectile, enemySprite) {
        // Find the enemy object
        let enemy = null;
        for (const type in this.enemyPools) {
            const found = this.enemyPools[type].getActiveObjects().find(e => e.sprite === enemySprite);
            if (found) {
                enemy = found;
                break;
            }
        }
        
        if (enemy) {
            // Apply damage
            enemy.takeDamage(projectile.damage);
            
            // Play hit sound
            this.sound.play('sound-hit', { volume: 0.3 });
            
            // Check if enemy died
            if (enemy.hp <= 0) {
                this.onEnemyKilled(enemy);
            }
        }
        
        // Return projectile to pool
        this.projectilePools.BULLET.release(projectile);
        projectile.setActive(false).setVisible(false);
    }
    
    onEnemyHitPlayer(playerSprite, enemySprite) {
        // Find the enemy object
        let enemy = null;
        for (const type in this.enemyPools) {
            const found = this.enemyPools[type].getActiveObjects().find(e => e.sprite === enemySprite);
            if (found) {
                enemy = found;
                break;
            }
        }
        
        if (enemy) {
            // Apply damage to player
            this.player.takeDamage(enemy.damage);
            
            // Play hit sound
            this.sound.play('sound-hit', { volume: 0.5 });
            
            // Check if player died
            if (this.player.hp <= 0) {
                this.gameOver();
            }
        }
    }
    
    onPlayerCollectPowerUp(playerSprite, powerUp) {
        // Apply power-up effect
        switch (powerUp.powerUpType) {
            case 'Health':
                this.player.heal(CONFIG.POWERUPS.HEALTH.value);
                break;
                
            case 'Speed':
                this.player.applySpeedBoost(
                    CONFIG.POWERUPS.SPEED.value,
                    CONFIG.POWERUPS.SPEED.duration
                );
                break;
                
            case 'Fire Rate':
                this.player.applyFireRateBoost(
                    CONFIG.POWERUPS.FIRE_RATE.value,
                    CONFIG.POWERUPS.FIRE_RATE.duration
                );
                break;
        }
        
        // Play power-up sound
        this.sound.play('sound-powerup', { volume: 0.5 });
        
        // Return power-up to pool
        this.powerUpPool.release(powerUp);
        powerUp.setActive(false).setVisible(false);
    }
    
    onEnemyKilled(enemy) {
        // Award XP to player
        this.player.addXP(enemy.xp);
        
        // Increment kill counters
        this.killCount++;
        this.powerUpKillCounter++;
        
        // Check if we should spawn a power-up
        if (this.powerUpKillCounter >= CONFIG.POWERUP_SPAWN_KILLS) {
            this.powerUpKillCounter = 0;
            this.spawnPowerUp(enemy.sprite.x, enemy.sprite.y);
        }
        
        // Check if player leveled up
        if (this.player.checkLevelUp()) {
            this.showLevelUpMenu();
        }
    }
    
    showLevelUpMenu() {
        // Pause the game
        this.levelUpActive = true;
        
        // Play level up sound
        this.sound.play('sound-level-up', { volume: 0.7 });
        
        // Create level up menu
        const menuBg = this.add.image(
            CONFIG.GAME_WIDTH / 2,
            CONFIG.GAME_HEIGHT / 2,
            'level-up-background'
        ).setScrollFactor(0).setDepth(100);
        
        // Add title
        const title = this.add.text(
            CONFIG.GAME_WIDTH / 2,
            CONFIG.GAME_HEIGHT / 2 - 150,
            `LEVEL UP! (Level ${this.player.level})`,
            {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(101);
        
        // Generate options
        const options = this.generateLevelUpOptions();
        const optionButtons = [];
        
        // Create option buttons
        options.forEach((option, index) => {
            const y = CONFIG.GAME_HEIGHT / 2 - 50 + index * 80;
            
            // Create button
            const button = this.add.image(
                CONFIG.GAME_WIDTH / 2,
                y,
                'level-up-option'
            ).setScrollFactor(0).setInteractive().setDepth(101);
            
            // Add text
            const text = this.add.text(
                CONFIG.GAME_WIDTH / 2,
                y,
                option.text,
                {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    color: '#ffffff',
                    align: 'center'
                }
            ).setScrollFactor(0).setOrigin(0.5).setDepth(102);
            
            // Add hover effect
            button.on('pointerover', () => {
                button.setTint(0xcccccc);
            });
            
            button.on('pointerout', () => {
                button.clearTint();
            });
            
            // Add click callback
            button.on('pointerdown', () => {
                button.setTint(0x999999);
            });
            
            button.on('pointerup', () => {
                // Apply the selected option
                option.apply();
                
                // Remove menu
                menuBg.destroy();
                title.destroy();
                optionButtons.forEach(b => {
                    b.button.destroy();
                    b.text.destroy();
                });
                
                // Resume game
                this.levelUpActive = false;
            });
            
            optionButtons.push({ button, text });
        });
    }
    
    generateLevelUpOptions() {
        const options = [];
        
        // If player doesn't have max weapons, offer new weapons
        if (this.player.weapons.length < CONFIG.MAX_WEAPONS) {
            // Get available weapon types
            const availableWeapons = Object.keys(CONFIG.WEAPONS).filter(type => {
                return !this.player.weapons.some(w => w.type === type);
            });
            
            // Add new weapon options
            if (availableWeapons.length > 0) {
                const randomWeapon = availableWeapons[Phaser.Math.Between(0, availableWeapons.length - 1)];
                options.push({
                    text: `New Weapon: ${CONFIG.WEAPONS[randomWeapon].name}`,
                    apply: () => this.player.addWeapon(randomWeapon)
                });
            }
        }
        
        // Add upgrade options for existing weapons
        this.player.weapons.forEach(weapon => {
            // Get available upgrades
            const availableUpgrades = weapon.getAvailableUpgrades();
            
            if (availableUpgrades.length > 0) {
                // Pick a random upgrade
                const upgradeType = availableUpgrades[Phaser.Math.Between(0, availableUpgrades.length - 1)];
                const upgradeValue = weapon.getNextUpgradeValue(upgradeType);
                
                let upgradeText = '';
                switch (upgradeType) {
                    case 'damage':
                        upgradeText = `+${upgradeValue} Damage`;
                        break;
                    case 'cooldown':
                        upgradeText = `${upgradeValue}ms Cooldown`;
                        break;
                    case 'speed':
                        upgradeText = `+${upgradeValue} Speed`;
                        break;
                    case 'range':
                        upgradeText = `+${upgradeValue} Range`;
                        break;
                    case 'radius':
                        upgradeText = `+${upgradeValue} Radius`;
                        break;
                    case 'arc':
                        upgradeText = `+${upgradeValue}° Arc`;
                        break;
                    case 'rotationSpeed':
                        upgradeText = `+${upgradeValue} Rotation Speed`;
                        break;
                    case 'count':
                        upgradeText = `+${upgradeValue} Count`;
                        break;
                }
                
                options.push({
                    text: `Upgrade ${weapon.name}: ${upgradeText}`,
                    apply: () => weapon.upgrade(upgradeType)
                });
            }
        });
        
        // If we don't have enough options, add generic upgrades
        while (options.length < 3) {
            options.push({
                text: `+${10} Max HP`,
                apply: () => this.player.increaseMaxHP(10)
            });
        }
        
        // Shuffle and return 3 options
        Phaser.Utils.Array.Shuffle(options);
        return options.slice(0, 3);
    }
    
    gameOver() {
        // Reset game state
        window.gameState.resetGame();
        
        // Return to main menu
        this.scene.start('MainMenuScene');
    }
    
    autosave() {
        if (!this.paused && !this.levelUpActive) {
            window.gameState.saveGame(this);
        }
    }
    
    loadGameState() {
        window.gameState.loadGame(this);
    }
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
} 