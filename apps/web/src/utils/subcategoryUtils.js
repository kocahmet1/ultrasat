/**
 * Utility functions for SAT exam subcategory management
 *
 * REFACTORED (Phase 0, AI Coach): all id/name data now derives from the canonical
 * taxonomy in utils/subcategoryTaxonomy.js (source: data/subcategoryTaxonomy.json).
 * The old hand-written NUMERIC_ID_TO_KEBAB_CASE map in this file disagreed with
 * subcategoryConstants.js for numeric ids 7-12 and 16-18 and silently mis-attributed
 * progress writes; it has been removed. Export surface of this module is unchanged.
 */

import {
  SUBCATEGORIES,
  NUMERIC_TO_KEBAB,
  BY_KEBAB,
  toCanonicalSubcategoryId,
  getDisplayName,
} from './subcategoryTaxonomy';

// Mapping between human-readable subcategory names (and known aliases) and kebab-case IDs.
// Derived from the canonical taxonomy — kept for backward compatibility with existing imports.
const SUBCATEGORY_NAME_TO_ID = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) {
    m[s.name] = s.id;
    for (const alias of s.aliases) m[alias] = s.id;
  }
  return m;
})();

// Mapping of numeric subcategory IDs to kebab-case IDs (canonical, authoring-intent order).
const NUMERIC_ID_TO_KEBAB_CASE = NUMERIC_TO_KEBAB;

// Function to normalize subcategory name to ID
export const normalizeSubcategoryName = (name) => {
  if (!name) return null;

  // Canonical resolver first: handles kebab ids, numeric ids (number/string),
  // display names, aliases, and underscore/space variants — deterministically.
  const canonical = toCanonicalSubcategoryId(name);
  if (canonical) return canonical;

  // ---- Legacy fallbacks for unrecognized values (behavior preserved) ----

  // If it's kebab-ish but unknown to the taxonomy, pass through unchanged
  // (legacy behavior; callers historically relied on this).
  if (typeof name === 'string' && name.includes('-') && !/\s/.test(name)) {
    return name.toLowerCase();
  }

  const lowerName = String(name).toLowerCase();

  // Keyword heuristics for messy legacy strings
  if (lowerName.includes('one-variable data') || lowerName.includes('distributions') || lowerName.includes('center and spread')) {
    return 'one-variable-data';
  }
  if (lowerName.includes('two-variable data') || lowerName.includes('models and scatterplots') || lowerName.includes('scatterplot')) {
    return 'two-variable-data';
  }
  if (lowerName.includes('cross-text') || lowerName.includes('cross text')) {
    return 'cross-text-connections';
  }
  if (lowerName.includes('ratio') || lowerName.includes('rate') || lowerName.includes('proportion')) {
    return 'ratios-rates-proportions';
  }
  if (lowerName.includes('right triangle') || lowerName.includes('trigonometry')) {
    return 'right-triangles-trigonometry';
  }

  const trimmedName = String(name).trim();

  // Substring match against known names/aliases
  for (const [key, value] of Object.entries(SUBCATEGORY_NAME_TO_ID)) {
    if (trimmedName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Otherwise convert to kebab-case as a fallback
  const fallbackId = trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-'); // Replace spaces with hyphens

  console.log(`Using fallback ID for unknown subcategory: '${name}' -> '${fallbackId}'`);
  return fallbackId;
};

// Flat map of all subcategories with display metadata (derived from canonical taxonomy).
const ALL_SUBCATEGORIES = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) {
    m[s.id] = {
      id: s.id,
      name: s.name,
      category: s.section, // 'math' | 'reading-writing'
      mainCategory: s.domain, // e.g. 'algebra'
      fullPath: `${s.section}.${s.domain}.${s.id}`,
    };
  }
  return m;
})();

/**
 * Gets a subcategory by its ID
 */
export const getSubcategoryById = (subcategoryId) => {
  return ALL_SUBCATEGORIES[subcategoryId] || null;
};

/**
 * Gets all subcategories (object keyed by kebab id)
 */
