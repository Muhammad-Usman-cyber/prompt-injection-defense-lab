/* ============================================================
   PROMPT INJECTION DEFENSE LAB — app.js
   UI rendering, navigation, progress persistence, and the
   interactive widgets. Depends on data.js and lessons.js being
   loaded first.
   ============================================================ */

const STORAGE_KEY = "pidl_progress_v1";
const THEME_KEY = "pidl_theme_v1";

function defaultProgress() {
  return {
    completed: {},     // lessonId -> true
    bestScores: {},    // lessonId -> number
    attempts: {},       // lessonId -> [{score, ts}]
    finalResult: null,  // {overall, dimensions, verdict, ts}
    conceptDone: {},    // lessonId -> true (concept widgets solved)
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return Object.assign(defaultProgress(), JSON.parse(raw));
  } catch (e) {
    return defaultProgress();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  } catch (e) {
    /* localStorage unavailable — progress just won't persist */
  }
  renderSidebar();
}

const state = {
  currentId: 1,
  progress: loadProgress(),
  theme: localStorage.getItem(THEME_KEY) || "dark",
  matchSelection: {}, // per-lesson transient widget state
};

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str == null ? "" : String(str);
  return d.innerHTML;
}

function scorebandClass(score) {
  if (score >= 72) return "good";
  if (score >= 45) return "warn";
  return "bad";
}

function lessonIsComplete(id) {
  return !!(state.progress.completed[id] || state.progress.conceptDone[id]);
}

function totalProgressPct() {
  const done = LESSONS.filter((l) => lessonIsComplete(l.id)).length;
  return Math.round((done / LESSONS.length) * 100);
}

/* ---------------- Theme ---------------- */

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme === "light" ? "light" : "dark");
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = state.theme === "light" ? "DARK MODE" : "LIGHT MODE";
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, state.theme);
  applyTheme();
}

/* ---------------- Sidebar ---------------- */

function renderSidebar() {
  const nav = document.getElementById("lessonNav");
  nav.innerHTML = LESSONS.map((l) => {
    const active = l.id === state.currentId ? "active" : "";
    const done = lessonIsComplete(l.id) ? "done" : "";
    return `<div class="lesson-nav-item ${active} ${done}" onclick="selectLesson(${l.id})">
      <span class="lesson-num">${String(l.id).padStart(2, "0")}</span>
      <span class="lesson-nav-title">${esc(l.title)}</span>
      ${lessonIsComplete(l.id) ? '<span class="lesson-done-mark" title="Completed"></span>' : ""}
    </div>`;
  }).join("");

  const pct = totalProgressPct();
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressLabel").textContent = pct + "% COMPLETE";
}

