// ======================
// Helpers
// ======================
const $ = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => Array.from(r.querySelectorAll(q));
const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
const rand = (a,b) => Math.random()*(b-a)+a;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

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

// Theme
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
$("#btnPlay").addEventListener("click", ()=>go("arcade"));

// ======================
// Cozy Points + Unlock
// ======================
let cozyPoints = 0;
const unlockTarget = 35;

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
  "Prenses, du bist auch in leise wunderschön."
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
// Arcade tabs
// ======================
const tabs = $$(".tab");
const panels = $$("[data-panel]");
tabs.forEach(t => t.addEventListener("click", ()=>{
  tabs.forEach(x => x.classList.toggle("active", x===t));
  const key = t.dataset.tab;
  panels.forEach(p=>{
    const on = p.dataset.panel === key;
    p.classList.toggle("show", on);
    p.style.display = on ? "block" : "none";
  });
  tick(520,55);
}));

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

// ======================
// Arcade Games 1–10
// ======================
const gPattern = $("#gPattern");
const gBuilder = $("#gBuilder");
const gCrown = $("#gCrown");
const gReaction = $("#gReaction");
const gMerge = $("#gMerge");
const gCatcher = $("#gCatcher");
const gStory = $("#gStory");
const gConnect = $("#gConnect");
const gDaily = $("#gDaily");
const gStickers = $("#gStickers");

// 1) Pattern Flow
(function initPattern(){
  let round = 1, score = 0;
  let seq = [], input = [];
  let locked = true;

  gPattern.innerHTML = "";
  gPattern.appendChild(gTop("1) Pattern Flow", "Merken → antippen. Wird langsam länger. Kein Timer.", "Round", "pRound"));

  const pad = document.createElement("div");
  pad.className = "grid4";

  const symbols = ["✦","●","◆","▲"];
  const btns = symbols.map(sym=>{
    const b = document.createElement("div");
    b.className = "tileBtn";
    b.textContent = sym;
    b.onclick = ()=>{
      if(locked) return;
      tick(520,45);
      input.push(sym);

      if(sym !== seq[input.length-1]){
        comboReset();
        showToast("Oops — nochmal ruhig 🙂");
        locked = true;
        input = [];
        setTimeout(showSeq, 420);
        return;
      }

      if(input.length === seq.length){
        score++;
        $("#pScore").textContent = String(score);
        award(2, "Richtig");
        round++;
        $("#pRound").textContent = String(round);
        input = [];
        locked = true;
        setTimeout(()=>{
          seq.push(pick(symbols));
          showSeq();
        }, 420);
      }
    };
    pad.appendChild(b);
    return b;
  });

  const scorePill = document.createElement("div");
  scorePill.style.marginTop = "10px";
  scorePill.innerHTML = `<div class="pill">Score <span id="pScore">0</span></div>`;

  const reset = mkBtn("Reset", "btn ghost");
  reset.onclick = ()=>{
    comboReset();
    round = 1; score = 0;
    $("#pRound").textContent = "1";
    $("#pScore").textContent = "0";
    seq = [pick(symbols)];
    input = [];
    showToast("Reset");
    showSeq();
  };

  gPattern.appendChild(pad);
  gPattern.appendChild(scorePill);
  gPattern.appendChild(gRow(reset));

  function flash(sym){
    const b = btns.find(x=>x.textContent===sym);
    if(!b) return;
    b.classList.add("glow");
    setTimeout(()=>b.classList.remove("glow"), 220);
  }

  function showSeq(){
    locked = true;
    let i = 0;
    const timer = setInterval(()=>{
      flash(seq[i]);
      tick(420,35);
      i++;
      if(i >= seq.length){
        clearInterval(timer);
        setTimeout(()=> locked = false, 240);
      }
    }, 420);
  }

  $("#pRound").textContent = "1";
  seq = [pick(symbols)];
  showSeq();
})();

