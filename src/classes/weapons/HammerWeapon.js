import { Weapon } from './Weapon.js';
import { Config } from '../Config.js';

export class HammerWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, 'HAMMER');
        
        // Hammer specific properties
        this.rotationSpeed = Config.WEAPON_STATS.HAMMER.baseRotationSpeed;
        this.baseRotationSpeed = Config.WEAPON_STATS.HAMMER.baseRotationSpeed;
        this.distance = 60; // Distance from player
        this.angle = 0; // Current angle
        
        // Create hammer visual
        this.sprite = scene.physics.add.image(0, 0, 'weapon-hammer');
        this.sprite.setOrigin(0.5);
        this.sprite.setDepth(7);
        this.sprite.body.setSize(15, 15);
        
        // Set initial position
        this.updateHammerPosition();
        
        // Add damage property to the hammer
        this.sprite.damage = this.damage;
        this.sprite.weaponType = this.type;
        
        // Add collision with enemies
        scene.physics.add.overlap(this.sprite, scene.enemies, this.onHammerHitEnemy, null, this);
    }
    
    update() {
        // Important: Don't call super.update() here as we don't want the default firing behavior
        
        // Update hammer position to follow player
        if (this.sprite && this.player && this.player.sprite) {
            // Rotate the hammer around the player
            this.angle += this.rotationSpeed;
            this.updateHammerPosition();
            
            // Update damage value (in case it changed via upgrades)
            this.sprite.damage = this.damage;
        }
    }
    
    updateHammerPosition() {
        // Calculate position based on angle and distance
        const x = this.player.sprite.x + Math.cos(this.angle) * this.distance;
        const y = this.player.sprite.y + Math.sin(this.angle) * this.distance;
        
        // Update position
        this.sprite.x = x;
        this.sprite.y = y;
        
        // Update rotation
        this.sprite.rotation = this.angle + Math.PI / 4;
    }
    
    fire() {
        // Hammer is passive, no active firing
    }
    
    onHammerHitEnemy(hammer, enemy) {
        // Deal damage to enemy
        enemy.takeDamage(hammer.damage);
    }
    
    upgrade(type) {
        const stats = Config.WEAPON_STATS[this.type];
        if (!stats) return false;
        
        this.level++;
        
        switch (type) {
            case 'damage':
                this.damage += stats.damageUpgrade;
                break;
            case 'rotation':
                this.rotationSpeed += stats.rotationSpeedUpgrade;
                break;
            default:
                return false;
        }
        
        return true;
    }
    
    toJSON() {
        const data = super.toJSON();
        data.rotationSpeed = this.rotationSpeed;
        data.angle = this.angle;
        return data;
    }
    
    fromJSON(data) {
        super.fromJSON(data);
        this.rotationSpeed = data.rotationSpeed || this.baseRotationSpeed;
        this.angle = data.angle || 0;
    }
} 