/**
 * Explanation parser — shared between the questions import API
 * (apps/api/questionsAPI.js) and the backfill script
 * (scripts/backfill-structured-explanations.js).
 *
 * Turns whatever the generator emits for `explanation` (string blob, array of
 * lines, or the explicit structured object from the current prompt contract in
 * docs/question_generation_prompt.md) into BOTH:
 *   - a legacy joined `explanation` string (back-compat: every existing
 *     consumer keeps working), and
 *   - an `explanationStructured` object:
 *       {
 *         rule?: string,               // the tested rule/concept, one-liner
 *         steps?: string[],            // walkthrough to the correct answer
 *         choiceRebuttals?: { A?: string, B?: string, C?: string, D?: string },
 *         thingsToRemember?: string[]  // takeaways / traps to avoid
 *       }
 *
 * Pure module on purpose: no firebase, no express — safe to require anywhere.
 */

const CHOICE_LETTERS = ['A', 'B', 'C', 'D'];

// "Option B is incorrect because…", "Choice (C) is wrong…", "Answer D would…"
const CHOICE_LINE_RE = /^\s*(?:option|choice|answer)\s+\(?([A-Da-d])\)?\s*(?:[:.)-]|\s)/i;
// "(B) is incorrect because…"
const BARE_LETTER_LINE_RE = /^\s*\(([A-Da-d])\)\s+/;
// Explicit prefixes the generator (or a human author) may emit
const RULE_LINE_RE = /^\s*rule\s*[:\-]\s*/i;
const REMEMBER_LINE_RE = /^\s*(?:things?\s+to\s+remember|remember|key\s+takeaway|takeaway|note|tip)\s*[:\-]\s*/i;

/**
 * Detects the choice letter a line talks about, or null.
 */
function detectChoiceLetter(line) {
  if (typeof line !== 'string') return null;
  let m = line.match(CHOICE_LINE_RE);
  if (!m) m = line.match(BARE_LETTER_LINE_RE);
  return m ? m[1].toUpperCase() : null;
}

/**
 * Normalizes a rebuttal key to a choice letter: 'A'-'D', 'a', 0-3, '0'-'3'.
 * Returns null for anything else.
 */
function normalizeChoiceKey(key) {
  if (key === null || key === undefined) return null;
  if (typeof key === 'number' && Number.isInteger(key) && key >= 0 && key < CHOICE_LETTERS.length) {
    return CHOICE_LETTERS[key];
  }
  const str = String(key).trim();
  if (/^[A-Da-d]$/.test(str)) return str.toUpperCase();
  if (/^[0-3]$/.test(str)) return CHOICE_LETTERS[parseInt(str, 10)];
  return null;
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanStringArray(value) {
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  if (!Array.isArray(value)) return [];
  return value.map(cleanString).filter(Boolean);
}

/**
 * Validates/normalizes an explicit structured-explanation object (from the
 * generator, an import file, or Firestore). Returns the clean shape or null
 * if nothing usable is in it.
 */
function sanitizeStructuredExplanation(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;

  const rule = cleanString(input.rule);
  const steps = cleanStringArray(input.steps !== undefined ? input.steps : input.walkthrough);
  const thingsToRemember = cleanStringArray(input.thingsToRemember);

  const choiceRebuttals = {};
  const rawRebuttals = input.choiceRebuttals;
  if (rawRebuttals && typeof rawRebuttals === 'object' && !Array.isArray(rawRebuttals)) {
    Object.keys(rawRebuttals).forEach((key) => {
      const letter = normalizeChoiceKey(key);
      const text = cleanString(rawRebuttals[key]);
      if (letter && text) choiceRebuttals[letter] = text;
    });
  }

  const structured = {};
  if (rule) structured.rule = rule;
  if (steps.length > 0) structured.steps = steps;
  if (Object.keys(choiceRebuttals).length > 0) structured.choiceRebuttals = choiceRebuttals;
  if (thingsToRemember.length > 0) structured.thingsToRemember = thingsToRemember;

  return Object.keys(structured).length > 0 ? structured : null;
}

/**
 * Classifies an array of explanation lines (the generator's array format)
 * into structured parts. Non-choice paragraphs become walkthrough steps, in
 * order; "Option X is incorrect…" lines become per-choice rebuttals; explicit
 * "Rule:" / "Remember:" prefixes are honored when present.
 */
function parseExplanationLines(lines) {
  const steps = [];
  const choiceRebuttals = {};
  const thingsToRemember = [];
  let rule = '';

  (Array.isArray(lines) ? lines : []).forEach((raw) => {
    const line = cleanString(raw);
    if (!line) return;

    const letter = detectChoiceLetter(line);
    if (letter) {
      // Keep the first rebuttal per letter; append extras to it.
      choiceRebuttals[letter] = choiceRebuttals[letter]
        ? `${choiceRebuttals[letter]} ${line}`
        : line;
      return;
    }
    if (RULE_LINE_RE.test(line)) {
      const text = line.replace(RULE_LINE_RE, '').trim();
      if (text) rule = rule ? `${rule} ${text}` : text;
      return;
    }
    if (REMEMBER_LINE_RE.test(line)) {
      const text = line.replace(REMEMBER_LINE_RE, '').trim();
      if (text) thingsToRemember.push(text);
      return;
    }
    steps.push(line);
  });

  const structured = {};
  if (rule) structured.rule = rule;
  if (steps.length > 0) structured.steps = steps;
  if (Object.keys(choiceRebuttals).length > 0) structured.choiceRebuttals = choiceRebuttals;
  if (thingsToRemember.length > 0) structured.thingsToRemember = thingsToRemember;
  return Object.keys(structured).length > 0 ? structured : null;
}

/**
 * True when a parsed structure carries more signal than the flat blob:
 * at least one per-choice rebuttal, or a rule/takeaway, or a multi-step
 * walkthrough. A single loose paragraph is NOT worth persisting.
 */
function isMeaningfulStructure(structured) {
  if (!structured) return false;
  if (structured.choiceRebuttals && Object.keys(structured.choiceRebuttals).length > 0) return true;
  if (structured.rule) return true;
  if (structured.thingsToRemember && structured.thingsToRemember.length > 0) return true;
  return Array.isArray(structured.steps) && structured.steps.length >= 2;
}

/**
 * Splits a flattened blob back into candidate lines. Handles both newline
 * blobs (the common `array.join('\n')` case) and single-paragraph blobs where
 * "Option B is incorrect…" sentences run together on one line.
 */
function splitBlobIntoLines(blob) {
  const text = cleanString(blob);
  if (!text) return [];
  const lines = [];
  text.split(/\r?\n+/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    // Break apart inline per-choice sentences: "…is correct. Option B is incorrect because…"
    const pieces = trimmed.split(/(?=(?:Option|Choice|Answer)\s+\(?[A-D]\)?\s+(?:is|would|does|incorrectly|wrongly)\b)/);
    pieces.forEach((piece) => {
      const cleaned = piece.trim();
      if (cleaned) lines.push(cleaned);
    });
  });
  return lines;
}

