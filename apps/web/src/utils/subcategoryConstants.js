/**
 * Subcategory identification constants and utility functions
 * 
 * IMPORTANT: kebab-case strings (e.g., 'central-ideas-details') are now the canonical identifier
 * throughout the application. The numeric ID system is DEPRECATED and maintained only for
 * backward compatibility with existing data.
 * 
 * New code should always use kebab-case identifiers for subcategories.
 */

// Main subcategory ID to numeric value mapping
// DEPRECATED: Used only for legacy data access. New code should use kebab-case identifiers.
export const SUBCATEGORY_IDS = {
  // Reading & Writing - Information & Ideas
  CENTRAL_IDEAS_DETAILS: 1,
  INFERENCES: 2,
  COMMAND_OF_EVIDENCE: 3,
  
  // Reading & Writing - Craft & Structure
  WORDS_IN_CONTEXT: 4,
  TEXT_STRUCTURE_PURPOSE: 5,
  CROSS_TEXT_CONNECTIONS: 6,
  
  // Reading & Writing - Expression of Ideas
  RHETORICAL_SYNTHESIS: 7,
  TRANSITIONS: 8,
  
  // Reading & Writing - Standard English Conventions
  BOUNDARIES: 9,
  FORM_STRUCTURE_SENSE: 10,
  
  // Math - Algebra
  LINEAR_EQUATIONS_ONE_VARIABLE: 11,
  LINEAR_FUNCTIONS: 12,
  LINEAR_EQUATIONS_TWO_VARIABLES: 13,
  SYSTEMS_LINEAR_EQUATIONS: 14,
  LINEAR_INEQUALITIES: 15,
  
  // Math - Advanced Math
  NONLINEAR_FUNCTIONS: 16,
  NONLINEAR_EQUATIONS: 17,
  EQUIVALENT_EXPRESSIONS: 18,
  
  // Math - Problem Solving & Data Analysis
  RATIOS_RATES_PROPORTIONS: 19,
  PERCENTAGES: 20,
  ONE_VARIABLE_DATA: 21,
  TWO_VARIABLE_DATA: 22,
  PROBABILITY: 23,
  INFERENCE_STATISTICS: 24,
  EVALUATING_STATISTICAL_CLAIMS: 25,
  
  // Math - Geometry & Trigonometry
  AREA_VOLUME: 26,
  LINES_ANGLES_TRIANGLES: 27,
  RIGHT_TRIANGLES_TRIGONOMETRY: 28,
  CIRCLES: 29
};

// Reverse mapping - Numeric ID to human-readable name
export const SUBCATEGORY_NAMES = {
  1: "Central Ideas and Details",
  2: "Inferences",
  3: "Command of Evidence",
  4: "Words in Context",
  5: "Text Structure and Purpose",
  6: "Cross-Text Connections",
  7: "Rhetorical Synthesis",
  8: "Transitions",
  9: "Boundaries",
  10: "Form, Structure, and Sense",
  11: "Linear Equations in One Variable",
  12: "Linear Functions",
  13: "Linear Equations in Two Variables",
  14: "Systems of Linear Equations",
  15: "Linear Inequalities",
  16: "Nonlinear Functions",
  17: "Nonlinear Equations",
  18: "Equivalent Expressions",
  19: "Ratios, Rates, and Proportions",
  20: "Percentages",
  21: "One-Variable Data",
  22: "Two-Variable Data",
  23: "Probability",
  24: "Inference from Statistics",
  25: "Evaluating Statistical Claims",
  26: "Area and Volume",
  27: "Lines, Angles, and Triangles",
  28: "Right Triangles and Trigonometry",
  29: "Circles"
};

// Mapping ID to legacy kebab-case format (for backward compatibility if needed)
export const SUBCATEGORY_KEBAB_CASE = {
  1: "central-ideas-details",
  2: "inferences",
  3: "command-of-evidence",
  4: "words-in-context",
  5: "text-structure-purpose",
  6: "cross-text-connections",
  7: "rhetorical-synthesis",
  8: "transitions",
  9: "boundaries",
  10: "form-structure-sense",
  11: "linear-equations-one-variable",
  12: "linear-functions",
  13: "linear-equations-two-variables",
  14: "systems-linear-equations",
  15: "linear-inequalities",
  16: "nonlinear-functions",
  17: "nonlinear-equations",
  18: "equivalent-expressions",
  19: "ratios-rates-proportions",
  20: "percentages",
  21: "one-variable-data",
  22: "two-variable-data",
  23: "probability",
  24: "inference-statistics",
  25: "evaluating-statistical-claims",
  26: "area-volume",
  27: "lines-angles-triangles",
  28: "right-triangles-trigonometry",
  29: "circles"
};

