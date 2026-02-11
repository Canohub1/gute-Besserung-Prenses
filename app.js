// helpers
const $ = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => Array.from(r.querySelectorAll(q));
const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
const rand = (a,b) => Math.random()*(b-a)+a;

const toast = $("#toast");
function showToast(t){
  toast.textContent = t;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toast.classList.remove("show"), 1400);
}

// ---------- global state ----------
let cozyPoints = 0;
let soundOn = true;
let trailSoftness = 1.0; // affects trail spread
const unlockTarget = 30;

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

// ---------- theme + sound ----------
$("#btnTheme").addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
  showToast(document.body.classList.contains("dark") ? "🌙 Night Cozy" : "☀️ Day Cozy");
});
$("#btnSound").addEventListener("click", ()=>{
  soundOn = !soundOn;
  $("#btnSound").textContent = soundOn ? "🔈" : "🔇";
  showToast(soundOn ? "Sound an" : "Sound aus");
});

// soft click sound (no external file)
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

// ---------- navigation ----------
const screens = $$("[data-screen]");
const navBtns = $$(".navBtn");

function go(name){
  screens.forEach(s => s.classList.toggle("show", s.dataset.screen === name));
  navBtns.forEach(b => b.classList.toggle("active", b.dataset.go === name));
  tick(480,60);
}
navBtns.forEach(b => b.addEventListener("click", ()=>go(b.dataset.go)));

$("#btnWords").addEventListener("click", ()=>go("words"));
$("#btnPlay").addEventListener("click", ()=>go("arcade"));

// ---------- teddy + words ----------
const teddyImg = $("#teddyImg");
const teddyFallback = $("#teddyFallback");
const noteText = $("#noteText");

