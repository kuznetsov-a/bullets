import { Config } from './Config.js';
import { Player } from './Player.js';
import { Spawner } from './Spawner.js';
import { GameState } from './GameState.js';
import { UIManager } from './UIManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.spawner = null;
        this.gameState = null;
        this.uiManager = null;
        this.obstacles = null;
        this.enemies = null;
        this.projectiles = null;
        this.powerUps = null;
        this.controls = null;
        this.joystick = null;
        this.killCount = 0;
        this.powerUpTimer = 0;
    }

    preload() {
        // We'll use SVG graphics created in code rather than loading assets
        this.loadSVGGraphics();
    }

    create() {
        // Create groups for game objects
        this.createGroups();
        
        // Create map and obstacles
        this.createMap();
        
        // Initialize game state
        this.gameState = new GameState(this);
        
        // Create player from saved state or new
        if (this.gameState.hasSavedState()) {
            this.gameState.loadGame();
        } else {
            this.player = new Player(this);
            this.spawner = new Spawner(this);
            this.killCount = 0;
        }
        
        // Set up camera to follow player
        this.cameras.main.startFollow(this.player.sprite, true);
        this.cameras.main.setZoom(1);
        
        // Set up UI
        this.uiManager = new UIManager(this);
        
        // Set up controls
        this.setupControls();
        
        // Start autosave
        this.time.addEvent({
            delay: Config.AUTOSAVE_INTERVAL,
            callback: () => this.gameState.saveGame(),
            callbackScope: this,
            loop: true
        });
    }

    update() {
        if (this.player && this.player.hp > 0) {
            // Update player
            this.player.update();
            
            // Update enemies
            this.updateEnemies();
            
            // Update UI
            this.uiManager.update();
            
            // Check for level up
            this.player.checkLevelUp();
        }
    }

    loadSVGGraphics() {
        // Create SVG textures for all game objects
        this.createPlayerSVG();
        this.createEnemySVGs();
        this.createWeaponSVGs();
        this.createObstacleSVGs();
        this.createPowerUpSVGs();
    }

    createPlayerSVG() {
        // Create player SVG
        const graphics = this.make.graphics();
        
        // Player ship shape (triangle with circular base)
        graphics.fillStyle(0x4488ff, 1);
        graphics.fillCircle(16, 16, 10);
        graphics.fillStyle(0x88aaff, 1);
        graphics.fillTriangle(16, 0, 26, 20, 6, 20);
        
        graphics.generateTexture('player', 32, 32);
        graphics.clear();
    }

    createEnemySVGs() {
        // Basic enemy (red circle)
        let graphics = this.make.graphics();
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(12, 12, 10);
        graphics.generateTexture('enemy-basic', 24, 24);
        graphics.clear();
        
        // Fast enemy (small yellow triangle)
        graphics.fillStyle(0xffff00, 1);
        graphics.fillTriangle(12, 2, 22, 20, 2, 20);
        graphics.generateTexture('enemy-fast', 24, 24);
        graphics.clear();
        
        // Tank enemy (large green square)
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillRect(2, 2, 26, 26);
        graphics.generateTexture('enemy-tank', 30, 30);
        graphics.clear();
        
        // Shooter enemy (purple pentagon)
        graphics.fillStyle(0xff00ff, 1);
        const centerX = 15;
        const centerY = 15;
        const radius = 12;
        const points = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            points.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }
        graphics.fillPoints(points, true);
        graphics.generateTexture('enemy-shooter', 30, 30);
        graphics.clear();
        
        // Enemy projectile
        graphics.fillStyle(0xff00ff, 1);
        graphics.fillCircle(4, 4, 3);
        graphics.generateTexture('enemy-projectile', 8, 8);
        graphics.clear();
    }
    
    createWeaponSVGs() {
        let graphics = this.make.graphics();
        
        // Bullet weapon
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 3);
        graphics.generateTexture('weapon-bullet', 8, 8);
        graphics.clear();
        
        // Aura weapon
        graphics.lineStyle(2, 0x00ffff, 0.8);
        graphics.strokeCircle(25, 25, 25);
        graphics.generateTexture('weapon-aura', 50, 50);
        graphics.clear();
        
        // Hammer weapon
        graphics.fillStyle(0xffaa00, 1);
        graphics.fillRect(2, 2, 15, 15);
        graphics.generateTexture('weapon-hammer', 20, 20);
        graphics.clear();
        
        // Whip weapon
        graphics.lineStyle(3, 0xffff00, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(40, 0);
        graphics.strokePath();
        graphics.generateTexture('weapon-whip', 40, 3);
        graphics.clear();
    }
    
    createObstacleSVGs() {
        let graphics = this.make.graphics();
        
        // Rock-like obstacle
        graphics.fillStyle(0x888888, 1);
        const points = [];
        const centerX = 20;
        const centerY = 20;
        const radius = 15;
        const spikes = 7;
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const dist = i % 2 === 0 ? radius : radius * 0.6;
            points.push({
                x: centerX + dist * Math.cos(angle),
                y: centerY + dist * Math.sin(angle)
            });
        }
        
        graphics.fillPoints(points, true);
        graphics.generateTexture('obstacle', 40, 40);
        graphics.clear();
    }
    
    createPowerUpSVGs() {
        let graphics = this.make.graphics();
        
        // Health power-up (red cross)
        graphics.fillStyle(0xff0000, 1);
        graphics.fillRect(8, 3, 4, 14);
        graphics.fillRect(3, 8, 14, 4);
        graphics.generateTexture('powerup-health', 20, 20);
        graphics.clear();
        
        // Speed power-up (blue lightning)
        graphics.fillStyle(0x00ffff, 1);
        graphics.beginPath();
        graphics.moveTo(10, 0);
        graphics.lineTo(4, 10);
        graphics.lineTo(10, 10);
        graphics.lineTo(4, 20);
        graphics.lineTo(16, 7);
        graphics.lineTo(10, 7);
        graphics.lineTo(16, 0);
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('powerup-speed', 20, 20);
        graphics.clear();
        
        // Fire rate power-up (yellow star)
        graphics.fillStyle(0xffff00, 1);
        const centerX = 10;
        const centerY = 10;
        const outerRadius = 10;
        const innerRadius = 4;
        const spikes = 5;
        const starPoints = [];
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            starPoints.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }
        
        graphics.fillPoints(starPoints, true);
        graphics.generateTexture('powerup-firerate', 20, 20);
        graphics.clear();
    }

    createGroups() {
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.obstacles = this.physics.add.staticGroup();
        this.powerUps = this.physics.add.group();
    }

    createMap() {
        // Create world bounds
        const mapSize = Config.MAP_SIZE;
        this.physics.world.setBounds(0, 0, mapSize * 32, mapSize * 32);
        
        // Create background grid
        const gridGraphics = this.make.graphics();
        gridGraphics.lineStyle(1, 0x333333, 0.3);
        
        for (let x = 0; x <= mapSize; x += 10) {
            gridGraphics.moveTo(x * 32, 0);
            gridGraphics.lineTo(x * 32, mapSize * 32);
        }
        
        for (let y = 0; y <= mapSize; y += 10) {
            gridGraphics.moveTo(0, y * 32);
            gridGraphics.lineTo(mapSize * 32, y * 32);
        }
        
        gridGraphics.strokePath();
        gridGraphics.generateTexture('grid', mapSize * 32, mapSize * 32);
        
        this.add.image(0, 0, 'grid').setOrigin(0);
        
        // Generate random obstacles
        const numObstacles = Math.floor(mapSize * mapSize / 100);
        const obstacleTexture = 'obstacle';
        
        for (let i = 0; i < numObstacles; i++) {
            const x = Phaser.Math.Between(50, mapSize * 32 - 50);
            const y = Phaser.Math.Between(50, mapSize * 32 - 50);
            
            // Don't place obstacles too close to center (player spawn)
            if (Phaser.Math.Distance.Between(x, y, mapSize * 16, mapSize * 16) > 100) {
                const obstacle = this.obstacles.create(x, y, obstacleTexture);
                obstacle.setScale(Phaser.Math.FloatBetween(0.8, 1.5));
                obstacle.angle = Phaser.Math.Between(0, 360);
                obstacle.refreshBody();
            }
        }
    }
    
    setupControls() {
        // Setup WASD keys for desktop
        this.controls = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        // On-screen joystick for mobile
        if (this.sys.game.device.input.touch) {
            this.createJoystick();
        }
    }
    
    createJoystick() {
        // Create joystick base and thumb
        const baseRadius = 60;
        const thumbRadius = 30;
        
        const baseGraphics = this.make.graphics();
        baseGraphics.fillStyle(0x888888, 0.5);
        baseGraphics.fillCircle(baseRadius, baseRadius, baseRadius);
        baseGraphics.generateTexture('joystick-base', baseRadius * 2, baseRadius * 2);
        baseGraphics.clear();
        
        const thumbGraphics = this.make.graphics();
        thumbGraphics.fillStyle(0xcccccc, 0.8);
        thumbGraphics.fillCircle(thumbRadius, thumbRadius, thumbRadius);
        thumbGraphics.generateTexture('joystick-thumb', thumbRadius * 2, thumbRadius * 2);
        thumbGraphics.clear();
        
        // Position the joystick in bottom left of screen
        const baseX = 100;
        const baseY = this.sys.game.config.height - 100;
        
        const base = this.add.image(baseX, baseY, 'joystick-base').setScrollFactor(0);
        const thumb = this.add.image(baseX, baseY, 'joystick-thumb').setScrollFactor(0);
        
        this.joystick = {
            base: base,
            thumb: thumb,
            position: { x: 0, y: 0 },
            active: false,
            maxDistance: baseRadius
        };
        
        // Touch controls
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x < this.sys.game.config.width / 2) {
                this.joystick.active = true;
                this.input.on('pointermove', this.moveJoystick, this);
                this.input.once('pointerup', this.releaseJoystick, this);
            }
        });
    }
    
    moveJoystick(pointer) {
        if (!this.joystick.active) return;
        
        const baseX = this.joystick.base.x;
        const baseY = this.joystick.base.y;
        
        // Calculate distance
        const dx = pointer.x - baseX;
        const dy = pointer.y - baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and calculate final position
        if (distance > this.joystick.maxDistance) {
            const angle = Math.atan2(dy, dx);
            this.joystick.thumb.x = baseX + Math.cos(angle) * this.joystick.maxDistance;
            this.joystick.thumb.y = baseY + Math.sin(angle) * this.joystick.maxDistance;
        } else {
            this.joystick.thumb.x = pointer.x;
            this.joystick.thumb.y = pointer.y;
        }
        
        // Calculate normalized position (-1 to 1)
        this.joystick.position.x = (this.joystick.thumb.x - baseX) / this.joystick.maxDistance;
        this.joystick.position.y = (this.joystick.thumb.y - baseY) / this.joystick.maxDistance;
    }
    
    releaseJoystick() {
        this.joystick.active = false;
        this.joystick.position = { x: 0, y: 0 };
        this.joystick.thumb.x = this.joystick.base.x;
        this.joystick.thumb.y = this.joystick.base.y;
        this.input.off('pointermove', this.moveJoystick, this);
    }
    
    updateEnemies() {
        // Update each enemy to follow player or do AI behavior
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                enemy.enemy.update();
            }
        });
    }
    
    spawnPowerUp(x, y) {
        // Spawn a random power-up
        const types = ['health', 'speed', 'firerate'];
        const type = types[Phaser.Math.Between(0, types.length - 1)];
        
        const powerUp = this.powerUps.create(x, y, `powerup-${type}`);
        powerUp.type = type;
        powerUp.setCollideWorldBounds(true);
        powerUp.body.setSize(20, 20);
        
        // Add collision with player
        this.physics.add.overlap(this.player.sprite, powerUp, this.collectPowerUp, null, this);
        
        // Auto-destroy after 10 seconds
        this.time.delayedCall(10000, () => {
            if (powerUp.active) {
                powerUp.destroy();
            }
        });
    }
    
    collectPowerUp(playerSprite, powerUp) {
        const type = powerUp.type;
        const stats = Config.POWER_UP_STATS;
        
        // Apply power-up effect
        switch (type) {
            case 'health':
                this.player.heal(stats.HEALTH.value);
                break;
            case 'speed':
                this.player.applySpeedBoost(stats.SPEED.value, stats.SPEED.duration);
                break;
            case 'firerate':
                this.player.applyFireRateBoost(stats.FIRE_RATE.value, stats.FIRE_RATE.duration);
                break;
        }
        
        powerUp.destroy();
    }
    
    gameOver() {
        // Save the final state
        this.gameState.saveGame();
        
        // Show game over UI
        this.uiManager.showGameOver();
        
        // Stop spawning
        this.spawner.stop();
    }
    
    resetGame() {
        // Clear local storage
        localStorage.removeItem('bulletHeavenSave');
        
        // Restart scene
        this.scene.restart();
    }
    
    onEnemyKilled() {
        this.killCount++;
        
        // Check for power-up spawn
        if (this.killCount % Config.POWER_UP_SPAWN_RATE === 0) {
            // Spawn power-up at random location near player
            const offset = 100;
            const x = this.player.sprite.x + Phaser.Math.Between(-offset, offset);
            const y = this.player.sprite.y + Phaser.Math.Between(-offset, offset);
            this.spawnPowerUp(x, y);
        }
    }
} 