// Category grouping for UI organization purposes
export const SUBCATEGORY_CATEGORIES = {
  // Reading & Writing
  1: "reading-writing.information-ideas",
  2: "reading-writing.information-ideas",
  3: "reading-writing.information-ideas",
  4: "reading-writing.craft-structure",
  5: "reading-writing.craft-structure",
  6: "reading-writing.craft-structure",
  7: "reading-writing.expression-of-ideas",
  8: "reading-writing.expression-of-ideas",
  9: "reading-writing.standard-english-conventions",
  10: "reading-writing.standard-english-conventions",
  
  // Math
  11: "math.algebra",
  12: "math.algebra",
  13: "math.algebra",
  14: "math.algebra",
  15: "math.algebra",
  16: "math.advanced-math",
  17: "math.advanced-math",
  18: "math.advanced-math",
  19: "math.problem-solving-data-analysis",
  20: "math.problem-solving-data-analysis",
  21: "math.problem-solving-data-analysis",
  22: "math.problem-solving-data-analysis",
  23: "math.problem-solving-data-analysis",
  24: "math.problem-solving-data-analysis",
  25: "math.problem-solving-data-analysis",
  26: "math.geometry-trigonometry",
  27: "math.geometry-trigonometry",
  28: "math.geometry-trigonometry",
  29: "math.geometry-trigonometry"
};

// Main category mapping (for UI grouping)
export const SUBCATEGORY_MAIN_CATEGORIES = {
  // Reading & Writing
  1: "information-ideas",
  2: "information-ideas",
  3: "information-ideas",
  4: "craft-structure",
  5: "craft-structure",
  6: "craft-structure",
  7: "expression-of-ideas",
  8: "expression-of-ideas",
  9: "standard-english-conventions",
  10: "standard-english-conventions",
  
  // Math
  11: "algebra",
  12: "algebra",
  13: "algebra",
  14: "algebra",
  15: "algebra",
  16: "advanced-math",
  17: "advanced-math",
  18: "advanced-math",
  19: "problem-solving-data-analysis",
  20: "problem-solving-data-analysis",
  21: "problem-solving-data-analysis",
  22: "problem-solving-data-analysis",
  23: "problem-solving-data-analysis",
  24: "problem-solving-data-analysis",
  25: "problem-solving-data-analysis",
  26: "geometry-trigonometry",
  27: "geometry-trigonometry",
  28: "geometry-trigonometry",
  29: "geometry-trigonometry"
};

// Subject mapping for high-level categorization
export const SUBCATEGORY_SUBJECTS = {
  // 1 = Reading & Writing, 2 = Math
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 1,
  10: 1,
  11: 2,
  12: 2,
  13: 2,
  14: 2,
  15: 2,
  16: 2,
  17: 2,
  18: 2,
  19: 2,
  20: 2,
  21: 2,
  22: 2,
  23: 2,
  24: 2,
  25: 2,
  26: 2,
  27: 2,
  28: 2,
  29: 2
};

// Color mapping for UI display (maintains the same colors you're currently using)
export const SUBCATEGORY_COLORS = {
  // Reading & Writing
  1: "#4285F4", // Information & Ideas - Blue
  2: "#4285F4",
  3: "#4285F4",
  4: "#EA4335", // Craft & Structure - Red
  5: "#EA4335",
  6: "#EA4335",
  7: "#FBBC05", // Expression of Ideas - Yellow
  8: "#FBBC05",
  9: "#34A853", // Standard English Conventions - Green
  10: "#34A853",
  
  // Math
  11: "#4285F4", // Algebra - Blue
  12: "#4285F4",
  13: "#4285F4",
  14: "#4285F4",
  15: "#4285F4",
  16: "#EA4335", // Advanced Math - Red
  17: "#EA4335",
  18: "#EA4335",
  19: "#FBBC05", // Problem Solving & Data Analysis - Yellow
  20: "#FBBC05",
  21: "#FBBC05",
  22: "#FBBC05",
  23: "#FBBC05",
  24: "#FBBC05",
  25: "#FBBC05",
  26: "#34A853", // Geometry & Trigonometry - Green
  27: "#34A853",
  28: "#34A853",
  29: "#34A853"
};

// Helper functions for working with subcategory IDs

/**
 * Get kebab-case format from any subcategory format (number, string, kebab-case, etc.)
 * @param {string|number} subcategory - Subcategory in any format
 * @returns {string|null} - Kebab-case subcategory string or null if not found
 */
export const getKebabCaseFromAnyFormat = (subcategory) => {
  if (!subcategory) return null;
  
  // If it's already a kebab-case string, return as is (normalized to lowercase)
  if (typeof subcategory === 'string' && subcategory.includes('-')) {
    return subcategory.toLowerCase();
  }
  
  // If it's a number or numeric string, convert using the mapping
  if (!isNaN(parseInt(subcategory, 10))) {
    const numericId = parseInt(subcategory, 10);
    return SUBCATEGORY_KEBAB_CASE[numericId] || null;
  }
  
  // If it's a string but not kebab case, try to get numeric ID first
  if (typeof subcategory === 'string') {
    // Try to get numeric ID for more accurate conversion
    const numericId = getSubcategoryIdFromString(subcategory);
    if (numericId && SUBCATEGORY_KEBAB_CASE[numericId]) {
      return SUBCATEGORY_KEBAB_CASE[numericId];
    }
    // Fallback to simple string conversion
    return subcategory.toLowerCase().replace(/\s+/g, '-');
  }
  
  return null;
};

