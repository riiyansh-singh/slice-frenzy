// ----------------------------
// Canvas & Variables
// ----------------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fruits = [], trail = [], particles = [];
let score = 0, lives = 3, highScore = localStorage.getItem("highScore") || 0;
let gameRunning = false, playerName = "Player", mode = "solo", difficulty = "normal";
let botScore = 0, rageMode = false, combo = 0, comboTimer = 0;
let spawnRate = 700, gameTime = 0, pulse = 0, shake = 0;
const sliceSound = document.getElementById("sliceSound");
const bombSound = document.getElementById("bombSound");
const bgMusic = document.getElementById("bgMusic");

// ----------------------------
// Images
// ----------------------------
const fruitImages = [
  "https://cdn-icons-png.flaticon.com/512/590/590685.png",
  "https://cdn-icons-png.flaticon.com/512/415/415733.png",
  "https://cdn-icons-png.flaticon.com/512/135/135620.png",
  "https://cdn-icons-png.flaticon.com/512/590/590774.png"
].map(src => { let img = new Image(); img.src = src; return img; });

const bombImg = new Image();
bombImg.src = "https://cdn-icons-png.flaticon.com/512/484/484167.png";

// ----------------------------
// Voice (Horrid Henry style)
// ----------------------------
function speakHenry(text) {
  let utter = new SpeechSynthesisUtterance(text);
  utter.pitch = 2; // bratty
  utter.rate = 1.2; // mischievous
  utter.volume = 1;
  let voices = speechSynthesis.getVoices();
  let ukVoice = voices.find(v => v.lang.includes("en-GB"));
  if (ukVoice) utter.voice = ukVoice;
  speechSynthesis.speak(utter);
}

// ----------------------------
// Start / Restart
// ----------------------------
function startGame(selectedMode) {
  playerName = document.getElementById("playerName").value || "Player";
  mode = selectedMode;
  difficulty = document.getElementById("difficulty").value;

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameUI").style.display = "block";

  gameRunning = true;
  bgMusic.play();
  if (mode === "bot") speakHenry("Kallu Kalia is ready 😈");
}

function restartGame() { location.reload(); }

// ----------------------------
// Spawning fruits & obstacles
// ----------------------------
function spawn() {
  if (!gameRunning) return;

  let typeRand = Math.random();
  let type;
  if (typeRand < 0.6) type = "fruit";
  else if (typeRand < 0.85) type = "bomb";
  else type = "fastFruit";

  fruits.push({
    x: Math.random() * (canvas.width - 60),
    y: canvas.height,
    size: 60,
    speed: type === "fastFruit" ? 8 : Math.random() * 4 + 4,
    type: type,
    img: type === "bomb" ? bombImg : fruitImages[Math.floor(Math.random() * fruitImages.length)]
  });
}

// ----------------------------
// Blade Trail
// ----------------------------
document.addEventListener("mousemove", e => addPoint(e.clientX, e.clientY));
document.addEventListener("touchmove", e => { let t = e.touches[0]; addPoint(t.clientX, t.clientY); });
function addPoint(x, y) { trail.push({x,y}); if(trail.length>20) trail.shift(); }

// ----------------------------
// Particles
// ----------------------------
function splash(x,y){
  for(let i=0;i<20;i++){
    particles.push({x,y,dx:(Math.random()-0.5)*10,dy:(Math.random()-0.5)*10,life:30});
  }
}

// ----------------------------
// Bot System (difficulty & rage)
let botNames = ["Kallu Kalia 💀","Fake Kallu 😂","Evil Kallu 😈"];
let botName = botNames[Math.floor(Math.random()*botNames.length)];

setInterval(()=>{
  if(mode==="bot" && gameRunning){
    let gain=0;
    if(difficulty==="easy") gain=Math.random()*1;
    if(difficulty==="normal") gain=Math.random()*2;
    if(difficulty==="hard") gain=Math.random()*3;
    if(difficulty==="god") gain=Math.random()*5;
    if(rageMode) gain+=2;
    botScore+=Math.floor(gain);
    if(score>botScore+10&&!rageMode){ rageMode=true; speakHenry("You made Kallu Kalia angry 😈🔥"); }
  }
},800);

