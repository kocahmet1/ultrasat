#!/usr/bin/env node
/**
 * Retire the existing Boundaries question bank and upload the 100 newly authored
 * items in scripts/data/boundaries-refresh-2026/src/.
 *
 * Follows scripts/retireAndUploadCid.js (the established refresh pattern), with one
 * improvement taken from retireAndRefreshTextStructurePurpose.js: retired docs get
 * BOTH `usageContext: 'retired'` AND `retired: true`. usageContext is what actually
 * excludes a doc from the primary Smart Quiz query (questionBankServices.js filters
 * `where('usageContext','==','general')` server-side and `!q.usageContext ||
 * q.usageContext === 'general'` client-side); `retired: true` additionally trips the
 * client-side `q.retired !== true` guard on every surface that has one.
 *
 * SAFETY
 *   - Nothing is deleted. Retiring is a field flip and is fully reversible.
 *   - A JSON backup of every touched document (full data) is written to
 *     scripts/backups/ BEFORE any write.
 *   - Docs whose usageContext is anything other than 'general'/absent (e.g. 'exam')
 *     are reported and left alone.
 *   - Exam references: examModules.questionIds and practiceExams are scanned, and any
 *     to-retire id that an exam references is reported. Retiring is still safe for
 *     exams (they fetch questions by id, not by usageContext), so this is a report,
 *     not a block.
 *
 * USAGE
 *   node scripts/retireAndUploadBoundaries.js --dry-run    # print the plan, write nothing
 *   node scripts/retireAndUploadBoundaries.js              # back up, retire, upload, verify
 *   node scripts/retireAndUploadBoundaries.js --retire-only
 *   node scripts/retireAndUploadBoundaries.js --upload-only
 *   node scripts/retireAndUploadBoundaries.js --rollback scripts/backups/<file>.json [--delete-created]
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');

const SUBCATEGORY = 'boundaries';
const SUBCATEGORY_ID = 9;
const MAIN_CATEGORY = 'Standard English Conventions';
const SUBJECT_AREA = 'Reading and Writing';
const CATEGORY_PATH = 'Reading and Writing/Standard English Conventions/Boundaries';
const STEM = 'Which choice completes the text so that it conforms to the conventions of Standard English?';
const BATCH_TAG = 'boundaries-refresh-2026';
const RETIRED_VALUE = 'retired';
const LETTERS = ['A', 'B', 'C', 'D'];

const SRC_DIR = path.resolve(__dirname, 'data/boundaries-refresh-2026/src');
const SRC_FILES = [
  'bnd-01-easy-a.json',
  'bnd-02-easy-b.json',
  'bnd-03-medium-a.json',
  'bnd-04-medium-b.json',
  'bnd-05-medium-c.json',
  'bnd-06-hard-a.json',
  'bnd-07-hard-b.json',
];
const BACKUP_DIR = path.resolve(__dirname, 'backups');

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const RETIRE_ONLY = argv.includes('--retire-only');
const UPLOAD_ONLY = argv.includes('--upload-only');
const ROLLBACK_IDX = argv.indexOf('--rollback');
const log = (...a) => console.log(...a);

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Authoring shape -> production questions doc. Field names are load-bearing:
 *   - correctAnswer MUST be a NUMBER (SmartQuiz.jsx scores with strict ===).
 *   - explanationStructured (noun first), NOT structuredExplanation.
 *   - usageContext 'general' is what makes a question visible to smart quizzes.
 *   - subcategory AND subCategory AND subcategoryId are all written because the
 *     fetcher in questionBankServices.js queries them as separate fallbacks.
 */
