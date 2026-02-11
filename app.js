// ===== tiny helpers =====
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (a,b) => Math.random()*(b-a)+a;

const toast = $("#toast");
function showToast(text){
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toast.classList.remove("show"), 1500);
}

// ===== Cozy night toggle =====
const btnCozy = $("#btnCozy");
let cozyOn = true;
function setCozy(on){
  cozyOn = on;
  btnCozy.setAttribute("aria-pressed", String(on));
  // optional auto-night: keep cozy but also night switch with toggle
  document.body.classList.toggle("cozy-night", !on ? false : document.body.classList.contains("cozy-night"));
}
btnCozy.addEventListener("click", ()=>{
  // toggle night mode instead: cozy button = night
  document.body.classList.toggle("cozy-night");
  showToast(document.body.classList.contains("cozy-night") ? "🌙 Night Cozy" : "☀️ Day Cozy");
});

// ===== Teddy (local gif with fallback) =====
const teddyImg = $("#teddyImg");
const teddyFallback = $("#teddyFallback");
const softText = $("#softText");

const HUG_LINES = [
  "Eine sanfte Umarmung… ganz ruhig. 🤍",
  "Prenses, du musst heute nur atmen. Mehr nicht.",
  "Ich bin da. Leise. Warm. Echt.",
  "Wenn du müde bist: ruh dich aus. Ich halte die Welt kurz an.",
];

teddyImg.addEventListener("error", ()=>{
  teddyImg.style.display = "none";
  teddyFallback.style.display = "block";
  softText.textContent = "🧸 (GIF fehlt) – aber die Umarmung ist da.";
});

function hug(){
  softText.textContent = pick(HUG_LINES);
  showToast("Umarmung gesendet");
}
$("#teddy").addEventListener("click", hug);
$("#btnHug").addEventListener("click", hug);

$("#btnNote").addEventListener("click", ()=>{
  // jump to words screen
  navigate("words");
  showToast("💌 Words");
});

// ===== Navigation =====
const screens = $$("[data-screen]");
const navBtns = $$(".navbtn");

function navigate(name){
  screens.forEach(s => {
    const is = s.getAttribute("data-screen") === name;
    s.hidden = !is;
  });
  navBtns.forEach(b => b.classList.toggle("active", b.dataset.go === name));
}
navBtns.forEach(b => b.addEventListener("click", ()=> navigate(b.dataset.go)));

// ===== Words (cozy cards) =====
const QUOTES = [
  "Ruh dich aus. Die Welt kann warten.",
  "Du bist genug — auch wenn du heute nur liegst.",
  "Wenn du müde bist, ist Pause kein Fehler.",
  "Ich bin da. Ohne Druck. Ohne Erwartungen.",
  "Heute: weich sein. Warm bleiben. Langsam atmen.",
  "Dein Lächeln kommt zurück — Schritt für Schritt.",
  "Du musst niemandem beweisen, dass du stark bist. Du bist es schon.",
  "Wenn’s schwer ist: wir machen es leichter. Zusammen."
];

let qIndex = 0;
$("#quoteTotal").textContent = String(QUOTES.length);

function renderQuote(i){
  qIndex = (i + QUOTES.length) % QUOTES.length;
  $("#quoteText").textContent = QUOTES[qIndex];
  $("#quoteIndex").textContent = String(qIndex + 1);
}
renderQuote(0);

$("#newQuote").addEventListener("click", ()=> renderQuote(qIndex + 1));
$("#nextQuote").addEventListener("click", ()=> renderQuote(qIndex + 1));
$("#prevQuote").addEventListener("click", ()=> renderQuote(qIndex - 1));

// swipe on quote card (mobile)
let sx=0, sy=0;
const quoteCard = $("#quoteCard");
quoteCard.addEventListener("pointerdown", (e)=>{ sx=e.clientX; sy=e.clientY; });
quoteCard.addEventListener("pointerup", (e)=>{
  const dx = e.clientX - sx;
  const dy = e.clientY - sy;
  if(Math.abs(dx) > 45 && Math.abs(dy) < 80){
    renderQuote(qIndex + (dx < 0 ? 1 : -1));
    showToast(dx < 0 ? "Weiter" : "Zurück");
  }
});

