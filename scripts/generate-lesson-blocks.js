#!/usr/bin/env node
/**
 * P2-D — lesson-block draft generator.
 *
 * Drafts structured `blocks` JSON (the LessonBlockRenderer contract —
 * apps/web/src/components/lesson/LessonBlockRenderer.jsx) for the prose-only
 * lessons, so all 29 lessons can get UWorld-grade structure: rule boxes,
 * annotated examples, check/cross contrast pairs, worked steps, and a
 * things-to-remember recap. The 6 lessons that already have bespoke animated
 * infographics are skipped.
 *
 * FLOW
 *   1. Reads each lesson's existing learningContent/{subcategoryId} doc
 *      (overview HTML + strategy arrays) and the subcategory metadata from
 *      the canonical taxonomy.
 *   2. Prompts OpenAI gpt-5.6-luna (openai SDK, OPENAI_API_KEY from the root
 *      .env; model resolved via apps/api/config/aiModel.js) with a block-schema
 *      template plus two few-shot examples (one grammar, one math with $...$
 *      KaTeX).
 *   3. Validates the returned JSON against the block schemas (unknown types,
 *      missing fields, marker mismatches, dangerous HTML → reject; one retry
 *      with the validation errors fed back).
 *   4. DEFAULT = DRY RUN: writes draft JSON to
 *      scripts/output/lesson-blocks/{subcategoryId}.json for human review.
 *      NOTHING touches Firestore without --apply.
 *   5. --apply does NOT call the model. It reads the (reviewed) draft files,
 *      re-validates them, and merges { blocks, blocksSource, blocksUpdatedAt }
 *      onto the learningContent docs. Review-then-apply guarantees what ships
 *      is exactly what a human read.
 *
 * USAGE
 *   node scripts/generate-lesson-blocks.js                       # dry run, all prose lessons without drafts
 *   node scripts/generate-lesson-blocks.js --only=boundaries     # one lesson
 *   node scripts/generate-lesson-blocks.js --force               # regenerate over existing drafts
 *   node scripts/generate-lesson-blocks.js --model=gpt-5.6-luna
 *   node scripts/generate-lesson-blocks.js --apply               # push ALL reviewed drafts to Firestore
 *   node scripts/generate-lesson-blocks.js --apply --only=boundaries
 *
 * COST: dry-run calls the paid OpenAI API once per lesson generated (up to 23
 * calls for a full run). --apply makes zero model calls.
 *
 * Credentials: --credentials <path> | GOOGLE_APPLICATION_CREDENTIALS | repo-root
 * service account (ultrasat-*.json). OPENAI_API_KEY comes from the root .env.
 * Key values are never printed.
 */

const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const FORCE = args.includes('--force');
const argValue = (flag) => {
  const eq = args.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null;
};
const ONLY = argValue('--only');
const {
  resolveModel,
  reasoningConfig,
  outputTokenBudget,
} = require('../apps/api/config/aiModel');
const MODEL = argValue('--model') || resolveModel('OPENAI_LESSON_BLOCKS_MODEL');

const ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(__dirname, 'output', 'lesson-blocks');

