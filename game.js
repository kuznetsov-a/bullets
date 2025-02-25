// Game constants
const BUILD_NAME = "fix-controls2";
const PLAYER_SIZE = 20;
const BULLET_SIZE = 8;
const ENEMY_SIZE = 25;
const BULLET_SPEED = 10;
const ENEMY_SPEED = 1.2;
const PLAYER_SPEED = 7.5;
const SHOOT_INTERVAL = 150; // milliseconds
const SPAWN_INTERVAL = 500; // milliseconds (0.5 seconds)
const POOL_SIZE = {
    BULLETS: 200,
    ENEMIES: 300,
    PARTICLES: 500
};

// Game state
const game = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    player: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        lastShot: 0,
        isMoving: false
    },
    bullets: [],
    enemies: [],
    particles: [],
    score: 0,
    joystick: null,
    lastTime: 0,
    spawnTimer: 0,
    frameCount: 0,
    lastFpsUpdate: 0,
    fps: 0
};

// Object pools for reusing entities
const pools = {
    bullets: [],
    enemies: [],
    particles: []
};

// Initialize the game
function init() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    
    // Set canvas dimensions to match the window
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize player position
    game.player.x = game.width / 2;
    game.player.y = game.height / 2;
    
    // Initialize object pools
    initPools();
    
    // Setup joystick
    setupJoystick();
    
    // Display build name
    document.getElementById('buildName').textContent = BUILD_NAME;
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Initialize object pools
function initPools() {
    // Create bullet pool
    for (let i = 0; i < POOL_SIZE.BULLETS; i++) {
        pools.bullets.push({
            x: 0, y: 0, vx: 0, vy: 0, active: false
        });
    }
    
    // Create enemy pool
    for (let i = 0; i < POOL_SIZE.ENEMIES; i++) {
        pools.enemies.push({
            x: 0, y: 0, vx: 0, vy: 0, health: 1, active: false
        });
    }
    
    // Create particle pool
    for (let i = 0; i < POOL_SIZE.PARTICLES; i++) {
        pools.particles.push({
            x: 0, y: 0, vx: 0, vy: 0, size: 3, life: 0, maxLife: 20, active: false
        });
    }
}

// Set up joystick control
function setupJoystick() {
    const joystickOptions = {
        zone: document.getElementById('joystickArea'),
        mode: 'static',
        position: { left: '75px', bottom: '75px' },
        color: 'white',
        size: 100
    };
    
    game.joystick = nipplejs.create(joystickOptions);
    
    game.joystick.on('move', (evt, data) => {
        const force = Math.min(1, data.force);
        
        // Only invert the Y axis, keep X axis normal
        const directionX = data.vector.x;  // No negative sign here
        const directionY = -data.vector.y; // Keep the negative sign for Y
        
        game.player.vx = directionX * PLAYER_SPEED * force;
        game.player.vy = directionY * PLAYER_SPEED * force;
        game.player.isMoving = true;
    });
    
    game.joystick.on('end', () => {
        game.player.vx = 0;
        game.player.vy = 0;
        game.player.isMoving = false;
    });
}

// Resize canvas to match the window
function resizeCanvas() {
    game.canvas.width = window.innerWidth;
    game.canvas.height = window.innerHeight;
    game.width = game.canvas.width;
    game.height = game.canvas.height;
}

// Get an object from pool
function getFromPool(pool) {
    for (let i = 0; i < pool.length; i++) {
        if (!pool[i].active) {
            pool[i].active = true;
            return pool[i];
        }
    }
    return null; // Pool is depleted
}

