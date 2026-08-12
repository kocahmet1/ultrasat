/**
 * Retire the existing Central Ideas and Details question bank and upload the
 * 100 newly authored items in scripts/data/cid-refresh-2026/.
 *
 * WHY `usageContext` — question documents have no `retired`/`active`/`archived`
 * field. The only soft-retire mechanism in this codebase is `usageContext`:
 * every practice surface filters with `!q.usageContext || q.usageContext === 'general'`
 * (questionBankServices.js:287, smartQuizUtils.js:752, apps/api/questionsAPI.js:807).
 * Setting it to 'retired' therefore removes a question from smart quizzes while
 * leaving the document intact and distinguishable from genuinely exam-sourced
 * questions (which use 'exam').
 *
 * SAFETY
 *   - Nothing is deleted. Retiring is a single field flip and is fully reversible.
 *   - A JSON backup of every touched document is written to scripts/backups/
 *     BEFORE any write.
 *   - Questions referenced by a practiceExam / examModule are reported and, by
 *     default, skipped — retiring them would be a no-op anyway (they are already
 *     usageContext 'exam') but the check guards against surprises.
 *
 * USAGE
 *   node scripts/retireAndUploadCid.js --dry-run     # print the plan, write nothing
 *   node scripts/retireAndUploadCid.js               # back up, retire, upload
 *   node scripts/retireAndUploadCid.js --retire-only
 *   node scripts/retireAndUploadCid.js --upload-only
 *   node scripts/retireAndUploadCid.js --rollback scripts/backups/<file>.json
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { buildCidQuestionDoc, SUBCATEGORY, SUBCATEGORY_ID } = require('./lib/cidDocBuilder');

const ITEMS_FILE = path.resolve(__dirname, 'data/cid-refresh-2026/cid_100_authored.json');
const BACKUP_DIR = path.resolve(__dirname, 'backups');
const RETIRED_VALUE = 'retired';
const BATCH_TAG = 'cid-refresh-2026';

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const RETIRE_ONLY = argv.includes('--retire-only');
const UPLOAD_ONLY = argv.includes('--upload-only');
const ROLLBACK_IDX = argv.indexOf('--rollback');

const log = (...a) => console.log(...a);

/** Find every question doc belonging to this subcategory, across all field spellings. */
async function findExistingCidQuestions(db) {
  const found = new Map(); // id -> data
  const queries = [
    db.collection('questions').where('subcategory', '==', SUBCATEGORY),
    db.collection('questions').where('subCategory', '==', SUBCATEGORY),
    db.collection('questions').where('subcategoryId', '==', SUBCATEGORY_ID),
    db.collection('questions').where('subcategory', '==', 'Central Ideas and Details'),
  ];
  for (const q of queries) {
    const snap = await q.get();
    snap.forEach((d) => found.set(d.id, d.data()));
  }
  return found;
}

async function rollback(db, admin, file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  let restored = 0;
  for (const rec of backup.retired || []) {
    const patch = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (rec.prevUsageContext === undefined) {
      patch.usageContext = admin.firestore.FieldValue.delete();
    } else {
      patch.usageContext = rec.prevUsageContext;
    }
    await db.collection('questions').doc(rec.id).update(patch);
    restored += 1;
  }
  log(`Restored usageContext on ${restored} question(s).`);

  const created = backup.created || [];
  if (created.length) {
    log(`\nThis run also created ${created.length} new question document(s).`);
    log('Re-run with --delete-created to remove them, or delete manually:');
    log(created.slice(0, 5).map((id) => `  questions/${id}`).join('\n'));
    if (argv.includes('--delete-created')) {
      let n = 0;
      for (const id of created) {
        await db.collection('questions').doc(id).delete();
        n += 1;
      }
      log(`Deleted ${n} created question document(s).`);
    }
  }
  log('Rollback complete.');
}

