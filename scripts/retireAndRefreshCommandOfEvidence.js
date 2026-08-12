#!/usr/bin/env node
/**
 * Retire the existing Command of Evidence bank questions and import the 2026 refresh set.
 * Sibling of scripts/retireAndRefreshWordsInContext.js — same commands, same conventions.
 *
 * Everything is a DRY RUN unless you pass --apply.
 *
 *   node scripts/retireAndRefreshCommandOfEvidence.js --status
 *   node scripts/retireAndRefreshCommandOfEvidence.js --retire   [--apply]
 *   node scripts/retireAndRefreshCommandOfEvidence.js --import   [--apply]
 *   node scripts/retireAndRefreshCommandOfEvidence.js --rollback scripts/backups/<file>.json [--apply]
 *
 * Recommended order for a clean cutover:
 *   1. --status              see what is in the pool today
 *   2. --retire --apply      flips the old CoE set to usageContext:'retired'
 *   3. --import --apply      adds the 100 new questions (usageContext:'general' in the file)
 *   4. --status              confirm 100 general / N retired
 *
 * Retirement is reversible: every changed doc is written to scripts/backups/ first, and
 * --rollback restores the previous usageContext values from that file. Rolling back an
 * import backup (a list of created ids) deletes the created docs.
 *
 * Retired docs stay in the collection so questionStats, past responses, and coach history
 * keep resolving — getQuestionsBySubcategory() excludes them from every new quiz both in
 * the narrowed Firestore query (usageContext == 'general') and in its client-side filter.
 *
 * Exam-attached questions (examId / moduleId / originalExam / practiceExamId) are left
 * alone: they belong to fixed forms. They are reported by --status.
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');

const SUBCATEGORY = 'command-of-evidence';
const SUBCATEGORY_TITLE = 'Command of Evidence';
const SUBCATEGORY_ID = 3;
const RETIRED_CONTEXT = 'retired';
const CONTENT_SET = 'coe-refresh-2026-08';
const IMPORT_FILE = path.resolve(__dirname, 'data/coe-refresh-2026/coe-questions.json');
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

function writeBackup(label, rows) {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const file = path.join(BACKUP_DIR, `${label}-${stamp()}.json`);
  fs.writeFileSync(file, JSON.stringify(rows, null, 1));
  log(`  backup -> ${path.relative(process.cwd(), file)}`);
  return file;
}

async function commitUpdates(db, updates) {
  let written = 0;
  for (const group of chunk(updates, 400)) {
    const batch = db.batch();
    group.forEach(({ id, data }) => batch.update(db.collection('questions').doc(id), data));
    await batch.commit();
    written += group.length;
    log(`    committed ${written}/${updates.length}`);
  }
  return written;
}

/** Every doc that belongs to Command of Evidence, across all the field spellings in use. */
async function fetchCoeDocs(db) {
  const found = new Map();
  const queries = [
    db.collection('questions').where('subcategory', '==', SUBCATEGORY),
    db.collection('questions').where('subcategory', '==', SUBCATEGORY_TITLE),
    db.collection('questions').where('subCategory', '==', SUBCATEGORY),
    db.collection('questions').where('subcategoryId', '==', SUBCATEGORY_ID),
  ];
  for (const q of queries) {
    const snap = await q.get();
    snap.forEach((d) => found.set(d.id, { id: d.id, ...d.data() }));
  }
  return [...found.values()];
}

const isExamAttached = (d) =>
  Boolean(d.examId || d.moduleId || d.originalExam || d.practiceExamId);

// ------------------------------------------------------------------- status

