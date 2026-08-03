/**
 * CANONICAL subcategory taxonomy access layer (API, CommonJS).
 *
 * Source of truth: apps/web/src/data/subcategoryTaxonomy.json
 * This side reads the synced copy in apps/api/data/ — keep them identical with
 * `node scripts/verify-taxonomy.js` (--fix copies web -> api).
 *
 * Server code (coach service, event ingestion, backfills) must persist ONLY
 * canonical kebab-case ids and convert legacy values at the boundary with
 * toCanonicalSubcategoryId(). Do not hand-write id/name maps anywhere else.
 */

const taxonomyData = require('./data/subcategoryTaxonomy.json');

const SUBCATEGORIES = taxonomyData.subcategories.map((s) => {
  const domain = taxonomyData.domains[s.domain] || {};
  return {
    id: s.id,
    numericId: s.numericId,
    name: s.name,
    domain: s.domain,
    domainName: domain.name || s.domain,
    section: domain.section || 'unknown',
    color: domain.color || '#808080',
    aliases: s.aliases || [],
  };
});

const BY_KEBAB = Object.fromEntries(SUBCATEGORIES.map((s) => [s.id, s]));
const BY_NUMERIC = Object.fromEntries(SUBCATEGORIES.map((s) => [s.numericId, s]));
const NUMERIC_TO_KEBAB = Object.fromEntries(SUBCATEGORIES.map((s) => [s.numericId, s.id]));
const KEBAB_TO_NUMERIC = Object.fromEntries(SUBCATEGORIES.map((s) => [s.id, s.numericId]));
const KEBAB_TO_NAME = Object.fromEntries(SUBCATEGORIES.map((s) => [s.id, s.name]));
const ALL_KEBAB_IDS = SUBCATEGORIES.map((s) => s.id);

const NAME_LOOKUP = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) {
    m[s.name.toLowerCase()] = s.id;
    for (const a of s.aliases) m[a.toLowerCase()] = s.id;
  }
  return m;
})();

function toCanonicalSubcategoryId(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return NUMERIC_TO_KEBAB[value] || null;
  const str = String(value).trim();
  if (/^\d+$/.test(str)) return NUMERIC_TO_KEBAB[parseInt(str, 10)] || null;
  const lower = str.toLowerCase();
  if (BY_KEBAB[lower]) return lower;
  const kebabized = lower.replace(/[_\s]+/g, '-');
  if (BY_KEBAB[kebabized]) return kebabized;
  if (NAME_LOOKUP[lower]) return NAME_LOOKUP[lower];
  return null;
}

function getSubcategoryMeta(value) {
  const id = toCanonicalSubcategoryId(value);
  return id ? BY_KEBAB[id] : null;
}

function getDisplayName(value) {
  const meta = getSubcategoryMeta(value);
  return meta ? meta.name : null;
}

function getSection(value) {
  const meta = getSubcategoryMeta(value);
  return meta ? meta.section : null;
}

module.exports = {
  TAXONOMY_VERSION: taxonomyData.version,
  SUBCATEGORIES,
  DOMAINS: taxonomyData.domains,
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
};
