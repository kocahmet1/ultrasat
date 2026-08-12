#!/usr/bin/env node
/**
 * Retire the existing Words-in-Context bank questions and import the 2026 refresh set.
 *
 * Everything is a DRY RUN unless you pass --apply.
 *
 *   node scripts/retireAndRefreshWordsInContext.js --status
 *   node scripts/retireAndRefreshWordsInContext.js --backfill-usage-context [--apply]
 *   node scripts/retireAndRefreshWordsInContext.js --retire                 [--apply]
 *   node scripts/retireAndRefreshWordsInContext.js --import                 [--apply]
 *   node scripts/retireAndRefreshWordsInContext.js --rollback scripts/backups/<file>.json [--apply]
 *
 * Recommended order for a clean cutover:
 *   1. --status                       see what is in the pool today
 *   2. --backfill-usage-context --apply
 *      Gives every question doc an explicit usageContext, which is what lets
 *      getQuestionsBySubcategory() exclude retired items at the Firestore level instead of
 *      after the limit(50) fetch. Without this, docs missing the field disappear from the
 *      narrowed query.
 *   3. --retire --apply               flips the old WIC set to usageContext:'retired'
 *   4. --import --apply               adds the 100 new questions
 *   5. --status                       confirm 100 general / N retired
 *
 * Retirement is reversible: every changed doc is written to scripts/backups/ first, and
 * --rollback restores the previous usageContext values from that file.
 *
 * Firestore index note: the narrowed query needs a composite index on
 *   questions: subcategory ASC, difficulty ASC, usageContext ASC
 * Deploy it before step 3, or the client falls back to the old un-narrowed query.
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');

const SUBCATEGORY = 'words-in-context';
const SUBCATEGORY_ID = 4;
const RETIRED_CONTEXT = 'retired';
const CONTENT_SET = 'wic-refresh-2026-08';
const IMPORT_FILE = path.resolve(__dirname, 'data/wic-refresh-2026/words-in-context-100.json');
const BACKUP_DIR = path.resolve(__dirname, 'backups');

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? null : argv[i + 1];
};
const APPLY = has('--apply');

const log = (...a) => console.log(...a);
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/** Every doc that belongs to Words in Context, across all the field spellings in use. */
async function fetchWordsInContextDocs(db) {
  const found = new Map();
  const queries = [
    db.collection('questions').where('subcategory', '==', SUBCATEGORY),
    db.collection('questions').where('subcategory', '==', `${SUBCATEGORY}-retired`),
    db.collection('questions').where('subcategory', '==', 'Words in Context'),
    db.collection('questions').where('subCategory', '==', SUBCATEGORY),
    db.collection('questions').where('subcategoryId', '==', SUBCATEGORY_ID),
  ];
  for (const q of queries) {
    const snap = await q.get();
    snap.forEach((d) => found.set(d.id, { id: d.id, ...d.data() }));
  }
  return [...found.values()];
}

async function commitUpdates(db, updates) {
  let written = 0;
  for (const batchItems of chunk(updates, 400)) {
    const batch = db.batch();
    batchItems.forEach(({ id, data }) => batch.update(db.collection('questions').doc(id), data));
    await batch.commit();
    written += batchItems.length;
    log(`    committed ${written}/${updates.length}`);
  }
  return written;
}

