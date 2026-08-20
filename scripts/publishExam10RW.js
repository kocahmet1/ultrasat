/**
 * Publish the authored Reading & Writing modules in
 * scripts/data/practiceTest10RW.v2.json to the live "Exam 10" practice exam.
 *
 * Exam 10's modules 1 and 2 currently serve the legacy Exam 2 questions (53
 * items, one short of a full form). This script replaces them with the 27 + 27
 * authored items.
 *
 * The script is IDEMPOTENT: it first inspects what is live and exits without
 * writing if Exam 10 is already serving this form. The two Math modules
 * (moduleNumber 3 and 4) are never touched.
 *
 * Existing examModule documents are reused where they exist — their IDs,
 * titles and moduleNumbers do not change, only their questionIds are
 * repointed. If module 1 or 2 does not exist it is created and appended to the
 * exam's moduleIds.
 *
 * A JSON backup of the previous questionIds and full question documents is
 * written to scripts/backups/ before anything changes, so the swap is
 * reversible with --rollback.
 *
 * Usage:
 *   node scripts/publishExam10RW.js --dry-run    # show the plan, write nothing
 *   node scripts/publishExam10RW.js              # back up, create, repoint
 *   node scripts/publishExam10RW.js --force      # republish even if already live
 *   node scripts/publishExam10RW.js --rollback scripts/backups/<file>.json
 *
 * Options:
 *   --exam-id <id>   target a specific practiceExams doc instead of resolving
 *                    by title (useful if more than one exam is titled "Exam 10")
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { buildQuestionDoc, buildModuleDoc } = require('./lib/diagnosticDocBuilder');

const EXAM_TITLE = 'Exam 10';
const DATA_FILE = 'data/practiceTest10RW.v2.json';
const VALIDATOR = 'validatePracticeTest10RW.v2.js';
const RW_MODULES = [1, 2];

const data = require(path.resolve(__dirname, DATA_FILE));

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valueOf = (f) => { const i = argv.indexOf(f); return i === -1 ? null : argv[i + 1]; };

const DRY_RUN = has('--dry-run');
const FORCE = has('--force');
const ROLLBACK_FILE = valueOf('--rollback');
const EXAM_ID_OVERRIDE = valueOf('--exam-id');

/** Stable fingerprint of the authored content of one question. */
function fingerprint(q) {
  return crypto.createHash('sha1').update(JSON.stringify([
    String(q.text || '').trim(),
    String(q.passage || '').trim(),
    (q.options || []).map((o) => String(o).trim()),
    q.correctAnswer,
  ])).digest('hex');
}

function preflight() {
  const problems = [];
  if (!Array.isArray(data.modules) || data.modules.length !== 2) {
    problems.push(`expected 2 modules, got ${data.modules ? data.modules.length : 0}`);
  }
  for (const mod of data.modules || []) {
    if (!RW_MODULES.includes(mod.moduleNumber)) problems.push(`unexpected moduleNumber ${mod.moduleNumber}`);
    if ((mod.questions || []).length !== 27) {
      problems.push(`module ${mod.moduleNumber} has ${(mod.questions || []).length} questions, expected 27`);
    }
    (mod.questions || []).forEach((q, i) => {
      if (q.originalQuestionNumber !== i + 1) {
        problems.push(`module ${mod.moduleNumber} Q${q.originalQuestionNumber} out of sequence at index ${i}`);
      }
    });
  }
  if (problems.length) {
    throw new Error(`Refusing to publish — ${DATA_FILE} failed preflight:\n  - ${problems.join('\n  - ')}`);
  }

  // Run the form validator. Publishing a form that does not validate is never
  // what we want, so a nonzero exit aborts unless --force is given.
  const validatorPath = path.resolve(__dirname, VALIDATOR);
  if (!fs.existsSync(validatorPath)) {
    console.log(`  ! validator ${VALIDATOR} not found — skipping`);
    return;
  }
  try {
    execFileSync(process.execPath, [validatorPath], { stdio: 'pipe' });
    console.log('  validator: 0 errors');
  } catch (e) {
    const out = `${e.stdout || ''}${e.stderr || ''}`;
    const errs = out.split('\n').filter((l) => l.includes('ERROR:')).slice(0, 10);
    if (!FORCE) {
      throw new Error(`Validator reported errors — aborting (use --force to override):\n${errs.join('\n')}`);
    }
    console.log(`  ! validator reported errors, continuing because --force:\n${errs.join('\n')}`);
  }
}

