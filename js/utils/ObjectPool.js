/**
 * ObjectPool - A generic object pool for reusing game objects
 * Used for performance optimization to avoid garbage collection
 */
class ObjectPool {
    /**
     * Create a new object pool
     * @param {Function} createFunc - Function to create a new object
     * @param {Function} resetFunc - Function to reset an object for reuse
     * @param {number} initialSize - Initial pool size
     */
    constructor(createFunc, resetFunc, initialSize = 20) {
        this.createFunc = createFunc;
        this.resetFunc = resetFunc;
        this.pool = [];
        this.activeObjects = new Set();
        
        // Initialize pool with objects
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFunc());
        }
    }
    
    /**
     * Get an object from the pool or create a new one if empty
     * @param {...any} args - Arguments to pass to the reset function
     * @returns {Object} The object from the pool
     */
    get(...args) {
        let obj;
        
        // If pool is empty, create a new object
        if (this.pool.length === 0) {
            obj = this.createFunc();
        } else {
            // Otherwise, get one from the pool
            obj = this.pool.pop();
        }
        
        // Reset the object with provided args
        this.resetFunc(obj, ...args);
        
        // Add to active objects set
        this.activeObjects.add(obj);
        
        return obj;
    }
    
    /**
     * Return an object to the pool
     * @param {Object} obj - The object to return to the pool
     */
    release(obj) {
        // Only add to pool if it was active
        if (this.activeObjects.has(obj)) {
            this.activeObjects.delete(obj);
            this.pool.push(obj);
        }
    }
    
    /**
     * Get the count of active objects
     * @returns {number} Count of active objects
     */
    getActiveCount() {
        return this.activeObjects.size;
    }
    
    /**
     * Get all active objects
     * @returns {Array} Array of active objects
     */
    getActiveObjects() {
        return Array.from(this.activeObjects);
    }
    
    /**
     * Release all active objects back to the pool
     */
    releaseAll() {
        this.getActiveObjects().forEach(obj => this.release(obj));
    }
} 