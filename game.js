// Game constants
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;
const ENEMY_SPEED = 2;
const SPAWN_INTERVAL = 500; // 0.5 seconds
const SHOOT_INTERVAL = 200; // 0.2 seconds

// Game state
let score = 0;
let lastSpawnTime = 0;
let lastShootTime = 0;
let joystickData = { active: false, dx: 0, dy: 0 };

// Initialize PIXI Application
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: false,
});
document.getElementById('game-canvas').appendChild(app.view);

// Create object pools for better performance
const bulletPool = [];
const enemyPool = [];
const particlePool = [];

// Create textures once for reuse
const playerTexture = createTriangleTexture(20, 0x00FF00);
const bulletTexture = createCircleTexture(5, 0xFFFF00);
const enemyTexture = createCircleTexture(20, 0xFF0000);
const particleTexture = createCircleTexture(3, 0xFFFFFF);

// Create player
const player = new PIXI.Graphics();
player.beginFill(0x00FF00);
player.moveTo(0, -20);
player.lineTo(-20, 20);
player.lineTo(20, 20);
player.lineTo(0, -20);
player.endFill();
player.x = app.screen.width / 2;
player.y = app.screen.height / 2;
app.stage.addChild(player);

// Create containers for better performance
const bulletsContainer = new PIXI.ParticleContainer(1000, {
    position: true,
    rotation: false,
    uvs: false,
    tint: false
});
app.stage.addChild(bulletsContainer);

const enemiesContainer = new PIXI.ParticleContainer(1000, {
    position: true,
    rotation: false,
    uvs: false,
    tint: false
});
app.stage.addChild(enemiesContainer);

const particlesContainer = new PIXI.ParticleContainer(2000, {
    position: true,
    rotation: false,
    uvs: false,
    alpha: true,
    scale: false
});
app.stage.addChild(particlesContainer);

// Helper function to create circle textures
function createCircleTexture(radius, color) {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(color);
    graphics.drawCircle(0, 0, radius);
    graphics.endFill();
    return app.renderer.generateTexture(graphics);
}

// New helper function to create triangle texture
function createTriangleTexture(size, color) {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(color);
    // Draw a triangle pointing upward
    graphics.moveTo(0, -size);        // Top point
    graphics.lineTo(-size, size);     // Bottom left
    graphics.lineTo(size, size);      // Bottom right
    graphics.lineTo(0, -size);        // Back to top
    graphics.endFill();
    return app.renderer.generateTexture(graphics);
}

// Setup joystick
const joystickArea = document.getElementById('joystick-area');
const joystick = document.getElementById('joystick');
const joystickRect = joystickArea.getBoundingClientRect();
const centerX = joystickRect.width / 2;
const centerY = joystickRect.height / 2;
const maxDistance = joystickRect.width / 2 - joystick.offsetWidth / 2;

// Joystick touch handlers
joystickArea.addEventListener('touchstart', handleJoystickStart);
joystickArea.addEventListener('touchmove', handleJoystickMove);
joystickArea.addEventListener('touchend', handleJoystickEnd);

function handleJoystickStart(e) {
    e.preventDefault();
    joystickData.active = true;
    handleJoystickMove(e);
}

function handleJoystickMove(e) {
    if (!joystickData.active) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = joystickArea.getBoundingClientRect();
    
    let dx = touch.clientX - rect.left - centerX;
    let dy = touch.clientY - rect.top - centerY;
    
    // Calculate distance from center
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize if distance is greater than maxDistance
    if (distance > maxDistance) {
        dx = (dx / distance) * maxDistance;
        dy = (dy / distance) * maxDistance;
    }
    
    // Update joystick position
    joystick.style.transform = `translate(${dx}px, ${dy}px)`;
    
    // Normalize for player movement (values between -1 and 1)
    joystickData.dx = dx / maxDistance;
    joystickData.dy = dy / maxDistance;
}

function handleJoystickEnd(e) {
    e.preventDefault();
    joystickData.active = false;
    joystickData.dx = 0;
    joystickData.dy = 0;
    joystick.style.transform = 'translate(0px, 0px)';
}

// Game loop
app.ticker.add((delta) => {
    const currentTime = Date.now();
    
    // Move player based on joystick
    if (joystickData.active) {
        player.x += joystickData.dx * PLAYER_SPEED * delta;
        player.y += joystickData.dy * PLAYER_SPEED * delta;
        
        // Keep player within bounds
        player.x = Math.max(player.width / 2, Math.min(app.screen.width - player.width / 2, player.x));
        player.y = Math.max(player.height / 2, Math.min(app.screen.height - player.height / 2, player.y));
    }
    
    // Spawn enemies
    if (currentTime - lastSpawnTime > SPAWN_INTERVAL) {
        spawnEnemy();
        lastSpawnTime = currentTime;
    }
    
    // Auto shoot
    if (currentTime - lastShootTime > SHOOT_INTERVAL) {
        shoot();
        lastShootTime = currentTime;
    }
    
    // Update bullets
    for (let i = 0; i < bulletsContainer.children.length; i++) {
        const bullet = bulletsContainer.children[i];
        bullet.x += bullet.vx * delta;
        bullet.y += bullet.vy * delta;
        
        // Remove bullets that are off-screen
        if (bullet.x < 0 || bullet.x > app.screen.width || 
            bullet.y < 0 || bullet.y > app.screen.height) {
            recycleBullet(bullet, i);
            i--;
        }
    }
    
    // Update enemies
    for (let i = 0; i < enemiesContainer.children.length; i++) {
        const enemy = enemiesContainer.children[i];
        
        // Move enemy towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * ENEMY_SPEED * delta;
            enemy.y += (dy / distance) * ENEMY_SPEED * delta;
        }
        
        // Check collision with player
        if (distance < player.width / 2 + enemy.width / 2) {
            // Game over logic would go here
            createExplosion(player.x, player.y, 0xFFFFFF, 30);
            resetGame();
            return;
        }
        
        // Check collision with bullets
        for (let j = 0; j < bulletsContainer.children.length; j++) {
            const bullet = bulletsContainer.children[j];
            const bx = bullet.x - enemy.x;
            const by = bullet.y - enemy.y;
            const bDistance = Math.sqrt(bx * bx + by * by);
            
            if (bDistance < bullet.width / 2 + enemy.width / 2) {
                // Enemy hit
                createExplosion(enemy.x, enemy.y, 0xFF0000, 10);
                recycleEnemy(enemy, i);
                recycleBullet(bullet, j);
                i--;
                j--;
                
                // Update score
                score += 10;
                document.getElementById('score').textContent = `Score: ${score}`;
                break;
            }
        }
    }
    
    // Update particles
    for (let i = 0; i < particlesContainer.children.length; i++) {
        const particle = particlesContainer.children[i];
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.alpha -= 0.01 * delta;
        
        if (particle.alpha <= 0) {
            recycleParticle(particle, i);
            i--;
        }
    }
});

