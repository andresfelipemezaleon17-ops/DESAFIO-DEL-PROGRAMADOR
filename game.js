// Desafío del Programador - game.js
const QUESTIONS = [{"q": "¿Cuál es la función principal de un sistema operativo?", "choices": ["Gestionar recursos y procesos", "Almacenar páginas web", "Editar imágenes"], "answer": 0, "explain": "El sistema operativo gestiona recursos, procesos y proporciona servicios al software."}, {"q": "¿Qué es una IP pública?", "choices": ["Dirección visible en Internet", "Dirección privada en LAN", "Un puerto de red"], "answer": 0, "explain": "Una IP pública es la dirección que identifica a un dispositivo en Internet."}, {"q": "¿Qué significa RAID en almacenamiento?", "choices": ["Redundant Array of Independent Disks", "Random Access Internal Drive", "Remote Access Information Database"], "answer": 0, "explain": "RAID combina varios discos para redundancia y/o rendimiento."}, {"q": "¿Qué hace un servidor DNS?", "choices": ["Resuelve nombres de dominio a direcciones IP", "Almacena bases de datos", "Protege de virus"], "answer": 0, "explain": "DNS traduce nombres de dominio (ej. google.com) a IPs."}, {"q": "¿Qué es la virtualización?", "choices": ["Crear versiones virtuales de recursos físicos", "Copiar archivos", "Encriptar datos"], "answer": 0, "explain": "La virtualización permite ejecutar máquinas o recursos virtuales sobre hardware físico."}, {"q": "¿Qué protocolo se usa para transferir archivos de forma segura?", "choices": ["SFTP", "HTTP", "FTP"], "answer": 0, "explain": "SFTP (SSH File Transfer Protocol) cifra la transferencia de archivos."}, {"q": "En redes, ¿qué es una VLAN?", "choices": ["Red lógica separada en una misma infraestructura", "Un tipo de firewall", "Un cable de red"], "answer": 0, "explain": "VLAN permite segmentar redes lógicamente sin cambiar el cableado físico."}, {"q": "¿Qué es la latencia en una red?", "choices": ["Tiempo de respuesta entre envío y recepción", "Cantidad de datos transmitidos", "Número de dispositivos conectados"], "answer": 0, "explain": "La latencia es el retraso en la transmisión de datos."}, {"q": "¿Qué representa 'HTTP' en la web?", "choices": ["HyperText Transfer Protocol", "High Transfer Text Protocol", "Hyperlink Text Tool Protocol"], "answer": 0, "explain": "HTTP es el protocolo para transferir páginas web."}, {"q": "¿Cuál es la diferencia principal entre 'hotfix' y 'feature' en desarrollo?", "choices": ["Hotfix corrige bugs urgentes; feature agrega funcionalidades", "Hotfix añade funciones; feature corrige bugs", "No hay diferencia"], "answer": 0, "explain": "Un hotfix soluciona errores críticos; una feature es una nueva funcionalidad."}, {"q": "¿Qué es una base de datos relacional?", "choices": ["Organiza datos en tablas con relaciones", "Almacena solo archivos multimedia", "Es exclusiva para NoSQL"], "answer": 0, "explain": "Las bases de datos relacionales usan tablas y claves para relacionar datos."}, {"q": "¿Qué es 'backup' y por qué es importante?", "choices": ["Copia de seguridad de datos para recuperación", "Tipo de software antivirus", "Un protocolo de red"], "answer": 0, "explain": "Un backup permite recuperar información en caso de pérdida o fallo."}, {"q": "En seguridad, ¿qué es la autenticación multifactor (MFA)?", "choices": ["Requiere múltiples pruebas de identidad", "Un tipo de encriptación", "Un antivirus avanzado"], "answer": 0, "explain": "MFA combina factores (algo que sabes, tienes o eres) para verificar identidad."}, {"q": "¿Cuál es la ventaja principal de usar contenedores (Docker)?", "choices": ["Aislamiento ligero y portabilidad de aplicaciones", "Mejorar la resolución de pantalla", "Aumentar la velocidad del disco"], "answer": 0, "explain": "Los contenedores aíslan aplicaciones, facilitando despliegue y portabilidad."}, {"q": "¿Qué es el modelo cliente-servidor?", "choices": ["Arquitectura donde el cliente solicita servicios al servidor", "Una base de datos especial", "Un protocolo de red"], "answer": 0, "explain": "El cliente pide recursos o servicios al servidor, que los suministra."}];

const TOTAL = 15;
let current = 0;
let score = 0;
let lives = 2;
let timer = null;
let timeLeft = 0;
let playerPos = 12;

const startScreen = document.getElementById('start');
const gameScreen = document.getElementById('game');
const endScreen = document.getElementById('end');
const btnStart = document.getElementById('btnStart');
const btnRestart = document.getElementById('btnRestart');
const levelEl = document.getElementById('level');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const timerEl = document.getElementById('timer');
const qText = document.getElementById('qText');
const choicesDiv = document.getElementById('choices');
const explainEl = document.getElementById('explain');
const playerImg = document.getElementById('player');
const background = document.getElementById('background');

let audioCtx, masterGain, ambientNode;

btnStart.addEventListener('click', startGame);
if (btnRestart) btnRestart.addEventListener('click', () => location.reload());

