#!/usr/bin/env node
/**
 * Import the Cross-Text Connections refresh set into the live question bank.
 *
 *   node scripts/importCtcRefresh.js            # dry run (default)
 *   node scripts/importCtcRefresh.js --apply    # write the 60 questions
 *   node scripts/importCtcRefresh.js --remove   # delete this set (by contentSetVersion)
 *
 * Reads scripts/data/ctc-refresh-2026/cross-text-connections-60.json (built and
 * validated by that folder's build.js) and writes each item to the `questions`
 * collection with server timestamps, mirroring the schema the admin import API
 * produces (apps/api/questionsAPI.js importQuestionsFromData).
 *
 * Idempotent: an item is skipped if a doc with the same contentSetVersion and
 * authoringRef already exists, so re-running after a partial failure is safe
 * and never duplicates.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SET_VERSION = 'ctc-refresh-2026-08';
const SRC = path.join(__dirname, 'data', 'ctc-refresh-2026', 'cross-text-connections-60.json');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const REMOVE = args.includes('--remove');

const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, '..', 'ultrasat-5e4c4-369f564bdaef.json');

admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
const db = admin.firestore();

(async () => {
  const items = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  if (!Array.isArray(items) || items.length !== 60) {
    throw new Error(`expected 60 items in ${SRC}, found ${Array.isArray(items) ? items.length : typeof items}`);
  }

  // sanity: every item carries the fields the serving queries and quiz UI rely on
  items.forEach((q, i) => {
    ['passage', 'text', 'options', 'correctAnswer', 'difficulty', 'subcategory', 'explanation', 'explanationStructured', 'authoringRef'].forEach((f) => {
      if (q[f] === undefined || q[f] === null) throw new Error(`item ${i} (${q.authoringRef || '?'}) missing ${f}`);
    });
    if (q.subcategory !== 'cross-text-connections' || q.subcategoryId !== 6) throw new Error(`item ${i} has wrong subcategory fields`);
    if (q.usageContext !== 'general') throw new Error(`item ${i} usageContext is "${q.usageContext}", expected "general"`);
    if (q.contentSetVersion !== SET_VERSION) throw new Error(`item ${i} contentSetVersion mismatch`);
  });

  const existing = await db.collection('questions').where('contentSetVersion', '==', SET_VERSION).get();
  const existingRefs = new Map();
  existing.forEach((doc) => existingRefs.set(doc.data().authoringRef, doc.id));

  if (REMOVE) {
    console.log(`\n${existing.size} doc(s) carry contentSetVersion ${SET_VERSION}.`);
    if (!APPLY) {
      console.log('DRY RUN — re-run with --remove --apply to delete them.\n');
      process.exit(0);
    }
    const batch = db.batch();
    existing.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✓ deleted ${existing.size} doc(s).\n`);
    process.exit(0);
  }

  const toWrite = items.filter((q) => !existingRefs.has(q.authoringRef));
  const byDiff = {};
  toWrite.forEach((q) => { byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1; });

  console.log(`\nSet ${SET_VERSION}: ${items.length} items in file.`);
  console.log(`  already in Firestore : ${existingRefs.size}`);
  console.log(`  to import            : ${toWrite.length}  ${JSON.stringify(byDiff)}\n`);

  if (!APPLY) {
    console.log('DRY RUN — nothing written. Re-run with --apply to import.\n');
    process.exit(0);
  }

  let written = 0;
  for (let i = 0; i < toWrite.length; i += 400) {
    const batch = db.batch();
    toWrite.slice(i, i + 400).forEach((q) => {
      const ref = db.collection('questions').doc();
      batch.set(ref, {
        ...q,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      written += 1;
    });
    await batch.commit();
    console.log(`  committed ${Math.min(i + 400, toWrite.length)}/${toWrite.length}`);
  }

  console.log(`\n✓ imported ${written} question(s) as usageContext="general".`);
  console.log('  They are now eligible for smart quizzes and the practice builder.\n');
  process.exit(0);
})().catch((err) => {
  console.error('\n✗ failed:', err.message, '\n');
  process.exit(1);
});
