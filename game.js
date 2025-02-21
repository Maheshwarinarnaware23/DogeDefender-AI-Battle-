const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const shootSound = document.getElementById('shootSound');
const bgMusic = document.getElementById('bgMusic');

bgMusic.volume = 0.2;
bgMusic.play();

const heroImg = new Image(); heroImg.src = 'hero.png';
const enemyImg = new Image(); enemyImg.src = 'enemy.png';
const powerupImg = new Image(); powerupImg.src = 'powerup.png';

let hero = { x: 400, y: 300, size: 50, speed: 5, bullets: 1 };
let enemies = [];
let bullets = [];
let powerups = [];
let score = 0;
let gameOver = false;
let gameWon = false;

function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * canvas.width; y = -50; }
    else if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
    else { x = -50; y = Math.random() * canvas.height; }
    enemies.push({ x, y, size: 40, speed: 2 });
}

function spawnPowerup() {
    const x = Math.random() * (canvas.width - 50);
    const y = Math.random() * (canvas.height - 50);
    powerups.push({ x, y, size: 30 });
}

let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function shoot() {
    for (let i = 0; i < hero.bullets; i++) {
        const angle = (i - (hero.bullets - 1) / 2) * 0.2;
        bullets.push({ x: hero.x, y: hero.y, dx: Math.sin(angle) * 5, dy: -Math.cos(angle) * 5, size: 10 });
    }
    shootSound.currentTime = 0;
    shootSound.play();
}

function update() {
    if (gameOver || gameWon) {
        if (keys['r']) location.reload();
        return;
    }

    // Hero movement
    if (keys['ArrowUp']) hero.y -= hero.speed;
    if (keys['ArrowDown']) hero.y += hero.speed;
    if (keys['ArrowLeft']) hero.x -= hero.speed;
    if (keys['ArrowRight']) hero.x += hero.speed;
    hero.x = Math.max(hero.size/2, Math.min(canvas.width - hero.size/2, hero.x));
    hero.y = Math.max(hero.size/2, Math.min(canvas.height - hero.size/2, hero.y));
    if (keys[' ']) { shoot(); keys[' '] = false; }

    // Update bullets
    bullets = bullets.filter(b => b.y > -b.size);
    bullets.forEach(b => { b.x += b.dx; b.y += b.dy; });

    // Update enemies
    enemies.forEach(e => {
        const dx = hero.x - e.x;
        const dy = hero.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        e.x += dx / dist * e.speed;
        e.y += dy / dist * e.speed;

        // Collision with hero
        if (dist < hero.size/2 + e.size/2) gameOver = true;

        // Collision with bullets
        bullets.forEach((b, i) => {
            if (Math.hypot(b.x - e.x, b.y - e.y) < e.size/2 + b.size/2) {
                enemies.splice(enemies.indexOf(e), 1);
                bullets.splice(i, 1);
                score += 10000000;
                scoreElement.textContent = score.toLocaleString();
            }
        });
    });

    // Update powerups
    powerups.forEach((p, i) => {
        if (Math.hypot(hero.x - p.x, hero.y - p.y) < hero.size/2 + p.size/2) {
            powerups.splice(i, 1);
            hero.bullets++;
        }
    });

    // Spawning
    if (Math.random() < 0.02) spawnEnemy();
    if (Math.random() < 0.005) spawnPowerup();

    // Win condition
    if (score >= 1000000000) gameWon = true;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw hero
    ctx.drawImage(heroImg, hero.x - hero.size/2, hero.y - hero.size/2, hero.size, hero.size);

    // Draw enemies
    enemies.forEach(e => ctx.drawImage(enemyImg, e.x - e.size/2, e.y - e.size/2, e.size, e.size));

    // Draw bullets
    bullets.forEach(b => {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size/2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw powerups
    powerups.forEach(p => ctx.drawImage(powerupImg, p.x - p.size/2, p.y - p.size/2, p.size, p.size));

    // UI
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over - Press R to Restart', canvas.width/2, canvas.height/2);
    } else if (gameWon) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('You Won! - Press R to Restart', canvas.width/2, canvas.height/2);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();