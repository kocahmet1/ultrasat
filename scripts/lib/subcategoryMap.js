/**
 * Shared subcategory mapping for SAT exam ingestion.
 * Canonical source of truth for the 29 official SAT subcategories.
 */

const SUBCATEGORIES = [
  // Reading and Writing — Information and Ideas
  { id: 1,  kebab: 'central-ideas-details',       name: 'Central Ideas and Details',       section: 'Reading and Writing', mainCategory: 'Information and Ideas' },
  { id: 2,  kebab: 'inferences',                  name: 'Inferences',                     section: 'Reading and Writing', mainCategory: 'Information and Ideas' },
  { id: 3,  kebab: 'command-of-evidence',          name: 'Command of Evidence',             section: 'Reading and Writing', mainCategory: 'Information and Ideas' },

  // Reading and Writing — Craft and Structure
  { id: 4,  kebab: 'words-in-context',             name: 'Words in Context',                section: 'Reading and Writing', mainCategory: 'Craft and Structure' },
  { id: 5,  kebab: 'text-structure-purpose',        name: 'Text Structure and Purpose',      section: 'Reading and Writing', mainCategory: 'Craft and Structure' },
  { id: 6,  kebab: 'cross-text-connections',        name: 'Cross-Text Connections',          section: 'Reading and Writing', mainCategory: 'Craft and Structure' },

  // Reading and Writing — Expression of Ideas
  { id: 7,  kebab: 'rhetorical-synthesis',          name: 'Rhetorical Synthesis',            section: 'Reading and Writing', mainCategory: 'Expression of Ideas' },
  { id: 8,  kebab: 'transitions',                   name: 'Transitions',                     section: 'Reading and Writing', mainCategory: 'Expression of Ideas' },
  { id: 9,  kebab: 'boundaries',                    name: 'Boundaries',                      section: 'Reading and Writing', mainCategory: 'Expression of Ideas' },
  { id: 10, kebab: 'form-structure-sense',           name: 'Form, Structure, and Sense',      section: 'Reading and Writing', mainCategory: 'Expression of Ideas' },

  // Math — Algebra
  { id: 11, kebab: 'linear-equations-one-variable',  name: 'Linear Equations in One Variable',                             section: 'Math', mainCategory: 'Algebra' },
  { id: 12, kebab: 'linear-functions',               name: 'Linear Functions',                                              section: 'Math', mainCategory: 'Algebra' },
  { id: 13, kebab: 'linear-equations-two-variables',  name: 'Linear Equations in Two Variables',                             section: 'Math', mainCategory: 'Algebra' },
  { id: 14, kebab: 'systems-linear-equations',        name: 'Systems of Two Linear Equations in Two Variables',              section: 'Math', mainCategory: 'Algebra' },
  { id: 15, kebab: 'linear-inequalities',             name: 'Linear Inequalities in One or Two Variables',                   section: 'Math', mainCategory: 'Algebra' },

  // Math — Advanced Math
  { id: 16, kebab: 'nonlinear-functions',             name: 'Nonlinear Functions',                                           section: 'Math', mainCategory: 'Advanced Math' },
  { id: 17, kebab: 'nonlinear-equations',             name: 'Nonlinear Equations in One Variable and Systems of Equations in Two Variables', section: 'Math', mainCategory: 'Advanced Math' },
  { id: 18, kebab: 'equivalent-expressions',          name: 'Equivalent Expressions',                                        section: 'Math', mainCategory: 'Advanced Math' },

  // Math — Problem-Solving and Data Analysis
  { id: 19, kebab: 'ratios-rates-proportions',        name: 'Ratios, Rates, Proportional Relationships, and Units',          section: 'Math', mainCategory: 'Problem-Solving and Data Analysis' },
  { id: 20, kebab: 'percentages',                     name: 'Percentages',                                                   section: 'Math', mainCategory: 'Problem-Solving and Data Analysis' },
  { id: 21, kebab: 'one-variable-data',               name: 'One-Variable Data: Distributions and Measures of Center and Spread', section: 'Math', mainCategory: 'Problem-Solving and Data Analysis' },
  { id: 22, kebab: 'two-variable-data',               name: 'Two-Variable Data: Models and Scatterplots',                    section: 'Math', mainCategory: 'Problem-Solving and Data Analysis' },
  { id: 23, kebab: 'probability',                     name: 'Probability and Conditional Probability',                       section: 'Math', mainCategory: 'Problem-Solving and Data Analysis' },
  { id: 24, kebab: 'inference-statistics',            name: 'Inference from Sample Statistics and Margin of Error',           section: 'Math', mainCategory: 'Problem-Solving and Data Analysis' },
  { id: 25, kebab: 'evaluating-statistical-claims',   name: 'Evaluating Statistical Claims: Observational Studies and Experiments', section: 'Math', mainCategory: 'Problem-Solving and Data Analysis' },

  // Math — Geometry and Trigonometry
  { id: 26, kebab: 'area-volume',                     name: 'Area and Volume',                                               section: 'Math', mainCategory: 'Geometry and Trigonometry' },
  { id: 27, kebab: 'lines-angles-triangles',          name: 'Lines, Angles, and Triangles',                                  section: 'Math', mainCategory: 'Geometry and Trigonometry' },
  { id: 28, kebab: 'right-triangles-trigonometry',     name: 'Right Triangles and Trigonometry',                              section: 'Math', mainCategory: 'Geometry and Trigonometry' },
  { id: 29, kebab: 'circles',                          name: 'Circles',                                                      section: 'Math', mainCategory: 'Geometry and Trigonometry' },
];

