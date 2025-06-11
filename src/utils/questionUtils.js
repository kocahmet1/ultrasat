/**
 * Utility functions for question standardization and normalization
 * Ensures consistent formatting of subcategory information in questions
 */

import { getKebabCaseFromAnyFormat } from './subcategoryConstants';

/**
 * Normalize a question object to ensure subcategory is stored in kebab-case format
 * This should be called before saving any question to the database
 * 
 * @param {Object} questionData - The question data to normalize
 * @returns {Object} - Normalized question data with standardized subcategory format
 */
export const normalizeQuestionData = (questionData) => {
  if (!questionData) return questionData;
  
  const normalizedQuestion = { ...questionData };
  
  // If the question has a subcategory in any format, normalize it to kebab-case
  if (normalizedQuestion.subcategory) {
    const kebabSubcategory = getKebabCaseFromAnyFormat(normalizedQuestion.subcategory);
    
    if (kebabSubcategory) {
      // Store the canonical kebab-case format
      normalizedQuestion.subcategory = kebabSubcategory;
      
      // Keep a displayName for UI rendering if needed
      if (!normalizedQuestion.subcategoryDisplayName) {
        // Convert kebab-case to Title Case for display (e.g., "central-ideas-details" → "Central Ideas Details")
        normalizedQuestion.subcategoryDisplayName = kebabSubcategory
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
  }
  
  // If the question has a numeric subcategoryId but no subcategory, add the kebab-case
  if (normalizedQuestion.subcategoryId && !normalizedQuestion.subcategory) {
    const kebabSubcategory = getKebabCaseFromAnyFormat(normalizedQuestion.subcategoryId);
    if (kebabSubcategory) {
      normalizedQuestion.subcategory = kebabSubcategory;
    }
  }
  
  return normalizedQuestion;
};

/**
 * Batch normalize an array of questions
 * 
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Array of normalized question objects
 */
export const normalizeQuestions = (questions) => {
  if (!Array.isArray(questions)) return questions;
  return questions.map(normalizeQuestionData);
};

/**
 * Extract subcategory information from a question in a standardized way
 * Always returns the kebab-case format
 * 
 * @param {Object} question - The question object
 * @returns {string|null} - The kebab-case subcategory or null if not found
 */
export const getQuestionSubcategory = (question) => {
  if (!question) return null;
  
  // If it already has a subcategory field, normalize and return it
  if (question.subcategory) {
    return getKebabCaseFromAnyFormat(question.subcategory);
  }
  
  // If it has a subcategoryId, convert it to kebab-case
  if (question.subcategoryId) {
    return getKebabCaseFromAnyFormat(question.subcategoryId);
  }
  
  return null;
};
