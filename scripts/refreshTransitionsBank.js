/**
 * Retire the existing Transitions question bank and upload the 2026 refresh.
 *
 * Retirement is non-destructive: every existing question whose subcategory resolves to
 * "transitions" has its `usageContext` flipped to 'retired'. Because every practice surface
 * filters on `usageContext === 'general'` (or missing), a retired question stops appearing in
 * SmartQuizzes, the Practice Builder, and the diagnostic immediately, but its documents,
 * IDs, and any questionStats attached to it survive untouched.
 *
 *   smartQuizUtils.js:752      isGeneralUseQuestion
 *   questionBankServices.js:287
 *   apps/api/questionsAPI.js:807
 *   utils/diagnosticUtils.js:96,335
 *
 * Questions already flagged `usageContext: 'exam'` are LEFT ALONE — they belong to a
 * practice exam and are already excluded from practice surfaces.
 *
 * Usage:
 *   node scripts/refreshTransitionsBank.js --dry-run          # plan only, writes nothing
 *   node scripts/refreshTransitionsBank.js --retire-only      # retire, do not upload
 *   node scripts/refreshTransitionsBank.js --upload-only      # upload, do not retire
 *   node scripts/refreshTransitionsBank.js                    # retire + upload
 *   node scripts/refreshTransitionsBank.js --rollback scripts/backups/<file>.json
 *
 * A backup naming every touched document and its previous usageContext, plus the IDs of
 * every question created, is written to scripts/backups/ before anything changes.
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');

const SET_FILE = path.resolve(__dirname, 'data/trn-refresh-2026/transitions-100.json');
const BACKUP_DIR = path.resolve(__dirname, 'backups');
const RETIRED_VALUE = 'retired';
const CONTENT_SET_VERSION = 'trn-refresh-2026-08';

const DRY_RUN = process.argv.includes('--dry-run');
const RETIRE_ONLY = process.argv.includes('--retire-only');
const UPLOAD_ONLY = process.argv.includes('--upload-only');
const ROLLBACK_IDX = process.argv.indexOf('--rollback');

/** Every field variant the read paths query on. See questionBankServices.js:175-260. */
const isTransitions = (q) => {
  const vals = [q.subcategory, q.subCategory, q.skill, q.subskill]
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim().toLowerCase().replace(/[\s_]+/g, '-'));
  if (vals.includes('transitions')) return true;
  if (q.subcategoryId === 8 || q.subcategoryId === '8') return true;
  if (typeof q.categoryPath === 'string' && /\/transitions$/i.test(q.categoryPath.trim())) return true;
  if (Array.isArray(q.categoryPath) && q.categoryPath.some((c) => String(c).toLowerCase() === 'transitions')) return true;
  return false;
};

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

async function rollback(db, admin, file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ts = () => admin.firestore.FieldValue.serverTimestamp();

  if (backup.retired && backup.retired.length) {
    for (const group of chunk(backup.retired, 400)) {
      const batch = db.batch();
      group.forEach((r) => {
        const ref = db.collection('questions').doc(r.id);
        const del = admin.firestore.FieldValue.delete();
        const restore = {
          retired: del,
          retiredAt: del,
          retiredBy: del,
          updatedAt: ts(),
        };
        restore.usageContext =
          r.prevUsageContext === undefined || r.prevUsageContext === null ? del : r.prevUsageContext;
        batch.update(ref, restore);
      });
      await batch.commit();
    }
    console.log(`restored usageContext on ${backup.retired.length} question(s)`);
  }

  if (backup.created && backup.created.length) {
    for (const group of chunk(backup.created, 400)) {
      const batch = db.batch();
      group.forEach((id) => batch.delete(db.collection('questions').doc(id)));
      await batch.commit();
    }
    console.log(`deleted ${backup.created.length} uploaded question(s)`);
  }
  console.log('Rollback complete.');
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

  const backup = {
    createdAt: new Date().toISOString(),
    contentSetVersion: CONTENT_SET_VERSION,
    retiredValue: RETIRED_VALUE,
    retired: [],
    created: [],
  };

  // ------------------------------------------------------------------ retire
  if (!UPLOAD_ONLY) {
    console.log('Scanning the questions collection for Transitions items...');
    const snap = await db.collection('questions').get();
    const all = [];
    snap.forEach((d) => all.push({ id: d.id, ...d.data() }));

    const transitions = all.filter(isTransitions);
    const alreadyExam = transitions.filter((q) => q.usageContext === 'exam');
    const alreadyRetired = transitions.filter((q) => q.usageContext === RETIRED_VALUE);
    const toRetire = transitions.filter(
      (q) => q.usageContext !== 'exam' && q.usageContext !== RETIRED_VALUE
    );

    const byDifficulty = toRetire.reduce((acc, q) => {
      const d = q.difficulty || '(none)';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    console.log(`  scanned            ${all.length} questions`);
    console.log(`  matched Transitions ${transitions.length}`);
    console.log(`  already exam-only   ${alreadyExam.length}  (left alone)`);
    console.log(`  already retired     ${alreadyRetired.length}  (left alone)`);
    console.log(`  to retire           ${toRetire.length}`, JSON.stringify(byDifficulty));

    backup.retired = toRetire.map((q) => ({
      id: q.id,
      prevUsageContext: q.usageContext === undefined ? null : q.usageContext,
      difficulty: q.difficulty || null,
      textPreview: String(q.passage || q.text || '').slice(0, 80),
    }));

    if (!DRY_RUN && toRetire.length) {
      for (const group of chunk(toRetire, 400)) {
        const batch = db.batch();
        group.forEach((q) =>
          batch.update(db.collection('questions').doc(q.id), {
            usageContext: RETIRED_VALUE,
            // questionBankServices.js:324 filters on this flag independently of usageContext.
            retired: true,
            retiredAt: ts(),
            retiredBy: CONTENT_SET_VERSION,
            updatedAt: ts(),
          })
        );
        await batch.commit();
      }
      console.log(`  ✓ retired ${toRetire.length} question(s)`);
    }
  }

  // ------------------------------------------------------------------ upload
  if (!RETIRE_ONLY) {
    if (!fs.existsSync(SET_FILE)) {
      throw new Error(`Missing ${SET_FILE}. Run: node scripts/data/trn-refresh-2026/build.js`);
    }
    const items = JSON.parse(fs.readFileSync(SET_FILE, 'utf8'));
    if (items.length !== 100) throw new Error(`Expected 100 items, found ${items.length}`);

    const counts = items.reduce((a, q) => ((a[q.difficulty] = (a[q.difficulty] || 0) + 1), a), {});
    console.log(`\nUploading ${items.length} new Transitions questions`, JSON.stringify(counts));

    if (!DRY_RUN) {
      for (const group of chunk(items, 400)) {
        const batch = db.batch();
        group.forEach((q) => {
          const ref = db.collection('questions').doc();
          batch.set(ref, { ...q, createdAt: ts(), updatedAt: ts() });
          backup.created.push(ref.id);
        });
        await batch.commit();
      }
      console.log(`  ✓ created ${backup.created.length} question(s)`);
    }
  }

  // ------------------------------------------------------------------ backup
  if (!DRY_RUN) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const file = path.join(BACKUP_DIR, `transitions-refresh-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(backup, null, 2));
    console.log(`\nBackup written to ${path.relative(process.cwd(), file)}`);
    console.log(`Roll back with:\n  node scripts/refreshTransitionsBank.js --rollback ${path.relative(process.cwd(), file)}`);
  } else {
    console.log('\n--dry-run: nothing was written.');
  }
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
