/**
 * CANONICAL subcategory taxonomy access layer (web).
 *
 * Single source of truth: src/data/subcategoryTaxonomy.json
 * (synced copy for the API lives at apps/api/data/ — run `node scripts/verify-taxonomy.js`).
 *
 * RULES FOR NEW CODE (coach, events, Tier-2 state):
 *  - Persist ONLY canonical kebab-case ids (e.g. 'rhetorical-synthesis').
 *  - Convert any external/legacy value with toCanonicalSubcategoryId() at the boundary.
 *  - Never hand-write another id/name map. Import from here.
 */

import taxonomyData from '../data/subcategoryTaxonomy.json';

export const TAXONOMY_VERSION = taxonomyData.version;

/** Ordered array of the 29 canonical subcategory records (enriched with domain info). */
export const SUBCATEGORIES = taxonomyData.subcategories.map((s) => {
  const domain = taxonomyData.domains[s.domain] || {};
  return {
    id: s.id,
    numericId: s.numericId,
    name: s.name,
    domain: s.domain,
    domainName: domain.name || s.domain,
    section: domain.section || 'unknown', // 'reading-writing' | 'math'
    color: domain.color || '#808080',
    aliases: s.aliases || [],
  };
});

export const DOMAINS = taxonomyData.domains;

/** Lookup maps (built once). */
export const BY_KEBAB = Object.fromEntries(SUBCATEGORIES.map((s) => [s.id, s]));
export const BY_NUMERIC = Object.fromEntries(SUBCATEGORIES.map((s) => [s.numericId, s]));
export const NUMERIC_TO_KEBAB = Object.fromEntries(SUBCATEGORIES.map((s) => [s.numericId, s.id]));
export const KEBAB_TO_NUMERIC = Object.fromEntries(SUBCATEGORIES.map((s) => [s.id, s.numericId]));
export const KEBAB_TO_NAME = Object.fromEntries(SUBCATEGORIES.map((s) => [s.id, s.name]));

/** lowercase display-name + alias -> kebab id */
const NAME_LOOKUP = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) {
    m[s.name.toLowerCase()] = s.id;
    for (const a of s.aliases) m[a.toLowerCase()] = s.id;
  }
  return m;
})();

export const ALL_KEBAB_IDS = SUBCATEGORIES.map((s) => s.id);

/**
 * Resolve ANY historical representation of a subcategory to its canonical kebab-case id.
 * Handles: canonical kebab, numeric id (number or string), display name, known alias,
 * underscore/space variants. Deterministic — no keyword guessing.
 *
 * @param {string|number} value
 * @returns {string|null} canonical kebab id, or null if unrecognized
 */
export function toCanonicalSubcategoryId(value) {
  if (value === null || value === undefined || value === '') return null;

  // Numbers / numeric strings -> legacy numeric ids
  if (typeof value === 'number') return NUMERIC_TO_KEBAB[value] || null;
  const str = String(value).trim();
  if (/^\d+$/.test(str)) return NUMERIC_TO_KEBAB[parseInt(str, 10)] || null;

  const lower = str.toLowerCase();

  // Exact canonical kebab
  if (BY_KEBAB[lower]) return lower;

  // Underscore / space variants of kebab ids
  const kebabized = lower.replace(/[_\s]+/g, '-');
  if (BY_KEBAB[kebabized]) return kebabized;

  // Display names and aliases (case-insensitive)
  if (NAME_LOOKUP[lower]) return NAME_LOOKUP[lower];

  return null;
}

/** Full record for any representation, or null. */
export function getSubcategoryMeta(value) {
  const id = toCanonicalSubcategoryId(value);
  return id ? BY_KEBAB[id] : null;
}

export function getDisplayName(value) {
  const meta = getSubcategoryMeta(value);
  return meta ? meta.name : null;
}

/** 'reading-writing' | 'math' | null */
export function getSection(value) {
  const meta = getSubcategoryMeta(value);
  return meta ? meta.section : null;
}

export function getDomainId(value) {
  const meta = getSubcategoryMeta(value);
  return meta ? meta.domain : null;
}

export function getColor(value) {
  const meta = getSubcategoryMeta(value);
  return meta ? meta.color : '#808080';
}

/** Section -> domain -> ordered kebab ids (for menus/grouped UIs). */
export function getContentStructure() {
  const structure = {};
  for (const s of SUBCATEGORIES) {
    if (!structure[s.section]) structure[s.section] = {};
    if (!structure[s.section][s.domain]) structure[s.section][s.domain] = [];
    structure[s.section][s.domain].push(s.id);
  }
  return structure;
}

const subcategoryTaxonomy = {
  TAXONOMY_VERSION,
  SUBCATEGORIES,
  DOMAINS,
  BY_KEBAB,
  BY_NUMERIC,
  NUMERIC_TO_KEBAB,
  KEBAB_TO_NUMERIC,
  KEBAB_TO_NAME,
  ALL_KEBAB_IDS,
  toCanonicalSubcategoryId,
  getSubcategoryMeta,
  getDisplayName,
  getSection,
  getDomainId,
  getColor,
  getContentStructure,
};

export default subcategoryTaxonomy;
