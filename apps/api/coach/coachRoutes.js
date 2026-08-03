/**
 * AI Coach — API routes (Phase 1, v1).
 *
 *   GET  /api/coach/status          -> { available }
 *   POST /api/coach/debrief         -> { note }        (post-quiz "Coach's read"; idempotent per quiz)
 *   POST /api/coach/chat            -> { message }     (one thread per student, surface-aware)
 *   GET  /api/coach/thread          -> { messages }    (recent conversation)
 *
 * Design rules enforced here:
 *  - Grounded: the model sees ONLY assembled real data; prompt forbids invention.
 *  - Every reply may carry ACTIONS the client renders as one-tap buttons.
 *    Actions are validated server-side (quiz targets must be canonical
 *    subcategories; links must be allow-listed routes). The coach never
 *    navigates or starts anything by itself.
 *  - One conversation store: coachThreads/{uid}/messages (server-only access).
 *  - Cost: per-user daily call quota + every call written to tokenLedger.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const { complete, isConfigured, parseJsonResponse } = require('./modelAdapter');
const { assembleStudentContext } = require('./contextAssembler');
const { getNotebook, saveNotebook, NOTEBOOK_CONTRACT } = require('./notebook');
const { runObserver } = require('./observer');
const { toCanonicalSubcategoryId, getDisplayName } = require('../subcategoryTaxonomy');

const router = express.Router();
router.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const verifyAuth = requireAuth();

// Per-feature daily caps by membership tier (freemium shape, design §7).
// Free users get a real taste; Plus/Max get the always-on coach.
const TIER_LIMITS = {
  free: { chat: 3, debrief: 5, micro_lesson: 1, observe: 2 },
  plus: { chat: 60, debrief: 40, micro_lesson: 12, observe: 10 },
  max: { chat: 100, debrief: 60, micro_lesson: 20, observe: 15 },
};

// Reasoning effort per coach feature.
//
// The coach defaults to `low` (see modelAdapter) because it is an interactive
// chat surface and OpenAI names `low` as the right tier for chat-assistant
// workloads. The analytical features are not latency-critical in the same way —
// the student has just finished a quiz and expects a considered read — so they
// think harder. Every value is env-overridable without a code change.
const FEATURE_EFFORT = {
  // Student is typing and waiting: fastest tier.
  chat: process.env.COACH_CHAT_REASONING_EFFORT || 'low',
  // Post-quiz "Coach's read": analysis over real performance data.
  debrief: process.env.COACH_DEBRIEF_REASONING_EFFORT || 'medium',
  // Teaching content: worth the extra deliberation.
  micro_lesson: process.env.COACH_MICRO_LESSON_REASONING_EFFORT || 'medium',
  // Background observer + notebook maintenance: nobody is waiting on it.
  observe: process.env.COACH_OBSERVE_REASONING_EFFORT || 'medium',
};

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

const COACH_SYSTEM_PROMPT = `You are the student's SAT coach inside the UltraSAT app. Working name: "Coach".

VOICE: warm, direct, specific — a tutor who knows this student, not a cheerleader. Second person. Plain sentences. 2-4 sentences unless the student asks for depth. At most ONE suggestion per reply.

GROUNDING (absolute):
- You may reference ONLY facts present in the STUDENT CONTEXT below. Never invent scores, dates, streaks, or history.
- When you make a claim about the student, tie it to the data ("your last 10 Boundaries questions are at 40%").
- If the context lacks what you need, say so plainly and ask or suggest a way to find out (e.g. a short quiz).
- If there is a Concept alert (especially a REGRESSION), it is usually the most valuable thing to address.

OUTPUT: respond with a single JSON object:
{
  "message": "your reply text",
  "actions": [ up to 2 of:
    { "type": "quiz", "subcategoryId": "<canonical-kebab-id>", "level": 1|2|3 (optional), "label": "short button text" },
    { "type": "link", "route": "<one of the allow-listed routes you were given>", "label": "short button text" }
  ]
}
Actions are optional — include them only when they follow naturally from your message. The "quiz" action creates a 5-question practice quiz in that subcategory.`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const dayKey = () => new Date().toISOString().slice(0, 10);

/** Tier + feature aware daily quota. Counters live in coachUsage/{uid}. */
async function checkAndBumpQuota(db, uid, feature) {
  let tier = 'free';
  try {
    const userSnap = await db.doc(`users/${uid}`).get();
    const t = userSnap.exists ? userSnap.data().membershipTier : null;
    if (t === 'plus' || t === 'max') tier = t;
  } catch (e) {
    // default to free on read failure
  }
  const limit = (TIER_LIMITS[tier] || TIER_LIMITS.free)[feature] ?? 0;

  const ref = db.doc(`coachUsage/${uid}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};
    const today = dayKey();
    const counts = data.day === today ? data.counts || {} : {};
    const used = counts[feature] || 0;
    if (used >= limit) return false;
    tx.set(
      ref,
      { day: today, counts: { ...counts, [feature]: used + 1 }, tier, updatedAt: new Date() },
      { merge: true }
    );
    return true;
  });
}

async function writeLedger(db, uid, kind, result) {
  try {
    await db.collection('tokenLedger').add({
      userId: uid,
      feature: `coach_${kind}`,
      provider: result.provider,
      model: result.model,
      inputTokens: result.usage?.inputTokens || 0,
      outputTokens: result.usage?.outputTokens || 0,
      at: new Date(),
    });
  } catch (e) {
    console.error('[coach] ledger write failed:', e.message);
  }
}

/** Validate/normalize model-proposed actions. Invalid ones are dropped. */
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

async function appendToThread(db, uid, entries) {
  const batch = db.batch();
  const col = db.collection(`coachThreads/${uid}/messages`);
  for (const e of entries) {
    batch.set(col.doc(), { ...e, at: new Date() });
  }
  await batch.commit();
}

function requireDb(req, res) {
  if (!req.db) {
    res.status(503).json({ error: 'Firestore unavailable' });
    return null;
  }
  return req.db;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.get('/status', (req, res) => {
  res.json({ available: isConfigured('primary'), limits: TIER_LIMITS });
});

/** GET /notebook — transparency: what the coach knows about you. */
router.get('/notebook', verifyAuth, async (req, res) => {
  const db = requireDb(req, res);
  if (!db) return;
  try {
    const nb = await getNotebook(db, req.userId);
    res.json({ text: nb.text, exists: nb.exists });
  } catch (error) {
    console.error('[coach/notebook] failed:', error);
    res.status(500).json({ error: 'Failed to load notebook' });
  }
});

/**
 * POST /debrief { quizId }
 * Generates (once) the "Coach's read" for a completed SmartQuiz.
 */
router.post('/debrief', verifyAuth, async (req, res) => {
  const db = requireDb(req, res);
  if (!db) return;
  const uid = req.userId;
  const { quizId } = req.body || {};
  if (!quizId) return res.status(400).json({ error: 'quizId required' });

  try {
    // Idempotent: return the existing note for this quiz if present.
    const existing = await db
      .collection(`coachNotes/${uid}/notes`)
      .where('quizId', '==', quizId)
      .limit(1)
      .get();
    if (!existing.empty) {
      return res.json({ note: { id: existing.docs[0].id, ...existing.docs[0].data() }, cached: true });
    }

    if (!(await checkAndBumpQuota(db, uid, 'debrief'))) {
      return res.status(429).json({ error: 'Daily coach quota reached' });
    }

    const [{ contextText, data }, notebook] = await Promise.all([
      assembleStudentContext(db, uid, { quizId }),
      getNotebook(db, uid),
    ]);
    if (!data.quizDetail) return res.status(404).json({ error: 'Quiz not found for this user' });

    const result = await complete('primary', {
      effort: FEATURE_EFFORT.debrief,
      system:
        COACH_SYSTEM_PROMPT +
        `\n\nAllow-listed link routes: ${ALLOWED_LINK_ROUTES.join(', ')}` +
        `\n\n${NOTEBOOK_CONTRACT}`,
      messages: [
        {
          role: 'user',
          content:
            `NOTEBOOK (your memory of this student):\n${notebook.text}\n\n` +
            `STUDENT CONTEXT:\n${contextText}\n\n` +
            `TASK: The student just finished the quiz described in "The quiz that just finished". Write the Coach's read: what the result means given their history — use the notebook to recall past struggles/recoveries and call out patterns ("you had this fixed in early July") — and what to do next. 2-4 sentences. Include at most 2 actions (a "lesson" action is ideal when a specific concept keeps missing). ALSO return the full updated notebook (fold in this quiz; dated observation lines; prune stale ones).\n` +
            `Output JSON: { "message": "...", "actions": [...], "notebook": "<full updated notebook markdown>" }`,
        },
      ],
      json: true,
      maxTokens: 2200,
    });
    await writeLedger(db, uid, 'debrief', result);

    const parsed = parseJsonResponse(result.text) || { message: result.text?.slice(0, 600) || '', actions: [] };
    if (typeof parsed.notebook === 'string' && parsed.notebook.trim()) {
      await saveNotebook(db, uid, { text: parsed.notebook, meta: { lastObserveAt: Date.now() } }).catch((e) =>
        console.error('[coach/debrief] notebook save failed:', e.message)
      );
    }
    const note = {
      kind: 'debrief',
      surfaceHint: 'smart-quiz-results',
      quizId,
      message: String(parsed.message || '').slice(0, 1200),
      actions: sanitizeActions(parsed.actions),
      createdAt: new Date(),
      read: false,
    };
    const ref = await db.collection(`coachNotes/${uid}/notes`).add(note);
    await appendToThread(db, uid, [
      { role: 'assistant', surface: 'smart-quiz-results', quizId, content: note.message, actions: note.actions },
    ]);

    res.json({ note: { id: ref.id, ...note } });
  } catch (error) {
    console.error('[coach/debrief] failed:', error);
    res.status(500).json({ error: 'Failed to generate debrief' });
  }
});