async function cmdStatus(db) {
  const docs = await fetchCoeDocs(db);
  const by = (fn) =>
    docs.reduce((a, d) => {
      const k = fn(d) ?? '(missing)';
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {});

  log(`\nCommand of Evidence docs found: ${docs.length}`);
  log('  usageContext   ', JSON.stringify(by((d) => d.usageContext || '(missing)')));
  log('  difficulty     ', JSON.stringify(by((d) => d.difficulty || '(missing)')));
  log('  contentSet     ', JSON.stringify(by((d) => d.contentSetVersion || '(none)')));
  log('  exam-attached  ', docs.filter(isExamAttached).length);

  const live = docs.filter(
    (d) => (!d.usageContext || d.usageContext === 'general') && d.retired !== true && !isExamAttached(d)
  );
  log(`  live in the practice pool now: ${live.length}`);
  log(
    '    of which new set             :',
    live.filter((d) => d.contentSetVersion === CONTENT_SET).length
  );

  // NOTE: deliberately no full-collection scan here. A `questions` full get() costs one
  // read per document in the bank and can exhaust the free-tier daily read quota in a
  // single run (which takes the live site down with it). The WIC-era backfill already
  // gave every doc a usageContext; spot-check with --deep-scan only if you must, and
  // only on a Blaze-plan project.
  if (has('--deep-scan')) {
    const missingCtx = await db
      .collection('questions')
      .get()
      .then((s) => s.docs.filter((d) => !d.data().usageContext).length);
    log(`  question docs anywhere in the bank with no usageContext: ${missingCtx}`);
  }
  log('');
}

// ------------------------------------------------------------------- retire

async function cmdRetire(db) {
  const admin = initFirebaseAdmin();
  const docs = await fetchCoeDocs(db);
  const newSet = docs.filter((d) => d.contentSetVersion === CONTENT_SET);
  const examAttached = docs.filter((d) => !newSet.includes(d) && isExamAttached(d));
  const targets = docs.filter(
    (d) =>
      !newSet.includes(d) &&
      !examAttached.includes(d) &&
      (!d.usageContext || d.usageContext === 'general')
  );

  log(`\nCommand of Evidence docs found: ${docs.length}`);
  log(`  belonging to the new set (${CONTENT_SET}), left alone: ${newSet.length}`);
  log(`  attached to a practice exam, left alone: ${examAttached.length}`);
  log(`  already retired or exam-only context: ${docs.length - newSet.length - examAttached.length - targets.length}`);
  log(`  to retire: ${targets.length}`);
  const byDiff = targets.reduce((a, d) => {
    a[d.difficulty || '(missing)'] = (a[d.difficulty || '(missing)'] || 0) + 1;
    return a;
  }, {});
  log(`  by difficulty: ${JSON.stringify(byDiff)}`);
  if (!targets.length) return log('Nothing to retire.\n');

  writeBackup(
    'coe-retire',
    targets.map((d) => ({
      id: d.id,
      previousUsageContext: d.usageContext || null,
      previousRetired: d.retired ?? null,
    }))
  );

  if (!APPLY) {
    return log(`DRY RUN — would set usageContext:'${RETIRED_CONTEXT}' on ${targets.length} docs. Re-run with --apply.\n`);
  }

  const written = await commitUpdates(
    db,
    targets.map((d) => ({
      id: d.id,
      data: {
        usageContext: RETIRED_CONTEXT,
        retired: true,
        retiredAt: admin.firestore.FieldValue.serverTimestamp(),
        retiredReason: `superseded by ${CONTENT_SET}`,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    }))
  );
  log(`Retired ${written} docs.\n`);
}

// ------------------------------------------------------------------- import

async function cmdImport(db) {
  const admin = initFirebaseAdmin();
  if (!fs.existsSync(IMPORT_FILE)) {
    throw new Error(`Import file not found: ${IMPORT_FILE}\nRun: node scripts/data/coe-refresh-2026/build-coe-questions.js`);
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
    if (q.usageContext !== 'general') problems.push(`#${i + 1}: usageContext is "${q.usageContext}"`);
    if (q.contentSetVersion !== CONTENT_SET) problems.push(`#${i + 1}: contentSetVersion is "${q.contentSetVersion}"`);
    if (!q.explanation) problems.push(`#${i + 1}: missing explanation`);
  });
  if (problems.length) {
    console.error('Import file failed validation:\n' + problems.map((p) => '  ✗ ' + p).join('\n'));
    process.exit(1);
  }

  // De-duplicate on authoringRef first (stable across edits), then passage.
  const existing = await fetchCoeDocs(db);
  const seenRefs = new Set(existing.map((d) => d.authoringRef).filter(Boolean));
  const seenPassages = new Set(existing.map((d) => (d.passage || '').trim()));
  const fresh = incoming.filter(
    (q) => !seenRefs.has(q.authoringRef) && !seenPassages.has(q.passage.trim())
  );

  log(`\nImport file: ${path.relative(process.cwd(), IMPORT_FILE)}`);
  log(`  questions in file      : ${incoming.length}`);
  log(`  already in Firestore   : ${incoming.length - fresh.length}`);
  log(`  to add                 : ${fresh.length}`);
  const byDiff = fresh.reduce((a, q) => { a[q.difficulty] = (a[q.difficulty] || 0) + 1; return a; }, {});
  log(`  by difficulty          : ${JSON.stringify(byDiff)}`);
  log(`  with charts            : ${fresh.filter((q) => q.graphUrl).length}`);
  if (!fresh.length) return log('Nothing to add.\n');

  if (!APPLY) {
    return log(`DRY RUN — would create ${fresh.length} documents in "questions". Re-run with --apply.\n`);
  }

  const createdIds = [];
  for (const group of chunk(fresh, 200)) {
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
  writeBackup('coe-import-created-ids', createdIds);
  log(`Imported ${createdIds.length} questions.\n`);
}

// ------------------------------------------------------------------- rollback

async function cmdRollback(db, file) {
  const resolved = path.resolve(process.cwd(), file);
  if (!fs.existsSync(resolved)) throw new Error(`Backup not found: ${resolved}`);
  const rows = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (!Array.isArray(rows) || !rows.length) throw new Error('Backup file is empty');

  if (typeof rows[0] === 'string') {
    log(`\nThis backup lists ${rows.length} created document ids. Rolling back deletes them.`);
    if (!APPLY) return log(`DRY RUN — would delete ${rows.length} documents. Re-run with --apply.\n`);
    let n = 0;
    for (const group of chunk(rows, 400)) {
      const batch = db.batch();
      group.forEach((id) => batch.delete(db.collection('questions').doc(id)));
      await batch.commit();
      n += group.length;
      log(`    deleted ${n}/${rows.length}`);
    }
    return log(`Deleted ${n} documents.\n`);
  }

  log(`\nThis backup holds previous usageContext for ${rows.length} docs. Rolling back restores them.`);
  if (!APPLY) return log(`DRY RUN — would restore ${rows.length} docs. Re-run with --apply.\n`);
  const admin = initFirebaseAdmin();
  const written = await commitUpdates(
    db,
    rows.map((r) => ({
      id: r.id,
      data: {
        usageContext: r.previousUsageContext,
        retired: r.previousRetired ?? false,
        retiredAt: admin.firestore.FieldValue.delete(),
        retiredReason: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    }))
  );
  log(`Restored ${written} docs.\n`);
}

// ------------------------------------------------------------------- main

async function main() {
  const admin = initFirebaseAdmin();
  const db = admin.firestore();

  log(APPLY ? '=== APPLY ===' : '=== DRY RUN (pass --apply to write) ===');

  if (has('--status')) return cmdStatus(db);
  if (has('--retire')) return cmdRetire(db);
  if (has('--import')) return cmdImport(db);
  if (has('--rollback')) return cmdRollback(db, valueOf('--rollback'));

  log('\nUsage:');
  log('  node scripts/retireAndRefreshCommandOfEvidence.js --status');
  log('  node scripts/retireAndRefreshCommandOfEvidence.js --retire [--apply]');
  log('  node scripts/retireAndRefreshCommandOfEvidence.js --import [--apply]');
  log('  node scripts/retireAndRefreshCommandOfEvidence.js --rollback scripts/backups/<file>.json [--apply]\n');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