/* ----------------------------------------------------------- .env / keys -- */
// Load the root .env (dotenv when hoisted into root node_modules, otherwise a
// minimal parser). Never print values.
function loadRootEnv() {
  const envPath = path.join(ROOT, '.env');
  try {
    require('dotenv').config({ path: envPath });
    return;
  } catch (err) {
    /* dotenv not resolvable — fall through to the manual parser */
  }
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

/* ------------------------------------------------------------ credentials -- */
// Same convention as scripts/backfill-structured-explanations.js.
function resolveCredentials() {
  const explicit = argValue('--credentials');
  if (explicit) return path.resolve(explicit);
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  try {
    const candidate = fs.readdirSync(ROOT).find((f) => /^ultrasat-.*\.json$/.test(f) && !f.includes('taxonomy'));
    return candidate ? path.join(ROOT, candidate) : null;
  } catch (err) {
    return null;
  }
}

/* --------------------------------------------------------------- taxonomy -- */
const taxonomy = require('../apps/web/src/data/subcategoryTaxonomy.json');

// The 6 lessons with bespoke animated infographics in SubcategoryLearnPage.jsx
// — they already have rich treatments and are NOT drafted by this script.
const INFOGRAPHIC_LESSONS = new Set([
  'text-structure-purpose',
  'words-in-context',
  'transitions',
  'linear-equations-one-variable',
  'probability',
  'circles',
]);

function proseLessons() {
  return taxonomy.subcategories
    .filter((s) => !INFOGRAPHIC_LESSONS.has(s.id))
    .map((s) => ({
      id: s.id,
      name: s.name,
      domain: taxonomy.domains[s.domain] ? taxonomy.domains[s.domain].name : s.domain,
      section: taxonomy.domains[s.domain] && taxonomy.domains[s.domain].section === 'math'
        ? 'Math'
        : 'Reading & Writing',
    }));
}

/* ------------------------------------------------------- block validation -- */
const KNOWN_TYPES = new Set(['rule', 'annotated-example', 'check-cross', 'steps', 'remember', 'html']);
const DANGEROUS_HTML = /<\s*\/?\s*(script|iframe|object|embed|form|link|meta)\b|on[a-z]+\s*=|javascript:/i;

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

function checkText(errors, where, value, { optional = false, allowArray = false } = {}) {
  if (value == null) {
    if (!optional) errors.push(`${where}: missing required text`);
    return;
  }
  const values = allowArray && Array.isArray(value) ? value : [value];
  if (values.length === 0) {
    errors.push(`${where}: empty text array`);
    return;
  }
  for (const v of values) {
    if (!isNonEmptyString(v)) {
      errors.push(`${where}: must be a non-empty string`);
      return;
    }
    if (DANGEROUS_HTML.test(v)) errors.push(`${where}: contains dangerous HTML-like content`);
  }
}

/**
 * Validates a blocks array against the LessonBlockRenderer contract.
 * Returns { ok: boolean, errors: string[] }.
 */
function validateBlocks(blocks) {
  const errors = [];
  if (!Array.isArray(blocks)) return { ok: false, errors: ['blocks must be an array'] };
  if (blocks.length < 3 || blocks.length > 16) {
    errors.push(`blocks length ${blocks.length} outside sane range 3..16`);
  }

  blocks.forEach((block, i) => {
    const at = `blocks[${i}]`;
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      errors.push(`${at}: not an object`);
      return;
    }
    if (!KNOWN_TYPES.has(block.type)) {
      errors.push(`${at}: unknown type "${block.type}"`);
      return;
    }

    switch (block.type) {
      case 'rule': {
        checkText(errors, `${at}.text`, block.text, { allowArray: true });
        checkText(errors, `${at}.title`, block.title, { optional: true });
        break;
      }
      case 'annotated-example': {
        checkText(errors, `${at}.title`, block.title, { optional: true });
        checkText(errors, `${at}.intro`, block.intro, { optional: true });
        checkText(errors, `${at}.note`, block.note, { optional: true });
        if (!Array.isArray(block.segments) || block.segments.length === 0) {
          errors.push(`${at}.segments: required non-empty array`);
        } else {
          const usedMarkers = [];
          block.segments.forEach((seg, j) => {
            if (typeof seg === 'string') return; // literal text (may be empty separator? no:)
            if (!seg || typeof seg !== 'object') {
              errors.push(`${at}.segments[${j}]: must be string or object`);
              return;
            }
            checkText(errors, `${at}.segments[${j}].text`, seg.text);
            if (seg.marker != null) {
              if (!Number.isInteger(seg.marker) || seg.marker < 1) {
                errors.push(`${at}.segments[${j}].marker: must be a positive integer`);
              } else {
                usedMarkers.push(seg.marker);
              }
            }
            if (seg.tone != null && !['accent', 'warn', 'plain'].includes(seg.tone)) {
              errors.push(`${at}.segments[${j}].tone: must be accent|warn|plain`);
            }
          });
          if (!Array.isArray(block.markers) || block.markers.length === 0) {
            errors.push(`${at}.markers: required non-empty array (caption legend)`);
          } else {
            const defined = [];
            block.markers.forEach((m, j) => {
              if (!m || typeof m !== 'object' || !Number.isInteger(m.n) || m.n < 1) {
                errors.push(`${at}.markers[${j}]: needs integer n >= 1`);
                return;
              }
              defined.push(m.n);
              checkText(errors, `${at}.markers[${j}].label`, m.label);
            });
            usedMarkers.forEach((n) => {
              if (!defined.includes(n)) errors.push(`${at}: segment marker ${n} has no caption in markers`);
            });
            defined.forEach((n) => {
              if (!usedMarkers.includes(n)) errors.push(`${at}: markers entry ${n} is never used by a segment`);
            });
          }
        }
        break;
      }
      case 'check-cross': {
        checkText(errors, `${at}.title`, block.title, { optional: true });
        for (const side of ['wrong', 'correct']) {
          if (!block[side] || typeof block[side] !== 'object') {
            errors.push(`${at}.${side}: required object { text, why }`);
          } else {
            checkText(errors, `${at}.${side}.text`, block[side].text);
            checkText(errors, `${at}.${side}.why`, block[side].why);
          }
        }
        break;
      }
      case 'steps': {
        checkText(errors, `${at}.title`, block.title, { optional: true });
        checkText(errors, `${at}.intro`, block.intro, { optional: true });
        if (!Array.isArray(block.steps) || block.steps.length < 2 || block.steps.length > 8) {
          errors.push(`${at}.steps: required array of 2..8 steps`);
        } else {
          block.steps.forEach((step, j) => {
            if (!step || typeof step !== 'object') {
              errors.push(`${at}.steps[${j}]: must be an object`);
              return;
            }
            checkText(errors, `${at}.steps[${j}].label`, step.label);
            checkText(errors, `${at}.steps[${j}].content`, step.content);
            checkText(errors, `${at}.steps[${j}].note`, step.note, { optional: true });
          });
        }
        break;
      }
      case 'remember': {
        checkText(errors, `${at}.title`, block.title, { optional: true });
        if (!Array.isArray(block.items) || block.items.length < 2 || block.items.length > 8) {
          errors.push(`${at}.items: required array of 2..8 bullets`);
        } else {
          block.items.forEach((item, j) => checkText(errors, `${at}.items[${j}]`, item));
        }
        break;
      }
      case 'html': {
        if (!isNonEmptyString(block.html)) errors.push(`${at}.html: required non-empty string`);
        else if (DANGEROUS_HTML.test(block.html)) errors.push(`${at}.html: contains dangerous HTML`);
        break;
      }
      default:
        break;
    }
  });

  return { ok: errors.length === 0, errors };
}

