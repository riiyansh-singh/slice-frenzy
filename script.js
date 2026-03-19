const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fruits = [];
let trail = [];
let particles = [];

let score = 0;
let lives = 3;
let highScore = localStorage.getItem("highScore") || 0;

document.getElementById("highScore").innerText = "High Score: " + highScore;

let gameRunning = false;

// sounds
const sliceSound = document.getElementById("sliceSound");
const bombSound = document.getElementById("bombSound");
const bgMusic = document.getElementById("bgMusic");

// preload images (IMPORTANT optimization)
const fruitImages = [
  "https://cdn-icons-png.flaticon.com/512/590/590685.png",
  "https://cdn-icons-png.flaticon.com/512/415/415733.png",
  "https://cdn-icons-png.flaticon.com/512/135/135620.png",
  "https://cdn-icons-png.flaticon.com/512/590/590774.png"
].map(src => {
  let img = new Image();
  img.src = src;
  return img;
});

const bombImg = new Image();
bombImg.src = "https://cdn-icons-png.flaticon.com/512/484/484167.png";

// start
function startGame() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameUI").style.display = "block";
  gameRunning = true;
  bgMusic.play();
}

// restart
function restartGame() {
  location.reload();
}

// spawn
function spawn() {
  if (!gameRunning) return;

  let isBomb = Math.random() < 0.2;

  fruits.push({
    x: Math.random() * (canvas.width - 60),
    y: canvas.height,
    size: 60,
    speed: Math.random() * 4 + 4,
    type: isBomb ? "bomb" : "fruit",
    img: isBomb 
      ? bombImg 
      : fruitImages[Math.floor(Math.random() * fruitImages.length)]
  });
}
setInterval(spawn, 700);

// blade trail
function addPoint(x, y) {
  trail.push({ x, y });
  if (trail.length > 20) trail.shift();
}

document.addEventListener("mousemove", e => addPoint(e.clientX, e.clientY));
document.addEventListener("touchmove", e => {
  let t = e.touches[0];
  addPoint(t.clientX, t.clientY);
});

// particles
function splash(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 10,
      dy: (Math.random() - 0.5) * 10,
      life: 30
    });
  }
}

// loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameRunning) {
    requestAnimationFrame(draw);
    return;
  }

  fruits.forEach((f, i) => {
    f.y -= f.speed;

    ctx.drawImage(f.img, f.x, f.y, f.size, f.size);

    trail.forEach(p => {
      let dx = p.x - (f.x + f.size / 2);
      let dy = p.y - (f.y + f.size / 2);
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < f.size / 2) {
        fruits.splice(i, 1);

        if (f.type === "bomb") {
          bombSound.play();
          endGame();
        } else {
          sliceSound.play();
          splash(f.x, f.y);
          score++;
        }
      }
    });

    if (f.y < -60) {
      fruits.splice(i, 1);
      if (f.type === "fruit") lives--;
    }
  });

  // particles
  particles.forEach((p, i) => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;

    ctx.fillStyle = "orange";
    ctx.fillRect(p.x, p.y, 4, 4);

    if (p.life <= 0) particles.splice(i, 1);
  });

  // blade
  ctx.beginPath();
  for (let i = 0; i < trail.length - 1; i++) {
    ctx.moveTo(trail[i].x, trail[i].y);
    ctx.lineTo(trail[i + 1].x, trail[i + 1].y);
  }
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 6;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "cyan";
  ctx.stroke();
  ctx.shadowBlur = 0;

  document.getElementById("score").innerText = "Score: " + score;
  document.getElementById("lives").innerText = "Lives: " + "❤️".repeat(lives);

  if (lives <= 0) endGame();

  requestAnimationFrame(draw);
}

// end
function endGame() {
  gameRunning = false;
  bgMusic.pause();

  if (score > highScore) {
    localStorage.setItem("highScore", score);
  }

  document.getElementById("gameUI").style.display = "none";
  document.getElementById("gameOver").style.display = "block";
  document.getElementById("finalScore").innerText = "Score: " + score;
}

draw();
