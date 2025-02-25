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
let lastFrameTime = 0;
let joystickData = { active: false, dx: 0, dy: 0 };

// Game entities
const player = {
    x: 0,
    y: 0,
    size: 20,
    color: '#00FF00'
};

const bullets = [];
const enemies = [];
const particles = [];

// Setup canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Initialize player position
player.x = canvas.width / 2;
player.y = canvas.height / 2;

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

// Draw functions
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.size);
    ctx.lineTo(player.x - player.size, player.y + player.size);
    ctx.lineTo(player.x + player.size, player.y + player.size);
    ctx.closePath();
    ctx.fill();
}

function drawBullets() {
    ctx.fillStyle = '#FFFF00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    ctx.fillStyle = '#FF0000';
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 20, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Game logic functions
function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
        case 0: // Top
            x = Math.random() * canvas.width;
            y = -40;
            break;
        case 1: // Right
            x = canvas.width + 40;
            y = Math.random() * canvas.height;
            break;
        case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + 40;
            break;
        case 3: // Left
            x = -40;
            y = Math.random() * canvas.height;
            break;
    }
    
    enemies.push({ x, y });
}

function shoot() {
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
    
    bullets.push({
        x: player.x,
        y: player.y,
        vx: dir.x * BULLET_SPEED,
        vy: dir.y * BULLET_SPEED
    });
}

function createExplosion(x, y, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1
        });
    }
}

function resetGame() {
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Game loop
function gameLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const delta = (timestamp - lastFrameTime) / 16.67; // Normalize to ~60fps
    lastFrameTime = timestamp;
    
    const currentTime = Date.now();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Move player based on joystick
    if (joystickData.active) {
        player.x += joystickData.dx * PLAYER_SPEED * delta;
        player.y += joystickData.dy * PLAYER_SPEED * delta;
        
        // Keep player within bounds
        player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
        player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
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
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.vx * delta;
        bullet.y += bullet.vy * delta;
        
        // Remove bullets that are off-screen
        if (bullet.x < 0 || bullet.x > canvas.width || 
            bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
    
    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Move enemy towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * ENEMY_SPEED * delta;
            enemy.y += (dy / distance) * ENEMY_SPEED * delta;
        }
        
        // Check collision with player
        if (distance < player.size + 20) {
            createExplosion(player.x, player.y, 30);
            resetGame();
            break;
        }
        
        // Check collision with bullets
        let enemyHit = false;
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const bx = bullet.x - enemy.x;
            const by = bullet.y - enemy.y;
            const bDistance = Math.sqrt(bx * bx + by * by);
            
            if (bDistance < 5 + 20) {
                // Enemy hit
                createExplosion(enemy.x, enemy.y, 10);
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                enemyHit = true;
                
                // Update score
                score += 10;
                document.getElementById('score').textContent = `Score: ${score}`;
                break;
            }
        }
        
        if (enemyHit) break;
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.alpha -= 0.01 * delta;
        
        if (particle.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Draw everything
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawParticles();
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
});

// Start the game
console.log("Game initialized");
spawnEnemy();
console.log("Test enemy spawned");
requestAnimationFrame(gameLoop); 