/**
 * Applies Stage-2 QC fixes to Practice Exam 1, R&W Modules 1 & 2.
 *
 *   node scripts/applyExam1QCFixes.js --dry-run   # validate + back up, NO writes
 *   node scripts/applyExam1QCFixes.js             # apply for real
 *
 * Reads scripts/output/qc_payload.json. Before any write it saves the current
 * state of every touched doc to scripts/output/qc_backup_<timestamp>.json so the
 * change is fully reversible. Module questionIds arrays are NOT modified: missing
 * questions are recreated at their original (dangling) IDs.
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

const payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'output', 'qc_payload.json'), 'utf8'));
const TS = admin.firestore.FieldValue.serverTimestamp();

(async () => {
  console.log(`\n=== Exam 1 QC apply ${DRY ? '(DRY RUN)' : '(LIVE)'} ===`);

  // 1) Safety: confirm both module docs still reference every ID we touch.
  const mod1 = (await db.collection('examModules').doc(payload.module1Id).get()).data();
  const mod2 = (await db.collection('examModules').doc(payload.module2Id).get()).data();
  const arr1 = new Set(mod1.questionIds || []);
  const arr2 = new Set(mod2.questionIds || []);
  const inEitherModule = id => arr1.has(id) || arr2.has(id);

  const allIds = [
    ...Object.keys(payload.recreate),
    ...Object.keys(payload.updates),
    ...Object.keys(payload.partial),
  ];
  const orphans = allIds.filter(id => !inEitherModule(id));
  if (orphans.length) {
    console.error('ABORT: these payload IDs are not referenced by Module 1 or 2:', orphans);
    process.exit(1);
  }
  console.log(`Verified all ${allIds.length} target IDs are referenced by the modules.`);

  // 2) Back up current state of every touched doc.
  const backup = {};
  for (const id of allIds) {
    const snap = await db.collection('questions').doc(id).get();
    backup[id] = snap.exists ? snap.data() : null;
  }
  const backupPath = path.join(__dirname, 'output', `qc_backup_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 1));
  console.log(`Backup written: ${backupPath}`);
  const missingNow = Object.entries(backup).filter(([, v]) => v === null).map(([k]) => k);
  console.log(`Currently-empty docs to be recreated: ${missingNow.length}`, missingNow);

  if (DRY) { console.log('\nDRY RUN complete — no writes performed.'); process.exit(0); }

  // 3) Apply.
  let n = 0;
  for (const [id, data] of Object.entries(payload.recreate)) {
    await db.collection('questions').doc(id).set({ ...data, createdAt: TS, updatedAt: TS });
    console.log(`  recreated  ${id}`); n++;
  }
  for (const [id, data] of Object.entries(payload.updates)) {
    await db.collection('questions').doc(id).set({ ...data, updatedAt: TS }, { merge: true });
    console.log(`  replaced   ${id}`); n++;
  }
  for (const [id, data] of Object.entries(payload.partial)) {
    await db.collection('questions').doc(id).set({ ...data, updatedAt: TS }, { merge: true });
    console.log(`  patched    ${id}`); n++;
  }

  // 4) Post-write verification.
  let bad = 0;
  for (const id of allIds) {
    const d = (await db.collection('questions').doc(id).get()).data();
    const okOpts = Array.isArray(d.options) ? d.options.length === 4 : true;
    const okAns = typeof d.correctAnswer === 'number' && d.correctAnswer >= 0 && d.correctAnswer <= 3;
    if (!d.text || !okOpts || (payload.partial[id] ? false : !okAns)) {
      console.warn(`  VERIFY FAIL ${id}`); bad++;
    }
  }
  console.log(`\nApplied ${n} operations. Verification ${bad ? bad + ' FAILURES' : 'passed'}.`);
  console.log('Reload the exam in the app to confirm rendering.');
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
