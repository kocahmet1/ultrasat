/**
 * Utility functions for SAT exam subcategory management
 * This provides a simplified, direct approach using subcategories
 */

// Mapping between human-readable subcategory names and kebab-case IDs
const SUBCATEGORY_NAME_TO_ID = {
  // Reading/Writing
  "Central Ideas and Details": "central-ideas-details",
  "Inferences": "inferences",
  "Command of Evidence": "command-of-evidence",
  "Words in Context": "words-in-context",
  "Text Structure and Purpose": "text-structure-purpose",
  "Cross-Text Connections": "cross-text-connections",
  "Form, Structure, and Sense": "form-structure-sense",
  "Boundaries": "boundaries",
  "Rhetorical Synthesis": "rhetorical-synthesis",
  "Transitions": "transitions",
  
  // Math
  "Linear functions": "linear-functions",
  "Linear equations in one variable": "linear-equations-one-variable",
  "Linear equations in two variables": "linear-equations-two-variables",
  "Systems of linear equations": "systems-linear-equations",
  "Linear inequalities": "linear-inequalities",
  "Equivalent expressions": "equivalent-expressions",
  "Nonlinear functions": "nonlinear-functions",
  "Nonlinear equations": "nonlinear-equations",
  "Ratios, rates, proportional relationships, and units": "ratios-rates-proportions",
  "Percentages": "percentages",
  "One-variable data: Distributions and measures of center and spread": "one-variable-data",
  "Two-variable data: Models and scatterplots": "two-variable-data",
  "One-variable data: Distributions and measures of center and spread": "one-variable-data",
  "Probability and conditional probability": "probability",
  "Inference from sample statistics and margin of error": "inference-statistics",
  "Evaluating statistical claims": "evaluating-statistical-claims",
  "Area and volume": "area-volume",
  "Lines, angles, and triangles": "lines-angles-triangles",
  "Right triangles and trigonometry": "right-triangles-trigonometry",
  "Circles": "circles",
  
  // Handle any variations in naming
  "Two-variable data": "two-variable-data",
  "One-variable data": "one-variable-data",
  "Ratios, rates, proportional relationships": "ratios-rates-proportions",
  "Ratios, rates, proportional relationships, and units": "ratios-rates-proportions",
  "Ratios and rates": "ratios-rates-proportions",
  "Proportional relationships": "ratios-rates-proportions",
  "Ratios, rates, and proportions": "ratios-rates-proportions",
  "Right triangles": "right-triangles-trigonometry",
  "Linear Equations": "linear-equations-one-variable"
};

// Mapping of numeric subcategory IDs to kebab-case IDs
// This mapping is used for practice exam questions that use numeric IDs
const NUMERIC_ID_TO_KEBAB_CASE = {
  // Reading/Writing subcategories
  '1': 'central-ideas-details',
  '2': 'inferences',
  '3': 'command-of-evidence',
  '4': 'words-in-context',
  '5': 'text-structure-purpose',
  '6': 'cross-text-connections',
  '7': 'form-structure-sense',
  '8': 'boundaries',
  '9': 'rhetorical-synthesis',
  '10': 'transitions',
  
  // Math subcategories
  '11': 'linear-functions',
  '12': 'linear-equations-one-variable',
  '13': 'linear-equations-two-variables',
  '14': 'systems-linear-equations',
  '15': 'linear-inequalities',
  '16': 'equivalent-expressions',
  '17': 'nonlinear-functions',
  '18': 'nonlinear-equations',
  '19': 'ratios-rates-proportions',
  '20': 'percentages',
  '21': 'one-variable-data',
  '22': 'two-variable-data',
  '23': 'probability',
  '24': 'inference-statistics',
  '25': 'evaluating-statistical-claims',
  '26': 'area-volume',
  '27': 'lines-angles-triangles',
  '28': 'right-triangles-trigonometry',
  '29': 'circles'
};

