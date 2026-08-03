#!/usr/bin/env node
/**
 * AI Coach — concept-tagging backfill.
 *
 * Tags the question bank with concept ids so the coach can speak at concept
 * grain ("plural possessives"), not just subcategory grain.
 *
 * Per subcategory:
 *   1. Load the curated concept list from `predefinedConcepts` (active only).
 *      With --generate-concepts, missing lists are AI-generated first
 *      (written with generated:true, active:true — review in admin later).
 *   2. Classify untagged questions in batches of 10 with the CLASSIFIER model
 *      (cheap role from apps/api/coach/modelAdapter.js): each question gets
 *      1-3 conceptIds from the list (or none if genuinely unclear).
 *   3. Write BOTH stores the app reads:
 *        - questionConceptAssociations/qca_{questionId}  { questionId, conceptIds, lastUpdated, source }
 *        - questions/{id}.conceptIds
 *      Deterministic ids -> idempotent re-runs.
 *
 * USAGE
 *   node scripts/backfill-concept-tags.js                          # DRY RUN, all subcategories
 *   node scripts/backfill-concept-tags.js --subcategory boundaries # one subcategory
 *   node scripts/backfill-concept-tags.js --limit 50               # cap questions per subcategory
 *   node scripts/backfill-concept-tags.js --generate-concepts      # also draft missing concept lists
 *   node scripts/backfill-concept-tags.js --retag                  # re-classify already-tagged questions
 *   node scripts/backfill-concept-tags.js --apply                  # WRITE
 *
 * Credentials: --credentials <path> | GOOGLE_APPLICATION_CREDENTIALS | repo-root service account.
 * Model: needs the provider key for COACH_CLASSIFIER_PROVIDER (default OpenAI -> OPENAI_API_KEY).
 */

const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { toCanonicalSubcategoryId, getDisplayName, ALL_KEBAB_IDS } = require('../apps/api/subcategoryTaxonomy');
const { complete, parseJsonResponse, isConfigured } = require('../apps/api/coach/modelAdapter');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const GENERATE = args.includes('--generate-concepts');
const RETAG = args.includes('--retag');
const argValue = (f) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
};
const ONLY_SUBCAT = argValue('--subcategory') ? toCanonicalSubcategoryId(argValue('--subcategory')) : null;
const LIMIT = argValue('--limit') ? parseInt(argValue('--limit'), 10) : null;

function resolveCredentials() {
  const explicit = argValue('--credentials');
  if (explicit) return path.resolve(explicit);
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const root = path.join(__dirname, '..');
  const candidate = fs.readdirSync(root).find((f) => /^ultrasat-.*\.json$/.test(f) && !f.includes('taxonomy'));
  return candidate ? path.join(root, candidate) : null;
}

const credPath = resolveCredentials();
if (!credPath || !fs.existsSync(credPath)) {
  console.error('No service-account credentials found.');
  process.exit(1);
}
if (!isConfigured('classifier')) {
  console.error('No API key for the classifier model provider (set OPENAI_API_KEY or COACH_CLASSIFIER_* env).');
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(require(credPath)) });
const db = admin.firestore();
if (!args.includes('--grpc')) db.settings({ preferRest: true });

const stats = { subcats: 0, conceptsLoaded: 0, conceptsGenerated: 0, questions: 0, tagged: 0, unclear: 0, skippedTagged: 0, writes: 0 };

const stripHtml = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

async function getConceptList(subcat) {
  const snap = await db
    .collection('predefinedConcepts')
    .where('subcategoryId', '==', subcat)
    .get();
  let concepts = snap.docs
    .map((d) => ({ docId: d.id, ...d.data() }))
    .filter((c) => c.active !== false)
    .map((c) => ({ conceptId: c.conceptId || c.docId, name: c.name || c.conceptId, description: c.description || '' }));

  if (concepts.length === 0 && GENERATE) {
    const result = await complete('classifier', {
      system:
        'You are an SAT content expert. Output a single JSON object: {"concepts":[{"conceptId":"kebab-case-id","name":"Short Name","description":"one sentence"}]}. 6-12 concepts that partition the skill into the distinct testable ideas/error patterns students confuse.',
      messages: [{ role: 'user', content: `Skill: "${getDisplayName(subcat)}" (Digital SAT). List its component concepts.` }],
      json: true,
      maxTokens: 1200,
    });
    const parsed = parseJsonResponse(result.text);
    concepts = ((parsed && parsed.concepts) || [])
      .filter((c) => c.conceptId && c.name)
      .slice(0, 12)
      .map((c) => ({
        conceptId: String(c.conceptId).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60),
        name: String(c.name).slice(0, 80),
        description: String(c.description || '').slice(0, 200),
      }));
    stats.conceptsGenerated += concepts.length;
    if (APPLY) {
      const batch = db.batch();
      for (const c of concepts) {
        batch.set(
          db.collection('predefinedConcepts').doc(`${subcat}_${c.conceptId}`),
          { ...c, subcategoryId: subcat, active: true, generated: true, createdAt: new Date() },
          { merge: true }
        );
        stats.writes += 1;
      }
      await batch.commit();
    }
    console.log(`  generated ${concepts.length} concepts for ${subcat}${APPLY ? '' : ' (dry run — not written)'}`);
  }
  return concepts;
}

