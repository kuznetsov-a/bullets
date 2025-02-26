// ObjectPool class for efficient object reuse
class ObjectPool {
    constructor(scene, type, group, initialSize = 20) {
        this.scene = scene;
        this.type = type;
        this.group = group || scene.add.group();
        this.pool = [];
        
        // Initialize pool with inactive objects
        this.expandPool(initialSize);
    }
    
    // Create new objects and add them to the pool
    expandPool(amount) {
        for (let i = 0; i < amount; i++) {
            const obj = new this.type(this.scene);
            this.group.add(obj);
            obj.setActive(false);
            obj.setVisible(false);
            this.pool.push(obj);
        }
    }
    
    // Get an object from the pool or create a new one if needed
    get(x, y, config = {}) {
        // Find an inactive object in the pool
        let obj = this.pool.find(item => !item.active);
        
        // If no inactive objects are available, expand the pool
        if (!obj) {
            this.expandPool(Math.ceil(this.pool.length * 0.5)); // Expand by 50%
            obj = this.pool.find(item => !item.active);
        }
        
        // Activate and position the object
        obj.setActive(true);
        obj.setVisible(true);
        obj.x = x;
        obj.y = y;
        
        // Initialize with config if the object has an init method
        if (typeof obj.init === 'function') {
            obj.init(config);
        }
        
        return obj;
    }
    
    // Return an object to the pool
    release(obj) {
        if (!obj) return;
        
        obj.setActive(false);
        obj.setVisible(false);
        
        // Call cleanup method if it exists
        if (typeof obj.cleanup === 'function') {
            obj.cleanup();
        }
    }
    
    // Release all objects in the pool
    releaseAll() {
        this.pool.forEach(obj => this.release(obj));
    }
    
    // Get all active objects
    getActiveObjects() {
        return this.pool.filter(obj => obj.active);
    }
    
    // Get count of active objects
    getActiveCount() {
        return this.getActiveObjects().length;
    }
} 