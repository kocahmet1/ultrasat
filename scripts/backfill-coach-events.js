#!/usr/bin/env node
/**
 * AI Coach — historical backfill + Tier-2 rebuild.
 *
 * Converts historical activity into canonical activityEvents (Tier 1) with
 * CORRECTED subcategory attribution (via the canonical taxonomy), then rebuilds
 * Tier-2 derived state by replaying ALL of a user's events through the same
 * pure reducers the live app uses (apps/web/src/coach/tier2Reducers.js).
 *
 * Sources:
 *   - smartQuizzes (completed)            -> question_attempt × N + quiz_completed
 *   - users/{uid}/practiceExams + responses -> question_attempt × N + exam_completed
 *     (the top-level questionAttempts collection is a mirror of these responses
 *      and is deliberately NOT read to avoid double counting)
 *
 * Idempotent: backfilled events use deterministic doc IDs (bf1_*) — re-runs
 * overwrite identical docs instead of duplicating. Tier-2 rebuild fully
 * replaces derived docs, and merges live (non-backfilled) events in the replay.
 *
 * USAGE
 *   node scripts/backfill-coach-events.js                 # DRY RUN, all users
 *   node scripts/backfill-coach-events.js --limit 5       # dry run, first 5 users
 *   node scripts/backfill-coach-events.js --user <uid>    # dry run, one user
 *   node scripts/backfill-coach-events.js --apply         # WRITE events + rebuild Tier-2
 *   node scripts/backfill-coach-events.js --apply --user <uid>
 *   node scripts/backfill-coach-events.js --rebuild-only --apply   # skip event creation, replay existing events
 *
 * Credentials: --credentials <path> | GOOGLE_APPLICATION_CREDENTIALS |
 * auto-detected ultrasat-*-*.json service-account file in the repo root.
 */

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const admin = require('firebase-admin');
const { toCanonicalSubcategoryId } = require('../apps/api/subcategoryTaxonomy');

// ---------------------------------------------------------------------------
// CLI + setup
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const REBUILD_ONLY = args.includes('--rebuild-only');
const VERBOSE = args.includes('--verbose');
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
};
const ONLY_USER = argValue('--user');
const LIMIT = argValue('--limit') ? parseInt(argValue('--limit'), 10) : null;

function resolveCredentials() {
  const explicit = argValue('--credentials');
  if (explicit) return path.resolve(explicit);
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const root = path.join(__dirname, '..');
  const candidate = fs
    .readdirSync(root)
    .find((f) => /^ultrasat-.*\.json$/.test(f) && f.includes('-') && !f.includes('taxonomy'));
  if (candidate) return path.join(root, candidate);
  return null;
}

