/**
 * Validate scripts/data/practiceTest10RW.json — the two R&W replacement modules
 * for Exam 10 — against the production schema and College Board consistency rules.
 *
 * Also confirms embedded HTML tables survive the app's DOMPurify sanitizer.
 *
 * Usage: node scripts/validatePracticeTest10RW.js
 */

const path = require('path');
const { resolveSubcategory } = require('./lib/subcategoryMap');

let DOMPurify = null;
let domPurifyLoadError = null;
try {
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  DOMPurify = createDOMPurify(new JSDOM('').window);
} catch (e) {
  domPurifyLoadError = e;
}

const data = require(path.resolve(__dirname, 'data/practiceTest10RW.json'));

const RW_SECTION = 'Reading and Writing';
const letters = ['A', 'B', 'C', 'D'];
const errors = [];
const warnings = [];

if (!DOMPurify) {
  errors.push(`DOMPurify/jsdom are required for publication validation (${domPurifyLoadError?.message || 'load failed'})`);
}

// Editorial floors are intentionally higher than the format's absolute
// minimum. They keep future revisions from regressing to thin, giveaway
// stimuli while still leaving room for naturally concise questions.
const MIN_STIMULUS_WORDS = {
  'words-in-context': 50,
  'text-structure-purpose': 75,
  'cross-text-connections': 100,
  'central-ideas-details': 70,
  'command-of-evidence': 65,
  'inferences': 65,
  'boundaries': 35,
  'form-structure-sense': 35,
  'transitions': 45,
  'rhetorical-synthesis': 70,
};

const LENGTH_CUE_EXEMPT = new Set([
  'words-in-context',
  'boundaries',
  'form-structure-sense',
  'transitions',
]);

function wordCount(value) {
  const plain = String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\/?UNDERLINED\]/g, ' ')
    .replace(/&[a-z]+;/gi, ' ');
  return (plain.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) || []).length;
}

// Informational graphics accompany the prose passage; their axis labels, data
// cells, title, and description should not pad or overflow the passage-length
// editorial check.
function stimulusWordCount(value) {
  const proseOnly = String(value || '')
    .replace(/<table\b[\s\S]*?<\/table>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ');
  return wordCount(proseOnly);
}

function visibleText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\/?UNDERLINED\]/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function characterCount(value) {
  return visibleText(value).length;
}

