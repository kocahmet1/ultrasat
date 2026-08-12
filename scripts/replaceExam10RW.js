/**
 * Add/replace the Reading & Writing modules of "Exam 10" (Practice Test 10)
 * using the 27+27 questions authored in scripts/data/practiceTest10RW.json.
 *
 * Exam 10 shipped with only its two Math modules (moduleNumber 3 and 4), so
 * unlike replaceExam3/4/5/6/8/9RW.js this script CREATES the two R&W
 * examModule documents (moduleNumber 1 and 2, mirroring the schema of the
 * existing module docs) and prepends them to the exam's moduleIds. If R&W
 * modules already exist (e.g. on a rerun), their questionIds are repointed
 * instead, exactly like the other replace scripts. Math modules are never
 * touched.
 *
 * A JSON backup of the exam's previous moduleIds (and any existing R&W module
 * state) is written to scripts/backups/ before anything changes.
 *
 * Usage:
 *   node scripts/replaceExam10RW.js --dry-run     # show the plan, write nothing
 *   node scripts/replaceExam10RW.js               # back up, create, and wire up
 *   node scripts/replaceExam10RW.js --rollback scripts/backups/<file>.json
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { buildQuestionDoc } = require('./lib/diagnosticDocBuilder');

const EXAM_ID = 'tV8bmOPkWywuHnSeECmE'; // "Exam 10"
const data = require(path.resolve(__dirname, 'data/practiceTest10RW.json'));

const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK_IDX = process.argv.indexOf('--rollback');

async function rollback(db, admin, file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  await db.collection('practiceExams').doc(EXAM_ID).update({
    moduleIds: backup.exam.prevModuleIds,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`restored exam moduleIds -> [${backup.exam.prevModuleIds.join(', ')}]`);
  for (const n of Object.keys(backup.modules || {})) {
    const m = backup.modules[n];
    await db.collection('examModules').doc(m.moduleDocId).update({
      questionIds: m.prevQuestionIds,
      questionCount: m.prevQuestionIds.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`rolled back module ${n} (${m.moduleDocId}) -> ${m.prevQuestionIds.length} questions`);
  }
  console.log('Rollback complete. (Newly created docs, if any, are left in place but unreferenced.)');
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

  // Inventory existing modules
  const rw = {};
  const mathIds = [];
  for (const mid of exam.moduleIds || []) {
    const md = await db.collection('examModules').doc(mid).get();
    if (!md.exists) { console.warn(`WARNING: module ${mid} missing, keeping reference`); mathIds.push(mid); continue; }
    const m = md.data();
    if (m.moduleNumber === 1 || m.moduleNumber === 2) rw[m.moduleNumber] = { id: mid, ...m };
    else mathIds.push(mid);
  }
  console.log(`Existing: R&W modules [${Object.keys(rw).join(', ') || 'none'}], other modules [${mathIds.length}]`);

  // Backup
  const backup = {
    exam: { id: EXAM_ID, title: exam.title, prevModuleIds: exam.moduleIds || [] },
    at: new Date().toISOString(),
    modules: {},
  };
  for (const n of [1, 2]) {
    if (!rw[n]) continue;
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
    const bpath = path.join(dir, `exam10_rw_backup_${Date.now()}.json`);
    fs.writeFileSync(bpath, JSON.stringify(backup, null, 2));
    console.log('Backup written:', bpath);
  }

  // Create question docs, then create-or-repoint the R&W module docs
  const newRwIds = {};
  for (const mod of data.modules) {
    const ids = [];
    for (const qq of mod.questions) {
      const doc = buildQuestionDoc(qq, mod.moduleNumber, data.examSlug);
      if (DRY_RUN) { ids.push(`dry-${mod.moduleNumber}-${qq.originalQuestionNumber}`); continue; }
      const ref = await db.collection('questions').add({ ...doc, createdAt: ts(), updatedAt: ts() });
      ids.push(ref.id);
    }
    console.log(`Module ${mod.moduleNumber}: ${DRY_RUN ? 'would create' : 'created'} ${ids.length} questions`);

    if (rw[mod.moduleNumber]) {
      newRwIds[mod.moduleNumber] = rw[mod.moduleNumber].id;
      if (!DRY_RUN) {
        await db.collection('examModules').doc(rw[mod.moduleNumber].id).update({
          questionIds: ids, questionCount: ids.length, timeLimit: 1920, calculatorAllowed: false, updatedAt: ts(),
        });
        console.log(`  repointed existing module doc ${rw[mod.moduleNumber].id}`);
      } else {
        console.log(`  would repoint existing module doc ${rw[mod.moduleNumber].id}`);
      }
    } else if (DRY_RUN) {
      newRwIds[mod.moduleNumber] = `dry-module-${mod.moduleNumber}`;
      console.log(`  would create new examModules doc "${mod.title}"`);
    } else {
      const ref = await db.collection('examModules').add({
        title: mod.title,
        moduleNumber: mod.moduleNumber,
        description: mod.description || 'No description provided',
        timeLimit: 1920,
        calculatorAllowed: false,
        questionIds: ids,
        questionCount: ids.length,
        categoryPaths: [],
        createdAt: ts(),
        updatedAt: ts(),
      });
      newRwIds[mod.moduleNumber] = ref.id;
      console.log(`  created new examModules doc ${ref.id} ("${mod.title}")`);
    }
  }

  // Wire the exam: R&W modules 1,2 first, then the untouched math modules
  const finalModuleIds = [newRwIds[1], newRwIds[2], ...mathIds];
  if (DRY_RUN) {
    console.log(`[DRY RUN] exam moduleIds would become: [${finalModuleIds.join(', ')}]`);
    console.log('[DRY RUN] no changes written');
  } else {
    await db.collection('practiceExams').doc(EXAM_ID).update({ moduleIds: finalModuleIds, updatedAt: ts() });
    console.log(`exam moduleIds updated: [${finalModuleIds.join(', ')}]`);
    console.log('DONE — Exam 10 now serves the new R&W modules alongside its Math modules.');
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error('Failed:', e); process.exit(1); });
