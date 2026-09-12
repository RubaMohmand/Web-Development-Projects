// ── STATE ───────────────────────────────────────────────
const state = {
  mood: "idle",
  time: 0,
  currentSpeed: 0.02,
  mouseX: 0,
  mouseY: 0,
  particles: [],
  bursts: [],
  vBars: [],
  vTargets: [],
  breathPhase: 0,
  shadowScale: 1,
};

// ── DOM ─────────────────────────────────────────────────
const dom = {
  master: document.getElementById("puppet-master"),
  hand: document.getElementById("controller-hand"),
  spotlight: document.getElementById("spotlight"),
  scanlines: document.getElementById("scanlines"),
  shadow: document.getElementById("shadow"),
  streaks: document.getElementById("streaks"),
  moodLabel: document.getElementById("mood-label"),
  quoteDisplay: document.getElementById("quote-display"),
  cursor: document.getElementById("cursor"),
  cursorTrail: document.getElementById("cursor-trail"),
  parts: {
    head: document.getElementById("p-head"),
    armLU: document.getElementById("p-arm-l-u"),
    armLL: document.getElementById("p-arm-l-l"),
    armRU: document.getElementById("p-arm-r-u"),
    armRL: document.getElementById("p-arm-r-l"),
    legLU: document.getElementById("p-leg-l-u"),
    legLL: document.getElementById("p-leg-l-l"),
    legRU: document.getElementById("p-leg-r-u"),
    legRL: document.getElementById("p-leg-r-l"),
    handL: document.getElementById("p-hand-l"),
    handR: document.getElementById("p-hand-r"),
  },
  tips: [1, 2, 3, 4, 5].map((i) => document.getElementById(`tip-${i}`)),
  strings: {
    head: document.getElementById("str-head"),
    handL: document.getElementById("str-hand-l"),
    handR: document.getElementById("str-hand-r"),
    kneeL: document.getElementById("str-leg-l"),
    kneeR: document.getElementById("str-leg-r"),
  },
};

// ── MOOD DATA ────────────────────────────────────────────
const MOODS = {
  idle: {
    y: 0,
    rot: 0,
    speed: 0.02,
    armL: 15,
    armR: -15,
    legL: 5,
    legR: -5,
    amp: 2,
    color: "rgba(212,175,55,0.2)",
    filter: "none",
    quote: "…awaiting instruction…",
  },
  dance: {
    y: -40,
    rot: 10,
    speed: 0.15,
    armL: -120,
    armR: 120,
    legL: 40,
    legR: -40,
    amp: 30,
    color: "rgba(255,50,200,0.3)",
    filter: "saturate(1.5)",
    quote: "the strings never stop singing",
    type: "cycle",
  },
  walk: {
    y: -10,
    rot: 5,
    speed: 0.12,
    armL: 40,
    armR: -40,
    legL: 30,
    legR: -30,
    amp: 40,
    color: "rgba(100,200,255,0.2)",
    filter: "none",
    quote: "going somewhere, nowhere",
    type: "cycle",
  },
  wave: {
    y: 0,
    rot: -5,
    speed: 0.1,
    armL: -150,
    armR: -15,
    legL: 5,
    legR: -5,
    amp: 20,
    color: "rgba(200,255,100,0.2)",
    filter: "none",
    quote: "hello, old friend",
    type: "leftOnly",
  },
  zombie: {
    y: 0,
    rot: 15,
    speed: 0.03,
    armL: -90,
    armR: 90,
    legL: 10,
    legR: -10,
    amp: 5,
    color: "rgba(100,255,100,0.15)",
    filter: "grayscale(0.7) brightness(0.8)",
    quote: "braiiins……",
  },
  sit: {
    y: 60,
    rot: 0,
    speed: 0.02,
    armL: 20,
    armR: -20,
    legL: -90,
    legR: 90,
    amp: 2,
    legLower: 90,
    color: "rgba(180,120,255,0.2)",
    filter: "none",
    quote: "rest. observe. wait.",
  },
  jump: {
    y: -180,
    rot: 0,
    speed: 0.05,
    armL: -160,
    armR: 160,
    legL: 80,
    legR: -80,
    amp: 5,
    color: "rgba(255,220,50,0.35)",
    filter: "brightness(1.1)",
    quote: "weightless",
  },
  pray: {
    y: 70,
    rot: 10,
    speed: 0.02,
    armL: -20,
    armR: 20,
    legL: 110,
    legR: -110,
    head: 50,
    amp: 2,
    legLower: 0,
    color: "rgba(255,200,100,0.25)",
    filter: "sepia(0.3)",
    quote: "grant me one more motion",
  },
  glitch: {
    y: 0,
    rot: 0,
    speed: 0.8,
    armL: -90,
    armR: 90,
    legL: 0,
    legR: 0,
    amp: 60,
    color: "rgba(0,255,255,0.3)",
    filter: "hue-rotate(180deg)",
    quote: "ER̷R̸O̷R̴ ̶4̷0̸4̵ ̸P̶U̸P̵P̴E̸T̷ ̵N̸O̵T̴ ̶F̵O̸U̵N̷D̶",
  },
  drunk: {
    y: 10,
    rot: 20,
    speed: 0.03,
    armL: 40,
    armR: -20,
    legL: 10,
    legR: -20,
    amp: 25,
    color: "rgba(255,100,50,0.2)",
    filter: "blur(0.5px)",
    quote: "jus' one more pull of the string…",
  },
  bow: {
    y: 40,
    rot: 0,
    speed: 0.04,
    armL: 20,
    armR: -20,
    legL: 0,
    legR: 0,
    head: 45,
    amp: 2,
    color: "rgba(212,175,55,0.3)",
    filter: "none",
    quote: "for you, the audience",
  },
  scare: {
    y: -10,
    rot: 0,
    speed: 0.4,
    armL: -140,
    armR: 140,
    legL: -20,
    legR: 20,
    amp: 10,
    color: "rgba(255,50,50,0.35)",
    filter: "contrast(1.3)",
    quote: "BOO",
  },
  float: {
    y: -120,
    rot: 5,
    speed: 0.02,
    armL: -60,
    armR: 60,
    legL: 30,
    legR: -30,
    amp: 10,
    color: "rgba(150,200,255,0.2)",
    filter: "brightness(1.05)",
    quote: "untethered from gravity",
  },
  spin: {
    y: -20,
    rot: 0,
    speed: 0.3,
    armL: -90,
    armR: 90,
    legL: 0,
    legR: 0,
    amp: 5,
    color: "rgba(255,180,255,0.3)",
    filter: "none",
    quote: "round and round forever",
    type: "spin",
  },
  collapse: {
    y: 120,
    rot: 45,
    speed: 0.005,
    armL: 80,
    armR: 70,
    legL: 60,
    legR: 50,
    amp: 0,
    color: "rgba(100,100,100,0.2)",
    filter: "brightness(0.7)",
    quote: "…the strings go slack",
  },
};

