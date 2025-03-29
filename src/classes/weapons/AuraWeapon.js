import { Weapon } from './Weapon.js';
import { Config } from '../Config.js';

export class AuraWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, 'AURA');
        
        // Aura specific properties
        this.radius = Config.WEAPON_STATS.AURA.baseRadius;
        this.baseRadius = Config.WEAPON_STATS.AURA.baseRadius;
        
        // Create aura visual effect
        this.sprite = scene.add.image(player.sprite.x, player.sprite.y, 'weapon-aura');
        this.sprite.setOrigin(0.5);
        this.sprite.setDepth(3);
        this.sprite.setAlpha(0.3);
        this.sprite.setScale(this.radius / 25); // Adjust scale based on radius
    }
    
    update() {
        super.update();
        
        // Update aura position to follow player
        if (this.sprite && this.player && this.player.sprite) {
            this.sprite.x = this.player.sprite.x;
            this.sprite.y = this.player.sprite.y;
        }
    }
    
    fire() {
        // Find all enemies within the aura radius
        const enemies = this.scene.enemies.getChildren();
        const playerX = this.player.sprite.x;
        const playerY = this.player.sprite.y;
        
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            
            const distance = Phaser.Math.Distance.Between(
                playerX, playerY, enemy.x, enemy.y
            );
            
            if (distance <= this.radius) {
                // Deal damage to enemy
                enemy.takeDamage(this.damage);
            }
        }
        
        // Visual pulse effect
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 0.5, to: 0.3 },
            duration: 500,
            ease: 'Sine.easeOut'
        });
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
            case 'radius':
                this.radius += stats.radiusUpgrade;
                this.sprite.setScale(this.radius / 25);
                break;
            default:
                return false;
        }
        
        return true;
    }
    
    toJSON() {
        const data = super.toJSON();
        data.radius = this.radius;
        return data;
    }
    
    fromJSON(data) {
        super.fromJSON(data);
        this.radius = data.radius || this.baseRadius;
        if (this.sprite) {
            this.sprite.setScale(this.radius / 25);
        }
    }
} 