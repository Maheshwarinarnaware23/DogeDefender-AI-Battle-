const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const heroImage = new Image();
const enemyImage = new Image();
const powerupImage = new Image();

heroImage.src = "hero.png";
enemyImage.src = "enemy.png";
powerupImage.src = "powerup.png";

const shootSound = new Audio("shoot.wav");
const backgroundMusic = new Audio("music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.2;

let hero, enemies, bullets, powerups, score, bulletCount, gameOver;

canvas.width = 800;
canvas.height = 600;

function init() {
    hero = { x: canvas.width / 2, y: canvas.height - 60, width: 50, height: 50, speed: 5 };
    enemies = [];
    bullets = [];
    powerups = [];
    score = 0;
    bulletCount = 1;
    gameOver = false;

    document.addEventListener("keydown", onKeyDown);
    backgroundMusic.play();
    spawnEnemies();
    gameLoop();
}

function onKeyDown(e) {
    if (e.key === "r" && gameOver) {
        init();
    }
}

function spawnEnemies() {
    setInterval(() => {
        if (!gameOver) {
            let enemy = { x: Math.random() * (canvas.width - 50), y: 0, width: 50, height: 50, speed: 2 };
            enemies.push(enemy);
        }
    }, 1000);
}

function spawnPowerup(x, y) {
    let powerup = { x, y, width: 30, height: 30 };
    powerups.push(powerup);
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function updateGame() {
    if (gameOver) return;

    // Move hero with arrow keys
    if (keys.ArrowLeft && hero.x > 0) hero.x -= hero.speed;
    if (keys.ArrowRight && hero.x < canvas.width - hero.width) hero.x += hero.speed;
    if (keys.ArrowUp && hero.y > 0) hero.y -= hero.speed;
    if (keys.ArrowDown && hero.y < canvas.height - hero.height) hero.y += hero.speed;

    // Move bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= 5;
        if (bullet.y < 0) bullets.splice(index, 1);
    });

    // Move enemies
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            gameOverScreen();
        }

        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + 5 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 5 > enemy.y
            ) {
                enemies.splice(index, 1);
                bullets.splice(bulletIndex, 1);
                score += 10000000;
                if (Math.random() < 0.2) {
                    spawnPowerup(enemy.x, enemy.y);
                }
            }
        });
    });

    // Move powerups
    powerups.forEach((powerup, index) => {
        powerup.y += 2;
        if (
            powerup.x < hero.x + hero.width &&
            powerup.x + powerup.width > hero.x &&
            powerup.y < hero.y + hero.height &&
            powerup.y + powerup.height > hero.y
        ) {
            powerups.splice(index, 1);
            bulletCount++;
        }
    });
}

function drawGame() {
    ctx.drawImage(heroImage, hero.x, hero.y, hero.width, hero.height);

    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    });

    powerups.forEach(powerup => {
        ctx.drawImage(powerupImage, powerup.x, powerup.y, powerup.width, powerup.height);
    });

    bullets.forEach(bullet => {
        ctx.fillStyle = "yellow";
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
    });

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: $${score.toLocaleString()}`, 10, 30);
}

function shootBullet() {
    if (gameOver) return;

    for (let i = 0; i < bulletCount; i++) {
        let bullet = { x: hero.x + hero.width / 2 - 2, y: hero.y, speed: 5 };
        bullets.push(bullet);
    }

    shootSound.play();
}

function gameOverScreen() {
    gameOver = true;
    document.getElementById("gameOver").style.display = "block";
}

const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, Space: false };

document.addEventListener("keydown", (e) => {
    if (e.key in keys) keys[e.key] = true;
    if (e.key === " " && !gameOver) shootBullet();
});
document.addEventListener("keyup", (e) => {
    if (e.key in keys) keys[e.key] = false;
});

init();
