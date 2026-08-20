/**
 * AI Coach — the DEEP PASS (two-tier coaching, tier 1 of 2).
 *
 * A slow, high-effort "strategist" run produces a durable STRATEGY document —
 * the playbook the fast, interactive coach (chat / debrief / briefing /
 * micro-lesson) executes between runs: what to prioritize and WHY, and the
 * stance (tone, do/don't) for treating this particular student.
 *
 *   coachStrategy/{uid} = {
 *     current: { headline, assessment, priorities[], stance, pacing, watch[],
 *                generatedAt, effort, model, mode },   // last GOOD strategy
 *     run:     { status: 'running'|'ready'|'failed', mode, responseId?,
 *                startedAt, deadlineAt, reason, error? }
 *   }
 *
 * TRANSPORT — OpenAI Background mode (Responses API, `background: true`):
 * submit returns an id immediately; the multi-minute reasoning happens on
 * OpenAI's side; we poll GET /v1/responses/{id} on a timer. No HTTP request
 * of ours ever spans the run, so platform request timeouts are irrelevant.
 * Request shape mirrors the site's existing Responses API callers
 * (questionGenerationService / graphGenerationPlotly): `input` message array,
 * `reasoning: { effort }`, `text.format` JSON mode, `max_output_tokens`.
 *
 * RESILIENCE — every failure degrades, never blocks:
 *   - submit fails / non-OpenAI provider  -> detached foreground FALLBACK run
 *     at COACH_STRATEGY_FALLBACK_EFFORT (default high) via the normal adapter
 *   - poll deadline (15 min) / failed / stuck-queued -> cancel + fallback
 *   - process restart mid-run -> run.deadlineAt is in the past; the next
 *     refresh ping (or any fast call reading directives) restarts/falls back
 *   - a failed run NEVER clobbers `current` — surfaces keep the last good
 *     strategy until a better one lands
 *
 * SAFETY — the strategy is model-generated text that gets injected into other
 * prompts. sanitizeStrategy() clamps every field, whitelists urgency values
 * and canonicalizes subcategory ids; strategyDirectives() appends the
 * standing guardrail that grounding rules always beat the strategy.
 *
 * Efforts: current Luna ladder is none/low/medium/high/xhigh/max (the global
 * config still folds max->high for legacy callers; this module resolves its
 * own effort so the deep pass can genuinely run at max).
 */

const { complete, parseJsonResponse, ROLE_DEFAULTS } = require('./modelAdapter');
const { assembleStudentContext } = require('./contextAssembler');
const { getNotebook } = require('./notebook');
const { outputTokenBudget } = require('../config/aiModel');
const { toCanonicalSubcategoryId, getDisplayName } = require('../subcategoryTaxonomy');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STRATEGY_EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'];

function strategyEffort() {
  const e = (process.env.COACH_STRATEGY_REASONING_EFFORT || 'max').trim().toLowerCase();
  return STRATEGY_EFFORTS.includes(e) ? e : 'max';
}

function fallbackEffort() {
  const e = (process.env.COACH_STRATEGY_FALLBACK_EFFORT || 'high').trim().toLowerCase();
  // The fallback goes through the shared adapter, whose ladder tops at high.
  return ['low', 'medium', 'high'].includes(e) ? e : 'high';
}

const TTL_MS =
  (parseInt(process.env.COACH_STRATEGY_TTL_HOURS || '20', 10) || 20) * 3600 * 1000;
const EXAM_TTL_MS = 3600 * 1000; // an exam is the biggest data change: refresh after 1h
const RUN_DEADLINE_MS = 15 * 60 * 1000;
const POLL_MS = parseInt(process.env.COACH_STRATEGY_POLL_MS || '15000', 10) || 15000;
const MAX_TOKENS = parseInt(process.env.COACH_STRATEGY_MAX_TOKENS || '60000', 10) || 60000;

const docRef = (db, uid) => db.doc(`coachStrategy/${uid}`);
const nowMs = () => Date.now();

// One in-process guard per uid so a double login ping can't double-submit.
// Cross-restart the Firestore run.status/deadlineAt fields are the guard.
const inFlight = new Set();