/**
 * POST /chat { message, surface: { route?, quizId? } }
 */
router.post('/chat', verifyAuth, async (req, res) => {
  const db = requireDb(req, res);
  if (!db) return;
  const uid = req.userId;
  const { message, surface = {} } = req.body || {};
  if (!message || typeof message !== 'string' || message.length > 2000) {
    return res.status(400).json({ error: 'message required (max 2000 chars)' });
  }

  try {
    if (!(await checkAndBumpQuota(db, uid, 'chat'))) {
      return res.status(429).json({ error: 'Daily coach quota reached' });
    }

    const [{ contextText }, threadSnap] = await Promise.all([
      assembleStudentContext(db, uid, { quizId: surface.quizId }),
      db.collection(`coachThreads/${uid}/messages`).orderBy('at', 'desc').limit(12).get(),
    ]);
    const history = threadSnap.docs
      .map((d) => d.data())
      .reverse()
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content || '' }))
      .filter((m) => m.content);

    const result = await complete('primary', {
      effort: FEATURE_EFFORT.chat,
      system:
        COACH_SYSTEM_PROMPT +
        `\n\nAllow-listed link routes: ${ALLOWED_LINK_ROUTES.join(', ')}` +
        `\n\nSTUDENT CONTEXT (current, authoritative):\n${contextText}` +
        (surface.route ? `\n\nThe student is currently on: ${surface.route}` : ''),
      messages: [...history, { role: 'user', content: message }],
      json: true,
    });
    await writeLedger(db, uid, 'chat', result);

    const parsed = parseJsonResponse(result.text) || { message: result.text?.slice(0, 600) || '', actions: [] };
    const reply = {
      message: String(parsed.message || '').slice(0, 1200),
      actions: sanitizeActions(parsed.actions),
    };

    await appendToThread(db, uid, [
      { role: 'user', surface: surface.route || null, content: message },
      { role: 'assistant', surface: surface.route || null, content: reply.message, actions: reply.actions },
    ]);

    res.json(reply);
  } catch (error) {
    console.error('[coach/chat] failed:', error);
    res.status(500).json({ error: 'Coach is unavailable right now' });
  }
});