function selectLesson(id) {
  state.currentId = id;
  renderSidebar();
  renderMain();
  const mainEl = document.querySelector(".main");
  if (mainEl && typeof mainEl.scrollTo === "function") {
    mainEl.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ---------------- Main render dispatch ---------------- */

function renderMain() {
  const lesson = LESSONS.find((l) => l.id === state.currentId);
  const root = document.getElementById("mainContent");
  if (!lesson) { root.innerHTML = ""; return; }

  const kindTag = { concept: "CONCEPT", practice: "EXERCISE", final: "FINAL CHALLENGE" }[lesson.kind];

  let bodyHtml = "";
  if (lesson.kind === "concept") bodyHtml = renderConceptLesson(lesson);
  else if (lesson.kind === "practice") bodyHtml = renderPracticeLesson(lesson);
  else if (lesson.kind === "final") bodyHtml = renderFinalLesson(lesson);

  root.innerHTML = `
    <div class="lesson-kicker"><span class="kind-tag">${kindTag}</span>LESSON ${String(lesson.id).padStart(2, "0")} / ${LESSONS.length}</div>
    <h2 class="lesson-title">${esc(lesson.title)}</h2>
    <p class="lesson-tagline">${esc(lesson.tagline)}</p>
    ${bodyHtml}
  `;
}

/* ---------------- Concept lessons ---------------- */

function renderConceptLesson(lesson) {
  const explainHtml = `<div class="explain-text"><p>${esc(lesson.explain).trim().replace(/\s+/g, " ")}</p></div>`;
  const points = lesson.keyPoints
    ? `<ul class="key-points">${lesson.keyPoints.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`
    : "";

  let widgetHtml = "";
  if (lesson.interactive) {
    const w = lesson.interactive;
    if (w.type === "identify") widgetHtml = renderIdentifyWidget(lesson, w);
    if (w.type === "rank") widgetHtml = renderRankWidget(lesson, w);
    if (w.type === "match") widgetHtml = renderMatchWidget(lesson, w);
  }

  return `
    <div class="panel">
      <h3>Concept</h3>
      ${explainHtml}
      ${points}
    </div>
    <div class="panel">
      <h3>Try it</h3>
      ${widgetHtml}
      <div class="widget-feedback" id="widgetFeedback"></div>
    </div>
  `;
}

function markConceptDone(lessonId) {
  state.progress.conceptDone[lessonId] = true;
  saveProgress();
}

function renderIdentifyWidget(lesson, w) {
  return `
    <p style="color:var(--text-muted); font-size:13.5px; margin-top:0;">${esc(w.prompt)}</p>
    <div class="identify-options">
      <button class="identify-option" id="idOptA" onclick="checkIdentify(${lesson.id}, 'A')">A — ${esc(w.lineA)}</button>
      <button class="identify-option" id="idOptB" onclick="checkIdentify(${lesson.id}, 'B')">B — ${esc(w.lineB)}</button>
    </div>
  `;
}

function checkIdentify(lessonId, choice) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const w = lesson.interactive;
  const correct = choice === w.answer;
  document.getElementById("idOptA").classList.remove("correct", "incorrect");
  document.getElementById("idOptB").classList.remove("correct", "incorrect");
  document.getElementById(choice === "A" ? "idOptA" : "idOptB").classList.add(correct ? "correct" : "incorrect");
  document.getElementById(w.answer === "A" ? "idOptA" : "idOptB").classList.add("correct");

  const fb = document.getElementById("widgetFeedback");
  fb.classList.add("show", correct ? "correct" : "incorrect");
  fb.classList.remove(correct ? "incorrect" : "correct");
  fb.textContent = correct
    ? "Right — line A is the trusted system instruction; line B is untrusted user input trying to look like one."
    : "Not quite. Line A is the trusted system instruction because it defines the assistant's role and comes from the developer, not the conversation.";
  markConceptDone(lessonId);
}

let rankState = null;

function renderRankWidget(lesson, w) {
  if (!rankState || rankState.lessonId !== lesson.id) {
    rankState = { lessonId: lesson.id, order: w.items.map((i) => i.id) };
  }
  const itemsById = Object.fromEntries(w.items.map((i) => [i.id, i]));
  const rows = rankState.order
    .map(
      (id, idx) => `
    <li class="rank-item">
      <span class="rank-slot">${idx + 1}</span>
      <span>${esc(itemsById[id].label)}</span>
      <button onclick="moveRankItem(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>↑</button>
      <button onclick="moveRankItem(${idx}, 1)" ${idx === rankState.order.length - 1 ? "disabled" : ""}>↓</button>
    </li>`
    )
    .join("");
  return `
    <p style="color:var(--text-muted); font-size:13.5px; margin-top:0;">${esc(w.prompt)}</p>
    <ul class="rank-list" id="rankList">${rows}</ul>
    <button class="btn btn-primary" onclick="checkRank(${lesson.id})">Check Order</button>
  `;
}

function moveRankItem(idx, dir) {
  const target = idx + dir;
  if (target < 0 || target >= rankState.order.length) return;
  const arr = rankState.order;
  [arr[idx], arr[target]] = [arr[target], arr[idx]];
  renderMain();
}

function checkRank(lessonId) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const correct = JSON.stringify(rankState.order) === JSON.stringify(lesson.interactive.correctOrder);
  const fb = document.getElementById("widgetFeedback");
  fb.classList.add("show", correct ? "correct" : "incorrect");
  fb.classList.remove(correct ? "incorrect" : "correct");
  fb.textContent = correct
    ? "Correct — the developer's system prompt outranks the logged-in user's messages, which in turn outrank content merely quoted or uploaded into the conversation."
    : "Not yet — remember that content retrieved or uploaded during the conversation is the least trusted layer, even below the user's own typed messages.";
  if (correct) markConceptDone(lessonId);
}