const KEYS = "qwertyuiasdfghjk".split("");

// ── PARTICLES ────────────────────────────────────────────
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Ambient dust particles
for (let i = 0; i < 60; i++) {
  state.particles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 0.4 - 0.1,
    size: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.35 + 0.05,
    life: Math.random(),
  });
}

function spawnBurst(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    state.bursts.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: Math.random() * 3 + 1,
      alpha: 1,
      color: color || "#FFFFFF",
      decay: Math.random() * 0.03 + 0.02,
    });
  }
}

// ── VISUALIZER BARS ──────────────────────────────────────
const vizContainer = document.getElementById("visualizer");
const BAR_COUNT = 40;
for (let i = 0; i < BAR_COUNT; i++) {
  const bar = document.createElement("div");
  bar.className = "v-bar";
  bar.style.height = "3px";
  vizContainer.appendChild(bar);
  state.vBars.push(bar);
  state.vTargets.push(3);
}

function updateVisualizer(mood) {
  const intensity = {
    idle: 2,
    dance: 15,
    walk: 8,
    wave: 5,
    zombie: 3,
    sit: 2,
    jump: 12,
    pray: 3,
    glitch: 20,
    drunk: 6,
    bow: 4,
    scare: 18,
    float: 7,
    spin: 14,
    collapse: 1,
  };
  const base = intensity[mood] || 4;
  state.vTargets = state.vTargets.map((_, i) => {
    const center = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
    return Math.max(3, Math.random() * base * (1.5 - center) + 3);
  });
}

// ── STREAKS for dance/spin ───────────────────────────────
function buildStreaks() {
  dom.streaks.innerHTML = "";
  for (let i = 0; i < 12; i++) {
    const s = document.createElement("div");
    s.className = "streak";
    s.style.cssText = `
            left:${Math.random() * 100}%;
            height:${Math.random() * 120 + 40}px;
            opacity:${Math.random() * 0.3 + 0.05};
            animation-duration:${Math.random() * 2 + 1}s;
            animation-delay:${Math.random() * 2}s;
        `;
    dom.streaks.appendChild(s);
  }
}
buildStreaks();

// ── MOOD TRANSITION ──────────────────────────────────────
let quoteTimer = null;

