// Game Configuration
const CONFIG = {
    // Game settings
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    
    // Player settings
    player: {
        speed: 200,
        maxHealth: 100,
        size: 32,
    },
    
    // Weapon settings
    weapons: {
        maxWeapons: 5,
        types: {
            bullet: {
                name: 'Bullet',
                baseDamage: 20,
                baseCooldown: 500, // ms
                projectileSpeed: 400,
                range: 500,
                upgradePerLevel: {
                    damage: 5,
                    cooldown: 50, // ms reduction
                }
            },
            aura: {
                name: 'Aura',
                baseDamage: 5,
                baseCooldown: 100, // ms
                radius: 100,
                upgradePerLevel: {
                    damage: 2,
                    cooldown: 10, // ms reduction
                }
            },
            hammer: {
                name: 'Rotating Hammer',
                baseDamage: 30,
                baseCooldown: 1000, // ms
                rotationSpeed: 0.05,
                distance: 80,
                upgradePerLevel: {
                    damage: 10,
                    cooldown: 100, // ms reduction
                }
            },
            whip: {
                name: 'Whip',
                baseDamage: 25,
                baseCooldown: 800, // ms
                arcAngle: 120, // degrees
                range: 150,
                upgradePerLevel: {
                    damage: 8,
                    cooldown: 80, // ms reduction
                }
            }
        }
    },
    
    // Enemy settings
    enemies: {
        types: {
            walker: {
                name: 'Walker',
                health: 50,
                damage: 10,
                speed: 100,
                size: 32,
                color: 0xff0000,
                xp: 1
            },
            charger: {
                name: 'Charger',
                health: 30,
                damage: 5,
                speed: 200,
                size: 24,
                color: 0xff9900,
                xp: 2
            },
            tank: {
                name: 'Tank',
                health: 200,
                damage: 20,
                speed: 50,
                size: 48,
                color: 0x0000ff,
                xp: 5
            },
            shooter: {
                name: 'Shooter',
                health: 40,
                damage: 8,
                speed: 80,
                size: 32,
                color: 0x00ff00,
                projectileSpeed: 300,
                shootCooldown: 2000, // ms
                xp: 3
            }
        },
        spawnRateGrowth: 1.1, // 10% increase per level
        baseSpawnInterval: 1000, // ms
    },
    
    // Level system
    leveling: {
        xpThresholds: [10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120],
        getXpForLevel: function(level) {
            if (level < this.xpThresholds.length) {
                return this.xpThresholds[level];
            }
            // For levels beyond the predefined thresholds, double the previous requirement
            return this.getXpForLevel(level - 1) * 2;
        }
    },
    
    // Map settings
    map: {
        width: 3200,
        height: 3200,
        obstacleCount: 50,
        obstacleSize: {
            min: 32,
            max: 128
        }
    },
    
    // Power-up settings
    powerUps: {
        spawnRate: 50, // enemies killed
        duration: 10000, // ms
        types: {
            health: {
                name: 'Health',
                value: 20,
                color: 0xff0000
            },
            speed: {
                name: 'Speed Boost',
                multiplier: 1.5,
                color: 0xffff00
            },
            fireRate: {
                name: 'Fire Rate Boost',
                multiplier: 1.5,
                color: 0x00ffff
            }
        }
    },
    
    // Game state
    gameState: {
        autosaveInterval: 10000 // ms
    }
}; 