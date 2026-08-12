/**
 * Retire the existing Inferences question pool and import the 100 newly authored
 * items from scripts/data/inf-refresh-2026/.
 *
 * WHAT "RETIRE" MEANS HERE
 * Nothing is deleted. Each existing Inferences question is updated with
 *   usageContext: 'retired'      (SmartQuiz's isGeneralUseQuestion() skips anything
 *                                 whose usageContext is set and is not 'general')
 *   retiredAt, retiredReason, previousUsageContext
 * so past SmartQuiz sessions and userProgress rows that reference these documents
 * still resolve, while the new pool is the only thing served going forward.
 *
 * Questions whose usageContext is 'exam' are LEFT ALONE by default: they belong to
 * practice tests, not to the SmartQuiz pool. Pass --include-exam to retire those too.
 *
 * A full JSON backup of every document touched is written to scripts/backups/
 * before anything changes, and --rollback restores from it exactly.
 *
 * Usage:
 *   node scripts/retireAndImportInferences.js --dry-run    # print the plan, write nothing
 *   node scripts/retireAndImportInferences.js              # back up, retire, import
 *   node scripts/retireAndImportInferences.js --retire-only
 *   node scripts/retireAndImportInferences.js --import-only
 *   node scripts/retireAndImportInferences.js --rollback scripts/backups/<file>.json
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');

const PAYLOAD = path.resolve(__dirname, 'data/inf-refresh-2026/questions-payload.json');
const BACKUP_DIR = path.resolve(__dirname, 'backups');
const AUTHORING_SET = 'inf-refresh-2026';

const DRY_RUN = process.argv.includes('--dry-run');
const RETIRE_ONLY = process.argv.includes('--retire-only');
const IMPORT_ONLY = process.argv.includes('--import-only');
const INCLUDE_EXAM = process.argv.includes('--include-exam');
const ROLLBACK_IDX = process.argv.indexOf('--rollback');

// every spelling of "inferences" that has ever been written into this collection
const KEBAB = 'inferences';
const NUMERIC_ID = 2;
const SUBCATEGORY_ALIASES = ['inferences', 'Inferences', 'inference', 'Inference'];

function log(...a) { console.log(...a); }

/** Find every existing Inferences question, across all the field spellings. */
async function findExisting(db) {
  const found = new Map();
  const queries = [];
  for (const v of SUBCATEGORY_ALIASES) {
    queries.push(db.collection('questions').where('subcategory', '==', v));
    queries.push(db.collection('questions').where('subCategory', '==', v));
  }
  queries.push(db.collection('questions').where('subcategoryId', '==', NUMERIC_ID));
  queries.push(db.collection('questions').where('subcategoryId', '==', String(NUMERIC_ID)));
  queries.push(db.collection('questions').where('categoryPath', 'array-contains', KEBAB));

  for (const q of queries) {
    let snap;
    try {
      snap = await q.get();
    } catch (e) {
      // categoryPath is a string on some documents; array-contains then throws.
      continue;
    }
    snap.forEach((doc) => found.set(doc.id, { id: doc.id, ...doc.data() }));
  }
  return [...found.values()];
}

