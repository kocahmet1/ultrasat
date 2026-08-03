#!/usr/bin/env node
/**
 * P1-A — structured-explanations backfill.
 *
 * Upgrades legacy blob-only question explanations to the structured shape the
 * app renders with components/ExplanationCard.jsx:
 *   explanationStructured: { rule?, steps?, choiceRebuttals?, thingsToRemember? }
 *
 * Two strategies:
 *   1. CHEAP LOCAL RE-PARSE (default): splits existing blobs back into
 *      walkthrough steps and per-choice rebuttals wherever the blob contains
 *      "Option B is incorrect because…"-style lines (the historical generator
 *      format that apps/api/questionsAPI.js used to flatten with join('\n')).
 *      No model calls, no cost. The legacy `explanation` string is left
 *      untouched (it stays the fallback).
 *   2. --regenerate: for blobs the local parser cannot structure, asks the
 *      model (apps/api/coach/modelAdapter) to rewrite the explanation into the
 *      structured object defined in docs/question_generation_prompt.md.
 *      >>> COSTS REAL MONEY — see the warning at regenerateStructuredExplanation.
 *
 * USAGE
 *   node scripts/backfill-structured-explanations.js                          # DRY RUN (default)
 *   node scripts/backfill-structured-explanations.js --subcategory transitions
 *   node scripts/backfill-structured-explanations.js --limit 50               # cap questions processed
 *   node scripts/backfill-structured-explanations.js --apply                  # WRITE re-parsed structures
 *   node scripts/backfill-structured-explanations.js --regenerate --limit 20  # model rewrite (requires --limit)
 *
 * Dry run prints how many questions have blob-only explanations, how many of
 * those parse locally, and 3 sample before/after parses. Nothing is written
 * without --apply.
 *
 * Credentials: --credentials <path> | GOOGLE_APPLICATION_CREDENTIALS | repo-root service account.
 * --regenerate additionally needs the provider key for the coach primary model (e.g. OPENAI_API_KEY).
 */

const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const REGENERATE = args.includes('--regenerate');
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
};
const LIMIT = argValue('--limit') ? parseInt(argValue('--limit'), 10) : null;

function resolveCredentials() {
  const explicit = argValue('--credentials');
  if (explicit) return path.resolve(explicit);
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const root = path.join(__dirname, '..');
  try {
    const candidate = fs.readdirSync(root).find((f) => /^ultrasat-.*\.json$/.test(f) && !f.includes('taxonomy'));
    return candidate ? path.join(root, candidate) : null;
  } catch (err) {
    return null;
  }
}

const credPath = resolveCredentials();
if (!credPath || !fs.existsSync(credPath)) {
  console.log('backfill-structured-explanations: no Firebase service-account credentials found.');
  console.log('');
  console.log('This script must be run by you, against your own Firestore. Provide credentials via one of:');
  console.log('  --credentials <path-to-service-account.json>');
  console.log('  GOOGLE_APPLICATION_CREDENTIALS env var');
  console.log('  a service-account file matching ultrasat-*.json in the repo root');
  console.log('');
  console.log('Then start with a dry run (default — nothing is written):');
  console.log('  node scripts/backfill-structured-explanations.js');
  process.exit(1);
}

// Requires below the guard so a missing-credentials run never touches
// firebase-admin / taxonomy modules.
const admin = require('firebase-admin');
const { toCanonicalSubcategoryId } = require('../apps/api/subcategoryTaxonomy');
const {
  parseExplanationBlob,
  parseExplanationLines,
  isMeaningfulStructure,
  sanitizeStructuredExplanation,
} = require('../apps/api/explanationParser');

const ONLY_SUBCAT = argValue('--subcategory') ? toCanonicalSubcategoryId(argValue('--subcategory')) : null;

admin.initializeApp({ credential: admin.credential.cert(require(credPath)) });
const db = admin.firestore();
if (!args.includes('--grpc')) db.settings({ preferRest: true });

const stats = {
  total: 0,
  alreadyStructured: 0,
  blobOnly: 0,
  parseable: 0,
  unparseable: 0,
  arrayLegacy: 0,
  noExplanation: 0,
  regenerated: 0,
  regenFailed: 0,
  writes: 0,
};