// 2) Cozy Builder (tap-to-place + drag drop)
(function initBuilder(){
  gBuilder.innerHTML = "";
  gBuilder.appendChild(gTop("2) Cozy Builder", "Zieh 3 Items in die Slots: 🫖 + 🧣 + 🧸 (Cozy-Set).", "Wins", "bWins"));

  let wins = 0;
  const items = ["🫖","🧣","🧸","🌙","✨","💌"];
  const tray = document.createElement("div");
  tray.className = "grid4";

  const zone = document.createElement("div");
  zone.className = "dropZone";
  zone.innerHTML = `
    <div>
      <div class="zoneTitle">Cozy Set</div>
      <div class="gSub">Zieh die richtigen 3 rein (oder tippe sie).</div>
    </div>
    <div class="zoneSlots">
      <div class="slot" data-slot="0">+</div>
      <div class="slot" data-slot="1">+</div>
      <div class="slot" data-slot="2">+</div>
    </div>
  `;

  const state = ["","",""];

  function clear(){
    for(let i=0;i<3;i++) state[i] = "";
    zone.querySelectorAll(".slot").forEach(s=>s.textContent="+");
  }
  function check(){
    const want = ["🫖","🧣","🧸"].sort().join("");
    const have = state.slice().sort().join("");
    if(state.every(Boolean) && have === want){
      wins++;
      $("#bWins").textContent = String(wins);
      award(4, "Cozy Set");
      unlockSticker();
      showToast("Perfekt. Warm & safe. 🤍");
      clear();
    }
  }

  function place(sym){
    const idx = state.findIndex(x=>!x);
    if(idx === -1) return;
    state[idx]=sym;
    zone.querySelector(`.slot[data-slot="${idx}"]`).textContent = sym;
    tick(520,45);
    check();
  }

  items.forEach(sym=>{
    const t = document.createElement("div");
    t.className = "tileBtn";
    t.textContent = sym;
    t.draggable = true;
    t.addEventListener("dragstart",(e)=> e.dataTransfer.setData("text/plain", sym));
    t.addEventListener("click", ()=> place(sym));
    tray.appendChild(t);
  });

  zone.addEventListener("dragover",(e)=>e.preventDefault());
  zone.addEventListener("drop",(e)=>{
    e.preventDefault();
    const sym = e.dataTransfer.getData("text/plain");
    place(sym);
  });

  const reset = mkBtn("Reset", "btn ghost");
  reset.onclick = ()=>{ comboReset(); clear(); showToast("Reset"); };

  gBuilder.appendChild(zone);
  gBuilder.appendChild(tray);
  gBuilder.appendChild(gRow(reset));
})();

// 3) Find the Crown
(function initCrown(){
  gCrown.innerHTML = "";
  gCrown.appendChild(gTop("3) Find the Crown", "Eine Karte hat die 👑. Ruhig tippen.", "Wins", "cWins"));

  let wins=0, level=1;
  const grid = document.createElement("div");
  grid.className = "grid4";

  function round(){
    grid.innerHTML = "";
    const cards = clamp(3 + Math.floor(level/2), 3, 8);
    const crownIndex = Math.floor(Math.random()*cards);

    for(let i=0;i<cards;i++){
      const t = document.createElement("div");
      t.className = "tileBtn";
      t.textContent = "✦";
      t.onclick = ()=>{
        tick(520,45);
        grid.querySelectorAll(".tileBtn").forEach(x=>x.onclick=null);

        if(i===crownIndex){
          t.textContent = "👑";
          wins++; level++;
          $("#cWins").textContent = String(wins);
          award(3, "Treffer");
          unlockSticker();
          setTimeout(round, 520);
        }else{
          comboReset();
          t.textContent = "•";
          grid.children[crownIndex].textContent = "👑";
          showToast("Fast 🙂 nochmal");
          setTimeout(round, 700);
        }
      };
      grid.appendChild(t);
    }
  }

  const reset = mkBtn("Reset", "btn ghost");
  reset.onclick = ()=>{ comboReset(); wins=0; level=1; $("#cWins").textContent="0"; round(); };

  gCrown.appendChild(grid);
  gCrown.appendChild(gRow(reset));
  round();
})();

