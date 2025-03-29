import { Config } from '../Config.js';

export class Weapon {
    constructor(scene, player, type) {
        this.scene = scene;
        this.player = player;
        this.type = type;
        this.level = 1;
        this.lastFired = 0;
        this.cooldown = 1000; // Base cooldown in ms, will be overridden
        this.baseCooldown = 1000;
        this.damage = 10; // Base damage, will be overridden
        this.baseDamage = 10;
        this.sprite = null;
        
        // Initialize stats from config
        this.initStats();
    }
    
    initStats() {
        const stats = Config.WEAPON_STATS[this.type];
        if (stats) {
            this.cooldown = stats.baseCooldown;
            this.baseCooldown = stats.baseCooldown;
            this.damage = stats.baseDamage;
            this.baseDamage = stats.baseDamage;
        }
    }
    
    update() {
        // Check if weapon can fire
        const now = this.scene.time.now;
        const effectiveCooldown = this.cooldown * this.player.fireRateMultiplier;
        
        if (now - this.lastFired >= effectiveCooldown) {
            this.fire();
            this.lastFired = now;
        }
    }
    
    fire() {
        // To be implemented by subclasses
    }
    
    upgrade(type) {
        const stats = Config.WEAPON_STATS[this.type];
        if (!stats) return false;
        
        this.level++;
        
        switch (type) {
            case 'damage':
                this.damage += stats.damageUpgrade;
                break;
            case 'cooldown':
                this.cooldown = Math.max(50, this.cooldown - stats.cooldownUpgrade);
                break;
            default:
                return false;
        }
        
        return true;
    }
    
    getCooldownProgress() {
        // Returns a value between 0 and 1 representing cooldown progress
        // 0 = just fired, 1 = ready to fire
        const now = this.scene.time.now;
        const elapsed = now - this.lastFired;
        const effectiveCooldown = this.cooldown * this.player.fireRateMultiplier;
        
        return Math.min(1, elapsed / effectiveCooldown);
    }
    
    toJSON() {
        return {
            type: this.type,
            level: this.level,
            damage: this.damage,
            cooldown: this.cooldown
        };
    }
    
    fromJSON(data) {
        this.level = data.level;
        this.damage = data.damage;
        this.cooldown = data.cooldown;
    }
} 