const TEDDY_LINES = [
  "Atme langsam. Du bist sicher. Ich bin da.",
  "Du musst heute nichts beweisen. Ruh dich aus.",
  "Warm bleiben. Tee. Ruhe. Und ein kleines Lächeln später.",
  "Wenn’s schwer ist, machen wir’s weich.",
  "Prenses, du bist auch in leise wunderschön.",
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

$$(".chip").forEach(c => c.addEventListener("click", ()=>{
  const k = c.dataset.boost;
  moodLabel(k);
  setPoints(1);
  tick(640,55);
  showToast("Cozy +1");
}));

// ---------- global tap ripple ----------
window.addEventListener("pointerdown", (e)=>{
  const r = document.createElement("div");
  r.className = "tapRipple";
  r.style.left = e.clientX + "px";
  r.style.top = e.clientY + "px";
  document.body.appendChild(r);
  setTimeout(()=>r.remove(), 650);
}, {passive:true});

// ---------- arcade tabs ----------
const tabs = $$(".tab");
const panels = $$("[data-panel]");
tabs.forEach(t => t.addEventListener("click", ()=>{
  tabs.forEach(x => x.classList.toggle("active", x===t));
  const key = t.dataset.tab;
  panels.forEach(p => p.classList.toggle("show", p.dataset.panel === key));
  tick(520,55);
}));

// ---------- Game 1: Zen Bubbles ----------
const bubbleField = $("#bubbleField");
let bubbleScore = 0;

function spawnBubble(){
  const b = document.createElement("div");
  b.className = "bubble";
  b.style.setProperty("--s", rand(28, 68) + "px");
  b.style.setProperty("--x", rand(8, 92) + "%");
  b.style.setProperty("--d", rand(6.8, 12.8) + "s");
  bubbleField.appendChild(b);

  b.addEventListener("click", ()=>{
    b.classList.add("pop");
    bubbleScore++;
    $("#bubbleScore").textContent = String(bubbleScore);
    setPoints(1);
    tick(720,45);
    setTimeout(()=>b.remove(), 280);
  });

  setTimeout(()=>b.remove(), 14000);
}

function seedBubbles(n=10){
  for(let i=0;i<n;i++) setTimeout(spawnBubble, i*240);
}
seedBubbles(10);

$("#bubbleMore").addEventListener("click", ()=>seedBubbles(10));
$("#bubbleReset").addEventListener("click", ()=>{
  bubbleField.innerHTML = "";
  bubbleScore = 0;
  $("#bubbleScore").textContent = "0";
  seedBubbles(10);
  showToast("Reset");
});

// ---------- Game 2: Memory Match ----------
const icons = ["👑","🧸","✨","🫖","🌙","💛"];
let memory = [];
let first = null;
let lock = false;
let moves = 0;

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function buildMemory(){
  const grid = $("#memoryGrid");
  grid.innerHTML = "";
  moves = 0;
  $("#moves").textContent = "0";
  first = null;
  lock = false;

  memory = shuffle([...icons, ...icons]).map((v, idx)=>({ id: idx, v, matched:false }));

  for(const m of memory){
    const card = document.createElement("div");
    card.className = "mCard";
    card.dataset.id = String(m.id);
    card.innerHTML = `
      <div class="face back">✦</div>
      <div class="face front">${m.v}</div>
    `;
    card.addEventListener("click", ()=>flip(card));
    grid.appendChild(card);
  }
}

function flip(cardEl){
  if(lock) return;
  const id = Number(cardEl.dataset.id);
  const m = memory.find(x => x.id === id);
  if(!m || m.matched) return;
  if(cardEl.classList.contains("flipped")) return;

  cardEl.classList.add("flipped");
  tick(520,45);

  if(!first){
    first = { id, v: m.v, el: cardEl };
    return;
  }

  moves++;
  $("#moves").textContent = String(moves);

  const second = { id, v: m.v, el: cardEl };
  if(first.v === second.v){
    memory.find(x=>x.id===first.id).matched = true;
    memory.find(x=>x.id===second.id).matched = true;
    setPoints(3);
    showToast("Match +3");
    first = null;

    // win check
    if(memory.every(x=>x.matched)){
      showToast("Perfekt. Cozy Win 👑");
      setPoints(5);
    }
  } else {
    lock = true;
    setTimeout(()=>{
      first.el.classList.remove("flipped");
      second.el.classList.remove("flipped");
      first = null;
      lock = false;
    }, 520);
  }
}

$("#memoryNew").addEventListener("click", ()=>{ buildMemory(); showToast("Neu gemischt"); });
$("#memoryReset").addEventListener("click", ()=>{ buildMemory(); showToast("Reset"); });
buildMemory();

// ---------- Game 3: Glow Trail ----------
const trailPad = $("#trailPad");
let strokes = 0;
let drawing = false;
let last = null;

function spark(x,y){
  const s = document.createElement("div");
  s.className = "spark";
  s.style.left = x + "px";
  s.style.top = y + "px";
  s.style.setProperty("--dx", rand(-24,24) * trailSoftness + "px");
  s.style.setProperty("--dy", rand(-24,24) * trailSoftness + "px");
  trailPad.appendChild(s);
  setTimeout(()=>s.remove(), 950);
}

trailPad.addEventListener("pointerdown", (e)=>{
  drawing = true;
  last = { x: e.offsetX, y: e.offsetY };
  trailPad.setPointerCapture(e.pointerId);
  tick(420,40);
}, {passive:true});

trailPad.addEventListener("pointermove", (e)=>{
  if(!drawing) return;
  const x = e.offsetX, y = e.offsetY;

  // interpolate for smoothness
  if(last){
    const dx = x - last.x, dy = y - last.y;
    const steps = Math.max(1, Math.floor(Math.hypot(dx,dy)/10));
    for(let i=1;i<=steps;i++){
      spark(last.x + dx*(i/steps), last.y + dy*(i/steps));
    }
  } else {
    spark(x,y);
  }
  last = { x, y };
}, {passive:true});

trailPad.addEventListener("pointerup", (e)=>{
  if(!drawing) return;
  drawing = false;
  last = null;
  strokes++;
  $("#strokes").textContent = String(strokes);
  setPoints(1);
  showToast("Cozy +1");
}, {passive:true});

$("#trailClear").addEventListener("click", ()=>{
  trailPad.querySelectorAll(".spark").forEach(n=>n.remove());
  showToast("Clear");
});
$("#trailSoft").addEventListener("click", ()=>{
  trailSoftness = trailSoftness === 1.0 ? 1.8 : 1.0;
  showToast(trailSoftness === 1.8 ? "Weicher ✨" : "Normal");
});

// ---------- Words cards ----------
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
const quoteCard = $("#quoteCard");
quoteCard.addEventListener("pointerdown", (e)=>{ sx=e.clientX; sy=e.clientY; });
quoteCard.addEventListener("pointerup", (e)=>{
  const dx = e.clientX - sx;
  const dy = e.clientY - sy;
  if(Math.abs(dx) > 45 && Math.abs(dy) < 80){
    renderQ(qi + (dx < 0 ? 1 : -1));
    tick(520,45);
  }
});

// ---------- Surprise: real interactive + random each time ----------
const gift = $("#gift");
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

// helper: tiny confetti burst
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

// pick surprise, avoid same as last
const SURPRISES = ["letter", "holdhug", "pickone", "scratch"];
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
      "heute musst du nichts stark sein.",
      "Ruh dich aus, ich bin da – leise, warm, echt.",
      "Und wenn du lächelst, ist das schon ein Sieg."
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
          showToast("💖");
          closeModal();
        };
      }
    };
    sActions.appendChild(btn);

    // show first automatically
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
          showToast("🧸💖");
          setPoints(5);
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
      // gentle decay
      const decay = setInterval(()=>{
        p = Math.max(0, p - 2);
        fill().style.width = p + "%";
        if(p === 0) clearInterval(decay);
      }, 30);
    };

    btn.onpointerdown = start;
    btn.onpointerup = stop;
    btn.onpointercancel = stop;

    return;
  }

  if(type === "pickone"){
    sTitle.textContent = "Wähle 1 Karte ✨";
    sSub.textContent = "Eine davon ist „extra sweet“ – fühl einfach.";

    const options = shuffle([
      {e:"🌙", t:"Heute ist Cozy-Night. Du bist sicher."},
      {e:"🫖", t:"Tee & Ruhe. Ich pass auf dich auf."},
      {e:"💖", t:"Du bist mein Lieblingsmensch. Punkt."}
    ]);

    const grid = document.createElement("div");
    grid.className = "cardFlip";
    options.forEach((o, idx)=>{
      const tile = document.createElement("div");
      tile.className = "miniTile";
      tile.textContent = "✦";
      tile.onclick = ()=>{
        // reveal selected
        grid.querySelectorAll(".miniTile").forEach(t=>t.onclick=null);
        tile.textContent = o.e;
        const msg = document.createElement("div");
        msg.style.marginTop = "10px";
        msg.style.fontWeight = "900";
        msg.style.lineHeight = "1.5";
        msg.textContent = o.t;
        sBody.appendChild(msg);

        tick(560,55);
        setPoints(3);

        const r = tile.getBoundingClientRect();
        confettiBurst(r.left + r.width/2, r.top + r.height/2, 18);

        const closeBtn = document.createElement("button");
        closeBtn.className = "softBtn";
        closeBtn.textContent = "Schließen";
        closeBtn.onclick = closeModal;
        sActions.innerHTML = "";
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
        <div style="color:var(--muted);font-weight:850">Tap… (${taps}/${target})</div>
      </div>
    `;
    sBody.appendChild(box);

    const update = ()=>{
      $("#scrFill").style.width = Math.round((taps/target)*100) + "%";
      box.querySelector(".bigCenter div:nth-child(3)").textContent = `Tap… (${taps}/${target})`;
    };

    const tap = ()=>{
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
        setPoints(4);

        sActions.innerHTML = "";
        const b = document.createElement("button");
        b.className = "softBtn";
        b.textContent = "Schließen";
        b.onclick = closeModal;
        sActions.appendChild(b);

        box.onclick = null;
      }
    };

    box.onclick = tap;

    // start button
    const b = document.createElement("button");
    b.className = "softBtn";
    b.textContent = "Los geht’s";
    b.onclick = ()=>{ showToast("✨"); };
    sActions.appendChild(b);

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

  // open + random surprise
  gift.classList.add("open");
  $("#giftText").textContent = "Okay… ich öffne es. 👑";
  showToast("🎁 Surprise!");
  tick(880,90);

  const t = pickSurprise();
  renderSurprise(t);
  openModal();
});


// start
go("home");