// 4) Cozy Reaction
(function initReaction(){
  gReaction.innerHTML = "";
  gReaction.appendChild(gTop("4) Cozy Reaction", "Tippe, wenn der Puls am hellsten ist. Kein Stress.", "Perfect", "rPerfect"));

  let perfect=0;
  const pad = document.createElement("div");
  pad.className="pad";

  const dot = document.createElement("div");
  dot.className="pulseDot pulseAnim";
  pad.appendChild(dot);

  let phase = 0;
  const start = performance.now();
  function loop(t){
    const s = (t-start)/1250;
    phase = s - Math.floor(s);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  pad.addEventListener("click", ()=>{
    tick(520,45);
    const dist = Math.abs(phase - 0.5);
    if(dist < 0.08){
      perfect++;
      $("#rPerfect").textContent = String(perfect);
      award(3, "Perfect");
      unlockSticker();
    }else if(dist < 0.14){
      award(1, "Nice");
    }else{
      comboReset();
      showToast("Zu früh/zu spät 🙂");
    }
  });

  const reset = mkBtn("Reset", "btn ghost");
  reset.onclick = ()=>{ comboReset(); perfect=0; $("#rPerfect").textContent="0"; showToast("Reset"); };

  gReaction.appendChild(pad);
  gReaction.appendChild(gRow(reset));
})();

// 5) Tile Merge
(function initMerge(){
  gMerge.innerHTML = "";
  gMerge.appendChild(gTop("5) Tile Merge", "Tippe 2 gleiche Icons nacheinander → sie mergen.", "Level", "mLevel"));

  const chain = ["🫖","🍵","✨","🧸","👑"];
  let level = 0;
  let last = null;

  const tray = document.createElement("div");
  tray.className = "grid4";

  function spawn(){
    tray.innerHTML="";
    const pool = chain.slice(0, Math.min(3, level+2));

    for(let i=0;i<8;i++){
      const sym = pick(pool);
      const t = document.createElement("div");
      t.className="tileBtn";
      t.textContent = sym;
      t.onclick = ()=>{
        tick(520,45);
        if(!last){
          last = sym;
          t.classList.add("glow");
          return;
        }
        if(sym === last){
          const idx = chain.indexOf(sym);
          const next = chain[Math.min(chain.length-1, idx+1)];
          showToast(`${sym}+${sym} → ${next}`);
          award(2, "Merge");
          unlockSticker();
          if(next === "👑") level = Math.min(chain.length-1, level+1);
          $("#mLevel").textContent = String(level+1);
        }else{
          comboReset();
          showToast("Nicht gleich 🙂");
        }
        last = null;
        spawn();
      };
      tray.appendChild(t);
    }
  }

  $("#mLevel").textContent = "1";
  const reset = mkBtn("Reset", "btn ghost");
  reset.onclick = ()=>{ comboReset(); level=0; last=null; $("#mLevel").textContent="1"; spawn(); };

  gMerge.appendChild(tray);
  gMerge.appendChild(gRow(reset));
  spawn();
})();

// 6) Mood Catcher
(function initCatcher(){
  gCatcher.innerHTML = "";
  gCatcher.appendChild(gTop("6) Mood Catcher", "Tippe nur die „guten“: 💖 ✨ 🌙 — meide 😷 🌧 💀", "Caught", "kCaught"));

  let caught=0;
  const pad = document.createElement("div");
  pad.className="pad";
  gCatcher.appendChild(pad);

  const good = ["💖","✨","🌙","🧸","💛"];
  const bad  = ["😷","🌧","💀","🔥"];

  function spawn(){
    const isBad = Math.random() < 0.25;
    const el = document.createElement("div");
    el.className="faller";
    el.textContent = isBad ? pick(bad) : pick(good);
    el.style.setProperty("--x", rand(8,92) + "%");
    el.style.setProperty("--s", rand(22,40) + "px");
    el.style.setProperty("--d", rand(3.8,6.2) + "s");
    pad.appendChild(el);

    el.onclick = ()=>{
      tick(520,45);
      if(isBad){
        comboReset();
        showToast("Oops 🙂");
      }else{
        caught++;
        $("#kCaught").textContent = String(caught);
        award(1, "Nice");
      }
      el.remove();
    };

    setTimeout(()=>el.remove(), 7000);
    setTimeout(spawn, rand(450,850));
  }
  spawn();

  const reset = mkBtn("Reset", "btn ghost");
  reset.onclick = ()=>{ comboReset(); caught=0; $("#kCaught").textContent="0"; pad.innerHTML=""; showToast("Reset"); };

  gCatcher.appendChild(gRow(reset));
})();

// 7) Mini Story
(function initStory(){
  gStory.innerHTML = "";
  gStory.appendChild(gTop("7) Mini Story", "Du wählst – die App reagiert. Kleine Szene + Message.", "Scenes", "sScenes"));

  let scenes=0;
  const box = document.createElement("div");
  box.className="revealBox";
  box.innerHTML = `
    <div style="font-weight:950">Was hilft Prenses heute am meisten?</div>
    <div class="gSub" style="margin-top:6px">Wähle einfach – es gibt kein „falsch“.</div>
    <div id="storyOut" style="margin-top:12px;font-weight:900;line-height:1.6;"></div>
  `;
  gStory.appendChild(box);

  function choose(kind){
    tick(520,45);
    scenes++;
    $("#sScenes").textContent = String(scenes);
    const out = $("#storyOut");
    const map = {
      tea: "🫖 Tee-Moment: warm, ruhig, sicher. Ich bin da.",
      hug: "🧸 Umarmung: leise, weich, ohne Druck. 🤍",
      sleep:"😴 Schlaf: der Körper macht Magie. Du musst nur ruhen.",
      stars:"🌙 Sterne: langsam atmen… alles wird wieder leichter."
    };
    out.textContent = map[kind];
    award(2, "Story");
    unlockSticker();
  }

  const b1 = mkBtn("🫖 Tee");
  const b2 = mkBtn("🧸 Umarmung");
  const b3 = mkBtn("😴 Schlaf");
  const b4 = mkBtn("🌙 Sterne");
  b1.onclick=()=>choose("tea");
  b2.onclick=()=>choose("hug");
  b3.onclick=()=>choose("sleep");
  b4.onclick=()=>choose("stars");

  const reset = mkBtn("Reset", "btn ghost");
  reset.onclick = ()=>{ comboReset(); scenes=0; $("#sScenes").textContent="0"; $("#storyOut").textContent=""; showToast("Reset"); };

  gStory.appendChild(gRow(b1,b2,b3,b4, reset));
})();

// 8) Zen Connect
(function initConnect(){
  gConnect.innerHTML = "";
  gConnect.appendChild(gTop("8) Zen Connect", "Verbinde gleiche Symbole. 3 Paare pro Runde.", "Wins", "zWins"));

  let wins=0;
  const board = document.createElement("div");
  board.className="connectBoard";
  gConnect.appendChild(board);

  let active = null;
  let pairs = [];

  function clearBoard(){
    board.innerHTML = "";
    active = null;
    pairs = [];
  }

  function newRound(){
    clearBoard();
    const symbols = ["👑","🧸","✨"];
    const used = new Set();

    function place(sym){
      let x,y,key;
      do{
        x = Math.floor(rand(20, 240));
        y = Math.floor(rand(20, 220));
        key = `${Math.floor(x/30)}-${Math.floor(y/30)}`;
      }while(used.has(key));
      used.add(key);

      const n = document.createElement("div");
      n.className="node";
      n.textContent = sym;
      n.style.left = x + "px";
      n.style.top  = y + "px";
      n.dataset.sym = sym;
      n.onclick = ()=>pickNode(n);
      board.appendChild(n);
    }

    symbols.forEach(sym=>{ place(sym); place(sym); });
  }

  function drawLine(a,b){
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const r0 = board.getBoundingClientRect();

    const ax = ra.left + ra.width/2 - r0.left;
    const ay = ra.top + ra.height/2 - r0.top;
    const bx = rb.left + rb.width/2 - r0.left;
    const by = rb.top + rb.height/2 - r0.top;

    const dx = bx-ax, dy = by-ay;
    const len = Math.hypot(dx,dy);
    const ang = Math.atan2(dy,dx) * 180/Math.PI;

    const line = document.createElement("div");
    line.className="line";
    line.style.left = ax + "px";
    line.style.top  = ay + "px";
    line.style.width = len + "px";
    line.style.transform = `rotate(${ang}deg)`;
    board.appendChild(line);
  }

  function pickNode(n){
    tick(520,45);
    if(!active){
      active = n;
      n.classList.add("glow");
      return;
    }

    const a = active;
    a.classList.remove("glow");
    active = null;

    if(a === n) return;

    if(a.dataset.sym === n.dataset.sym){
      drawLine(a,n);
      pairs.push(a.dataset.sym);
      award(2, "Connected");
      unlockSticker();
      a.onclick = null; n.onclick = null;
      a.style.opacity = ".55";
      n.style.opacity = ".55";

      if(pairs.length >= 3){
        wins++;
        $("#zWins").textContent = String(wins);
        showToast("Round clear ✨");
        setTimeout(newRound, 600);
      }
    }else{
      comboReset();
      showToast("Nicht gleich 🙂");
    }
  }

  const reset = mkBtn("Reset", "btn ghost");
  reset.onclick = ()=>{ comboReset(); wins=0; $("#zWins").textContent="0"; newRound(); };

  gConnect.appendChild(gRow(reset));
  newRound();
})();

// 9) Daily Challenge (easy claim)
(function initDaily(){
  gDaily.innerHTML = "";
  gDaily.appendChild(gTop("9) Daily Challenge", "Jeden Tag 1 kleine Aufgabe. Easy. Bonus + Sticker.", "Done", "dDone"));

  const todayKey = new Date().toISOString().slice(0,10);
  const doneKey = "dailyDone_" + todayKey;
  let done = localStorage.getItem(doneKey) === "1";

  const box = document.createElement("div");
  box.className="revealBox";

  const challenges = [
    "Schaffe 2x „Perfect“ in Cozy Reaction.",
    "Finde 2 Kronen hintereinander.",
    "Baue einmal das Cozy Set (🫖🧣🧸).",
    "Schaffe 3 richtige Pattern-Runden."
  ];
  const seed = Number(todayKey.split("-").join(""));
  const ch = challenges[(seed * 7) % challenges.length];

  box.innerHTML = `
    <div style="font-weight:980">Heute:</div>
    <div class="gSub" style="margin-top:6px">${ch}</div>
    <div style="margin-top:12px; font-weight:900; color: var(--muted)">
      Hinweis: Du darfst’s einfach claimen. Kein Druck. 🤍
    </div>
  `;
  gDaily.appendChild(box);

  const btn = mkBtn(done ? "Schon erledigt ✓" : "Claim Daily Bonus", done ? "btn ghost" : "btn primary");
  btn.disabled = done;
  btn.onclick = ()=>{
    if(done) return;
    done = true;
    localStorage.setItem(doneKey, "1");
    $("#dDone").textContent = "1";
    award(6, "Daily");
    unlockSticker();
    btn.textContent = "Erledigt ✓";
    btn.className = "btn ghost";
    btn.disabled = true;
  };

  const info = mkBtn("Info", "btn ghost");
  info.onclick = ()=>showToast("Daily ist absichtlich easy 🤍");

  gDaily.appendChild(gRow(btn, info));
  $("#dDone").textContent = done ? "1" : "0";
})();

// 10) Sticker Book
function renderStickers(){
  gStickers.innerHTML = "";
  gStickers.appendChild(gTop("10) Sticker Book", "Du schaltest Sticker frei, wenn du spielst. (speichert lokal)", "Unlocked", "stUnlocked"));

  const unlocked = loadUnlocked();
  $("#stUnlocked").textContent = String(unlocked.length);

  const grid = document.createElement("div");
  grid.className="stickerGrid";

  STICKERS.forEach((s,i)=>{
    const d = document.createElement("div");
    d.className = "sticker" + (unlocked.includes(i) ? " unlocked" : "");
    d.textContent = unlocked.includes(i) ? s : "✦";
    grid.appendChild(d);
  });

  const claim = mkBtn("Random Sticker", "btn");
  claim.onclick = ()=>{ tick(520,45); unlockSticker(); };

  const wipe = mkBtn("Reset Stickers", "btn ghost");
  wipe.onclick = ()=>{
    comboReset();
    localStorage.removeItem("unlockedStickers");
    renderStickers();
    showToast("Sticker reset");
  };

  gStickers.appendChild(grid);
  gStickers.appendChild(gRow(claim, wipe));
}
renderStickers();

// ======================
// Surprise (random + interactive)
// ======================
const sModal = $("#sModal");
const sClose = $("#sClose");
const sTitle = $("#sTitle");
const sSub = $("#sSub");
const sBody = $("#sBody");
const sActions = $("#sActions");

function openModal(){
  sModal.classList.add("show");
  sModal.setAttribute("aria-hidden","false");
}
function closeModal(){
  sModal.classList.remove("show");
  sModal.setAttribute("aria-hidden","true");
}
sClose.addEventListener("click", closeModal);
sModal.addEventListener("click", (e)=>{ if(e.target === sModal) closeModal(); });

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

const SURPRISES = ["letter", "holdhug", "pickone", "scratch", "tinyquiz"];
function pickSurprise(){
  const last = localStorage.getItem("lastSurprise") || "";
  let pool = SURPRISES.filter(x => x !== last);
  if(pool.length === 0) pool = SURPRISES.slice();
  const chosen = pool[Math.floor(Math.random()*pool.length)];
  localStorage.setItem("lastSurprise", chosen);
  return chosen;
}

function renderSurprise(type){
  sActions.innerHTML = "";
  sBody.innerHTML = "";

  if(type === "letter"){
    sTitle.textContent = "Ein Brief, ganz leise 💌";
    sSub.textContent = "Tippe auf „Weiter“, um Zeile für Zeile zu öffnen.";

    const lines = [
      "Prenses…",
      "heute musst du nicht stark sein.",
      "Ruh dich aus – ich bin da. Leise, warm, echt.",
      "Und wenn du lächelst, ist das schon ein Sieg. 🤍"
    ];
    let i = 0;

    const box = document.createElement("div");
    box.className = "revealBox";
    box.innerHTML = `<div id="letterLine" style="font-weight:900; line-height:1.6;"></div>`;
    sBody.appendChild(box);

    const btn = document.createElement("button");
    btn.className = "softBtn";
    btn.textContent = "Weiter";
    btn.onclick = ()=>{
      $("#letterLine").textContent = lines[i];
      tick(520,45);
      i++;
      if(i >= lines.length){
        btn.textContent = "Fertig ✨";
        btn.onclick = ()=>{
          const r = sBody.getBoundingClientRect();
          confettiBurst(r.left + r.width/2, r.top + 40, 26);
          award(2, "Sweet");
          closeModal();
        };
      }
    };
    sActions.appendChild(btn);
    btn.click();
    return;
  }

  if(type === "holdhug"){
    sTitle.textContent = "Hold-to-Hug 🧸";
    sSub.textContent = "Halte gedrückt, bis die Umarmung voll ist.";

    const wrap = document.createElement("div");
    wrap.className = "bigCenter";
    wrap.innerHTML = `
      <div class="bigEmoji">🧸</div>
      <div class="progressBar"><div class="progressFill" id="hugFill"></div></div>
      <div style="color:var(--muted);font-weight:800">Hold…</div>
    `;
    sBody.appendChild(wrap);

    const btn = document.createElement("button");
    btn.className = "softBtn";
    btn.textContent = "Gedrückt halten";
    sActions.appendChild(btn);

    let p = 0, tmr = null;
    const fill = ()=> $("#hugFill");

    const start = ()=>{
      if(tmr) return;
      tick(420,40);
      tmr = setInterval(()=>{
        p = Math.min(100, p + 3);
        fill().style.width = p + "%";
        if(p >= 100){
          clearInterval(tmr); tmr = null;
          const r = sBody.getBoundingClientRect();
          confettiBurst(r.left + r.width/2, r.top + r.height/2, 30);
          sSub.textContent = "Umarmung delivered. Ruh dich aus, Prenses. 🤍";
          award(5, "Hug");
          btn.textContent = "Schließen";
          btn.onpointerdown = null;
          btn.onpointerup = null;
          btn.onclick = closeModal;
        }
      }, 40);
    };
    const stop = ()=>{
      if(!tmr) return;
      clearInterval(tmr); tmr = null;
    };

    btn.onpointerdown = start;
    btn.onpointerup = stop;
    btn.onpointercancel = stop;
    return;
  }

  if(type === "pickone"){
    sTitle.textContent = "Wähle 1 Karte ✨";
    sSub.textContent = "Eine davon ist extra süß – wähl einfach.";

    const options = shuffle([
      {e:"🌙", t:"Cozy-Night: Du bist sicher. Alles wird leichter."},
      {e:"🫖", t:"Tee & Ruhe. Ich pass auf dich auf."},
      {e:"💖", t:"Du bist mein Lieblingsmensch. Punkt."}
    ]);

    const grid = document.createElement("div");
    grid.className = "cardFlip";

    options.forEach((o)=>{
      const tile = document.createElement("div");
      tile.className = "miniTile";
      tile.textContent = "✦";
      tile.onclick = ()=>{
        grid.querySelectorAll(".miniTile").forEach(t=>t.onclick=null);
        tile.textContent = o.e;

        const msg = document.createElement("div");
        msg.style.marginTop = "10px";
        msg.style.fontWeight = "900";
        msg.style.lineHeight = "1.5";
        msg.textContent = o.t;
        sBody.appendChild(msg);

        tick(560,55);
        award(3, "Chosen");
        unlockSticker();

        const r = tile.getBoundingClientRect();
        confettiBurst(r.left + r.width/2, r.top + r.height/2, 18);

        sActions.innerHTML = "";
        const closeBtn = document.createElement("button");
        closeBtn.className = "softBtn";
        closeBtn.textContent = "Schließen";
        closeBtn.onclick = closeModal;
        sActions.appendChild(closeBtn);
      };
      grid.appendChild(tile);
    });

    sBody.appendChild(grid);
    return;
  }

  if(type === "scratch"){
    sTitle.textContent = "Rubbel-Reveal ✨";
    sSub.textContent = "Tippe 8x – dann wird die Message freigerubbelt.";

    let taps = 0;
    const target = 8;

    const box = document.createElement("div");
    box.className = "revealBox";
    box.innerHTML = `
      <div class="bigCenter">
        <div class="bigEmoji">🪄</div>
        <div class="progressBar"><div class="progressFill" id="scrFill"></div></div>
        <div id="scrTxt" style="color:var(--muted);font-weight:850">Tap… (0/${target})</div>
      </div>
    `;
    sBody.appendChild(box);

    const update = ()=>{
      $("#scrFill").style.width = Math.round((taps/target)*100) + "%";
      $("#scrTxt").textContent = `Tap… (${taps}/${target})`;
    };

    box.onclick = ()=>{
      taps++;
      tick(680,40);
      update();
      if(taps >= target){
        const msg = document.createElement("div");
        msg.style.marginTop = "10px";
        msg.style.fontWeight = "900";
        msg.style.lineHeight = "1.6";
        msg.textContent = "Prenses… du bist wunderschön, auch wenn du gerade nur ruhst. 🤍";
        sBody.appendChild(msg);

        const r = sBody.getBoundingClientRect();
        confettiBurst(r.left + r.width/2, r.top + 50, 26);
        award(4, "Reveal");
        unlockSticker();

        sActions.innerHTML = "";
        const b = document.createElement("button");
        b.className = "softBtn";
        b.textContent = "Schließen";
        b.onclick = closeModal;
        sActions.appendChild(b);

        box.onclick = null;
      }
    };

    const startBtn = document.createElement("button");
    startBtn.className = "softBtn";
    startBtn.textContent = "Los geht’s";
    startBtn.onclick = ()=>showToast("✨");
    sActions.appendChild(startBtn);
    return;
  }

  // tinyquiz
  if(type === "tinyquiz"){
    sTitle.textContent = "Mini-Quiz (Cozy) 🌙";
    sSub.textContent = "Ganz easy. Nur zum Lächeln.";

    const q = pick([
      {q:"Was ist heute am wichtigsten?", a:["Ruhe","Stress","Druck"], ok:0},
      {q:"Was hilft dem Körper?", a:["Schlaf","Overthinking","Hektik"], ok:0},
      {q:"Was bist du, auch wenn du krank bist?", a:["Genug","Zu wenig","Spät dran"], ok:0},
    ]);

    const box = document.createElement("div");
    box.className = "revealBox";
    box.innerHTML = `<div style="font-weight:950">${q.q}</div><div class="gSub" style="margin-top:6px">Tippe eine Antwort.</div>`;
    sBody.appendChild(box);

    const row = document.createElement("div");
    row.className = "gRow";
    q.a.forEach((txt, idx)=>{
      const b = document.createElement("button");
      b.className = "softBtn";
      b.textContent = txt;
      b.onclick = ()=>{
        tick(520,45);
        if(idx === q.ok){
          showToast("✅ Genau");
          award(3, "Quiz");
          unlockSticker();
          const r = sBody.getBoundingClientRect();
          confettiBurst(r.left + r.width/2, r.top + 60, 18);
          sSub.textContent = "Richtig. Du darfst heute einfach nur sein. 🤍";
        }else{
          comboReset();
          showToast("🙂 nochmal");
          sSub.textContent = "Kein Stress. Versuch’s nochmal.";
        }
      };
      row.appendChild(b);
    });

    sActions.appendChild(row);
    const closeBtn = document.createElement("button");
    closeBtn.className = "softBtn";
    closeBtn.textContent = "Schließen";
    closeBtn.onclick = closeModal;
    sActions.appendChild(closeBtn);
    return;
  }
}

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

$("#openGift").addEventListener("click", ()=>{
  if(cozyPoints < unlockTarget) return;

  $("#gift").classList.add("open");
  $("#giftText").textContent = "Okay… ich öffne es. 👑";
  showToast("🎁 Surprise!");
  tick(880,90);

  const t = pickSurprise();
  renderSurprise(t);
  openModal();
});

// ======================
// Initial state
// ======================
setPoints(0);
go("home");
