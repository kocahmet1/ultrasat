#!/usr/bin/env node
/**
 * Import the Cross-Text Connections refresh set into the live question bank.
 *
 *   node scripts/importCtcRefresh.js            # dry run (default)
 *   node scripts/importCtcRefresh.js --apply    # write the 60 questions
 *   node scripts/importCtcRefresh.js --update   # dry-run changed existing items
 *   node scripts/importCtcRefresh.js --update --apply # update changed items in place
 *   node scripts/importCtcRefresh.js --remove   # delete this set (by contentSetVersion)
 *
 * Reads scripts/data/ctc-refresh-2026/cross-text-connections-60.json (built and
 * validated by that folder's build.js) and writes each item to the `questions`
 * collection with server timestamps, mirroring the schema the admin import API
 * produces (apps/api/questionsAPI.js importQuestionsFromData).
 *
 * Idempotent: the default import skips an item if a doc with the same
 * contentSetVersion and authoringRef already exists, so re-running after a
 * partial failure is safe and never duplicates. `--update` is fail-closed: it
 * requires one and only one existing document for every authoringRef, changes
 * only authored fields, preserves createdAt and questionStats, and verifies
 * the written payload before exiting.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SET_VERSION = 'ctc-refresh-2026-08';
const SRC = path.join(__dirname, 'data', 'ctc-refresh-2026', 'cross-text-connections-60.json');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const REMOVE = args.includes('--remove');
const UPDATE = args.includes('--update');

if (REMOVE && UPDATE) {
  throw new Error('--remove and --update cannot be used together');
}

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
  const duplicateRefs = [];
  existing.forEach((doc) => {
    const data = doc.data();
    const authoringRef = data.authoringRef;
    if (!authoringRef) throw new Error(`existing document ${doc.id} has no authoringRef`);
    if (existingRefs.has(authoringRef)) duplicateRefs.push(authoringRef);
    existingRefs.set(authoringRef, { id: doc.id, ref: doc.ref, data });
  });

  if (duplicateRefs.length) {
    throw new Error(`duplicate live authoringRef values: ${Array.from(new Set(duplicateRefs)).join(', ')}`);
  }

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

  const authoredPayload = (item, data = item) => {
    const payload = {};
    Object.keys(item).sort().forEach((key) => { payload[key] = data[key]; });
    return payload;
  };
  const canonicalize = (value) => {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === 'object') {
      const result = {};
      Object.keys(value).sort().forEach((key) => { result[key] = canonicalize(value[key]); });
      return result;
    }
    return value;
  };
  const authoredPayloadMatches = (item, data) =>
    JSON.stringify(canonicalize(authoredPayload(item))) ===
    JSON.stringify(canonicalize(authoredPayload(item, data)));

  if (UPDATE) {
    const expectedRefs = new Set(items.map((q) => q.authoringRef));
    const missing = items.filter((q) => !existingRefs.has(q.authoringRef)).map((q) => q.authoringRef);
    const unexpected = Array.from(existingRefs.keys()).filter((ref) => !expectedRefs.has(ref));
    if (missing.length || unexpected.length || existing.size !== items.length) {
      throw new Error(
        `refusing update: expected exactly ${items.length} live items; ` +
        `found ${existing.size}; missing=[${missing.join(', ')}]; unexpected=[${unexpected.join(', ')}]`
      );
    }

    const toUpdate = items.filter((q) => !authoredPayloadMatches(q, existingRefs.get(q.authoringRef).data));
    const byDiff = {};
    toUpdate.forEach((q) => { byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1; });

    console.log(`\nSet ${SET_VERSION}: ${items.length} items in file and ${existing.size} exact refs in Firestore.`);
    console.log(`  changed authored payloads : ${toUpdate.length}  ${JSON.stringify(byDiff)}`);
    if (toUpdate.length) console.log(`  refs to update            : ${toUpdate.map((q) => q.authoringRef).join(', ')}`);
    console.log('');

    if (!APPLY) {
      console.log('DRY RUN - nothing written. Re-run with --update --apply to commit.\n');
      process.exit(0);
    }

    const backupDir = path.join(__dirname, 'data', 'ctc-refresh-2026', 'backups');
    const backupStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `live-before-${backupStamp}.json`);
    const backup = items.map((q) => {
      const live = existingRefs.get(q.authoringRef);
      return {
        documentId: live.id,
        authoringRef: q.authoringRef,
        payload: authoredPayload(q, live.data),
      };
    });
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(backupPath, `${JSON.stringify(backup, null, 2)}\n`, 'utf8');
    console.log(`  backed up current authored payloads to ${path.relative(process.cwd(), backupPath)}`);

    for (let i = 0; i < toUpdate.length; i += 400) {
      const batch = db.batch();
      toUpdate.slice(i, i + 400).forEach((q) => {
        batch.update(existingRefs.get(q.authoringRef).ref, {
          ...q,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      console.log(`  committed ${Math.min(i + 400, toUpdate.length)}/${toUpdate.length}`);
    }

    const verificationFailures = [];
    await Promise.all(toUpdate.map(async (q) => {
      const snap = await existingRefs.get(q.authoringRef).ref.get();
      if (!snap.exists || !authoredPayloadMatches(q, snap.data())) verificationFailures.push(q.authoringRef);
    }));
    if (verificationFailures.length) {
      throw new Error(`post-write verification failed for: ${verificationFailures.join(', ')}`);
    }

    console.log(`\nupdated and verified ${toUpdate.length} question(s) in place.`);
    console.log('  Document IDs, createdAt values, and questionStats history were preserved.\n');
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
