// Player class
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up player properties
        this.health = CONFIG.player.maxHealth;
        this.maxHealth = CONFIG.player.maxHealth;
        this.speed = CONFIG.player.speed;
        this.size = CONFIG.player.size;
        
        // Set up player physics
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setCircle(this.size / 2);
        
        // Set up player graphics (SVG-style circle)
        this.playerGraphics = scene.add.graphics();
        this.updatePlayerGraphics();
        
        // Set up player level and XP
        this.level = 0;
        this.xp = 0;
        this.xpToNextLevel = CONFIG.leveling.getXpForLevel(this.level);
        
        // Set up weapons array (5 slots)
        this.weapons = new Array(CONFIG.weapons.maxWeapons).fill(null);
        
        // Input handling
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        
        // Mobile controls
        this.touchJoystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            graphics: scene.add.graphics()
        };
        
        // Set up touch input
        scene.input.on('pointerdown', this.onPointerDown, this);
        scene.input.on('pointermove', this.onPointerMove, this);
        scene.input.on('pointerup', this.onPointerUp, this);
        
        // Power-up effects
        this.powerUps = {
            speed: {
                active: false,
                multiplier: 1,
                timer: null
            },
            fireRate: {
                active: false,
                multiplier: 1,
                timer: null
            }
        };
    }
    
    // Update player graphics
    updatePlayerGraphics() {
        this.playerGraphics.clear();
        
        // Draw player body (blue circle)
        this.playerGraphics.fillStyle(0x3498db);
        this.playerGraphics.fillCircle(this.x, this.y, this.size / 2);
        
        // Draw health indicator (green arc)
        const healthPercent = this.health / this.maxHealth;
        this.playerGraphics.fillStyle(0x2ecc71);
        this.playerGraphics.slice(
            this.x, 
            this.y, 
            this.size / 2 + 5, 
            Phaser.Math.DegToRad(270), 
            Phaser.Math.DegToRad(270 + 360 * healthPercent),
            true
        );
        this.playerGraphics.fillPath();
    }
    
    // Handle touch input start
    onPointerDown(pointer) {
        // Only activate joystick on primary button (left click or touch)
        if (pointer.button !== 0) return;
        
        this.touchJoystick.active = true;
        this.touchJoystick.startX = pointer.x;
        this.touchJoystick.startY = pointer.y;
        this.touchJoystick.currentX = pointer.x;
        this.touchJoystick.currentY = pointer.y;
        
        this.updateJoystickGraphics();
    }
    
    // Handle touch input movement
    onPointerMove(pointer) {
        if (!this.touchJoystick.active) return;
        
        this.touchJoystick.currentX = pointer.x;
        this.touchJoystick.currentY = pointer.y;
        
        this.updateJoystickGraphics();
    }
    
    // Handle touch input end
    onPointerUp() {
        this.touchJoystick.active = false;
        this.touchJoystick.graphics.clear();
    }
    
    // Update joystick graphics
    updateJoystickGraphics() {
        const g = this.touchJoystick.graphics;
        g.clear();
        
        if (!this.touchJoystick.active) return;
        
        // Draw joystick base
        g.fillStyle(0xffffff, 0.3);
        g.fillCircle(this.touchJoystick.startX, this.touchJoystick.startY, 50);
        
        // Draw joystick handle
        g.fillStyle(0xffffff, 0.5);
        
        // Calculate distance and angle
        const dx = this.touchJoystick.currentX - this.touchJoystick.startX;
        const dy = this.touchJoystick.currentY - this.touchJoystick.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Limit handle position to joystick radius
        const maxDistance = 50;
        const limitedDistance = Math.min(distance, maxDistance);
        const angle = Math.atan2(dy, dx);
        
        const handleX = this.touchJoystick.startX + Math.cos(angle) * limitedDistance;
        const handleY = this.touchJoystick.startY + Math.sin(angle) * limitedDistance;
        
        g.fillCircle(handleX, handleY, 25);
    }
    
    // Add XP and check for level up
    addXP(amount) {
        this.xp += amount;
        
        // Check for level up
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
            return true;
        }
        
        return false;
    }
    
    // Level up the player
    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = CONFIG.leveling.getXpForLevel(this.level);
        
        // Pause the game for level up UI
        this.scene.scene.pause();
        this.scene.scene.launch('levelUpScene', { player: this });
    }
    
    // Take damage
    takeDamage(amount) {
        this.health -= amount;
        
        // Flash red when taking damage
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 1
        });
        
        // Check for game over
        if (this.health <= 0) {
            this.health = 0;
            this.scene.handleGameOver();
        }
    }
    
    // Heal the player
    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
    
    // Add a weapon to the first empty slot
    addWeapon(weaponType) {
        const emptySlot = this.weapons.findIndex(slot => slot === null);
        
        if (emptySlot === -1) {
            console.log('No empty weapon slots');
            return false;
        }
        
        // Create the weapon based on type
        let weapon;
        switch (weaponType) {
            case 'bullet':
                weapon = new BulletWeapon(this.scene, this);
                break;
            case 'aura':
                weapon = new AuraWeapon(this.scene, this);
                break;
            case 'hammer':
                weapon = new HammerWeapon(this.scene, this);
                break;
            case 'whip':
                weapon = new WhipWeapon(this.scene, this);
                break;
            default:
                console.error('Unknown weapon type:', weaponType);
                return false;
        }
        
        this.weapons[emptySlot] = weapon;
        return true;
    }
    
    // Upgrade a weapon at the specified slot
    upgradeWeapon(slot, upgradeType) {
        if (slot < 0 || slot >= this.weapons.length || !this.weapons[slot]) {
            console.error('Invalid weapon slot:', slot);
            return false;
        }
        
        this.weapons[slot].upgrade(upgradeType);
        return true;
    }
    
    // Apply a power-up effect
    applyPowerUp(type) {
        switch (type) {
            case 'health':
                this.heal(CONFIG.powerUps.types.health.value);
                break;
                
            case 'speed':
                // Clear existing timer if active
                if (this.powerUps.speed.timer) {
                    this.powerUps.speed.timer.remove();
                }
                
                // Apply speed boost
                this.powerUps.speed.active = true;
                this.powerUps.speed.multiplier = CONFIG.powerUps.types.speed.multiplier;
                
                // Set timer to remove effect
                this.powerUps.speed.timer = this.scene.time.delayedCall(
                    CONFIG.powerUps.duration,
                    () => {
                        this.powerUps.speed.active = false;
                        this.powerUps.speed.multiplier = 1;
                    },
                    null,
                    this
                );
                break;
                
            case 'fireRate':
                // Clear existing timer if active
                if (this.powerUps.fireRate.timer) {
                    this.powerUps.fireRate.timer.remove();
                }
                
                // Apply fire rate boost
                this.powerUps.fireRate.active = true;
                this.powerUps.fireRate.multiplier = CONFIG.powerUps.types.fireRate.multiplier;
                
                // Set timer to remove effect
                this.powerUps.fireRate.timer = this.scene.time.delayedCall(
                    CONFIG.powerUps.duration,
                    () => {
                        this.powerUps.fireRate.active = false;
                        this.powerUps.fireRate.multiplier = 1;
                    },
                    null,
                    this
                );
                break;
                
            default:
                console.error('Unknown power-up type:', type);
                return false;
        }
        
        return true;
    }
    
    // Update method called every frame
    update() {
        // Handle movement input
        this.handleMovement();
        
        // Update weapons
        this.weapons.forEach(weapon => {
            if (weapon) weapon.update();
        });
        
        // Update player graphics
        this.updatePlayerGraphics();
    }
    
    // Handle player movement
    handleMovement() {
        // Reset velocity
        this.setVelocity(0);
        
        // Calculate effective speed with power-up
        const effectiveSpeed = this.speed * this.powerUps.speed.multiplier;
        
        // Handle keyboard input (WASD or arrow keys)
        const keyboard = {
            up: this.cursors.up.isDown || this.wasd.up.isDown,
            down: this.cursors.down.isDown || this.wasd.down.isDown,
            left: this.cursors.left.isDown || this.wasd.left.isDown,
            right: this.cursors.right.isDown || this.wasd.right.isDown
        };
        
        if (keyboard.up) this.setVelocityY(-effectiveSpeed);
        if (keyboard.down) this.setVelocityY(effectiveSpeed);
        if (keyboard.left) this.setVelocityX(-effectiveSpeed);
        if (keyboard.right) this.setVelocityX(effectiveSpeed);
        
        // Handle touch joystick input
        if (this.touchJoystick.active) {
            const dx = this.touchJoystick.currentX - this.touchJoystick.startX;
            const dy = this.touchJoystick.currentY - this.touchJoystick.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) { // Small deadzone
                const maxDistance = 50;
                const speedFactor = Math.min(distance / maxDistance, 1);
                
                const angle = Math.atan2(dy, dx);
                const vx = Math.cos(angle) * effectiveSpeed * speedFactor;
                const vy = Math.sin(angle) * effectiveSpeed * speedFactor;
                
                this.setVelocity(vx, vy);
            }
        }
        
        // Normalize diagonal movement
        if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
            this.body.velocity.normalize().scale(effectiveSpeed);
        }
    }
} 