/**
 * Applies Stage-2 QC fixes to Practice Exam 2, R&W Module 2 only.
 *
 *   node scripts/applyExam2Module2QCFixes.js --dry-run   # validate + back up, NO writes
 *   node scripts/applyExam2Module2QCFixes.js             # apply
 *
 * Reads scripts/output/qc_payload_exam2_m2.json. Backs up every touched question
 * AND the module's questionIds array to scripts/output/qc_backup_e2m2_<ts>.json
 * before writing. The one new (27th) question is added as a new document and its
 * ID spliced into the module's questionIds at insertIndex. Safe to reason about,
 * and guarded so a second run won't double-insert.
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

const payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'output', 'qc_payload_exam2_m2.json'), 'utf8'));
const TS = admin.firestore.FieldValue.serverTimestamp();
const NEW_TAG = 'qc_e2m2_append_v1'; // marker so we never double-insert the appended question

(async () => {
  console.log(`\n=== Exam 2 Module 2 QC apply ${DRY ? '(DRY RUN)' : '(LIVE)'} ===`);

  const modRef = db.collection('examModules').doc(payload.module2Id);
  const modSnap = await modRef.get();
  if (!modSnap.exists) { console.error('ABORT: module not found', payload.module2Id); process.exit(1); }
  const questionIds = (modSnap.data().questionIds || []).slice();
  console.log(`Module currently has ${questionIds.length} questions.`);

  const editIds = [...Object.keys(payload.updates), ...Object.keys(payload.partial)];
  const orphans = editIds.filter(id => !questionIds.includes(id));
  if (orphans.length) { console.error('ABORT: edit targets not in module:', orphans); process.exit(1); }
  console.log(`Verified all ${editIds.length} edit targets are in the module.`);

  // Detect whether the appended question already exists (idempotency).
  const existingAppend = await db.collection('questions')
    .where('qcTag', '==', NEW_TAG).limit(1).get();
  const alreadyAppended = !existingAppend.empty;

  // Backup.
  const backup = { moduleId: payload.module2Id, questionIds, docs: {} };
  for (const id of editIds) {
    const s = await db.collection('questions').doc(id).get();
    backup.docs[id] = s.exists ? s.data() : null;
  }
  const backupPath = path.join(__dirname, 'output', `qc_backup_e2m2_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 1));
  console.log(`Backup written: ${backupPath}`);
  console.log(`Append needed: ${alreadyAppended ? 'NO (already present)' : 'yes'} | target count after: 27`);

  if (DRY) { console.log('\nDRY RUN complete — no writes performed.'); process.exit(0); }

  let n = 0;
  for (const [id, data] of Object.entries(payload.updates)) {
    await db.collection('questions').doc(id).set({ ...data, updatedAt: TS }, { merge: true });
    console.log(`  replaced  ${id}`); n++;
  }
  for (const [id, data] of Object.entries(payload.partial)) {
    await db.collection('questions').doc(id).set({ ...data, updatedAt: TS }, { merge: true });
    console.log(`  patched   ${id}`); n++;
  }

  if (!alreadyAppended) {
    if (questionIds.length !== payload.expectedCurrentCount) {
      console.warn(`  NOTE: module has ${questionIds.length} questions (expected ${payload.expectedCurrentCount}); inserting anyway at index ${payload.insertIndex}.`);
    }
    const ref = await db.collection('questions').add({
      ...payload.append, qcTag: NEW_TAG, createdAt: TS, updatedAt: TS,
    });
    const newIds = questionIds.slice();
    newIds.splice(payload.insertIndex, 0, ref.id);
    await modRef.set({ questionIds: newIds, updatedAt: TS }, { merge: true });
    console.log(`  appended  ${ref.id} at index ${payload.insertIndex} -> module now ${newIds.length} questions`); n++;
  } else {
    console.log('  append skipped (marker already present)');
  }

  // Verify.
  const after = (await modRef.get()).data().questionIds || [];
  console.log(`\nApplied ${n} operations. Module now has ${after.length} questions (want 27).`);
  console.log('Reload the exam to confirm rendering.');
  process.exit(after.length === 27 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
