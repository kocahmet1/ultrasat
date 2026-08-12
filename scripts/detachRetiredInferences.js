/**
 * Detach retired Inferences questions from the SmartQuiz candidate queries.
 *
 * WHY THIS EXISTS
 * The deployed SmartQuiz code (utils/smartQuizUtils.js) builds its candidate pool
 * from getQuestionsBySubcategory() and does NOT filter usageContext, so a soft
 * retire (usageContext: 'retired') alone does not remove a question from live
 * quizzes. This script makes retired questions invisible to those queries by
 * renaming the fields the queries match on:
 *
 *   subcategory:   'inferences'  -> 'retired-inferences'
 *   subCategory:   'inferences'  -> 'retired-inferences'
 *   subcategoryId: 2 / '2'       -> (deleted; preserved in retiredSubcategoryId)
 *
 * The documents keep their IDs, so past SmartQuiz sessions, review pages, and
 * userProgress rows still resolve. Quiz-level subcategory labels are stored on
 * the quiz documents themselves and are unaffected.
 *
 * A JSON backup of the original field values is written to scripts/backups/
 * before anything changes.
 *
 * Usage:
 *   node scripts/detachRetiredInferences.js --dry-run
 *   node scripts/detachRetiredInferences.js
 *   node scripts/detachRetiredInferences.js --from-backup scripts/backups/inferences-refresh-<ts>.json
 *   node scripts/detachRetiredInferences.js --rollback scripts/backups/inferences-detach-<ts>.json
 *
 * --from-backup drives the detach off the retire/import backup instead of
 * querying Firestore, so it costs zero reads — useful when the project's daily
 * read quota is exhausted. It only touches the docs that run retired.
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');

const BACKUP_DIR = path.resolve(__dirname, 'backups');
const DETACHED = 'retired-inferences';
const ALIASES = ['inferences', 'Inferences', 'inference', 'Inference'];

const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK_IDX = process.argv.indexOf('--rollback');
const FROM_BACKUP_IDX = process.argv.indexOf('--from-backup');

async function findRetired(db) {
  const found = new Map();
  const queries = [];
  for (const v of ALIASES) {
    queries.push(db.collection('questions').where('subcategory', '==', v).where('usageContext', '==', 'retired'));
    queries.push(db.collection('questions').where('subCategory', '==', v).where('usageContext', '==', 'retired'));
  }
  for (const idv of [2, '2']) {
    queries.push(db.collection('questions').where('subcategoryId', '==', idv).where('usageContext', '==', 'retired'));
  }
  let failures = 0;
  for (const q of queries) {
    try {
      (await q.get()).forEach((doc) => found.set(doc.id, { id: doc.id, ...doc.data() }));
    } catch (e) {
      failures += 1;
      if (e.code === 8 /* RESOURCE_EXHAUSTED */) {
        throw new Error(`Firestore quota exceeded while querying — aborting rather than acting on a partial result. (${e.message})`);
      }
      console.warn(`  query shape failed (${failures}): ${e.message.slice(0, 120)}`);
    }
  }
  if (failures === queries.length) {
    throw new Error('Every query shape failed — refusing to conclude "nothing to do".');
  }
  return [...found.values()];
}

async function rollback(db, admin, file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`Rolling back ${backup.detached.length} docs from ${path.basename(file)}`);
  let batch = db.batch(); let n = 0;
  for (const d of backup.detached) {
    const upd = {
      subcategory: d.subcategory,
      subCategory: d.subCategory === undefined ? admin.firestore.FieldValue.delete() : d.subCategory,
      subcategoryId: d.subcategoryId === undefined ? admin.firestore.FieldValue.delete() : d.subcategoryId,
      retiredSubcategoryId: admin.firestore.FieldValue.delete(),
      retiredDetached: admin.firestore.FieldValue.delete(),
    };
    batch.update(db.collection('questions').doc(d.id), upd);
    if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  await batch.commit();
  console.log('Rollback complete.');
}

async function main() {
  const admin = initFirebaseAdmin();
  const db = admin.firestore();

  if (ROLLBACK_IDX !== -1) return rollback(db, admin, path.resolve(process.argv[ROLLBACK_IDX + 1]));

  let retired;
  if (FROM_BACKUP_IDX !== -1) {
    const src = JSON.parse(fs.readFileSync(path.resolve(process.argv[FROM_BACKUP_IDX + 1]), 'utf8'));
    if (!Array.isArray(src.retired)) throw new Error('Backup file has no `retired` array — pass the inferences-refresh-* backup.');
    retired = src.retired.filter((q) => !ALIASES.includes(q.subcategory) ? ALIASES.includes(q.subCategory) || q.subcategoryId === 2 || q.subcategoryId === '2' : true);
    console.log(`Loaded ${retired.length} retired questions from backup (zero Firestore reads).`);
  } else {
    retired = await findRetired(db);
  }
  console.log(`Retired Inferences questions still attached to live queries: ${retired.length}`);
  if (retired.length === 0) { console.log('Nothing to do.'); return; }

  if (DRY_RUN) {
    retired.slice(0, 5).forEach((q) =>
      console.log(`  would detach ${q.id}  subcategory=${q.subcategory} subcategoryId=${JSON.stringify(q.subcategoryId)}`));
    console.log('--dry-run: nothing written.');
    return;
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `inferences-detach-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({
    createdAt: new Date().toISOString(),
    detached: retired.map((q) => ({
      id: q.id, subcategory: q.subcategory, subCategory: q.subCategory, subcategoryId: q.subcategoryId,
    })),
  }, null, 1));
  console.log(`Backup written: ${backupPath}`);

  let batch = db.batch(); let n = 0;
  for (const q of retired) {
    batch.update(db.collection('questions').doc(q.id), {
      subcategory: DETACHED,
      subCategory: DETACHED,
      subcategoryId: admin.firestore.FieldValue.delete(),
      retiredSubcategoryId: q.subcategoryId === undefined ? null : q.subcategoryId,
      retiredDetached: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  await batch.commit();
  console.log(`Detached ${retired.length} retired questions from live queries.`);
  console.log(`Rollback with:\n  node scripts/detachRetiredInferences.js --rollback ${backupPath}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
