// ======================
// Helpers
// ======================
const $ = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => Array.from(r.querySelectorAll(q));
const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
const rand = (a,b) => Math.random()*(b-a)+a;
const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
const pad2 = (n) => String(n).padStart(2,"0");
const now = () => performance.now();

const toast = $("#toast");
function showToast(t){
  toast.textContent = t;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toast.classList.remove("show"), 1400);
}

// ======================
// Sound (tiny, no files)
// ======================
let soundOn = true;
let audioCtx = null;
function tick(freq=520, ms=70){
  if(!soundOn) return;
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === "suspended") audioCtx.resume();

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = 0.0001;

  o.connect(g); g.connect(audioCtx.destination);

  const t0 = audioCtx.currentTime;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms/1000);
  o.start(t0);
  o.stop(t0 + ms/1000 + 0.02);
}

$("#btnSound").addEventListener("click", ()=>{
  soundOn = !soundOn;
  $("#btnSound").textContent = soundOn ? "🔈" : "🔇";
  showToast(soundOn ? "Sound an" : "Sound aus");
});

$("#btnTheme").addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
  showToast(document.body.classList.contains("dark") ? "🌙 Night Cozy" : "☀️ Day Cozy");
  tick(480,60);
});

// ======================
// Global tap ripple
// ======================
window.addEventListener("pointerdown", (e)=>{
  const r = document.createElement("div");
  r.className = "tapRipple";
  r.style.left = e.clientX + "px";
  r.style.top = e.clientY + "px";
  document.body.appendChild(r);
  setTimeout(()=>r.remove(), 650);
}, {passive:true});

// ======================
// Navigation (screens)
// ======================
const screens = $$("[data-screen]");
const navBtns = $$(".navBtn");

function go(name){
  const current = screens.find(s => s.classList.contains("show"));
  const next = screens.find(s => s.dataset.screen === name);
  if(!next || current === next) return;

  navBtns.forEach(b => b.classList.toggle("active", b.dataset.go === name));

  if(current){
    current.classList.add("out");
    current.classList.remove("show");
    setTimeout(()=>{
      current.classList.remove("out");
      current.style.display = "none";
    }, 190);
  }

  next.style.display = "block";
  requestAnimationFrame(()=> next.classList.add("show"));
  tick(480,60);
}

navBtns.forEach(b => b.addEventListener("click", ()=>go(b.dataset.go)));
$("#btnWords").addEventListener("click", ()=>go("words"));
$("#btnPlay").addEventListener("click", ()=>{
  go("arcade");
  // switch to memory tab
  setTimeout(()=> activateTab("memory"), 30);
});

// ======================
// Cozy Points + Surprise unlock
// ======================
let cozyPoints = 0;
const unlockTarget = 40;

function setPoints(delta){
  cozyPoints = Math.max(0, cozyPoints + delta);
  $("#cozyPoints").textContent = String(cozyPoints);

  const pct = Math.min(100, Math.round((cozyPoints / unlockTarget) * 100));
  $("#unlockPct").textContent = String(pct);

  const unlocked = cozyPoints >= unlockTarget;
  $("#openGift").disabled = !unlocked;
  $("#lockPill").textContent = unlocked ? "🔓 Unlocked" : "🔒 Locked";
  if(unlocked) $("#giftText").textContent = "Okay… du hast es freigeschaltet. Öffne es. 👑";
}

function moodLabel(kind){
  const map = { tea:"Warm", rest:"Ruhig", warm:"Cozy", smile:"Leicht" };
  $("#mood").textContent = map[kind] || "Warm";
}

$$(".chip").forEach(c => c.addEventListener("click", ()=>{
  const k = c.dataset.boost;
  moodLabel(k);
  setPoints(1);
  tick(640,55);
  showToast("Cozy +1");
}));

// ======================
// Teddy
// ======================
const teddyImg = $("#teddyImg");
const teddyFallback = $("#teddyFallback");
const noteText = $("#noteText");

const TEDDY_LINES = [
  "Atme langsam. Du bist sicher. Ich bin da.",
  "Du musst heute nichts beweisen. Ruh dich aus.",
  "Warm bleiben. Tee. Ruhe. Und ein kleines Lächeln später.",
  "Wenn’s schwer ist, machen wir’s weich.",
  "Prenses, du bist auch im Leisen wunderschön."
];

teddyImg.addEventListener("error", ()=>{
  teddyImg.style.display = "none";
  teddyFallback.style.display = "block";
  noteText.textContent = "🧸 (GIF fehlt) – aber die Message bleibt.";
});

function hug(){
  noteText.textContent = pick(TEDDY_LINES);
  setPoints(2);
  tick(560,70);
  showToast("Umarmung gesendet");
}
$("#teddy").addEventListener("click", hug);
$("#btnHug").addEventListener("click", hug);

// ======================
// Words
// ======================
const QUOTES = [
  "Du musst heute nur atmen. Mehr nicht.",
  "Ruh dich aus — das ist kein Rückschritt, das ist Pflege.",
  "Leise Tage sind auch wertvoll.",
  "Ich bin da. Nicht laut. Nur echt.",
  "Warm bleiben. Langsam werden. Du schaffst das.",
  "Wenn du müde bist: Pause ist Stärke.",
  "Du bist genug — auch ohne Leistung.",
  "Prenses, du bist sogar im Chaos schön."
];

let qi = 0;
$("#qTotal").textContent = String(QUOTES.length);

