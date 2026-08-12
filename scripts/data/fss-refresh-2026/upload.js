#!/usr/bin/env node
/**
 * Upload the Form, Structure, and Sense refresh set to the live `questions` collection.
 *
 *   node scripts/data/fss-refresh-2026/upload.js --dry-run
 *   node scripts/data/fss-refresh-2026/upload.js
 *
 * Idempotent: every question in form-structure-sense-100.json carries a unique
 * `authoringRef` and `contentSetVersion: "fss-refresh-2026-08"`. Docs already present
 * with the same (contentSetVersion, authoringRef) pair are skipped, so the script can
 * be re-run safely after a partial failure.
 *
 * Writes an audit record of the created doc ids to ./backups/ for traceability and
 * so a botched upload can be bulk-deleted precisely.
 */

const fs = require('fs');
const path = require('path');

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');

const IN_FILE = path.join(__dirname, 'form-structure-sense-100.json');
const SET_VERSION = 'fss-refresh-2026-08';

async function main() {
  const questions = JSON.parse(fs.readFileSync(IN_FILE, 'utf8'));
  console.log(`Input        : ${IN_FILE}`);
  console.log(`Questions    : ${questions.length}`);
  console.log(`Set version  : ${SET_VERSION}`);
  console.log(`Mode         : ${DRY ? 'DRY RUN — no writes' : 'LIVE'}`);

  // Pre-flight validation — refuse to upload anything malformed.
  const problems = [];
  const refs = new Set();
  questions.forEach((q, i) => {
    const at = q.authoringRef || `#${i}`;
    if (!q.authoringRef) problems.push(`${at}: missing authoringRef`);
    if (refs.has(q.authoringRef)) problems.push(`${at}: duplicate authoringRef`);
    refs.add(q.authoringRef);
    if (q.contentSetVersion !== SET_VERSION) problems.push(`${at}: wrong contentSetVersion "${q.contentSetVersion}"`);
    if (!q.text || !q.text.includes('______')) problems.push(`${at}: text missing the blank`);
    if (!Array.isArray(q.options) || q.options.length !== 4) problems.push(`${at}: needs 4 options`);
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) problems.push(`${at}: bad correctAnswer`);
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) problems.push(`${at}: bad difficulty`);
    if (q.subcategory !== 'form-structure-sense' || q.subCategory !== 'form-structure-sense') problems.push(`${at}: bad subcategory`);
    if (q.subcategoryId !== 10) problems.push(`${at}: bad subcategoryId`);
    if (q.usageContext !== 'general') problems.push(`${at}: usageContext must be "general"`);
    if (!q.explanation) problems.push(`${at}: missing explanation`);
  });
  if (problems.length) {
    console.error(`\nPre-flight failed (${problems.length}):`);
    problems.forEach((p) => console.error(`  ✗ ${p}`));
    process.exit(1);
  }
  console.log('Pre-flight   : OK');

  const { initFirebaseAdmin } = require('../../lib/firestoreUploader');
  const admin = initFirebaseAdmin();
  const db = admin.firestore();

  // Which refs from this set already exist? (idempotency)
  const existing = new Map();
  const prior = await db.collection('questions').where('contentSetVersion', '==', SET_VERSION).get();
  prior.docs.forEach((d) => existing.set(d.data().authoringRef, d.id));
  console.log(`Already live : ${existing.size} question(s) from this set`);

  const toCreate = questions.filter((q) => !existing.has(q.authoringRef));
  console.log(`To create    : ${toCreate.length}`);

  if (DRY) {
    toCreate.slice(0, 5).forEach((q) => {
      console.log(`  would create ${q.authoringRef} [${q.difficulty}] ${q.text.replace(/\s+/g, ' ').slice(0, 80)}…`);
    });
    if (toCreate.length > 5) console.log(`  … and ${toCreate.length - 5} more`);
    console.log('\nDry run complete. No data was written.');
    return;
  }
  if (!toCreate.length) {
    console.log('\nNothing to do — the full set is already live.');
    return;
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const created = [];
  // 400 writes per batch, well under Firestore's 500 cap.
  for (let i = 0; i < toCreate.length; i += 400) {
    const slice = toCreate.slice(i, i + 400);
    const batch = db.batch();
    slice.forEach((q) => {
      const ref = db.collection('questions').doc();
      batch.set(ref, { ...q, createdAt: now, updatedAt: now });
      created.push({ id: ref.id, authoringRef: q.authoringRef });
    });
    await batch.commit();
    console.log(`  committed ${Math.min(i + 400, toCreate.length)}/${toCreate.length}`);
  }

  const backupDir = path.resolve(__dirname, '../../backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const auditFile = path.join(backupDir, `upload-${SET_VERSION}-${stamp}.json`);
  fs.writeFileSync(auditFile, JSON.stringify({ setVersion: SET_VERSION, at: new Date().toISOString(), created }, null, 2), 'utf8');

  console.log(`\n✓ created ${created.length} question(s).`);
  console.log(`  audit record: ${auditFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