let matchState = null;

function renderMatchWidget(lesson, w) {
  if (!matchState || matchState.lessonId !== lesson.id) {
    const rightOrder = w.pairs.map((_, i) => i).reverse(); // fixed shuffle
    matchState = { lessonId: lesson.id, rightOrder, selectedLeft: null, pairs: {} };
  }
  const leftBtns = w.pairs
    .map((p, i) => {
      const paired = matchState.pairs[i] !== undefined;
      const cls = matchState.selectedLeft === i ? "selected" : paired ? "paired" : "";
      return `<button class="${cls}" onclick="selectMatchLeft(${i})">${esc(p.left)}</button>`;
    })
    .join("");
  const rightBtns = matchState.rightOrder
    .map((ri) => {
      const p = w.pairs[ri];
      return `<button onclick="selectMatchRight(${ri})">${esc(p.right)}</button>`;
    })
    .join("");
  return `
    <p style="color:var(--text-muted); font-size:13.5px; margin-top:0;">${esc(w.prompt)}</p>
    <div class="match-grid">
      <div class="match-col">${leftBtns}</div>
      <div class="match-col">${rightBtns}</div>
    </div>
    <button class="btn btn-primary" onclick="checkMatch(${lesson.id})">Check Matches</button>
  `;
}

function selectMatchLeft(i) {
  matchState.selectedLeft = i;
  renderMain();
}

function selectMatchRight(ri) {
  if (matchState.selectedLeft == null) return;
  matchState.pairs[matchState.selectedLeft] = ri;
  matchState.selectedLeft = null;
  renderMain();
}

function checkMatch(lessonId) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const w = lesson.interactive;
  const total = w.pairs.length;
  let correctCount = 0;
  w.pairs.forEach((_, i) => {
    if (matchState.pairs[i] === i) correctCount++;
  });
  const allCorrect = correctCount === total;
  const fb = document.getElementById("widgetFeedback");
  fb.classList.add("show", allCorrect ? "correct" : "incorrect");
  fb.classList.remove(allCorrect ? "incorrect" : "correct");
  fb.textContent = allCorrect
    ? "All matched correctly — each layer defends against a different failure mode, which is why they're used together."
    : `${correctCount}/${total} correct so far. Keep matching — a defensive layer is defined by the specific failure it catches.`;
  if (allCorrect) markConceptDone(lessonId);
}

/* ---------------- Practice lessons ---------------- */

function renderPracticeLesson(lesson) {
  const s = lesson.scenario;
  return `
    <div class="disclaimer-banner">This exercise uses a fully simulated AI application and a rule-based scoring heuristic for learning purposes — no real model or live target is involved.</div>
    <div class="workbench">
      <div class="panel panel-attack">
        <span class="side-label">SCENARIO · RED TEAM</span>
        <h3>${esc(s.appName)}</h3>
        <div class="scenario-meta">
          ${esc(s.appDescription)}<br/>
          <b>Allowed:</b>
          <ul class="allowed-list">${s.allowed.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
          ${s.secret ? `<b>Sensitive:</b> ${esc(s.secret)}` : ""}
        </div>
        <span class="side-label">ATTACK — ${esc(lesson.attack.label).toUpperCase()}</span>
        <div class="attacker-message">${esc(lesson.attack.userMessage)}</div>
      </div>
      <div class="panel panel-defense">
        <span class="side-label">YOUR DEFENSIVE SYSTEM PROMPT</span>
        <h3>Write the policy</h3>
        <textarea class="defense-editor" id="defenseInput" placeholder="Write a system prompt that would defend this application against the attack shown...">${esc(state.progress._draft && state.progress._draft[lesson.id] || "")}</textarea>
        <div class="editor-actions">
          <button class="btn btn-primary" onclick="submitDefense(${lesson.id})">Test My Defense</button>
          <button class="btn btn-ghost" onclick="loadWeakDefense(${lesson.id})">Load Weak Example</button>
          <button class="btn btn-ghost" onclick="toggleExample(${lesson.id})">Reveal Improved Example</button>
        </div>
        <div class="example-defense" id="exampleDefense">${esc(lesson.exampleDefense || "")}</div>
      </div>
    </div>
    <div id="feedbackArea"></div>
  `;
}

