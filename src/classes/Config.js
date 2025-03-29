export class Config {
    static MAX_WEAPONS = 5;
    static LEVEL_XP_STEPS = [10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120];
    static ENEMY_SPAWN_RATE_GROWTH = 1.1; // 10% increase per level
    static AUTOSAVE_INTERVAL = 10000; // 10 seconds in ms
    static POWER_UP_SPAWN_RATE = 50; // Every 50 kills
    static MAP_SIZE = 200; // 200x200 units
    static INITIAL_PLAYER_HP = 100;
    
    // Weapon stats
    static WEAPON_STATS = {
        BULLET: {
            baseDamage: 10,
            baseCooldown: 500, // in ms
            damageUpgrade: 5,
            cooldownUpgrade: 50 // in ms
        },
        AURA: {
            baseDamage: 5,
            baseCooldown: 1000,
            damageUpgrade: 2,
            cooldownUpgrade: 100,
            baseRadius: 50,
            radiusUpgrade: 10
        },
        HAMMER: {
            baseDamage: 15,
            baseCooldown: 2000,
            damageUpgrade: 8,
            cooldownUpgrade: 200,
            baseRotationSpeed: 0.05,
            rotationSpeedUpgrade: 0.01
        },
        WHIP: {
            baseDamage: 20,
            baseCooldown: 1500,
            damageUpgrade: 10,
            cooldownUpgrade: 150,
            baseArcAngle: Math.PI / 2,
            arcAngleUpgrade: Math.PI / 16
        }
    };
    
    // Enemy stats
    static ENEMY_STATS = {
        BASIC: {
            hp: 20,
            speed: 40,
            damage: 10,
            xpValue: 1
        },
        FAST: {
            hp: 10,
            speed: 80,
            damage: 5,
            xpValue: 2
        },
        TANK: {
            hp: 60,
            speed: 20,
            damage: 15,
            xpValue: 3
        },
        SHOOTER: {
            hp: 15,
            speed: 30,
            damage: 8,
            projectileDamage: 5,
            projectileSpeed: 100,
            fireRate: 2000, // ms between shots
            xpValue: 4
        }
    };
    
    // Power-up stats
    static POWER_UP_STATS = {
        HEALTH: {
            value: 20, // HP restore amount
            duration: 0 // instant effect
        },
        SPEED: {
            value: 1.5, // Speed multiplier
            duration: 5000 // 5 seconds
        },
        FIRE_RATE: {
            value: 0.5, // Cooldown multiplier (lower is faster)
            duration: 5000 // 5 seconds
        }
    };
} 