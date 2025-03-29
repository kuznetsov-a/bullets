import { Config } from './Config.js';
import { BulletWeapon } from './weapons/BulletWeapon.js';
import { AuraWeapon } from './weapons/AuraWeapon.js';
import { HammerWeapon } from './weapons/HammerWeapon.js';
import { WhipWeapon } from './weapons/WhipWeapon.js';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.hp = Config.INITIAL_PLAYER_HP;
        this.maxHp = Config.INITIAL_PLAYER_HP;
        this.level = 1;
        this.xp = 0;
        this.nextLevelXp = Config.LEVEL_XP_STEPS[0];
        this.weapons = [];
        this.speed = 200;
        this.baseSpeed = 200;
        this.speedMultiplier = 1;
        this.fireRateMultiplier = 1;
        this.activeEffects = [];
        
        // Create player sprite
        const mapSize = Config.MAP_SIZE;
        this.sprite = scene.physics.add.sprite(
            mapSize * 16, // Center of map X
            mapSize * 16, // Center of map Y
            'player'
        );
        
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDepth(10);
        this.sprite.body.setSize(24, 24);
        
        // Add collision with obstacles
        scene.physics.add.collider(this.sprite, scene.obstacles);
        
        // Add initial weapon (bullet)
        this.addWeapon('BULLET');
    }
    
    update() {
        this.handleMovement();
        this.updateWeapons();
        this.updateEffects();
    }
    
    handleMovement() {
        const { controls, joystick } = this.scene;
        let vx = 0;
        let vy = 0;
        
        // Keyboard controls (desktop)
        if (controls) {
            if (controls.left.isDown) vx = -1;
            else if (controls.right.isDown) vx = 1;
            
            if (controls.up.isDown) vy = -1;
            else if (controls.down.isDown) vy = 1;
        }
        
        // Joystick controls (mobile)
        if (joystick && joystick.active) {
            vx = joystick.position.x;
            vy = joystick.position.y;
        }
        
        // Normalize diagonal movement
        if (vx !== 0 && vy !== 0) {
            const length = Math.sqrt(vx * vx + vy * vy);
            vx /= length;
            vy /= length;
        }
        
        // Apply speed and set velocity
        this.sprite.setVelocity(
            vx * this.speed,
            vy * this.speed
        );
        
        // Rotate player to face movement direction
        if (vx !== 0 || vy !== 0) {
            const angle = Math.atan2(vy, vx);
            this.sprite.rotation = angle + Math.PI / 2; // Adjust for sprite orientation
        }
    }
    
    updateWeapons() {
        for (const weapon of this.weapons) {
            weapon.update();
        }
    }
    
    updateEffects() {
        const now = Date.now();
        const expiredEffects = [];
        
        // Update active effects and track expired ones
        for (let i = 0; i < this.activeEffects.length; i++) {
            const effect = this.activeEffects[i];
            
            if (now >= effect.endTime) {
                expiredEffects.push(i);
                // Revert effect
                this.applyEffectRevert(effect);
            }
        }
        
        // Remove expired effects (in reverse order to avoid index issues)
        for (let i = expiredEffects.length - 1; i >= 0; i--) {
            this.activeEffects.splice(expiredEffects[i], 1);
        }
    }
    
    applyEffect(type, value, duration) {
        // Add new effect
        const effect = {
            type: type,
            value: value,
            endTime: Date.now() + duration
        };
        
        this.activeEffects.push(effect);
        
        // Apply effect immediately
        this.applyEffectStart(effect);
    }
    
    applyEffectStart(effect) {
        switch (effect.type) {
            case 'speed':
                this.speedMultiplier *= effect.value;
                this.updateSpeed();
                break;
            case 'firerate':
                this.fireRateMultiplier *= effect.value;
                break;
        }
    }
    
    applyEffectRevert(effect) {
        switch (effect.type) {
            case 'speed':
                this.speedMultiplier /= effect.value;
                this.updateSpeed();
                break;
            case 'firerate':
                this.fireRateMultiplier /= effect.value;
                break;
        }
    }
    
    updateSpeed() {
        this.speed = this.baseSpeed * this.speedMultiplier;
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }
    
    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
    }
    
    die() {
        this.scene.gameOver();
    }
    
    addWeapon(type) {
        if (this.weapons.length >= Config.MAX_WEAPONS) {
            return false;
        }
        
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
        
        this.weapons.push(weapon);
        return true;
    }
    
    upgradeWeapon(index, upgradeType) {
        if (index < 0 || index >= this.weapons.length) {
            return false;
        }
        
        return this.weapons[index].upgrade(upgradeType);
    }
    
    gainXP(amount) {
        this.xp += amount;
        this.checkLevelUp();
    }
    
    checkLevelUp() {
        if (this.xp >= this.nextLevelXp) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        
        // Set next level XP threshold
        if (this.level - 1 < Config.LEVEL_XP_STEPS.length) {
            this.nextLevelXp = Config.LEVEL_XP_STEPS[this.level - 1];
        } else {
            // For levels beyond the defined steps, double the previous requirement
            this.nextLevelXp *= 2;
        }
        
        // Show level up UI to select upgrade
        this.scene.uiManager.showLevelUpOptions();
    }
    
    applySpeedBoost(value, duration) {
        this.applyEffect('speed', value, duration);
    }
    
    applyFireRateBoost(value, duration) {
        this.applyEffect('firerate', value, duration);
    }
    
    getAvailableWeaponTypes() {
        const allTypes = ['BULLET', 'AURA', 'HAMMER', 'WHIP'];
        const currentTypes = this.weapons.map(w => w.type);
        
        // Filter out weapon types that are already at max count
        // (in this case, we're allowing duplicates, so return all types)
        return allTypes;
    }
    
    toJSON() {
        return {
            hp: this.hp,
            maxHp: this.maxHp,
            level: this.level,
            xp: this.xp,
            nextLevelXp: this.nextLevelXp,
            weapons: this.weapons.map(w => w.toJSON()),
            x: this.sprite.x,
            y: this.sprite.y
        };
    }
    
    fromJSON(data) {
        this.hp = data.hp;
        this.maxHp = data.maxHp;
        this.level = data.level;
        this.xp = data.xp;
        this.nextLevelXp = data.nextLevelXp;
        
        // Clear existing weapons
        this.weapons = [];
        
        // Recreate weapons from saved data
        for (const weaponData of data.weapons) {
            let weapon;
            
            switch (weaponData.type) {
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
            }
            
            if (weapon) {
                weapon.fromJSON(weaponData);
                this.weapons.push(weapon);
            }
        }
        
        // Update player position
        this.sprite.setPosition(data.x, data.y);
    }
} 