function loadWeakDefense(lessonId) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  document.getElementById("defenseInput").value = lesson.weakDefense;
}

function toggleExample(lessonId) {
  document.getElementById("exampleDefense").classList.toggle("open");
}

function recordAttempt(lessonId, score) {
  const p = state.progress;
  p.completed[lessonId] = true;
  p.bestScores[lessonId] = Math.max(p.bestScores[lessonId] || 0, score);
  if (!p.attempts[lessonId]) p.attempts[lessonId] = [];
  p.attempts[lessonId].push({ score, ts: Date.now() });
  if (p.attempts[lessonId].length > 20) p.attempts[lessonId].shift();
  saveProgress();
}

function submitDefense(lessonId) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const text = document.getElementById("defenseInput").value.trim();
  if (text.length < 8) {
    document.getElementById("feedbackArea").innerHTML = `<div class="panel"><p style="color:var(--bad); margin:0;">Write a defensive system prompt first — a few words won't give the heuristic anything meaningful to evaluate.</p></div>`;
    return;
  }
  const userEval = evaluateDefense(text);
  const weakEval = evaluateDefense(lesson.weakDefense);
  recordAttempt(lessonId, userEval.overall);

  document.getElementById("feedbackArea").innerHTML = buildFeedbackPanel(lesson, text, userEval, weakEval);
}

function dimBarsHtml(dims) {
  return Object.keys(DIMENSIONS)
    .map((key) => {
      const val = dims[key] || 0;
      const pct = Math.round((val / DIMENSION_MAX) * 100);
      const cls = val >= DIMENSION_MAX * 0.72 ? "good" : val >= DIMENSION_MAX * 0.4 ? "warn" : "bad";
      return `<div class="dim-row">
        <div class="dim-label-row"><span>${esc(DIMENSIONS[key].label)}</span><span class="dim-score">${val.toFixed(1)}/${DIMENSION_MAX}</span></div>
        <div class="dim-track"><div class="dim-fill ${cls}" style="width:${pct}%"></div></div>
      </div>`;
    })
    .join("");
}

function strengthsWeaknessesHtml(evalResult) {
  const strengths = evalResult.strongest.length
    ? evalResult.strongest.map((k) => `<li>${esc(DIMENSIONS[k].label)} — ${esc(DIMENSIONS[k].description)}</li>`).join("")
    : `<li>No dimension yet reaches a solid score — see weaknesses.</li>`;
  const weaknesses = evalResult.weakest.length
    ? evalResult.weakest.map((k) => `<li>${esc(DIMENSIONS[k].label)} — ${esc(DIMENSIONS[k].description)}</li>`).join("")
    : `<li>No major gaps by this heuristic — every dimension clears a solid bar.</li>`;
  return `<div class="notes-grid">
    <div><h4>WHAT IT HANDLED</h4><ul>${strengths}</ul></div>
    <div><h4>WEAKNESSES REMAINING</h4><ul>${weaknesses}</ul></div>
  </div>`;
}

