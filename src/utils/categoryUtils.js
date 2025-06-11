/**
 * Utility functions for SAT exam categorization and skill mapping
 */

// Define the comprehensive SAT content structure
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

// Mapping from old numeric categories to new category structure
const LEGACY_CATEGORY_MAPPING = {
  // Old Category 1: Reading/Verbal questions (vocabulary, language usage)
  1: ["reading-writing.craft-structure.words-in-context", "reading-writing.standard-english-conventions.form-structure-sense"],
  
  // Old Category 2: Main idea/Purpose questions
  2: ["reading-writing.information-ideas.central-ideas-details", "reading-writing.craft-structure.text-structure-purpose"],
  
  // Old Category 3: Analysis/Evidence questions
  3: ["reading-writing.information-ideas.command-of-evidence", "reading-writing.craft-structure.text-structure-purpose"],
  
  // Old Category 4: Math calculation questions
  4: ["math.algebra.linear-equations-one-variable", "math.advanced-math.equivalent-expressions"],
  
  // Old Category 5: Math word problems
  5: ["math.problem-solving-data-analysis.percentages", "math.problem-solving-data-analysis.ratios-rates-proportions"]
};

/**
 * Gets all available categories and subcategories in a flat structure
 * @returns {Object} - Flattened category structure with paths as keys
 */
export const getAllCategoriesFlat = () => {
  const flatCategories = {};
  
  // Process math categories
  Object.entries(SAT_CONTENT_STRUCTURE.math).forEach(([mathCategory, subcategories]) => {
    // Add the main category
    flatCategories[`math.${mathCategory}`] = {
      name: formatCategoryName(mathCategory),
      path: `math.${mathCategory}`,
      type: 'category'
    };
    
    // Add subcategories
    subcategories.forEach(subcategory => {
      flatCategories[`math.${mathCategory}.${subcategory}`] = {
        name: formatCategoryName(subcategory),
        path: `math.${mathCategory}.${subcategory}`,
        parentPath: `math.${mathCategory}`,
        type: 'subcategory'
      };
    });
  });
  
  // Process reading-writing categories
  Object.entries(SAT_CONTENT_STRUCTURE["reading-writing"]).forEach(([rwCategory, subcategories]) => {
    // Add the main category
    flatCategories[`reading-writing.${rwCategory}`] = {
      name: formatCategoryName(rwCategory),
      path: `reading-writing.${rwCategory}`,
      type: 'category'
    };
    
    // Add subcategories
    subcategories.forEach(subcategory => {
      flatCategories[`reading-writing.${rwCategory}.${subcategory}`] = {
        name: formatCategoryName(subcategory),
        path: `reading-writing.${rwCategory}.${subcategory}`,
        parentPath: `reading-writing.${rwCategory}`,
        type: 'subcategory'
      };
    });
  });
  
  return flatCategories;
};

/**
 * Formats a category or subcategory ID into a readable name
 * @param {string} categoryId - The category ID in kebab-case
 * @returns {string} - Formatted category name
 */
const formatCategoryName = (categoryId) => {
  return categoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Maps a legacy numeric category to the new category structure
 * @param {number} category - The numeric category (1-5)
 * @returns {string[]} - Array of category paths
 */
export const mapLegacyCategoryToNewCategories = (category) => {
  if (!category || !LEGACY_CATEGORY_MAPPING[category]) {
    return ["reading-writing.information-ideas.central-ideas-details"]; // Default fallback
  }
  return LEGACY_CATEGORY_MAPPING[category];
};

/**
 * Updates a question with the new category structure based on its legacy category
 * @param {Object} question - The question object
 * @returns {Object} - Updated question with new category structure
 */
export const enrichQuestionWithNewCategories = (question) => {
  // If the question already has the new category structure, return it as is
  if (question.categoryPath) {
    return question;
  }
  
  // If the question has a subcategory but no category path, derive from subcategory
  if (question.subCategory && !question.categoryPath) {
    const subCategory = question.subCategory.toLowerCase();
    
    // Map subcategory to a category path (simplified mapping)
    if (subCategory.includes('vocabulary') || subCategory.includes('word')) {
      question.categoryPath = "reading-writing.craft-structure.words-in-context";
    } else if (subCategory.includes('evidence') || subCategory.includes('argument')) {
      question.categoryPath = "reading-writing.information-ideas.command-of-evidence";
    } else if (subCategory.includes('main-idea') || subCategory.includes('central') || subCategory.includes('purpose')) {
      question.categoryPath = "reading-writing.information-ideas.central-ideas-details";
    } else if (subCategory.includes('structure')) {
      question.categoryPath = "reading-writing.craft-structure.text-structure-purpose";
    } else {
      // Default for reading/writing questions
      question.categoryPath = "reading-writing.information-ideas.central-ideas-details";
    }
  } 
  // If the question has a legacy category, map it to the new structure
  else if (question.category) {
    const categoryPaths = mapLegacyCategoryToNewCategories(question.category);
    question.categoryPath = categoryPaths[0]; // Use the first mapping
    
    // Generate subcategoryId based on the category path if none exists
    if (!question.subcategoryId) {
      const pathParts = question.categoryPath.split('.');
      if (pathParts.length > 0) {
        question.subcategoryId = pathParts[pathParts.length - 1]; // Use the last part as subcategoryId
      }
    }
  }
  
  return question;
};

/**
 * Batch processes an array of questions to add the new category structure
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Updated questions with new category structure
 */
export const enrichQuestionsWithNewCategories = (questions) => {
  return questions.map(enrichQuestionWithNewCategories);
};

/**
 * Generate a subcategoryId for a question based on its category or categoryPath
 * @param {Object} question - The question object
 * @returns {Object} - Updated question with subcategoryId
 */
export const ensureQuestionHasSubcategoryId = (question) => {
  // First ensure new category structure is present
  const enrichedQuestion = enrichQuestionWithNewCategories(question);
  
  // Generate subcategoryId from categoryPath if not already present
  if (!enrichedQuestion.subcategoryId && enrichedQuestion.categoryPath) {
    const parts = enrichedQuestion.categoryPath.split('.');
    if (parts.length > 0) {
      // Use the last part of the path as the subcategoryId
      enrichedQuestion.subcategoryId = parts[parts.length - 1];
    }
  }
  
  // If still no subcategoryId, use a default
  if (!enrichedQuestion.subcategoryId) {
    enrichedQuestion.subcategoryId = "general-knowledge";
  }
  
  return enrichedQuestion;
};

/**
 * Batch process questions to ensure they all have subcategoryIds
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Updated questions with subcategoryIds
 */
export const ensureQuestionsHaveSubcategoryIds = (questions) => {
  return questions.map(ensureQuestionHasSubcategoryId);
};

export default {
  getAllCategoriesFlat,
  mapLegacyCategoryToNewCategories,
  enrichQuestionWithNewCategories,
  enrichQuestionsWithNewCategories,
  ensureQuestionHasSubcategoryId,
  ensureQuestionsHaveSubcategoryIds
};