/**
 * POST /observe { trigger: 'session_start'|'exam_completed', refId? }
 * The Observer: mechanical significance rules first (insignificant pings are
 * free and return { note: null }); when significant, ONE model call updates
 * the notebook and may emit a proactive coach note.
 */
router.post('/observe', verifyAuth, async (req, res) => {
  const db = requireDb(req, res);
  if (!db) return;
  const uid = req.userId;
  const { trigger, refId } = req.body || {};
  if (!['session_start', 'exam_completed'].includes(trigger)) {
    return res.status(400).json({ error: 'trigger must be session_start or exam_completed' });
  }

  try {
    const { note, quotaExceeded } = await runObserver(
      db,
      uid,
      trigger,
      refId,
      (result) => writeLedger(db, uid, 'observe', result),
      () => checkAndBumpQuota(db, uid, 'observe')
    );
    if (quotaExceeded) return res.status(429).json({ error: 'Daily coach quota reached' });
    if (!note) return res.json({ note: null });

    const stored = {
      kind: note.kind,
      surfaceHint: note.surfaceHint,
      refId: note.refId,
      message: note.message,
      actions: sanitizeActions(note.actionsRaw),
      reasons: note.reasons,
      createdAt: note.createdAt,
      read: false,
    };
    const ref = await db.collection(`coachNotes/${uid}/notes`).add(stored);
    await appendToThread(db, uid, [
      { role: 'assistant', surface: stored.surfaceHint, content: stored.message, actions: stored.actions },
    ]);
    res.json({ note: { id: ref.id, ...stored } });
  } catch (error) {
    console.error('[coach/observe] failed:', error);
    res.status(500).json({ error: 'Observer failed' });
  }
});

/**
 * POST /micro-lesson { conceptId?, subcategoryId?, context? }
 * A paragraph-length lesson grounded in THIS student's actual misses.
 */
