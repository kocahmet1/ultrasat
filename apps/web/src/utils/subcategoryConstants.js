/**
 * Subcategory identification constants and utility functions
 *
 * IMPORTANT: kebab-case strings (e.g., 'central-ideas-details') are the canonical identifier
 * throughout the application. The numeric ID system is DEPRECATED and maintained only for
 * backward compatibility with existing data.
 *
 * REFACTORED (Phase 0, AI Coach): every map below is now DERIVED from the canonical
 * taxonomy (utils/subcategoryTaxonomy.js ← data/subcategoryTaxonomy.json). Values are
 * identical to the previous hand-written ones; they can no longer drift. Do not add
 * hand-written id/name maps — extend the taxonomy JSON instead.
 */

import {
  SUBCATEGORIES,
  toCanonicalSubcategoryId,
  getSubcategoryMeta,
} from './subcategoryTaxonomy';

// Main subcategory ID to numeric value mapping
// DEPRECATED: Used only for legacy data access. New code should use kebab-case identifiers.
export const SUBCATEGORY_IDS = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) {
    m[s.id.toUpperCase().replace(/-/g, '_')] = s.numericId;
  }
  return m;
})();

// Reverse mapping - Numeric ID to human-readable name
export const SUBCATEGORY_NAMES = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) m[s.numericId] = s.name;
  return m;
})();

// Mapping ID to canonical kebab-case format
export const SUBCATEGORY_KEBAB_CASE = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) m[s.numericId] = s.id;
  return m;
})();

// Category grouping for UI organization purposes (e.g. "reading-writing.information-ideas")
export const SUBCATEGORY_CATEGORIES = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) m[s.numericId] = `${s.section}.${s.domain}`;
  return m;
})();

// Main category mapping (for UI grouping), e.g. "algebra"
export const SUBCATEGORY_MAIN_CATEGORIES = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) m[s.numericId] = s.domain;
  return m;
})();

// Subject mapping for high-level categorization: 1 = Reading & Writing, 2 = Math
export const SUBCATEGORY_SUBJECTS = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) m[s.numericId] = s.section === 'reading-writing' ? 1 : 2;
  return m;
})();

// Color mapping for UI display (per domain)
export const SUBCATEGORY_COLORS = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) m[s.numericId] = s.color;
  return m;
})();

// Helper functions for working with subcategory IDs

/**
 * Get kebab-case format from any subcategory format (number, string, kebab-case, etc.)
 * @param {string|number} subcategory - Subcategory in any format
 * @returns {string|null} - Kebab-case subcategory string or null if not found
 */
export const getKebabCaseFromAnyFormat = (subcategory) => {
  if (!subcategory) return null;

  // Canonical resolver handles kebab, numeric, display names, aliases.
  const canonical = toCanonicalSubcategoryId(subcategory);
  if (canonical) return canonical;

  // Legacy fallbacks (behavior preserved for unknown values)
  if (typeof subcategory === 'string' && subcategory.includes('-')) {
    return subcategory.toLowerCase();
  }
  if (typeof subcategory === 'string') {
    return subcategory.toLowerCase().replace(/\s+/g, '-');
  }
  return null;
};

/**
 * Get subcategory ID from string (kebab-case or human-readable)
 * @returns {number|null} - Numeric subcategory ID or null if not found
 * @deprecated Use getKebabCaseFromAnyFormat instead for new code
 */
export const getSubcategoryIdFromString = (subcategoryString) => {
  if (subcategoryString === null || subcategoryString === undefined) return null;

  const meta = getSubcategoryMeta(subcategoryString);
  if (meta) return meta.numericId;

  // Legacy approximate matching for messy strings
  if (typeof subcategoryString === 'string') {
    const lower = subcategoryString.toLowerCase();
    for (const s of SUBCATEGORIES) {
      if (lower.includes(s.id) || s.id.includes(lower)) return s.numericId;
    }
    for (const s of SUBCATEGORIES) {
      const nameLower = s.name.toLowerCase();
      if (lower.includes(nameLower) || nameLower.includes(lower)) return s.numericId;
    }
  }

  return null;
};

/**
 * Get human-readable name from subcategory in any format
 */
export const getSubcategoryName = (subcategory) => {
  const meta = getSubcategoryMeta(subcategory);
  if (meta) return meta.name;

  // If it's already a human-readable name we know, return it (legacy behavior)
  const values = Object.values(SUBCATEGORY_NAMES);
  if (values.includes(subcategory)) return subcategory;

  return 'Unknown Subcategory';
};

/**
 * Get category path of a subcategory (accepts numeric id; any format works)
 */
export const getSubcategoryCategory = (subcategoryId) => {
  const meta = getSubcategoryMeta(subcategoryId);
  return meta ? `${meta.section}.${meta.domain}` : '';
};

/**
 * Get subject of a subcategory (Reading & Writing = 1, Math = 2)
 */
export const getSubcategorySubject = (subcategoryId) => {
  const meta = getSubcategoryMeta(subcategoryId);
  if (!meta) return 0;
  return meta.section === 'reading-writing' ? 1 : 2;
};

/**
 * Get color for a subcategory
 */
export const getSubcategoryColor = (subcategoryId) => {
  const meta = getSubcategoryMeta(subcategoryId);
  return meta ? meta.color : '#808080'; // Default gray
};

/**
 * Get array of all subcategories with their metadata
 * NOTE: keeps the historical shape of this module: numeric `id`, plus
 * `section` as 'reading' | 'math'.
 */
export const getSubcategoriesArray = () => {
  return SUBCATEGORIES.map((s) => ({
    id: s.numericId,
    name: s.name,
    category: `${s.section}.${s.domain}`,
    mainCategory: s.domain,
    section: s.section === 'reading-writing' ? 'reading' : 'math',
  }));
};