function buildBoundariesQuestionDoc(item, admin) {
  if (!Array.isArray(item.options) || item.options.length !== 4) {
    throw new Error(`${item.id}: expected exactly 4 options`);
  }
  if (typeof item.key !== 'number' || item.key < 0 || item.key > 3) {
    throw new Error(`${item.id}: key must be an integer 0-3`);
  }
  if (!['easy', 'medium', 'hard'].includes(item.difficulty)) {
    throw new Error(`${item.id}: bad difficulty ${item.difficulty}`);
  }
  if (!item.passage || !item.passage.includes('______')) {
    throw new Error(`${item.id}: passage must contain the blank`);
  }
  if (!/^Choice [A-D] is the best answer\. The convention being tested is /.test(item.why || '')) {
    throw new Error(`${item.id}: why does not follow the official opening`);
  }

  const keyLetter = LETTERS[item.key];

  // Steps = the substance of the official-style rationale, minus the two boilerplate
  // opening sentences ("Choice X is the best answer." / "The convention being tested is …").
  const substance = item.why
    .replace(/^Choice [A-D] is the best answer\.\s*/, '')
    .replace(/^The convention being tested is [^.]+\.\s*/, '')
    .trim();
  if (!substance) throw new Error(`${item.id}: rationale has no substance after the openers`);

  const choiceRebuttals = {};
  const flatRebuttals = [];
  for (const letter of LETTERS) {
    if (letter === keyLetter) continue;
    const r = (item.rebuttals || {})[letter];
    if (!r) throw new Error(`${item.id}: missing rebuttal for ${letter}`);
    choiceRebuttals[letter] = capitalize(r);
    flatRebuttals.push(`Choice ${letter} is incorrect because ${r}`);
  }

  const ts = admin.firestore.FieldValue.serverTimestamp();

  return {
    // content
    text: STEM,
    passage: item.passage,
    questionType: 'multiple-choice',
    options: item.options,
    correctAnswer: item.key, // NUMBER
    acceptedAnswers: null,
    answerFormat: null,

    // explanation — both shapes, like every other 2026 refresh
    explanation: `${item.why} ${flatRebuttals.join(' ')}`,
    explanationStructured: {
      rule: `The convention being tested is ${item.convention}.`,
      steps: [substance],
      choiceRebuttals,
      thingsToRemember: item.remember ? [item.remember] : [],
    },

    // classification
    difficulty: item.difficulty,
    subcategory: SUBCATEGORY,
    subCategory: SUBCATEGORY,
    subcategoryId: SUBCATEGORY_ID,
    categoryPath: CATEGORY_PATH,
    mainCategory: MAIN_CATEGORY,
    subjectArea: SUBJECT_AREA,
    skillTags: [SUBCATEGORY],

    // provenance / gating
    source: 'ultrasat-original',
    usageContext: 'general',
    retired: false,
    authoringId: item.id,
    authoringBatch: BATCH_TAG,
    authoringMeta: {
      family: item.family || null,
      menu: item.menu || null,
      keyMark: item.keyMark || null,
      lane: item.lane || null,
      hardLever: item.hardLever || null,
    },

    // media
    hasImage: false,
    graphUrl: null,
    graphDescription: null,

    // timestamps
    createdAt: ts,
    updatedAt: ts,
  };
}

/** Every Boundaries doc in Firestore, across all historical field spellings. */
async function findExistingBoundariesQuestions(db) {
  const found = new Map();
  const queries = [
    db.collection('questions').where('subcategory', '==', SUBCATEGORY),
    db.collection('questions').where('subCategory', '==', SUBCATEGORY),
    db.collection('questions').where('subcategoryId', '==', SUBCATEGORY_ID),
    db.collection('questions').where('subcategory', '==', 'Boundaries'),
    db.collection('questions').where('subCategory', '==', 'Boundaries'),
  ];
  for (const q of queries) {
    const snap = await q.get();
    snap.forEach((d) => found.set(d.id, d.data()));
  }
  return found;
}

/** Ids referenced by any practice exam, so the report can flag overlaps. */
async function findExamReferencedIds(db) {
  const referenced = new Set();
  for (const coll of ['examModules', 'practiceExams']) {
    try {
      const snap = await db.collection(coll).get();
      snap.forEach((d) => {
        const ids = d.get('questionIds');
        if (Array.isArray(ids)) ids.forEach((id) => referenced.add(id));
      });
    } catch (e) {
      log(`  (could not scan ${coll}: ${e.message})`);
    }
  }
  return referenced;
}

async function rollback(db, admin, file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  const FV = admin.firestore.FieldValue;
  let restored = 0;
  for (const rec of backup.retired || []) {
    const patch = {
      retired: FV.delete(),
      retiredAt: FV.delete(),
      retiredBy: FV.delete(),
      retiredReason: FV.delete(),
      updatedAt: FV.serverTimestamp(),
    };
    patch.usageContext = rec.prevUsageContext === undefined ? FV.delete() : rec.prevUsageContext;
    await db.collection('questions').doc(rec.id).update(patch);
    restored += 1;
  }
  log(`Restored ${restored} retired question(s).`);

  const created = backup.created || [];
  if (created.length) {
    log(`\nThis run also created ${created.length} new question document(s).`);
    if (argv.includes('--delete-created')) {
      let n = 0;
      for (let i = 0; i < created.length; i += 400) {
        const batch = db.batch();
        created.slice(i, i + 400).forEach((id) => batch.delete(db.collection('questions').doc(id)));
        await batch.commit();
        n += Math.min(400, created.length - i);
      }
      log(`Deleted ${n} created question document(s).`);
    } else {
      log('Re-run with --delete-created to remove them.');
    }
  }
  log('Rollback complete.');
}

