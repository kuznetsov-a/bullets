const CONFIG = {
    // Game settings
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    WORLD_WIDTH: 2400,
    WORLD_HEIGHT: 2400,
    
    // Player settings
    PLAYER_SPEED: 200,
    PLAYER_MAX_HP: 100,
    MAX_WEAPONS: 5,
    
    // Leveling system
    XP_LEVELS: [10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120],
    
    // Enemy settings
    ENEMY_SPAWN_RATE_BASE: 1000, // ms between spawns
    ENEMY_SPAWN_RATE_GROWTH: 1.1, // 10% increase per level
    ENEMY_SPAWN_DISTANCE: 600, // Distance from player to spawn enemies
    MAX_ENEMIES: 200,
    
    // Power-up settings
    POWERUP_SPAWN_KILLS: 50, // Spawn a power-up every X kills
    POWERUP_DURATION: 10000, // 10 seconds
    
    // Game state
    AUTOSAVE_INTERVAL: 10000, // 10 seconds
    
    // Weapon stats
    WEAPONS: {
        BULLET: {
            name: 'Bullet',
            damage: 20,
            speed: 500,
            cooldown: 500,
            range: 500,
            upgrades: {
                damage: [5, 10, 15, 20, 25],
                cooldown: [-50, -100, -150, -200, -250],
                speed: [50, 100, 150, 200, 250],
                range: [50, 100, 150, 200, 250],
                count: [1, 2, 3, 4, 5]
            }
        },
        AURA: {
            name: 'Aura',
            damage: 5,
            radius: 100,
            cooldown: 200,
            upgrades: {
                damage: [2, 4, 6, 8, 10],
                radius: [20, 40, 60, 80, 100],
                cooldown: [-20, -40, -60, -80, -100]
            }
        },
        HAMMER: {
            name: 'Rotating Hammer',
            damage: 30,
            radius: 150,
            rotationSpeed: 2,
            cooldown: 0,
            upgrades: {
                damage: [10, 20, 30, 40, 50],
                radius: [20, 40, 60, 80, 100],
                rotationSpeed: [0.5, 1, 1.5, 2, 2.5],
                count: [1, 2, 3, 4, 5]
            }
        },
        WHIP: {
            name: 'Whip',
            damage: 25,
            arc: 120,
            range: 200,
            cooldown: 800,
            upgrades: {
                damage: [5, 10, 15, 20, 25],
                arc: [10, 20, 30, 40, 50],
                range: [20, 40, 60, 80, 100],
                cooldown: [-50, -100, -150, -200, -250]
            }
        }
    },
    
    // Enemy types
    ENEMIES: {
        WALKER: {
            name: 'Walker',
            hp: 50,
            speed: 100,
            damage: 10,
            xp: 1,
            scale: 1
        },
        CHARGER: {
            name: 'Charger',
            hp: 30,
            speed: 200,
            damage: 15,
            xp: 2,
            scale: 0.8
        },
        TANK: {
            name: 'Tank',
            hp: 200,
            speed: 50,
            damage: 20,
            xp: 5,
            scale: 1.5
        },
        SHOOTER: {
            name: 'Shooter',
            hp: 40,
            speed: 80,
            damage: 5,
            projectileDamage: 15,
            projectileSpeed: 300,
            fireRate: 2000,
            xp: 3,
            scale: 1
        }
    },
    
    // Power-up types
    POWERUPS: {
        HEALTH: {
            name: 'Health',
            value: 30
        },
        SPEED: {
            name: 'Speed',
            value: 100,
            duration: 10000
        },
        FIRE_RATE: {
            name: 'Fire Rate',
            value: 0.5, // Multiplier
            duration: 10000
        }
    }
}; 