#!/usr/bin/env node
/**
 * Retire questions from a subcategory so they stop entering new quizzes.
 *
 * Retirement is a soft flag, not a delete. Retired docs keep their ids, so:
 *   - historical `smartQuizzes` and user attempt records still resolve,
 *   - `questionStats` peer aggregates stay meaningful,
 *   - any `examModules` / `practiceExams` that reference the id keep working,
 *   - the operation is fully reversible with --unretire.
 *
 * Retiring sets BOTH of these on each doc:
 *   retired: true, retiredAt, retiredReason   — the canonical flag, honoured by the
 *     repo's selection code (questionBankServices.js, smartQuizUtils.js, questionsAPI.js)
 *   usageContext: 'retired' (previous value preserved in originalUsageContext) — makes
 *     retirement effective on ALREADY-DEPLOYED site code too, because every deployed
 *     selection path filters `!usageContext || usageContext === 'general'`. Without this,
 *     retired questions would keep appearing in quizzes until the next deploy.
 * --unretire restores usageContext from originalUsageContext and clears the flag.
 *
 * Usage:
 *   node scripts/retireQuestions.js --subcategory form-structure-sense --dry-run
 *   node scripts/retireQuestions.js --subcategory form-structure-sense --reason "replaced by fss-refresh-2026-08"
 *   node scripts/retireQuestions.js --subcategory form-structure-sense --unretire
 *
 * Options:
 *   --subcategory <kebab>   required; matched across subcategory / subCategory / subcategoryId
 *   --reason <text>         stored on each doc as retiredReason
 *   --usage-context <ctx>   only touch docs with this usageContext (default: general)
 *                           'any' to include exam-only docs as well
 *   --keep <id,id,...>      question ids to leave alone
 *   --dry-run               report what would change and write no data
 *   --unretire              clear the flag instead of setting it
 *   --limit <n>             safety cap on how many docs may be modified (default 2000)
 */

const path = require('path');
const fs = require('fs');

// ------------------------------------------------------------------- arguments

function parseArgs(argv) {
  const args = { dryRun: false, unretire: false, usageContext: 'general', keep: [], limit: 2000 };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[(i += 1)];
    switch (a) {
      case '--subcategory': args.subcategory = next(); break;
      case '--reason': args.reason = next(); break;
      case '--usage-context': args.usageContext = next(); break;
      case '--keep': args.keep = (next() || '').split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--limit': args.limit = Number(next()); break;
      case '--dry-run': args.dryRun = true; break;
      case '--unretire': args.unretire = true; break;
      case '--help': case '-h': args.help = true; break;
      default:
        console.error(`Unknown argument: ${a}`);
        process.exit(1);
    }
  }
  return args;
}

const args = parseArgs(process.argv);

if (args.help || !args.subcategory) {
  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^\/\*\*?/, '').replace(/^ ?\* ?/gm, ''));
  process.exit(args.help ? 0 : 1);
}

// Resolve the subcategory through the canonical map so aliases, display names, and numeric
// ids all work. resolveSubcategory returns { id, kebab, name, section, mainCategory }.
let subcatInfo = null;
try {
  const { resolveSubcategory } = require('./lib/subcategoryMap');
  subcatInfo = resolveSubcategory(args.subcategory);
} catch (e) {
  console.warn(`Could not load subcategoryMap (${e.message}) — matching on the literal string.`);
}
if (!subcatInfo) {
  console.warn(`"${args.subcategory}" did not resolve to a known subcategory; matching on the literal string.`);
}
const kebab = (subcatInfo && subcatInfo.kebab) || args.subcategory;
const numericId = subcatInfo ? subcatInfo.id : null;

// ---------------------------------------------------------------------- main