// ===== Games Tabs =====
const tabs = $$(".tab");
const gameBubbles = $("#gameBubbles");
const gameHearts  = $("#gameHearts");

tabs.forEach(t => t.addEventListener("click", ()=>{
  tabs.forEach(x => x.classList.toggle("active", x === t));
  const g = t.dataset.game;
  gameBubbles.hidden = g !== "bubbles";
  gameHearts.hidden  = g !== "hearts";
}));

// ===== Bubble Calm =====
const bubbleField = $("#bubbleField");
let bubbleScore = 0;

function spawnBubble(){
  const b = document.createElement("div");
  b.className = "bubble";
  const size = rand(32, 68);
  b.style.setProperty("--size", size + "px");
  b.style.setProperty("--x", rand(8, 92) + "%");
  b.style.setProperty("--dur", rand(6.5, 12.5) + "s");
  bubbleField.appendChild(b);

  b.addEventListener("click", ()=>{
    b.classList.add("pop");
    bubbleScore++;
    $("#bubbleScore").textContent = String(bubbleScore);
    setTimeout(()=> b.remove(), 320);
  });

  // cleanup
  setTimeout(()=> b.remove(), 14000);
}

function seedBubbles(n=10){
  for(let i=0;i<n;i++) setTimeout(spawnBubble, i*260);
}
seedBubbles(10);

$("#bubbleMore").addEventListener("click", ()=> seedBubbles(8));
$("#bubbleClear").addEventListener("click", ()=>{
  bubbleField.innerHTML = "";
  bubbleScore = 0;
  $("#bubbleScore").textContent = "0";
  seedBubbles(10);
  showToast("Reset");
});

// ===== Heart Collector (slow) =====
const heartField = $("#heartField");
let heartScore = 0;

function spawnHeart(){
  const h = document.createElement("div");
  h.className = "heart";
  h.textContent = pick(["❤","♥","💗","💖"]);
  h.style.setProperty("--size", rand(26, 44) + "px");
  h.style.setProperty("--x", rand(10, 90) + "%");
  h.style.setProperty("--dur", rand(7.5, 13.5) + "s");
  heartField.appendChild(h);

  h.addEventListener("click", ()=>{
    h.classList.add("pop");
    heartScore++;
    $("#heartScore").textContent = String(heartScore);
    setTimeout(()=> h.remove(), 320);
  });

  setTimeout(()=> h.remove(), 15000);
}

function seedHearts(n=8){
  for(let i=0;i<n;i++) setTimeout(spawnHeart, i*340);
}

$("#heartSpawn").addEventListener("click", ()=> seedHearts(10));
$("#heartClear").addEventListener("click", ()=>{
  heartField.innerHTML = "";
  heartScore = 0;
  $("#heartScore").textContent = "0";
  showToast("Reset");
});

// ===== Calm breathing =====
const ring = $("#ring");
const breathTitle = $("#breathTitle");
const breathSub = $("#breathSub");

let breathTimer = null;
let phase = 0; // 0 inhale, 1 exhale

function setPhase(p){
  phase = p;
  if(phase === 0){
    breathTitle.textContent = "Einatmen";
    breathSub.textContent = "Langsam… 4 Sekunden";
  } else {
    breathTitle.textContent = "Ausatmen";
    breathSub.textContent = "Sanft… 6 Sekunden";
  }
}

$("#breathStart").addEventListener("click", ()=>{
  if(breathTimer) return;
  ring.classList.add("breathing");
  setPhase(0);
  showToast("Start");

  // Cozy rhythm: inhale 4s, exhale 6s
  let t = 0;
  breathTimer = setInterval(()=>{
    t++;
    if(phase === 0 && t >= 4){ setPhase(1); t=0; }
    else if(phase === 1 && t >= 6){ setPhase(0); t=0; }
  }, 1000);
});

$("#breathStop").addEventListener("click", ()=>{
  clearInterval(breathTimer);
  breathTimer = null;
  ring.classList.remove("breathing");
  breathTitle.textContent = "Einatmen";
  breathSub.textContent = "Langsam…";
  showToast("Stop");
});

// start on Home
navigate("home");
