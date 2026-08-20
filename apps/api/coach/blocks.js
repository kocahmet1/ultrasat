/**
 * AI Coach — typed note blocks (UI v2).
 *
 * The contract between the coach and the interface grows from
 * `{ message, actions[] }` to a small set of TYPED BLOCKS the surfaces render
 * with the design system (see AI_COACH_UI_V2_SPEC.md). Two hard rules:
 *
 *  1. SANITIZE — blocks come from the model; unknown types are dropped and
 *     every field is whitelisted + clamped, exactly like actions always were.
 *  2. HYDRATE — the model never states a number. For `stat`, `focus` and
 *     `history` blocks it emits *selectors* (which stat, which skill, which
 *     concept); the server fills the values from the same assembled Tier-2
 *     data the prompt was grounded in. The UI getting richer SHRINKS the
 *     hallucination surface.
 *
 * A legacy `{ message, actions }` note wraps into one `verdict` block, so the
 * new UI ships without requiring the new prompts (and vice versa).
 */

const { toCanonicalSubcategoryId, getDisplayName } = require('../subcategoryTaxonomy');

/** The only routes a coach "link" action may point at (see design §4.4). */
const ALLOWED_LINK_ROUTES = [
  '/progress',
  '/practice-exams',
  '/predictive-exam',
  '/subject-quizzes',
  '/lectures',
  '/flashcards',
  '/word-bank',
  '/concept-bank',
  '/all-results',
];

/**
 * Validate/normalize model-proposed actions. Invalid ones are dropped.
 * (Moved here from coachRoutes so the observer and plan-block items share the
 * one validator — behavior unchanged.)
 */
function sanitizeActions(actions) {
  if (!Array.isArray(actions)) return [];
  const out = [];
  for (const a of actions.slice(0, 2)) {
    if (!a || typeof a !== 'object') continue;
    if (a.type === 'quiz') {
      const subcategoryId = toCanonicalSubcategoryId(a.subcategoryId);
      if (!subcategoryId) continue;
      const level = [1, 2, 3].includes(a.level) ? a.level : undefined;
      out.push({
        type: 'quiz',
        subcategoryId,
        level,
        label: String(a.label || `Practice ${getDisplayName(subcategoryId)}`).slice(0, 60),
      });
    } else if (a.type === 'link') {
      if (!ALLOWED_LINK_ROUTES.includes(a.route)) continue;
      out.push({ type: 'link', route: a.route, label: String(a.label || 'Open').slice(0, 60) });
    } else if (a.type === 'lesson') {
      const subcategoryId = toCanonicalSubcategoryId(a.subcategoryId) || undefined;
      const conceptId = typeof a.conceptId === 'string' && a.conceptId.length <= 80 ? a.conceptId : undefined;
      if (!conceptId && !subcategoryId) continue;
      out.push({
        type: 'lesson',
        conceptId,
        subcategoryId,
        label: String(a.label || '60-second lesson').slice(0, 60),
      });
    }
  }
  return out;
}

/** Validate one action (plan-block items carry a single action each). */
const sanitizeOneAction = (a) => sanitizeActions([a])[0] || null;

const MAX_BLOCKS = 6;
const TONES = ['fix', 'steady', 'win', 'exam'];
const PLAN_WHYS = ['regression', 'slipping', 'stale', 'new', 'rehearsal', 'review', 'routine', 'win'];

const clamp = (v, n) => String(v == null ? '' : v).slice(0, n);
const isDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

/**
 * Prompt fragment describing the block palette. Appended to the debrief and
 * observer prompts; chat keeps the legacy shape (its replies live in bubbles).
 */
const BLOCKS_GUIDE = `NOTE BLOCKS — your note is rendered as typed cards, not prose. Along with "message"
(a 1-2 sentence plain-text fallback for legacy surfaces), return "blocks", an array of up to 4 of:

{ "type": "verdict", "text": "...", "tone": "fix"|"steady"|"win"|"exam",
  "evidence": [up to 3 of { "label": "Q2 · this quiz" }] }
  - REQUIRED, first. ≤ 2 sentences (≤ 280 chars). May use **bold** for the one thing that matters.
    tone: "fix" = something to repair, "steady" = normal day, "win" = celebrate, "exam" = exam ≤ 14 days.
    evidence labels cite real items from the context (a question, a quiz date, an exam).

{ "type": "plan", "title": "Today", "items": [up to 3 of
    { "label": "...", "sub": "one grounded reason, ≤ 80 chars", "why": "regression"|"slipping"|"stale"|"new"|"rehearsal"|"review"|"routine",
      "minutes": 5..45, "action": <one action, same schema as top-level actions, or null> } ] }
  - Briefings only. Order by value; a regression fix always ranks first.

{ "type": "stat", "kind": "pace"|"streak", "note": "≤ 90 chars of interpretation" }
  - You write ONLY the interpretation; the server injects the numbers (days to exam,
    latest real exam score, target, streak). Never write numbers in "note".

{ "type": "history", "conceptId": "<a concept id that appears in Concept alerts>" }
  - Debriefs/notes about a repeating concept: renders that concept's missed→recovered→regressed
    timeline. Emit the id only — the server builds the timeline from real state.

Do not invent other block types. A note with zero valid blocks falls back to "message".`;