// ---------------------------------------------------------------------------
// Sanitization (model output -> stored strategy)
// ---------------------------------------------------------------------------

const clamp = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const clampList = (list, count, len) =>
  (Array.isArray(list) ? list : [])
    .map((s) => clamp(s, len))
    .filter(Boolean)
    .slice(0, count);

const URGENCIES = ['now', 'this-week', 'monitor'];

/** Clamp + whitelist a model-emitted strategy. Returns null when unusable. */
function sanitizeStrategy(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const headline = clamp(raw.headline, 160);
  const assessment = clamp(raw.assessment, 1100);
  const priorities = (Array.isArray(raw.priorities) ? raw.priorities : [])
    .slice(0, 5)
    .map((p) => {
      if (!p || typeof p !== 'object') return null;
      const title = clamp(p.title, 70);
      if (!title) return null;
      const subcategoryId = toCanonicalSubcategoryId(p.subcategoryId) || null;
      return {
        title,
        why: clamp(p.why, 260),
        subcategoryId,
        subcategoryName: subcategoryId ? getDisplayName(subcategoryId) || subcategoryId : null,
        conceptId: clamp(p.conceptId, 80) || null,
        urgency: URGENCIES.includes(p.urgency) ? p.urgency : 'this-week',
      };
    })
    .filter(Boolean);
  const stanceRaw = raw.stance && typeof raw.stance === 'object' ? raw.stance : {};
  const stance = {
    tone: clamp(stanceRaw.tone, 260),
    do: clampList(stanceRaw.do, 4, 130),
    dont: clampList(stanceRaw.dont, 4, 130),
  };

  // A strategy with neither a thesis nor priorities teaches the fast coach
  // nothing — treat as failed rather than storing an empty shell.
  if (!headline && !assessment && priorities.length === 0) return null;

  return {
    headline,
    assessment,
    priorities,
    stance,
    pacing: clamp(raw.pacing, 320),
    watch: clampList(raw.watch, 3, 170),
  };
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const STRATEGIST_INSTRUCTIONS = `You are the STRATEGIST behind an SAT student's AI coach — the deep, slow pass that writes the playbook a faster interactive coach executes between your runs.

Everything below is this student's real, grounded record. Think hard about root causes, ordering, and how this particular student should be handled — then produce a compact strategy the fast coach can follow verbatim.

Rules:
- Every claim must trace to the record. Never invent history, scores, or dates.
- Entries marked "COMPLETED BUT OVERLOOKED" are excluded from analysis — acknowledge at most, never treat as evidence.
- The student can read this document. Be specific and direct; never clinical or insulting.
- "stance" entries are standing instructions to the fast coach about HOW to coach (tone, emphasis, what to avoid) — imperatives, not facts.
- Update the PREVIOUS STRATEGY rather than starting from zero: keep what held, change what the new data contradicts, and say so in the assessment when a priority changed.

Output a single valid JSON object, nothing else:
{
  "headline": "one line (<=140 chars): the thesis of where this student stands",
  "assessment": "the deep read (<=900 chars): trajectory, what is blocking the score, root causes, citing concrete evidence",
  "priorities": [up to 5, ordered by value, {"title":"<=60","why":"<=240, cite evidence","subcategoryId":"<canonical kebab id, omit if none>","conceptId":"<concept id, omit if none>","urgency":"now"|"this-week"|"monitor"}],
  "stance": {"tone":"<=240 — how to speak to this student","do":[up to 4 short imperatives],"dont":[up to 4 short imperatives]},
  "pacing": "<=300 — the plan against the exam date (or against the date not being set)",
  "watch": [up to 3 hypotheses the fast coach should verify when the chance arises, each <=160]
}`;

function buildStrategyInput({ contextText, notebookText, commitments, previous }) {
  return (
    `TODAY: ${new Date().toISOString().slice(0, 10)}\n\n` +
    `NOTEBOOK (the coach's running memory of this student):\n${notebookText}\n\n` +
    `CURRENT COMMITMENTS:\n${JSON.stringify(commitments || [])}\n\n` +
    `PREVIOUS STRATEGY (update it, don't restart):\n${
      previous ? JSON.stringify(previous) : '(none yet — this is the first deep pass)'
    }\n\n` +
    `STUDENT CONTEXT (current, authoritative):\n${contextText}`
  );
}

// ---------------------------------------------------------------------------
// Directives (strategy -> prompt block for the fast tier)
// ---------------------------------------------------------------------------

/**
 * Render the stored strategy as a compact prompt block for fast-tier calls.
 * Ends with the guardrail: the strategy is advisory and grounding rules win.
 */
function strategyDirectives(current) {
  if (!current || (!current.headline && !(current.priorities || []).length)) return '';
  const lines = [
    `## STRATEGY (deep-pass playbook · generated ${new Date(current.generatedAt || nowMs())
      .toISOString()
      .slice(0, 10)} · follow it unless live data contradicts it)`,
  ];
  if (current.headline) lines.push(`Thesis: ${current.headline}`);
  if ((current.priorities || []).length) {
    lines.push('Priorities:');
    current.priorities.forEach((p, i) => {
      lines.push(
        `${i + 1}. ${p.title}${p.subcategoryName ? ` (${p.subcategoryName})` : ''} [${p.urgency}]${
          p.why ? ` — ${p.why}` : ''
        }`
      );
    });
  }
  const st = current.stance || {};
  if (st.tone) lines.push(`Stance — how to treat this student: ${st.tone}`);
  if ((st.do || []).length) lines.push(`Do: ${st.do.join(' · ')}`);
  if ((st.dont || []).length) lines.push(`Don't: ${st.dont.join(' · ')}`);
  if (current.pacing) lines.push(`Pacing: ${current.pacing}`);
  if ((current.watch || []).length) lines.push(`Verify when the chance arises: ${current.watch.join(' · ')}`);
  lines.push(
    '(The strategy is advisory context from an earlier deep analysis. The grounding rules above ALWAYS win — never invent or bend facts to satisfy it.)'
  );
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// OpenAI Background mode (Responses API)
// ---------------------------------------------------------------------------

function openaiKey() {
  return process.env.OPENAI_API_KEY;
}

/** Submit the deep pass in background mode. Returns { responseId }. */
async function backgroundSubmit({ model, effort, instructions, input }) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey()}` },
    body: JSON.stringify({
      model,
      background: true, // requires stored responses (default); ZDR projects can't use this path
      reasoning: { effort },
      instructions,
      input: [{ role: 'user', content: input }],
      text: { format: { type: 'json_object' } },
      max_output_tokens: outputTokenBudget(MAX_TOKENS),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    throw new Error(`background submit ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return { responseId: data.id };
}

