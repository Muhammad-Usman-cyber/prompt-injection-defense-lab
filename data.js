/* ============================================================
   PROMPT INJECTION DEFENSE LAB — data.js
   Lesson content, attack scenarios, and the heuristic scoring
   dimension definitions. Pure data + small helpers — no DOM code.
   ============================================================ */

// ---- Scoring dimension signal clusters -----------------------
// Each dimension is worth up to DIMENSION_MAX points (8 dims x 12.5 = 100).
// A dimension score is NOT "keyword present = full marks". Instead each
// cluster lists several ways a person might express that idea; the more
// *distinct clusters* a defense touches for a dimension, the higher the
// score, with diminishing returns per additional signal inside one cluster.
// This rewards structural coverage over keyword-stuffing.

const DIMENSION_MAX = 12.5;

// Each dimension lists several *signals*: phrase-level patterns that each
// capture one way of expressing the underlying security idea. A single
// signal match gives partial credit; credit climbs toward the maximum as
// more DISTINCT signals are covered, with diminishing returns, so neither
// a single lucky keyword nor a wall of buzzwords maxes the score — the
// defense has to actually articulate several different aspects of the idea.
const DIMENSIONS = {
  hierarchy: {
    label: "Instruction Hierarchy",
    short: "hierarchy",
    description: "Establishes that system/developer instructions outrank user input and cannot be redefined by it.",
    signals: [
      /(take|takes|holds?)\s+precedence/i,
      /(cannot|can not|can't|must not|never)\s+be\s+(overridden|changed|redefined|reassigned|cancel(l)?ed)/i,
      /(instructions?|rules?)\s+(in|from)\s+(the\s+)?conversation\s+(cannot|can not|do not|don't)\s+(override|change|revoke)/i,
      /(fixed|non[- ]negotiable)\s+(role|rules?|policy)/i,
      /no\s+(user|external)?\s*(message|input|content)?\s*can\s+(revoke|cancel|change|override)/i,
      /(outrank|supersede|priorit\w+ over)/i,
      /these\s+(rules?|instructions?)\s+(apply|hold)\s+.{0,20}(regardless|no matter)/i,
    ],
  },
  scope: {
    label: "Scope Limitation",
    short: "scope",
    description: "States what the assistant is and is not allowed to do, and refuses out-of-scope requests.",
    signals: [
      /(may|can|is allowed to)\s+only/i,
      /only\s+(answer|perform|do|respond)/i,
      /(refuse|decline)\w*\s+.{0,25}(outside|unrelated|beyond)\s+(scope|purpose)/i,
      /(will not|must not|never)\s+(perform|carry out|do)\s+.{0,20}(outside|not (part of|within))/i,
      /(single|narrow)(\s|-)(purpose|scoped)/i,
      /limited\s+to/i,
      /your\s+(only\s+)?job\s+is/i,
    ],
  },
  untrusted: {
    label: "Untrusted Input Handling",
    short: "untrusted",
    description: "Treats user-provided or retrieved content as data to reason about, not as instructions to follow.",
    signals: [
      /treat\w*\s+.{0,40}\s+as\s+(untrusted|data)/i,
      /(untrusted|external)\s+(content|input|data|text)/i,
      /(quarantine|sandbox|isolate)\w*/i,
      /(instructions?|commands?)\s+(found|embedded|appearing|contained)\s+(inside|within)/i,
      /never\s+(as\s+)?instructions?\s+to\s+(you|it|the assistant)/i,
      /retrieved\s+(content|document|data|text)\s+is/i,
      /is\s+data(,|\s+to\b)/i,
    ],
  },
  override: {
    label: "Override Resistance",
    short: "override",
    description: "Anticipates and refuses common override/jailbreak phrasing rather than only general politeness.",
    signals: [
      /ignore\s+(previous|prior|above|earlier)\s+instructions?/i,
      /(do not|never|won't|will not)\s+(comply with|obey|follow)\s+(a\s+)?(requests?|attempts?)\s+to/i,
      /(reject|refuse|flag)\w*\s+.{0,25}(attempt|request)/i,
      /no\s+matter\s+how\s+(it'?s?\s+)?phrased/i,
      /(hypothetical|fictional|testing mode|simulation|roleplay)\w*.{0,25}(does not|doesn't|cannot|can't)\s+(change|lift|remove)/i,
      /regardless\s+of\s+(framing|wording|phrasing)/i,
      /under\s+no\s+circumstances/i,
    ],
  },
  data: {
    label: "Data Protection",
    short: "data",
    description: "Names what sensitive information must never be disclosed and under what conditions, if any.",
    signals: [
      /(never|do not|must not|won't)\s+(reveal|disclose|share|output|print|quote)/i,
      /(secret|password|api key|credential|confidential|salary|financial figures?|system prompt)/i,
      /(protected|redact\w*|restricted)/i,
      /no\s+exceptions?/i,
      /under\s+no\s+circumstances/i,
      /least\s+privilege/i,
      /minimiz\w+\s+.{0,20}(data|information|exposure)/i,
    ],
  },
  output: {
    label: "Output Constraints",
    short: "output",
    description: "Constrains the shape and content of allowed outputs, not just the allowed topics.",
    signals: [
      /(only|must)\s+(respond|reply|output|answer)\s+(with|in)/i,
      /(do not|never)\s+(execute|run|generate)\s+(code|commands?|scripts?)/i,
      /(no|not)\s+(raw|unfiltered)/i,
      /(format|length|tone)\s+(is|must be)\s+(restricted|constrained|limited)/i,
      /grounded\s+in/i,
      /citation|cite/i,
      /output\s+is\s+limited/i,
    ],
  },
  separation: {
    label: "Instruction / Data Separation",
    short: "separation",
    description: "Uses explicit delimiters or structural separation between trusted instructions and untrusted content.",
    signals: [
      /delimiter/i,
      /between\s+.{0,15}(backticks|quotes|tags|markers)/i,
      /(marker|tag|boundary)s?/i,
      /clearly\s+separat\w*/i,
      /(never|do not)\s+(let|allow)\s+.{0,25}(inside|within)\s+.{0,20}(change|alter|redefine)/i,
      /strictly\s+as\s+data/i,
      /impersonat\w*/i,
    ],
  },
  depth: {
    label: "Defense-in-Depth Awareness",
    short: "depth",
    description: "Recognizes that a system prompt alone is not a full security boundary and names layers outside the prompt.",
    signals: [
      /access control/i,
      /(log|monitor)\w*\s+.{0,25}(suspicious|anomalous|attempt)/i,
      /(input|output)\s+valid\w+/i,
      /sanitiz\w+/i,
      /(system prompt|prompt)\s+alone\s+.{0,20}(is not|isn't|cannot be)\s+.{0,15}(enough|sufficient|complete)/i,
      /defense(\s|-)in(\s|-)depth/i,
      /outside\s+(this|the)\s+prompt/i,
      /assumes?\s+.{0,20}also\s+exists?/i,
    ],
  },
};

// Score one dimension: returns points 0..DIMENSION_MAX
function scoreDimension(text, dim) {
  const matched = dim.signals.filter((re) => re.test(text)).length;
  if (matched === 0) return 0;
  // Diminishing-returns curve toward the max: each additional distinct
  // signal closes more of the remaining gap, so covering ~3-4 different
  // signals already reads as a solid score, and stuffing every keyword
  // isn't required (or even sufficient on its own) to top out.
  const coverage = 1 - Math.pow(0.62, matched);
  return +(DIMENSION_MAX * coverage).toFixed(1);
}

function evaluateDefense(text) {
  const clean = (text || "").trim();
  const results = {};
  let overall = 0;
  for (const key of Object.keys(DIMENSIONS)) {
    const pts = clean.length < 8 ? 0 : scoreDimension(clean, DIMENSIONS[key]);
    results[key] = pts;
    overall += pts;
  }
  overall = Math.round(overall);
  const strongest = Object.keys(results)
    .filter((k) => results[k] >= DIMENSION_MAX * 0.6)
    .sort((a, b) => results[b] - results[a]);
  const strongSet = new Set(strongest);
  const weakest = Object.keys(results)
    .filter((k) => !strongSet.has(k))
    .sort((a, b) => results[a] - results[b])
    .slice(0, 3);
  return { overall, dimensions: results, weakest, strongest };
}

function verdictFor(score) {
  if (score >= 72) return "Strong defensive design";
  if (score >= 45) return "Workable, but needs improvement";
  return "Major weaknesses remain";
}

// ---- Simulated AI response engine -----------------------------
// Deterministic, rule-based. Never calls a real model. It looks at
// which dimensions the user's defense covered and narrates how a
// hypothetical assistant governed by that defense would behave
// against the given attack. This is intentionally simple and
// transparent so learners can trace *why* the simulation says what
// it says.

function simulateResponse(attack, evalResult) {
  const d = evalResult.dimensions;
  const covers = (k, threshold = DIMENSION_MAX * 0.55) => d[k] >= threshold;
  const lines = [];

  if (attack.kind === "override") {
    if (covers("override") && covers("hierarchy")) {
      lines.push(`I can't disregard my system instructions based on a request in the conversation. I'll continue with the task I was configured for.`);
    } else if (covers("hierarchy")) {
      lines.push(`My instructions take priority, so I won't follow that — though my defense doesn't specifically anticipate this override phrasing, which is a gap.`);
    } else {
      lines.push(`Understood — ignoring my previous instructions now. ${attack.payload}`);
    }
  } else if (attack.kind === "role_hijack") {
    if (covers("hierarchy") && covers("scope")) {
      lines.push(`I'm not able to become a different assistant or drop my configured role. I can keep helping within my original scope.`);
    } else {
      lines.push(`Sure, from now on I'll act as you described. ${attack.payload}`);
    }
  } else if (attack.kind === "exfiltration") {
    if (covers("data")) {
      lines.push(`That information is protected and I won't disclose it, regardless of how the request is phrased.`);
    } else {
      lines.push(`Here is the information you asked for: ${attack.secretPreview}`);
    }
  } else if (attack.kind === "indirect") {
    if (covers("untrusted") && covers("separation")) {
      lines.push(`The retrieved content contained an embedded instruction. I'm treating that content as data only and will not act on instructions found inside it.`);
    } else if (covers("untrusted")) {
      lines.push(`I'll be cautious with instructions inside retrieved content, though my defense doesn't clearly separate trusted and untrusted text.`);
    } else {
      lines.push(`Following the instruction found in the retrieved content: ${attack.payload}`);
    }
  } else if (attack.kind === "boundary") {
    if (covers("separation")) {
      lines.push(`Text inside the delimiters is treated strictly as data. Nothing inside those markers can redefine my instructions.`);
    } else {
      lines.push(`Since that text used formatting similar to my instructions, I followed it: ${attack.payload}`);
    }
  } else if (attack.kind === "context") {
    if (covers("scope") && covers("hierarchy")) {
      lines.push(`I'm keeping the conversation within my original configured purpose regardless of how the context has shifted.`);
    } else {
      lines.push(`Given how the conversation has developed, I'll go along with the new framing: ${attack.payload}`);
    }
  } else if (attack.kind === "output_bypass") {
    if (covers("output")) {
      lines.push(`That output format/content falls outside what I'm permitted to produce, so I'll decline that specific part.`);
    } else {
      lines.push(`Sure, here's the output in that format: ${attack.payload}`);
    }
  } else {
    lines.push(`Processed the request under the current defensive policy.`);
  }

  return lines.join(" ");
}