// ----------------------------
// Main Draw Loop
// ----------------------------
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  gameTime++; if(gameTime%300===0) spawnRate=Math.max(300,spawnRate-50);

  // Fruits
  fruits.forEach((f,i)=>{
    let actualSpeed = f.speed;
    f.y -= actualSpeed;
    ctx.drawImage(f.img,f.x,f.y,f.size,f.size);
    trail.forEach(p=>{
      let dx=p.x-(f.x+f.size/2), dy=p.y-(f.y+f.size/2);
      if(Math.sqrt(dx*dx+dy*dy)<f.size/2){
        fruits.splice(i,1);
        if(f.type==="bomb"){bombSound.play();endGame();}
        else{sliceSound.play();splash(f.x,f.y);score++;combo++;comboTimer=60;pulse=20;shake=10;}
      }
    });
    if(f.y<-60){fruits.splice(i,1); if(f.type==="fruit") lives--;}
  });

  // Combo Timer
  if(comboTimer>0) comboTimer--; else combo=0;

  // Particles
  particles.forEach((p,i)=>{p.x+=p.dx; p.y+=p.dy; p.life--; ctx.fillStyle="orange"; ctx.fillRect(p.x,p.y,4,4); if(p.life<=0) particles.splice(i,1);});

  // Blade
  ctx.beginPath();
  for(let i=0;i<trail.length-1;i++){ctx.moveTo(trail[i].x,trail[i].y);ctx.lineTo(trail[i+1].x,trail[i+1].y);}
  ctx.strokeStyle="cyan"; ctx.lineWidth=6; ctx.shadowBlur=25; ctx.shadowColor="cyan"; ctx.stroke(); ctx.shadowBlur=0;

  // Score & lives
  document.getElementById("score").innerText="Score: "+score;
  document.getElementById("lives").innerText="Lives: "+"❤️".repeat(lives);

  // Bot display
  if(mode==="bot"){ctx.fillStyle="red"; ctx.font="20px Arial"; ctx.fillText(botName+": "+botScore,10,100);}

  // Screen shake
  if(shake>0){let dx=(Math.random()-0.5)*shake,dy=(Math.random()-0.5)*shake; ctx.setTransform(1,0,0,1,dx,dy); shake--;} else ctx.setTransform(1,0,0,1,0,0);

  // Lives check
  if(lives<=0) endGame();
  requestAnimationFrame(draw);
}
draw();

// ----------------------------
// End Game
// ----------------------------
function endGame(){
  gameRunning=false; bgMusic.pause();
  if(score>highScore) localStorage.setItem("highScore",score);
  document.getElementById("gameUI").style.display="none";
  document.getElementById("gameOver").style.display="block";
  document.getElementById("finalScore").innerText="Score: "+score;

  // Leaderboard
  let scores=JSON.parse(localStorage.getItem("scores"))||[];
  scores.push({name:playerName,score:score});
  scores.sort((a,b)=>b.score-a.score); scores=scores.slice(0,5);
  localStorage.setItem("scores",JSON.stringify(scores));

  let board="🏆 Leaderboard:\n";
  scores.forEach((s,i)=>{board+=`${i+1}. ${s.name} - ${s.score}\n`;});
  alert(board);

  // Bot vs player
  if(mode==="bot"){
    let result = score>botScore ? "You defeated "+botName+" 😎🔥" : botName+" smoked you 💀😂";
    speakHenry(result);
    alert(result);
  }
}

// ----------------------------
// Mouse / Touch Input
// ----------------------------
function addPoint(x,y){trail.push({x,y}); if(trail.length>20) trail.shift();}
document.addEventListener("mousemove",e=>addPoint(e.clientX,e.clientY));
document.addEventListener("touchmove",e=>{let t=e.touches[0]; addPoint(t.clientX,t.clientY);});