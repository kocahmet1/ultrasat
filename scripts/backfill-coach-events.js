#!/usr/bin/env node
/**
 * AI Coach — historical backfill + Tier-2 rebuild + LOW-SIGNAL SCRUB (v2).
 *
 * Converts historical activity into canonical activityEvents (Tier 1) with
 * CORRECTED subcategory attribution (via the canonical taxonomy), then rebuilds
 * Tier-2 derived state by replaying ALL of a user's events through the same
 * pure reducers the live app uses (apps/web/src/coach/tier2Reducers.mjs).
 *
 * v2 additionally applies the SIGNAL-QUALITY GATES retroactively
 * (apps/web/src/coach/signalQuality.js — the same rules the live write path
 * now enforces):
 *   - omitted/blank exam answers are never attempts (v1 backfilled them as
 *     WRONG answers — the source of "105 answered · 0%" inflation)
 *   - exam modules that were blank or >half unanswered are OVERLOOKED
 *     (no retro time gate: historical sittings carry no module timing)
 *   - quizzes finished in under a minute are OVERLOOKED
 *   - retro `coachSignal` verdicts are written onto practiceExams/smartQuizzes
 *     docs that don't have one, so every consumer (assembler, HQ trajectory)
 *     sees the same verdict
 *   - stale junk backfilled events are DELETED (admin tooling is the sanctioned
 *     exception to append-only), live junk attempts are excluded at replay
 *   - users/{uid}/progress docs get honest counters rebuilt from the gated
 *     replay (totalQuestions / correctTotal / last10QuestionResults only;
 *     level, askedQuestions and attemptHistory are preserved)
 *
 * Sources:
 *   - smartQuizzes (completed)            -> question_attempt × N + quiz_completed
 *   - users/{uid}/practiceExams + responses -> question_attempt × N + exam_completed
 *     (the top-level questionAttempts collection is a mirror of these responses
 *      and is deliberately NOT read to avoid double counting)
 *
 * Idempotent: backfilled events use deterministic doc IDs (bf1_*) — re-runs
 * overwrite identical docs instead of duplicating, and now-gated ids are
 * removed. Tier-2 rebuild fully replaces derived docs, and merges live
 * (non-backfilled) events in the replay.
 *
 * USAGE
 *   node scripts/backfill-coach-events.js                 # DRY RUN, all users
 *   node scripts/backfill-coach-events.js --limit 5       # dry run, first 5 users
 *   node scripts/backfill-coach-events.js --user <uid>    # dry run, one user
 *   node scripts/backfill-coach-events.js --apply         # WRITE events + verdicts + rebuild Tier-2 + scrub progress
 *   node scripts/backfill-coach-events.js --apply --user <uid>
 *   node scripts/backfill-coach-events.js --rebuild-only --apply   # replay existing events only (no gating of live junk)
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
  // v2 signal scrub
  skippedOmitted: 0, // blank answers that v1 counted as wrong attempts
  overlookedModules: 0,
  overlookedQuizzes: 0,
  overlookedExams: 0,
  retroVerdictsWritten: 0,
  staleEventsDeleted: 0,
  liveJunkExcluded: 0,
  progressDocsScrubbed: 0,
};

/** Was this stored answer a real response? ('' and whitespace = omitted) */
const isRealAnswer = (v) => v !== undefined && v !== null && String(v).trim() !== '';

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

/** SmartQuizzes -> events. Needs question->subcategory lookups for meta quizzes.
    ctx: { sq: signalQuality module, drop: { quiz:Set, exam:Map }, verdictWrites: [] } */
