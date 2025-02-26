/**
 * GameState - Handles saving and loading game state
 */
class GameState {
    constructor() {
        this.localStorageKey = 'bullet_heaven_save';
    }
    
    /**
     * Check if there's a saved game
     * @returns {boolean} True if there's a saved game
     */
    hasSavedGame() {
        return localStorage.getItem(this.localStorageKey) !== null;
    }
    
    /**
     * Save the game state
     * @param {GameScene} gameScene - The game scene to save
     */
    saveGame(gameScene) {
        // Create save data object
        const saveData = {
            player: gameScene.player.getData(),
            killCount: gameScene.killCount,
            powerUpKillCounter: gameScene.powerUpKillCounter,
            timestamp: Date.now()
        };
        
        // Save to local storage
        localStorage.setItem(this.localStorageKey, JSON.stringify(saveData));
    }
    
    /**
     * Load the game state
     * @param {GameScene} gameScene - The game scene to load into
     */
    loadGame(gameScene) {
        // Get save data from local storage
        const saveDataString = localStorage.getItem(this.localStorageKey);
        
        if (!saveDataString) {
            return false;
        }
        
        try {
            // Parse save data
            const saveData = JSON.parse(saveDataString);
            
            // Load player data
            gameScene.player.loadData(saveData.player);
            
            // Load game state
            gameScene.killCount = saveData.killCount || 0;
            gameScene.powerUpKillCounter = saveData.powerUpKillCounter || 0;
            
            return true;
        } catch (error) {
            console.error('Error loading game:', error);
            return false;
        }
    }
    
    /**
     * Reset the game state (delete save)
     */
    resetGame() {
        localStorage.removeItem(this.localStorageKey);
    }
} 