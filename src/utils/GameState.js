// GameState class for handling game state persistence
class GameState {
    constructor(scene) {
        this.scene = scene;
        this.autosaveInterval = CONFIG.gameState.autosaveInterval;
        this.lastSaveTime = 0;
    }

    // Initialize autosave timer
    startAutosave() {
        this.scene.time.addEvent({
            delay: this.autosaveInterval,
            callback: () => this.saveGame(),
            callbackScope: this,
            loop: true
        });
    }

    // Save game state to local storage
    saveGame() {
        if (!this.scene.player) return;

        const gameData = {
            player: {
                health: this.scene.player.health,
                level: this.scene.player.level,
                xp: this.scene.player.xp,
                weapons: this.scene.player.weapons.map(weapon => {
                    if (!weapon) return null;
                    return {
                        type: weapon.type,
                        level: weapon.level,
                        damage: weapon.damage,
                        cooldown: weapon.cooldown
                    };
                })
            },
            gameStats: {
                enemiesKilled: this.scene.enemiesKilled,
                timeElapsed: this.scene.time.now
            },
            timestamp: Date.now()
        };

        localStorage.setItem('bulletHeavenSave', JSON.stringify(gameData));
        console.log('Game saved:', gameData);
    }

    // Load game state from local storage
    loadGame() {
        const savedData = localStorage.getItem('bulletHeavenSave');
        
        if (!savedData) {
            console.log('No saved game found');
            return null;
        }

        try {
            const gameData = JSON.parse(savedData);
            console.log('Game loaded:', gameData);
            return gameData;
        } catch (error) {
            console.error('Error loading saved game:', error);
            return null;
        }
    }

    // Check if a saved game exists
    hasSavedGame() {
        return localStorage.getItem('bulletHeavenSave') !== null;
    }

    // Clear saved game data
    clearSavedGame() {
        localStorage.removeItem('bulletHeavenSave');
        console.log('Saved game cleared');
    }
} 