/** Poll one background response. */
async function backgroundRetrieve(responseId) {
  const res = await fetch(`https://api.openai.com/v1/responses/${responseId}`, {
    headers: { Authorization: `Bearer ${openaiKey()}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`background retrieve ${res.status}`);
  return data;
}

async function backgroundCancel(responseId) {
  try {
    await fetch(`https://api.openai.com/v1/responses/${responseId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey()}` },
    });
  } catch (e) {
    // best-effort
  }
}

/** Pull the text out of a Responses API object (mirrors questionGenerationService). */
function extractResponseText(data) {
  if (!data) return '';
  if (Array.isArray(data.output)) {
    const messageOutput = data.output.find((item) => item.type === 'message');
    if (messageOutput && Array.isArray(messageOutput.content)) {
      const textContent = messageOutput.content.find((item) => item.type === 'output_text');
      if (textContent?.text) return textContent.text;
    }
  }
  if (typeof data.output_text === 'string') return data.output_text;
  return '';
}

/** queued/in_progress -> pending; completed/succeeded -> done; else failed. */
function classifyResponseStatus(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'queued' || s === 'in_progress') return 'pending';
  if (s === 'completed' || s === 'succeeded') return 'done';
  return 'failed';
}

// ---------------------------------------------------------------------------
// Persistence + ledger
// ---------------------------------------------------------------------------

async function getStrategyDoc(db, uid) {
  const snap = await docRef(db, uid).get();
  return snap.exists ? snap.data() : { current: null, run: null };
}