function writeBackup(name, payload) {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const file = path.join(BACKUP_DIR, `${name}-${stamp()}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  log(`  backup written: ${path.relative(process.cwd(), file)}`);
  return file;
}

// ---------------------------------------------------------------------- status

async function cmdStatus(db) {
  const docs = await fetchWordsInContextDocs(db);
  const by = (fn) => docs.reduce((acc, d) => {
    const k = fn(d);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  log(`\nWords in Context — ${docs.length} documents in the questions collection\n`);
  log('  usageContext   ', JSON.stringify(by((d) => d.usageContext || '(missing)')));
  log('  difficulty     ', JSON.stringify(by((d) => d.difficulty || '(missing)')));
  log('  source         ', JSON.stringify(by((d) => d.source || '(missing)')));
  log('  contentSet     ', JSON.stringify(by((d) => d.contentSetVersion || '(none)')));

  const live = docs.filter((d) => !d.usageContext || d.usageContext === 'general');
  const liveByDiff = live.reduce((a, d) => {
    a[d.difficulty || '(missing)'] = (a[d.difficulty || '(missing)'] || 0) + 1;
    return a;
  }, {});
  log(`\n  live Smart Quiz pool: ${live.length}  ${JSON.stringify(liveByDiff)}`);

  const missingCtx = await db.collection('questions').get()
    .then((s) => s.docs.filter((d) => !d.data().usageContext).length);
  log(`  question docs anywhere in the bank with no usageContext: ${missingCtx}`);
  if (missingCtx > 0) {
    log('  → run --backfill-usage-context --apply before relying on the narrowed query.');
  }
  log('');
}

// ------------------------------------------------------- backfill usageContext

async function cmdBackfillUsageContext(db) {
  const snap = await db.collection('questions').get();
  const missing = snap.docs.filter((d) => !d.data().usageContext);
  log(`\nQuestion docs missing usageContext: ${missing.length} of ${snap.size}`);
  if (!missing.length) return log('Nothing to do.\n');

  writeBackup('usagecontext-backfill', missing.map((d) => ({ id: d.id, usageContext: null })));

  if (!APPLY) {
    log(`DRY RUN — would set usageContext:'general' on ${missing.length} docs. Re-run with --apply.\n`);
    return;
  }
  const written = await commitUpdates(db, missing.map((d) => ({ id: d.id, data: { usageContext: 'general' } })));
  log(`Set usageContext:'general' on ${written} docs.\n`);
}

// --------------------------------------------------------------------- retire

async function cmdRetire(db) {
  const admin = initFirebaseAdmin();
  const docs = await fetchWordsInContextDocs(db);
  const targets = docs.filter(
    (d) => (!d.usageContext || d.usageContext === 'general') && d.contentSetVersion !== CONTENT_SET
  );

  log(`\nWords in Context documents: ${docs.length}`);
  log(`  already retired or exam-only: ${docs.length - targets.length - docs.filter((d) => d.contentSetVersion === CONTENT_SET).length}`);
  log(`  belonging to the new set (${CONTENT_SET}), left alone: ${docs.filter((d) => d.contentSetVersion === CONTENT_SET).length}`);
  log(`  to retire: ${targets.length}`);
  if (!targets.length) return log('Nothing to retire.\n');

  writeBackup(
    'wic-retire',
    targets.map((d) => ({
      id: d.id,
      previousUsageContext: d.usageContext || null,
      previousSubcategory: d.subcategory || null,
      previousSubCategory: d.subCategory || null,
      difficulty: d.difficulty || null,
      text: (d.text || '').slice(0, 120),
      passage: (d.passage || '').slice(0, 200),
    }))
  );

  if (!APPLY) {
    log(`DRY RUN — would set usageContext:'${RETIRED_CONTEXT}' + subcategory:'${SUBCATEGORY}-retired' on ${targets.length} docs. Re-run with --apply.\n`);
    return;
  }
  // The subcategory rename matters for clients running the PREVIOUS web bundle: their query
  // is where('subcategory','==','words-in-context') + limit(50) with usageContext filtered
  // client-side, so retired docs keeping the old value would still consume fetch-window
  // slots and could starve the live pool. Renaming removes them from that query entirely.
  // Fully reversible via --rollback (previous values are in the backup above).
  const written = await commitUpdates(db, targets.map((d) => ({
    id: d.id,
    data: {
      usageContext: RETIRED_CONTEXT,
      subcategory: `${SUBCATEGORY}-retired`,
      subCategory: `${SUBCATEGORY}-retired`,
      retired: true,
      retiredAt: admin.firestore.FieldValue.serverTimestamp(),
      retiredReason: `superseded by ${CONTENT_SET}`,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  })));
  log(`Retired ${written} Words in Context questions.\n`);
}

// --------------------------------------------------------------------- import

async function cmdImport(db) {
  const admin = initFirebaseAdmin();
  if (!fs.existsSync(IMPORT_FILE)) {
    throw new Error(`Import file not found: ${IMPORT_FILE}\nRun: node scripts/data/wic-refresh-2026/build.js`);
  }
  const incoming = JSON.parse(fs.readFileSync(IMPORT_FILE, 'utf8'));
  if (!Array.isArray(incoming) || !incoming.length) throw new Error('Import file is not a non-empty array');

  // Validate before touching Firestore.
  const problems = [];
  incoming.forEach((q, i) => {
    if (!q.text) problems.push(`#${i + 1}: missing text`);
    if (!q.passage) problems.push(`#${i + 1}: missing passage`);
    if (!Array.isArray(q.options) || q.options.length !== 4) problems.push(`#${i + 1}: needs 4 options`);
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) problems.push(`#${i + 1}: bad correctAnswer`);
    if (q.subcategory !== SUBCATEGORY) problems.push(`#${i + 1}: subcategory is "${q.subcategory}"`);
    if (!q.explanation) problems.push(`#${i + 1}: missing explanation`);
  });
  if (problems.length) {
    console.error('Import file failed validation:\n' + problems.map((p) => '  ✗ ' + p).join('\n'));
    process.exit(1);
  }

  // De-duplicate on passage, not on `text` — every completion item shares the same stem,
  // so a text-equality check (which is what the /api/questions/import endpoint uses) would
  // reject 99 of the 100.
  const existing = await fetchWordsInContextDocs(db);
  const seenPassages = new Set(existing.map((d) => (d.passage || '').trim()));
  const fresh = incoming.filter((q) => !seenPassages.has(q.passage.trim()));

  log(`\nImport file: ${path.relative(process.cwd(), IMPORT_FILE)}`);
  log(`  questions in file      : ${incoming.length}`);
  log(`  already in Firestore   : ${incoming.length - fresh.length}`);
  log(`  to add                 : ${fresh.length}`);
  const byDiff = fresh.reduce((a, q) => { a[q.difficulty] = (a[q.difficulty] || 0) + 1; return a; }, {});
  log(`  by difficulty          : ${JSON.stringify(byDiff)}`);
  if (!fresh.length) return log('Nothing to add.\n');

  if (!APPLY) {
    log(`DRY RUN — would create ${fresh.length} documents in "questions". Re-run with --apply.\n`);
    return;
  }

  const createdIds = [];
  for (const group of chunk(fresh, 400)) {
    const batch = db.batch();
    group.forEach((q) => {
      const ref = db.collection('questions').doc();
      createdIds.push(ref.id);
      batch.set(ref, {
        ...q,
        retired: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
    log(`    committed ${createdIds.length}/${fresh.length}`);
  }
  writeBackup('wic-import-created-ids', createdIds);
  log(`Imported ${createdIds.length} questions.\n`);
}

// -------------------------------------------------------------------- rollback

async function cmdRollback(db, file) {
  const admin = initFirebaseAdmin();
  const resolved = path.resolve(process.cwd(), file);
  if (!fs.existsSync(resolved)) throw new Error(`Backup not found: ${resolved}`);
  const rows = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (!Array.isArray(rows) || !rows.length) throw new Error('Backup file is empty');

  if (typeof rows[0] === 'string') {
    log(`\nThis backup lists ${rows.length} created document ids. Rolling back deletes them.`);
    if (!APPLY) return log(`DRY RUN — would delete ${rows.length} documents. Re-run with --apply.\n`);
    for (const group of chunk(rows, 400)) {
      const batch = db.batch();
      group.forEach((id) => batch.delete(db.collection('questions').doc(id)));
      await batch.commit();
    }
    return log(`Deleted ${rows.length} imported documents.\n`);
  }

  log(`\nRestoring usageContext/subcategory on ${rows.length} documents from ${path.basename(resolved)}`);
  if (!APPLY) return log(`DRY RUN — re-run with --apply.\n`);
  const written = await commitUpdates(db, rows.map((r) => ({
    id: r.id,
    data: {
      usageContext: r.previousUsageContext || 'general',
      subcategory: r.previousSubcategory || SUBCATEGORY,
      subCategory: r.previousSubCategory || SUBCATEGORY,
      retired: admin.firestore.FieldValue.delete(),
      retiredAt: admin.firestore.FieldValue.delete(),
      retiredReason: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  })));
  log(`Restored ${written} documents.\n`);
}

// ------------------------------------------------------------------------ main

(async () => {
  const admin = initFirebaseAdmin();
  const db = admin.firestore();

  if (!APPLY) log('\n*** DRY RUN — nothing will be written. Add --apply to commit. ***');

  if (has('--status')) await cmdStatus(db);
  else if (has('--backfill-usage-context')) await cmdBackfillUsageContext(db);
  else if (has('--retire')) await cmdRetire(db);
  else if (has('--import')) await cmdImport(db);
  else if (has('--rollback')) await cmdRollback(db, valueOf('--rollback'));
  else {
    log(`
Usage:
  node scripts/retireAndRefreshWordsInContext.js --status
  node scripts/retireAndRefreshWordsInContext.js --backfill-usage-context [--apply]
  node scripts/retireAndRefreshWordsInContext.js --retire                 [--apply]
  node scripts/retireAndRefreshWordsInContext.js --import                 [--apply]
  node scripts/retireAndRefreshWordsInContext.js --rollback <backup.json> [--apply]
`);
  }
  process.exit(0);
})().catch((e) => {
  console.error('\nFailed:', e.message);
  process.exit(1);
});