export const getAllSubcategories = () => {
  return ALL_SUBCATEGORIES;
};

/**
 * Gets a flat array of all subcategories
 */
export const getSubcategoriesArray = () => {
  return Object.values(ALL_SUBCATEGORIES);
};

/**
 * Gets a human-readable name for a subcategory/skill tag
 */
export const getHumanReadableSubcategory = (skillTag) => {
  if (!skillTag) return 'Unknown Skill';

  const canonicalName = getDisplayName(skillTag);
  if (canonicalName) return canonicalName;

  // Default: format unknown kebab-case to Title Case
  return String(skillTag)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Extract subcategory from a category path
 * @param {string} categoryPath - Full category path (e.g., "math.algebra.linear-functions")
 */
export const extractSubcategoryFromPath = (categoryPath) => {
  if (!categoryPath) return null;

  const parts = categoryPath.split('.');
  if (parts.length < 3) return null;

  return parts[2];
};

/**
 * Enrich a question with subcategory information
 */
export const enrichQuestionWithSubcategory = (question) => {
  // If question already has subcategory field, normalize it
  if (question.subcategory) {
    question.subcategory = normalizeSubcategoryName(question.subcategory);
    return question;
  }

  // If question has categoryPath, extract subcategory from it
  if (question.categoryPath) {
    const subcategory = extractSubcategoryFromPath(question.categoryPath);
    if (subcategory) {
      question.subcategory = subcategory;

      if (ALL_SUBCATEGORIES[subcategory]) {
        question.category = ALL_SUBCATEGORIES[subcategory].category;
        question.mainCategory = ALL_SUBCATEGORIES[subcategory].mainCategory;
      }
    }
  }

  // If still no subcategory but has skillTags, use the first skill tag as subcategory
  if (!question.subcategory && question.skillTags && question.skillTags.length > 0) {
    const skillTag = question.skillTags[0];
    question.subcategory = skillTag;

    const subcategories = getSubcategoriesArray();
    const matchingSubcategory = subcategories.find(
      (s) => s.id === skillTag || s.name.toLowerCase().includes(String(skillTag).toLowerCase())
    );

    if (matchingSubcategory) {
      question.subcategory = matchingSubcategory.id;
      question.category = matchingSubcategory.category;
      question.mainCategory = matchingSubcategory.mainCategory;
    }
  }

  // Last resort: Assign a default subcategory based on question content and type
  if (!question.subcategory) {
    let isReadingWriting = false;
    let isMath = false;

    if (question.text) {
      isReadingWriting =
        question.text.toLowerCase().includes('passage') ||
        question.text.toLowerCase().includes('paragraph') ||
        question.text.toLowerCase().includes('author') ||
        question.text.toLowerCase().includes('sentence');

      isMath =
        question.text.toLowerCase().includes('equation') ||
        question.text.toLowerCase().includes('solve') ||
        question.text.toLowerCase().includes('calculate') ||
        question.text.toLowerCase().includes('graph') ||
        question.text.toLowerCase().includes('value');
    }

    if (isReadingWriting) {
      question.subcategory = 'central-ideas-details';
      question.category = 'information-ideas';
      question.mainCategory = 'reading-writing';
    } else if (isMath) {
      question.subcategory = 'linear-equations-one-variable';
      question.category = 'algebra';
      question.mainCategory = 'math';
    } else {
      question.subcategory = 'central-ideas-details';
      question.category = 'information-ideas';
      question.mainCategory = 'reading-writing';
    }
  }

  return question;
};

/**
 * Enrich an array of questions with subcategory information
 */
export const enrichQuestionsWithSubcategory = (questions) => {
  if (!questions || !Array.isArray(questions)) return [];
  return questions.map(enrichQuestionWithSubcategory);
};

const subcategoryUtils = {
  getSubcategoryById,
  getAllSubcategories,
  getSubcategoriesArray,
  extractSubcategoryFromPath,
  enrichQuestionWithSubcategory,
  enrichQuestionsWithSubcategory,
  normalizeSubcategoryName,
  getHumanReadableSubcategory,
};

export default subcategoryUtils;
