#!/usr/bin/env node
/**
 * Retire the existing Cross-Text Connections questions.
 *
 *   node scripts/retireCrossTextConnections.js                 # dry run (default)
 *   node scripts/retireCrossTextConnections.js --apply         # write the change
 *   node scripts/retireCrossTextConnections.js --apply --undo  # put them back
 *
 * Smart quizzes have no "retired" flag. Selection is gated entirely by
 * `usageContext`: apps/web/src/utils/smartQuizUtils.js and
 * apps/web/src/firebase/questionBankServices.js both keep only questions where
 * `!usageContext || usageContext === 'general'`. Flipping the field to
 * 'retired-2026-08' removes a question from every practice surface while
 * leaving the document — and its stats history — intact and reversible.
 *
 * The subcategory fields are ALSO renamed (with originals preserved under
 * `retiredOriginal`). This matters because questionBankServices.js queries
 * with limit(50) and applies the usageContext filter only afterward — retired
 * docs left on the original subcategory would keep consuming that query
 * budget and crowd out live items.
 *
 * Scope: only usageContext 'general' (or unset) docs are touched. Docs marked
 * 'exam' belong to fixed practice exams, are already invisible to smart
 * quizzes, and are left exactly as they are.
 *
 * Questions written by the refresh (contentSetVersion 'ctc-refresh-2026-08')
 * are skipped, so this is safe to run after the new set has been imported.
 */

const path = require('path');
const admin = require('firebase-admin');

const RETIRED_VALUE = 'retired-2026-08';
const NEW_SET_VERSION = 'ctc-refresh-2026-08';
const SUBCATEGORY_KEBAB = 'cross-text-connections';
const SUBCATEGORY_ID = 6;
const SUBCATEGORY_ALIASES = [
  'cross-text-connections',
  'Cross-Text Connections',
  'Cross Text Connections',
  'cross text connections',
  'Cross-Text-Connections',
];

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const UNDO = args.includes('--undo');
const target = UNDO ? 'general' : RETIRED_VALUE;

const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, '..', 'ultrasat-5e4c4-369f564bdaef.json');

admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
const db = admin.firestore();

const isCTC = (d) =>
  SUBCATEGORY_ALIASES.includes(d.subcategory) ||
  SUBCATEGORY_ALIASES.includes(d.subCategory) ||
  d.subcategoryId === SUBCATEGORY_ID ||
  (typeof d.categoryPath === 'string' && d.categoryPath.includes('Cross-Text Connections'));

