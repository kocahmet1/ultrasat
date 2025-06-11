/**
 * Questions API
 * Handles question import, validation, and management
 */

const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const router = express.Router();

// Subcategory constants and utilities (Node.js compatible)
const SUBCATEGORY_NAMES = {
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

const SUBCATEGORY_KEBAB_CASE = {
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

/**
 * Get subcategory ID from string (kebab-case or human-readable)
 */
const getSubcategoryIdFromString = (subcategoryString) => {
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
 * Get kebab-case format from any subcategory format
 */
const getKebabCaseFromAnyFormat = (subcategory) => {
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

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }
    
    // Verify token
    try {
      if (!req.admin) {
        return res.status(500).json({ error: 'Firebase Admin not available' });
      }
      
      const decodedToken = await req.admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      
      // Check if user is admin by looking up their document in Firestore
      const userDoc = await req.db.collection('users').doc(req.user.uid).get();
      if (!userDoc.exists || !userDoc.data().isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }
      
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

/**
 * Validates a question object and normalizes it for database storage
 * @param {Object} question - Question object to validate
 * @param {number} index - Index of the question in the array
 * @returns {Object} Validation result with valid flag, errors, and normalized question
 */
function validateQuestion(question, index) {
  const errors = [];
  const warnings = [];
  
  // Required fields validation
  if (!question.text || typeof question.text !== 'string' || question.text.trim() === '') {
    if (!question.text) {
      errors.push('Missing question text field');
    } else if (typeof question.text !== 'string') {
      errors.push(`Question text must be a string, got ${typeof question.text}`);
    } else {
      errors.push('Question text is empty');
    }
  }
  
  if (!question.options || !Array.isArray(question.options)) {
    if (!question.options) {
      errors.push('Missing options field');
    } else {
      errors.push(`Options must be an array, got ${typeof question.options}`);
    }
  } else if (question.options.length < 2) {
    errors.push(`Must have at least 2 options, found ${question.options.length}`);
  } else if (question.options.length > 6) {
    warnings.push(`Has ${question.options.length} options (unusual for SAT questions, typically 4)`);
  }
  
  // Validate individual options
  if (question.options && Array.isArray(question.options)) {
    question.options.forEach((option, optIndex) => {
      if (!option || typeof option !== 'string' || option.trim() === '') {
        errors.push(`Option ${optIndex + 1} is missing or invalid (must be a non-empty string)`);
      }
    });
  }
  
  if (question.correctAnswer == null) {
    errors.push('Missing correctAnswer field');
  } else {
    // Validate correct answer format
    const correctAnswer = question.correctAnswer;
    if (typeof correctAnswer === 'number') {
      if (correctAnswer < 0 || correctAnswer >= (question.options?.length || 0)) {
        errors.push(`Correct answer index ${correctAnswer} is out of range (must be 0-${(question.options?.length || 1) - 1})`);
      }
    } else if (typeof correctAnswer === 'string') {
      if (question.options && !question.options.includes(correctAnswer)) {
        errors.push(`Correct answer text "${correctAnswer}" does not match any option. Available options: [${question.options.map(opt => `"${opt}"`).join(', ')}]`);
      }
    } else {
      errors.push(`Correct answer must be a number (index) or string (text), got ${typeof correctAnswer}`);
    }
  }
  
  // Subcategory validation
  const subcategorySource = question.subcategory || question.subCategory || question.subcategoryId;
  if (!subcategorySource) {
    errors.push('Missing subcategory information (need subcategory, subCategory, or subcategoryId field)');
  }
  
  // Normalize subcategory to kebab-case format (like the old import tool)
  let normalizedSubcategory = null;
  let numericSubcategoryId = null;
  
  if (subcategorySource) {
    try {
      // Convert to kebab-case format (canonical identifier)
      normalizedSubcategory = getKebabCaseFromAnyFormat(subcategorySource);
      
      // Also get the numeric ID for backward compatibility
      numericSubcategoryId = getSubcategoryIdFromString(subcategorySource);
      
      if (!normalizedSubcategory) {
        warnings.push(`Could not normalize subcategory '${subcategorySource}' - using raw value. Consider using a standard subcategory name.`);
        normalizedSubcategory = subcategorySource;
      }
    } catch (error) {
      warnings.push(`Error normalizing subcategory '${subcategorySource}': ${error.message}`);
      normalizedSubcategory = subcategorySource;
    }
  }
  
  // Optional field validation
  if (question.difficulty && !['easy', 'medium', 'hard'].includes(question.difficulty)) {
    if (typeof question.difficulty === 'number') {
      // Convert numeric difficulty to string
      if (question.difficulty === 1) question.difficulty = 'easy';
      else if (question.difficulty >= 4) question.difficulty = 'hard';
      else question.difficulty = 'medium';
      warnings.push(`Converted numeric difficulty ${question.difficulty} to '${question.difficulty}'`);
    } else {
      warnings.push(`Invalid difficulty '${question.difficulty}' (must be 'easy', 'medium', or 'hard'), defaulting to 'medium'`);
      question.difficulty = 'medium';
    }
  }
  
  if (!question.difficulty) {
    question.difficulty = 'medium';
    warnings.push('No difficulty specified, defaulting to medium');
  }
  
  // Validate graphDescription if present
  if (question.graphDescription !== undefined && question.graphDescription !== null) {
    if (typeof question.graphDescription !== 'string') {
      warnings.push(`graphDescription should be a string or null, got ${typeof question.graphDescription}`);
      question.graphDescription = null;
    }
  }

  // Validate explanation if present
  if (question.explanation !== undefined && question.explanation !== null) {
    if (typeof question.explanation !== 'string' && !Array.isArray(question.explanation)) {
      warnings.push(`explanation should be a string or array, got ${typeof question.explanation}`);
    }
  }

  // Normalize question data
  const normalizedQuestion = {
    text: question.text?.trim(),
    options: question.options || [],
    correctAnswer: question.correctAnswer,
    explanation: normalizeExplanation(question.explanation),
    difficulty: question.difficulty || 'medium',
    subcategory: normalizedSubcategory,
    subCategory: normalizedSubcategory, // For backward compatibility
    subcategoryId: numericSubcategoryId, // For backward compatibility
    source: question.source || 'import',
    usageContext: question.usageContext || 'general',
    skillTags: question.skillTags || [],
    graphUrl: question.graphUrl || null,
    graphDescription: question.graphDescription || null,
    passage: question.passage?.trim() || null,
    // Add any other fields that should be preserved
    ...Object.keys(question).reduce((acc, key) => {
      if (!['text', 'options', 'correctAnswer', 'explanation', 'difficulty', 'subcategory', 'subCategory', 'subcategoryId', 'source', 'usageContext', 'skillTags', 'graphUrl', 'graphDescription', 'passage'].includes(key)) {
        acc[key] = question[key];
      }
      return acc;
    }, {})
  };
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    question: normalizedQuestion
  };
}

/**
 * Normalizes explanation field to handle both string and array formats
 * @param {string|Array} explanation - The explanation to normalize
 * @returns {string} Normalized explanation string
 */
function normalizeExplanation(explanation) {
  if (!explanation) {
    return '';
  }
  
  if (Array.isArray(explanation)) {
    // Convert array to string with newlines
    return explanation.join('\n').trim();
  }
  
  if (typeof explanation === 'string') {
    return explanation.trim();
  }
  
  // Fallback for other types
  return String(explanation).trim();
}

/**
 * Checks if a question already exists in the database
 * @param {Object} db - Firestore database instance
 * @param {Object} question - The question to check
 * @returns {Promise<boolean>} True if question exists
 */
async function questionExists(db, question) {
  try {
    // Check by exact text match (could be enhanced with more sophisticated matching)
    const query = db.collection('questions')
      .where('text', '==', question.text)
      .limit(1);
    
    const snapshot = await query.get();
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking question existence:', error);
    return false;
  }
}

/**
 * Import questions from uploaded JSON data
 * @param {Object} db - Firestore database instance
 * @param {Array} questions - Array of question objects
 * @param {Object} options - Import options
 */
async function importQuestionsFromData(db, questions, options = {}) {
  const { 
    skipExisting = true, 
    dryRun = false, 
    forceOverwrite = false,
    skipInvalid = true,
    usageContext = 'general'
  } = options;
  
  if (!Array.isArray(questions)) {
    throw new Error('Questions data must be an array');
  }
  
  const results = {
    total: questions.length,
    valid: 0,
    invalid: 0,
    skipped: 0,
    imported: 0,
    errors: [],
    warnings: [],
    dryRun
  };
  
  // Process each question
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    // Validate question
    const validation = validateQuestion(question, i);
    
    if (!validation.valid) {
      results.invalid++;
      const errorMsg = `Question ${i + 1}: ${validation.errors.join(', ')}`;
      results.errors.push(errorMsg);
      
      if (!skipInvalid) {
        // Stop processing if we're not skipping invalid questions
        break;
      }
      continue;
    }
    
    results.valid++;
    
    // Add any warnings
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        results.warnings.push(`Question ${i + 1}: ${warning}`);
      });
    }
    
    const validatedQuestion = validation.question;
    
    // Set usage context from options
    validatedQuestion.usageContext = usageContext;
    
    // Check if question already exists (unless force overwrite)
    if (!forceOverwrite && skipExisting) {
      const exists = await questionExists(db, validatedQuestion);
      if (exists) {
        results.skipped++;
        continue;
      }
    }
    
    // Import question (unless dry run)
    if (!dryRun) {
      try {
        await db.collection('questions').add({
          ...validatedQuestion,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        results.imported++;
      } catch (importError) {
        console.error('Failed to import question:', validatedQuestion.text?.substring(0, 50), importError);
        results.errors.push(`Question ${i + 1}: Failed to save to database - ${importError.message}`);
      }
    } else {
      results.imported++;
    }
  }
  
  return results;
}

/**
 * POST /api/questions/import
 * Import questions from uploaded JSON file
 */
router.post('/import', verifyFirebaseToken, upload.single('questionsFile'), async (req, res) => {
  try {
    const { 
      usageContext = 'general', 
      dryRun = false, 
      forceOverwrite = false, 
      skipInvalid = true 
    } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let questionsData;
    let fileContent;
    try {
      fileContent = req.file.buffer.toString('utf8');
      questionsData = JSON.parse(fileContent);
    } catch (parseError) {
      // Enhanced JSON parsing error reporting
      let errorMessage = 'Invalid JSON file. ';
      
      if (parseError.message.includes('position')) {
        const positionMatch = parseError.message.match(/position (\d+)/);
        if (positionMatch) {
          const position = parseInt(positionMatch[1]);
          const lines = fileContent.substring(0, position).split('\n');
          const lineNumber = lines.length;
          const columnNumber = lines[lines.length - 1].length + 1;
          
          // Get context around the error
          const allLines = fileContent.split('\n');
          const contextStart = Math.max(0, lineNumber - 3);
          const contextEnd = Math.min(allLines.length, lineNumber + 2);
          const contextLines = allLines.slice(contextStart, contextEnd);
          
          errorMessage += `Syntax error at line ${lineNumber}, column ${columnNumber}.\n\n`;
          errorMessage += `Context around the error:\n`;
          
          contextLines.forEach((line, index) => {
            const actualLineNum = contextStart + index + 1;
            const isErrorLine = actualLineNum === lineNumber;
            const prefix = isErrorLine ? '→ ' : '  ';
            errorMessage += `${prefix}${actualLineNum}: ${line}\n`;
            
            if (isErrorLine && columnNumber <= line.length) {
              errorMessage += `  ${' '.repeat(String(actualLineNum).length + columnNumber)}^\n`;
            }
          });
          
          errorMessage += `\nError details: ${parseError.message}`;
        } else {
          errorMessage += `Parse error: ${parseError.message}`;
        }
      } else {
        errorMessage += `Parse error: ${parseError.message}`;
      }
      
      return res.status(400).json({ error: errorMessage });
    }

    const importResults = await importQuestionsFromData(
      req.db, 
      questionsData,
      { 
        skipExisting: !forceOverwrite,
        dryRun: dryRun === 'true' || dryRun === true,
        forceOverwrite: forceOverwrite === 'true' || forceOverwrite === true,
        skipInvalid: skipInvalid === 'true' || skipInvalid === true,
        usageContext
      }
    );

    res.json(importResults);

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/questions/validate
 * Validate questions from uploaded JSON file without importing
 */
router.post('/validate', verifyFirebaseToken, upload.single('questionsFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let questionsData;
    let fileContent;
    try {
      fileContent = req.file.buffer.toString('utf8');
      questionsData = JSON.parse(fileContent);
    } catch (parseError) {
      // Enhanced JSON parsing error reporting
      let errorMessage = 'Invalid JSON file. ';
      
      if (parseError.message.includes('position')) {
        const positionMatch = parseError.message.match(/position (\d+)/);
        if (positionMatch) {
          const position = parseInt(positionMatch[1]);
          const lines = fileContent.substring(0, position).split('\n');
          const lineNumber = lines.length;
          const columnNumber = lines[lines.length - 1].length + 1;
          
          // Get context around the error
          const allLines = fileContent.split('\n');
          const contextStart = Math.max(0, lineNumber - 3);
          const contextEnd = Math.min(allLines.length, lineNumber + 2);
          const contextLines = allLines.slice(contextStart, contextEnd);
          
          errorMessage += `Syntax error at line ${lineNumber}, column ${columnNumber}.\n\n`;
          errorMessage += `Context around the error:\n`;
          
          contextLines.forEach((line, index) => {
            const actualLineNum = contextStart + index + 1;
            const isErrorLine = actualLineNum === lineNumber;
            const prefix = isErrorLine ? '→ ' : '  ';
            errorMessage += `${prefix}${actualLineNum}: ${line}\n`;
            
            if (isErrorLine && columnNumber <= line.length) {
              errorMessage += `  ${' '.repeat(String(actualLineNum).length + columnNumber)}^\n`;
            }
          });
          
          errorMessage += `\nError details: ${parseError.message}`;
        } else {
          errorMessage += `Parse error: ${parseError.message}`;
        }
      } else {
        errorMessage += `Parse error: ${parseError.message}`;
      }
      
      return res.status(400).json({ error: errorMessage });
    }

    if (!Array.isArray(questionsData)) {
      return res.status(400).json({ error: 'JSON file must contain an array of questions' });
    }

    const validationResults = {
      total: questionsData.length,
      valid: 0,
      invalid: 0,
      errors: [],
      warnings: []
    };

    questionsData.forEach((question, index) => {
      const validation = validateQuestion(question, index);
      
      if (validation.valid) {
        validationResults.valid++;
      } else {
        validationResults.invalid++;
        validationResults.errors.push(`Question ${index + 1}: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          validationResults.warnings.push(`Question ${index + 1}: ${warning}`);
        });
      }
    });

    res.json(validationResults);

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 