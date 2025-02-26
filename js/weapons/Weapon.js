/**
 * Weapon - Base class for all weapons
 */
class Weapon {
    /**
     * Create a new weapon
     * @param {Phaser.Scene} scene - The scene the weapon belongs to
     * @param {Player} player - The player that owns this weapon
     * @param {string} type - Weapon type from CONFIG.WEAPONS
     */
    constructor(scene, player, type) {
        this.scene = scene;
        this.player = player;
        this.type = type;
        this.config = CONFIG.WEAPONS[type];
        
        // Weapon stats
        this.name = this.config.name;
        this.damage = this.config.damage;
        this.cooldown = this.config.cooldown;
        this.lastFireTime = 0;
        
        // Upgrade levels
        this.upgradeLevels = {};
        
        // Initialize upgrade levels
        for (const upgradeType in this.config.upgrades) {
            this.upgradeLevels[upgradeType] = 0;
        }
    }
    
    /**
     * Update weapon logic
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Check if we can fire
        if (this.canFire(time)) {
            this.fire(time);
        }
    }
    
    /**
     * Check if weapon can fire
     * @param {number} time - Current time
     * @returns {boolean} True if weapon can fire
     */
    canFire(time) {
        // Apply fire rate multiplier from player
        const adjustedCooldown = this.cooldown * this.player.fireRateMultiplier;
        
        return time - this.lastFireTime >= adjustedCooldown;
    }
    
    /**
     * Fire the weapon
     * @param {number} time - Current time
     */
    fire(time) {
        // Update last fire time
        this.lastFireTime = time;
        
        // Implemented by subclasses
    }
    
    /**
     * Get available upgrade types
     * @returns {Array} Array of available upgrade types
     */
    getAvailableUpgrades() {
        const available = [];
        
        for (const upgradeType in this.config.upgrades) {
            // Check if we have more upgrades available
            if (this.upgradeLevels[upgradeType] < this.config.upgrades[upgradeType].length) {
                available.push(upgradeType);
            }
        }
        
        return available;
    }
    
    /**
     * Get the next upgrade value for a specific upgrade type
     * @param {string} upgradeType - Type of upgrade
     * @returns {number} Value of the next upgrade
     */
    getNextUpgradeValue(upgradeType) {
        const currentLevel = this.upgradeLevels[upgradeType];
        return this.config.upgrades[upgradeType][currentLevel];
    }
    
    /**
     * Upgrade the weapon
     * @param {string} upgradeType - Type of upgrade
     */
    upgrade(upgradeType) {
        // Check if upgrade is available
        if (!this.getAvailableUpgrades().includes(upgradeType)) {
            return false;
        }
        
        // Get upgrade value
        const upgradeValue = this.getNextUpgradeValue(upgradeType);
        
        // Apply upgrade
        switch (upgradeType) {
            case 'damage':
                this.damage += upgradeValue;
                break;
            case 'cooldown':
                this.cooldown += upgradeValue; // Note: cooldown upgrades are negative
                if (this.cooldown < 50) this.cooldown = 50; // Minimum cooldown
                break;
            // Other upgrade types handled by subclasses
        }
        
        // Increment upgrade level
        this.upgradeLevels[upgradeType]++;
        
        return true;
    }
    
    /**
     * Get weapon data for saving
     * @returns {Object} Weapon data
     */
    getData() {
        return {
            type: this.type,
            damage: this.damage,
            cooldown: this.cooldown,
            upgradeLevels: { ...this.upgradeLevels }
        };
    }
    
    /**
     * Load weapon data
     * @param {Object} data - Weapon data
     */
    loadData(data) {
        this.damage = data.damage;
        this.cooldown = data.cooldown;
        this.upgradeLevels = { ...data.upgradeLevels };
    }
} 