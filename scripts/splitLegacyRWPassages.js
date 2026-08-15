/**
 * Split legacy R&W questions whose `text` field still contains BOTH the
 * passage and the question stem (with no separate `passage` field) into the
 * modern two-field format:
 *
 *   passage  <- everything before the stem
 *   text     <- the stem only ("Which choice ...?")
 *
 * Why: the exam interface renders `passage` in the left column and `text`
 * (the stem) in the right column above the answer choices, mirroring
 * Bluebook. Questions in the legacy combined format fall back to the old
 * layout until they are split.
 *
 * Scope: every question referenced by an R&W module (moduleNumber 1 or 2) of
 * any doc in `practiceExams` whose `passage` is missing/empty. As of writing
 * this is the 108 questions served by Exam 9 and Exam 10. Questions whose
 * `text` is ALREADY stem-only (e.g. the 7 graph-stimulus questions) are
 * detected (stem match at position 0) and skipped untouched.
 *
 * Stem detection, in order:
 *   1. LAST occurrence of a canonical stem opener ("Which choice ...",
 *      "According to the text ...", etc.) whose tail ends with "?".
 *   2. Fallback: the last blank-line-separated paragraph, if it ends with
 *      "?", is < 300 chars, and mentions the text/choices (covers stems such
 *      as "Information in the text best supports which statement ...?").
 * Anything still unmatched is reported and left unchanged.
 *
 * A JSON backup of every changed doc's previous {text, passage} is written to
 * scripts/backups/ before any write, so the operation is reversible.
 *
 * Usage:
 *   node scripts/splitLegacyRWPassages.js --dry-run    # show the plan, write nothing
 *   node scripts/splitLegacyRWPassages.js              # back up, split, verify
 *   node scripts/splitLegacyRWPassages.js --rollback scripts/backups/<file>.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyCandidates = [
  process.env.SERVICE_ACCOUNT_KEY,
  path.join(__dirname, '..', 'ultrasat-5e4c4-369f564bdaef.json'),
  path.join(__dirname, 'ultrasat-5e4c4-369f564bdaef.json'),
  path.join(__dirname, 'serviceAccountKey.json'),
].filter(Boolean);
const keyPath = keyCandidates.find(p => fs.existsSync(p));
if (!keyPath) { console.error('Service account key not found.'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
const db = admin.firestore();
const ts = () => admin.firestore.FieldValue.serverTimestamp();

const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK_IDX = process.argv.indexOf('--rollback');

// Canonical SAT R&W stem openers. The stem is the LAST match in the text.
const STEM_OPENER = new RegExp(
  '(Which choice|Which finding|Which quotation|Which statement|Which of the following|'
  + 'According to the text|Based on the text|As used in the text|'
  + 'What is the main|What function does|What does the text|What choice|'
  + 'It can most reasonably be inferred|The author most likely|'
  + 'Information in the text)', 'g');

// Fallback for stems that do not START with a canonical opener: accept the
// final paragraph when it is clearly a question about the text.
const FALLBACK_HINT = /\b(text|texts|choice|statement|finding|quotation|underlined|notes|student)\b/i;

// Rhetorical Synthesis ("notes") questions have a TWO-sentence stem in
// Bluebook: "The student wants to <goal>. Which choice most effectively uses
// relevant information from the notes to accomplish this goal?" The goal
// sentence sits immediately before the "Which choice ..." opener, so after
// the opener split it would be stranded at the end of the passage. Move it
// into the stem, matching the format of the modern question bank.
const GOAL_SENTENCE = /(The student wants[^.?]*[.?])\s*$/;

function relocateGoalSentence(passage, stem) {
  const m = passage.match(GOAL_SENTENCE);
  if (!m) return { passage, stem };
  return {
    passage: passage.slice(0, m.index).trimEnd(),
    stem: `${m[1].trim()} ${stem}`,
  };
}

function detectStem(text) {
  // Pass 1: last canonical opener whose tail is a plausible stem.
  const matches = [...text.matchAll(STEM_OPENER)];
  if (matches.length) {
    const last = matches[matches.length - 1];
    const stem = text.slice(last.index).trim();
    if (stem.endsWith('?') && stem.length <= 300) {
      return { index: last.index, stem, how: 'opener' };
    }
  }
  // Pass 2: last paragraph fallback.
  const cut = text.lastIndexOf('\n\n');
  if (cut !== -1) {
    const stem = text.slice(cut).trim();
    if (stem.endsWith('?') && stem.length < 300 && FALLBACK_HINT.test(stem)) {
      return { index: cut, stem, how: 'last-paragraph' };
    }
  }
  return null;
}

async function loadLegacyRWQuestions() {
  const exams = await db.collection('practiceExams').get();
  const moduleRefs = [];
  exams.forEach(e => {
    const d = e.data();
    (d.moduleIds || []).forEach(mid => moduleRefs.push({ examTitle: d.title || e.id, mid }));
  });

  const legacy = []; // { label, id, text }
  const seen = new Set();
  for (const { examTitle, mid } of moduleRefs) {
    const md = await db.collection('examModules').doc(mid).get();
    if (!md.exists) continue;
    const m = md.data();
    if (m.moduleNumber !== 1 && m.moduleNumber !== 2) continue;
    const ids = m.questionIds || [];
    for (let i = 0; i < ids.length; i += 300) {
      const chunk = ids.slice(i, i + 300).filter(id => !seen.has(id));
      chunk.forEach(id => seen.add(id));
      if (!chunk.length) continue;
      const snaps = await db.getAll(...chunk.map(id => db.collection('questions').doc(id)));
      for (const s of snaps) {
        if (!s.exists) { console.warn(`MISSING question doc ${s.id} (${examTitle} M${m.moduleNumber})`); continue; }
        const q = s.data();
        const passageEmpty = !(typeof q.passage === 'string' && q.passage.trim());
        const hasText = typeof q.text === 'string' && q.text.trim();
        if (passageEmpty && hasText) {
          legacy.push({
            label: `${examTitle} M${m.moduleNumber}`,
            id: s.id,
            text: q.text,
            prevPassage: 'passage' in q ? q.passage : undefined,
            hadPassageField: 'passage' in q,
          });
        }
      }
    }
  }
  return legacy;
}

async function rollback(file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  const entries = backup.questions || [];
  for (let i = 0; i < entries.length; i += 400) {
    const batch = db.batch();
    for (const q of entries.slice(i, i + 400)) {
      const upd = { text: q.prevText, updatedAt: ts() };
      upd.passage = q.hadPassageField ? q.prevPassage : admin.firestore.FieldValue.delete();
      batch.update(db.collection('questions').doc(q.id), upd);
    }
    await batch.commit();
  }
  console.log(`Rollback complete — ${entries.length} question(s) restored.`);
}

async function main() {
  if (ROLLBACK_IDX !== -1) {
    const file = process.argv[ROLLBACK_IDX + 1];
    if (!file) throw new Error('--rollback requires a backup file path');
    return rollback(path.resolve(file));
  }

  const legacy = await loadLegacyRWQuestions();
  console.log(`\nLegacy-format R&W questions found (passage empty, text set): ${legacy.length}`);

  const plan = [];
  const stemOnly = [];
  const unmatched = [];
  for (const q of legacy) {
    const hit = detectStem(q.text);
    if (!hit) { unmatched.push(q); continue; }
    const rawPassage = q.text.slice(0, hit.index).trim();
    if (!rawPassage) { stemOnly.push({ ...q, how: hit.how }); continue; } // already stem-only (graph stimulus etc.)
    const { passage, stem } = relocateGoalSentence(rawPassage, hit.stem);
    if (!passage) { unmatched.push(q); continue; } // goal sentence was the whole prefix — needs a human look
    plan.push({ ...q, passage, stem, how: hit.how });
  }

  console.log(`  will split:        ${plan.length}`);
  console.log(`  stem-only, skipped: ${stemOnly.length} (stimulus is a figure; text already the stem)`);
  console.log(`  UNMATCHED, skipped: ${unmatched.length}`);
  for (const q of unmatched) console.log(`    !! ${q.label} ${q.id} | ...${q.text.slice(-90).replace(/\s+/g, ' ')}`);

  console.log(`\n=== SPLIT PLAN ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===`);
  for (const p of plan) {
    console.log(`\n[${p.label}] ${p.id} (${p.how})`);
    console.log(`  passage: "${p.passage.slice(0, 80).replace(/\s+/g, ' ')}..." (${p.passage.length} ch)`);
    console.log(`  stem:    "${p.stem.replace(/\s+/g, ' ')}"`);
  }

  if (DRY_RUN) { console.log(`\n[DRY RUN] ${plan.length} question(s) would be updated — nothing written.`); return; }
  if (!plan.length) { console.log('Nothing to do.'); return; }

  // ---- Backup ----
  const dir = path.resolve(__dirname, 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const bpath = path.join(dir, `legacy_rw_split_backup_${Date.now()}.json`);
  fs.writeFileSync(bpath, JSON.stringify({
    at: new Date().toISOString(),
    note: 'Split of legacy combined passage+stem `text` into passage/text. Roll back: node scripts/splitLegacyRWPassages.js --rollback <this file>.',
    questions: plan.map(p => ({ id: p.id, label: p.label, prevText: p.text, prevPassage: p.prevPassage, hadPassageField: p.hadPassageField })),
  }, null, 2));
  console.log('\nBackup written:', bpath);

  // ---- Batched writes ----
  for (let i = 0; i < plan.length; i += 400) {
    const batch = db.batch();
    for (const p of plan.slice(i, i + 400)) {
      batch.update(db.collection('questions').doc(p.id), { passage: p.passage, text: p.stem, updatedAt: ts() });
    }
    await batch.commit();
  }
  console.log(`Committed ${plan.length} update(s).`);

  // ---- Verify ----
  let bad = 0;
  for (let i = 0; i < plan.length; i += 300) {
    const chunk = plan.slice(i, i + 300);
    const snaps = await db.getAll(...chunk.map(p => db.collection('questions').doc(p.id)));
    snaps.forEach((s, j) => {
      const q = s.data() || {};
      const ok = typeof q.passage === 'string' && q.passage.trim() && typeof q.text === 'string' && q.text.trim().endsWith('?');
      if (!ok) { bad++; console.error(`VERIFY FAIL ${chunk[j].id}`); }
    });
  }
  console.log(bad === 0
    ? `\nDONE — all ${plan.length} split questions verified (non-empty passage, stem ends with "?").`
    : `\nVERIFICATION FAILED for ${bad} doc(s) — consider --rollback with the backup above.`);
  if (bad) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode || 0)).catch(e => { console.error('Failed:', e); process.exit(1); });