/**
 * Get subcategory ID from string (kebab-case or human-readable)
 * @param {string} subcategoryString - Subcategory in any format
 * @returns {number|null} - Numeric subcategory ID or null if not found
 * @deprecated Use getKebabCaseFromAnyFormat instead for new code
 */
export const getSubcategoryIdFromString = (subcategoryString) => {
  if (!subcategoryString) return null;
  
  // Check if it's already a number
  if (typeof subcategoryString === 'number') {
    return SUBCATEGORY_NAMES[subcategoryString] ? subcategoryString : null;
  }
  
  // Convert string to lowercase for case-insensitive comparison
  const lowerSubcategory = subcategoryString.toLowerCase();
  
  // Check kebab-case format first
  for (const [id, kebabCase] of Object.entries(SUBCATEGORY_KEBAB_CASE)) {
    if (kebabCase === lowerSubcategory) {
      return parseInt(id, 10);
    }
  }
  
  // Check human-readable format
  for (const [id, name] of Object.entries(SUBCATEGORY_NAMES)) {
    if (name.toLowerCase() === lowerSubcategory) {
      return parseInt(id, 10);
    }
  }
  
  // Check by approximate match if not exact
  for (const [id, kebabCase] of Object.entries(SUBCATEGORY_KEBAB_CASE)) {
    if (lowerSubcategory.includes(kebabCase) || kebabCase.includes(lowerSubcategory)) {
      return parseInt(id, 10);
    }
  }
  
  for (const [id, name] of Object.entries(SUBCATEGORY_NAMES)) {
    if (lowerSubcategory.includes(name.toLowerCase()) || name.toLowerCase().includes(lowerSubcategory)) {
      return parseInt(id, 10);
    }
  }
  
  return null;
};

/**
 * Get human-readable name from subcategory in any format
 * @param {number|string} subcategory - Subcategory in any format (numeric ID, kebab-case, etc.)
 * @returns {string} - Human-readable subcategory name
 */
export const getSubcategoryName = (subcategory) => {
  // If it's a numeric ID, look it up directly
  if (typeof subcategory === 'number') {
    return SUBCATEGORY_NAMES[subcategory] || "Unknown Subcategory";
  }
  
  // If it's already a human-readable name, return it
  const values = Object.values(SUBCATEGORY_NAMES);
  if (values.includes(subcategory)) {
    return subcategory;
  }
  
  // Otherwise, try to normalize to kebab-case first
  const kebabCase = getKebabCaseFromAnyFormat(subcategory);
  if (!kebabCase) {
    return "Unknown Subcategory";
  }
  
  // Find the numeric ID that corresponds to this kebab-case
  for (const [id, kebab] of Object.entries(SUBCATEGORY_KEBAB_CASE)) {
    if (kebab === kebabCase) {
      return SUBCATEGORY_NAMES[id];
    }
  }
  
  return "Unknown Subcategory";
};

/**
 * Get category of a subcategory
 * @param {number} subcategoryId - Numeric subcategory ID
 * @returns {string} - Category path
 */
export const getSubcategoryCategory = (subcategoryId) => {
  return SUBCATEGORY_CATEGORIES[subcategoryId] || "";
};

/**
 * Get subject of a subcategory (Reading & Writing = 1, Math = 2)
 * @param {number} subcategoryId - Numeric subcategory ID
 * @returns {number} - Subject ID
 */
export const getSubcategorySubject = (subcategoryId) => {
  return SUBCATEGORY_SUBJECTS[subcategoryId] || 0;
};

/**
 * Get color for a subcategory
 * @param {number} subcategoryId - Numeric subcategory ID
 * @returns {string} - Color hex code
 */
export const getSubcategoryColor = (subcategoryId) => {
  return SUBCATEGORY_COLORS[subcategoryId] || "#808080"; // Default gray
};

/**
 * Get array of all subcategories with their metadata
 * @returns {Array} - Array of subcategory objects with id, name, category, etc.
 */
export const getSubcategoriesArray = () => {
  const subcategories = [];
  
  // Iterate through all subcategory IDs and build full subcategory objects
  Object.keys(SUBCATEGORY_NAMES).forEach(id => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return;
    
    subcategories.push({
      id: numericId,
      name: SUBCATEGORY_NAMES[numericId],
      category: SUBCATEGORY_CATEGORIES[numericId] || '',
      mainCategory: SUBCATEGORY_MAIN_CATEGORIES[numericId] || '',
      section: getSubcategorySubject(numericId) === 1 ? 'reading' : 'math'
    });
  });
  
  return subcategories;
};
