const ARTICLES = [
  {
    source: "CSS-Tricks",
    url: "https://css-tricks.com",
    date: "2026-05-18T09:12",
    title: "CSS Nesting in 2026",
    body: "Native CSS nesting has quietly become the default way most teams structure their stylesheets. We look at what changed and where the sharp edges still live.",
    tag: "css",
  },
  {
    source: "Smashing Magazine",
    url: "https://www.smashingmagazine.com",
    date: "2026-05-17T14:40",
    title: "Fluid Type No Math",
    body: "Designers have long feared clamp() for its syntax. A new generation of generators promises to make fluid typographic scales feel almost effortless.",
    tag: "type",
  },
  {
    source: "A List Apart",
    url: "https://alistapart.com",
    date: "2026-05-16T11:05",
    title: "The Slow Connection",
    body: "Performance is accessibility. We revisit progressive enhancement through the lens of users on degraded networks.",
    tag: "perf",
  },
  {
    source: "web.dev",
    url: "https://web.dev",
    date: "2026-05-15T08:30",
    title: "Baseline 2026",
    body: "A roundup of the features that crossed the Baseline finish line this year, from container queries to scroll-driven animations.",
    tag: "css",
  },
  {
    source: "MDN Blog",
    url: "https://developer.mozilla.org",
    date: "2026-05-14T16:22",
    title: "Power of initial-letter",
    body: "Drop caps are no longer a hack involving floats and magic numbers. The initial-letter property is finally usable across browsers.",
    tag: "type",
  },
  {
    source: "Piccalilli",
    url: "https://piccalil.li",
    date: "2026-05-13T10:48",
    title: "CUBE CSS Five Years On",
    body: "A retrospective on a methodology that asked us to lean into the cascade instead of fighting it. What held up and what did not.",
    tag: "css",
  },
  {
    source: "WebKit Blog",
    url: "https://webkit.org/blog",
    date: "2026-05-12T13:15",
    title: "Line-Height Units",
    body: "The lh and rlh units give you spacing that scales with your text. We walk through the rhythm-based layouts they unlock.",
    tag: "type",
  },
  {
    source: "Frontend Focus",
    url: "https://frontendfoc.us",
    date: "2026-05-11T07:55",
    title: "View Transitions Grow Up",
    body: "Cross-document view transitions shipped widely, and multi-page apps can finally feel as smooth as single-page rivals.",
    tag: "perf",
  },
  {
    source: "Josh Comeau",
    url: "https://www.joshwcomeau.com",
    date: "2026-05-10T19:30",
    title: "Motion Without Sickness",
    body: "Motion can delight or it can nauseate. A guide to honoring prefers-reduced-motion while keeping interfaces alive.",
    tag: "perf",
  },
  {
    source: "Kevin Powell",
    url: "https://www.kevinpowell.co",
    date: "2026-05-09T12:00",
    title: "Subgrid Is Good Now",
    body: "After years of partial support, subgrid finally aligns nested content to a shared track system. Layouts once impossible.",
    tag: "css",
  },
  {
    source: "Chris Coyier",
    url: "https://chriscoyier.net",
    date: "2026-05-08T15:42",
    title: "Personal Site Revival",
    body: "Personal websites are having a moment again. Developers are abandoning walled gardens for hand-built corners of the web.",
    tag: "web",
  },
  {
    source: "History of the Web",
    url: "https://thehistoryoftheweb.com",
    date: "2026-05-07T09:18",
    title: "When Browsers Crashed",
    body: "A look back at the fragile early days of the web, when a single malformed tag could take down your machine.",
    tag: "web",
  },
];

const boardEl = document.getElementById("board");
const pinboardEl = document.getElementById("pinboard");
const stringsEl = document.getElementById("strings");
const footerEl = document.getElementById("footer");
const classifiedEl = document.getElementById("classified");

const STATE = {
  sort: "newest",
  unreadOnly: false,
  strings: false,
  free: false,
};
const read = new Set();
const dismissed = new Set();
const positions = {}; // index -> {x,y} once a card has been dragged
let justDragged = false;

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const cutTitle = (t) =>
  t
    .split("")
    .map((ch) => (ch === " " ? " " : `<span class="cut">${ch}</span>`))
    .join("");
const redactBody = (b) => {
  const words = b.split(" ");
  const hit = Math.floor(words.length / 2);
  words[hit] =
    `<span class="redact" title="${words[hit]}">${words[hit]}</span>`;
  return words.join(" ");
};

