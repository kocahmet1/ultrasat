/**
 * Replace the two Math modules of "Exam 10" (Practice Test 10) with the 22+22
 * questions authored in scripts/data/practiceTest10Math.json.
 *
 * Mirrors replaceExam5Math.js: the two Math examModule documents are kept (their
 * IDs, titles, moduleNumbers do not change); only their questionIds are
 * repointed at freshly created question documents. The two R&W modules
 * (moduleNumber 1 and 2) are never touched.
 *
 * PT10 addition — the old items are RETIRED, not deleted:
 *   After repointing, every previously-referenced Math question doc is soft
 *   retired using the repo's canonical convention (scripts/retireQuestions.js):
 *     retired: true, retiredAt, retiredReason,
 *     usageContext: 'retired' (previous value preserved in originalUsageContext)
 *   The documents themselves are never deleted, so historical smartQuizzes,
 *   attempt records and questionStats keep resolving.
 *   A doc that is ALSO referenced by another examModule is left un-retired and
 *   reported — retiring it would blank a question in that other exam.
 *
 * Math extras vs the RW script:
 *  - Figure items: the SVG in scripts/data/practiceTest10Math-assets/ named by
 *    each question's graphAsset is inlined as a base64 data URI into graphUrl,
 *    with hasImage: true and graphDescription carried over.
 *  - SPR items get inputType "fraction" when any accepted entry contains "/".
 *
 * A JSON backup of the previous questionIds, the previous question documents and
 * their prior retirement state is written to scripts/backups/ before anything
 * changes, so the whole swap is reversible.
 *
 * Usage:
 *   node scripts/validatePracticeTest10Math.js       # run this first; must pass
 *   node scripts/replaceExam10Math.js --dry-run      # show the plan, write nothing
 *   node scripts/replaceExam10Math.js                # back up, create, repoint, retire
 *   node scripts/replaceExam10Math.js --no-retire    # repoint only, leave old docs active
 *   node scripts/replaceExam10Math.js --rollback scripts/backups/<file>.json
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { resolveSubcategory } = require('./lib/subcategoryMap');

const EXAM_ID = 'tV8bmOPkWywuHnSeECmE'; // "Exam 10"
const data = require(path.resolve(__dirname, 'data/practiceTest10Math.json'));
const ASSETS_DIR = path.resolve(__dirname, 'data/practiceTest10Math-assets');
const RETIRE_REASON = 'superseded by practiceTest10Math (PT10 math rebuild 2026-08)';

const DRY_RUN = process.argv.includes('--dry-run');
const NO_RETIRE = process.argv.includes('--no-retire');
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

/** Every examModule doc id that references the given question id. */
async function referencingModules(db, questionId) {
  const snap = await db.collection('examModules').where('questionIds', 'array-contains', questionId).get();
  return snap.docs.map((d) => d.id);
}

async function rollback(db, admin, file) {
  const FV = admin.firestore.FieldValue;
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));

  for (const n of Object.keys(backup.modules)) {
    const m = backup.modules[n];
    await db.collection('examModules').doc(m.moduleDocId).update({
      questionIds: m.prevQuestionIds,
      questionCount: m.prevQuestionIds.length,
      updatedAt: FV.serverTimestamp(),
    });
    console.log(`rolled back module ${n} (${m.moduleDocId}) -> ${m.prevQuestionIds.length} questions`);

    // Restore each old doc's pre-retirement state.
    for (const q of m.prevQuestions) {
      if (q._missing) continue;
      const patch = {
        retired: q.retired ?? false,
        usageContext: q.usageContext ?? 'exam',
        updatedAt: FV.serverTimestamp(),
      };
      if (q.retired === undefined || q.retired === false) {
        patch.retiredAt = FV.delete();
        patch.retiredReason = FV.delete();
      }
      if (q.originalUsageContext === undefined) patch.originalUsageContext = FV.delete();
      await db.collection('questions').doc(q.id).update(patch);
    }
    console.log(`restored retirement state on ${m.prevQuestions.filter((q) => !q._missing).length} question docs`);
  }
  console.log('Rollback complete. (Newly created question docs, if any, are left in place but unreferenced.)');
}

async function main() {
  const admin = initFirebaseAdmin();
  const db = admin.firestore();
  const FV = admin.firestore.FieldValue;
  const ts = () => FV.serverTimestamp();

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
  if (!math[3] || !math[4]) throw new Error('Could not find Math modules 3 and 4 on Exam 10');

  // Backup (pointers + full previous docs, including their retirement state)
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
  const backupFile = path.resolve(__dirname, `backups/exam10_math_backup_${Date.now()}.json`);
  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(backupFile), { recursive: true });
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 1));
    console.log(`backup written: ${backupFile}`);
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

  // Retire (soft) the now-unreferenced old Math questions.
  if (NO_RETIRE) {
    console.log('--no-retire: previous question docs left active and unreferenced.');
  } else {
    let retired = 0;
    const shared = [];
    for (const n of [3, 4]) {
      for (const q of backup.modules[n].prevQuestions) {
        if (q._missing) continue;
        const refs = DRY_RUN
          ? (await referencingModules(db, q.id)).filter((id) => id !== backup.modules[n].moduleDocId)
          : await referencingModules(db, q.id);
        if (refs.length) { shared.push({ id: q.id, refs }); continue; }
        if (q.retired === true) continue;
        if (!DRY_RUN) {
          await db.collection('questions').doc(q.id).update({
            retired: true,
            retiredAt: ts(),
            retiredReason: RETIRE_REASON,
            originalUsageContext: q.usageContext ?? 'exam',
            usageContext: 'retired',
            updatedAt: ts(),
          });
        }
        retired += 1;
      }
    }
    console.log(`${DRY_RUN ? '[dry-run] ' : ''}retired ${retired} previous Math question doc(s) (soft flag; nothing deleted)`);
    if (shared.length) {
      console.log(`left ${shared.length} doc(s) active because another examModule still references them:`);
      for (const s of shared) console.log(`  ${s.id} <- ${s.refs.join(', ')}`);
    }
  }

  if (DRY_RUN) {
    console.log('[dry-run] nothing written.');
  } else {
    console.log('Done. Old question docs are preserved and retired; rollback restores pointers AND retirement state.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