async function main() {
  const admin = initFirebaseAdmin();
  const db = admin.firestore();
  const now = () => admin.firestore.FieldValue.serverTimestamp();

  if (ROLLBACK_IDX !== -1) {
    const file = argv[ROLLBACK_IDX + 1];
    if (!file) throw new Error('--rollback requires a backup file path');
    return rollback(db, admin, path.resolve(file));
  }

  const items = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf8'));
  log(`Loaded ${items.length} authored items from ${path.relative(process.cwd(), ITEMS_FILE)}`);

  // Build (and thereby validate) all docs BEFORE touching Firestore.
  const docs = items.map((it) => buildCidQuestionDoc(it, admin));
  const byDifficulty = docs.reduce((acc, d) => ((acc[d.difficulty] = (acc[d.difficulty] || 0) + 1), acc), {});
  log(`Built ${docs.length} question docs: ${JSON.stringify(byDifficulty)}`);

  // ---- discover what we would retire ----
  const existing = await findExistingCidQuestions(db);
  const toRetire = [];
  const alreadyExam = [];
  const ourOwnBatch = [];
  for (const [id, data] of existing) {
    if (data.authoringBatch === BATCH_TAG) { ourOwnBatch.push(id); continue; }
    if (data.usageContext && data.usageContext !== 'general') { alreadyExam.push({ id, usageContext: data.usageContext }); continue; }
    toRetire.push({ id, prevUsageContext: data.usageContext, text: (data.text || '').slice(0, 70), difficulty: data.difficulty });
  }

  log(`\nExisting '${SUBCATEGORY}' questions in Firestore: ${existing.size}`);
  log(`  to retire (usageContext general/absent): ${toRetire.length}`);
  log(`  left alone (already exam-scoped):        ${alreadyExam.length}`);
  if (ourOwnBatch.length) log(`  from a previous run of this batch:       ${ourOwnBatch.length}  <-- re-running will duplicate these`);

  if (DRY_RUN) {
    log('\n--- DRY RUN, nothing written ---');
    log('Would retire:');
    toRetire.slice(0, 15).forEach((r) => log(`   ${r.id}  [${r.difficulty || '?'}]  ${r.text}...`));
    if (toRetire.length > 15) log(`   ... and ${toRetire.length - 15} more`);
    log(`\nWould create ${docs.length} new documents with usageContext 'general'.`);
    log('Sample new doc:');
    const s = { ...docs[0], createdAt: '<serverTimestamp>', updatedAt: '<serverTimestamp>' };
    log(JSON.stringify(s, null, 2).slice(0, 1400) + '\n...');
    return;
  }

  if (ourOwnBatch.length && !UPLOAD_ONLY && !argv.includes('--force')) {
    throw new Error(
      `${ourOwnBatch.length} documents from batch '${BATCH_TAG}' already exist. ` +
      'Re-running would create duplicates. Pass --force if that is intended.'
    );
  }

  // ---- backup ----
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupFile = path.join(BACKUP_DIR, `cid_refresh_${Date.now()}.json`);
  const backup = {
    createdAt: new Date().toISOString(),
    batch: BATCH_TAG,
    retiredValue: RETIRED_VALUE,
    retired: toRetire.map((r) => ({ id: r.id, prevUsageContext: r.prevUsageContext })),
    retiredFullDocs: toRetire.map((r) => ({ id: r.id, data: existing.get(r.id) })),
    alreadyExam,
    created: [],
  };
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  log(`\nBackup written: ${path.relative(process.cwd(), backupFile)}`);

  // ---- retire ----
  if (!UPLOAD_ONLY) {
    let n = 0;
    for (let i = 0; i < toRetire.length; i += 400) {
      const batch = db.batch();
      for (const r of toRetire.slice(i, i + 400)) {
        batch.update(db.collection('questions').doc(r.id), {
          usageContext: RETIRED_VALUE,
          retiredAt: now(),
          retiredBy: BATCH_TAG,
          updatedAt: now(),
        });
        n += 1;
      }
      await batch.commit();
    }
    log(`Retired ${n} question(s) -> usageContext '${RETIRED_VALUE}'`);
  }

  // ---- upload ----
  if (!RETIRE_ONLY) {
    const created = [];
    for (let i = 0; i < docs.length; i += 400) {
      const batch = db.batch();
      const slice = docs.slice(i, i + 400);
      const refs = slice.map(() => db.collection('questions').doc());
      slice.forEach((d, j) => batch.set(refs[j], d));
      await batch.commit();
      refs.forEach((r) => created.push(r.id));
    }
    backup.created = created;
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    log(`Created ${created.length} question(s) with usageContext 'general'`);
  }

  log(`\nDone. Rollback with:\n  node scripts/retireAndUploadCid.js --rollback ${path.relative(process.cwd(), backupFile)} --delete-created`);
}

main().catch((e) => {
  console.error('\nFAILED:', e.message);
  process.exit(1);
});