/**
 * Sanitize model-proposed blocks.
 * Returns a clean array (possibly empty — caller falls back to legacy shape).
 */
function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  const out = [];
  for (const b of blocks.slice(0, MAX_BLOCKS * 2)) {
    if (!b || typeof b !== 'object') continue;
    if (out.length >= MAX_BLOCKS) break;

    if (b.type === 'verdict') {
      const text = clamp(b.text, 400).trim();
      if (!text) continue;
      const evidence = (Array.isArray(b.evidence) ? b.evidence : [])
        .slice(0, 3)
        .map((e) => ({ label: clamp(e && e.label, 60).trim(), ref: clamp(e && e.ref, 80) || null }))
        .filter((e) => e.label);
      out.push({ type: 'verdict', text, tone: TONES.includes(b.tone) ? b.tone : 'steady', evidence });
    } else if (b.type === 'plan') {
      const items = (Array.isArray(b.items) ? b.items : [])
        .slice(0, 3)
        .map((it, i) => {
          if (!it || typeof it !== 'object') return null;
          const label = clamp(it.label, 70).trim();
          if (!label) return null;
          const minutes = Number.isFinite(it.minutes) ? Math.min(60, Math.max(1, Math.round(it.minutes))) : 10;
          return {
            id: `p${i + 1}`,
            label,
            sub: clamp(it.sub, 90).trim(),
            why: PLAN_WHYS.includes(it.why) ? it.why : 'new',
            minutes,
            action: (it.action && sanitizeOneAction(it.action)) || null,
          };
        })
        .filter(Boolean);
      if (!items.length) continue;
      out.push({
        type: 'plan',
        title: clamp(b.title, 44).trim() || 'Today',
        minutes: items.reduce((s, it) => s + it.minutes, 0),
        items,
      });
    } else if (b.type === 'stat') {
      out.push({ type: 'stat', kind: b.kind === 'streak' ? 'streak' : 'pace', note: clamp(b.note, 110).trim() });
    } else if (b.type === 'history') {
      const conceptId = clamp(b.conceptId, 80).trim();
      if (!conceptId) continue;
      out.push({ type: 'history', conceptId });
    } else if (b.type === 'focus') {
      const items = (Array.isArray(b.items) ? b.items : [])
        .slice(0, 4)
        .map((it) => {
          const subcategoryId = toCanonicalSubcategoryId(it && it.subcategoryId);
          if (!subcategoryId) return null;
          return { subcategoryId, reason: PLAN_WHYS.includes(it.reason) ? it.reason : 'new' };
        })
        .filter(Boolean);
      if (items.length) out.push({ type: 'focus', items });
    }
    // Unknown types: dropped silently — forward-compat by construction.
  }
  // Exactly one verdict, and it leads.
  const verdicts = out.filter((b) => b.type === 'verdict');
  const rest = out.filter((b) => b.type !== 'verdict');
  return verdicts.length ? [verdicts[0], ...rest] : rest;
}

/** Millisecond timestamp from a Firestore Timestamp / Date / number / ISO. */
function toMs(v) {
  if (!v) return null;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  const ms = Date.parse(v);
  return Number.isNaN(ms) ? null : ms;
}

const dayStr = (ms) => (ms ? new Date(ms).toISOString().slice(0, 10) : null);

/** Latest full (non-partial) exam total from the authoritative history. */
function latestExamTotal(examHistory) {
  for (const e of examHistory || []) {
    if (e.isPartial) continue;
    const rw = Number.isFinite(e.scores?.readingWriting) ? e.scores.readingWriting : null;
    const math = Number.isFinite(e.scores?.math) ? e.scores.math : null;
    const total = Number.isFinite(e.scores?.total) ? e.scores.total : rw !== null && math !== null ? rw + math : null;
    if (total !== null) return total;
  }
  return null;
}

/**
 * Fill server-owned numbers into sanitized blocks, from the same `data` the
 * context assembler grounded the prompt with. Blocks that cannot be hydrated
 * honestly (unknown concept, no data) are DROPPED, not guessed.
 */