/* ------------------------------------------------------------------------ *
 * Strategy 2: model regeneration (--regenerate)
 *
 * !!! COST WARNING !!!
 * This calls the paid model provider ONCE PER QUESTION (via the existing
 * generation pipeline adapter, apps/api/coach/modelAdapter.js — the same
 * adapter scripts/backfill-concept-tags.js uses). Across the full bank that
 * is thousands of paid completions. That is why:
 *   - --regenerate REQUIRES an explicit --limit, and
 *   - regeneration only targets blobs the free local parser could not
 *     structure.
 * Run small batches, review the output in the admin panel, then widen.
 * ------------------------------------------------------------------------ */
async function regenerateStructuredExplanation(question, modelAdapter) {
  const optionLines = Array.isArray(question.options)
    ? question.options.map((opt, i) => `${'ABCDEF'[i]}. ${opt}`).join('\n')
    : '(user-input question — no options)';
  const correct = typeof question.correctAnswer === 'number' && Array.isArray(question.options)
    ? `${'ABCDEF'[question.correctAnswer]}. ${question.options[question.correctAnswer]}`
    : String(question.correctAnswer);

  const result = await modelAdapter.complete('primary', {
    system: [
      'You rewrite SAT question explanations into a structured JSON object. Output a single JSON object:',
      '{"rule": "one sentence naming the tested rule/concept",',
      ' "steps": ["step-by-step walkthrough to the correct answer"],',
      ' "choiceRebuttals": {"B": "why option B is wrong", ...only INCORRECT options...},',
      ' "thingsToRemember": ["1-2 takeaways or traps"]}',
      'Use clear student-facing language. LaTeX is allowed inside $...$ delimiters for math.',
      'Base the content on the provided question and existing explanation; do not change which answer is correct.',
    ].join('\n'),
    messages: [
      {
        role: 'user',
        content: `Question:\n${question.text}\n\nOptions:\n${optionLines}\n\nCorrect answer: ${correct}\n\nExisting explanation:\n${question.explanation || '(none)'}`,
      },
    ],
    json: true,
    maxTokens: 900,
  });
  const parsed = modelAdapter.parseJsonResponse(result.text);
  return sanitizeStructuredExplanation(parsed);
}

function classifyQuestion(q) {
  if (sanitizeStructuredExplanation(q.explanationStructured)) return 'structured';
  if (Array.isArray(q.explanation) && q.explanation.length > 0) return 'array';
  if (typeof q.explanation === 'string' && q.explanation.trim()) return 'blob';
  return 'none';
}