async function resolveExam(db) {
  if (EXAM_ID_OVERRIDE) {
    const snap = await db.collection('practiceExams').doc(EXAM_ID_OVERRIDE).get();
    if (!snap.exists) throw new Error(`practiceExams/${EXAM_ID_OVERRIDE} not found`);
    return { id: snap.id, ...snap.data() };
  }
  const all = await db.collection('practiceExams').get();
  const matches = all.docs.filter((d) => (d.data().title || '').trim() === EXAM_TITLE);
  if (matches.length === 0) throw new Error(`No practiceExams doc titled "${EXAM_TITLE}"`);
  if (matches.length > 1) {
    throw new Error(`${matches.length} exams titled "${EXAM_TITLE}" (${matches.map((m) => m.id).join(', ')}). Re-run with --exam-id <id>.`);
  }
  return { id: matches[0].id, ...matches[0].data() };
}

async function loadRwModules(db, exam) {
  const found = {};
  for (const mid of exam.moduleIds || []) {
    const snap = await db.collection('examModules').doc(mid).get();
    if (!snap.exists) continue;
    const m = snap.data();
    if (RW_MODULES.includes(m.moduleNumber)) found[m.moduleNumber] = { id: snap.id, ...m };
  }
  return found;
}

/** True when the live modules already serve exactly this authored form. */
async function alreadyLive(db, rw) {
  const wanted = {};
  for (const mod of data.modules) wanted[mod.moduleNumber] = mod.questions.map(fingerprint);

  for (const n of RW_MODULES) {
    if (!rw[n]) return { live: false, why: `module ${n} does not exist on the exam` };
    const ids = rw[n].questionIds || [];
    if (ids.length !== wanted[n].length) {
      return { live: false, why: `module ${n} serves ${ids.length} questions, this form has ${wanted[n].length}` };
    }
    for (let i = 0; i < ids.length; i += 1) {
      const snap = await db.collection('questions').doc(ids[i]).get();
      if (!snap.exists) return { live: false, why: `module ${n} question ${i + 1} (${ids[i]}) is missing` };
      if (fingerprint(snap.data()) !== wanted[n][i]) {
        return { live: false, why: `module ${n} question ${i + 1} differs from the authored form` };
      }
    }
  }
  return { live: true };
}

