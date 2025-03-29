import { Weapon } from './Weapon.js';
import { Config } from '../Config.js';

export class WhipWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, 'WHIP');
        
        // Whip specific properties
        this.arcAngle = Config.WEAPON_STATS.WHIP.baseArcAngle;
        this.baseArcAngle = Config.WEAPON_STATS.WHIP.baseArcAngle;
        this.whipLength = 80;
        
        // Create whip sprite for animation
        this.sprite = null; // Will be created during fire()
    }
    
    fire() {
        const player = this.player.sprite;
        
        // Calculate whip direction (forward relative to player rotation)
        const playerAngle = player.rotation - Math.PI / 2; // Adjust for sprite orientation
        
        // Create arc points for whip
        this.createWhipArc(playerAngle);
        
        // Find enemies in the arc
        this.damageEnemiesInArc(playerAngle);
    }
    
    createWhipArc(baseAngle) {
        // Destroy previous whip if exists
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
        
        const player = this.player.sprite;
        
        // Create a new whip sprite
        this.sprite = this.scene.add.image(player.x, player.y, 'weapon-whip');
        this.sprite.setOrigin(0, 0.5);
        this.sprite.setDepth(6);
        
        // Set up whip animation
        this.sprite.rotation = baseAngle - this.arcAngle / 2;
        
        // Scale whip to appropriate length
        this.sprite.scaleX = this.whipLength / 40;
        
        // Animate the whip arc
        this.scene.tweens.add({
            targets: this.sprite,
            rotation: baseAngle + this.arcAngle / 2,
            duration: 300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                if (this.sprite && this.sprite.active) {
                    this.sprite.destroy();
                    this.sprite = null;
                }
            }
        });
    }
    
    damageEnemiesInArc(baseAngle) {
        const player = this.player.sprite;
        const enemies = this.scene.enemies.getChildren();
        const hitEnemies = new Set();
        
        for (const enemy of enemies) {
            if (!enemy.active || hitEnemies.has(enemy)) continue;
            
            // Calculate angle and distance to enemy
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.whipLength) {
                // Calculate angle to enemy
                let angle = Math.atan2(dy, dx);
                
                // Normalize angles for comparison
                const startAngle = Phaser.Math.Normalize(baseAngle - this.arcAngle / 2);
                const endAngle = Phaser.Math.Normalize(baseAngle + this.arcAngle / 2);
                angle = Phaser.Math.Normalize(angle);
                
                // Check if enemy is within arc
                let inArc = false;
                
                if (startAngle < endAngle) {
                    inArc = angle >= startAngle && angle <= endAngle;
                } else {
                    // Arc crosses the 0/2π boundary
                    inArc = angle >= startAngle || angle <= endAngle;
                }
                
                if (inArc) {
                    // Deal damage to enemy
                    enemy.takeDamage(this.damage);
                    hitEnemies.add(enemy);
                }
            }
        }
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
            case 'arc':
                this.arcAngle = Math.min(Math.PI * 2, this.arcAngle + stats.arcAngleUpgrade);
                break;
            default:
                return false;
        }
        
        return true;
    }
    
    toJSON() {
        const data = super.toJSON();
        data.arcAngle = this.arcAngle;
        return data;
    }
    
    fromJSON(data) {
        super.fromJSON(data);
        this.arcAngle = data.arcAngle || this.baseArcAngle;
    }
} 