/* ------------------------------------------------------ few-shot examples -- */
// These two examples define the output quality bar. One grammar, one math
// (math uses $...$ KaTeX delimiters). They are embedded verbatim in the
// prompt as model output the assistant should imitate.
const FEW_SHOT_GRAMMAR = {
  lesson: 'Form, Structure, and Sense (Reading & Writing — subject-verb agreement focus)',
  blocks: [
    {
      type: 'rule',
      title: 'Match the verb to the naked subject',
      text:
        'A verb agrees with its grammatical subject, not with the noun sitting closest to it. The SAT hides the subject behind prepositional phrases (of..., in..., with...) so a plural decoy lands right before the verb. Cross out every prepositional phrase before you pick the verb.',
    },
    {
      type: 'annotated-example',
      title: 'Find the subject',
      intro: 'Cross out the prepositional phrase and the true subject surfaces:',
      segments: [
        { text: 'The cluster', marker: 1, tone: 'accent' },
        ' ',
        { text: 'of newly discovered stars', marker: 2, tone: 'warn' },
        ' ',
        { text: 'was', marker: 3, tone: 'accent' },
        ' mapped by the survey team.',
      ],
      markers: [
        { n: 1, label: 'The naked subject — "cluster," singular.' },
        { n: 2, label: 'Prepositional camouflage. "Stars" is plural bait; a noun inside a preposition is never the subject.' },
        { n: 3, label: 'Singular subject takes the singular verb "was."' },
      ],
      note: 'If you can delete a phrase and the sentence still stands, the subject was never inside it.',
    },
    {
      type: 'check-cross',
      title: 'The decoy plural',
      wrong: {
        text: 'The list of safety requirements are demanding.',
        why: '"Are" agrees with the decoy "requirements." The subject is "list" — singular.',
      },
      correct: {
        text: 'The list of safety requirements is demanding.',
        why: 'With "of safety requirements" crossed out, "The list ... is" agrees: singular with singular.',
      },
    },
    {
      type: 'steps',
      title: 'Worked example',
      intro:
        "The collection of essays, letters, and unpublished drafts ______ insight into the author's process.  (A) offer  (B) offers  (C) are offering  (D) have offered",
      steps: [
        {
          label: 'Spot the test',
          content: 'The choices are four forms of one verb — this is subject-verb agreement, not style.',
        },
        {
          label: 'Slash the prepositions',
          content: 'Cross out "of essays, letters, and unpublished drafts." None of those nouns can be the subject.',
        },
        {
          label: 'Match the naked noun',
          content: 'What remains is "The collection ______ insight." The subject is "collection," singular, so the verb must be singular.',
          note: '(A), (C), and (D) are all plural forms keyed to the decoy list.',
        },
        {
          label: 'Answer: (B) offers',
          content: '"The collection offers insight" — singular subject, singular verb.',
        },
      ],
    },
    {
      type: 'remember',
      items: [
        'The subject is almost never inside a prepositional phrase — cross those phrases out first.',
        'A plural noun immediately before the verb is usually bait, not the subject.',
        'Collective nouns (team, list, collection, government) are singular on the SAT.',
      ],
    },
  ],
};