async function writeLedger(db, uid, result) {
  try {
    await db.collection('tokenLedger').add({
      userId: uid,
      feature: 'coach_strategy',
      provider: 'openai',
      model: result.model || null,
      inputTokens: result.usage?.inputTokens || 0,
      outputTokens: result.usage?.outputTokens || 0,
      at: new Date(),
    });
  } catch (e) {
    console.error('[coach/strategy] ledger write failed:', e.message);
  }
}

async function finalizeStrategy(db, uid, rawText, meta) {
  const parsed = parseJsonResponse(rawText);
  const clean = sanitizeStrategy(parsed);
  if (!clean) {
    await docRef(db, uid).set(
      { run: { status: 'failed', mode: meta.mode, error: 'unparseable-strategy', completedAt: nowMs() } },
      { merge: true }
    );
    console.error(`[coach/strategy] ${uid}: run produced no usable strategy (${meta.mode})`);
    return null;
  }
  const current = {
    ...clean,
    generatedAt: nowMs(),
    effort: meta.effort,
    model: meta.model || null,
    mode: meta.mode,
  };
  await docRef(db, uid).set(
    { current, run: { status: 'ready', mode: meta.mode, completedAt: nowMs() } },
    { merge: true }
  );
  console.log(`[coach/strategy] ${uid}: strategy updated (${meta.mode} · effort ${meta.effort})`);
  return current;
}

// ---------------------------------------------------------------------------
// Fallback (foreground, detached) — the normal adapter at a saner effort
// ---------------------------------------------------------------------------

async function runFallbackStrategy(db, uid, promptParts) {
  const effort = fallbackEffort();
  try {
    const result = await complete('primary', {
      effort,
      system: STRATEGIST_INSTRUCTIONS,
      messages: [{ role: 'user', content: buildStrategyInput(promptParts) }],
      json: true,
      maxTokens: 30000,
    });
    await writeLedger(db, uid, result);
    await finalizeStrategy(db, uid, result.text, { mode: 'fallback', effort, model: result.model });
  } catch (e) {
    console.error(`[coach/strategy] ${uid}: fallback run failed:`, e.message);
    await docRef(db, uid)
      .set({ run: { status: 'failed', mode: 'fallback', error: clamp(e.message, 200), completedAt: nowMs() } }, { merge: true })
      .catch(() => {});
  } finally {
    inFlight.delete(uid);
  }
}

// ---------------------------------------------------------------------------
// Poll loop (in-process; restart-safe via run.deadlineAt in Firestore)
// ---------------------------------------------------------------------------