async function buildQuizEvents(uid, questionSubcatCache, ctx) {
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

    // --- Retro signal verdict: live docs carry coachSignal since the gates
    // shipped; older docs get it derived here (summed timeSpent, else
    // startedAt→completedAt wall clock; unknown duration never gates).
    let quizSignal = q.coachSignal || null;
    if (!quizSignal) {
      const summedSec = questionIds.reduce(
        (s, qid) => s + (typeof q.userAnswers[qid]?.timeSpent === 'number' ? q.userAnswers[qid].timeSpent : 0),
        0
      );
      const startedTs = tsToMillis(q.startedAt);
      const durationMs =
        summedSec > 0 ? Math.round(summedSec * 1000) : startedTs ? Math.max(0, q.completedTs - startedTs) : null;
      const verdict = ctx.sq.assessQuizSitting({ durationMs });
      quizSignal = { v: 1, durationMs, lowSignal: verdict.ignored, reasons: verdict.reasons, retro: true };
      if (quizSignal.lowSignal) {
        ctx.verdictWrites.push({ ref: db.collection('smartQuizzes').doc(q.id), coachSignal: quizSignal });
      }
    }
    if (quizSignal.lowSignal) {
      stats.overlookedQuizzes += 1;
      ctx.drop.quiz.add(q.id);
    }

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
      // Low-signal sitting: the completion below records it; the answers are
      // not evidence and emit no attempt events.
      if (quizSignal.lowSignal) continue;
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
          ...(Number.isFinite(quizSignal.durationMs) ? { durationMs: quizSignal.durationMs } : {}),
          ...(quizSignal.lowSignal ? { lowSignal: true, lowSignalReasons: quizSignal.reasons } : {}),
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

/** users/{uid}/practiceExams + responses -> events, with the v2 signal scrub:
 *  - an "omitted" response (flag, or blank/whitespace userAnswer on old docs)
 *    is NOT an attempt — v1 backfilled these as wrong answers;
 *  - modules that were blank or >half unanswered are OVERLOOKED (their real
 *    answers emit no attempt events either — mash-throughs are not evidence);
 *  - a retro coachSignal verdict is queued for docs that lack one, so the
 *    assembler / HQ trajectory see the same call the events encode.
 */
async function buildExamEvents(uid, ctx) {
  const snap = await db.collection(`users/${uid}/practiceExams`).get();
  const events = [];

  for (const examDoc of snap.docs) {
    const exam = examDoc.data();
    const completedTs = tsToMillis(exam.completedAt, tsToMillis(exam.examDate, null));
    if (!completedTs) continue;

    const respSnap = await examDoc.ref.collection('responses').get();
    if (respSnap.empty) continue;
    const responses = respSnap.docs.map((r) => r.data());

    const isOmittedResp = (resp) => resp.omitted === true || !isRealAnswer(resp.userAnswer);

    // --- Per-module retro gates (no time gate: history has no module timing).
    // Responses missing moduleId (very old docs) pool into one pseudo-module.
    const byModule = new Map();
    responses.forEach((resp) => {
      const key = resp.moduleId || '__whole-exam__';
      if (!byModule.has(key)) byModule.set(key, { id: key, questionCount: 0, answeredCount: 0 });
      const m = byModule.get(key);
      m.questionCount += 1;
      if (!isOmittedResp(resp)) m.answeredCount += 1;
    });
    let examSignal = exam.coachSignal || null;
    if (!examSignal) {
      const moduleVerdicts = Array.from(byModule.values()).map((m) => {
        const verdict = ctx.sq.assessExamModule({
          questionCount: m.questionCount,
          answeredCount: m.answeredCount,
          timeSpentMs: null,
        });
        return { ...m, title: null, timeSpentMs: null, ignored: verdict.ignored, reasons: verdict.reasons };
      });
      examSignal = { ...ctx.sq.summarizeExamSignal(moduleVerdicts), retro: true };
      if (examSignal.ignoredModuleCount > 0) {
        ctx.verdictWrites.push({ ref: examDoc.ref, coachSignal: examSignal });
      }
    }
    const ignoredModuleIds = new Set(examSignal.ignoredModuleIds || []);
    stats.overlookedModules += examSignal.ignoredModuleCount || 0;
    if (examSignal.lowSignal) stats.overlookedExams += 1;

    // Live junk exclusion map for the replay: every response the gates drop.
    const droppedQids = new Set();

    let correct = 0;
    let counted = 0;
    responses.forEach((resp) => {
      const questionId = resp.questionId || resp.question?.id;
      const subcategoryId = canonicalize(resp.subcategoryId, resp.subcategory);
      counted += 1;
      if (resp.isCorrect) correct += 1;
      if (!questionId || !subcategoryId) {
        stats.skippedNoSubcategory += 1;
        return;
      }
      if (isOmittedResp(resp)) {
        // Blank answers are omissions, not attempts (v1's inflation bug).
        stats.skippedOmitted += 1;
        droppedQids.add(questionId);
        return;
      }
      if (ignoredModuleIds.has(resp.moduleId || '__whole-exam__')) {
        // Real clicks inside an overlooked module — still not evidence.
        droppedQids.add(questionId);
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
    if (droppedQids.size) ctx.drop.exam.set(examDoc.id, droppedQids);

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
          isPartial: !!exam.isPartial,
          ...(examSignal.lowSignal
            ? { lowSignal: true, lowSignalReasons: examSignal.reasons || [] }
            : {}),
          ...(examSignal.ignoredModuleCount
            ? { ignoredModuleCount: examSignal.ignoredModuleCount, validModuleCount: examSignal.validModuleCount }
            : {}),
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

/** Retro coachSignal verdicts onto source docs (merge; only queued when the
    doc had none, so live-timed verdicts are never overwritten). */
async function writeRetroVerdicts(verdictWrites) {
  for (let i = 0; i < verdictWrites.length; i += 400) {
    const batch = db.batch();
    for (const w of verdictWrites.slice(i, i + 400)) {
      batch.set(w.ref, { coachSignal: w.coachSignal }, { merge: true });
      stats.retroVerdictsWritten += 1;
    }
    await batch.commit();
  }
}

/** Delete previously-backfilled events this run no longer produces (junk the
    v2 gates removed). Admin tooling is the sanctioned append-only exception. */
async function deleteStaleBackfilled(uid, newEventIds) {
  const snap = await db
    .collection('activityEvents')
    .where('userId', '==', uid)
    .where('backfilled', '==', true)
    .get();
  const stale = snap.docs.filter((d) => !newEventIds.has(d.id));
  for (let i = 0; i < stale.length; i += 450) {
    const batch = db.batch();
    stale.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  stats.staleEventsDeleted += stale.length;
  return stale.length;
}

/** Should this stored event feed the replay? Filters live junk attempts using
    the gate verdicts derived in the builders (drop maps). */
function keepForReplay(e, drop) {
  if (!e || e.type !== 'question_attempt') return true;
  const p = e.payload || {};
  if (p.lowSignal === true) return false; // future-proof: flagged at source
  if (!drop) return true;
  if (p.source === 'smartquiz' && drop.quiz.has(p.parentId)) {
    stats.liveJunkExcluded += 1;
    return false;
  }
  if (p.source === 'exam' && drop.exam.has(p.parentId) && drop.exam.get(p.parentId).has(p.questionId)) {
    stats.liveJunkExcluded += 1;
    return false;
  }
  return true;
}

/**
 * Rebuild users/{uid}/progress counters from the SAME gated replay state, so
 * the Progress page's "N answered" agrees with Tier-2 and the coach. Only the
 * aggregate counters are touched; level / askedQuestions / attemptHistory
 * (progression + dedupe + history) are preserved as-is.
 */
async function scrubProgressDocs(uid, skillState) {
  const progSnap = await db.collection(`users/${uid}/progress`).get();
  const existingIds = new Set(progSnap.docs.map((d) => d.id));
  const skillIds = new Set(Object.keys(skillState));
  // Union: skills with clean attempts + existing docs (which get zeroed when
  // every one of their attempts was junk). Non-canonical legacy doc ids are
  // left alone — the page no longer reads them.
  const targets = new Set([...skillIds, ...[...existingIds].filter((id) => toCanonicalSubcategoryId(id) === id)]);

  let batch = db.batch();
  let ops = 0;
  for (const subcat of targets) {
    const s = skillState[subcat];
    batch.set(
      db.doc(`users/${uid}/progress/${subcat}`),
      {
        totalQuestions: s ? s.attempts : 0,
        correctTotal: s ? s.correct : 0,
        last10QuestionResults: s ? (s.lastResults || []).slice(-10).map(Boolean) : [],
        signalScrubbedAt: admin.firestore.FieldValue.serverTimestamp(),
        signalScrubVersion: 2,
      },
      { merge: true }
    );
    ops += 1;
    stats.progressDocsScrubbed += 1;
    if (ops >= 400) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();
}

async function rebuildTier2(uid, replayEvents, drop) {
  // Load ALL events for this user (backfilled + live), gate out junk attempts,
  // sort chronologically.
  const snap = await db.collection('activityEvents').where('userId', '==', uid).get();
  const all = snap.docs
    .map((d) => d.data())
    .filter((e) => keepForReplay(e, drop))
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

  // v2: the Progress page's counters come from the same gated truth.
  await scrubProgressDocs(uid, state.skillState);

  return { events: all.length, skills: Object.keys(state.skillState).length, regressions };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n=== Coach backfill ${APPLY ? '*** APPLY MODE ***' : '(dry run — no writes)'} ===`);
  console.log(`Credentials: ${credPath}\n`);

  // Load the pure reducers + signal gates (ESM) shared with the web app.
  const reducersUrl = pathToFileURL(path.join(__dirname, '..', 'apps', 'web', 'src', 'coach', 'tier2Reducers.mjs')).href;
  const { replayEvents } = await import(reducersUrl);
  const sqUrl = pathToFileURL(path.join(__dirname, '..', 'apps', 'web', 'src', 'coach', 'signalQuality.js')).href;
  const sq = await import(sqUrl);

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
    // Per-user gate context: verdicts derived in the builders drive junk
    // exclusion at replay and retro coachSignal writes on source docs.
    const ctx = { sq, drop: { quiz: new Set(), exam: new Map() }, verdictWrites: [] };
    if (!REBUILD_ONLY) {
      const quizEvents = await buildQuizEvents(uid, questionSubcatCache, ctx);
      const examEvents = await buildExamEvents(uid, ctx);
      events = [...quizEvents, ...examEvents];
      if (APPLY) {
        if (events.length) await writeEvents(events);
        await deleteStaleBackfilled(uid, new Set(events.map((e) => e.id)));
        if (ctx.verdictWrites.length) await writeRetroVerdicts(ctx.verdictWrites);
      }
    }

    let rebuild = { events: '(skipped)', skills: '-', regressions: '-' };
    if (APPLY || REBUILD_ONLY) {
      rebuild = await rebuildTier2(uid, replayEvents, ctx.drop);
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
  console.log('--- signal scrub (v2) ---');
  console.log(`Blank answers dropped:  ${stats.skippedOmitted}  (v1 counted these as wrong attempts)`);
  console.log(`Modules overlooked:     ${stats.overlookedModules}`);
  console.log(`Exams overlooked:       ${stats.overlookedExams}`);
  console.log(`Quizzes overlooked:     ${stats.overlookedQuizzes}`);
  console.log(`Live junk excluded:     ${stats.liveJunkExcluded}  (kept in Tier-1, ignored at replay)`);
  if (APPLY) {
    console.log(`Stale events deleted:   ${stats.staleEventsDeleted}`);
    console.log(`Retro verdicts written: ${stats.retroVerdictsWritten}`);
    console.log(`Progress docs scrubbed: ${stats.progressDocsScrubbed}`);
    console.log(`Tier-2 docs written:    ${stats.tier2Writes}`);
  }

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