const FEW_SHOT_MATH = {
  lesson: 'Percentages (Math)',
  blocks: [
    {
      type: 'rule',
      title: 'Percent change has a fixed base',
      text:
        'Percent change is always measured against the ORIGINAL value: $\\text{percent change} = \\frac{\\text{new} - \\text{original}}{\\text{original}} \\times 100$. Increasing by $20\\%$ and then decreasing by $20\\%$ does not return to the start, because the two changes use different bases.',
    },
    {
      type: 'annotated-example',
      title: 'Read the setup',
      intro: 'A price rises from $\\$80$ to $\\$92$. Annotate the percent-change computation:',
      segments: [
        { text: '$\\frac{92 - 80}{80}$', marker: 1, tone: 'accent' },
        ' ',
        { text: '$\\times\\ 100$', marker: 2, tone: 'plain' },
        ' ',
        { text: '$=\\ 15\\%$', marker: 3, tone: 'accent' },
      ],
      markers: [
        { n: 1, label: 'The difference sits over the ORIGINAL $80$ — never over the new value $92$.' },
        { n: 2, label: 'Multiplying by $100$ converts the decimal $0.15$ into a percent.' },
        { n: 3, label: 'The increase is $15\\%$ of the original price.' },
      ],
      note: 'Dividing by the new value ($92$) gives about $13\\%$ — the SAT offers that as a trap choice.',
    },
    {
      type: 'check-cross',
      title: 'Stacked percent changes',
      wrong: {
        text: 'A $\\$100$ stock rises $10\\%$, then falls $10\\%$, so it is back to $\\$100$.',
        why: 'The fall is $10\\%$ of the NEW base $\\$110$, which is $\\$11$ — the stock ends at $\\$99$, not $\\$100$.',
      },
      correct: {
        text: 'A $\\$100$ stock rises $10\\%$ to $\\$110$, then falls $10\\%$ to $\\$99$.',
        why: 'Each change multiplies the current value: $100 \\times 1.10 \\times 0.90 = 99$.',
      },
    },
    {
      type: 'steps',
      title: 'Worked example',
      intro: 'A jacket is discounted $25\\%$, and the sale price is $\\$96$. What was the original price?',
      steps: [
        {
          label: 'Translate the discount',
          content: 'A $25\\%$ discount means the sale price is $75\\%$ of the original: $0.75x = 96$.',
        },
        {
          label: 'Solve for the original',
          content: '$x = \\frac{96}{0.75} = 128$.',
          note: 'Adding $25\\%$ of $\\$96$ back ($96 + 24 = 120$) is the classic wrong-base trap.',
        },
        {
          label: 'Answer: $\\$128$',
          content: 'Check: $128 \\times 0.75 = 96$. The original price was $\\$128$.',
        },
      ],
    },
    {
      type: 'remember',
      items: [
        'Percent change always divides by the original value, not the new one.',
        'A $p\\%$ discount means you pay $(100 - p)\\%$: solve $\\frac{100 - p}{100} \\cdot x = \\text{price}$ for the original.',
        'Successive percent changes multiply — they never simply add or cancel.',
      ],
    },
  ],
};