function renderQ(i){
  qi = (i + QUOTES.length) % QUOTES.length;
  $("#quoteText").textContent = QUOTES[qi];
  $("#qIndex").textContent = String(qi+1);
}
renderQ(0);

$("#newQ").addEventListener("click", ()=>{ renderQ(qi+1); tick(520,45); });
$("#nextQ").addEventListener("click", ()=>{ renderQ(qi+1); tick(520,45); });
$("#prevQ").addEventListener("click", ()=>{ renderQ(qi-1); tick(520,45); });

let sx=0, sy=0;
$("#quoteCard").addEventListener("pointerdown", (e)=>{ sx=e.clientX; sy=e.clientY; });
$("#quoteCard").addEventListener("pointerup", (e)=>{
  const dx = e.clientX - sx;
  const dy = e.clientY - sy;
  if(Math.abs(dx) > 45 && Math.abs(dy) < 80){
    renderQ(qi + (dx < 0 ? 1 : -1));
    tick(520,45);
  }
});

// ======================
// Tabs (Arcade)
// ======================
const tabs = $$(".tab");
const panels = $$("[data-panel]");

function activateTab(key){
  tabs.forEach(x => x.classList.toggle("active", x.dataset.tab === key));
  panels.forEach(p=>{
    const on = p.dataset.panel === key;
    p.classList.toggle("show", on);
    p.style.display = on ? "block" : "none";
  });
  tick(520,55);
}

tabs.forEach(t => t.addEventListener("click", ()=> activateTab(t.dataset.tab)));

// ======================
// Arcade: Combo + Score
// ======================
let arcadeScore = 0;
let combo = 1;
const comboEl = $("#comboX");
const arcadeScoreEl = $("#arcadeScore");

function comboReset(){
  combo = 1;
  comboEl.textContent = "x1";
}
function comboUp(){
  combo = Math.min(5, combo + 1);
  comboEl.textContent = "x" + combo;
}
function award(base, toastText="Nice"){
  const gain = base * combo;
  arcadeScore += gain;
  arcadeScoreEl.textContent = String(arcadeScore);
  setPoints(gain);
  comboUp();
  showToast(`${toastText} +${gain}`);
}

// ======================
// Sticker Book (persistent)
// ======================
const STICKERS = ["👑","🧸","✨","🫖","🌙","💛","💌","🌸","⭐️","🍯","🍵","🧣","🥺","🤍","🌼","🎀","🧸","👑","✨","💖"];
function loadUnlocked(){
  try { return JSON.parse(localStorage.getItem("unlockedStickers") || "[]"); } catch { return []; }
}
function saveUnlocked(arr){
  localStorage.setItem("unlockedStickers", JSON.stringify(arr));
}
function unlockSticker(){
  const unlocked = loadUnlocked();
  const pool = STICKERS.map((_,i)=>i).filter(i => !unlocked.includes(i));
  if(pool.length === 0) { showToast("Sticker Book voll ✨"); return; }
  const idx = pool[Math.floor(Math.random()*pool.length)];
  unlocked.push(idx);
  saveUnlocked(unlocked);
  renderStickers();
  showToast("Sticker unlocked ✨");
}

// ======================
// Confetti for wins
// ======================
function confettiBurst(cx, cy, n=22){
  for(let i=0;i<n;i++){
    const d = document.createElement("div");
    d.className = "confettiDot";
    d.style.left = cx + "px";
    d.style.top = cy + "px";
    d.style.setProperty("--dx", (Math.random()*520 - 260) + "px");
    d.style.setProperty("--dy", (Math.random()*520 - 260) + "px");
    document.body.appendChild(d);
    setTimeout(()=>d.remove(), 950);
  }
}

// ======================
// Game UI helpers
// ======================
function gTop(title, sub, scoreLabel, scoreId){
  const wrap = document.createElement("div");
  wrap.className = "gTop";
  wrap.innerHTML = `
    <div>
      <div class="gTitle">${title}</div>
      <div class="gSub">${sub}</div>
    </div>
    <div class="gScore">
      <small>${scoreLabel}</small>
      <strong id="${scoreId}">0</strong>
    </div>
  `;
  return wrap;
}
function gRow(...nodes){
  const row = document.createElement("div");
  row.className = "gRow";
  nodes.forEach(n => row.appendChild(n));
  return row;
}
function mkBtn(text, cls="btn"){
  const b = document.createElement("button");
  b.className = cls;
  b.textContent = text;
  return b;
}
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// ======================
// DOM refs
// ======================
const gMemory  = $("#gMemory");
const gPattern = $("#gPattern");
const gBuilder = $("#gBuilder");
const gCrown   = $("#gCrown");
const gReaction= $("#gReaction");
const gMerge   = $("#gMerge");
const gCatcher = $("#gCatcher");
const gStory   = $("#gStory");
const gConnect = $("#gConnect");
const gStickers= $("#gStickers");

// =====================================================
// 1) MEMORY PREMIUM (Levels + Best + Stars + Crown bonus)
// =====================================================
(function initMemoryPremium(){
  const LEVELS = [
    { id:"L1", name:"Easy",   pairs:6,  cols:4 }, // 12 cards
    { id:"L2", name:"Medium", pairs:8,  cols:4 }, // 16 cards
    { id:"L3", name:"Hard",   pairs:10, cols:5 }, // 20 cards
    { id:"L4", name:"Expert", pairs:12, cols:6 }, // 24 cards
  ];

  const EMOJIS = ["🧸","👑","✨","🫖","🌙","💖","🌸","🍯","🍵","🧣","🤍","🎀","⭐️","💌","🌼","🥺"];
  const SWEET = [
