/**
 * Replace the two Math modules of "Exam 9" (Practice Test 9) with the 22+22
 * questions authored in scripts/data/practiceTest9Math.json.
 *
 * Mirrors replaceExam5Math.js: the two Math examModule documents are kept (their
 * IDs, titles, moduleNumbers do not change); only their questionIds are
 * repointed at freshly created question documents. The two R&W modules
 * (moduleNumber 1 and 2, already rebuilt by replaceExam9RW.js) are never touched.
 *
 * RETIREMENT SEMANTICS: the outgoing question documents are NOT deleted. They are
 * (a) copied verbatim into the timestamped backup file below and (b) left in the
 * `questions` collection, simply unreferenced by any exam module. `--rollback`
 * repoints the modules back at them.
 *
 * Math extras vs the RW script:
 *  - Figure items: the SVG in scripts/data/practiceTest9Math-assets/ named by
 *    each question's graphAsset is inlined as a base64 data URI into graphUrl,
 *    with hasImage: true and graphDescription carried over.
 *  - SPR items get inputType "fraction" when any accepted entry contains "/".
 *
 * Usage:
 *   node scripts/validatePracticeTest9Math.js      # run this first; must pass
 *   node scripts/replaceExam9Math.js --dry-run     # show the plan, write nothing
 *   node scripts/replaceExam9Math.js               # back up, create, and repoint
 *   node scripts/replaceExam9Math.js --rollback scripts/backups/<file>.json
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { resolveSubcategory } = require('./lib/subcategoryMap');

const EXAM_ID = 'LOafADEJwRWqNz4lrEGx'; // "Exam 9"
const data = require(path.resolve(__dirname, 'data/practiceTest9Math.json'));
const ASSETS_DIR = path.resolve(__dirname, 'data/practiceTest9Math-assets');

const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK_IDX = process.argv.indexOf('--rollback');

function svgToDataUri(assetName) {
  const file = path.join(ASSETS_DIR, assetName);
  const svg = fs.readFileSync(file, 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

/**
 * Build a `questions` collection document for a math item. Field set mirrors
 * scripts/lib/diagnosticDocBuilder.js buildQuestionDoc exactly, plus real
 * figure support (hasImage/graphUrl/graphDescription).
 */
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
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`rolled back module ${n} (${m.moduleDocId}) -> ${m.prevQuestionIds.length} questions`);
  }
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
  if (!math[3] || !math[4]) throw new Error('Could not find Math modules 3 and 4 on Exam 3');

  // Backup (this is what "retire, don't delete" means: the outgoing docs are
  // copied here verbatim and also left in place in the questions collection)
  const backup = { exam: { id: EXAM_ID, title: exam.title }, at: new Date().toISOString(), modules: {} };
  for (const n of [3, 4]) {
    const qs = [];
    for (const qid of math[n].questionIds || []) {
      const qd = await db.collection('questions').doc(qid).get();
      qs.push(qd.exists ? { id: qid, ...qd.data() } : { id: qid, _missing: true });
    }
    backup.modules[n] = {
      moduleDocId: math[n].id, title: math[n].title, moduleNumber: n,
      prevQuestionIds: math[n].questionIds || [], prevQuestions: qs,
    };
  }
  const backupFile = path.resolve(__dirname, `backups/exam9_math_backup_${Date.now()}.json`);
  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(backupFile), { recursive: true });
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 1));
    console.log(`backup written: ${backupFile}`);
  } else {
    for (const n of [3, 4]) {
      console.log(`[dry-run] module ${n} ("${math[n].title}") currently holds ` +
        `${(math[n].questionIds || []).length} questions -> would be retired to the backup file`);
    }
  }

  // Create new question docs and repoint the modules
  for (const mod of data.modules) {
    const n = mod.moduleNumber;
    const target = math[n];
    const docs = mod.questions.map((q) => buildMathQuestionDoc(q, n, data.examSlug));
    console.log(`${DRY_RUN ? '[dry-run] ' : ''}module ${n} ("${target.title}"): ${docs.length} new questions ` +
      `(${docs.filter((d) => d.questionType === 'user-input').length} SPR, ${docs.filter((d) => d.hasImage).length} with figures)`);
    if (DRY_RUN) continue;

    const newIds = [];
    for (const doc of docs) {
      const ref = await db.collection('questions').add({ ...doc, createdAt: ts(), updatedAt: ts() });
      newIds.push(ref.id);
    }
    await db.collection('examModules').doc(target.id).update({
      questionIds: newIds,
      questionCount: newIds.length,
      updatedAt: ts(),
    });
    console.log(`module ${n} repointed -> ${newIds.length} questions`);
  }

  if (DRY_RUN) {
    console.log('[dry-run] nothing written.');
  } else {
    console.log('Done. Old question docs are preserved (unreferenced); rollback restores the previous questionIds.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
