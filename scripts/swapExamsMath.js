/**
 * Swap the MATH modules (moduleNumber 3 and 4) between two exam pairs, in place:
 *
 *   Exam 7  <->  Exam 9     (Module 3 <-> Module 3, Module 4 <-> Module 4)
 *   Exam 8  <->  Exam 10    (Module 3 <-> Module 3, Module 4 <-> Module 4)
 *
 * The Reading & Writing modules (moduleNumber 1 and 2) are NEVER touched.
 *
 * Nothing is created, deleted, or edited in the `questions` collection. Each
 * examModule document keeps its ID, title, moduleNumber, timeLimit, and
 * calculatorAllowed; ONLY its questionIds array (and questionCount) is
 * exchanged with the corresponding module of the paired exam. Question counts
 * may legitimately differ between counterparts — the count travels with the
 * content.
 *
 * All eight module updates are committed in a single atomic Firestore batch,
 * so a failure can never leave a half-swapped state.
 *
 * A JSON backup of every module's previous questionIds is written to
 * scripts/backups/ before anything changes, so the swap is reversible.
 * (Running the script a second time would also undo it — it is a pure swap.)
 *
 * Usage:
 *   node scripts/swapExamsMath.js --dry-run     # show the plan, write nothing
 *   node scripts/swapExamsMath.js               # back up, validate, and swap
 *   node scripts/swapExamsMath.js --rollback scripts/backups/<file>.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyCandidates = [
  path.join(__dirname, '..', 'ultrasat-5e4c4-369f564bdaef.json'),
  path.join(__dirname, 'ultrasat-5e4c4-369f564bdaef.json'),
  path.join(__dirname, 'serviceAccountKey.json'),
];
const keyPath = keyCandidates.find(p => fs.existsSync(p));
if (!keyPath) { console.error('Service account key not found.'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
const db = admin.firestore();
const ts = () => admin.firestore.FieldValue.serverTimestamp();

const MODULE_NUMBERS = [3, 4]; // Math only — R&W (1, 2) is never read or written
const PAIRS = [
  { a: { id: 'KxtUBwK850szjDJRwmCW', title: 'Exam 7' }, b: { id: 'LOafADEJwRWqNz4lrEGx', title: 'Exam 9' } },
  { a: { id: 'xnKtCv9ci0V35sh7TcFL', title: 'Exam 8' }, b: { id: 'tV8bmOPkWywuHnSeECmE', title: 'Exam 10' } },
];

const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK_IDX = process.argv.indexOf('--rollback');

function snippet(q) {
  const t = (q && (q.text || q.questionText || '')) || '';
  const s = t.replace(/\s+/g, ' ').slice(0, 70);
  return s || '(no text — likely figure-based)';
}

async function rollback(file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  const batch = db.batch();
  for (const m of backup.modules) {
    batch.update(db.collection('examModules').doc(m.moduleDocId), {
      questionIds: m.prevQuestionIds,
      questionCount: m.prevQuestionIds.length,
      updatedAt: ts(),
    });
    console.log(`will restore ${m.examTitle} M${m.moduleNumber} (${m.moduleDocId}) -> ${m.prevQuestionIds.length} questions`);
  }
  await batch.commit();
  console.log('Rollback complete — all modules restored to their pre-swap questionIds.');
}

/** Load an exam and its two Math module docs (moduleNumber 3 and 4). */
async function loadExamMath(examRef) {
  const snap = await db.collection('practiceExams').doc(examRef.id).get();
  if (!snap.exists) throw new Error(`Exam ${examRef.id} ("${examRef.title}") not found`);
  const exam = snap.data();
  if (exam.title !== examRef.title) {
    throw new Error(`Exam title mismatch for ${examRef.id}: Firestore says "${exam.title}", expected "${examRef.title}"`);
  }
  const mods = {};
  for (const mid of exam.moduleIds || []) {
    const md = await db.collection('examModules').doc(mid).get();
    if (!md.exists) continue;
    const m = md.data();
    if (MODULE_NUMBERS.includes(m.moduleNumber)) {
      if (mods[m.moduleNumber]) throw new Error(`"${examRef.title}" has TWO modules with moduleNumber ${m.moduleNumber} — aborting`);
      mods[m.moduleNumber] = { id: mid, ...m };
    }
  }
  for (const n of MODULE_NUMBERS) {
    if (!mods[n]) throw new Error(`"${examRef.title}" is missing Math module ${n}: found [${Object.keys(mods).join(', ') || 'none'}]`);
  }
  return { id: examRef.id, title: exam.title, mods };
}

/** Verify every referenced question doc exists; return first-question snippet. */
async function auditModule(label, mod) {
  const ids = mod.questionIds || [];
  if (ids.length === 0) throw new Error(`${label}: module ${mod.id} has NO questions`);
  let firstQ = null;
  const missing = [];
  for (let i = 0; i < ids.length; i++) {
    const qd = await db.collection('questions').doc(ids[i]).get();
    if (!qd.exists) missing.push(ids[i]);
    else if (i === 0) firstQ = qd.data();
  }
  if (missing.length) throw new Error(`${label}: ${missing.length} question doc(s) missing: ${missing.join(', ')}`);
  return snippet(firstQ);
}