async function rollback(db, admin, file) {
  const backup = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  for (const n of Object.keys(backup.modules)) {
    const m = backup.modules[n];
    await db.collection('examModules').doc(m.moduleDocId).update({
      questionIds: m.prevQuestionIds,
      questionCount: m.prevQuestionIds.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`rolled back module ${n} (${m.moduleDocId}) -> ${m.prevQuestionIds.length} questions`);
  }
  console.log('Rollback complete. (Question docs created by the publish are left in place but unreferenced.)');
}

async function main() {
  const admin = initFirebaseAdmin();
  const db = admin.firestore();
  const ts = () => admin.firestore.FieldValue.serverTimestamp();

  if (ROLLBACK_FILE) return rollback(db, admin, ROLLBACK_FILE);

  console.log(`Preflight on ${DATA_FILE} (${data.examSlug})`);
  preflight();

  const exam = await resolveExam(db);
  console.log(`Target exam: "${exam.title}" (${exam.id})`);

  const rw = await loadRwModules(db, exam);
  for (const n of RW_MODULES) {
    console.log(rw[n]
      ? `  module ${n}: ${rw[n].id} — ${(rw[n].questionIds || []).length} questions live`
      : `  module ${n}: MISSING (will be created)`);
  }

  const state = await alreadyLive(db, rw);
  if (state.live && !FORCE) {
    console.log(`\nAlready live — Exam 10 modules 1 and 2 already serve ${data.examSlug}. Nothing to do.`);
    return;
  }
  if (state.live && FORCE) console.log('\nAlready live, but --force given: republishing.');
  else console.log(`\nNot live yet (${state.why}). Publishing.`);

  // Backup everything we are about to repoint.
  const backup = {
    exam: { id: exam.id, title: exam.title },
    at: new Date().toISOString(),
    replacedWith: data.examSlug,
    modules: {},
  };
  for (const n of RW_MODULES) {
    if (!rw[n]) continue;
    const qs = [];
    for (const qid of rw[n].questionIds || []) {
      const qd = await db.collection('questions').doc(qid).get();
      qs.push(qd.exists ? { id: qid, ...qd.data() } : { id: qid, _missing: true });
    }
    backup.modules[n] = {
      moduleDocId: rw[n].id,
      title: rw[n].title,
      moduleNumber: n,
      prevQuestionIds: rw[n].questionIds || [],
      prevQuestions: qs,
    };
  }
  if (!DRY_RUN) {
    const dir = path.resolve(__dirname, 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const bpath = path.join(dir, `exam10_rw_backup_${Date.now()}.json`);
    fs.writeFileSync(bpath, JSON.stringify(backup, null, 2));
    console.log(`Backup written: ${bpath}`);
  } else {
    const total = Object.values(backup.modules).reduce((a, m) => a + m.prevQuestionIds.length, 0);
    console.log(`[DRY RUN] would back up ${total} live questions`);
  }

  const newModuleIds = [...(exam.moduleIds || [])];
  let examNeedsUpdate = false;

  for (const mod of data.modules) {
    const n = mod.moduleNumber;
    const ids = [];
    for (const qq of mod.questions) {
      const doc = buildQuestionDoc(qq, n, data.examSlug);
      if (DRY_RUN) { ids.push(`dry-${n}-${qq.originalQuestionNumber}`); continue; }
      const ref = await db.collection('questions').add({ ...doc, createdAt: ts(), updatedAt: ts() });
      ids.push(ref.id);
    }
    console.log(`Module ${n}: ${DRY_RUN ? 'would create' : 'created'} ${ids.length} question docs`);
    if (DRY_RUN) continue;

    if (rw[n]) {
      await db.collection('examModules').doc(rw[n].id).update({
        questionIds: ids,
        questionCount: ids.length,
        timeLimit: mod.timeLimit,
        calculatorAllowed: mod.calculatorAllowed,
        originalExam: data.examSlug,
        updatedAt: ts(),
      });
      console.log(`  repointed existing module doc ${rw[n].id}`);
    } else {
      const ref = await db.collection('examModules').add({
        ...buildModuleDoc(mod, ids, data.examSlug), createdAt: ts(), updatedAt: ts(),
      });
      newModuleIds.splice(n - 1, 0, ref.id);
      examNeedsUpdate = true;
      console.log(`  created module doc ${ref.id} and inserted at position ${n}`);
    }
  }

  if (!DRY_RUN && examNeedsUpdate) {
    await db.collection('practiceExams').doc(exam.id).update({ moduleIds: newModuleIds, updatedAt: ts() });
    console.log(`Updated practiceExams/${exam.id} moduleIds`);
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] no changes written.');
    return;
  }

  // Verify by re-reading what is now live.
  const examAfter = await resolveExam(db);
  const rwAfter = await loadRwModules(db, examAfter);
  const verify = await alreadyLive(db, rwAfter);
  if (!verify.live) throw new Error(`Post-publish verification FAILED: ${verify.why}`);
  console.log('\nDONE — Exam 10 modules 1 and 2 now serve the authored form. Verified live.');
}

main().then(() => process.exit(0)).catch((e) => { console.error('Failed:', e.message || e); process.exit(1); });