function normalizeText(value) {
  return visibleText(value)
    .toLowerCase()
    .replace(/while researching a topic, a student has taken the following notes:/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(value) {
  const stopwords = new Set([
    'about', 'after', 'again', 'also', 'because', 'before', 'being', 'between', 'both',
    'could', 'does', 'from', 'have', 'into', 'more', 'most', 'only', 'other', 'over',
    'same', 'such', 'than', 'that', 'their', 'there', 'these', 'they', 'this', 'those',
    'through', 'under', 'very', 'were', 'what', 'when', 'where', 'which', 'while', 'with',
    'would', 'your', 'the', 'and', 'for', 'but', 'not', 'are', 'was', 'its', 'has', 'had',
  ]);
  return new Set(normalizeText(value).split(' ').filter((token) => token.length > 2 && !stopwords.has(token)));
}

function jaccardSimilarity(a, b) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

// This is the authored practice-form design, not an official fixed per-module
// blueprint. College Board publishes aggregate operational-domain ranges, not
// one mandatory skill count for every module.
const MODULE_BLUEPRINTS = {
  1: {
    'words-in-context': 4,
    'text-structure-purpose': 2,
    'cross-text-connections': 1,
    'central-ideas-details': 2,
    'command-of-evidence': 4,
    'inferences': 1,
    'boundaries': 4,
    'form-structure-sense': 3,
    'transitions': 3,
    'rhetorical-synthesis': 3,
  },
  2: {
    'words-in-context': 4,
    'text-structure-purpose': 2,
    'cross-text-connections': 1,
    'central-ideas-details': 2,
    'command-of-evidence': 4,
    'inferences': 1,
    'boundaries': 4,
    'form-structure-sense': 4,
    'transitions': 3,
    'rhetorical-synthesis': 2,
  },
};

const DOMAIN_BY_SKILL = {
  'words-in-context': 'Craft and Structure',
  'text-structure-purpose': 'Craft and Structure',
  'cross-text-connections': 'Craft and Structure',
  'central-ideas-details': 'Information and Ideas',
  'command-of-evidence': 'Information and Ideas',
  'inferences': 'Information and Ideas',
  'boundaries': 'Standard English Conventions',
  'form-structure-sense': 'Standard English Conventions',
  'transitions': 'Expression of Ideas',
  'rhetorical-synthesis': 'Expression of Ideas',
};

// The official ranges apply to 50 operational questions. This 54-question
// practice implementation does not separately score or mark its four pretest
// items, so the exact totals below are the maintained full-form targets.
const AGGREGATE_DOMAIN_TARGETS = {
  'Information and Ideas': { target: 14, officialMin: 12, officialMax: 14 },
  'Craft and Structure': { target: 14, officialMin: 13, officialMax: 15 },
  'Expression of Ideas': { target: 11, officialMin: 8, officialMax: 12 },
  'Standard English Conventions': { target: 15, officialMin: 11, officialMax: 15 },
};

// Official domain ordering (question N should be non-decreasing in this rank)
const DOMAIN_RANK = {
  'words-in-context': 1, 'text-structure-purpose': 1, 'cross-text-connections': 1, // Craft & Structure
  'central-ideas-details': 2, 'command-of-evidence': 2, 'inferences': 2,            // Information & Ideas
  'boundaries': 3, 'form-structure-sense': 3,                                       // Conventions
  'transitions': 4, 'rhetorical-synthesis': 4,                                      // Expression of Ideas
};

const SKILL_RANK_WITHIN_DOMAIN = {
  'words-in-context': 1,
  'text-structure-purpose': 2,
  'cross-text-connections': 3,
  'central-ideas-details': 1,
  'command-of-evidence': 2,
  'inferences': 3,
  'transitions': 1,
  'rhetorical-synthesis': 2,
};

const DIFFICULTY_RANK = { easy: 1, medium: 2, hard: 3 };

const BLANK_REQUIRED_SKILLS = new Set([
  'words-in-context',
  'inferences',
  'boundaries',
  'form-structure-sense',
  'transitions',
]);

const TRANSITION_RELATION_BY_TEXT = {
  'accordingly': 'cause-result',
  'as a result': 'cause-result',
  'consequently': 'cause-result',
  'hence': 'cause-result',
  'therefore': 'cause-result',
  'thus': 'cause-result',
  'for example': 'example',
  'for instance': 'example',
  'specifically': 'example',
  'taken together': 'synthesis',
  'collectively': 'synthesis',
  'in sum': 'synthesis',
  'overall': 'synthesis',
  'however': 'contrast-concession',
  'nevertheless': 'contrast-concession',
  'nonetheless': 'contrast-concession',
  'even so': 'contrast-concession',
  'by contrast': 'contrast-concession',
  'in contrast': 'contrast-concession',
  'conversely': 'contrast-concession',
  'in addition': 'addition',
  'furthermore': 'addition',
  'moreover': 'addition',
  'similarly': 'similarity',
  'likewise': 'similarity',
  'in other words': 'restatement',
  'that is': 'restatement',
  'instead': 'replacement',
  'meanwhile': 'temporal',
  'subsequently': 'temporal',
  'in fact': 'correction-emphasis',
  'indeed': 'correction-emphasis',
};

// Maintained alongside the authored transition items because the production
// question schema does not currently carry an editorial relationship tag.
const EXPECTED_TRANSITION_RELATIONSHIPS = {
  '1:22': 'example',              // Specifically,
  '1:23': 'contrast-concession',  // Nevertheless,
  '1:24': 'replacement',          // Instead,
  '2:23': 'cause-result',         // Accordingly,
  '2:24': 'addition',             // Furthermore,
  '2:25': 'synthesis',            // Taken together,
};

function normalizeTransition(value) {
  return String(value || '').trim().toLowerCase().replace(/[,:;.!?]+$/g, '').trim();
}

const modules = Array.isArray(data.modules) ? data.modules : [];
if (!Array.isArray(data.modules)) errors.push('modules must be an array');
if (modules.length !== 2) errors.push(`expected 2 modules, got ${modules.length}`);

const moduleNumbers = modules.map((mod) => mod.moduleNumber);
const uniqueModuleNumbers = [...new Set(moduleNumbers)].sort((a, b) => a - b);
if (uniqueModuleNumbers.join(',') !== '1,2' || moduleNumbers.length !== uniqueModuleNumbers.length) {
  errors.push(`module numbers must be unique {1,2}, got ${JSON.stringify(moduleNumbers)}`);
}

const aggregateDomainCounts = Object.fromEntries(
  Object.keys(AGGREGATE_DOMAIN_TARGETS).map((domain) => [domain, 0]),
);
const allItems = [];
const graphicTypeCounts = { table: 0, bar: 0, line: 0 };
let graphicItemCount = 0;
const transitionKeyedTextOwners = new Map();
const transitionRelationshipsSeen = new Set();
const transitionRelationshipItemsSeen = new Set();
const formLengthCueStats = { eligible: 0, wordUniqueLongest: 0, charUniqueLongest: 0 };

for (const mod of modules) {
  const tag0 = `M${mod.moduleNumber}`;
  if (mod.section !== RW_SECTION) errors.push(`${tag0}: section must be "${RW_SECTION}"`);
  if (mod.timeLimit !== 1920) errors.push(`${tag0}: timeLimit must be 1920`);
  if (mod.calculatorAllowed !== false) errors.push(`${tag0}: calculatorAllowed must be false`);
  const questions = Array.isArray(mod.questions) ? mod.questions : [];
  if (!Array.isArray(mod.questions)) errors.push(`${tag0}: questions must be an array`);
  if (questions.length !== 27) errors.push(`${tag0}: expected 27 questions, got ${questions.length}`);

  const answerLetters = [];
  const diffCount = { easy: 0, medium: 0, hard: 0 };
  const skillCount = {};
  let lastRank = 0;
  const lastSkillRankByDomain = new Map();
  const lastDifficultyBySkill = new Map();
  let lastConventionsDifficulty = 0;
  const passagesSeen = new Set();
  const moduleLengthCueStats = { eligible: 0, wordUniqueLongest: 0, charUniqueLongest: 0 };

  questions.forEach((qq, i) => {
    const tag = `${tag0} Q${qq.originalQuestionNumber}`;
    if (qq.originalQuestionNumber !== i + 1) errors.push(`${tag}: originalQuestionNumber out of sequence (index ${i})`);

    // schema
    if (!qq.text || !qq.text.trim()) errors.push(`${tag}: empty text`);
    if (!qq.explanation || qq.explanation.length < 120) errors.push(`${tag}: explanation missing/too short`);
    if (!['easy', 'medium', 'hard'].includes(qq.difficulty)) errors.push(`${tag}: bad difficulty`);
    diffCount[qq.difficulty] = (diffCount[qq.difficulty] || 0) + 1;
    skillCount[qq.subcategory] = (skillCount[qq.subcategory] || 0) + 1;
    const domain = DOMAIN_BY_SKILL[qq.subcategory];
    if (domain) aggregateDomainCounts[domain] += 1;

    // subcategory resolves and is R&W
    const sub = resolveSubcategory(qq.subcategory);
    if (!sub) errors.push(`${tag}: subcategory "${qq.subcategory}" does not resolve`);
    else {
      if (sub.id !== qq.subcategoryId) errors.push(`${tag}: subcategoryId ${qq.subcategoryId} != canonical ${sub.id}`);
      if (sub.section !== RW_SECTION) errors.push(`${tag}: subcategory not in R&W section`);
    }

    // domain ordering
    const rank = DOMAIN_RANK[qq.subcategory] || 0;
    if (rank < lastRank) errors.push(`${tag}: domain out of official order (${qq.subcategory} after rank ${lastRank})`);
    lastRank = Math.max(lastRank, rank);

    // College Board orders non-Conventions items first by skill and then from
    // easier to harder within that skill. Conventions items are ordered from
    // easier to harder across the domain, irrespective of skill.
    const difficultyRank = DIFFICULTY_RANK[qq.difficulty] || 0;
    if (domain === 'Standard English Conventions') {
      if (difficultyRank < lastConventionsDifficulty) {
        errors.push(`${tag}: Conventions difficulty drops from ${lastConventionsDifficulty} to ${difficultyRank}`);
      }
      lastConventionsDifficulty = Math.max(lastConventionsDifficulty, difficultyRank);
    } else if (domain) {
      const skillRank = SKILL_RANK_WITHIN_DOMAIN[qq.subcategory] || 0;
      const priorSkillRank = lastSkillRankByDomain.get(domain) || 0;
      if (skillRank < priorSkillRank) {
        errors.push(`${tag}: ${domain} skill is out of official grouping order`);
      }
      lastSkillRankByDomain.set(domain, Math.max(priorSkillRank, skillRank));
      const skillKey = `${domain}:${qq.subcategory}`;
      const priorDifficulty = lastDifficultyBySkill.get(skillKey) || 0;
      if (difficultyRank < priorDifficulty) {
        errors.push(`${tag}: ${qq.subcategory} difficulty drops from ${priorDifficulty} to ${difficultyRank}`);
      }
      lastDifficultyBySkill.set(skillKey, Math.max(priorDifficulty, difficultyRank));
    }

    // options
    if (qq.questionType !== 'multiple-choice') errors.push(`${tag}: R&W questions must be multiple-choice`);
    if (!Array.isArray(qq.options) || qq.options.length !== 4) {
      errors.push(`${tag}: must have exactly 4 options`);
    } else {
      const seen = new Set();
      qq.options.forEach((opt, oi) => {
        if (typeof opt !== 'string' || !opt.trim()) errors.push(`${tag}: option ${letters[oi]} empty`);
        if (/^[A-D][).]\s/.test(opt)) errors.push(`${tag}: option ${letters[oi]} has a letter prefix`);
        if (/<[a-z]+/i.test(opt)) errors.push(`${tag}: option ${letters[oi]} contains HTML`);
        const key = opt.trim().toLowerCase();
        if (seen.has(key)) errors.push(`${tag}: duplicate option "${opt}"`);
        seen.add(key);
      });
    }
    if (!Number.isInteger(qq.correctAnswer) || qq.correctAnswer < 0 || qq.correctAnswer > 3) {
      errors.push(`${tag}: correctAnswer must be 0-3`);
    } else {
      answerLetters.push(letters[qq.correctAnswer]);
    }
    if (qq.acceptedAnswers !== null) errors.push(`${tag}: acceptedAnswers must be null for MC`);

    // R&W questions must carry a passage/stimulus
    const passage = typeof qq.passage === 'string' ? qq.passage : '';
    if (!passage.trim()) errors.push(`${tag}: missing passage/stimulus`);
    const stimulusWords = stimulusWordCount(passage);
    const minStimulusWords = MIN_STIMULUS_WORDS[qq.subcategory] || 25;
    if (stimulusWords < minStimulusWords) {
      errors.push(`${tag}: stimulus has ${stimulusWords} words; ${qq.subcategory} editorial floor is ${minStimulusWords}`);
    }
    if (stimulusWords > 150) errors.push(`${tag}: stimulus exceeds 150 words (${stimulusWords})`);
    const blankCount = (passage.match(/_{6,}/g) || []).length;
    // Command-of-Evidence items written in the completion form end in a blank.
    // 41 of the 61 quantitative items in the official bank do, as do 16 of the
    // 29 quotation-illustration items, so the blank is required for the former
    // and optional for the latter.
    const isQuantitativeCompletion = qq.subcategory === 'command-of-evidence'
      && /uses data from the (table|graph)/i.test(qq.text || '');
    const isQuotationCompletion = qq.subcategory === 'command-of-evidence'
      && /Which quotation from/i.test(qq.text || '');
    if (BLANK_REQUIRED_SKILLS.has(qq.subcategory) || isQuantitativeCompletion) {
      if (blankCount !== 1) errors.push(`${tag}: ${qq.subcategory} passage must contain exactly one blank, got ${blankCount}`);
    } else if (isQuotationCompletion) {
      if (blankCount > 1) errors.push(`${tag}: quotation item may contain at most one blank, got ${blankCount}`);
    } else if (blankCount !== 0) {
      errors.push(`${tag}: unexpected blank in ${qq.subcategory} passage`);
    }
    if (qq.subcategory === 'cross-text-connections'
        && (!passage.includes('Text 1') || !passage.includes('Text 2'))) {
      errors.push(`${tag}: cross-text item must contain both Text 1 and Text 2`);
    }
    if (qq.subcategory === 'rhetorical-synthesis') {
      const noteCount = (passage.match(/•/g) || []).length;
      if (noteCount < 5) errors.push(`${tag}: rhetorical-synthesis item needs at least 5 notes, got ${noteCount}`);
    }
    const openMarkers = (passage.match(/\[UNDERLINED\]/g) || []).length;
    const closeMarkers = (passage.match(/\[\/UNDERLINED\]/g) || []).length;
    const isUnderlinedFunctionItem = (qq.subcategory === 'text-structure-purpose'
        && /function of the underlined/i.test(qq.text || ''))
      || (qq.subcategory === 'cross-text-connections'
        && /underlined (claim|portion|assertion)/i.test(qq.text || ''));
    if (isUnderlinedFunctionItem) {
      if (openMarkers !== 1 || closeMarkers !== 1
          || !/\[UNDERLINED\][\s\S]+\[\/UNDERLINED\]/.test(passage)) {
        errors.push(`${tag}: underlined-span item needs exactly one nonempty underlined span`);
      }
    } else if (openMarkers || closeMarkers) {
      errors.push(`${tag}: underline markers are only allowed in underlined-span items`);
    }
    // uniqueness of passages (ignore the shared rhetorical-synthesis "notes" preamble)
    const pkey = normalizeText(passage);
    if (pkey && passagesSeen.has(pkey)) warnings.push(`${tag}: passage opening duplicates an earlier question`);
    passagesSeen.add(pkey);
    allItems.push({
      moduleNumber: mod.moduleNumber,
      questionNumber: qq.originalQuestionNumber,
      tag,
      subcategory: qq.subcategory,
      passageNormalized: pkey,
      passageTokens: tokenSet(passage),
      optionsNormalized: Array.isArray(qq.options) ? qq.options.map(normalizeText) : [],
    });

    // Quantitative-graphic structure, accessibility, and sanitizer survival.
    const hasTable = /<table\b/i.test(passage);
    const hasSvg = /<svg\b/i.test(passage);
    if (hasTable && hasSvg) errors.push(`${tag}: use exactly one quantitative graphic per item`);
    if (hasTable || hasSvg) {
      graphicItemCount += 1;
      if (qq.subcategory !== 'command-of-evidence') {
        errors.push(`${tag}: quantitative graphics must be command-of-evidence items`);
      }
    }
    if (hasTable) {
      graphicTypeCounts.table += 1;
      if (DOMPurify) {
        const clean = DOMPurify.sanitize(passage);
        if (!/<table\b/i.test(clean) || !/<th\b/i.test(clean) || !/<td\b/i.test(clean)) {
          errors.push(`${tag}: table structure was stripped by sanitizer`);
        }
        const rawCells = (passage.match(/<t[hd]\b/gi) || []).length;
        const cleanCells = (clean.match(/<t[hd]\b/gi) || []).length;
        if (rawCells !== cleanCells) errors.push(`${tag}: sanitizer changed table cell count (${rawCells} -> ${cleanCells})`);
      }
    }
    if (hasSvg) {
      const typeMatch = passage.match(/<svg\b[^>]*\bdata-graph-type=["'](bar|line)["']/i);
      const graphicType = typeMatch?.[1]?.toLowerCase();
      if (!graphicType) {
        errors.push(`${tag}: SVG needs data-graph-type="bar" or "line"`);
      } else {
        graphicTypeCounts[graphicType] += 1;
      }
      if (DOMPurify) {
        const clean = DOMPurify.sanitize(passage);
        if (!/<svg\b/i.test(clean)) errors.push(`${tag}: SVG was stripped by sanitizer`);
        if (!/<svg\b[^>]*\bviewBox=["'][^"']+["']/i.test(clean)) errors.push(`${tag}: sanitized SVG needs a viewBox`);
        if (!/<title\b[^>]*>\s*[^<]+\s*<\/title>/i.test(clean)) errors.push(`${tag}: sanitized SVG needs a nonempty title`);
        if (!/<desc\b[^>]*>\s*[^<]+\s*<\/desc>/i.test(clean)) errors.push(`${tag}: sanitized SVG needs a nonempty desc`);
        if (!/<svg\b[^>]*\brole=["']img["']/i.test(clean)) errors.push(`${tag}: sanitized SVG needs role="img"`);
      }
    }

    if (qq.subcategory === 'transitions' && Number.isInteger(qq.correctAnswer)
        && Array.isArray(qq.options) && qq.options.length === 4) {
      const keyedTransition = normalizeTransition(qq.options[qq.correctAnswer]);
      const priorOwner = transitionKeyedTextOwners.get(keyedTransition);
      if (priorOwner) errors.push(`${tag}: keyed transition "${keyedTransition}" repeats ${priorOwner}`);
      else transitionKeyedTextOwners.set(keyedTransition, tag);

      const relationshipKey = `${mod.moduleNumber}:${qq.originalQuestionNumber}`;
      const expectedRelationship = EXPECTED_TRANSITION_RELATIONSHIPS[relationshipKey];
      const actualRelationship = TRANSITION_RELATION_BY_TEXT[keyedTransition];
      transitionRelationshipItemsSeen.add(relationshipKey);
      if (!expectedRelationship) errors.push(`${tag}: missing maintained transition-relationship mapping`);
      if (!actualRelationship) errors.push(`${tag}: keyed transition "${keyedTransition}" has no relationship mapping`);
      if (expectedRelationship && actualRelationship && expectedRelationship !== actualRelationship) {
        errors.push(`${tag}: keyed transition relationship ${actualRelationship} != expected ${expectedRelationship}`);
      }
      if (actualRelationship) transitionRelationshipsSeen.add(actualRelationship);
    }

    // Large keyed-option length gaps can reveal the answer without testing the
    // target skill. Exempt naturally short option sets such as vocabulary and
    // punctuation items.
    if (!LENGTH_CUE_EXEMPT.has(qq.subcategory) && Array.isArray(qq.options) && qq.options.length === 4
        && Number.isInteger(qq.correctAnswer)) {
      const optionWords = qq.options.map(wordCount);
      const optionCharacters = qq.options.map(characterCount);
      const keyedWords = optionWords[qq.correctAnswer];
      const distractorWords = optionWords.filter((_, oi) => oi !== qq.correctAnswer);
      const longestDistractor = Math.max(...distractorWords);
      const shortestDistractor = Math.min(...distractorWords);
      if (keyedWords >= longestDistractor * 1.3 && keyedWords - longestDistractor >= 4) {
        warnings.push(`${tag}: keyed option is conspicuously longer (${optionWords.join('/')})`);
      }
      if (keyedWords <= shortestDistractor * 0.7 && shortestDistractor - keyedWords >= 4) {
        warnings.push(`${tag}: keyed option is conspicuously shorter (${optionWords.join('/')})`);
      }

      const wordMax = Math.max(...optionWords);
      const charMax = Math.max(...optionCharacters);
      const keyIsUniqueWordLongest = keyedWords === wordMax && optionWords.filter((n) => n === wordMax).length === 1;
      const keyIsUniqueCharLongest = optionCharacters[qq.correctAnswer] === charMax
        && optionCharacters.filter((n) => n === charMax).length === 1;
      moduleLengthCueStats.eligible += 1;
      formLengthCueStats.eligible += 1;
      if (keyIsUniqueWordLongest) {
        moduleLengthCueStats.wordUniqueLongest += 1;
        formLengthCueStats.wordUniqueLongest += 1;
      }
      if (keyIsUniqueCharLongest) {
        moduleLengthCueStats.charUniqueLongest += 1;
        formLengthCueStats.charUniqueLongest += 1;
      }
    }

    if (Number.isInteger(qq.correctAnswer)) {
      const keyedLabel = letters[qq.correctAnswer];
      if (!new RegExp(`^\\s*Choice ${keyedLabel}\\b`).test(qq.explanation || '')) {
        errors.push(`${tag}: explanation must begin by naming keyed Choice ${keyedLabel}`);
      }
    }
  });

  // Authored module-design match.
  const blueprint = MODULE_BLUEPRINTS[mod.moduleNumber] || {};
  for (const [skill, want] of Object.entries(blueprint)) {
    const got = skillCount[skill] || 0;
    if (got !== want) errors.push(`${tag0}: skill "${skill}" count ${got} != authored design ${want}`);
  }

  // answer-position balance and streaks
  const seq = answerLetters.join('');
  const dist = {};
  answerLetters.forEach((l) => { dist[l] = (dist[l] || 0) + 1; });
  if (/AAA|BBB|CCC|DDD/.test(seq)) warnings.push(`${tag0}: 3+ identical answer letters in a row (${seq})`);
  const sortedShares = letters.map((letter) => dist[letter] || 0).sort((a, b) => a - b);
  if (sortedShares.join(',') !== '6,7,7,7') {
    errors.push(`${tag0}: answer positions must be balanced 6/7/7/7, got ${JSON.stringify(dist)}`);
  }

  const wordLongestRate = moduleLengthCueStats.eligible
    ? moduleLengthCueStats.wordUniqueLongest / moduleLengthCueStats.eligible : 0;
  const charLongestRate = moduleLengthCueStats.eligible
    ? moduleLengthCueStats.charUniqueLongest / moduleLengthCueStats.eligible : 0;
  if (wordLongestRate > 0.5) {
    warnings.push(`${tag0}: keyed option is uniquely longest by words in ${moduleLengthCueStats.wordUniqueLongest}/${moduleLengthCueStats.eligible} long-option items`);
  }
  if (charLongestRate > 0.65) {
    warnings.push(`${tag0}: keyed option is uniquely longest by characters in ${moduleLengthCueStats.charUniqueLongest}/${moduleLengthCueStats.eligible} long-option items`);
  }

  console.log(`\nModule ${mod.moduleNumber}: ${questions.length} q | difficulty ${JSON.stringify(diffCount)}`);
  console.log(`  answer positions ${JSON.stringify(dist)}  seq ${seq}`);
  console.log(`  skills ${JSON.stringify(skillCount)}`);
  console.log(`  keyed unique-longest: words ${moduleLengthCueStats.wordUniqueLongest}/${moduleLengthCueStats.eligible}, characters ${moduleLengthCueStats.charUniqueLongest}/${moduleLengthCueStats.eligible}`);
}

for (const [domain, target] of Object.entries(AGGREGATE_DOMAIN_TARGETS)) {
  const got = aggregateDomainCounts[domain] || 0;
  if (got < target.officialMin || got > target.officialMax) {
    errors.push(`form: ${domain} count ${got} outside official operational range ${target.officialMin}-${target.officialMax}`);
  }
  if (got !== target.target) {
    errors.push(`form: ${domain} count ${got} != authored target ${target.target} (official operational range ${target.officialMin}-${target.officialMax})`);
  }
}

for (const requiredType of ['table', 'bar', 'line']) {
  if (!graphicTypeCounts[requiredType]) errors.push(`form: quantitative graphics must include at least one ${requiredType}`);
}
if (graphicItemCount < 3) errors.push(`form: expected at least 3 quantitative graphic items, got ${graphicItemCount}`);

const expectedTransitionKeys = Object.keys(EXPECTED_TRANSITION_RELATIONSHIPS);
for (const key of expectedTransitionKeys) {
  if (!transitionRelationshipItemsSeen.has(key)) errors.push(`form: transition relationship map entry ${key} has no matching item`);
}
if (transitionRelationshipsSeen.size < 3) {
  errors.push(`form: transitions must cover at least 3 relationship categories, got ${[...transitionRelationshipsSeen].join(', ')}`);
}

// Cross-module exact and near-duplicate checks. Repeated conventional
// punctuation/transition option fragments are excluded from the option-overlap
// heuristic because those skills necessarily reuse short forms.
const optionOverlapExempt = new Set(['boundaries', 'form-structure-sense', 'transitions']);
for (let i = 0; i < allItems.length; i += 1) {
  for (let j = i + 1; j < allItems.length; j += 1) {
    const a = allItems[i];
    const b = allItems[j];
    if (a.moduleNumber === b.moduleNumber || a.subcategory !== b.subcategory) continue;
    if (a.passageNormalized && a.passageNormalized === b.passageNormalized) {
      errors.push(`${a.tag}/${b.tag}: normalized passages are identical`);
      continue;
    }
    const similarity = jaccardSimilarity(a.passageTokens, b.passageTokens);
    if (similarity >= 0.52) {
      warnings.push(`${a.tag}/${b.tag}: passages may be near-duplicates (token Jaccard ${similarity.toFixed(2)})`);
    }
    if (!optionOverlapExempt.has(a.subcategory)) {
      const sharedOptions = a.optionsNormalized.filter((option) => option && b.optionsNormalized.includes(option));
      if (new Set(sharedOptions).size >= 2) {
        warnings.push(`${a.tag}/${b.tag}: share ${new Set(sharedOptions).size} normalized options`);
      }
    }
  }
}

const formWordLongestRate = formLengthCueStats.eligible
  ? formLengthCueStats.wordUniqueLongest / formLengthCueStats.eligible : 0;
const formCharLongestRate = formLengthCueStats.eligible
  ? formLengthCueStats.charUniqueLongest / formLengthCueStats.eligible : 0;
if (formWordLongestRate > 0.5) {
  warnings.push(`form: keyed option is uniquely longest by words in ${formLengthCueStats.wordUniqueLongest}/${formLengthCueStats.eligible} long-option items`);
}
if (formCharLongestRate > 0.65) {
  warnings.push(`form: keyed option is uniquely longest by characters in ${formLengthCueStats.charUniqueLongest}/${formLengthCueStats.eligible} long-option items`);
}

console.log(`\nAggregate domains ${JSON.stringify(aggregateDomainCounts)}`);
console.log(`Graphics ${JSON.stringify(graphicTypeCounts)} across ${graphicItemCount} items`);
console.log(`Transition relationships ${JSON.stringify([...transitionRelationshipsSeen])}`);
console.log(`Form keyed unique-longest: words ${formLengthCueStats.wordUniqueLongest}/${formLengthCueStats.eligible}, characters ${formLengthCueStats.charUniqueLongest}/${formLengthCueStats.eligible}`);

console.log(`\n${'='.repeat(52)}`);
console.log(`Errors: ${errors.length}`);
errors.forEach((e) => console.log('  ERROR: ' + e));
console.log(`Warnings: ${warnings.length}`);
warnings.forEach((w) => console.log('  WARN: ' + w));
const strict = process.argv.includes('--strict');
process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