function setMood(moodKey, btnElement) {
  const prev = state.mood;
  state.mood = moodKey;

  // Burst at puppet center
  const puppet = dom.master.getBoundingClientRect();
  const mood = MOODS[moodKey];
  spawnBurst(
    puppet.left + puppet.width / 2,
    puppet.top + puppet.height / 2,
    25,
    "255,255,255",
  );

  // Button UI
  document
    .querySelectorAll(".cmd-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");

  // String flash
  Object.values(dom.strings).forEach((s) => {
    s.style.stroke = "rgba(255,255,255,0.8)";
    setTimeout(() => (s.style.stroke = "var(--string)"), 400);
  });

  // Spotlight color
  dom.spotlight.style.background = `conic-gradient(from 170deg at 50% 0%, transparent 0deg, ${mood.color} 15deg, transparent 30deg)`;

  // Puppet filter
  dom.master.style.filter = mood.filter || "none";

  // Glitch scanlines
  dom.scanlines.style.opacity = moodKey === "glitch" ? "1" : "0";
  dom.master.classList.toggle("glitch-active", moodKey === "glitch");

  // Streaks
  dom.streaks.style.opacity =
    moodKey === "dance" || moodKey === "spin" ? "1" : "0";

  // Shadow
  if (moodKey === "jump" || moodKey === "float") {
    dom.shadow.style.width = "30px";
    dom.shadow.style.opacity = "0.3";
  } else if (moodKey === "sit" || moodKey === "collapse") {
    dom.shadow.style.width = "120px";
    dom.shadow.style.opacity = "0.7";
  } else {
    dom.shadow.style.width = "80px";
    dom.shadow.style.opacity = "0.5";
  }

  // Mood label
  dom.moodLabel.textContent = `— ${moodKey} —`;
  dom.moodLabel.style.color = "rgba(255,255,255,0.6)";
  setTimeout(() => (dom.moodLabel.style.color = "rgba(255,255,255,0.2)"), 800);

  // Quote
  clearTimeout(quoteTimer);
  dom.quoteDisplay.style.opacity = "0";
  quoteTimer = setTimeout(() => {
    dom.quoteDisplay.textContent = mood.quote || "";
    dom.quoteDisplay.style.opacity = "1";
    quoteTimer = setTimeout(() => (dom.quoteDisplay.style.opacity = "0"), 3500);
  }, 300);
}

// ── BUTTONS ──────────────────────────────────────────────
const container = document.getElementById("button-container");
Object.keys(MOODS).forEach((moodKey, i) => {
  const btn = document.createElement("button");
  btn.className = "cmd-btn" + (moodKey === "idle" ? " active" : "");
  btn.innerHTML = `${moodKey}<span class="key-hint">${KEYS[i] || ""}</span>`;
  btn.onclick = () => setMood(moodKey, btn);
  container.appendChild(btn);
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  const idx = KEYS.indexOf(e.key.toLowerCase());
  if (idx >= 0) {
    const key = Object.keys(MOODS)[idx];
    if (key) {
      const btn = container.children[idx];
      setMood(key, btn);
    }
  }
});

// ── MAIN LOOP ────────────────────────────────────────────
let spinAngle = 0;
let trailX = 0,
  trailY = 0;

function update() {
  const mood = MOODS[state.mood] || MOODS.idle;
  state.time += state.currentSpeed;
  state.currentSpeed += (mood.speed - state.currentSpeed) * 0.1;

  // Mouse-reactive sway offset
  const mouseOffX = (state.mouseX / window.innerWidth - 0.5) * 15;

  // Puppet movement
  const swayX = Math.sin(state.time * 0.5) * mood.amp + mouseOffX * 0.3;
  const swayY = Math.cos(state.time * 0.8) * (mood.amp * 0.5) + mood.y;

  // Spin mode
  if (state.mood === "spin") {
    spinAngle += 4;
    dom.master.style.transform = `translate(${swayX}px, ${swayY}px) rotate(${spinAngle}deg)`;
  } else {
    spinAngle = 0;
    const bodyRot = mood.rot + Math.sin(state.time) * 2;
    dom.master.style.transform = `translate(${swayX}px, ${swayY}px) rotate(${bodyRot}deg)`;
  }

  dom.hand.style.transform = `translateX(calc(-50% + ${swayX * 0.4}px)) translateY(${Math.sin(state.time) * 8}px)`;

  // Limbs
  let oscL, oscR;
  if (mood.type === "cycle") {
    oscL = Math.sin(state.time * 5) * mood.amp;
    oscR = Math.sin(state.time * 5 + Math.PI) * mood.amp;
  } else if (mood.type === "leftOnly") {
    oscL = Math.sin(state.time * 5) * mood.amp;
    oscR = Math.sin(state.time) * 2;
  } else if (mood.type === "spin") {
    oscL = Math.sin(state.time * 8) * 30;
    oscR = -oscL;
  } else {
    oscL = Math.sin(state.time * 5) * (mood.amp * 0.2);
    oscR = -oscL;
  }

  dom.parts.armLU.style.transform = `rotate(${mood.armL + oscL}deg)`;
  dom.parts.armRU.style.transform = `rotate(${mood.armR + oscR}deg)`;
  dom.parts.legLU.style.transform = `rotate(${mood.legL + oscR}deg)`;
  dom.parts.legRU.style.transform = `rotate(${mood.legR + oscL}deg)`;

  const lLower = mood.legLower !== undefined ? mood.legLower : 10;
  dom.parts.legLL.style.transform = `rotate(${lLower + (oscR > 0 ? oscR * 0.5 : 0)}deg)`;
  dom.parts.legRL.style.transform = `rotate(${-lLower + (oscL < 0 ? oscL * 0.5 : 0)}deg)`;
  dom.parts.head.style.transform = `rotate(${mood.head !== undefined ? mood.head : Math.sin(state.time) * 5}deg)`;

  // Breathing on chest
  state.breathPhase += 0.04;
  const breathScale = 1 + Math.sin(state.breathPhase) * 0.015;
  document.querySelector(".chest").style.transform = `scaleX(${breathScale})`;

  // Strings
  drawStrings();

  // Particles
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateParticles(mood);
  updateBursts();

  // Visualizer
  if (Math.random() < 0.15) updateVisualizer(state.mood);
  state.vBars.forEach((bar, i) => {
    const curr = parseFloat(bar.style.height) || 3;
    const next = curr + (state.vTargets[i] - curr) * 0.25;
    bar.style.height = next + "px";
  });

  // Cursor trail
  trailX += (state.mouseX - trailX) * 0.12;
  trailY += (state.mouseY - trailY) * 0.12;
  dom.cursorTrail.style.left = trailX + "px";
  dom.cursorTrail.style.top = trailY + "px";

  requestAnimationFrame(update);
}