router.post('/micro-lesson', verifyAuth, async (req, res) => {
  const db = requireDb(req, res);
  if (!db) return;
  const uid = req.userId;
  const { conceptId, subcategoryId: rawSubcat } = req.body || {};
  const subcategoryId = toCanonicalSubcategoryId(rawSubcat) || undefined;
  if (!conceptId && !subcategoryId) {
    return res.status(400).json({ error: 'conceptId or subcategoryId required' });
  }

  try {
    if (!(await checkAndBumpQuota(db, uid, 'micro_lesson'))) {
      return res.status(429).json({ error: 'Daily coach quota reached' });
    }

    const [{ contextText }, notebook] = await Promise.all([
      assembleStudentContext(db, uid, {}),
      getNotebook(db, uid),
    ]);

    const target = conceptId
      ? `the concept "${conceptId}"${subcategoryId ? ` (within ${getDisplayName(subcategoryId)})` : ''}`
      : `the skill "${getDisplayName(subcategoryId)}"`;

    const result = await complete('primary', {
      effort: FEATURE_EFFORT.micro_lesson,
      system:
        `You are the student's SAT coach ("Coach") writing a MICRO-LESSON — the "ever-present tutor" moment. Ground every sentence in this student's real situation (context + notebook); never invent history.\n` +
        `Output JSON:\n{\n  "title": "short lesson title",\n  "hook": "1-2 sentences: why THIS student needs THIS now (cite their actual misses/trend)",\n  "explanation": "the core teaching, 1 short paragraph, with a concrete contrast pair or worked example",\n  "check": { "prompt": "one quick check question", "options": ["A ...", "B ..."], "correctIndex": 0 or 1, "feedbackCorrect": "...", "feedbackWrong": "..." },\n  "cta": { "type": "quiz", "subcategoryId": "<kebab>", "level": 1|2|3?, "label": "..." } or null\n}`,
      messages: [
        {
          role: 'user',
          content:
            `NOTEBOOK:\n${notebook.text}\n\nSTUDENT CONTEXT:\n${contextText}\n\n` +
            `TASK: Write the micro-lesson for ${target}. If the data shows a specific error pattern, teach exactly that distinction. Be convincing about why fixing this one thing matters for their score.`,
        },
      ],
      json: true,
      maxTokens: 1400,
    });
    await writeLedger(db, uid, 'micro_lesson', result);

    const parsed = parseJsonResponse(result.text);
    if (!parsed || !parsed.explanation) {
      return res.status(502).json({ error: 'Lesson generation failed' });
    }
    const lesson = {
      title: String(parsed.title || 'Quick lesson').slice(0, 120),
      hook: String(parsed.hook || '').slice(0, 500),
      explanation: String(parsed.explanation || '').slice(0, 2000),
      check:
        parsed.check && Array.isArray(parsed.check.options) && parsed.check.options.length === 2
          ? {
              prompt: String(parsed.check.prompt || '').slice(0, 400),
              options: parsed.check.options.map((o) => String(o).slice(0, 200)),
              correctIndex: parsed.check.correctIndex === 1 ? 1 : 0,
              feedbackCorrect: String(parsed.check.feedbackCorrect || 'Exactly right.').slice(0, 300),
              feedbackWrong: String(parsed.check.feedbackWrong || 'Not quite — look again.').slice(0, 300),
            }
          : null,
      cta: sanitizeActions(parsed.cta ? [parsed.cta] : [])[0] || null,
      conceptId: conceptId || null,
      subcategoryId: subcategoryId || null,
    };

    await appendToThread(db, uid, [
      { role: 'assistant', surface: 'micro-lesson', content: lesson.title, lesson },
    ]);
    res.json({ lesson });
  } catch (error) {
    console.error('[coach/micro-lesson] failed:', error);
    res.status(500).json({ error: 'Failed to generate lesson' });
  }
});

/** GET /thread?limit=30 */
router.get('/thread', verifyAuth, async (req, res) => {
  const db = requireDb(req, res);
  if (!db) return;
  try {
    const lim = Math.min(parseInt(req.query.limit || '30', 10) || 30, 100);
    const snap = await db
      .collection(`coachThreads/${req.userId}/messages`)
      .orderBy('at', 'desc')
      .limit(lim)
      .get();
    const messages = snap.docs
      .map((d) => {
        const m = d.data();
        return {
          id: d.id,
          role: m.role,
          content: m.content,
          actions: m.actions || [],
          lesson: m.lesson || null,
          surface: m.surface || null,
          at: m.at?.toMillis ? m.at.toMillis() : null,
        };
      })
      .reverse();
    res.json({ messages });
  } catch (error) {
    console.error('[coach/thread] failed:', error);
    res.status(500).json({ error: 'Failed to load thread' });
  }
});

module.exports = router;