/* ----------------------------------------------------------------- prompt -- */
function stripHtml(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildPrompt(lesson, content) {
  const schema = `Each block is one of EXACTLY these six shapes (no other types exist):
1. {"type":"rule","title":"short name of the rule (optional)","text":"the rule, stated plainly (string or array of paragraph strings)"}
2. {"type":"annotated-example","title":"optional eyebrow","intro":"optional setup line","segments":[ "plain text", {"text":"highlighted span","marker":1,"tone":"accent|warn|plain"} ],"markers":[{"n":1,"label":"what this marked span is / why it matters"}],"note":"optional takeaway line"}
3. {"type":"check-cross","title":"optional","wrong":{"text":"the flawed version","why":"why it is wrong"},"correct":{"text":"the fixed version","why":"why it works"}}
4. {"type":"steps","title":"optional (default: Worked example)","intro":"the full problem statement, including answer choices for verbal items","steps":[{"label":"short action name","content":"what you do and see","note":"optional aside (e.g. which trap choices this kills)"}]}
5. {"type":"remember","items":["bullet","bullet"]}
6. {"type":"html","html":"<p>sanitized HTML passthrough — use at most once, only for a short orienting paragraph</p>"}`;

  const rules = `QUALITY RULES (UWorld-grade — every rule is mandatory):
- State the RULE first. The first structural block after any intro must be a "rule" block.
- Annotate the ACTUAL sentence or equation: the annotated-example must mark real spans of a realistic SAT-style sentence/equation, with every marker number used by exactly one segment and explained in markers.
- Every wrong version gets a WHY: check-cross "why" fields must name the specific error (e.g. "comma splice," "wrong base"), not just say "this is incorrect."
- Exactly one "steps" block: a complete SAT-style item solved start to finish. The FINAL step must state the answer (its label should begin with "Answer:"). In notes, kill the trap choices.
- End with exactly one "remember" block as the LAST block: 3-6 crisp takeaways a student can rehearse.
- Math notation goes in $...$ KaTeX delimiters (inline). Use \\\\% for percent signs and \\\\$ for dollar signs inside math. NO raw HTML in any text field ([u]...[/u] underline markup is allowed); the only HTML lives in an optional single "html" block.
- 5 to 9 blocks total. Content must be faithful to this exact SAT subcategory — realistic difficulty, current digital-SAT style.
- Do not duplicate the lesson's key-strategies / common-mistakes lists verbatim; transform the overview's substance into structure.
- Plain, direct student-facing language. No emoji. No marketing tone.`;

  const contextParts = [
    `Subcategory: ${lesson.name}`,
    `Section: ${lesson.section} — domain: ${lesson.domain}`,
    `Existing lesson overview (plain-text extract):\n${stripHtml(content.overview).slice(0, 6000) || '(no overview on file)'}`,
  ];
  if (Array.isArray(content.keyStrategies) && content.keyStrategies.length) {
    contextParts.push(`Existing key strategies (context only — do not copy verbatim):\n- ${content.keyStrategies.join('\n- ')}`);
  }
  if (Array.isArray(content.commonMistakes) && content.commonMistakes.length) {
    contextParts.push(`Known common mistakes (use these to design the check-cross pairs and trap notes):\n- ${content.commonMistakes.join('\n- ')}`);
  }

  return [
    'You are an SAT lesson designer. Convert an existing prose lesson into a structured "blocks" array rendered by a fixed component kit.',
    '',
    schema,
    '',
    rules,
    '',
    '=== EXAMPLE 1 (grammar lesson) ===',
    `Input lesson: ${FEW_SHOT_GRAMMAR.lesson}`,
    'Output:',
    JSON.stringify({ blocks: FEW_SHOT_GRAMMAR.blocks }, null, 2),
    '',
    '=== EXAMPLE 2 (math lesson) ===',
    `Input lesson: ${FEW_SHOT_MATH.lesson}`,
    'Output:',
    JSON.stringify({ blocks: FEW_SHOT_MATH.blocks }, null, 2),
    '',
    '=== NOW THE REAL LESSON ===',
    contextParts.join('\n\n'),
    '',
    'Respond with ONLY a JSON object of the form {"blocks":[...]} — no markdown fences, no commentary.',
  ].join('\n');
}

/* ------------------------------------------------------------- generation -- */
function parseModelJson(text) {
  const raw = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no JSON object in model response');
  return JSON.parse(raw.slice(start, end + 1));
}

async function generateForLesson(ai, lesson, content) {
  const basePrompt = buildPrompt(lesson, content);
  let lastErrors = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const prompt = lastErrors
      ? `${basePrompt}\n\nYour previous attempt failed validation with these errors — fix ALL of them and output the corrected JSON:\n- ${lastErrors.join('\n- ')}`
      : basePrompt;

    // NOTE: gpt-5.6-luna is a reasoning model and rejects `temperature`.
    const response = await ai.responses.create({
      model: MODEL,
      reasoning: reasoningConfig(),
      input: [
        {
          role: 'system',
          content:
            'You generate SAT lesson content blocks. Return a single valid JSON object matching the requested schema. No markdown fences, no commentary.',
        },
        { role: 'user', content: prompt },
      ],
      text: { format: { type: 'json_object' } },
      store: false,
      max_output_tokens: outputTokenBudget(16000),
    });

    let parsed;
    try {
      parsed = parseModelJson(response.output_text);
    } catch (err) {
      lastErrors = [`response was not parseable JSON: ${err.message}`];
      continue;
    }

    const blocks = parsed && parsed.blocks;
    const { ok, errors } = validateBlocks(blocks);
    if (ok) return blocks;
    lastErrors = errors.slice(0, 12);
    console.log(`    attempt ${attempt} failed validation (${errors.length} error${errors.length === 1 ? '' : 's'})`);
  }

  throw new Error(`validation failed after retry: ${lastErrors.join('; ')}`);
}

