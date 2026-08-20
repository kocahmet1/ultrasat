/**
 * Replace the two Reading & Writing modules of "Exam 9" (Practice Test 4) with
 * the 27+27 questions authored in scripts/data/practiceTest9RW.json.
 *
 * The two R&W examModule documents are kept (their IDs, titles, moduleNumbers do
 * not change); only their questionIds are repointed at freshly created question
 * documents. The two Math modules (moduleNumber 3 and 4) are never touched.
 *
 * A JSON backup of the previous questionIds and question documents is written to
 * scripts/backups/ before anything changes, so the swap is reversible.
 *
 * Usage:
 *   node scripts/replaceExam9RW.js --dry-run     # show the plan, write nothing
 *   node scripts/replaceExam9RW.js               # back up, create, and repoint
 *   node scripts/replaceExam9RW.js --rollback scripts/backups/<file>.json
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { buildQuestionDoc } = require('./lib/diagnosticDocBuilder');

const EXAM_ID = 'LOafADEJwRWqNz4lrEGx'; // "Exam 9"
const data = require(path.resolve(__dirname, 'data/practiceTest9RW.json'));

const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK_IDX = process.argv.indexOf('--rollback');

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

  // Locate the two R&W module docs (moduleNumber 1 and 2)
  const rw = {};
  for (const mid of exam.moduleIds) {
    const md = await db.collection('examModules').doc(mid).get();
    const m = md.data();
    if (m.moduleNumber === 1 || m.moduleNumber === 2) rw[m.moduleNumber] = { id: mid, ...m };
  }
  if (!rw[1] || !rw[2]) throw new Error('Could not find R&W modules 1 and 2 on Exam 9');

  // Backup
  const backup = { exam: { id: EXAM_ID, title: exam.title }, at: new Date().toISOString(), modules: {} };
  for (const n of [1, 2]) {
    const qs = [];
    for (const qid of rw[n].questionIds || []) {
      const qd = await db.collection('questions').doc(qid).get();
      qs.push(qd.exists ? { id: qid, ...qd.data() } : { id: qid, _missing: true });
    }
    backup.modules[n] = {
      moduleDocId: rw[n].id, title: rw[n].title, moduleNumber: n,
      prevQuestionIds: rw[n].questionIds || [], prevQuestions: qs,
    };
  }
  if (!DRY_RUN) {
    const dir = path.resolve(__dirname, 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const bpath = path.join(dir, `exam9_rw_backup_${Date.now()}.json`);
    fs.writeFileSync(bpath, JSON.stringify(backup, null, 2));
    console.log('Backup written:', bpath);
  }

  // Create new question docs (preserving order) and repoint the modules
  for (const mod of data.modules) {
    const ids = [];
    for (const qq of mod.questions) {
      const doc = buildQuestionDoc(qq, mod.moduleNumber, data.examSlug);
      if (DRY_RUN) { ids.push(`dry-${mod.moduleNumber}-${qq.originalQuestionNumber}`); continue; }
      const ref = await db.collection('questions').add({ ...doc, createdAt: ts(), updatedAt: ts() });
      ids.push(ref.id);
    }
    console.log(`Module ${mod.moduleNumber}: ${DRY_RUN ? 'would create' : 'created'} ${ids.length} questions`);
    if (!DRY_RUN) {
      await db.collection('examModules').doc(rw[mod.moduleNumber].id).update({
        questionIds: ids, questionCount: ids.length, timeLimit: 1920, calculatorAllowed: false, updatedAt: ts(),
      });
      console.log(`  repointed module doc ${rw[mod.moduleNumber].id}`);
    }
  }
  console.log(DRY_RUN ? '[DRY RUN] no changes written' : 'DONE — Exam 9 R&W modules now serve the new questions.');
}

main().then(() => process.exit(0)).catch((e) => { console.error('Failed:', e); process.exit(1); });