/**
 * Build lookup maps for fast access.
 */
const BY_KEBAB = {};
const BY_NAME_LOWER = {};
const BY_ID = {};

SUBCATEGORIES.forEach(sub => {
  BY_KEBAB[sub.kebab] = sub;
  BY_NAME_LOWER[sub.name.toLowerCase()] = sub;
  BY_ID[sub.id] = sub;
});

/**
 * Resolve any subcategory string (human-readable, kebab-case, numeric) to the canonical entry.
 * @param {string|number} input
 * @returns {Object|null} The subcategory entry or null.
 */
function resolveSubcategory(input) {
  if (input == null) return null;

  // Numeric
  if (typeof input === 'number') return BY_ID[input] || null;
  if (!isNaN(parseInt(input, 10))) return BY_ID[parseInt(input, 10)] || null;

  const lower = String(input).trim().toLowerCase();

  // Exact kebab match
  if (BY_KEBAB[lower]) return BY_KEBAB[lower];

  // Exact name match
  if (BY_NAME_LOWER[lower]) return BY_NAME_LOWER[lower];

  // Fuzzy: kebab in input or input in kebab
  for (const sub of SUBCATEGORIES) {
    if (lower.includes(sub.kebab) || sub.kebab.includes(lower)) return sub;
  }

  // Fuzzy: name in input or input in name
  for (const sub of SUBCATEGORIES) {
    const nameLower = sub.name.toLowerCase();
    if (lower.includes(nameLower) || nameLower.includes(lower)) return sub;
  }

  return null;
}

/**
 * Get the subcategory names list formatted for use in LLM prompts.
 */
function getSubcategoryPromptList() {
  const lines = [];
  let currentSection = '';
  let currentMain = '';

  for (const sub of SUBCATEGORIES) {
    if (sub.section !== currentSection) {
      currentSection = sub.section;
      lines.push(`\n--- ${currentSection} ---`);
    }
    if (sub.mainCategory !== currentMain) {
      currentMain = sub.mainCategory;
      lines.push(`  [${currentMain}]`);
    }
    lines.push(`    - "${sub.name}"`);
  }

  return lines.join('\n');
}

module.exports = {
  SUBCATEGORIES,
  resolveSubcategory,
  getSubcategoryPromptList,
  BY_KEBAB,
  BY_NAME_LOWER,
  BY_ID,
};