(async () => {
  // Targeted queries instead of a full-collection scan (which burns read quota
  // on 4,700+ docs). The union of these covers every field shape observed in
  // the live bank; a doc matching several is deduped by id.
  const queries = [
    db.collection('questions').where('subcategory', '==', SUBCATEGORY_KEBAB),
    db.collection('questions').where('subCategory', '==', SUBCATEGORY_KEBAB),
    db.collection('questions').where('subcategoryId', '==', SUBCATEGORY_ID),
    db.collection('questions').where('subcategory', '==', 'Cross-Text Connections'),
    // docs already retired by this script (needed for --undo)
    db.collection('questions').where('subcategory', '==', `${SUBCATEGORY_KEBAB}-retired`),
  ];
  const byId = new Map();
  let scanned = 0;
  for (const q of queries) {
    const s = await q.get();
    scanned += s.size;
    s.forEach((doc) => {
      if (!byId.has(doc.id)) byId.set(doc.id, { id: doc.id, ref: doc.ref, data: doc.data() });
    });
  }
  const snap = { size: `${scanned} (targeted, ${byId.size} unique)` };

  const matches = [];
  byId.forEach((m) => {
    if (isCTC(m.data) || m.data.subcategory === `${SUBCATEGORY_KEBAB}-retired`) matches.push(m);
  });

  const fresh = matches.filter((m) => m.data.contentSetVersion === NEW_SET_VERSION);
  const legacy = matches.filter((m) => m.data.contentSetVersion !== NEW_SET_VERSION);
  const examOnly = legacy.filter((m) => m.data.usageContext && m.data.usageContext !== 'general' && m.data.usageContext !== RETIRED_VALUE);
  const willChange = UNDO
    ? legacy.filter((m) => m.data.usageContext === RETIRED_VALUE)
    : legacy.filter((m) => !m.data.usageContext || m.data.usageContext === 'general');

  console.log(`\nScanned ${snap.size} questions.`);
  console.log(`  Cross-Text Connections total : ${matches.length}`);
  console.log(`  from the 2026-08 refresh     : ${fresh.length}  (skipped)`);
  console.log(`  legacy items                 : ${legacy.length}`);
  console.log(`  exam-only (left untouched)   : ${examOnly.length}`);
  console.log(`  to update                    : ${willChange.length}\n`);

  const byContext = {};
  legacy.forEach((m) => {
    const k = m.data.usageContext || '(unset)';
    byContext[k] = (byContext[k] || 0) + 1;
  });
  console.log('  current usageContext spread:', JSON.stringify(byContext));
  const byDifficulty = {};
  legacy.forEach((m) => {
    const k = m.data.difficulty || '(unset)';
    byDifficulty[k] = (byDifficulty[k] || 0) + 1;
  });
  console.log('  difficulty spread          :', JSON.stringify(byDifficulty), '\n');

  willChange.slice(0, 10).forEach((m) => {
    const stem = (m.data.text || '').replace(/<[^>]+>/g, ' ').slice(0, 90);
    console.log(`   · ${m.id}  ${m.data.difficulty || '?'}  ${stem}…`);
  });
  if (willChange.length > 10) console.log(`   … and ${willChange.length - 10} more\n`);

  if (!APPLY) {
    console.log('\nDRY RUN — nothing written. Re-run with --apply to commit.\n');
    process.exit(0);
  }

  let written = 0;
  for (let i = 0; i < willChange.length; i += 400) {
    const batch = db.batch();
    willChange.slice(i, i + 400).forEach((m) => {
      const d = m.data;
      const update = UNDO
        ? {
            usageContext: (d.retiredOriginal && d.retiredOriginal.usageContext) || 'general',
            subcategory: (d.retiredOriginal && d.retiredOriginal.subcategory) || SUBCATEGORY_KEBAB,
            subCategory: (d.retiredOriginal && d.retiredOriginal.subCategory) || SUBCATEGORY_KEBAB,
            subcategoryId: (d.retiredOriginal && d.retiredOriginal.subcategoryId) || SUBCATEGORY_ID,
            categoryPath:
              (d.retiredOriginal && d.retiredOriginal.categoryPath) ||
              'Reading and Writing/Craft and Structure/Cross-Text Connections',
            retiredOriginal: admin.firestore.FieldValue.delete(),
            retiredAt: admin.firestore.FieldValue.delete(),
            retiredReason: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }
        : {
            usageContext: RETIRED_VALUE,
            // Move the doc off the served subcategory so it stops consuming the
            // limit(50) query budget in questionBankServices.js.
            subcategory: `${SUBCATEGORY_KEBAB}-retired`,
            subCategory: `${SUBCATEGORY_KEBAB}-retired`,
            subcategoryId: -SUBCATEGORY_ID,
            categoryPath: `RETIRED/${d.categoryPath || 'Reading and Writing/Craft and Structure/Cross-Text Connections'}`,
            retiredOriginal: {
              usageContext: d.usageContext || 'general',
              subcategory: d.subcategory || null,
              subCategory: d.subCategory || null,
              subcategoryId: d.subcategoryId === undefined ? null : d.subcategoryId,
              categoryPath: d.categoryPath || null,
            },
            retiredAt: admin.firestore.FieldValue.serverTimestamp(),
            retiredReason: 'superseded by ctc-refresh-2026-08',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
      batch.update(m.ref, update);
      written += 1;
    });
    await batch.commit();
    console.log(`  committed ${Math.min(i + 400, willChange.length)}/${willChange.length}`);
  }

  console.log(`\n✓ ${written} question(s) set to usageContext="${target}".`);
  console.log(UNDO ? '  Restored to practice.\n' : '  They will no longer be served by smart quizzes or the practice builder.\n');
  process.exit(0);
})().catch((err) => {
  console.error('\n✗ failed:', err.message, '\n');
  process.exit(1);
});