/** Post-write check: run the exact primary Smart Quiz query per difficulty. */
async function verifyServing(db) {
  log('\nVerification — primary Smart Quiz query per difficulty:');
  for (const difficulty of ['easy', 'medium', 'hard']) {
    try {
      const snap = await db.collection('questions')
        .where('subcategory', '==', SUBCATEGORY)
        .where('difficulty', '==', difficulty)
        .where('usageContext', '==', 'general')
        .limit(50)
        .get();
      const fromBatch = snap.docs.filter((d) => d.get('authoringBatch') === BATCH_TAG).length;
      const stray = snap.size - fromBatch;
      log(`  ${difficulty.padEnd(6)} -> ${snap.size} serving (${fromBatch} from ${BATCH_TAG}${stray ? `, ${stray} OTHER — investigate` : ''})`);
    } catch (e) {
      log(`  ${difficulty}: PRIMARY QUERY FAILED (${e.code || e.message}).`);
      log('    Likely a missing composite index (subcategory+difficulty+usageContext).');
      log('    The app falls back to broader queries and client-side filters, but create');
      log('    the index from firestore.indexes.json for the intended query path.');
    }
  }
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

  // ---- load + build (validates everything before touching Firestore) ----
  const items = SRC_FILES.flatMap((f) => JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8')));
  if (items.length !== 100) throw new Error(`expected 100 authored items, got ${items.length}`);
  const ids = new Set(items.map((i) => i.id));
  if (ids.size !== 100) throw new Error('duplicate authoring ids');

  const docs = items.map((it) => buildBoundariesQuestionDoc(it, admin));
  const byDifficulty = docs.reduce((a, d) => ((a[d.difficulty] = (a[d.difficulty] || 0) + 1), a), {});
  log(`Built ${docs.length} question docs: ${JSON.stringify(byDifficulty)}`);

  // ---- discover current state ----
  const existing = await findExistingBoundariesQuestions(db);
  const examRefs = await findExamReferencedIds(db);

  const toRetire = [];
  const notGeneral = [];
  const alreadyRetired = [];
  const ourOwnBatch = [];
  for (const [id, data] of existing) {
    if (data.authoringBatch === BATCH_TAG) { ourOwnBatch.push(id); continue; }
    if (data.retired === true || data.usageContext === RETIRED_VALUE || String(data.usageContext || '').startsWith('retired')) {
      alreadyRetired.push(id); continue;
    }
    if (data.usageContext && data.usageContext !== 'general') {
      notGeneral.push({ id, usageContext: data.usageContext }); continue;
    }
    toRetire.push({
      id,
      prevUsageContext: data.usageContext,
      difficulty: data.difficulty,
      examReferenced: examRefs.has(id),
      text: String(data.text || data.passage || '').slice(0, 70),
    });
  }

  const retireByDiff = toRetire.reduce((a, r) => ((a[r.difficulty || '?'] = (a[r.difficulty || '?'] || 0) + 1), a), {});
  const examHits = toRetire.filter((r) => r.examReferenced);

  log(`\nExisting Boundaries questions in Firestore: ${existing.size}`);
  log(`  to retire (usageContext general/absent): ${toRetire.length}  ${JSON.stringify(retireByDiff)}`);
  log(`  left alone (exam/other usageContext):    ${notGeneral.length}`);
  log(`  already retired:                         ${alreadyRetired.length}`);
  if (ourOwnBatch.length) log(`  from a previous run of this batch:       ${ourOwnBatch.length}  <-- re-running would duplicate`);
  if (examHits.length) {
    log(`  NOTE: ${examHits.length} to-retire doc(s) are referenced by a practice exam.`);
    log('        Exams fetch by id, so they keep working; the docs just leave the quiz pool.');
  }

  if (DRY_RUN) {
    log('\n--- DRY RUN, nothing written ---');
    log('Would retire:');
    toRetire.slice(0, 12).forEach((r) => log(`   ${r.id}  [${(r.difficulty || '?').padEnd(6)}]${r.examReferenced ? ' [exam-ref]' : ''}  ${r.text}...`));
    if (toRetire.length > 12) log(`   ... and ${toRetire.length - 12} more`);
    log(`\nWould create ${docs.length} new documents with usageContext 'general'.`);
    log('Sample new doc:');
    log(JSON.stringify({ ...docs[0], createdAt: '<ts>', updatedAt: '<ts>' }, null, 2).slice(0, 1500) + '\n...');
    return;
  }

  if (ourOwnBatch.length && !RETIRE_ONLY && !argv.includes('--force')) {
    throw new Error(`${ourOwnBatch.length} docs from '${BATCH_TAG}' already exist. Pass --force to duplicate anyway.`);
  }

  // ---- backup (full docs, before any write) ----
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupFile = path.join(BACKUP_DIR, `boundaries_refresh_${Date.now()}.json`);
  const backup = {
    createdAt: new Date().toISOString(),
    batch: BATCH_TAG,
    retiredValue: RETIRED_VALUE,
    retired: toRetire.map((r) => ({ id: r.id, prevUsageContext: r.prevUsageContext })),
    retiredFullDocs: toRetire.map((r) => ({ id: r.id, data: existing.get(r.id) })),
    notGeneral,
    alreadyRetired,
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
          retired: true,
          retiredAt: now(),
          retiredBy: BATCH_TAG,
          retiredReason: `superseded by ${BATCH_TAG}`,
          updatedAt: now(),
        });
        n += 1;
      }
      await batch.commit();
    }
    log(`Retired ${n} question(s) -> usageContext '${RETIRED_VALUE}', retired: true`);
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

  await verifyServing(db);

  log(`\nDone. Rollback with:\n  node scripts/retireAndUploadBoundaries.js --rollback ${path.relative(process.cwd(), backupFile)} --delete-created`);
}

main().catch((e) => {
  console.error('\nFAILED:', e.message);
  process.exit(1);
});
