/**
 * Player - The main player character
 */
class Player {
    /**
     * Create a new player
     * @param {Phaser.Scene} scene - The scene the player belongs to
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     */
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Create player sprite
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDepth(10);
        
        // Set up physics body
        this.sprite.body.setSize(40, 40);
        
        // Player stats
        this.maxHp = CONFIG.PLAYER_MAX_HP;
        this.hp = this.maxHp;
        this.speed = CONFIG.PLAYER_SPEED;
        this.baseSpeed = CONFIG.PLAYER_SPEED;
        
        // Leveling
        this.level = 1;
        this.xp = 0;
        this.nextLevelXp = CONFIG.XP_LEVELS[0];
        
        // Weapons
        this.weapons = [];
        
        // Power-up timers
        this.speedBoostTimer = null;
        this.fireRateBoostTimer = null;
        this.fireRateMultiplier = 1;
        
        // Add initial weapon (bullet)
        this.addWeapon('BULLET');
    }
    
    /**
     * Update player logic
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Handle movement
        this.handleMovement();
        
        // Update weapons
        this.weapons.forEach(weapon => weapon.update(time, delta));
    }
    
    /**
     * Handle player movement based on input
     */
    handleMovement() {
        // Get input
        const cursors = this.scene.cursors;
        const wasd = this.scene.wasd;
        
        // Reset velocity
        let velocityX = 0;
        let velocityY = 0;
        
        // Handle keyboard input (if not mobile)
        if (!this.scene.isMobile()) {
            // Horizontal movement
            if (cursors.left.isDown || wasd.left.isDown) {
                velocityX = -this.speed;
            } else if (cursors.right.isDown || wasd.right.isDown) {
                velocityX = this.speed;
            }
            
            // Vertical movement
            if (cursors.up.isDown || wasd.up.isDown) {
                velocityY = -this.speed;
            } else if (cursors.down.isDown || wasd.down.isDown) {
                velocityY = this.speed;
            }
            
            // Normalize diagonal movement
            if (velocityX !== 0 && velocityY !== 0) {
                const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                velocityX = (velocityX / length) * this.speed;
                velocityY = (velocityY / length) * this.speed;
            }
            
            // Apply velocity
            this.setVelocity(velocityX, velocityY);
        }
    }
    
    /**
     * Set player velocity
     * @param {number} x - X velocity
     * @param {number} y - Y velocity
     */
    setVelocity(x, y) {
        this.sprite.setVelocity(x, y);
    }
    
    /**
     * Add a new weapon to the player
     * @param {string} type - Weapon type from CONFIG.WEAPONS
     */
    addWeapon(type) {
        // Check if we have max weapons
        if (this.weapons.length >= CONFIG.MAX_WEAPONS) {
            return false;
        }
        
        // Create weapon based on type
        let weapon;
        switch (type) {
            case 'BULLET':
                weapon = new BulletWeapon(this.scene, this);
                break;
            case 'AURA':
                weapon = new AuraWeapon(this.scene, this);
                break;
            case 'HAMMER':
                weapon = new HammerWeapon(this.scene, this);
                break;
            case 'WHIP':
                weapon = new WhipWeapon(this.scene, this);
                break;
            default:
                return false;
        }
        
        // Add to weapons array
        this.weapons.push(weapon);
        
        return true;
    }
    
    /**
     * Apply damage to the player
     * @param {number} amount - Amount of damage to apply
     */
    takeDamage(amount) {
        this.hp -= amount;
        
        // Clamp HP to 0
        if (this.hp < 0) {
            this.hp = 0;
        }
        
        // Flash the player sprite
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
    }
    
    /**
     * Heal the player
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        this.hp += amount;
        
        // Clamp HP to max
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }
    
    /**
     * Increase player's maximum HP
     * @param {number} amount - Amount to increase max HP by
     */
    increaseMaxHP(amount) {
        this.maxHp += amount;
        this.hp += amount;
    }
    
    /**
     * Add XP to the player
     * @param {number} amount - Amount of XP to add
     */
    addXP(amount) {
        this.xp += amount;
    }
    
    /**
     * Check if player has leveled up
     * @returns {boolean} True if player leveled up
     */
    checkLevelUp() {
        if (this.xp >= this.nextLevelXp) {
            this.levelUp();
            return true;
        }
        
        return false;
    }
    
    /**
     * Level up the player
     */
    levelUp() {
        // Increment level
        this.level++;
        
        // Set next level XP threshold
        if (this.level - 1 < CONFIG.XP_LEVELS.length) {
            this.nextLevelXp = CONFIG.XP_LEVELS[this.level - 1];
        } else {
            // If we've exceeded the predefined levels, double the last one
            this.nextLevelXp = this.nextLevelXp * 2;
        }
    }
    
    /**
     * Apply a temporary speed boost
     * @param {number} amount - Amount to boost speed by
     * @param {number} duration - Duration of boost in ms
     */
    applySpeedBoost(amount, duration) {
        // Clear existing timer if any
        if (this.speedBoostTimer) {
            this.speedBoostTimer.remove();
        }
        
        // Apply boost
        this.speed = this.baseSpeed + amount;
        
        // Set timer to revert
        this.speedBoostTimer = this.scene.time.delayedCall(duration, () => {
            this.speed = this.baseSpeed;
            this.speedBoostTimer = null;
        });
    }
    
    /**
     * Apply a temporary fire rate boost
     * @param {number} multiplier - Multiplier for fire rate (lower is faster)
     * @param {number} duration - Duration of boost in ms
     */
    applyFireRateBoost(multiplier, duration) {
        // Clear existing timer if any
        if (this.fireRateBoostTimer) {
            this.fireRateBoostTimer.remove();
        }
        
        // Apply boost
        this.fireRateMultiplier = multiplier;
        
        // Set timer to revert
        this.fireRateBoostTimer = this.scene.time.delayedCall(duration, () => {
            this.fireRateMultiplier = 1;
            this.fireRateBoostTimer = null;
        });
    }
    
    /**
     * Get player data for saving
     * @returns {Object} Player data
     */
    getData() {
        return {
            hp: this.hp,
            maxHp: this.maxHp,
            level: this.level,
            xp: this.xp,
            nextLevelXp: this.nextLevelXp,
            weapons: this.weapons.map(weapon => weapon.getData())
        };
    }
    
    /**
     * Load player data
     * @param {Object} data - Player data
     */
    loadData(data) {
        this.hp = data.hp;
        this.maxHp = data.maxHp;
        this.level = data.level;
        this.xp = data.xp;
        this.nextLevelXp = data.nextLevelXp;
        
        // Clear existing weapons
        this.weapons = [];
        
        // Load weapons
        data.weapons.forEach(weaponData => {
            // Create weapon
            this.addWeapon(weaponData.type);
            
            // Get the weapon we just added
            const weapon = this.weapons[this.weapons.length - 1];
            
            // Load weapon data
            weapon.loadData(weaponData);
        });
    }
} 