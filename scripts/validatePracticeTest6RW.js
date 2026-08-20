/**
 * Validate scripts/data/practiceTest6RW.json — the two R&W replacement modules
 * for Exam 6 — against the production schema and College Board consistency rules.
 *
 * Also confirms embedded HTML tables survive the app's DOMPurify sanitizer.
 *
 * Usage: node scripts/validatePracticeTest6RW.js
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

const data = require(path.resolve(__dirname, 'data/practiceTest6RW.json'));

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
  'words-in-context': 38,
  'text-structure-purpose': 75,
  'cross-text-connections': 110,
  'central-ideas-details': 70,
  'command-of-evidence': 65,
  'inferences': 65,
  'boundaries': 35,
  'form-structure-sense': 35,
  'transitions': 45,
  'rhetorical-synthesis': 54,
};

// Measured ceilings from the 1,200-item official Question Bank. Cross-text
// stimuli legitimately run longer than every other skill (official max 163).
const MAX_STIMULUS_WORDS = {
  'cross-text-connections': 155,  // official p95; 163 is a lone high-water mark
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
    'words-in-context': 5,
    'text-structure-purpose': 2,
    'cross-text-connections': 1,
    'central-ideas-details': 2,
    'command-of-evidence': 4,
    'inferences': 1,
    'boundaries': 3,
    'form-structure-sense': 3,
    'transitions': 3,
    'rhetorical-synthesis': 3,
  },
  2: {
    'words-in-context': 4,
    'text-structure-purpose': 2,
    'cross-text-connections': 1,
    'central-ideas-details': 1,
    'command-of-evidence': 4,
    'inferences': 2,
    'boundaries': 4,
    'form-structure-sense': 3,
    'transitions': 3,
    'rhetorical-synthesis': 3,
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
  'Craft and Structure': { target: 15, officialMin: 13, officialMax: 15 },
  'Expression of Ideas': { target: 12, officialMin: 8, officialMax: 12 },
  'Standard English Conventions': { target: 13, officialMin: 11, officialMax: 15 },
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
  '1:22': 'cause-result',
  '1:23': 'example',
  '1:24': 'contrast-concession',
  '2:22': 'temporal',
  '2:23': 'addition',
  '2:24': 'correction-emphasis',
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
const synthesisNoteCounts = [];

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
    const maxStimulusWords = MAX_STIMULUS_WORDS[qq.subcategory] || 150;
    if (stimulusWords > maxStimulusWords) {
      errors.push(`${tag}: stimulus has ${stimulusWords} words; ${qq.subcategory} ceiling is ${maxStimulusWords}`);
    }
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
      if (noteCount < 4 || noteCount > 6) {
        errors.push(`${tag}: rhetorical-synthesis note count ${noteCount} outside the official 4-6 band`);
      }
      synthesisNoteCounts.push(noteCount);
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
  if (/AAA|BBB|CCC|DDD/.test(seq)) errors.push(`${tag0}: 3+ identical answer letters in a row (${seq})`);
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
if (graphicItemCount < 4) errors.push(`form: expected 4 quantitative graphic items, got ${graphicItemCount}`);

const expectedTransitionKeys = Object.keys(EXPECTED_TRANSITION_RELATIONSHIPS);
for (const key of expectedTransitionKeys) {
  if (!transitionRelationshipItemsSeen.has(key)) errors.push(`form: transition relationship map entry ${key} has no matching item`);
}
if (transitionRelationshipsSeen.size < 6) {
  errors.push(`form: transitions must cover 6 distinct relationship categories, got ${transitionRelationshipsSeen.size} (${[...transitionRelationshipsSeen].join(', ')})`);
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
    if (similarity >= 0.30) {
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


// ---------------------------------------------------------------------------
// Test 6 additions: checks derived from measuring 1,200 official Question Bank
// items and the eight official practice-test R&W modules.
// ---------------------------------------------------------------------------

// Official practice forms braid Boundaries and Form/Structure/Sense rather than
// blocking them: mean 3.6 switches per module, the block opens on
// form-structure-sense in 8 of 8 modules and closes on boundaries in 7 of 8.
for (const mod of modules) {
  const conv = (mod.questions || []).filter((qq) => DOMAIN_BY_SKILL[qq.subcategory] === 'Standard English Conventions');
  const tag0 = `M${mod.moduleNumber}`;
  if (!conv.length) { errors.push(`${tag0}: no conventions items`); continue; }
  const shape = conv.map((qq) => (qq.subcategory === 'boundaries' ? 'B' : 'F')).join('');
  if (shape[0] !== 'F') errors.push(`${tag0}: conventions block must open on form-structure-sense (got ${shape})`);
  if (shape[shape.length - 1] !== 'B') errors.push(`${tag0}: conventions block must close on boundaries (got ${shape})`);
  let switches = 0;
  for (let i = 1; i < shape.length; i += 1) if (shape[i] !== shape[i - 1]) switches += 1;
  if (switches < 3) errors.push(`${tag0}: conventions block must interleave (>=3 switches, got ${switches} in ${shape})`);
  const nums = conv.map((qq) => qq.originalQuestionNumber);
  const contiguous = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
  if (!contiguous) errors.push(`${tag0}: conventions items must be contiguous, got ${JSON.stringify(nums)}`);
  console.log(`  ${tag0} conventions shape ${shape} (${switches} switches)`);
}

// Authored rule ledger. The official census supports 9-10 distinct rules per
// 54-question form with 3-4 rules appearing twice; several rules are also
// difficulty-locked in the official data.
const EXPECTED_CONVENTION_RULES = {
  '1:16': 'F02', '1:17': 'B08', '1:18': 'F06', '1:19': 'B03', '1:20': 'F01', '1:21': 'B01',
  '2:15': 'F06', '2:16': 'B03', '2:17': 'B09', '2:18': 'F01', '2:19': 'B01', '2:20': 'F05', '2:21': 'B05',
};
const RULE_SKILL = { B: 'boundaries', F: 'form-structure-sense' };
// Observed in the official corpus: B04 12/12 Easy and never Hard; B05 0/7 Easy;
// B11 0/6 Easy; F05 11/16 Hard and only 1/16 Easy.
const RULE_DIFFICULTY_LOCKS = {
  B04: { forbid: ['hard'] },
  B05: { forbid: ['easy'] },
  B11: { forbid: ['easy'] },
  F05: { forbid: ['easy'] },
};
const ruleUse = {};
for (const mod of modules) {
  for (const qq of mod.questions || []) {
    if (DOMAIN_BY_SKILL[qq.subcategory] !== 'Standard English Conventions') continue;
    const key = `${mod.moduleNumber}:${qq.originalQuestionNumber}`;
    const rule = EXPECTED_CONVENTION_RULES[key];
    const tag = `M${mod.moduleNumber} Q${qq.originalQuestionNumber}`;
    if (!rule) { errors.push(`${tag}: conventions item has no entry in the rule ledger`); continue; }
    if (RULE_SKILL[rule[0]] !== qq.subcategory) {
      errors.push(`${tag}: rule ${rule} does not match subcategory ${qq.subcategory}`);
    }
    const lock = RULE_DIFFICULTY_LOCKS[rule];
    if (lock && lock.forbid.includes(qq.difficulty)) {
      errors.push(`${tag}: rule ${rule} is never ${qq.difficulty} in the official corpus`);
    }
    ruleUse[rule] = (ruleUse[rule] || 0) + 1;
  }
}
const distinctRules = Object.keys(ruleUse).length;
if (distinctRules < 9) errors.push(`form: conventions must span >=9 distinct rules, got ${distinctRules}`);
for (const [rule, n] of Object.entries(ruleUse)) {
  if (n > 2) errors.push(`form: rule ${rule} used ${n} times (official forms repeat a rule at most twice)`);
}
console.log(`Conventions rules ${JSON.stringify(ruleUse)} (${distinctRules} distinct)`);

// Measured official stimulus bands (p10-p90 word counts from the 1,200-item
// Question Bank). Outside the band is an editorial warning, not an error.
const OFFICIAL_STIMULUS_BAND = {
  'words-in-context': [38, 78],
  'text-structure-purpose': [69, 128],
  'cross-text-connections': [124, 154],
  'central-ideas-details': [67, 115],
  'command-of-evidence': [37, 151],
  'inferences': [67, 122],
  'boundaries': [30, 58],
  'form-structure-sense': [24, 59],
  'transitions': [41, 64],
  'rhetorical-synthesis': [53, 99],
};
for (const mod of modules) {
  for (const qq of mod.questions || []) {
    const band = OFFICIAL_STIMULUS_BAND[qq.subcategory];
    if (!band) continue;
    const n = stimulusWordCount(qq.passage);
    if (n < band[0] || n > band[1]) {
      warnings.push(`M${mod.moduleNumber} Q${qq.originalQuestionNumber}: ${qq.subcategory} stimulus ${n} words is outside the official p10-p90 band ${band[0]}-${band[1]}`);
    }
  }
}

// Official note-count shape: mean 4.97, mode 5. A form whose synthesis items
// all carry the same number of notes is a templating tell.
if (synthesisNoteCounts.length) {
  const noteMean = synthesisNoteCounts.reduce((a, b) => a + b, 0) / synthesisNoteCounts.length;
  const noteMode = [...synthesisNoteCounts].sort((a, b) =>
    synthesisNoteCounts.filter((n) => n === b).length - synthesisNoteCounts.filter((n) => n === a).length)[0];
  if (noteMean < 4.5 || noteMean > 5.5) {
    errors.push(`form: synthesis note mean ${noteMean.toFixed(2)} outside the official 4.5-5.5 window (official 4.97)`);
  }
  if (noteMode !== 5) errors.push(`form: synthesis note mode is ${noteMode}, official mode is 5`);
  if (new Set(synthesisNoteCounts).size < 2) {
    warnings.push(`form: every synthesis item carries ${synthesisNoteCounts[0]} notes; official forms vary`);
  }
  console.log(`Synthesis notes ${JSON.stringify(synthesisNoteCounts)} mean ${noteMean.toFixed(2)} mode ${noteMode}`);
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


// ---------------------------------------------------------------------------
// Checks added after a verification audit found that every one of the ten most
// serious defects in this form passed the validator clean. Each corresponds to
// a defect class that reached the final draft undetected.
// ---------------------------------------------------------------------------

const allQuestions = modules.flatMap((mod) =>
  (mod.questions || []).map((qq) => ({ mod: mod.moduleNumber, qq, tag: `M${mod.moduleNumber} Q${qq.originalQuestionNumber}` })));

// (1) Explanation structure. College Board addresses distractors in A -> B -> C -> D
// order in 1,153 of 1,153 published rationales; this library's opener is
// `Choice X (gloss) is correct.`
for (const { qq, tag } of allQuestions) {
  const exp = qq.explanation || '';
  const keyed = letters[qq.correctAnswer];
  if (!new RegExp(`^Choice ${keyed} \\([^)]+\\) is correct\\.`).test(exp)) {
    errors.push(`${tag}: explanation must open "Choice ${keyed} (<gloss>) is correct."`);
  }
  const cited = (exp.match(/Choice ([A-D])\b/g) || []).map((m) => m.slice(-1));
  const firstSeen = [];
  for (const c of cited) if (!firstSeen.includes(c)) firstSeen.push(c);
  if (firstSeen.length !== 4) {
    errors.push(`${tag}: explanation must discuss all four choices, cites ${firstSeen.join('')}`);
  } else {
    const rest = firstSeen.filter((c) => c !== keyed).join('');
    const expected = letters.filter((c) => c !== keyed).join('');
    if (firstSeen[0] !== keyed || rest !== expected) {
      errors.push(`${tag}: explanation cites ${firstSeen.join('')}; expected ${keyed} then ${expected}`);
    }
  }
}

// (2) Transition strings must be unique across the Expression block, distractors
// included. An earlier draft shipped two items sharing three of four options
// because the option-overlap warning exempted this skill.
const transitionUses = new Map();
for (const { qq, tag } of allQuestions) {
  if (qq.subcategory !== 'transitions') continue;
  for (const opt of qq.options || []) {
    const norm = normalizeTransition(opt);
    if (transitionUses.has(norm)) errors.push(`${tag}: transition "${opt}" already used by ${transitionUses.get(norm)}`);
    else transitionUses.set(norm, tag);
  }
}

// (3) Numeric claims in graphic items must recompute against the markup. A key
// once claimed "roughly 70 percent" of a bar that read 78.
function tableGrid(html) {
  const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) || [];
  return rows.map((r) => (r.match(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi) || [])
    .map((c) => c.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim()));
}
for (const { qq, tag } of allQuestions) {
  const body = qq.passage || '';
  if (/<table\b/i.test(body)) {
    const grid = tableGrid(body).filter((r) => r.length);
    const dataRows = grid.filter((r) => r.some((c) => /\d/.test(c)));
    if (dataRows.length !== 5) errors.push(`${tag}: table should carry 5 data rows, got ${dataRows.length}`);
    const widths = [...new Set(grid.map((r) => r.length))];
    if (widths.length !== 1 || widths[0] !== 3) errors.push(`${tag}: table should be 3 columns, got widths ${widths.join('/')}`);
    const finalCol = dataRows.map((r) => parseFloat(String(r[r.length - 1]).replace(/[^0-9.-]/g, '')));
    if (finalCol.every((v) => !Number.isNaN(v))) {
      const asc = finalCol.every((v, i) => i === 0 || v >= finalCol[i - 1]);
      const desc = finalCol.every((v, i) => i === 0 || v <= finalCol[i - 1]);
      if (asc || desc) errors.push(`${tag}: table rows are sorted by the final column; College Board scrambles them`);
    }
    const inTable = new Set(grid.flat().flatMap((c) => (String(c).match(/\d+(?:\.\d+)?/g) || [])));
    const claimed = (`${(qq.options || []).join(' ')} ${qq.explanation || ''}`).match(/\d+(?:\.\d+)?/g) || [];
    const nums = [...inTable].map(Number).filter((v) => !Number.isNaN(v));
    const derived = new Set();
    for (const a of nums) for (const b of nums) {
      derived.add(Math.abs(a - b)); derived.add(a + b);
      if (b !== 0 && Number.isInteger(a / b)) derived.add(a / b);
      if (b !== 0) derived.add(Math.round((a / b) * 100));
    }
    for (const n of new Set(claimed)) {
      const v = Number(n);
      if (!inTable.has(n) && v > 3 && !derived.has(v)) {
        warnings.push(`${tag}: value ${n} is claimed but is neither in the table nor derivable from it`);
      }
    }
  }
  if (/<svg\b/i.test(body) && /data-graph-type=["']line["']/i.test(body)) {
    const series = (body.match(/<polyline\b/gi) || []).length;
    if (series < 2 || series > 3) warnings.push(`${tag}: line graph should plot 2-3 series, found ${series}`);
  }
}

// (4) Proper nouns must not repeat across items. Two researchers once appeared
// twice under different professions, and one name was inherited from a sibling form.
const NAME_STOP = new Set(['Text', 'Choice', 'While', 'Which', 'Standard', 'English', 'The', 'This', 'That',
  'When', 'Where', 'What', 'How', 'Because', 'Although', 'Researchers', 'Scientists', 'Module', 'Every', 'Many']);
const nameOwner = new Map();
for (const { qq, tag } of allQuestions) {
  const plain = visibleText(qq.passage);
  for (const n of new Set(plain.match(/\b[A-Z][a-zà-ÿA-Z’'-]+ [A-Z][a-zà-ÿ][a-zà-ÿA-Z’'-]*\b/g) || [])) {
    const [first, surname] = n.split(' ');
    if (NAME_STOP.has(first)) continue;
    const prior = nameOwner.get(n);
    if (prior && prior !== tag) errors.push(`${tag}: proper name "${n}" also appears at ${prior}`);
    else if (!prior) nameOwner.set(n, tag);
    const sKey = `surname:${surname}`;
    const sPrior = nameOwner.get(sKey);
    if (sPrior && sPrior !== tag) warnings.push(`${tag}: surname "${surname}" also used at ${sPrior}`);
    else if (!sPrior) nameOwner.set(sKey, tag);
  }
}

// (5) Mechanical conventions: official forms print unspaced em dashes 27/27 and
// use US spellings throughout.
const BRITISH = /\b\w*(?:colour|behaviour|theatre|metre|litre|catalogued|cataloguing|programme|analyse|defence|travelled|modelling|labelled)\w*\b/i;
for (const { qq, tag } of allQuestions) {
  // Test each field on its own. Options legitimately begin or end with a dash
  // in matched-pair Boundaries items, so a joined blob produces false hits.
  const fields = [['passage', qq.passage], ['stem', qq.text], ['explanation', qq.explanation]]
    .concat((qq.options || []).map((o, oi) => [`option ${letters[oi]}`, o]));
  for (const [label, value] of fields) {
    const v = String(value || '');
    if (/[^\s]\s+—|—\s+[^\s]/.test(v)) errors.push(`${tag}: em dash must be unspaced in ${label}`);
  }
  const b = fields.map(([, v]) => String(v || '')).join(' ').match(BRITISH);
  if (b) warnings.push(`${tag}: British spelling "${b[0]}"`);
}

// (6) Difficulty split asserted, not merely printed.
const EXPECTED_DIFFICULTY = { 1: { easy: 6, medium: 14, hard: 7 }, 2: { easy: 6, medium: 13, hard: 8 } };
for (const mod of modules) {
  const want = EXPECTED_DIFFICULTY[mod.moduleNumber];
  if (!want) continue;
  const got = { easy: 0, medium: 0, hard: 0 };
  for (const qq of mod.questions || []) got[qq.difficulty] = (got[qq.difficulty] || 0) + 1;
  for (const [d, n] of Object.entries(want)) {
    if (got[d] !== n) errors.push(`M${mod.moduleNumber}: ${d} count ${got[d]} != authored design ${n}`);
  }
}

// (7) Subject overlap across every pair of items in the form. The pre-existing
// near-duplicate check compares only same-skill cross-module pairs, so it could
// not see the two topic duplications the audit reported.
const contentTokens = allQuestions.map(({ qq, tag }) => ({ tag, tokens: tokenSet(qq.passage) }));
for (let i = 0; i < contentTokens.length; i += 1) {
  for (let j = i + 1; j < contentTokens.length; j += 1) {
    const sim = jaccardSimilarity(contentTokens[i].tokens, contentTokens[j].tokens);
    if (sim >= 0.16) warnings.push(`${contentTokens[i].tag}/${contentTokens[j].tag}: subject overlap (Jaccard ${sim.toFixed(3)})`);
  }
}

console.log(`Distinct proper names ${[...nameOwner.keys()].filter((k) => !k.startsWith('surname:')).length}`);
console.log(`Distinct transition strings ${transitionUses.size} across 6 transitions items`);

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
