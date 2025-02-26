// Level up scene
class LevelUpScene extends Phaser.Scene {
    constructor() {
        super('levelUpScene');
    }
    
    // Initialize scene with player data
    init(data) {
        this.player = data.player;
    }
    
    // Create level up UI
    create() {
        // Create semi-transparent background
        this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        
        // Create level up text
        this.add.text(
            this.cameras.main.width / 2,
            50,
            `LEVEL UP! (Level ${this.player.level})`,
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5, 0);
        
        // Create options container
        const optionsContainer = this.add.container(0, 120);
        
        // Generate upgrade options
        const options = this.generateOptions();
        
        // Create option cards
        this.createOptionCards(options, optionsContainer);
    }
    
    // Generate upgrade options
    generateOptions() {
        const options = [];
        
        // Check if player has empty weapon slots
        const hasEmptySlot = this.player.weapons.some(weapon => weapon === null);
        
        // If player has empty slots, offer new weapons
        if (hasEmptySlot) {
            // Get available weapon types
            const availableTypes = ['bullet', 'aura', 'hammer', 'whip'];
            
            // Shuffle available types
            Phaser.Utils.Array.Shuffle(availableTypes);
            
            // Add new weapon options
            for (let i = 0; i < 2 && i < availableTypes.length; i++) {
                options.push({
                    type: 'new_weapon',
                    weaponType: availableTypes[i],
                    title: `New ${CONFIG.weapons.types[availableTypes[i]].name}`,
                    description: `Add a new ${CONFIG.weapons.types[availableTypes[i]].name} weapon to your arsenal.`
                });
            }
        }
        
        // Add upgrade options for existing weapons
        const existingWeapons = this.player.weapons.filter(weapon => weapon !== null);
        
        // Shuffle existing weapons
        Phaser.Utils.Array.Shuffle(existingWeapons);
        
        // Add damage upgrade options
        for (let i = 0; i < 2 && i < existingWeapons.length; i++) {
            const weapon = existingWeapons[i];
            options.push({
                type: 'upgrade_damage',
                weaponIndex: this.player.weapons.indexOf(weapon),
                title: `Upgrade ${CONFIG.weapons.types[weapon.type].name} Damage`,
                description: `Increase damage by ${CONFIG.weapons.types[weapon.type].upgradePerLevel.damage}.`,
                weapon: weapon
            });
        }
        
        // Add cooldown upgrade options
        for (let i = 0; i < 2 && i < existingWeapons.length; i++) {
            const weapon = existingWeapons[i];
            options.push({
                type: 'upgrade_cooldown',
                weaponIndex: this.player.weapons.indexOf(weapon),
                title: `Upgrade ${CONFIG.weapons.types[weapon.type].name} Fire Rate`,
                description: `Decrease cooldown by ${CONFIG.weapons.types[weapon.type].upgradePerLevel.cooldown}ms.`,
                weapon: weapon
            });
        }
        
        // Shuffle all options
        Phaser.Utils.Array.Shuffle(options);
        
        // Return at most 3 options
        return options.slice(0, 3);
    }
    
    // Create option cards
    createOptionCards(options, container) {
        const cardWidth = 300;
        const cardHeight = 200;
        const padding = 20;
        
        // Calculate total width
        const totalWidth = options.length * cardWidth + (options.length - 1) * padding;
        
        // Calculate start X position
        const startX = (this.cameras.main.width - totalWidth) / 2;
        
        // Create cards
        options.forEach((option, index) => {
            const x = startX + index * (cardWidth + padding);
            const y = 100;
            
            // Create card background
            const card = this.add.rectangle(
                x + cardWidth / 2,
                y + cardHeight / 2,
                cardWidth,
                cardHeight,
                0x333333,
                0.9
            );
            card.setStrokeStyle(2, 0xffffff, 0.8);
            card.setInteractive();
            
            // Add hover effect
            card.on('pointerover', () => {
                card.setStrokeStyle(3, 0x00ff00, 1);
            });
            
            card.on('pointerout', () => {
                card.setStrokeStyle(2, 0xffffff, 0.8);
            });
            
            // Add click handler
            card.on('pointerdown', () => {
                this.selectOption(option);
            });
            
            // Add title
            const title = this.add.text(
                x + cardWidth / 2,
                y + 30,
                option.title,
                {
                    fontFamily: 'Arial',
                    fontSize: '18px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3,
                    align: 'center',
                    wordWrap: { width: cardWidth - 20 }
                }
            );
            title.setOrigin(0.5, 0.5);
            
            // Add description
            const description = this.add.text(
                x + cardWidth / 2,
                y + 100,
                option.description,
                {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#cccccc',
                    align: 'center',
                    wordWrap: { width: cardWidth - 40 }
                }
            );
            description.setOrigin(0.5, 0.5);
            
            // Add icon based on option type
            let iconText = '';
            let iconColor = 0xffffff;
            
            if (option.type === 'new_weapon') {
                switch (option.weaponType) {
                    case 'bullet':
                        iconText = '•';
                        iconColor = 0xffff00;
                        break;
                    case 'aura':
                        iconText = '○';
                        iconColor = 0x00ffff;
                        break;
                    case 'hammer':
                        iconText = '⚒';
                        iconColor = 0xaaaaaa;
                        break;
                    case 'whip':
                        iconText = '~';
                        iconColor = 0xffffff;
                        break;
                }
            } else if (option.type === 'upgrade_damage') {
                iconText = '↑';
                iconColor = 0xff0000;
            } else if (option.type === 'upgrade_cooldown') {
                iconText = '↓';
                iconColor = 0x00ff00;
            }
            
            const icon = this.add.text(
                x + cardWidth / 2,
                y + 160,
                iconText,
                {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: `#${iconColor.toString(16).padStart(6, '0')}`
                }
            );
            icon.setOrigin(0.5, 0.5);
            
            // Add to container
            container.add([card, title, description, icon]);
        });
    }
    
    // Handle option selection
    selectOption(option) {
        // Apply the selected upgrade
        switch (option.type) {
            case 'new_weapon':
                this.player.addWeapon(option.weaponType);
                break;
                
            case 'upgrade_damage':
                this.player.upgradeWeapon(option.weaponIndex, 'damage');
                break;
                
            case 'upgrade_cooldown':
                this.player.upgradeWeapon(option.weaponIndex, 'cooldown');
                break;
        }
        
        // Resume the game scene
        this.scene.resume('gameScene');
        
        // Close this scene
        this.scene.stop();
    }
} 