#!/usr/bin/env node
/**
 * Peer statistics (P2-B) — questionStats backfill / rebuild.
 *
 * Rebuilds the top-level questionStats/{questionId} aggregates from scratch by
 * scanning ALL smartQuizzes docs (paginated) and replaying their stored
 * userAnswers through EXACTLY the same rules as the live client write in
 * recordSmartQuizResult (apps/web/src/utils/smartQuizUtils.js):
 *
 *   - one pass per completed quiz (docs holding a userAnswers map);
 *   - an answer counts toward attempts / correct / totalTimeMs when it is
 *     NON-OMITTED: no `omitted: true` flag and selectedOption is not
 *     null / undefined / '' (a real response);
 *   - optionCounts["0".."3"] additionally records the pick for standard
 *     multiple-choice answers (integer selectedOption 0-3). Grid-in answers
 *     store a string selectedOption, so they feed attempts/correct/time but
 *     never the option distribution;
 *   - answer.timeSpent is stored in SECONDS on the quiz doc (SmartQuiz.jsx
 *     ticks a 1s interval); the aggregate stores MILLISECONDS.
 *
 * Because the replay mirrors the live increments one-for-one, a rebuild over
 * the same quizzes reproduces the live-accumulated totals — running it is
 * idempotent and safe to repeat. Retakes of a question count once per
 * completed quiz, same as the live path.
 *
 * Aggregate doc shape (matches the live write):
 *   { attempts, correct, totalTimeMs, optionCounts: { "0".."3": n },
 *     updatedAt, rebuiltBy: 'backfill-question-stats-v2' }
 *
 * Apply mode is a full rebuild: every derived doc is overwritten (set WITHOUT
 * merge, so stale counters never survive) and existing questionStats docs
 * that no longer derive from any quiz are deleted. All writes go out in
 * batches of <= 400 ops.
 *
 * USAGE
 *   node scripts/backfill-question-stats.js                 # DRY RUN (no writes)
 *   node scripts/backfill-question-stats.js --apply         # write, batches of <=400
 *   node scripts/backfill-question-stats.js --verbose       # per-quiz detail
 *   node scripts/backfill-question-stats.js --page-size 300 # scan page size (default 300)
 *
 * Credentials: --credentials <path> | GOOGLE_APPLICATION_CREDENTIALS |
 * auto-detected ultrasat-*-*.json service-account file in the repo root
 * (same convention as scripts/backfill-coach-events.js). The file is only
 * ever referenced by path — its contents are never printed.
 */

const path = require('path');
const fs = require('fs');

const admin = require('firebase-admin');

// ---------------------------------------------------------------------------
// CLI + setup
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const VERBOSE = args.includes('--verbose');
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
};
const PAGE_SIZE = Math.max(50, parseInt(argValue('--page-size'), 10) || 300);

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
// REST transport avoids gRPC issues in restricted networks (same as the
// coach backfill). Pass --grpc to use the default transport instead.
if (!args.includes('--grpc')) db.settings({ preferRest: true });

// ---------------------------------------------------------------------------
// Live-path predicates (keep in lockstep with recordSmartQuizResult)
// ---------------------------------------------------------------------------

/** Non-omitted real response: counts toward attempts / correct / totalTimeMs. */
function isCountableAnswer(answer) {
  if (!answer || answer.omitted === true) return false;
  const selected = answer.selectedOption;
  return selected !== null && selected !== undefined && selected !== '';
}

/** Standard multiple-choice pick: additionally counts in optionCounts. */
function isMultipleChoicePick(selected) {
  return typeof selected === 'number' && Number.isInteger(selected) && selected >= 0 && selected <= 3;
}