// Function to normalize subcategory name to ID
export const normalizeSubcategoryName = (name) => {
  if (!name) return null;
  
  // If it's already in kebab-case, return as is
  if (name.includes('-')) return name;
  
  // Handle numeric IDs from practice exams
  const numericId = String(name).trim();
  if (NUMERIC_ID_TO_KEBAB_CASE[numericId]) {
    return NUMERIC_ID_TO_KEBAB_CASE[numericId];
  }
  
  // Special case for 'inferences' which frequently has issues
  if (name.toLowerCase() === 'inferences' || name.toLowerCase() === 'inference') {
    return 'inferences';
  }
  
  // Handle specific long-form math subcategories that often cause issues
  if (name.toLowerCase().includes('one-variable data') || 
      name.toLowerCase().includes('distributions') || 
      name.toLowerCase().includes('center and spread')) {
    return 'one-variable-data';
  }
  
  if (name.toLowerCase().includes('two-variable data') || 
      name.toLowerCase().includes('models and scatterplots') || 
      name.toLowerCase().includes('scatterplot')) {
    return 'two-variable-data';
  }
  
  if (name.toLowerCase().includes('cross-text') || 
      name.toLowerCase().includes('cross text')) {
    return 'cross-text-connections';
  }
  
  // Handle the various forms of "Ratios, rates, proportional relationships, and units"
  if (name.toLowerCase().includes('ratio') || 
      name.toLowerCase().includes('rate') || 
      name.toLowerCase().includes('proportion')) {
    return 'ratios-rates-proportions';
  }
  
  if (name.toLowerCase().includes('right triangle') || 
      name.toLowerCase().includes('trigonometry')) {
    return 'right-triangles-trigonometry';
  }
  
  // Trim any leading/trailing whitespace
  const trimmedName = name.trim();
  
  // Check if we have a direct mapping
  if (SUBCATEGORY_NAME_TO_ID[trimmedName]) {
    return SUBCATEGORY_NAME_TO_ID[trimmedName];
  }
  
  // Check if we have a case-insensitive match (helps with capitalization issues)
  for (const [key, value] of Object.entries(SUBCATEGORY_NAME_TO_ID)) {
    if (key.toLowerCase() === trimmedName.toLowerCase()) {
      return value;
    }
  }
  
  // Check if the name contains any of our known keys as a substring
  for (const [key, value] of Object.entries(SUBCATEGORY_NAME_TO_ID)) {
    if (trimmedName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Otherwise convert to kebab-case as a fallback
  const fallbackId = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
    
  console.log(`Using fallback ID for unknown subcategory: '${name}' -> '${fallbackId}'`);
  return fallbackId
};

// Define the comprehensive SAT content structure with subcategories
const SAT_CONTENT_STRUCTURE = {
  // Math categories and subcategories
  "math": {
    "algebra": [
      "linear-equations-one-variable",
      "linear-functions",
      "linear-equations-two-variables",
      "systems-linear-equations",
      "linear-inequalities"
    ],
    "advanced-math": [
      "nonlinear-functions",
      "nonlinear-equations",
      "equivalent-expressions"
    ],
    "problem-solving-data-analysis": [
      "ratios-rates-proportions",
      "percentages",
      "one-variable-data",
      "two-variable-data",
      "probability",
      "inference-statistics",
      "evaluating-statistical-claims"
    ],
    "geometry-trigonometry": [
      "area-volume",
      "lines-angles-triangles",
      "right-triangles-trigonometry",
      "circles"
    ]
  },
  
  // Reading and Writing categories and subcategories
  "reading-writing": {
    "information-ideas": [
      "central-ideas-details",
      "inferences",
      "command-of-evidence"
    ],
    "craft-structure": [
      "words-in-context",
      "text-structure-purpose",
      "cross-text-connections"
    ],
    "expression-of-ideas": [
      "rhetorical-synthesis",
      "transitions"
    ],
    "standard-english-conventions": [
      "boundaries",
      "form-structure-sense"
    ]
  }
};

// Create a flat list of all subcategories with display names
const ALL_SUBCATEGORIES = {};

// Populate subcategories for math
Object.entries(SAT_CONTENT_STRUCTURE.math).forEach(([category, subcategories]) => {
  subcategories.forEach(subcategory => {
    ALL_SUBCATEGORIES[subcategory] = {
      id: subcategory,
      name: formatSubcategoryName(subcategory),
      category: "math",
      mainCategory: category,
      fullPath: `math.${category}.${subcategory}`
    };
  });
});

// Populate subcategories for reading-writing
Object.entries(SAT_CONTENT_STRUCTURE["reading-writing"]).forEach(([category, subcategories]) => {
  subcategories.forEach(subcategory => {
    ALL_SUBCATEGORIES[subcategory] = {
      id: subcategory,
      name: formatSubcategoryName(subcategory),
      category: "reading-writing",
      mainCategory: category,
      fullPath: `reading-writing.${category}.${subcategory}`
    };
  });
});

/**
 * Formats a subcategory ID into a readable name
 * @param {string} subcategoryId - The subcategory ID in kebab-case
 * @returns {string} - Formatted subcategory name
 */
function formatSubcategoryName(subcategoryId) {
  return subcategoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Gets a subcategory by its ID
 * @param {string} subcategoryId - The subcategory ID
 * @returns {Object|null} - The subcategory object or null if not found
 */
export const getSubcategoryById = (subcategoryId) => {
  return ALL_SUBCATEGORIES[subcategoryId] || null;
};

/**
 * Gets all subcategories
 * @returns {Object} - Object with all subcategories where key is subcategory ID
 */
export const getAllSubcategories = () => {
  return ALL_SUBCATEGORIES;
};

/**
 * Gets a flat array of all subcategories
 * @returns {Array} - Array of all subcategory objects
 */
export const getSubcategoriesArray = () => {
  return Object.values(ALL_SUBCATEGORIES);
};

/**
 * Gets a human-readable name for a subcategory/skill tag
 * @param {string} skillTag - The skill tag in kebab-case format
 * @returns {string} - Human-readable subcategory name
 */
export const getHumanReadableSubcategory = (skillTag) => {
  if (!skillTag) return 'Unknown Skill';
  
  // Try to find it in our subcategories
  const subcategory = ALL_SUBCATEGORIES[skillTag];
  if (subcategory) {
    return subcategory.name;
  }
  
  // Reverse lookup in the name-to-id mapping
  for (const [name, id] of Object.entries(SUBCATEGORY_NAME_TO_ID)) {
    if (id === skillTag) {
      return name;
    }
  }
  
  // Default: format the kebab-case to Title Case
  return formatSubcategoryName(skillTag);
};

/**
 * Extract subcategory from a category path
 * @param {string} categoryPath - Full category path (e.g., "math.algebra.linear-functions")
 * @returns {string} - Subcategory ID or null if invalid
 */
export const extractSubcategoryFromPath = (categoryPath) => {
  if (!categoryPath) return null;
  
  const parts = categoryPath.split('.');
  if (parts.length < 3) return null;
  
  return parts[2]; // Return the subcategory part (third element)
};

/**
 * Enrich a question with subcategory information
 * @param {Object} question - The question to enrich
 * @returns {Object} - Question with explicit subcategory information
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
      
      // Add additional metadata for consistency
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
    
    // Try to find this skill in our subcategories
    const subcategories = getSubcategoriesArray();
    const matchingSubcategory = subcategories.find(s => s.id === skillTag || s.name.toLowerCase().includes(skillTag.toLowerCase()));
    
    if (matchingSubcategory) {
      question.subcategory = matchingSubcategory.id;
      question.category = matchingSubcategory.category;
      question.mainCategory = matchingSubcategory.mainCategory;
    }
  }
  
  // Last resort: Assign a default subcategory based on question content and type
  if (!question.subcategory) {
    // Determine if it's math or reading/writing based on question content or category
    let isReadingWriting = false;
    let isMath = false;
    
    // Check question text for clues
    if (question.text) {
      isReadingWriting = question.text.toLowerCase().includes('passage') || 
                       question.text.toLowerCase().includes('paragraph') || 
                       question.text.toLowerCase().includes('author') || 
                       question.text.toLowerCase().includes('sentence');
                       
      isMath = question.text.toLowerCase().includes('equation') || 
              question.text.toLowerCase().includes('solve') || 
              question.text.toLowerCase().includes('calculate') ||
              question.text.toLowerCase().includes('graph') ||
              question.text.toLowerCase().includes('value');
    }
    
    if (isReadingWriting) {
      question.subcategory = 'central-ideas-details'; // Default reading subcategory
      question.category = 'information-ideas';
      question.mainCategory = 'reading-writing';
    } else if (isMath) {
      question.subcategory = 'linear-equations-one-variable'; // Default math subcategory
      question.category = 'algebra';
      question.mainCategory = 'math';
    } else {
      // When all else fails, put in reading category
      question.subcategory = 'central-ideas-details';
      question.category = 'information-ideas';
      question.mainCategory = 'reading-writing';
    }
  }
  
  return question;
};

/**
 * Enrich an array of questions with subcategory information
 * @param {Array} questions - Array of questions
 * @returns {Array} - Questions with subcategory information
 */
export const enrichQuestionsWithSubcategory = (questions) => {
  if (!questions || !Array.isArray(questions)) return [];
  return questions.map(enrichQuestionWithSubcategory);
};

export default {
  getSubcategoryById,
  getAllSubcategories,
  getSubcategoriesArray,
  extractSubcategoryFromPath,
  enrichQuestionWithSubcategory,
  enrichQuestionsWithSubcategory,
  normalizeSubcategoryName,
  getHumanReadableSubcategory
};