/**
 * Cheap local re-parse of a legacy blob string. Returns the structured object
 * only when the result is meaningfully structured (see isMeaningfulStructure),
 * else null.
 */
function parseExplanationBlob(blob) {
  const structured = parseExplanationLines(splitBlobIntoLines(blob));
  return isMeaningfulStructure(structured) ? structured : null;
}

/**
 * Rebuilds the legacy joined string from a structured object, with prefixes
 * chosen so the blob round-trips through parseExplanationBlob.
 */
function buildLegacyExplanation(structured) {
  if (!structured) return '';
  const lines = [];
  if (structured.rule) lines.push(`Rule: ${structured.rule}`);
  (structured.steps || []).forEach((step) => lines.push(step));
  CHOICE_LETTERS.forEach((letter) => {
    const rebuttal = structured.choiceRebuttals && structured.choiceRebuttals[letter];
    if (!rebuttal) return;
    // Most rebuttals already read "Option B is incorrect because…"; only
    // prefix when the letter would otherwise be lost.
    lines.push(detectChoiceLetter(rebuttal) ? rebuttal : `Option ${letter}: ${rebuttal}`);
  });
  (structured.thingsToRemember || []).forEach((item) => lines.push(`Remember: ${item}`));
  return lines.join('\n').trim();
}

/**
 * THE entry point. Accepts the raw `explanation` value (string | string[] |
 * object | null) plus an optional explicit `explanationStructured` object and
 * returns { explanation: string, explanationStructured: object|null }.
 *
 * - Arrays keep producing the exact legacy `join('\n').trim()` string.
 * - Explicit structured input wins over anything derived heuristically.
 */
function normalizeExplanationParts(rawExplanation, rawStructured) {
  const explicit = sanitizeStructuredExplanation(rawStructured);

  // Object form of `explanation` itself (current prompt contract)
  if (rawExplanation && typeof rawExplanation === 'object' && !Array.isArray(rawExplanation)) {
    const structured = explicit || sanitizeStructuredExplanation(rawExplanation);
    return {
      explanation: buildLegacyExplanation(structured),
      explanationStructured: structured,
    };
  }

  if (Array.isArray(rawExplanation)) {
    const joined = rawExplanation
      .map((part) => (typeof part === 'string' ? part : String(part)))
      .join('\n')
      .trim();
    const parsed = parseExplanationLines(rawExplanation);
    const structured = explicit || (isMeaningfulStructure(parsed) ? parsed : null);
    return { explanation: joined, explanationStructured: structured };
  }

  if (typeof rawExplanation === 'string') {
    const trimmed = rawExplanation.trim();
    return {
      explanation: trimmed,
      explanationStructured: explicit || parseExplanationBlob(trimmed),
    };
  }

  if (rawExplanation === null || rawExplanation === undefined) {
    return {
      explanation: explicit ? buildLegacyExplanation(explicit) : '',
      explanationStructured: explicit,
    };
  }

  return { explanation: String(rawExplanation).trim(), explanationStructured: explicit };
}

module.exports = {
  CHOICE_LETTERS,
  detectChoiceLetter,
  normalizeChoiceKey,
  sanitizeStructuredExplanation,
  parseExplanationLines,
  parseExplanationBlob,
  splitBlobIntoLines,
  isMeaningfulStructure,
  buildLegacyExplanation,
  normalizeExplanationParts,
};