function hydrateBlocks(blocks, data = {}) {
  const { user = {}, habits, skillStates = [], flaggedConcepts = [], examHistory = [] } = data;
  const skillById = new Map(skillStates.map((s) => [s.subcategoryId || s.id, s]));
  const now = Date.now();

  const out = [];
  for (const b of blocks) {
    if (b.type === 'stat') {
      const examMs = user.examDate ? Date.parse(user.examDate) : NaN;
      out.push({
        ...b,
        daysToExam: !Number.isNaN(examMs) && examMs > now ? Math.ceil((examMs - now) / 86400000) : null,
        estimate: latestExamTotal(examHistory),
        target: Number.isFinite(user.targetScore) ? user.targetScore : parseInt(user.targetScore, 10) || null,
        streak: habits ? habits.streakDays || 0 : null,
      });
    } else if (b.type === 'history') {
      const c = flaggedConcepts.find((x) => x.conceptId === b.conceptId || x.id === b.conceptId);
      if (!c) continue; // never render a timeline we can't back with state
      const nodes = [];
      if (c.lastMissedTs && c.recoveredTs && toMs(c.recoveredTs) > toMs(c.lastMissedTs)) {
        // recovered after the last miss — timeline is miss -> recovery
        nodes.push({ date: dayStr(toMs(c.lastMissedTs)), state: 'missed' });
        nodes.push({ date: dayStr(toMs(c.recoveredTs)), state: 'recovered' });
      } else {
        if (c.recoveredTs) nodes.push({ date: dayStr(toMs(c.recoveredTs)), state: 'recovered' });
        if (c.lastMissedTs) nodes.push({ date: dayStr(toMs(c.lastMissedTs)), state: c.regressionFlag ? 'regressed' : 'missed' });
      }
      if (!nodes.length) continue;
      const patterns = Object.entries(c.errorPatterns || {}).sort((a, z) => z[1] - a[1]);
      out.push({
        type: 'history',
        conceptId: b.conceptId,
        label: b.conceptId.replace(/[-_]/g, ' '),
        subcategoryId: c.subcategoryId || null,
        subcategoryName: c.subcategoryId ? getDisplayName(c.subcategoryId) || c.subcategoryId : null,
        errorPattern: patterns.length ? clamp(patterns[0][0], 80) : null,
        missStreak: c.missStreak || 0,
        regression: !!c.regressionFlag,
        nodes,
      });
    } else if (b.type === 'focus') {
      const items = b.items
        .map((it) => {
          const s = skillById.get(it.subcategoryId);
          if (!s) return null;
          return {
            ...it,
            name: getDisplayName(it.subcategoryId) || it.subcategoryId,
            accuracyLast10: s.accuracyLast10 ?? null,
            accuracy: s.accuracy ?? null,
            trend: s.trend || 'insufficient',
            daysIdle: s.lastPracticedTs ? Math.round((now - toMs(s.lastPracticedTs)) / 86400000) : null,
            lastResults: Array.isArray(s.lastResults) ? s.lastResults.slice(-10) : [],
          };
        })
        .filter(Boolean);
      if (items.length) out.push({ ...b, items });
    } else {
      out.push(b);
    }
  }
  return out;
}

/**
 * Commitments — the follow-ups the coach owes the student, kept as STRUCTURED
 * data on the notebook meta (the markdown section stays for the model's own
 * memory; this list is what the UI renders and what "due" logic runs on).
 * The model returns the full current list each time (merge/prune like the
 * notebook itself); we validate and clamp.
 */
function sanitizeCommitments(list) {
  if (!Array.isArray(list)) return null; // null = leave stored list untouched
  return list
    .slice(0, 6)
    .map((c) => {
      if (!c || typeof c !== 'object') return null;
      const label = clamp(c.label, 90).trim();
      if (!label || !isDay(c.dueDate)) return null;
      return { label, dueDate: c.dueDate, source: clamp(c.source, 60).trim() || 'coach' };
    })
    .filter(Boolean);
}

/** Wrap a legacy message-only note as one verdict block (client fallback twin). */
function wrapLegacyBlocks(message) {
  const text = clamp(message, 400).trim();
  return text ? [{ type: 'verdict', text, tone: 'steady', evidence: [] }] : [];
}

module.exports = {
  ALLOWED_LINK_ROUTES,
  BLOCKS_GUIDE,
  sanitizeActions,
  sanitizeOneAction,
  sanitizeBlocks,
  hydrateBlocks,
  sanitizeCommitments,
  wrapLegacyBlocks,
  latestExamTotal,
};