function schedulePoll(db, uid, responseId, deadlineAt, promptParts, effort) {
  const tick = async () => {
    try {
      const data = await backgroundRetrieve(responseId);
      const cls = classifyResponseStatus(data.status);
      if (cls === 'pending') {
        if (nowMs() > deadlineAt) {
          // Stuck in the queue past our patience — cancel and do it ourselves.
          console.warn(`[coach/strategy] ${uid}: background run ${responseId} exceeded deadline — falling back`);
          await backgroundCancel(responseId);
          runFallbackStrategy(db, uid, promptParts);
          return;
        }
        setTimeout(tick, POLL_MS);
        return;
      }
      if (cls === 'done') {
        await writeLedger(db, uid, {
          model: data.model,
          usage: {
            inputTokens: data.usage?.input_tokens || 0,
            outputTokens: data.usage?.output_tokens || 0,
          },
        });
        await finalizeStrategy(db, uid, extractResponseText(data), {
          mode: 'background',
          effort,
          model: data.model || null,
        });
        inFlight.delete(uid);
        return;
      }
      // failed / cancelled / incomplete
      console.warn(`[coach/strategy] ${uid}: background run ended '${data.status}' — falling back`);
      runFallbackStrategy(db, uid, promptParts);
    } catch (e) {
      if (nowMs() > deadlineAt) {
        console.error(`[coach/strategy] ${uid}: polling failed past deadline:`, e.message);
        runFallbackStrategy(db, uid, promptParts);
        return;
      }
      setTimeout(tick, POLL_MS * 2); // transient retrieve error — back off once
    }
  };
  setTimeout(tick, POLL_MS);
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

/**
 * Maybe start a deep pass. Cheap when fresh (one doc read). Returns
 * { status: 'fresh'|'already-running'|'no-data'|'quota'|'started', mode? }.
 *
 * @param {*} db  @param {string} uid
 * @param {{ reason?: 'session'|'exam'|'manual', force?: boolean,
 *           quotaCheck?: () => Promise<boolean> }} opts
 */
async function maybeStartStrategyRun(db, uid, opts = {}) {
  const { reason = 'session', force = false, quotaCheck } = opts;
  if (inFlight.has(uid)) return { status: 'already-running' };

  const doc = await getStrategyDoc(db, uid);
  const run = doc.run || {};
  if (run.status === 'running' && run.deadlineAt && nowMs() < run.deadlineAt) {
    return { status: 'already-running' };
  }

  const ttl = force ? 0 : reason === 'exam' ? EXAM_TTL_MS : TTL_MS;
  const age = doc.current?.generatedAt ? nowMs() - doc.current.generatedAt : Infinity;
  if (age < ttl) return { status: 'fresh' };

  // Only now do the expensive reads.
  const [{ contextText, data }, notebook] = await Promise.all([
    assembleStudentContext(db, uid, {}),
    getNotebook(db, uid),
  ]);
  const hasData = (data.skillStates || []).length > 0 || (data.examHistory || []).length > 0;
  if (!hasData) return { status: 'no-data' };

  if (quotaCheck && !(await quotaCheck())) return { status: 'quota' };

  const promptParts = {
    contextText,
    notebookText: notebook.text,
    commitments: notebook.meta.commitments || [],
    previous: doc.current
      ? {
          headline: doc.current.headline,
          assessment: doc.current.assessment,
          priorities: doc.current.priorities,
          stance: doc.current.stance,
          pacing: doc.current.pacing,
          watch: doc.current.watch,
        }
      : null,
  };

  inFlight.add(uid);
  const effort = strategyEffort();
  const cfg = ROLE_DEFAULTS.primary;
  const deadlineAt = nowMs() + RUN_DEADLINE_MS;

  // Background mode is OpenAI-only; any other provider (or a submit failure)
  // degrades to the detached foreground fallback.
  if (cfg.provider === 'openai' && openaiKey()) {
    try {
      const { responseId } = await backgroundSubmit({
        model: cfg.model,
        effort,
        instructions: STRATEGIST_INSTRUCTIONS,
        input: buildStrategyInput(promptParts),
      });
      await docRef(db, uid).set(
        { run: { status: 'running', mode: 'background', responseId, reason, effort, startedAt: nowMs(), deadlineAt } },
        { merge: true }
      );
      schedulePoll(db, uid, responseId, deadlineAt, promptParts, effort);
      return { status: 'started', mode: 'background' };
    } catch (e) {
      console.warn(`[coach/strategy] ${uid}: background submit failed (${e.message}) — using fallback`);
    }
  }

  await docRef(db, uid).set(
    { run: { status: 'running', mode: 'fallback', reason, effort: fallbackEffort(), startedAt: nowMs(), deadlineAt } },
    { merge: true }
  );
  runFallbackStrategy(db, uid, promptParts); // detached on purpose
  return { status: 'started', mode: 'fallback' };
}

/**
 * Directives for a fast-tier call. One doc read; opportunistically restarts a
 * run whose deadline passed while the process was down (detached, no await).
 */
async function getStrategyDirectives(db, uid) {
  try {
    const doc = await getStrategyDoc(db, uid);
    const run = doc.run || {};
    if (run.status === 'running' && run.deadlineAt && nowMs() > run.deadlineAt && !inFlight.has(uid)) {
      maybeStartStrategyRun(db, uid, { reason: 'manual', force: true }).catch(() => {});
    }
    return strategyDirectives(doc.current);
  } catch (e) {
    return ''; // strategy is an enhancement — never break a fast call
  }
}

module.exports = {
  maybeStartStrategyRun,
  getStrategyDoc,
  getStrategyDirectives,
  strategyDirectives,
  sanitizeStrategy,
  extractResponseText,
  classifyResponseStatus,
  buildStrategyInput,
  STRATEGIST_INSTRUCTIONS,
};
