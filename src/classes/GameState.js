import { Player } from './Player.js';
import { Spawner } from './Spawner.js';

export class GameState {
    constructor(scene) {
        this.scene = scene;
        this.localStorageKey = 'bulletHeavenSave';
    }
    
    hasSavedState() {
        return localStorage.getItem(this.localStorageKey) !== null;
    }
    
    saveGame() {
        // Create game state object
        const gameState = {
            player: this.scene.player.toJSON(),
            spawner: this.scene.spawner.toJSON(),
            killCount: this.scene.killCount,
            timestamp: Date.now()
        };
        
        // Save to local storage
        localStorage.setItem(this.localStorageKey, JSON.stringify(gameState));
    }
    
    loadGame() {
        try {
            // Get saved state from local storage
            const savedState = JSON.parse(localStorage.getItem(this.localStorageKey));
            
            if (!savedState) return false;
            
            // Create player and load data
            if (!this.scene.player) {
                this.scene.player = new Player(this.scene);
            }
            
            this.scene.player.fromJSON(savedState.player);
            
            // Create spawner and load data
            if (!this.scene.spawner) {
                this.scene.spawner = new Spawner(this.scene);
            }
            
            this.scene.spawner.fromJSON(savedState.spawner);
            
            // Load kill count
            this.scene.killCount = savedState.killCount || 0;
            
            return true;
        } catch (error) {
            console.error('Error loading game state:', error);
            return false;
        }
    }
    
    clearSavedState() {
        localStorage.removeItem(this.localStorageKey);
    }
} 