function startAmbient(){
  try{
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.18;
    masterGain.connect(audioCtx.destination);

    // gentle piano-like using two detuned sine oscillators + envelope
    const o1 = audioCtx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 220;
    const o2 = audioCtx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 277;
    const o1Gain = audioCtx.createGain(); o1Gain.gain.value = 0.000;
    const o2Gain = audioCtx.createGain(); o2Gain.gain.value = 0.000;

    o1.connect(o1Gain); o2.connect(o2Gain);
    o1Gain.connect(masterGain); o2Gain.connect(masterGain);

    // slow amplitude modulation
    const lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.15;
    const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(o1Gain.gain);
    lfoGain.connect(o2Gain.gain);

    // envelope ramp up
    const now = audioCtx.currentTime;
    o1Gain.gain.linearRampToValueAtTime(0.02, now + 0.5);
    o2Gain.gain.linearRampToValueAtTime(0.018, now + 0.5);

    o1.start(); o2.start(); lfo.start();

    ambientNode = {o1,o2,lfo,o1Gain,o2Gain};
  }catch(e){
    console.warn('Audio not available', e);
  }
}

function stopAmbient(){
  if (audioCtx && ambientNode){
    try{
      ambientNode.o1.stop();
      ambientNode.o2.stop();
      ambientNode.lfo.stop();
      audioCtx.close();
    }catch(e){}
    audioCtx = null;
    ambientNode = null;
    masterGain = null;
  }
}

function shuffle(a){ return a.sort(()=>Math.random()-0.5); }

function startGame(){
  startAmbient();
  const pool = [...QUESTIONS];
  shuffle(pool);
  window._QUESTIONS = pool.slice(0, TOTAL);
  current = 0; score = 0; lives = 2; playerPos = 12;
  scoreEl.textContent = 'Puntaje: 0';
  livesEl.textContent = 'Vidas: ' + lives;
  showScreen(gameScreen);
  movePlayer();
  showQuestion();
}

function showScreen(screen){
  [startScreen, gameScreen, endScreen].forEach(s=>s.classList.remove('active'));
  screen.classList.add('active');
}

function levelTime(level){
  // level 1 -> 25s ; level 8 -> 15s ; level 15 -> 8s
  const t = Math.round(25 - (level-1)*(17/14));
  return Math.max(8, t);
}

function showQuestion(){
  if (current >= TOTAL){ winGame(); return; }
  const q = window._QUESTIONS[current];
  levelEl.textContent = 'Nivel: ' + (current+1) + ' / ' + TOTAL;
  qText.textContent = q.q;
  explainEl.textContent = '';
  choicesDiv.innerHTML = '';
  q.choices.forEach((c,i)=>{
    const b = document.createElement('button');
    b.className = 'choice';
    b.textContent = c;
    b.onclick = ()=> answer(i,b);
    choicesDiv.appendChild(b);
  });
  if (timer) clearInterval(timer);
  timeLeft = levelTime(current+1);
  timerEl.textContent = 'Tiempo: ' + timeLeft + 's';
  timer = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = 'Tiempo: ' + timeLeft + 's';
    if (timeLeft <= 0){ clearInterval(timer); timer=null; handleTimeout(); }
  },1000);
}

function answer(i,btn){
  if (timer){ clearInterval(timer); timer=null; }
  const q = window._QUESTIONS[current];
  const correct = (i === q.answer);
  const buttons = document.querySelectorAll('.choice');
  buttons.forEach((b,idx)=>{
    b.disabled = true;
    if (idx === q.answer) b.classList.add('correct');
    else if (idx === i) b.classList.add('wrong');
  });
  if (correct){
    score += 10;
    scoreEl.textContent = 'Puntaje: ' + score;
    advancePlayer();
    explainEl.textContent = q.explain || '';
  } else {
    lives -= 1;
    livesEl.textContent = 'Vidas: ' + lives;
    playerImg.style.transform = 'translateY(6px) rotate(-6deg)';
    setTimeout(()=> playerImg.style.transform = '', 300);
    explainEl.textContent = 'Incorrecto. ' + (q.explain || '');
    if (lives <= 0){ setTimeout(()=> loseGame(), 700); return; }
  }
  current++;
  setTimeout(()=>{ moveBackground(); showQuestion(); }, 900);
}

function handleTimeout(){
  lives -= 1;
  livesEl.textContent = 'Vidas: ' + lives;
  explainEl.textContent = 'Se acabó el tiempo.';
  playerImg.style.transform = 'translateY(6px) rotate(-6deg)';
  setTimeout(()=> playerImg.style.transform = '', 300);
  if (lives <= 0){ setTimeout(()=> loseGame(), 900); return; }
  current++;
  setTimeout(()=>{ moveBackground(); showQuestion(); }, 900);
}

function advancePlayer(){
  const trackWidth = document.getElementById('track').clientWidth;
  const step = Math.round((trackWidth - 140) / TOTAL);
  playerPos = Math.min(trackWidth - 110, playerPos + step);
  playerImg.style.left = playerPos + 'px';
}

function movePlayer(){ playerImg.style.left = playerPos + 'px'; }

function moveBackground(){
  const progress = current / TOTAL;
  const bgWidth = document.getElementById('background').clientWidth;
  const shift = Math.round(progress * (bgWidth/5));
  document.getElementById('background').style.transform = 'translateX(-' + shift + 'px)';
}

function winGame(){
  stopAmbient();
  showScreen(endScreen);
  document.getElementById('endTitle').textContent = '¡Felicidades! 🎉';
  document.getElementById('finalText').textContent = `Completaste los ${TOTAL} niveles. Puntaje: ${score}. ¡Buen trabajo!`;
}

function loseGame(){
  stopAmbient();
  showScreen(endScreen);
  document.getElementById('endTitle').textContent = 'Juego terminado';
  document.getElementById('finalText').textContent = `Has perdido todas las vidas. Puntaje: ${score}. Intenta de nuevo.`;
}

window.addEventListener('beforeunload', ()=> stopAmbient());