// Spawn a new enemy
function spawnEnemy() {
    const enemy = getFromPool(pools.enemies);
    if (!enemy) return;
    
    // Determine spawn position (outside the viewport)
    let x, y;
    if (Math.random() < 0.5) {
        // Spawn at the sides
        x = Math.random() < 0.5 ? -ENEMY_SIZE : game.width + ENEMY_SIZE;
        y = Math.random() * game.height;
    } else {
        // Spawn at top or bottom
        x = Math.random() * game.width;
        y = Math.random() < 0.5 ? -ENEMY_SIZE : game.height + ENEMY_SIZE;
    }
    
    // Calculate direction towards player
    const dx = game.player.x - x;
    const dy = game.player.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Set enemy properties
    enemy.x = x;
    enemy.y = y;
    enemy.vx = (dx / dist) * ENEMY_SPEED;
    enemy.vy = (dy / dist) * ENEMY_SPEED;
    enemy.health = 1;
    
    game.enemies.push(enemy);
}

// Create a bullet
function shootBullet() {
    // Don't shoot if not enough time has passed
    const currentTime = Date.now();
    if (currentTime - game.player.lastShot < SHOOT_INTERVAL) {
        return;
    }
    
    game.player.lastShot = currentTime;
    
    // Find the closest enemy
    let closestEnemy = null;
    let closestDistance = Infinity;
    
    for (const enemy of game.enemies) {
        const dx = enemy.x - game.player.x;
        const dy = enemy.y - game.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
        }
    }
    
    // Create a single bullet targeting the closest enemy or straight ahead if no enemies
    const bullet = getFromPool(pools.bullets);
    if (!bullet) return;
    
    let dx, dy;
    
    if (closestEnemy) {
        // Target the closest enemy
        dx = closestEnemy.x - game.player.x;
        dy = closestEnemy.y - game.player.y;
    } else {
        // No enemies, shoot in the direction the player is facing or default up
        if (game.player.isMoving && (game.player.vx !== 0 || game.player.vy !== 0)) {
            dx = game.player.vx;
            dy = game.player.vy;
        } else {
            dx = 0;
            dy = -1; // Default up
        }
    }
    
    const length = Math.sqrt(dx * dx + dy * dy);
    bullet.x = game.player.x;
    bullet.y = game.player.y;
    bullet.vx = (dx / length) * BULLET_SPEED;
    bullet.vy = (dy / length) * BULLET_SPEED;
    
    game.bullets.push(bullet);
}

// Create explosion particle effect
function createExplosion(x, y, count) {
    for (let i = 0; i < count; i++) {
        const particle = getFromPool(pools.particles);
        if (!particle) continue;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        
        particle.x = x;
        particle.y = y;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.size = 2 + Math.random() * 3;
        particle.life = 0;
        particle.maxLife = 10 + Math.random() * 20;
        
        game.particles.push(particle);
    }
}

// Update game state
function update(deltaTime) {
    // Update player position
    game.player.x += game.player.vx;
    game.player.y += game.player.vy;
    
    // Keep player within bounds
    game.player.x = Math.max(PLAYER_SIZE, Math.min(game.width - PLAYER_SIZE, game.player.x));
    game.player.y = Math.max(PLAYER_SIZE, Math.min(game.height - PLAYER_SIZE, game.player.y));
    
    // Auto shoot if player is moving or enemies are present
    if (game.player.isMoving || game.enemies.length > 0) {
        shootBullet();
    }
    
    // Spawn enemies
    game.spawnTimer += deltaTime;
    if (game.spawnTimer >= SPAWN_INTERVAL) {
        spawnEnemy();
        game.spawnTimer -= SPAWN_INTERVAL;
    }
    
    // Update bullets
    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        
        // Remove bullets that go off-screen
        if (bullet.x < -BULLET_SIZE || bullet.x > game.width + BULLET_SIZE ||
            bullet.y < -BULLET_SIZE || bullet.y > game.height + BULLET_SIZE) {
            bullet.active = false;
            game.bullets.splice(i, 1);
        }
    }
    
    // Update enemies
    for (let i = game.enemies.length - 1; i >= 0; i--) {
        const enemy = game.enemies[i];
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        
        // Check for bullet collisions
        for (let j = game.bullets.length - 1; j >= 0; j--) {
            const bullet = game.bullets[j];
            const dx = enemy.x - bullet.x;
            const dy = enemy.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ENEMY_SIZE / 2 + BULLET_SIZE / 2) {
                // Enemy hit
                enemy.health--;
                bullet.active = false;
                game.bullets.splice(j, 1);
                
                if (enemy.health <= 0) {
                    // Enemy destroyed
                    createExplosion(enemy.x, enemy.y, 10);
                    enemy.active = false;
                    game.enemies.splice(i, 1);
                    game.score += 10;
                    document.getElementById('score').textContent = game.score;
                    break;
                }
            }
        }
        
        // Check for player collision
        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < PLAYER_SIZE / 2 + ENEMY_SIZE / 2) {
            // Player hit by enemy - Game over scenario could be implemented here
            createExplosion(enemy.x, enemy.y, 20);
            enemy.active = false;
            game.enemies.splice(i, 1);
        }
        
        // Remove enemies that go too far off-screen
        if (enemy.x < -ENEMY_SIZE * 3 || enemy.x > game.width + ENEMY_SIZE * 3 ||
            enemy.y < -ENEMY_SIZE * 3 || enemy.y > game.height + ENEMY_SIZE * 3) {
            enemy.active = false;
            game.enemies.splice(i, 1);
        }
    }
    
    // Update particles
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const particle = game.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;
        
        if (particle.life >= particle.maxLife) {
            particle.active = false;
            game.particles.splice(i, 1);
        }
    }
    
    // Update entity count display
    document.getElementById('entityCount').textContent = 
        game.bullets.length + game.enemies.length + game.particles.length;
}