async function main() {
  if (ROLLBACK_IDX !== -1) {
    const file = process.argv[ROLLBACK_IDX + 1];
    if (!file) throw new Error('--rollback requires a backup file path');
    return rollback(path.resolve(file));
  }

  // ---- Load and validate everything BEFORE any write ----
  const plan = [];
  const backup = { at: new Date().toISOString(), note: 'MATH swap Exam7<->Exam9, Exam8<->Exam10 (modules 3 & 4 only). To roll back: node scripts/swapExamsMath.js --rollback <this file>. (Re-running the swap script also undoes it.)', modules: [] };

  for (const pair of PAIRS) {
    const A = await loadExamMath(pair.a);
    const B = await loadExamMath(pair.b);
    for (const n of MODULE_NUMBERS) {
      const labelA = `${A.title} M${n}`, labelB = `${B.title} M${n}`;
      const sA = await auditModule(labelA, A.mods[n]);
      const sB = await auditModule(labelB, B.mods[n]);
      plan.push({
        n,
        a: { exam: A.title, modId: A.mods[n].id, modTitle: A.mods[n].title, count: (A.mods[n].questionIds || []).length, first: sA, ids: A.mods[n].questionIds },
        b: { exam: B.title, modId: B.mods[n].id, modTitle: B.mods[n].title, count: (B.mods[n].questionIds || []).length, first: sB, ids: B.mods[n].questionIds },
      });
      backup.modules.push(
        { examId: A.id, examTitle: A.title, moduleNumber: n, moduleDocId: A.mods[n].id, prevQuestionIds: A.mods[n].questionIds || [] },
        { examId: B.id, examTitle: B.title, moduleNumber: n, moduleDocId: B.mods[n].id, prevQuestionIds: B.mods[n].questionIds || [] },
      );
    }
  }

  // Sanity: no module doc may appear twice, and paired modules must not share question docs.
  const seen = new Set();
  for (const m of backup.modules) {
    if (seen.has(m.moduleDocId)) throw new Error(`Module doc ${m.moduleDocId} appears twice — aborting`);
    seen.add(m.moduleDocId);
  }
  for (const p of plan) {
    const overlap = p.a.ids.filter(id => p.b.ids.includes(id));
    if (overlap.length) throw new Error(`${p.a.exam} M${p.n} and ${p.b.exam} M${p.n} share ${overlap.length} question doc(s) — a swap would be meaningless for those. Aborting.`);
  }

  console.log(`\n=== MATH MODULE SWAP PLAN ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===`);
  for (const p of plan) {
    console.log(`\nModule ${p.n}:  ${p.a.exam} <-> ${p.b.exam}`);
    console.log(`  ${p.a.exam.padEnd(7)} "${p.a.modTitle}" (${p.a.modId}) ${p.a.count} q | Q1: "${p.a.first}..."`);
    console.log(`  ${p.b.exam.padEnd(7)} "${p.b.modTitle}" (${p.b.modId}) ${p.b.count} q | Q1: "${p.b.first}..."`);
    console.log(`  -> after swap, ${p.a.exam} serves the ${p.b.count} questions above-right, ${p.b.exam} serves the ${p.a.count} above-left.`);
  }

  if (DRY_RUN) { console.log('\n[DRY RUN] all validations passed — no changes written.'); return; }

  // ---- Backup ----
  const dir = path.resolve(__dirname, 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const bpath = path.join(dir, `math_swap_e7e9_e8e10_backup_${Date.now()}.json`);
  fs.writeFileSync(bpath, JSON.stringify(backup, null, 2));
  console.log('\nBackup written:', bpath);

  // ---- Single atomic batch: 8 module updates ----
  const batch = db.batch();
  for (const p of plan) {
    batch.update(db.collection('examModules').doc(p.a.modId), { questionIds: p.b.ids, questionCount: p.b.ids.length, updatedAt: ts() });
    batch.update(db.collection('examModules').doc(p.b.modId), { questionIds: p.a.ids, questionCount: p.a.ids.length, updatedAt: ts() });
  }
  await batch.commit();
  console.log('Batch committed.');

  // ---- Verify ----
  let ok = true;
  for (const p of plan) {
    const aNow = (await db.collection('examModules').doc(p.a.modId).get()).data();
    const bNow = (await db.collection('examModules').doc(p.b.modId).get()).data();
    const aOk = JSON.stringify(aNow.questionIds) === JSON.stringify(p.b.ids);
    const bOk = JSON.stringify(bNow.questionIds) === JSON.stringify(p.a.ids);
    if (!aOk || !bOk) ok = false;
    console.log(`Module ${p.n}: ${p.a.exam} now ${aNow.questionIds.length} q (${aOk ? 'OK' : 'MISMATCH'}), ${p.b.exam} now ${bNow.questionIds.length} q (${bOk ? 'OK' : 'MISMATCH'})`);
  }
  console.log(ok ? '\nDONE — Math modules of Exam 7<->Exam 9 and Exam 8<->Exam 10 are swapped.' : '\nVERIFICATION FAILED — inspect the modules and consider --rollback with the backup above.');
  if (!ok) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode || 0)).catch((e) => { console.error('Failed:', e); process.exit(1); });