function render(animateStrings = false) {
  let list = ARTICLES.map((a, i) => ({ ...a, i }));
  if (STATE.sort === "newest")
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (STATE.sort === "oldest")
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (STATE.sort === "source")
    list.sort((a, b) => a.source.localeCompare(b.source));

  const visible = list.filter(
    (a) => !dismissed.has(a.i) && !(STATE.unreadOnly && read.has(a.i)),
  );

  pinboardEl.innerHTML = "";
  visible.forEach((a, idx) => {
    const rot = ((a.i * 37) % 9) - 4;
    const el = document.createElement("article");
    el.className = "exhibit";
    el.dataset.index = a.i;
    el.dataset.tag = a.tag;
    el.style.setProperty("--rot", rot + "deg");
    el.style.animationDelay = idx * 0.04 + "s";
    if (read.has(a.i)) el.classList.add("is-read");
    if (a.i === 8) el.classList.add("haunted"); // subtle: one drifting pin
    if (STATE.free && positions[a.i]) {
      el.style.setProperty("--x", positions[a.i].x + "px");
      el.style.setProperty("--y", positions[a.i].y + "px");
    }
    el.innerHTML = `
      <div class="ex-meta">
        <a class="feed-source" href="${a.url}" target="_blank" rel="noopener">${a.source}</a>
        <span class="pub-date"><time datetime="${a.date}">${fmtDate(a.date)}</time></span>
      </div>
      <h2 class="ex-title" data-act="notes" title="open case notes">${cutTitle(a.title)}</h2>
      <p class="ex-body">${redactBody(a.body)}</p>
      <div class="ex-actions">
        <button data-act="read">${read.has(a.i) ? "UNFILE" : "FILE"}</button>
        <button data-act="dismiss">REMOVE</button>
      </div>`;
    pinboardEl.appendChild(el);
  });

  footerEl.textContent = `${ARTICLES.length - dismissed.size} EXHIBITS LOGGED \u00B7 DO NOT REMOVE FROM ROOM`;
  if (STATE.strings) drawStrings(animateStrings);
  else clearStrings();
}

/* ---- red string between same-tag cards ---- */
function cardCenter(card) {
  const r = card.getBoundingClientRect();
  const b = boardEl.getBoundingClientRect();
  return { x: r.left - b.left + r.width / 2, y: r.top - b.top + 6 };
}
function drawStrings(animate = false) {
  stringsEl.innerHTML = "";
  const byTag = {};
  pinboardEl.querySelectorAll(".exhibit").forEach((c) => {
    const p = cardCenter(c);
    (byTag[c.dataset.tag] ||= []).push(p);
  });
  Object.values(byTag).forEach((pts) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", pts[k].x);
      l.setAttribute("y1", pts[k].y);
      l.setAttribute("x2", pts[k + 1].x);
      l.setAttribute("y2", pts[k + 1].y);
      stringsEl.appendChild(l);
    }
  });
  stringsEl.setAttribute(
    "viewBox",
    `0 0 ${boardEl.clientWidth} ${boardEl.clientHeight}`,
  );
  stringsEl.classList.toggle("animate", animate);
  requestAnimationFrame(() => stringsEl.classList.add("show"));
}
function clearStrings() {
  stringsEl.classList.remove("show", "animate");
  stringsEl.innerHTML = "";
}

/* ---- pointer drag ---- */
let drag = null;
function enterFreeMode() {
  if (STATE.free) return;

  const pinRect = pinboardEl.getBoundingClientRect();
  const h = pinboardEl.offsetHeight;
  const snap = [];
  pinboardEl.querySelectorAll(".exhibit").forEach((c) => {
    const r = c.getBoundingClientRect();
    snap.push({
      el: c,
      i: c.dataset.index,
      x: r.left - pinRect.left,
      y: r.top - pinRect.top,
    });
  });
  STATE.free = true;
  pinboardEl.classList.add("free");
  pinboardEl.style.height = h + "px";
  snap.forEach((s) => {
    positions[s.i] = { x: s.x, y: s.y };
    s.el.style.setProperty("--x", s.x + "px");
    s.el.style.setProperty("--y", s.y + "px");
  });
}

