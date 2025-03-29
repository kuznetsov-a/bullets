import { Weapon } from './Weapon.js';

export class BulletWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, 'BULLET');
        this.bulletSpeed = 400;
        this.bulletLifetime = 1000; // Time in ms before bullet disappears
    }
    
    fire() {
        const player = this.player.sprite;
        
        // Create bullet at player position
        const bullet = this.scene.projectiles.create(player.x, player.y, 'weapon-bullet');
        
        // Set bullet properties
        bullet.setOrigin(0.5);
        bullet.setDepth(5);
        bullet.damage = this.damage;
        bullet.weaponType = this.type;
        
        // Calculate direction (forward relative to player rotation)
        const angle = player.rotation - Math.PI / 2; // Adjust for sprite orientation
        const vx = Math.cos(angle);
        const vy = Math.sin(angle);
        
        // Set velocity
        bullet.setVelocity(vx * this.bulletSpeed, vy * this.bulletSpeed);
        
        // Set lifetime
        this.scene.time.delayedCall(this.bulletLifetime, () => {
            if (bullet.active) {
                bullet.destroy();
            }
        });
        
        // Add collision with enemies
        this.scene.physics.add.overlap(bullet, this.scene.enemies, this.onBulletHitEnemy, null, this);
        
        // Add collision with obstacles
        this.scene.physics.add.collider(bullet, this.scene.obstacles, (bullet) => {
            bullet.destroy();
        });
    }
    
    onBulletHitEnemy(bullet, enemy) {
        // Deal damage to enemy
        enemy.takeDamage(bullet.damage);
        
        // Destroy bullet
        bullet.destroy();
    }
} 