async function classifyBatch(subcat, concepts, questions) {
  const conceptLines = concepts.map((c) => `- ${c.conceptId}: ${c.name}${c.description ? ` — ${c.description}` : ''}`).join('\n');
  const questionLines = questions
    .map((q, i) => `Q${i + 1} (id=${q.id}): ${stripHtml(q.text || q.questionText).slice(0, 350)}${q.options ? ' | options: ' + stripHtml(JSON.stringify(q.options)).slice(0, 150) : ''}`)
    .join('\n\n');

  const result = await complete('classifier', {
    system:
      'You tag SAT questions with concepts. Output a single JSON object: {"tags":[{"id":"<question id>","conceptIds":["..."]}]}. Use ONLY conceptIds from the provided list; 1-3 per question; use [] if no listed concept clearly applies. Tag by what the question actually tests, not surface topic.',
    messages: [
      {
        role: 'user',
        content: `Skill: ${getDisplayName(subcat)}\n\nConcept list:\n${conceptLines}\n\nQuestions:\n${questionLines}`,
      },
    ],
    json: true,
    maxTokens: 1500,
  });
  const parsed = parseJsonResponse(result.text);
  const valid = new Set(concepts.map((c) => c.conceptId));
  const map = {};
  for (const t of (parsed && parsed.tags) || []) {
    if (!t || !t.id) continue;
    map[t.id] = (Array.isArray(t.conceptIds) ? t.conceptIds : []).filter((c) => valid.has(c)).slice(0, 3);
  }
  return map;
}

async function main() {
  console.log(`\n=== Concept tagging ${APPLY ? '*** APPLY ***' : '(dry run)'} ===\nCredentials: ${credPath}\n`);

  // Load the whole bank once (id + subcategory + text + options + conceptIds), group locally.
  const qSnap = await db.collection('questions').get();
  const bySubcat = {};
  qSnap.forEach((d) => {
    const q = { id: d.id, ...d.data() };
    const sc = toCanonicalSubcategoryId(q.subcategory) || toCanonicalSubcategoryId(q.subcategoryId);
    if (!sc) return;
    (bySubcat[sc] = bySubcat[sc] || []).push(q);
  });
  console.log(`Question bank: ${qSnap.size} docs, ${Object.keys(bySubcat).length} subcategories resolved.\n`);

  // Existing associations (to skip already-tagged unless --retag)
  const existing = new Set();
  if (!RETAG) {
    const aSnap = await db.collection('questionConceptAssociations').select('questionId').get();
    aSnap.forEach((d) => existing.add(d.get('questionId')));
    console.log(`Existing associations: ${existing.size}\n`);
  }

  const subcats = ONLY_SUBCAT ? [ONLY_SUBCAT] : ALL_KEBAB_IDS.filter((s) => bySubcat[s]);
  for (const subcat of subcats) {
    const all = bySubcat[subcat] || [];
    if (!all.length) continue;
    stats.subcats += 1;

    const concepts = await getConceptList(subcat);
    stats.conceptsLoaded += concepts.length;
    if (!concepts.length) {
      console.log(`${subcat}: NO concept list (${all.length} questions) — run with --generate-concepts`);
      continue;
    }

    let todo = all.filter((q) => RETAG || !existing.has(q.id));
    stats.skippedTagged += all.length - todo.length;
    if (LIMIT) todo = todo.slice(0, LIMIT);
    stats.questions += todo.length;
    console.log(`${subcat}: ${concepts.length} concepts · ${todo.length} questions to tag (of ${all.length})`);

    for (let i = 0; i < todo.length; i += 10) {
      const chunk = todo.slice(i, i + 10);
      let tags = {};
      try {
        tags = await classifyBatch(subcat, concepts, chunk);
      } catch (e) {
        console.error(`  batch failed (${subcat} @${i}): ${e.message}`);
        continue;
      }
      const batch = db.batch();
      let ops = 0;
      for (const q of chunk) {
        const conceptIds = tags[q.id] || [];
        if (!conceptIds.length) {
          stats.unclear += 1;
          continue;
        }
        stats.tagged += 1;
        if (APPLY) {
          batch.set(db.collection('questionConceptAssociations').doc(`qca_${q.id}`), {
            questionId: q.id,
            subcategoryId: subcat,
            conceptIds,
            source: 'backfill-concept-tags-v1',
            lastUpdated: new Date(),
          });
          batch.set(db.collection('questions').doc(q.id), { conceptIds }, { merge: true });
          ops += 2;
          stats.writes += 2;
        }
      }
      if (APPLY && ops) await batch.commit();
      process.stdout.write(`  ${Math.min(i + 10, todo.length)}/${todo.length}\r`);
    }
    console.log('');
  }

  console.log('\n=== Summary ===');
  console.log(`Subcategories processed: ${stats.subcats}`);
  console.log(`Concepts loaded:         ${stats.conceptsLoaded} (generated: ${stats.conceptsGenerated})`);
  console.log(`Questions considered:    ${stats.questions} (already tagged, skipped: ${stats.skippedTagged})`);
  console.log(`Tagged:                  ${stats.tagged}`);
  console.log(`Unclear (no tag):        ${stats.unclear}`);
  if (APPLY) console.log(`Firestore writes:        ${stats.writes}`);
  console.log(APPLY ? '\nDone.' : '\nDry run complete — re-run with --apply to write.');
}

main().catch((e) => {
  console.error('Concept tagging failed:', e);
  process.exit(1);
});
