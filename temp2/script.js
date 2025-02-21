const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const heroImg = new Image();
heroImg.src = "hero.png";

const enemyImg = new Image();
enemyImg.src = "enemy.png";

const powerupImg = new Image();
powerupImg.src = "powerup.png";

const shootSound = new Audio("shoot.wav");
const backgroundMusic = new Audio("music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

let score = 0;
let gameOver = false;
let bullets = [];
let enemies = [];
let powerups = [];
let weaponLevel = 1;

class Hero {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.width = 50;
    this.height = 50;
    this.speed = 5;
  }

  draw() {
    ctx.drawImage(heroImg, this.x, this.y, this.width, this.height);
  }

  move(direction) {
    if (direction === "left" && this.x > 0) this.x -= this.speed;
    if (direction === "right" && this.x < canvas.width - this.width) this.x += this.speed;
    if (direction === "up" && this.y > 0) this.y -= this.speed;
    if (direction === "down" && this.y < canvas.height - this.height) this.y += this.speed;
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 20;
    this.speed = 10;
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y -= this.speed;
  }
}

class Enemy {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = 0;
    this.width = 50;
    this.height = 50;
    this.speed = 3;
  }

  draw() {
    ctx.drawImage(enemyImg, this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.speed;
    if (this.y > canvas.height) gameOver = true;
  }
}

class Powerup {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = 0;
    this.width = 30;
    this.height = 30;
    this.speed = 2;
  }

  draw() {
    ctx.drawImage(powerupImg, this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.speed;
  }
}

const hero = new Hero();

function spawnEnemy() {
  if (Math.random() < 0.02) enemies.push(new Enemy());
}

function spawnPowerup() {
  if (Math.random() < 0.01) powerups.push(new Powerup());
}

function shoot() {
  for (let i = 0; i < weaponLevel; i++) {
    bullets.push(new Bullet(hero.x + (i * 20), hero.y));
  }
  shootSound.play();
}

function checkCollisions() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y) {
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
        score += 10000000;
      }
    });
  });

  powerups.forEach((powerup, pIndex) => {
    if (hero.x < powerup.x + powerup.width &&
        hero.x + hero.width > powerup.x &&
        hero.y < powerup.y + powerup.height &&
        hero.y + hero.height > powerup.y) {
      powerups.splice(pIndex, 1);
      weaponLevel++;
    }
  });
}

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  hero.draw();

  bullets.forEach((bullet, index) => {
    bullet.update();
    bullet.draw();
    if (bullet.y < 0) bullets.splice(index, 1);
  });

  enemies.forEach((enemy, index) => {
    enemy.update();
    enemy.draw();
  });

  powerups.forEach((powerup, index) => {
    powerup.update();
    powerup.draw();
  });

  checkCollisions();

  spawnEnemy();
  spawnPowerup();

  document.getElementById("score").textContent = `$${score.toLocaleString()}`;

  if (score >= 1000000000) {
    document.getElementById("gameOver").textContent = "You Win!";
    document.getElementById("gameOver").style.display = "block";
    gameOver = true;
  }

  if (gameOver) {
    document.getElementById("gameOver").style.display = "block";
  }

  requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
  if (gameOver && e.key === "r") {
    location.reload();
  }
  if (e.key === "ArrowLeft") hero.move("left");
  if (e.key === "ArrowRight") hero.move("right");
  if (e.key === "ArrowUp") hero.move("up");
  if (e.key === "ArrowDown") hero.move("down");
  if (e.key === " ") shoot();
});

backgroundMusic.play();
update();