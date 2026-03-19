/**
 * Utility functions for the Blue Book Practice application
 */

/**
 * Normalizes a subcategory name into a consistent kebab-case ID format
 * This helps resolve the format mismatch issues between human-readable subcategory names
 * (e.g., "Central Ideas and Details") and their kebab-case ID counterparts (e.g., "central-ideas-details")
 * 
 * @param {string} subcategory - The subcategory name to normalize
 * @returns {string} The normalized subcategory ID in kebab-case
 */
export const normalizeSubcategoryId = (subcategory) => {
  if (!subcategory) return '';
  
  // If it's already in kebab-case format, return as is
  if (subcategory.includes('-')) return subcategory.toLowerCase();
  
  // Convert from human-readable to kebab-case
  return subcategory
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove non-alphanumeric except spaces
    .replace(/\s+/g, '-')    // Replace spaces with hyphens
    .trim();
};

/**
 * The reverse of normalizeSubcategoryId - converts a kebab-case ID to a human-readable format
 * This is useful for display purposes
 * 
 * @param {string} subcategoryId - The subcategory ID in kebab-case
 * @returns {string} The human-readable subcategory name
 */
export const getHumanReadableSubcategory = (subcategoryId) => {
  if (!subcategoryId) return '';
  
  // Simple mapping for standard subcategories
  const standardMappings = {
    'central-ideas-details': 'Central Ideas and Details',
    'inferences': 'Inferences',
    'command-of-evidence': 'Command of Evidence',
    'words-in-context': 'Words in Context',
    'text-structure-purpose': 'Text Structure and Purpose',
    'cross-text-connections': 'Cross-Text Connections',
    'rhetorical-synthesis': 'Rhetorical Synthesis',
    'transitions': 'Transitions',
    'boundaries': 'Boundaries',
    'form-structure-sense': 'Form, Structure, and Sense',
    // Math subcategories
    'linear-equations-one-variable': 'Linear Equations (One Variable)',
    'linear-functions': 'Linear Functions',
    'linear-equations-two-variables': 'Linear Equations (Two Variables)',
    'systems-linear-equations': 'Systems of Linear Equations',
    'linear-inequalities': 'Linear Inequalities',
    // Add others as needed
  };
  
  // Check if we have a direct mapping
  if (standardMappings[subcategoryId]) {
    return standardMappings[subcategoryId];
  }
  
  // Otherwise, convert from kebab-case to title case
  return subcategoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Gets a color for a subcategory based on its main category
 * This helps with visual consistency in the dashboard
 * 
 * @param {string} subcategoryId - The subcategory ID
 * @returns {string} A hex color code
 */
export const getSubcategoryColor = (subcategoryId) => {
  // Reading subcategories
  if ([
    'central-ideas-details',
    'inferences',
    'command-of-evidence',
    'words-in-context',
    'text-structure-purpose',
    'cross-text-connections',
    'rhetorical-synthesis'
  ].includes(subcategoryId)) {
    return '#4285F4'; // Blue for Reading
  }
  
  // Writing subcategories
  if ([
    'transitions',
    'boundaries',
    'form-structure-sense'
  ].includes(subcategoryId)) {
    return '#0F9D58'; // Green for Writing
  }
  
  // Math subcategories
  if ([
    'linear-equations-one-variable',
    'linear-functions',
    'linear-equations-two-variables',
    'systems-linear-equations',
    'linear-inequalities'
  ].includes(subcategoryId)) {
    return '#DB4437'; // Red for Math
  }
  
  // Default color for unknown subcategories
  return '#F4B400'; // Yellow
};
