/**
 * Subcategory normalization for the API server (CommonJS).
 *
 * This is the server-side counterpart of apps/web/src/utils/subcategoryUtils.js.
 * The API must NOT require() the web module: that file is ESM, imports JSON, and
 * relies on Vite's extensionless resolution, none of which Node can load.
 *
 * All id/name data derives from the canonical taxonomy mirror
 * (apps/api/subcategoryTaxonomy.js -> apps/api/data/subcategoryTaxonomy.json).
 * No hand-written id/name maps here.
 */

const {
  SUBCATEGORIES,
  toCanonicalSubcategoryId,
} = require('./subcategoryTaxonomy');

// name/alias -> kebab id, derived from the canonical taxonomy.
const SUBCATEGORY_NAME_TO_ID = (() => {
  const m = {};
  for (const s of SUBCATEGORIES) {
    m[s.name] = s.id;
    for (const alias of s.aliases) m[alias] = s.id;
  }
  return m;
})();

/**
 * Normalize a subcategory name/id to a canonical kebab-case id.
 * Mirrors the web implementation, including its legacy fallbacks.
 */
function normalizeSubcategoryName(name) {
  if (!name) return null;

  // Canonical resolver first: kebab ids, numeric ids, display names, aliases,
  // underscore/space variants — deterministically.
  const canonical = toCanonicalSubcategoryId(name);
  if (canonical) return canonical;

  // ---- Legacy fallbacks for unrecognized values (behavior preserved) ----

  // Kebab-ish but unknown to the taxonomy: pass through unchanged.
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
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  console.log(`Using fallback ID for unknown subcategory: '${name}' -> '${fallbackId}'`);
  return fallbackId;
}

module.exports = { normalizeSubcategoryName };
