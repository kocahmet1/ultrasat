/**
 * Replace the two Math modules of "Exam 1" (Practice Test 1) with the 22+22
 * questions authored in scripts/data/practiceTest1Math.json.
 *
 * Mirrors replaceExam4Math.js / replaceExam5Math.js, with two Exam-1-specific
 * additions:
 *
 *  1. MODULE METADATA REPAIR — Exam 1's math module docs predate the math
 *     conventions (calculatorAllowed:false, timeLimit:1920, 21/19 questions).
 *     This script sets calculatorAllowed:true and timeLimit:2100 (35 min) on
 *     modules 3 and 4, alongside the questionIds repoint. Doc IDs, titles and
 *     moduleNumbers do not change. The R&W modules (1 and 2) are never touched.
 *
 *  2. SOFT RETIREMENT of the old question docs — per the user requirement
 *     "retire, don't delete" and the conventions in retireQuestions.js:
 *     retired:true + retiredAt + retiredReason, and usageContext:'retired'
 *     (previous value preserved in originalUsageContext) so already-deployed
 *     selection paths also stop serving them. Docs keep their IDs, so
 *     historical attempts and stats still resolve. A reference guard skips
 *     any doc still referenced by ANY other examModule (as of 2026-08-14 a
 *     full scan found zero such shared docs).
 *
 * A JSON backup of the previous module metadata, questionIds and full question
 * documents is written to scripts/backups/ before anything changes.
 *
 * Usage:
 *   node scripts/validatePracticeTest1Math.js       # run this first; must pass
 *   node scripts/replaceExam1Math.js --dry-run      # show the plan, write nothing
 *   node scripts/replaceExam1Math.js                # back up, create, repoint, retire
 *   node scripts/replaceExam1Math.js --rollback scripts/backups/<file>.json
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { resolveSubcategory } = require('./lib/subcategoryMap');

const EXAM_ID = 'IcRvQJmEg0pyW2vTv0pB'; // "Exam 1"
const RETIRE_REASON = 'replaced by exam1-math-v1 (PT1 math refresh, 2026-08)';
const data = require(path.resolve(__dirname, 'data/practiceTest1Math.json'));
const ASSETS_DIR = path.resolve(__dirname, 'data/practiceTest1Math-assets');

const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK_IDX = process.argv.indexOf('--rollback');

function svgToDataUri(assetName) {
  const file = path.join(ASSETS_DIR, assetName);
  const svg = fs.readFileSync(file, 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

/** Field set mirrors replaceExam4Math.js buildMathQuestionDoc exactly. */
function buildMathQuestionDoc(q, moduleNumber, examSlug) {
  const sub = resolveSubcategory(q.subcategory);
  if (!sub) throw new Error(`Unresolvable subcategory "${q.subcategory}" (Q${q.originalQuestionNumber})`);
  if (sub.id !== q.subcategoryId) {
    throw new Error(`subcategoryId mismatch for Q${q.originalQuestionNumber}: ${q.subcategoryId} != ${sub.id}`);
  }

  const isUserInput = q.questionType === 'user-input';
  let inputType = 'number';
  if (isUserInput) {
    const entries = q.acceptedAnswers || [String(q.correctAnswer)];
    if (entries.some((a) => String(a).includes('/'))) inputType = 'fraction';
  }

  const hasImage = Boolean(q.graphAsset);

  return {
    text: q.text.trim(),
    questionType: q.questionType,
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    acceptedAnswers: isUserInput ? (q.acceptedAnswers || [String(q.correctAnswer)]) : null,
    inputType,
    answerFormat: null,
    explanation: q.explanation || '',
    difficulty: q.difficulty,
    subcategory: sub.kebab,
    subCategory: sub.kebab, // backward compatibility
    subcategoryId: sub.id,
    categoryPath: `${sub.section}/${sub.mainCategory}/${sub.name}`,
    mainCategory: sub.mainCategory,
    subjectArea: sub.section,
    source: 'ultrasat-original',
    usageContext: 'exam',
    originalExam: examSlug,
    originalQuestionNumber: q.originalQuestionNumber,
    originalModuleNumber: moduleNumber,
    hasImage,
    graphUrl: hasImage ? svgToDataUri(q.graphAsset) : null,
    graphDescription: hasImage ? (q.graphDescription || null) : null,
    passage: q.passage || null,
    skillTags: [],
  };
}

