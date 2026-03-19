// Canvas & Variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fruits = [], trail = [], particles = [];
let score = 0, lives = 3;
let gameRunning = false, playerName = "Player", mode = "solo", difficulty = "normal";
let botScore = 0;
const sliceSound = document.getElementById("sliceSound");
const bombSound = document.getElementById("bombSound");

// Images
const fruitImages = [
  "https://cdn-icons-png.flaticon.com/512/590/590685.png",
  "https://cdn-icons-png.flaticon.com/512/415/415733.png",
  "https://cdn-icons-png.flaticon.com/512/135/135620.png",
  "https://cdn-icons-png.flaticon.com/512/590/590774.png"
].map(src => { let img = new Image(); img.src = src; return img; });

const bombImg = new Image();
bombImg.src = "https://cdn-icons-png.flaticon.com/512/484/484167.png";

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
}

// Start / Restart
function startGame(selectedMode) {
  playerName = document.getElementById("playerName").value || "Player";
  mode = selectedMode;
  difficulty = document.getElementById("difficulty").value;

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameUI").style.display = "block";

  // Set lives based on difficulty
  lives = difficulty === "toddler" ? 10 : 3;
  gameRunning = true;
  spawnFruitLoop();
}

function restartGame() { location.reload(); }

// Spawning fruits & obstacles
function spawnFruit() {
  if(!gameRunning) return;
  let typeRand = Math.random();
  let type = "fruit";
  if(typeRand>0.85) type="bomb";
  let size = type==="bomb"?60:50;
  fruits.push({
    x: Math.random()*(canvas.width-60),
    y: canvas.height,
    size: size,
    speed: (difficulty==="toddler"?2:Math.random()*4+4),
    type: type,
    img: type==="bomb"?bombImg:fruitImages[Math.floor(Math.random()*fruitImages.length)]
  });
}

let spawnInterval;
function spawnFruitLoop() {
  spawnInterval = setInterval(spawnFruit, 700);
}

// Blade Trail
document.addEventListener("mousemove", e => addPoint(e.clientX, e.clientY));
document.addEventListener("touchmove", e => { let t = e.touches[0]; addPoint(t.clientX, t.clientY); });
function addPoint(x, y) { trail.push({x,y}); if(trail.length>20) trail.shift(); }

// Particles
function splash(x,y){
  for(let i=0;i<20;i++){
    particles.push({x,y,dx:(Math.random()-0.5)*10,dy:(Math.random()-0.5)*10,life:30});
  }
}

// Draw Loop
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Fruits
  fruits.forEach((f,i)=>{
    f.y -= f.speed;
    ctx.drawImage(f.img,f.x,f.y,f.size,f.size);
    trail.forEach(p=>{
      let dx=p.x-(f.x+f.size/2), dy=p.y-(f.y+f.size/2);
      if(Math.sqrt(dx*dx+dy*dy)<f.size/2){
        fruits.splice(i,1);
        if(f.type==="bomb"){bombSound.play();endGame();}
        else{sliceSound.play();splash(f.x,f.y);score++;}
      }
    });
    if(f.y<-60){fruits.splice(i,1); if(f.type==="fruit") lives--;}
  });

  // Particles
  particles.forEach((p,i)=>{p.x+=p.dx;p.y+=p.dy;p.life--;ctx.fillStyle="orange";ctx.fillRect(p.x,p.y,4,4);if(p.life<=0) particles.splice(i,1);});

  // Blade
  ctx.beginPath();
  for(let i=0;i<trail.length-1;i++){ctx.moveTo(trail[i].x,trail[i].y);ctx.lineTo(trail[i+1].x,trail[i+1].y);}
  ctx.strokeStyle="cyan";ctx.lineWidth=6;ctx.stroke();

  // Score & lives
  document.getElementById("score").innerText="Score: "+score;
  document.getElementById("lives").innerText="Lives: "+"❤️".repeat(lives);

  if(lives<=0) endGame();
  requestAnimationFrame(draw);
}
draw();

// End Game
function endGame(){
  gameRunning=false; clearInterval(spawnInterval);
  document.getElementById("gameUI").style.display="none";
  document.getElementById("gameOver").style.display="block";
  document.getElementById("finalScore").innerText="Score: "+score;
}

// Mouse / Touch Input
function addPoint(x,y){trail.push({x,y}); if(trail.length>20) trail.shift();}