async function rollback(db, admin, file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  log(`Rolling back from ${path.basename(file)}`);
  log(`  restoring ${backup.retired.length} retired questions`);
  let batch = db.batch(); let n = 0;
  for (const q of backup.retired) {
    const ref = db.collection('questions').doc(q.id);
    batch.update(ref, {
      usageContext: q.usageContext === undefined ? admin.firestore.FieldValue.delete() : q.usageContext,
      retiredAt: admin.firestore.FieldValue.delete(),
      retiredReason: admin.firestore.FieldValue.delete(),
      previousUsageContext: admin.firestore.FieldValue.delete(),
    });
    if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  await batch.commit();

  log(`  deleting ${backup.imported.length} imported questions`);
  batch = db.batch(); n = 0;
  for (const id of backup.imported) {
    batch.delete(db.collection('questions').doc(id));
    if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  await batch.commit();
  log('Rollback complete.');
}

async function main() {
  const admin = initFirebaseAdmin();
  const db = admin.firestore();

  if (ROLLBACK_IDX !== -1) {
    return rollback(db, admin, path.resolve(process.argv[ROLLBACK_IDX + 1]));
  }

  const payload = JSON.parse(fs.readFileSync(PAYLOAD, 'utf8'));
  if (payload.length !== 100) {
    throw new Error(`Expected 100 questions in the payload, found ${payload.length}. Run build-payload.py.`);
  }

  // ---- 1. survey what is there now --------------------------------------
  const existing = await findExisting(db);
  const alreadyMine = existing.filter((q) => q.authoringSet === AUTHORING_SET);
  const retirable = existing.filter(
    (q) => q.authoringSet !== AUTHORING_SET
      && q.usageContext !== 'retired'
      && (INCLUDE_EXAM || q.usageContext !== 'exam')
  );
  const skippedExam = existing.filter((q) => q.usageContext === 'exam');

  log('\n=== EXISTING INFERENCES QUESTIONS ===');
  log(`  total found                 : ${existing.length}`);
  log(`  already from ${AUTHORING_SET} : ${alreadyMine.length}`);
  log(`  already retired             : ${existing.filter((q) => q.usageContext === 'retired').length}`);
  log(`  attached to practice exams  : ${skippedExam.length}${INCLUDE_EXAM ? ' (WILL be retired: --include-exam)' : ' (left alone)'}`);
  log(`  --> to retire               : ${retirable.length}`);
  const byDiff = {};
  retirable.forEach((q) => { byDiff[q.difficulty || '(none)'] = (byDiff[q.difficulty || '(none)'] || 0) + 1; });
  log(`      by difficulty           : ${JSON.stringify(byDiff)}`);

  log('\n=== NEW QUESTIONS TO IMPORT ===');
  const newByDiff = {};
  payload.forEach((q) => { newByDiff[q.difficulty] = (newByDiff[q.difficulty] || 0) + 1; });
  log(`  count                       : ${payload.length}`);
  log(`  by difficulty               : ${JSON.stringify(newByDiff)}`);
  log(`  subcategory / id            : ${payload[0].subcategory} / ${payload[0].subcategoryId}`);
  log(`  usageContext                : ${payload[0].usageContext}`);

  if (alreadyMine.length > 0 && !IMPORT_ONLY) {
    log(`\n!! ${alreadyMine.length} questions from ${AUTHORING_SET} are already in the bank.`);
    log('   Re-running would duplicate them. Roll back the previous run first, or use --retire-only.');
    if (!DRY_RUN) process.exit(1);
  }

  if (DRY_RUN) {
    log('\n--dry-run: nothing written. Sample of what would be retired:');
    retirable.slice(0, 3).forEach((q) => log(`   ${q.id}  [${q.difficulty}]  ${String(q.text).slice(0, 90)}...`));
    return;
  }

  // ---- 2. back up --------------------------------------------------------
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `inferences-refresh-${stamp}.json`);
  const backup = { createdAt: new Date().toISOString(), authoringSet: AUTHORING_SET, retired: retirable, imported: [] };
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 1));
  log(`\nBackup written: ${backupPath}`);

  // ---- 3. retire ---------------------------------------------------------
  if (!IMPORT_ONLY) {
    let batch = db.batch(); let n = 0;
    for (const q of retirable) {
      batch.update(db.collection('questions').doc(q.id), {
        previousUsageContext: q.usageContext === undefined ? null : q.usageContext,
        usageContext: 'retired',
        retiredAt: admin.firestore.FieldValue.serverTimestamp(),
        retiredReason: `superseded by ${AUTHORING_SET}`,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
    }
    await batch.commit();
    log(`Retired ${retirable.length} questions.`);
  }

  // ---- 4. import ---------------------------------------------------------
  if (!RETIRE_ONLY) {
    const ids = [];
    let batch = db.batch(); let n = 0;
    for (const q of payload) {
      const ref = db.collection('questions').doc();
      batch.set(ref, {
        ...q,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      ids.push(ref.id);
      if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
    }
    await batch.commit();
    backup.imported = ids;
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 1));
    log(`Imported ${ids.length} questions.`);
  }

  // ---- 5. verify ---------------------------------------------------------
  const after = await findExisting(db);
  const live = after.filter((q) => !q.usageContext || q.usageContext === 'general');
  const liveByDiff = {};
  live.forEach((q) => { liveByDiff[q.difficulty] = (liveByDiff[q.difficulty] || 0) + 1; });
  log('\n=== AFTER ===');
  log(`  Inferences questions SmartQuiz will now serve: ${live.length}`);
  log(`  by difficulty: ${JSON.stringify(liveByDiff)}`);
  log(`\nRollback with:\n  node scripts/retireAndImportInferences.js --rollback ${backupPath}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
