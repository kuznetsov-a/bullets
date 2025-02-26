// Base Weapon class
class Weapon {
    constructor(scene, player, type) {
        this.scene = scene;
        this.player = player;
        this.type = type;
        
        // Get weapon config
        this.config = CONFIG.weapons.types[type];
        
        // Set up weapon properties
        this.level = 1;
        this.damage = this.config.baseDamage;
        this.cooldown = this.config.baseCooldown;
        
        // Cooldown tracking
        this.lastFired = 0;
        this.isReady = true;
        
        // Graphics for weapon visualization
        this.graphics = scene.add.graphics();
    }
    
    // Update method called every frame
    update() {
        // Check if weapon is ready to fire
        const now = this.scene.time.now;
        
        if (!this.isReady && now - this.lastFired >= this.getEffectiveCooldown()) {
            this.isReady = true;
        }
        
        // Auto-fire if ready
        if (this.isReady) {
            this.fire();
        }
    }
    
    // Fire the weapon
    fire() {
        // To be implemented by subclasses
        console.warn('fire() method not implemented for base Weapon class');
        
        // Update cooldown
        this.lastFired = this.scene.time.now;
        this.isReady = false;
    }
    
    // Get effective cooldown with power-up
    getEffectiveCooldown() {
        if (this.player.powerUps.fireRate.active) {
            return this.cooldown / this.player.powerUps.fireRate.multiplier;
        }
        return this.cooldown;
    }
    
    // Get cooldown progress (0-1)
    getCooldownProgress() {
        if (this.isReady) return 1;
        
        const elapsed = this.scene.time.now - this.lastFired;
        const progress = elapsed / this.getEffectiveCooldown();
        
        return Math.min(progress, 1);
    }
    
    // Upgrade the weapon
    upgrade(upgradeType) {
        this.level++;
        
        switch (upgradeType) {
            case 'damage':
                this.damage += this.config.upgradePerLevel.damage;
                break;
                
            case 'cooldown':
                this.cooldown = Math.max(
                    this.cooldown - this.config.upgradePerLevel.cooldown,
                    50 // Minimum cooldown of 50ms
                );
                break;
                
            default:
                console.error('Unknown upgrade type:', upgradeType);
                return false;
        }
        
        return true;
    }
    
    // Clean up resources
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
} 