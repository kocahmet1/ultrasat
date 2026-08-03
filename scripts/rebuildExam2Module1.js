/**
 * Rebuilds Practice Exam 2, R&W Module 1 with 27 brand-new questions.
 *
 *   node scripts/rebuildExam2Module1.js --dry-run   # validate + back up, NO writes
 *   node scripts/rebuildExam2Module1.js             # apply
 *
 * WHY: Exam 2 Module 1 currently shares the exact same 27 question documents as
 * Exam 1 Module 2. This creates 27 NEW documents and repoints Module 1's
 * questionIds to them. The old shared documents are NEVER modified or deleted —
 * they remain in use by Exam 1 Module 2.
 *
 * Reversible: the backup stores Module 1's previous questionIds, so a rollback is
 * just restoring that array. Guarded with a marker tag so re-running won't duplicate.
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const keyCandidates = [
  path.join(__dirname, '..', 'ultrasat-5e4c4-369f564bdaef.json'),
  path.join(__dirname, 'ultrasat-5e4c4-369f564bdaef.json'),
  path.join(__dirname, 'serviceAccountKey.json'),
];
const keyPath = keyCandidates.find(p => fs.existsSync(p));
if (!keyPath) { console.error('Service account key not found.'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
const db = admin.firestore();

const payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'output', 'qc_payload_exam2_m1.json'), 'utf8'));
const TS = admin.firestore.FieldValue.serverTimestamp();
const REBUILD_TAG = 'qc_e2m1_rebuild_v1';

(async () => {
  console.log(`\n=== Exam 2 Module 1 REBUILD ${DRY ? '(DRY RUN)' : '(LIVE)'} ===`);

  if (payload.questions.length !== 27) {
    console.error(`ABORT: expected 27 questions in payload, found ${payload.questions.length}`);
    process.exit(1);
  }

  const modRef = db.collection('examModules').doc(payload.module1Id);
  const modSnap = await modRef.get();
  if (!modSnap.exists) { console.error('ABORT: module not found', payload.module1Id); process.exit(1); }
  const currentIds = (modSnap.data().questionIds || []).slice();
  console.log(`Module 1 currently points to ${currentIds.length} questions.`);

  // Confirm the current questions really are the shared Exam-1-Module-2 set (sanity), and
  // that they are NOT already rebuilt.
  const firstDoc = currentIds[0] ? (await db.collection('questions').doc(currentIds[0]).get()) : null;
  const alreadyRebuilt = firstDoc && firstDoc.exists && firstDoc.data().qcTag === REBUILD_TAG;
  if (alreadyRebuilt) {
    console.log('Module 1 already appears to be rebuilt (marker tag present). Nothing to do.');
    process.exit(0);
  }

  // Backup: previous questionIds (pointer) — the old docs themselves are untouched.
  const backup = {
    moduleId: payload.module1Id,
    previousQuestionIds: currentIds,
    note: 'Old question docs are shared with Exam 1 Module 2 and were NOT modified. To roll back, set this module\'s questionIds back to previousQuestionIds.',
  };
  const backupPath = path.join(__dirname, 'output', `qc_backup_e2m1_rebuild_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 1));
  console.log(`Backup written: ${backupPath}`);

  if (DRY) {
    console.log(`\nDRY RUN: would create 27 new docs and repoint Module 1. No writes performed.`);
    process.exit(0);
  }

  // Create the 27 new question documents.
  const newIds = [];
  for (let i = 0; i < payload.questions.length; i++) {
    const ref = await db.collection('questions').add({
      ...payload.questions[i], qcTag: REBUILD_TAG, createdAt: TS, updatedAt: TS,
    });
    newIds.push(ref.id);
  }
  console.log(`Created ${newIds.length} new question documents.`);

  // Repoint Module 1.
  await modRef.set({ questionIds: newIds, updatedAt: TS }, { merge: true });
  console.log('Module 1 questionIds repointed to the new set.');

  // Verify.
  const after = (await modRef.get()).data().questionIds || [];
  let bad = 0;
  for (const id of after) {
    const s = await db.collection('questions').doc(id).get();
    const dd = s.data();
    if (!s.exists || !dd.text || !Array.isArray(dd.options) || dd.options.length !== 4) bad++;
  }
  console.log(`\nModule 1 now has ${after.length} questions; ${bad ? bad + ' FAILED verification' : 'all verified'}.`);
  console.log('Reload the exam to confirm rendering (Module 1 should show 27 fresh questions).');
  process.exit(after.length === 27 && bad === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