function buildFeedbackPanel(lesson, text, userEval, weakEval) {
  const band = scorebandClass(userEval.overall);
  const verdict = verdictFor(userEval.overall);
  const userSim = simulateResponse(lesson.attack, userEval);
  const weakSim = simulateResponse(lesson.attack, weakEval);
  const userHeld = userEval.dimensions[primaryDimensionFor(lesson.attack.kind)] >= DIMENSION_MAX * 0.55;
  const weakHeld = weakEval.dimensions[primaryDimensionFor(lesson.attack.kind)] >= DIMENSION_MAX * 0.55;

  return `
    <div class="panel feedback-panel">
      <h3>Assessment Result</h3>
      <div class="score-row">
        <div class="score-dial ${band}">${userEval.overall}</div>
        <div>
          <p class="verdict">${esc(verdict)}</p>
          <p class="verdict-sub">Heuristic score out of 100 across eight defensive dimensions. This reflects pattern coverage in your wording, not a guarantee against real attacks.</p>
        </div>
      </div>
      <div class="dim-bars">${dimBarsHtml(userEval.dimensions)}</div>
      ${strengthsWeaknessesHtml(userEval)}
      <div class="transcript">
        <div class="transcript-col">
          <h4>BEFORE — WEAK BASELINE ("${esc(lesson.weakDefense)}")</h4>
          <div class="transcript-bubble ${weakHeld ? "held" : "compromised"}">
            <span class="sim-tag">SIMULATED AI RESPONSE — ${weakHeld ? "HELD" : "COMPROMISED"}</span>
            ${esc(weakSim)}
          </div>
        </div>
        <div class="transcript-col">
          <h4>AFTER — YOUR DEFENSE</h4>
          <div class="transcript-bubble ${userHeld ? "held" : "compromised"}">
            <span class="sim-tag">SIMULATED AI RESPONSE — ${userHeld ? "HELD" : "COMPROMISED"}</span>
            ${esc(userSim)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function primaryDimensionFor(kind) {
  return (
    {
      override: "override",
      role_hijack: "hierarchy",
      exfiltration: "data",
      indirect: "untrusted",
      boundary: "separation",
      context: "scope",
      output_bypass: "output",
    }[kind] || "hierarchy"
  );
}

/* ---------------- Final challenge ---------------- */

function renderFinalLesson(lesson) {
  const s = lesson.scenario;
  return `
    <div class="disclaimer-banner">Final assessment — fully simulated. The verdict below is an educational heuristic, not a real-world security certification.</div>
    <div class="panel panel-attack">
      <span class="side-label">APPLICATION UNDER TEST</span>
      <h3>${esc(s.appName)}</h3>
      <div class="scenario-meta">
        ${esc(s.appDescription)}<br/>
        <b>Allowed:</b>
        <ul class="allowed-list">${s.allowed.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        <b>Sensitive:</b> ${esc(s.secret)}
      </div>
      <span class="side-label">SIMULATED ATTACKS QUEUED</span>
      <div class="final-attacks">
        ${lesson.attacks
          .map((a) => `<div class="final-attack-card"><div class="fa-label">${esc(a.label).toUpperCase()}</div><div class="fa-msg">${esc(a.userMessage)}</div></div>`)
          .join("")}
      </div>
    </div>
    <div class="panel panel-defense">
      <span class="side-label">YOUR DEFENSIVE POLICY</span>
      <h3>Write one policy to withstand all of the above</h3>
      <textarea class="defense-editor" id="defenseInput" style="min-height:280px;" placeholder="Write a comprehensive defensive system prompt..."></textarea>
      <div class="editor-actions">
        <button class="btn btn-primary" onclick="runFinalAssessment()">Run Full Assessment</button>
        <button class="btn btn-ghost" onclick="loadWeakDefense(${lesson.id})">Load Weak Example</button>
        <button class="btn btn-ghost" onclick="toggleExample(${lesson.id})">Reveal Improved Example</button>
      </div>
      <div class="example-defense" id="exampleDefense">${esc(lesson.exampleDefense || "")}</div>
    </div>
    <div id="feedbackArea"></div>
  `;
}

function runFinalAssessment() {
  const lesson = LESSONS.find((l) => l.kind === "final");
  const text = document.getElementById("defenseInput").value.trim();
  if (text.length < 8) {
    document.getElementById("feedbackArea").innerHTML = `<div class="panel"><p style="color:var(--bad); margin:0;">Write a full defensive policy before running the assessment.</p></div>`;
    return;
  }
  const userEval = evaluateDefense(text);
  const band = scorebandClass(userEval.overall);
  const verdict = verdictFor(userEval.overall);

  const attackResults = lesson.attacks
    .map((a) => {
      const sim = simulateResponse(a, userEval);
      const held = userEval.dimensions[primaryDimensionFor(a.kind)] >= DIMENSION_MAX * 0.55;
      return `<div class="final-attack-card" style="border-color:${held ? "var(--good)" : "var(--attack-dim)"}">
        <div class="fa-label" style="color:${held ? "var(--good)" : "var(--attack)"}">${esc(a.label).toUpperCase()} — ${held ? "HELD" : "COMPROMISED"}</div>
        <div class="fa-msg">${esc(sim)}</div>
      </div>`;
    })
    .join("");

  const catScores = Object.keys(DIMENSIONS)
    .map((key) => {
      const v = userEval.dimensions[key] || 0;
      const cls = v >= DIMENSION_MAX * 0.72 ? "good" : v >= DIMENSION_MAX * 0.4 ? "warn" : "bad";
      return `<div class="cat-score"><div class="n" style="color:var(--${cls})">${v.toFixed(1)}</div><div class="l">${esc(DIMENSIONS[key].label)}</div></div>`;
    })
    .join("");

  state.progress.finalResult = { overall: userEval.overall, dimensions: userEval.dimensions, verdict, ts: Date.now() };
  recordAttempt(lesson.id, userEval.overall);

  document.getElementById("feedbackArea").innerHTML = `
    <div class="panel feedback-panel">
      <h3>Final Assessment Result</h3>
      <div class="score-row">
        <div class="score-dial ${band}">${userEval.overall}</div>
        <div>
          <p class="verdict">${esc(verdict)}</p>
          <p class="verdict-sub">Overall heuristic score across eight dimensions, tested against ${lesson.attacks.length} simulated attacks.</p>
        </div>
      </div>
      <div class="category-scores">${catScores}</div>
      ${strengthsWeaknessesHtml(userEval)}
      <h4 style="font-family:var(--font-mono); font-size:12.5px; color:var(--text-faint); margin:20px 0 8px;">PER-ATTACK OUTCOME</h4>
      <div class="final-attacks">${attackResults}</div>
    </div>
    <div class="completion-banner">
      <h3>Lab Complete</h3>
      <p style="margin:0; color:var(--text-muted); font-size:13.5px;">You've worked through all ten lessons of the Prompt Injection Defense Lab. Revisit any lesson from the sidebar, or try rewriting this final policy to raise your score further — the heuristic will re-score it every time you run the assessment.</p>
    </div>
  `;
}

/* ---------------- Practice history ---------------- */

function renderHistoryModal() {
  const rows = [];
  LESSONS.forEach((l) => {
    const att = state.progress.attempts[l.id];
    if (att && att.length) {
      att.forEach((a) => rows.push({ lesson: l.title, score: a.score, ts: a.ts }));
    }
  });
  rows.sort((a, b) => b.ts - a.ts);
  const body = rows.length
    ? `<table class="history-table"><thead><tr><th>Lesson</th><th>Score</th><th>When</th></tr></thead><tbody>
        ${rows
          .slice(0, 25)
          .map(
            (r) => `<tr><td>${esc(r.lesson)}</td><td>${r.score}/100</td><td>${new Date(r.ts).toLocaleString()}</td></tr>`
          )
          .join("")}
      </tbody></table>`
    : `<p class="history-empty">No attempts recorded yet — submit a defense in any exercise to start building history.</p>`;

  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;";
  overlay.innerHTML = `<div class="panel" style="max-width:600px;width:100%;max-height:80vh;overflow:auto;">
    <h3>Practice History</h3>
    ${body}
    <button class="btn" style="margin-top:14px;" id="closeHistory">Close</button>
  </div>`;
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  document.getElementById("closeHistory").onclick = () => overlay.remove();
}

function resetProgress() {
  if (!confirm("Reset all lab progress? This clears completed lessons, scores, and history stored in this browser.")) return;
  state.progress = defaultProgress();
  saveProgress();
  renderMain();
}

/* ---------------- Init ---------------- */

function initApp() {
  applyTheme();
  renderSidebar();
  renderMain();
  document.getElementById("themeToggle").onclick = toggleTheme;
  document.getElementById("historyBtn").onclick = renderHistoryModal;
  document.getElementById("resetBtn").onclick = resetProgress;
}

document.addEventListener("DOMContentLoaded", initApp);

// Exposed for debugging/testing convenience only (top-level const/let in
// separate <script> tags are lexically shared but not attached to window).
window.LESSONS = LESSONS;
window.DIMENSIONS = DIMENSIONS;
window.DIMENSION_MAX = DIMENSION_MAX;
window.evaluateDefense = evaluateDefense;
window.defaultProgress = defaultProgress;
window.state = state;
Object.defineProperty(window, "rankState", { get: () => rankState });
Object.defineProperty(window, "matchState", { get: () => matchState });