async function rollback(db, admin, file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const n of Object.keys(backup.modules)) {
    const m = backup.modules[n];
    await db.collection('examModules').doc(m.moduleDocId).update({
      questionIds: m.prevQuestionIds,
      questionCount: m.prevQuestionIds.length,
      calculatorAllowed: m.prevCalculatorAllowed,
      timeLimit: m.prevTimeLimit,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`rolled back module ${n} (${m.moduleDocId}) -> ${m.prevQuestionIds.length} questions, metadata restored`);
  }
  // un-retire the previously retired docs
  const retiredIds = backup.retiredQuestionIds || [];
  for (const qid of retiredIds) {
    const ref = db.collection('questions').doc(qid);
    const snap = await ref.get();
    if (!snap.exists) continue;
    const d = snap.data();
    await ref.update({
      retired: admin.firestore.FieldValue.delete(),
      retiredAt: admin.firestore.FieldValue.delete(),
      retiredReason: admin.firestore.FieldValue.delete(),
      usageContext: d.originalUsageContext || 'exam',
      originalUsageContext: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  if (retiredIds.length) console.log(`un-retired ${retiredIds.length} question docs`);
  console.log('Rollback complete. (Newly created question docs, if any, are left in place but unreferenced.)');
}

async function main() {
  const admin = initFirebaseAdmin();
  const db = admin.firestore();
  const ts = () => admin.firestore.FieldValue.serverTimestamp();

  if (ROLLBACK_IDX !== -1) {
    const file = process.argv[ROLLBACK_IDX + 1];
    if (!file) throw new Error('--rollback requires a backup file path');
    return rollback(db, admin, path.resolve(file));
  }

  const examSnap = await db.collection('practiceExams').doc(EXAM_ID).get();
  if (!examSnap.exists) throw new Error(`Exam ${EXAM_ID} not found`);
  const exam = examSnap.data();
  if (exam.title !== data.targetExamTitle) {
    throw new Error(`Exam title mismatch: Firestore says "${exam.title}", data file targets "${data.targetExamTitle}"`);
  }

  // Locate the two Math module docs (moduleNumber 3 and 4)
  const math = {};
  for (const mid of exam.moduleIds) {
    const md = await db.collection('examModules').doc(mid).get();
    const m = md.data();
    if (m.moduleNumber === 3 || m.moduleNumber === 4) math[m.moduleNumber] = { id: mid, ...m };
  }
  if (!math[3] || !math[4]) throw new Error('Could not find Math modules 3 and 4 on Exam 1');

  // Reference guard: which old question ids are referenced by OTHER modules?
  const oldIds = new Set([...(math[3].questionIds || []), ...(math[4].questionIds || [])]);
  const sharedElsewhere = new Set();
  const allMods = await db.collection('examModules').get();
  for (const md of allMods.docs) {
    if (md.id === math[3].id || md.id === math[4].id) continue;
    for (const qid of md.data().questionIds || []) {
      if (oldIds.has(qid)) sharedElsewhere.add(qid);
    }
  }
  const toRetire = [...oldIds].filter((id) => !sharedElsewhere.has(id));
  console.log(`old question docs: ${oldIds.size} (retiring ${toRetire.length}, ${sharedElsewhere.size} shared with other modules and left alone)`);

  // Backup (module metadata + question ids + full docs)
  const backup = {
    exam: { id: EXAM_ID, title: exam.title },
    at: new Date().toISOString(),
    retiredQuestionIds: DRY_RUN ? [] : toRetire,
    modules: {},
  };
  for (const n of [3, 4]) {
    const qs = [];
    for (const qid of math[n].questionIds || []) {
      const qd = await db.collection('questions').doc(qid).get();
      qs.push(qd.exists ? { id: qid, ...qd.data() } : { id: qid, _missing: true });
    }
    backup.modules[n] = {
      moduleDocId: math[n].id, title: math[n].title, moduleNumber: n,
      prevQuestionIds: math[n].questionIds || [], prevQuestions: qs,
      prevCalculatorAllowed: math[n].calculatorAllowed ?? null,
      prevTimeLimit: math[n].timeLimit ?? null,
    };
  }
  const backupFile = path.resolve(__dirname, `backups/exam1_math_backup_${Date.now()}.json`);
  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(backupFile), { recursive: true });
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 1));
    console.log(`backup written: ${backupFile}`);
  }

  // Create new question docs, repoint the modules, repair metadata
  for (const mod of data.modules) {
    const n = mod.moduleNumber;
    const target = math[n];
    const docs = mod.questions.map((q) => buildMathQuestionDoc(q, n, data.examSlug));
    console.log(`${DRY_RUN ? '[dry-run] ' : ''}module ${n} ("${target.title}"): ${docs.length} new questions ` +
      `(${docs.filter((d) => d.questionType === 'user-input').length} SPR, ${docs.filter((d) => d.hasImage).length} with figures); ` +
      `metadata -> calculatorAllowed:true, timeLimit:${mod.timeLimit}`);
    if (DRY_RUN) continue;

    const newIds = [];
    for (const doc of docs) {
      const ref = await db.collection('questions').add({ ...doc, createdAt: ts(), updatedAt: ts() });
      newIds.push(ref.id);
    }
    await db.collection('examModules').doc(target.id).update({
      questionIds: newIds,
      questionCount: newIds.length,
      calculatorAllowed: true,
      timeLimit: mod.timeLimit,
      updatedAt: ts(),
    });
    console.log(`module ${n} repointed -> ${newIds.length} questions`);
  }

  // Soft-retire the old docs (skip shared ones)
  if (!DRY_RUN) {
    let retired = 0;
    for (const qid of toRetire) {
      const ref = db.collection('questions').doc(qid);
      const snap = await ref.get();
      if (!snap.exists) continue;
      const d = snap.data();
      await ref.update({
        retired: true,
        retiredAt: ts(),
        retiredReason: RETIRE_REASON,
        originalUsageContext: d.usageContext || 'exam',
        usageContext: 'retired',
        updatedAt: ts(),
      });
      retired += 1;
    }
    console.log(`soft-retired ${retired} old question docs (reason: "${RETIRE_REASON}")`);
  } else {
    console.log(`[dry-run] would soft-retire ${toRetire.length} old question docs`);
  }

  if (DRY_RUN) {
    console.log('[dry-run] nothing written.');
  } else {
    console.log('Done. Old question docs are preserved (retired, unreferenced); rollback restores questionIds, metadata, and un-retires.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