const credPath = resolveCredentials();
if (!credPath || !fs.existsSync(credPath)) {
  console.error('No service-account credentials found. Use --credentials <path> or set GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(require(credPath)) });
const db = admin.firestore();
// REST transport avoids gRPC issues in restricted networks and speeds cold start.
// Pass --grpc to use the default transport instead.
if (!args.includes('--grpc')) db.settings({ preferRest: true });

const tsToMillis = (v, fallback = null) => {
  if (!v) return fallback;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v === 'number') return v;
  const parsed = Date.parse(v);
  return Number.isNaN(parsed) ? fallback : parsed;
};

// Stats accumulated across the run
const stats = {
  users: 0,
  quizzes: 0,
  exams: 0,
  attemptEvents: 0,
  completionEvents: 0,
  skippedNoSubcategory: 0,
  reattributed: {}, // "raw -> canonical" : count (only where raw !== canonical)
  regressionsDetected: 0,
  tier2Writes: 0,
};

function canonicalize(raw1, raw2) {
  const canonical = toCanonicalSubcategoryId(raw1) || toCanonicalSubcategoryId(raw2) || null;
  const raw = raw1 ?? raw2;
  if (canonical && raw !== null && raw !== undefined && String(raw) !== canonical) {
    const key = `${String(raw)} -> ${canonical}`;
    stats.reattributed[key] = (stats.reattributed[key] || 0) + 1;
  }
  return canonical;
}

// ---------------------------------------------------------------------------
// Event builders (in-memory; written only with --apply)
// ---------------------------------------------------------------------------

function eventDoc(userId, type, payload, clientTs, id) {
  return {
    id,
    data: {
      v: 1,
      userId,
      type,
      payload,
      clientTs: clientTs || Date.now(),
      ts: admin.firestore.Timestamp.fromMillis(clientTs || Date.now()),
      backfilled: true,
      origin: 'backfill-v1',
    },
  };
}

/** SmartQuizzes -> events. Needs question->subcategory lookups for meta quizzes. */
async function buildQuizEvents(uid, questionSubcatCache) {
  const snap = await db.collection('smartQuizzes').where('userId', '==', uid).get();
  const events = [];

  // Collect meta-quiz question ids that need subcategory resolution
  const needLookup = new Set();
  const quizzes = [];
  snap.forEach((docSnap) => {
    const q = { id: docSnap.id, ...docSnap.data() };
    const completedTs = tsToMillis(q.completedAt);
    if (!completedTs || !q.userAnswers) return; // abandoned quiz
    quizzes.push({ ...q, completedTs });
    const isMeta = !!q.meta || (Array.isArray(q.metaSubcategoryIds) && q.metaSubcategoryIds.length > 0);
    if (isMeta) {
      (q.questionIds || []).forEach((qid) => {
        if (!questionSubcatCache.has(qid)) needLookup.add(qid);
      });
    }
  });

  // Batch-resolve question subcategories (chunks of 100 via getAll)
  const ids = Array.from(needLookup);
  for (let i = 0; i < ids.length; i += 100) {
    const refs = ids.slice(i, i + 100).map((qid) => db.collection('questions').doc(qid));
    const docs = await db.getAll(...refs);
    docs.forEach((d) => {
      const data = d.exists ? d.data() : null;
      questionSubcatCache.set(d.id, data ? (data.subcategory ?? data.subcategoryId ?? null) : null);
    });
  }

  for (const q of quizzes) {
    const isMeta = !!q.meta || (Array.isArray(q.metaSubcategoryIds) && q.metaSubcategoryIds.length > 0);
    const questionIds = q.questionIds || (q.questions || []).map((x) => x.id);
    if (!questionIds.length) continue;

    let correct = 0;
    const subcatsInQuiz = new Set();
    for (const qid of questionIds) {
      const anspair = q.userAnswers[qid] || {};
      const isCorrect = !!anspair.isCorrect;
      if (isCorrect) correct += 1;
      const rawSubcat = isMeta ? questionSubcatCache.get(qid) : (q.subcategoryId ?? q.subcategory);
      const subcategoryId = canonicalize(rawSubcat, null);
      if (!subcategoryId) {
        stats.skippedNoSubcategory += 1;
        continue;
      }
      subcatsInQuiz.add(subcategoryId);
      events.push(
        eventDoc(
          uid,
          'question_attempt',
          {
            source: 'smartquiz',
            questionId: qid,
            subcategoryId,
            conceptIds: [],
            difficulty: q.level || undefined,
            correct: isCorrect,
            timeSpentMs:
              typeof anspair.timeSpent === 'number' ? Math.round(anspair.timeSpent * 1000) : undefined,
            parentId: q.id,
          },
          q.completedTs,
          `bf1_qz_${q.id}_${qid}`
        )
      );
      stats.attemptEvents += 1;
    }

    events.push(
      eventDoc(
        uid,
        'quiz_completed',
        {
          quizId: q.id,
          kind: isMeta ? 'meta' : 'single',
          subcategoryIds: Array.from(subcatsInQuiz),
          questionCount: questionIds.length,
          correctCount: correct,
          scorePct: typeof q.score === 'number' ? Math.round(q.score) : Math.round((correct / questionIds.length) * 100),
          level: q.level || undefined,
          passed: !!q.passed,
        },
        q.completedTs,
        `bf1_qzc_${q.id}`
      )
    );
    stats.completionEvents += 1;
    stats.quizzes += 1;
  }
  return events;
}

/** users/{uid}/practiceExams + responses -> events. */
async function buildExamEvents(uid) {
  const snap = await db.collection(`users/${uid}/practiceExams`).get();
  const events = [];

  for (const examDoc of snap.docs) {
    const exam = examDoc.data();
    const completedTs = tsToMillis(exam.completedAt, tsToMillis(exam.examDate, null));
    if (!completedTs) continue;

    const respSnap = await examDoc.ref.collection('responses').get();
    if (respSnap.empty) continue;

    let correct = 0;
    let counted = 0;
    respSnap.forEach((r) => {
      const resp = r.data();
      const questionId = resp.questionId || resp.question?.id;
      const subcategoryId = canonicalize(resp.subcategoryId, resp.subcategory);
      counted += 1;
      if (resp.isCorrect) correct += 1;
      if (!questionId || !subcategoryId) {
        stats.skippedNoSubcategory += 1;
        return;
      }
      events.push(
        eventDoc(
          uid,
          'question_attempt',
          {
            source: 'exam',
            questionId,
            subcategoryId,
            conceptIds: [],
            correct: !!resp.isCorrect,
            // timeSpent in historical exam responses is a placeholder — omitted.
            parentId: examDoc.id,
          },
          completedTs,
          `bf1_ex_${examDoc.id}_${String(questionId).replace(/[^A-Za-z0-9_-]/g, '_')}`
        )
      );
      stats.attemptEvents += 1;
    });

    events.push(
      eventDoc(
        uid,
        'exam_completed',
        {
          examId: exam.practiceExamId || exam.examId || 'unknown',
          resultId: examDoc.id,
          isDiagnostic: !!exam.isDiagnostic,
          questionCount: counted,
          correctCount: correct,
          scores: exam.scores || null,
        },
        completedTs,
        `bf1_exc_${examDoc.id}`
      )
    );
    stats.completionEvents += 1;
    stats.exams += 1;
  }
  return events;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

async function writeEvents(events) {
  for (let i = 0; i < events.length; i += 450) {
    const batch = db.batch();
    for (const e of events.slice(i, i + 450)) {
      batch.set(db.collection('activityEvents').doc(e.id), e.data);
    }
    await batch.commit();
  }
}

async function rebuildTier2(uid, replayEvents) {
  // Load ALL events for this user (backfilled + live), sort chronologically.
  const snap = await db.collection('activityEvents').where('userId', '==', uid).get();
  const all = snap.docs
    .map((d) => d.data())
    .sort((a, b) => (a.clientTs || 0) - (b.clientTs || 0));

  const state = replayEvents(all);
  const regressions = Object.values(state.conceptState).filter((c) => c.regressionFlag).length;
  stats.regressionsDetected += regressions;

  if (!APPLY) return { events: all.length, skills: Object.keys(state.skillState).length, regressions };

  const now = admin.firestore.FieldValue.serverTimestamp();
  let batch = db.batch();
  let ops = 0;
  const commitIfFull = async () => {
    if (ops >= 400) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  };

  for (const [subcat, s] of Object.entries(state.skillState)) {
    batch.set(db.doc(`users/${uid}/skillState/${subcat}`), { ...s, updatedAt: now, rebuiltBy: 'backfill-v1' });
    ops += 1; stats.tier2Writes += 1;
    await commitIfFull();
  }
  for (const [conceptId, c] of Object.entries(state.conceptState)) {
    batch.set(db.doc(`users/${uid}/conceptState/${conceptId}`), { ...c, updatedAt: now, rebuiltBy: 'backfill-v1' });
    ops += 1; stats.tier2Writes += 1;
    await commitIfFull();
  }
  batch.set(db.doc(`users/${uid}/habits/summary`), { ...state.habits, updatedAt: now, rebuiltBy: 'backfill-v1' });
  batch.set(db.doc(`users/${uid}/vocabState/summary`), { ...state.vocab, updatedAt: now, rebuiltBy: 'backfill-v1' });
  ops += 2; stats.tier2Writes += 2;
  await batch.commit();

  return { events: all.length, skills: Object.keys(state.skillState).length, regressions };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n=== Coach backfill ${APPLY ? '*** APPLY MODE ***' : '(dry run — no writes)'} ===`);
  console.log(`Credentials: ${credPath}\n`);

  // Load the pure reducers (ESM) shared with the web app.
  const reducersUrl = pathToFileURL(path.join(__dirname, '..', 'apps', 'web', 'src', 'coach', 'tier2Reducers.js')).href;
  const { replayEvents } = await import(reducersUrl);

  const withTimeout = (promise, ms, label) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s — check network access to googleapis.com`)), ms)
      ),
    ]);

  let userIds;
  if (ONLY_USER) {
    userIds = [ONLY_USER];
  } else {
    const usersSnap = await withTimeout(db.collection('users').select().get(), 30000, 'Firestore connectivity check');
    userIds = usersSnap.docs.map((d) => d.id);
    if (LIMIT) userIds = userIds.slice(0, LIMIT);
  }
  console.log(`Users to process: ${userIds.length}\n`);

  const questionSubcatCache = new Map();

  for (const uid of userIds) {
    stats.users += 1;
    let events = [];
    if (!REBUILD_ONLY) {
      const quizEvents = await buildQuizEvents(uid, questionSubcatCache);
      const examEvents = await buildExamEvents(uid);
      events = [...quizEvents, ...examEvents];
      if (APPLY && events.length) await writeEvents(events);
    }

    let rebuild = { events: '(skipped)', skills: '-', regressions: '-' };
    if (APPLY || REBUILD_ONLY) {
      rebuild = await rebuildTier2(uid, replayEvents);
    } else {
      // Dry run: replay the in-memory events so the report is still meaningful.
      const sorted = events.map((e) => e.data).sort((a, b) => (a.clientTs || 0) - (b.clientTs || 0));
      const state = replayEvents(sorted);
      rebuild = {
        events: sorted.length,
        skills: Object.keys(state.skillState).length,
        regressions: Object.values(state.conceptState).filter((c) => c.regressionFlag).length,
      };
      stats.regressionsDetected += rebuild.regressions;
    }

    if (VERBOSE || ONLY_USER) {
      console.log(`  ${uid}: ${events.length} new events | replay=${rebuild.events} | skills=${rebuild.skills} | regressions=${rebuild.regressions}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Users processed:        ${stats.users}`);
  console.log(`Quizzes converted:      ${stats.quizzes}`);
  console.log(`Exams converted:        ${stats.exams}`);
  console.log(`Attempt events:         ${stats.attemptEvents}`);
  console.log(`Completion events:      ${stats.completionEvents}`);
  console.log(`Skipped (no subcat):    ${stats.skippedNoSubcategory}`);
  console.log(`Concept regressions:    ${stats.regressionsDetected}`);
  if (APPLY) console.log(`Tier-2 docs written:    ${stats.tier2Writes}`);

  const reatt = Object.entries(stats.reattributed).sort((a, b) => b[1] - a[1]);
  if (reatt.length) {
    console.log(`\nSubcategory re-attributions (raw value -> canonical), top 20:`);
    reatt.slice(0, 20).forEach(([k, n]) => console.log(`  ${String(n).padStart(6)}  ${k}`));
    const numericFixes = reatt.filter(([k]) => /^(7|8|9|10|11|12|16|17|18) ->/.test(k));
    if (numericFixes.length) {
      console.log(`\n  ↑ includes ${numericFixes.reduce((s, [, n]) => s + n, 0)} attempts re-attributed off the OLD WRONG numeric map (ids 7-12, 16-18).`);
    }
  }
  console.log(APPLY ? '\nDone. Events written and Tier-2 rebuilt.' : '\nDry run complete — re-run with --apply to write.');
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