// Spawn enemy
function spawnEnemy() {
    let enemy;
    
    if (enemyPool.length > 0) {
        enemy = enemyPool.pop();
    } else {
        // Create enemy directly with Graphics instead of using texture
        enemy = new PIXI.Graphics();
        enemy.beginFill(0xFF0000);
        enemy.drawCircle(0, 0, 20);
        enemy.endFill();
    }
    
    // Position enemy at a random edge of the screen
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: // Top
            enemy.x = Math.random() * app.screen.width;
            enemy.y = -40;
            break;
        case 1: // Right
            enemy.x = app.screen.width + 40;
            enemy.y = Math.random() * app.screen.height;
            break;
        case 2: // Bottom
            enemy.x = Math.random() * app.screen.width;
            enemy.y = app.screen.height + 40;
            break;
        case 3: // Left
            enemy.x = -40;
            enemy.y = Math.random() * app.screen.height;
            break;
    }
    
    enemiesContainer.addChild(enemy);
}

// Shoot bullet
function shoot() {
    let bullet;
    
    if (bulletPool.length > 0) {
        bullet = bulletPool.pop();
    } else {
        bullet = new PIXI.Sprite(bulletTexture);
        bullet.anchor.set(0.5);
    }
    
    bullet.x = player.x;
    bullet.y = player.y;
    
    // Calculate direction (shoot in 8 directions)
    const directions = [
        { x: 0, y: -1 },    // Up
        { x: 1, y: -1 },    // Up-Right
        { x: 1, y: 0 },     // Right
        { x: 1, y: 1 },     // Down-Right
        { x: 0, y: 1 },     // Down
        { x: -1, y: 1 },    // Down-Left
        { x: -1, y: 0 },    // Left
        { x: -1, y: -1 }    // Up-Left
    ];
    
    // Get current time to create a cycling pattern
    const dirIndex = Math.floor(Date.now() / 100) % directions.length;
    const dir = directions[dirIndex];
    
    bullet.vx = dir.x * BULLET_SPEED;
    bullet.vy = dir.y * BULLET_SPEED;
    
    bulletsContainer.addChild(bullet);
}

// Create explosion effect
function createExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        let particle;
        
        if (particlePool.length > 0) {
            particle = particlePool.pop();
        } else {
            particle = new PIXI.Sprite(particleTexture);
            particle.anchor.set(0.5);
        }
        
        particle.x = x;
        particle.y = y;
        particle.alpha = 1;
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        particlesContainer.addChild(particle);
    }
}

// Object recycling functions for better performance
function recycleBullet(bullet, index) {
    bulletsContainer.removeChild(bullet);
    bulletPool.push(bullet);
}

function recycleEnemy(enemy, index) {
    enemiesContainer.removeChild(enemy);
    enemyPool.push(enemy);
}

function recycleParticle(particle, index) {
    particlesContainer.removeChild(particle);
    particlePool.push(particle);
}

// Reset game
function resetGame() {
    // Clear all entities
    while (bulletsContainer.children.length > 0) {
        recycleBullet(bulletsContainer.children[0], 0);
    }
    
    while (enemiesContainer.children.length > 0) {
        recycleEnemy(enemiesContainer.children[0], 0);
    }
    
    while (particlesContainer.children.length > 0) {
        recycleParticle(particlesContainer.children[0], 0);
    }
    
    // Reset player position
    player.x = app.screen.width / 2;
    player.y = app.screen.height / 2;
    
    // Reset score
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Handle window resize
window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    player.x = app.screen.width / 2;
    player.y = app.screen.height / 2;
});

// Debug information
console.log("Game initialized");
console.log("Screen dimensions:", app.screen.width, "x", app.screen.height);
console.log("Player position:", player.x, player.y);
console.log("Player visible:", player.visible);
console.log("Player dimensions:", player.width, "x", player.height);
console.log("Player texture:", playerTexture ? "created" : "missing");

// Check if PIXI is properly initialized
console.log("PIXI initialized:", PIXI ? "yes" : "no");
console.log("App created:", app ? "yes" : "no");
console.log("Canvas added to DOM:", document.getElementById('game-canvas').children.length > 0 ? "yes" : "no");

// Make player more visible
player.scale.set(2); // Make player bigger

// Force spawn an enemy for testing
spawnEnemy();
console.log("Test enemy spawned");

// Add visible border to canvas for debugging
const canvasElement = document.getElementById('game-canvas');
canvasElement.style.border = "1px solid red"; 