function updateParticles(mood) {
  const speedMult = state.currentSpeed / 0.02;
  state.particles.forEach((p) => {
    p.x += p.vx + Math.sin(state.time * 0.3 + p.y * 0.01) * 0.2;
    p.y += p.vy - speedMult * 0.05;
    p.life += 0.002;
    if (p.y < -5 || p.life > 1) {
      p.x = Math.random() * canvas.width;
      p.y = canvas.height + 5;
      p.life = 0;
      p.alpha = Math.random() * 0.3 + 0.05;
    }
    const alpha = p.alpha * Math.sin(p.life * Math.PI);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  });
}

function updateBursts() {
  state.bursts = state.bursts.filter((b) => b.alpha > 0.02);
  state.bursts.forEach((b) => {
    b.x += b.vx;
    b.y += b.vy;
    b.vy += 0.15;
    b.alpha -= b.decay;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${b.alpha})`;
    ctx.fill();
  });
}

function drawStrings() {
  const connections = [
    { start: dom.tips[2], end: dom.parts.head, path: dom.strings.head },
    { start: dom.tips[0], end: dom.parts.handL, path: dom.strings.handL },
    { start: dom.tips[4], end: dom.parts.handR, path: dom.strings.handR },
    { start: dom.tips[1], end: dom.parts.legLL, path: dom.strings.kneeL },
    { start: dom.tips[3], end: dom.parts.legRL, path: dom.strings.kneeR },
  ];
  connections.forEach((conn) => {
    const s = conn.start.getBoundingClientRect();
    const e = conn.end.getBoundingClientRect();
    const x1 = s.left + s.width / 2,
      y1 = s.top + s.height / 2;
    const x2 = e.left + e.width / 2,
      y2 = e.top;
    const sag = Math.sin(state.time * 2) * 8;
    conn.path.setAttribute(
      "d",
      `M${x1},${y1} Q${(x1 + x2) / 2 + sag},${(y1 + y2) / 2} ${x2},${y2}`,
    );
  });
}

// ── EVENTS ───────────────────────────────────────────────
document.addEventListener("mousemove", (e) => {
  state.mouseX = e.clientX;
  state.mouseY = e.clientY;
  dom.cursor.style.left = e.clientX + "px";
  dom.cursor.style.top = e.clientY + "px";
  const x = (e.clientX / window.innerWidth - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  document.querySelector(".fog").style.transform = `translate(${x}px, ${y}px)`;
});

document.addEventListener("mousedown", (e) => {
  dom.cursor.style.width = "20px";
  dom.cursor.style.height = "20px";
  dom.cursor.style.background = "rgba(255,255,255,0.2)";
  spawnBurst(e.clientX, e.clientY, 12);
});
document.addEventListener("mouseup", () => {
  dom.cursor.style.width = "12px";
  dom.cursor.style.height = "12px";
  dom.cursor.style.background = "transparent";
});

// ── BOOT ─────────────────────────────────────────────────
setMood("idle", document.querySelector(".cmd-btn"));
update();