async function main() {
  const { initFirebaseAdmin } = require('./lib/firestoreUploader');
  const admin = initFirebaseAdmin();
  const db = admin.firestore();

  console.log(`Subcategory : ${kebab}${numericId != null ? ` (numericId ${numericId})` : ''}`);
  console.log(`Action      : ${args.unretire ? 'UNRETIRE' : 'RETIRE'}`);
  console.log(`Usage ctx   : ${args.usageContext}`);
  console.log(`Mode        : ${args.dryRun ? 'DRY RUN — no writes' : 'LIVE'}`);
  if (args.keep.length) console.log(`Keeping     : ${args.keep.join(', ')}`);
  console.log('');

  // The bank is inconsistent about which field carries the subcategory, so gather across
  // all known shapes and de-duplicate by document id — the same strategy
  // getQuestionsBySubcategory uses on the client.
  const queries = [
    db.collection('questions').where('subcategory', '==', kebab),
    db.collection('questions').where('subCategory', '==', kebab),
  ];
  if (numericId != null) {
    queries.push(db.collection('questions').where('subcategoryId', '==', numericId));
  }
  // Some legacy docs carry the display name instead of the kebab id; the client query
  // tries this variant too, so retirement must cover it.
  if (subcatInfo && subcatInfo.name && subcatInfo.name !== kebab) {
    queries.push(db.collection('questions').where('subcategory', '==', subcatInfo.name));
    queries.push(db.collection('questions').where('subCategory', '==', subcatInfo.name));
  }

  const found = new Map();
  let queryFailures = 0;
  for (const q of queries) {
    let snap;
    try {
      snap = await q.get();
    } catch (e) {
      queryFailures += 1;
      console.warn(`  ! a query failed (${e.message})`);
      continue;
    }
    snap.docs.forEach((d) => { if (!found.has(d.id)) found.set(d.id, d); });
  }

  // A partial match set must never drive writes: retiring only the docs we happened to
  // find would leave the rest live and the operation half-done.
  if (queryFailures > 0) {
    console.error(`\nAborting: ${queryFailures} of ${queries.length} match queries failed, so the match set is unreliable.`);
    console.error('Fix the underlying error (often a rate/quota limit — wait and retry) and run again.');
    process.exit(1);
  }

  console.log(`Matched ${found.size} question(s) in the subcategory.`);

  const keepSet = new Set(args.keep);
  const targets = [];
  const skipped = { alreadyInState: 0, usageContext: 0, kept: 0 };

  found.forEach((doc) => {
    const d = doc.data();
    if (keepSet.has(doc.id)) { skipped.kept += 1; return; }
    if (args.usageContext !== 'any') {
      // A retired doc's live usageContext is 'retired'; judge it by what it was
      // before retirement so `--unretire` symmetrically reverses `retire`.
      const ctx = (d.retired === true ? d.originalUsageContext : d.usageContext) || 'general';
      if (ctx !== args.usageContext) { skipped.usageContext += 1; return; }
    }
    const isRetired = d.retired === true;
    if (args.unretire ? !isRetired : isRetired) { skipped.alreadyInState += 1; return; }
    targets.push({ doc, data: d });
  });

  console.log(`  to change        : ${targets.length}`);
  console.log(`  already in state : ${skipped.alreadyInState}`);
  console.log(`  wrong usageCtx   : ${skipped.usageContext}`);
  console.log(`  explicitly kept  : ${skipped.kept}`);

  if (targets.length > args.limit) {
    console.error(`\nAborting: ${targets.length} docs exceeds the --limit of ${args.limit}.`);
    console.error('Raise --limit deliberately if this is really what you want.');
    process.exit(1);
  }

  // Report a sample so a human can eyeball what is about to be withheld.
  const sample = targets.slice(0, 10);
  if (sample.length) {
    console.log('\nSample:');
    sample.forEach(({ doc, data }) => {
      const text = String(data.text || '').replace(/\s+/g, ' ').slice(0, 88);
      console.log(`  ${doc.id}  [${data.difficulty || '?'}] ${text}…`);
    });
    if (targets.length > sample.length) console.log(`  … and ${targets.length - sample.length} more`);
  }

  // Cross-reference: warn if a target is used by an exam or a stored quiz, since retiring it
  // is safe but the reference is worth knowing about.
  const targetIds = new Set(targets.map((t) => t.doc.id));
  if (targetIds.size) {
    const referenced = new Set();
    for (const coll of ['examModules', 'practiceExams']) {
      try {
        const snap = await db.collection(coll).get();
        snap.docs.forEach((d) => {
          (d.data().questionIds || []).forEach((qid) => { if (targetIds.has(qid)) referenced.add(qid); });
        });
      } catch (e) {
        console.warn(`  ! could not scan ${coll}: ${e.message}`);
      }
    }
    if (referenced.size) {
      console.log(`\nNote: ${referenced.size} of these are referenced by an exam module or practice exam.`);
      console.log('Retiring is safe — those exams resolve by id and are unaffected. Nothing to do.');
    }
  }

  if (args.dryRun) {
    console.log('\nDry run complete. No data was written.');
    return;
  }
  if (!targets.length) {
    console.log('\nNothing to do.');
    return;
  }

  // Full-document backup BEFORE any write, so rollback never depends on the script's
  // own inverse logic being right.
  const backupDir = path.resolve(__dirname, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const docBackupFile = path.join(backupDir, `retire-${kebab}-${stamp}-docs.json`);
  fs.writeFileSync(
    docBackupFile,
    JSON.stringify(targets.map(({ doc, data }) => ({ id: doc.id, data })), null, 2),
    'utf8',
  );
  console.log(`\nBacked up ${targets.length} full document(s) to ${docBackupFile}`);

  const now = admin.firestore.FieldValue.serverTimestamp();
  const payloadFor = (data) => {
    if (args.unretire) {
      return {
        retired: admin.firestore.FieldValue.delete(),
        retiredAt: admin.firestore.FieldValue.delete(),
        retiredReason: admin.firestore.FieldValue.delete(),
        // Restore the pre-retirement usage context; default to 'general' for docs
        // retired before originalUsageContext existed.
        usageContext: data.originalUsageContext || 'general',
        originalUsageContext: admin.firestore.FieldValue.delete(),
        updatedAt: now,
      };
    }
    return {
      retired: true,
      retiredAt: now,
      retiredReason: args.reason || `retired by scripts/retireQuestions.js on ${new Date().toISOString().slice(0, 10)}`,
      // The deployed selection code predates the `retired` flag but always filters
      // `!usageContext || usageContext === 'general'`, so this makes retirement take
      // effect immediately, without waiting for a deploy.
      usageContext: 'retired',
      originalUsageContext: data.usageContext || 'general',
      updatedAt: now,
    };
  };

  // Firestore caps a batch at 500 writes.
  let written = 0;
  for (let i = 0; i < targets.length; i += 400) {
    const slice = targets.slice(i, i + 400);
    const batch = db.batch();
    slice.forEach(({ doc, data }) => batch.update(doc.ref, payloadFor(data)));
    await batch.commit();
    written += slice.length;
    console.log(`  committed ${written}/${targets.length}`);
  }

  // Write an audit record so the operation is traceable and reversible.
  const backupFile = path.join(backupDir, `retire-${kebab}-${stamp}.json`);
  fs.writeFileSync(
    backupFile,
    JSON.stringify(
      {
        subcategory: kebab,
        action: args.unretire ? 'unretire' : 'retire',
        reason: args.reason || null,
        usageContext: args.usageContext,
        at: new Date().toISOString(),
        questionIds: targets.map((t) => t.doc.id),
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`\n✓ ${args.unretire ? 'Unretired' : 'Retired'} ${written} question(s).`);
  console.log(`  audit record: ${backupFile}`);
  console.log(`  to undo: node scripts/retireQuestions.js --subcategory ${kebab} --unretire`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
