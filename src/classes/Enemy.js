import { Config } from './Config.js';

export class Enemy {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;
        this.hp = 0;
        this.maxHp = 0;
        this.speed = 0;
        this.damage = 0;
        this.xpValue = 0;
        this.sprite = null;
        this.isOffscreen = false;
        this.lastDamageTime = 0;
        
        // Initialize stats from config
        this.initStats();
        
        // Create sprite
        this.createSprite(x, y);
        
        // Setup physics
        this.setupPhysics();
    }
    
    initStats() {
        const stats = Config.ENEMY_STATS[this.type];
        if (stats) {
            this.hp = stats.hp;
            this.maxHp = stats.hp;
            this.speed = stats.speed;
            this.damage = stats.damage;
            this.xpValue = stats.xpValue;
        }
    }
    
    createSprite(x, y) {
        this.sprite = this.scene.enemies.create(x, y, `enemy-${this.type.toLowerCase()}`);
        this.sprite.enemy = this; // Reference to this enemy for collision handlers
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDepth(5);
        
        // Add health bar
        this.createHealthBar();
    }
    
    createHealthBar() {
        const width = 30;
        const height = 4;
        const y = -20;
        
        // Background bar
        this.healthBarBg = this.scene.add.rectangle(
            0, y, width, height, 0x000000, 0.5
        ).setOrigin(0.5, 0.5);
        
        // Health fill
        this.healthBar = this.scene.add.rectangle(
            0, y, width, height, 0xff0000, 1
        ).setOrigin(0.5, 0.5);
        
        // Add to container
        this.sprite.healthBarBg = this.healthBarBg;
        this.sprite.healthBar = this.healthBar;
    }
    
    setupPhysics() {
        // Add collision with obstacles
        this.scene.physics.add.collider(this.sprite, this.scene.obstacles);
        
        // Add collision with player
        this.scene.physics.add.overlap(
            this.sprite, this.scene.player.sprite, 
            this.onCollideWithPlayer, null, this
        );
        
        // Add collision with other enemies
        this.scene.physics.add.collider(this.sprite, this.scene.enemies);
    }
    
    update() {
        // Update health bar position
        if (this.healthBarBg && this.healthBar) {
            this.healthBarBg.x = this.sprite.x;
            this.healthBarBg.y = this.sprite.y - 20;
            this.healthBar.x = this.sprite.x;
            this.healthBar.y = this.sprite.y - 20;
            
            // Update health bar width
            const healthPercent = this.hp / this.maxHp;
            this.healthBar.width = 30 * healthPercent;
        }
        
        // Basic AI - move toward player
        this.moveTowardPlayer();
        
        // Shooter enemy specific behavior
        if (this.type === 'SHOOTER') {
            this.updateShooterBehavior();
        }
        
        // Check if enemy is offscreen for culling
        this.checkOffscreen();
    }
    
    moveTowardPlayer() {
        const player = this.scene.player.sprite;
        
        // Calculate direction to player
        const dx = player.x - this.sprite.x;
        const dy = player.y - this.sprite.y;
        const angle = Math.atan2(dy, dx);
        
        // Set velocity
        this.sprite.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        // Rotate enemy to face player
        this.sprite.rotation = angle + Math.PI / 2;
    }
    
    updateShooterBehavior() {
        const now = this.scene.time.now;
        const stats = Config.ENEMY_STATS.SHOOTER;
        
        // Check if it's time to fire
        if (now - this.lastFireTime >= stats.fireRate) {
            this.fireProjectile();
            this.lastFireTime = now;
        }
    }
    
    fireProjectile() {
        const player = this.scene.player.sprite;
        
        // Create projectile at enemy position
        const projectile = this.scene.projectiles.create(
            this.sprite.x, this.sprite.y, 'enemy-projectile'
        );
        
        // Set projectile properties
        projectile.setOrigin(0.5);
        projectile.setDepth(4);
        projectile.damage = Config.ENEMY_STATS.SHOOTER.projectileDamage;
        projectile.isEnemyProjectile = true;
        
        // Calculate direction to player
        const dx = player.x - this.sprite.x;
        const dy = player.y - this.sprite.y;
        const angle = Math.atan2(dy, dx);
        
        // Set velocity
        const speed = Config.ENEMY_STATS.SHOOTER.projectileSpeed;
        projectile.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        // Add collision with player
        this.scene.physics.add.overlap(
            projectile, player, this.onProjectileHitPlayer, null, this
        );
        
        // Add collision with obstacles
        this.scene.physics.add.collider(projectile, this.scene.obstacles, (projectile) => {
            projectile.destroy();
        });
        
        // Set lifetime
        this.scene.time.delayedCall(3000, () => {
            if (projectile.active) {
                projectile.destroy();
            }
        });
    }
    
    onProjectileHitPlayer(projectile, player) {
        // Deal damage to player
        this.scene.player.takeDamage(projectile.damage);
        
        // Destroy projectile
        projectile.destroy();
    }
    
    onCollideWithPlayer(enemySprite, playerSprite) {
        // Only deal damage every 0.5 seconds to avoid rapid damage
        const now = this.scene.time.now;
        if (now - this.lastDamageTime < 500) return;
        
        // Deal damage to player
        this.scene.player.takeDamage(this.damage);
        this.lastDamageTime = now;
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        
        // Update health bar
        if (this.healthBar) {
            const healthPercent = Math.max(0, this.hp / this.maxHp);
            this.healthBar.width = 30 * healthPercent;
        }
        
        // Flash the enemy
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.5,
            duration: 50,
            yoyo: true
        });
        
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    die() {
        // Award XP to player
        this.scene.player.gainXP(this.xpValue);
        
        // Notify for kill count and power-up spawning
        this.scene.onEnemyKilled();
        
        // Clean up health bars
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBar) this.healthBar.destroy();
        
        // Destroy sprite
        this.sprite.destroy();
    }
    
    checkOffscreen() {
        const camera = this.scene.cameras.main;
        const margin = 100; // Add margin to avoid popping in/out of optimization
        
        const isOffscreen = 
            this.sprite.x < camera.scrollX - margin ||
            this.sprite.x > camera.scrollX + camera.width + margin ||
            this.sprite.y < camera.scrollY - margin ||
            this.sprite.y > camera.scrollY + camera.height + margin;
        
        // Optimize if state changed
        if (isOffscreen !== this.isOffscreen) {
            this.isOffscreen = isOffscreen;
            
            if (isOffscreen) {
                // Reduce physics update rate for offscreen enemies
                this.sprite.body.setVelocity(0, 0);
                this.sprite.body.sleeping = true;
                
                // Hide health bars
                if (this.healthBarBg) this.healthBarBg.visible = false;
                if (this.healthBar) this.healthBar.visible = false;
            } else {
                // Restore normal physics for onscreen enemies
                this.sprite.body.sleeping = false;
                
                // Show health bars
                if (this.healthBarBg) this.healthBarBg.visible = true;
                if (this.healthBar) this.healthBar.visible = true;
            }
        }
    }
} 