function shortPreview(value, max = 220) {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

async function main() {
  console.log(`\n=== Structured explanations backfill ${APPLY ? '*** APPLY ***' : '(dry run)'} ===`);
  console.log(`Credentials: ${credPath}`);
  if (ONLY_SUBCAT) console.log(`Subcategory filter: ${ONLY_SUBCAT}`);
  if (REGENERATE) {
    console.log('Mode: --regenerate (model rewrite of unparseable blobs) — THIS COSTS MODEL TOKENS');
    if (!LIMIT) {
      console.log('\n--regenerate requires an explicit --limit N (cost guard). Aborting.');
      process.exit(1);
    }
  }
  console.log('');

  let modelAdapter = null;
  if (REGENERATE) {
    // Lazy require: only the regenerate path needs the model provider stack.
    modelAdapter = require('../apps/api/coach/modelAdapter');
    if (!modelAdapter.isConfigured('primary')) {
      console.log('No API key configured for the coach primary model provider (e.g. OPENAI_API_KEY). Aborting.');
      process.exit(1);
    }
  }

  const snap = await db.collection('questions').get();
  let questions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (ONLY_SUBCAT) {
    questions = questions.filter(
      (q) => toCanonicalSubcategoryId(q.subcategory || q.subCategory || q.subcategoryId) === ONLY_SUBCAT
    );
  }
  stats.total = questions.length;

  const parseableUpdates = []; // { id, structured, from }
  const unparseable = [];
  const samples = [];

  for (const q of questions) {
    const kind = classifyQuestion(q);
    if (kind === 'structured') {
      stats.alreadyStructured += 1;
      continue;
    }
    if (kind === 'none') {
      stats.noExplanation += 1;
      continue;
    }

    if (kind === 'array') {
      // Legacy docs that still store the raw generator array: derive both the
      // joined legacy string and the structured object.
      stats.arrayLegacy += 1;
      const parsed = parseExplanationLines(q.explanation);
      const joined = q.explanation.map((p) => (typeof p === 'string' ? p : String(p))).join('\n').trim();
      if (isMeaningfulStructure(parsed)) {
        stats.parseable += 1;
        parseableUpdates.push({ id: q.id, structured: parsed, legacy: joined, from: 'array' });
        if (samples.length < 3) samples.push({ id: q.id, before: q.explanation, after: parsed });
      } else {
        stats.unparseable += 1;
        unparseable.push(q);
      }
      continue;
    }

    // kind === 'blob'
    stats.blobOnly += 1;
    const structured = parseExplanationBlob(q.explanation);
    if (structured) {
      stats.parseable += 1;
      parseableUpdates.push({ id: q.id, structured, from: 'blob' });
      if (samples.length < 3) samples.push({ id: q.id, before: q.explanation, after: structured });
    } else {
      stats.unparseable += 1;
      unparseable.push(q);
    }
  }

  console.log(`Question bank considered: ${stats.total}`);
  console.log(`  already structured:          ${stats.alreadyStructured}`);
  console.log(`  blob-only explanations:      ${stats.blobOnly}`);
  console.log(`  stored as legacy array:      ${stats.arrayLegacy}`);
  console.log(`  no explanation at all:       ${stats.noExplanation}`);
  console.log(`  locally parseable -> struct: ${stats.parseable}`);
  console.log(`  NOT locally parseable:       ${stats.unparseable}${stats.unparseable ? ' (candidates for --regenerate)' : ''}`);

  if (samples.length > 0) {
    console.log('\n--- Sample parses ---');
    samples.forEach((s, i) => {
      console.log(`\n[${i + 1}] question ${s.id}`);
      console.log(`  BEFORE: ${shortPreview(s.before)}`);
      console.log(`  AFTER:  ${shortPreview(JSON.stringify(s.after, null, 2), 900)}`);
    });
  }

  // ---- write phase (local re-parse strategy) ----
  let updates = parseableUpdates;
  if (LIMIT && !REGENERATE) updates = updates.slice(0, LIMIT);
  if (APPLY && !REGENERATE) {
    console.log(`\nWriting ${updates.length} structured explanations…`);
    for (let i = 0; i < updates.length; i += 400) {
      const chunk = updates.slice(i, i + 400);
      const batch = db.batch();
      chunk.forEach((u) => {
        const payload = {
          explanationStructured: u.structured,
          explanationStructuredSource: 'backfill-reparse-v1',
        };
        // Array-stored docs also get the flattened legacy string so every
        // consumer sees a plain string going forward.
        if (u.from === 'array' && u.legacy) payload.explanation = u.legacy;
        batch.set(db.collection('questions').doc(u.id), payload, { merge: true });
        stats.writes += 1;
      });
      await batch.commit();
      process.stdout.write(`  ${Math.min(i + 400, updates.length)}/${updates.length}\r`);
    }
    console.log('');
  }

  // ---- regenerate phase ----
  if (REGENERATE) {
    const targets = unparseable.slice(0, LIMIT);
    console.log(`\nRegenerating ${targets.length} explanations via the model (of ${stats.unparseable} unparseable)…`);
    for (const q of targets) {
      try {
        const structured = await regenerateStructuredExplanation(q, modelAdapter);
        if (!structured) {
          stats.regenFailed += 1;
          continue;
        }
        stats.regenerated += 1;
        if (APPLY) {
          await db.collection('questions').doc(q.id).set(
            {
              explanationStructured: structured,
              explanationStructuredSource: 'backfill-regenerate-v1',
            },
            { merge: true }
          );
          stats.writes += 1;
        } else {
          console.log(`  [dry run] ${q.id}: ${shortPreview(JSON.stringify(structured), 200)}`);
        }
      } catch (err) {
        stats.regenFailed += 1;
        console.error(`  regenerate failed for ${q.id}: ${err.message}`);
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Parseable locally:  ${stats.parseable}`);
  if (REGENERATE) console.log(`Regenerated:        ${stats.regenerated} (failed: ${stats.regenFailed})`);
  if (APPLY) console.log(`Firestore writes:   ${stats.writes}`);
  console.log(APPLY ? '\nDone.' : '\nDry run complete — re-run with --apply to write.');
}

main().catch((e) => {
  console.error('Structured explanations backfill failed:', e.message);
  process.exit(1);
});