/** timeSpent (stored SECONDS) -> whole milliseconds, clamped at 0. */
function timeSpentMs(answer) {
  const seconds = typeof answer.timeSpent === 'number' && Number.isFinite(answer.timeSpent)
    ? Math.max(0, answer.timeSpent)
    : 0;
  return Math.round(seconds * 1000);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n=== questionStats rebuild ${APPLY ? '*** APPLY MODE ***' : '(dry run — no writes)'} ===`);
  console.log(`Credentials: ${credPath}`);
  console.log(`Scan page size: ${PAGE_SIZE}\n`);

  const totals = new Map(); // questionId -> { attempts, correct, totalTimeMs, optionCounts }
  let scanned = 0;
  let replayed = 0;
  let totalAttempts = 0;
  let gridInAttempts = 0; // counted, but excluded from optionCounts
  let skippedAnswers = 0; // omitted / never answered

  const replayQuiz = (docSnap) => {
    const quiz = docSnap.data();
    if (!quiz || !quiz.userAnswers) return; // abandoned / never finished
    const questionIds = Array.isArray(quiz.questionIds) && quiz.questionIds.length > 0
      ? quiz.questionIds
      : (Array.isArray(quiz.questions) ? quiz.questions.map((x) => x && x.id).filter(Boolean) : []);
    if (questionIds.length === 0) return;
    replayed += 1;

    let countedInQuiz = 0;
    for (const questionId of questionIds) {
      const answer = quiz.userAnswers[questionId];
      if (!isCountableAnswer(answer)) {
        skippedAnswers += 1;
        continue;
      }

      let t = totals.get(questionId);
      if (!t) {
        t = { attempts: 0, correct: 0, totalTimeMs: 0, optionCounts: {} };
        totals.set(questionId, t);
      }
      t.attempts += 1;
      if (answer.isCorrect) t.correct += 1;
      t.totalTimeMs += timeSpentMs(answer);

      const selected = answer.selectedOption;
      if (isMultipleChoicePick(selected)) {
        const optKey = String(selected);
        t.optionCounts[optKey] = (t.optionCounts[optKey] || 0) + 1;
      } else {
        gridInAttempts += 1;
      }
      totalAttempts += 1;
      countedInQuiz += 1;
    }
    if (VERBOSE) {
      console.log(`  quiz ${docSnap.id}: ${countedInQuiz}/${questionIds.length} countable answers`);
    }
  };

  // 1) Paginated scan of every smartQuiz (ordered by doc id, PAGE_SIZE a page).
  let lastDoc = null;
  for (;;) {
    let pageQuery = db.collection('smartQuizzes')
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (lastDoc) pageQuery = pageQuery.startAfter(lastDoc);
    const page = await pageQuery.get();
    if (page.empty) break;
    page.docs.forEach(replayQuiz);
    scanned += page.size;
    lastDoc = page.docs[page.docs.length - 1];
    if (VERBOSE) console.log(`  ...scanned ${scanned} quizzes`);
    if (page.size < PAGE_SIZE) break;
  }

  console.log(`smartQuizzes scanned:        ${scanned}`);
  console.log(`Completed (with answers):    ${replayed}`);
  console.log(`Total attempts counted:      ${totalAttempts}`);
  console.log(`  of which grid-in:          ${gridInAttempts}   <- no optionCounts entry`);
  console.log(`Skipped (omitted/no answer): ${skippedAnswers}`);
  console.log(`Questions covered:           ${totals.size}`);

  // 2) Existing docs: anything not re-derived gets deleted (rebuild-from-scratch).
  const existingSnap = await db.collection('questionStats').select().get();
  const staleIds = existingSnap.docs.map((d) => d.id).filter((id) => !totals.has(id));
  console.log(`Existing questionStats docs: ${existingSnap.size}`);
  console.log(`Stale docs to delete:        ${staleIds.length}`);

  // 3) Top-5 sample (by attempts) so a dry run is reviewable at a glance.
  const top5 = Array.from(totals.entries())
    .sort((a, b) => b[1].attempts - a[1].attempts)
    .slice(0, 5);
  if (top5.length > 0) {
    console.log('\nTop-5 questions by attempts:');
    top5.forEach(([questionId, t]) => {
      const pct = t.attempts > 0 ? Math.round((t.correct / t.attempts) * 100) : 0;
      const avgSec = t.attempts > 0 ? Math.round(t.totalTimeMs / t.attempts / 1000) : 0;
      console.log(`  questionStats/${questionId}`);
      console.log(`    attempts=${t.attempts} correct=${t.correct} (${pct}%) avg=${avgSec}s optionCounts=${JSON.stringify(t.optionCounts)}`);
    });
  }

  if (!APPLY) {
    console.log('\nDry run complete — re-run with --apply to write.');
    return;
  }

  // 4) Write: deletes + full overwrites, in batches of <= 400 ops.
  const BATCH_LIMIT = 400;
  let batch = db.batch();
  let ops = 0;
  let written = 0;
  let deleted = 0;
  const commitIfFull = async () => {
    if (ops >= BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  };

  for (const id of staleIds) {
    batch.delete(db.collection('questionStats').doc(id));
    ops += 1; deleted += 1;
    await commitIfFull();
  }
  for (const [questionId, t] of totals) {
    // set WITHOUT merge: the rebuilt totals fully replace whatever is there.
    batch.set(db.collection('questionStats').doc(questionId), {
      attempts: t.attempts,
      correct: t.correct,
      totalTimeMs: t.totalTimeMs,
      optionCounts: t.optionCounts,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      rebuiltBy: 'backfill-question-stats-v2',
    });
    ops += 1; written += 1;
    await commitIfFull();
  }
  if (ops > 0) await batch.commit();

  console.log(`\nDone. Wrote ${written} doc(s), deleted ${deleted} stale doc(s).`);
}

main().catch((err) => {
  console.error('questionStats backfill failed:', err);
  process.exit(1);
});