/* ------------------------------------------------------------------- main -- */
async function main() {
  loadRootEnv();

  const credPath = resolveCredentials();
  if (!credPath || !fs.existsSync(credPath)) {
    console.log('generate-lesson-blocks: no Firebase service-account credentials found.');
    console.log('Provide one of:');
    console.log('  --credentials <path-to-service-account.json>');
    console.log('  GOOGLE_APPLICATION_CREDENTIALS env var');
    console.log('  a service-account file matching ultrasat-*.json in the repo root');
    process.exit(1);
  }

  // Requires below the guard so a missing-credentials run never loads firebase-admin.
  const admin = require('firebase-admin');
  admin.initializeApp({ credential: admin.credential.cert(require(credPath)) });
  const db = admin.firestore();
  if (!args.includes('--grpc')) db.settings({ preferRest: true });

  let lessons = proseLessons();
  if (ONLY) {
    lessons = lessons.filter((l) => l.id === ONLY);
    if (lessons.length === 0) {
      const skipped = INFOGRAPHIC_LESSONS.has(ONLY);
      console.log(skipped
        ? `"${ONLY}" has a bespoke animated infographic — not a generator target.`
        : `Unknown subcategory id "${ONLY}". Valid prose lessons:\n  ${proseLessons().map((l) => l.id).join('\n  ')}`);
      process.exit(1);
    }
  }

  console.log(`\n=== Lesson-block generator ${APPLY ? '*** APPLY (no model calls) ***' : '(dry run — drafts only)'} ===`);
  console.log(`Credentials: ${credPath}`);
  console.log(`Targets: ${lessons.length} prose lesson${lessons.length === 1 ? '' : 's'}${ONLY ? ` (--only=${ONLY})` : ''}`);

  /* ---- APPLY: push reviewed draft files, zero model calls ---- */
  if (APPLY) {
    let written = 0;
    let skipped = 0;
    for (const lesson of lessons) {
      const draftPath = path.join(OUTPUT_DIR, `${lesson.id}.json`);
      if (!fs.existsSync(draftPath)) {
        skipped += 1;
        continue;
      }
      const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
      const { ok, errors } = validateBlocks(draft.blocks);
      if (!ok) {
        console.log(`  SKIP ${lesson.id}: draft fails validation — ${errors.slice(0, 4).join('; ')}`);
        skipped += 1;
        continue;
      }
      await db.collection('learningContent').doc(lesson.id).set(
        {
          blocks: draft.blocks,
          blocksSource: draft.source || 'generate-lesson-blocks-v1',
          blocksUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      written += 1;
      console.log(`  applied ${lesson.id} (${draft.blocks.length} blocks)`);
    }
    console.log(`\nDone. Applied ${written}, skipped ${skipped} (no draft or invalid).`);
    return;
  }

  /* ---- DRY RUN: generate drafts for review ---- */
  if (!process.env.OPENAI_API_KEY) {
    console.log('\nOPENAI_API_KEY is not set (root .env — see .env.example). Aborting before any model call.');
    process.exit(1);
  }
  const OpenAI = require('openai');
  const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log(`Model: ${MODEL}  (one paid call per lesson)`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  let generated = 0;
  let skippedExisting = 0;
  let failed = 0;

  for (const lesson of lessons) {
    const draftPath = path.join(OUTPUT_DIR, `${lesson.id}.json`);
    if (fs.existsSync(draftPath) && !FORCE) {
      skippedExisting += 1;
      console.log(`  skip ${lesson.id} — draft exists (use --force to regenerate)`);
      continue;
    }

    const snap = await db.collection('learningContent').doc(lesson.id).get();
    const content = snap.exists ? snap.data() : {};
    if (Array.isArray(content.blocks) && content.blocks.length > 0 && !FORCE) {
      skippedExisting += 1;
      console.log(`  skip ${lesson.id} — Firestore doc already has blocks (use --force to redraft)`);
      continue;
    }

    process.stdout.write(`  drafting ${lesson.id} ...\n`);
    try {
      const blocks = await generateForLesson(ai, lesson, content);
      const draft = {
        subcategoryId: lesson.id,
        subcategoryName: lesson.name,
        source: 'generate-lesson-blocks-v1',
        model: MODEL,
        generatedAt: new Date().toISOString(),
        blocks,
      };
      fs.writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`, 'utf8');
      generated += 1;
      console.log(`    wrote ${path.relative(ROOT, draftPath)} (${blocks.length} blocks)`);
    } catch (err) {
      failed += 1;
      console.error(`    FAILED ${lesson.id}: ${err.message}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Drafts written: ${generated}`);
  console.log(`Skipped:        ${skippedExisting}`);
  console.log(`Failed:         ${failed}`);
  console.log('\nReview the JSON drafts (preview via ?previewBlocks= in dev — see docs/lesson-blocks-authoring.md),');
  console.log('edit freely, then push with:  node scripts/generate-lesson-blocks.js --apply [--only=<id>]');
}

main().catch((e) => {
  console.error('generate-lesson-blocks failed:', e.message);
  process.exit(1);
});