pinboardEl.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button") || e.target.closest("a")) return;
  const card = e.target.closest(".exhibit");
  if (!card) return;
  enterFreeMode();
  const i = card.dataset.index;
  const ref = pinboardEl.getBoundingClientRect();
  drag = {
    card,
    i,
    moved: false,
    offX: e.clientX - (ref.left + positions[i].x),
    offY: e.clientY - (ref.top + positions[i].y),
  };
  card.setPointerCapture(e.pointerId);
});
pinboardEl.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const ref = pinboardEl.getBoundingClientRect();
  let x = e.clientX - ref.left - drag.offX;
  let y = e.clientY - ref.top - drag.offY;
  x = Math.max(0, Math.min(x, pinboardEl.clientWidth - 240));
  y = Math.max(0, Math.min(y, pinboardEl.clientHeight - 120));
  if (!drag.moved) {
    drag.moved = true;
    drag.card.classList.add("dragging");
  }
  positions[drag.i] = { x, y };
  drag.card.style.setProperty("--x", x + "px");
  drag.card.style.setProperty("--y", y + "px");
  if (STATE.strings) drawStrings(false);
});
function endDrag(e) {
  if (!drag) return;
  if (drag.moved) justDragged = true;
  drag.card.classList.remove("dragging");
  drag = null;
}
pinboardEl.addEventListener("pointerup", endDrag);
pinboardEl.addEventListener("pointercancel", endDrag);

/* ---- card buttons + notes ---- */
pinboardEl.addEventListener("click", (e) => {
  if (justDragged) {
    justDragged = false;
    return;
  }
  const btn = e.target.closest("button[data-act]");
  if (btn) {
    const i = Number(btn.closest(".exhibit").dataset.index);
    if (btn.dataset.act === "read") {
      read.has(i) ? read.delete(i) : read.add(i);
      render(STATE.strings);
    }
    if (btn.dataset.act === "dismiss") {
      dismissed.add(i);
      render(STATE.strings);
    }
    return;
  }
  const title = e.target.closest('[data-act="notes"]');
  if (title) {
    const i = Number(title.closest(".exhibit").dataset.index);
    openNotes(i);
  }
});

/*  controls */
document.querySelector(".controls").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.sort) {
    STATE.sort = btn.dataset.sort;
    document
      .querySelectorAll("[data-sort]")
      .forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    render(STATE.strings);
  }
  if (btn.dataset.filter === "unread") {
    STATE.unreadOnly = !STATE.unreadOnly;
    btn.classList.toggle("is-active", STATE.unreadOnly);
    render(STATE.strings);
  }
  if (btn.dataset.action === "string") {
    STATE.strings = !STATE.strings;
    btn.classList.toggle("is-active", STATE.strings);
    if (STATE.strings) drawStrings(true);
    else clearStrings();
  }
  if (btn.dataset.action === "reset") {
    for (const k in positions) delete positions[k];
    STATE.free = false;
    pinboardEl.classList.remove("free");
    pinboardEl.style.height = "";
    render(STATE.strings);
  }
});

window.addEventListener("resize", () => {
  if (STATE.strings && !STATE.free) drawStrings(false);
});

/* case notes panel */
const notesEl = document.getElementById("notes");
const noteBody = document.getElementById("note-body");
const TAG_LABEL = {
  css: "STYLESHEET ANOMALY",
  type: "TYPOGRAPHIC EVIDENCE",
  perf: "PERFORMANCE INCIDENT",
  web: "COLD CASE / ARCHIVE",
};

function openNotes(i) {
  const a = ARTICLES[i];
  const full = new Date(a.date).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const related = ARTICLES.filter((x, j) => x.tag === a.tag && j !== i).map(
    (x) => x.source,
  );
  noteBody.innerHTML = `
    <div class="note-stamp">EXHIBIT ${String(i + 1).padStart(2, "0")} / ${TAG_LABEL[a.tag] || "UNCLASSIFIED"}</div>
    <h3 class="note-title">${a.title}</h3>
    <p class="note-line"><b>SOURCE:</b> <a href="${a.url}" target="_blank" rel="noopener">${a.source}</a></p>
    <p class="note-line"><b>LOGGED:</b> <time datetime="${a.date}">${full}</time></p>
    <p class="note-line"><b>STATUS:</b> ${read.has(i) ? "FILED" : "UNFILED"}</p>
    <p class="note-text">${a.body}</p>
    <p class="note-line"><b>LINKED EXHIBITS:</b> ${related.length ? related.join(", ") : "none on record"}</p>
    <a class="note-open" href="${a.url}" target="_blank" rel="noopener">OPEN FULL REPORT &rarr;</a>`;
  notesEl.classList.add("open");
}
function closeNotes() {
  notesEl.classList.remove("open");
}

notesEl.addEventListener("click", (e) => {
  if (e.target === notesEl || e.target.closest("[data-close]")) closeNotes();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNotes();
});

setInterval(() => {
  if (Math.random() < 0.18) {
    classifiedEl.classList.remove("show");
    void classifiedEl.offsetWidth;
    classifiedEl.classList.add("show");
  }
}, 12000);

render();