// Render the game
function render() {
    // Clear the canvas
    game.ctx.clearRect(0, 0, game.width, game.height);
    
    // Draw player as a green triangle
    game.ctx.fillStyle = '#2ecc71'; // Green color
    game.ctx.beginPath();
    
    // Calculate triangle points (pointing in movement direction or default up)
    const angle = game.player.isMoving ? 
        Math.atan2(game.player.vy, game.player.vx) : 
        -Math.PI/2; // Default pointing up
    
    game.ctx.save();
    game.ctx.translate(game.player.x, game.player.y);
    game.ctx.rotate(angle);
    
    // Draw triangle
    game.ctx.moveTo(0, -PLAYER_SIZE);
    game.ctx.lineTo(-PLAYER_SIZE/1.5, PLAYER_SIZE/1.5);
    game.ctx.lineTo(PLAYER_SIZE/1.5, PLAYER_SIZE/1.5);
    game.ctx.closePath();
    
    game.ctx.fill();
    game.ctx.restore();
    
    // Draw bullets
    game.ctx.fillStyle = '#f39c12';
    for (const bullet of game.bullets) {
        game.ctx.beginPath();
        game.ctx.arc(bullet.x, bullet.y, BULLET_SIZE / 2, 0, Math.PI * 2);
        game.ctx.fill();
    }
    
    // Draw enemies
    game.ctx.fillStyle = '#e74c3c';
    for (const enemy of game.enemies) {
        game.ctx.beginPath();
        game.ctx.arc(enemy.x, enemy.y, ENEMY_SIZE / 2, 0, Math.PI * 2);
        game.ctx.fill();
    }
    
    // Draw particles
    for (const particle of game.particles) {
        const alpha = 1 - (particle.life / particle.maxLife);
        game.ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
        game.ctx.beginPath();
        game.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        game.ctx.fill();
    }
}

// Calculate and update FPS
function updateFPS(timestamp) {
    game.frameCount++;
    
    if (timestamp - game.lastFpsUpdate >= 1000) {
        game.fps = Math.round((game.frameCount * 1000) / (timestamp - game.lastFpsUpdate));
        document.getElementById('fps').textContent = game.fps;
        game.frameCount = 0;
        game.lastFpsUpdate = timestamp;
    }
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - game.lastTime;
    game.lastTime = timestamp;
    
    // Update FPS counter
    updateFPS(timestamp);
    
    // Update game state
    update(deltaTime);
    
    // Render the game
    render();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game when the window loads
window.addEventListener('load', init); 