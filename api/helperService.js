/**
 * Helper service for the API server using Google Gemini
 * Provides functions for vocabulary definitions and concept explanations
 */

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Get Gemini API Key from environment variables
const getApiKey = () => {
  return process.env.GEMINI_API_KEY || '';
};

// Get Gemini Model name
const getModelName = () => {
  return process.env.GEMINI_ASSISTANT_MODEL || 'gemini-pro'; // Default to gemini-pro
};

const genAI = new GoogleGenerativeAI(getApiKey());

const modelConfig = {
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
};

/**
 * Get predefined concepts for a subcategory from Firestore
 * @param {Object} db - Firestore database instance
 * @param {string} subcategoryId - The subcategory ID
 * @returns {Promise<Array>} - Array of predefined concept objects
 */
const getPredefinedConceptsFromFirestore = async (db, subcategoryId) => {
  try {
    if (!db) {
      throw new Error('Firestore database not available');
    }

    // Query predefined concepts for this subcategory
    const conceptsRef = db.collection('predefinedConcepts');
    const query = conceptsRef
      .where('subcategoryId', '==', subcategoryId)
      .where('active', '==', true)
      .orderBy('name');
    
    const snapshot = await query.get();
    const concepts = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      concepts.push({
        conceptId: data.conceptId,
        name: data.name,
        description: data.description,
        keywords: data.keywords || [],
        difficulty: data.difficulty || 2
      });
    });

    console.log(`[HelperService] Found ${concepts.length} predefined concepts for subcategory: ${subcategoryId}`);
    return concepts;
  } catch (error) {
    console.error('Error fetching predefined concepts from Firestore:', error);
    return [];
  }
};

/**
 * Get vocabulary definitions for challenging words in a question
 * @param {Object} params - Parameters for analysis
 * @param {Object} params.questionContent - The question content to analyze
 * @returns {Promise<Array>} - Array of word objects { term: string, definition: string }
 */
exports.getVocabularyDefinitions = async ({ questionContent }) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is required. Set GEMINI_API_KEY in environment variables.');
  }

  const modelName = getModelName();
  
  try {
    // Extract question text and options
    const questionText = questionContent.text || '';
    const optionsText = questionContent.options ? questionContent.options.join('\n') : '';
    
    // Create the prompt for vocabulary analysis
    const prompt = `You are an SAT vocabulary assistant. Analyze the following text from an SAT question and identify 5-6 of the most challenging vocabulary words that a student might struggle with:

Question text: "${questionText}"

Answer choices: "${optionsText}"

For each challenging word, provide the word and its definition as used in this specific context. Format your response as a valid JSON array with objects that have 'term' and 'definition' properties. For example:
[
  {
    "term": "prodigious",
    "definition": "Remarkably or impressively great in extent, size, or degree."
  },
  {
    "term": "ephemeral",
    "definition": "Lasting for a very short time."
  }
]

VERY IMPORTANT: Only respond with the valid JSON array. Do not include any other text, explanations, or markdown code fences (like those used for 'json' code blocks) before or after the array.`;

    // Get the generative model and generate content
    const generativeModel = genAI.getGenerativeModel({ model: modelName });
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Extract and parse the JSON array
    return parseHelperResponse(responseText);
  } catch (error) {
    console.error('Error getting vocabulary definitions from Gemini:', error);
    throw new Error('Failed to analyze vocabulary. Please try again.');
  }
};

/**
 * Get concept explanations relevant to a question using predefined concepts
 * @param {Object} params - Parameters for analysis
 * @param {Object} params.questionContent - The question content to analyze
 * @param {string} params.subcategory - The subcategory of the question
 * @param {Object} params.db - Firestore database instance (passed from API)
 * @param {string} params.questionId - The question ID (for association tracking)
 * @returns {Promise<Array>} - Array of concept objects { term: string, definition: string, conceptId: string }
 */
exports.getConceptExplanations = async ({ questionContent, subcategory, db, questionId }) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is required. Set GEMINI_API_KEY in environment variables.');
  }

  const modelName = getModelName();
  
  try {
    // First, check if we already have concept associations for this question
    if (questionId && db) {
      try {
        const existingAssociationsQuery = db.collection('questionConceptAssociations')
          .where('questionId', '==', questionId)
          .orderBy('lastUpdated', 'desc')
          .limit(1);
        
        const existingSnapshot = await existingAssociationsQuery.get();
        
        if (!existingSnapshot.empty) {
          const existingAssociation = existingSnapshot.docs[0].data();
          console.log(`[HelperService] Found existing concept association for question ${questionId}: ${existingAssociation.conceptIds.join(', ')}`);
          
          // Get the predefined concepts to build the response
          const predefinedConcepts = await getPredefinedConceptsFromFirestore(db, subcategory);
          
          // Convert existing concept IDs to the format expected by the frontend
          const conceptsForFrontend = existingAssociation.conceptIds.map(conceptId => {
            const predefinedConcept = predefinedConcepts.find(pc => pc.conceptId === conceptId);
            if (predefinedConcept) {
              // Try to get relevance score from stored data, default to 75 if not available
              const storedConcept = existingAssociation.selectedConcepts?.find(sc => sc.conceptId === conceptId);
              const relevanceScore = storedConcept?.relevanceScore || 75;
              
              return {
                term: predefinedConcept.name,
                definition: predefinedConcept.description,
                conceptId: predefinedConcept.conceptId,
                relevanceScore: relevanceScore
              };
            }
            return null;
          }).filter(concept => concept !== null);
          
          console.log(`[HelperService] Returning ${conceptsForFrontend.length} cached concepts for question ${questionId}`);
          return conceptsForFrontend;
        }
      } catch (dbError) {
        console.error('Error checking existing concept associations:', dbError);
        // Continue to LLM call if database check fails
      }
    }
    
    // No existing associations found, proceed with LLM analysis
    console.log(`[HelperService] No existing concept association found for question ${questionId}, proceeding with LLM analysis`);
    
    // First, get predefined concepts for this subcategory
    const predefinedConcepts = await getPredefinedConceptsFromFirestore(db, subcategory);
    
    if (predefinedConcepts.length === 0) {
      console.warn(`[HelperService] No predefined concepts found for subcategory: ${subcategory}. Falling back to free-form generation.`);
      // Fall back to the original free-form concept generation
      return await generateFreeFormConcepts({ questionContent, subcategory });
    }

    // Extract question text and options
    const questionText = questionContent.text || '';
    const optionsText = questionContent.options ? questionContent.options.join('\n') : '';
    
    // Create the concept list for the prompt
    const conceptList = predefinedConcepts.map((concept, index) => 
      `${index + 1}. ${concept.name} (${concept.conceptId}): ${concept.description}`
    ).join('\n');
    
    // Create the prompt for concept selection
    const prompt = `You are an SAT concept assistant. You need to identify which predefined concepts are most relevant to solving this ${subcategory} question.

Question text: "${questionText}"

Answer choices: "${optionsText}"

Below is a list of predefined concepts for this subcategory. Select the 1-5 most relevant concepts that a student would need to understand to solve this question:

${conceptList}

Respond with a JSON array containing the conceptId and relevanceScore (0-100) for each selected concept. For example:
[
  {
    "conceptId": "quadraticFormula",
    "relevanceScore": 95
  },
  {
    "conceptId": "factoring",
    "relevanceScore": 80
  }
]

SELECTION CRITERIA:
- Only select concepts that are directly needed to solve this specific question
- Relevance score should reflect how essential the concept is (100 = absolutely critical, 50 = somewhat helpful)
- Select 1-5 concepts maximum
- If no concepts are clearly relevant, return an empty array

VERY IMPORTANT: Only respond with the valid JSON array. Do not include any other text, explanations, or markdown code fences.`;

    // Get the generative model and generate content
    const generativeModel = genAI.getGenerativeModel({ model: modelName });
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Parse the LLM response to get selected concept IDs
    const selectedConcepts = parseConceptSelectionResponse(responseText);
    
    if (selectedConcepts.length === 0) {
      console.log(`[HelperService] No relevant predefined concepts selected for question ${questionId || 'unknown'}`);
      return [];
    }

    // Convert selected concept IDs to the format expected by the frontend
    const conceptsForFrontend = selectedConcepts.map(selected => {
      const predefinedConcept = predefinedConcepts.find(pc => pc.conceptId === selected.conceptId);
      if (predefinedConcept) {
        return {
          term: predefinedConcept.name,
          definition: predefinedConcept.description,
          conceptId: predefinedConcept.conceptId,
          relevanceScore: selected.relevanceScore
        };
      }
      return null;
    }).filter(concept => concept !== null);

    // Save the concept association to Firestore if questionId is provided
    if (questionId && db && conceptsForFrontend.length > 0) {
      try {
        const conceptIds = conceptsForFrontend.map(c => c.conceptId);
        await saveConceptAssociation(db, questionId, subcategory, conceptIds, {
          llmModel: modelName,
          selectedConcepts: selectedConcepts
        });
        console.log(`[HelperService] Saved concept association for question ${questionId}: ${conceptIds.join(', ')}`);
      } catch (associationError) {
        console.error('Error saving concept association:', associationError);
        // Non-critical error, continue with response
      }
    }

    console.log(`[HelperService] Selected ${conceptsForFrontend.length} predefined concepts for question ${questionId || 'unknown'}`);
    return conceptsForFrontend;
    
  } catch (error) {
    console.error('Error getting concept explanations from Gemini:', error);
    throw new Error('Failed to analyze concepts. Please try again.');
  }
};

/**
 * Fallback function for free-form concept generation when no predefined concepts exist
 * @param {Object} params - Parameters for analysis
 * @param {Object} params.questionContent - The question content to analyze
 * @param {string} params.subcategory - The subcategory of the question
 * @returns {Promise<Array>} - Array of concept objects { term: string, definition: string }
 */
const generateFreeFormConcepts = async ({ questionContent, subcategory }) => {
  const modelName = getModelName();
  
  try {
    // Extract question text and options
    const questionText = questionContent.text || '';
    const optionsText = questionContent.options ? questionContent.options.join('\n') : '';
    
    // Create the prompt for concept analysis (original implementation)
    const prompt = `You are an SAT concept assistant. Analyze the following ${subcategory} question and identify 1-3 key concepts that are essential to understand in order to solve this problem:

Question text: "${questionText}"

Answer choices: "${optionsText}"

For each key concept, provide:
1. The name of the concept (brief, 1-4 words)
2. A concise explanation (≤50 words) that would help a student understand how to apply this concept

Format your response as a valid JSON array with objects that have 'term' and 'definition' properties. For example:
[
  {
    "term": "Quadratic Formula",
    "definition": "x = (-b ± √(b² - 4ac)) / 2a solves ax² + bx + c = 0. Used when a quadratic equation can't be easily factored to find its roots or solutions."
  },
  {
    "term": "Completing the Square",
    "definition": "A method to rewrite a quadratic expression as a perfect square plus a constant, making it easier to solve equations or find the vertex of a parabola."
  }
]

VERY IMPORTANT: Only respond with the valid JSON array. Do not include any other text, explanations, or markdown code fences before or after the array.`;

    // Get the generative model and generate content
    const generativeModel = genAI.getGenerativeModel({ model: modelName });
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Extract and parse the JSON array
    return parseHelperResponse(responseText);
  } catch (error) {
    console.error('Error generating free-form concepts:', error);
    return [];
  }
};

/**
 * Save concept association to Firestore
 * @param {Object} db - Firestore database instance
 * @param {string} questionId - The question ID
 * @param {string} subcategoryId - The subcategory ID
 * @param {Array} conceptIds - Array of selected concept IDs
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
const saveConceptAssociation = async (db, questionId, subcategoryId, conceptIds, metadata = {}) => {
  try {
    const associationRef = db.collection('questionConceptAssociations').doc();
    const associationData = {
      questionId,
      subcategoryId,
      conceptIds,
      selectedAt: db.FieldValue.serverTimestamp(),
      llmModel: metadata.llmModel || 'gemini-pro',
      confidence: metadata.confidence || null,
      selectedConcepts: metadata.selectedConcepts || [],
      reviewedBy: null,
      lastUpdated: db.FieldValue.serverTimestamp()
    };
    
    await associationRef.set(associationData);
  } catch (error) {
    console.error('Error saving concept association to Firestore:', error);
    throw error;
  }
};

/**
 * Parse the LLM response for concept selection
 * @param {string} responseText - The raw response from the LLM
 * @returns {Array} - Array of { conceptId, relevanceScore } objects
 */
function parseConceptSelectionResponse(responseText) {
  let selectedConcepts = [];
  try {
    // Attempt to extract only the JSON array part, being more robust
    let jsonText = responseText.trim();
    const startIndex = jsonText.indexOf('[');
    const endIndex = jsonText.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      jsonText = jsonText.substring(startIndex, endIndex + 1);
    } else {
      // If no clear array structure is found, try to clean common markdown artifacts as a fallback
      jsonText = jsonText.replace(/```json\n|```\n|```|\n```/g, '');
    }
    
    selectedConcepts = JSON.parse(jsonText);
    
    // Validate the structure
    if (!Array.isArray(selectedConcepts)) {
      throw new Error('Response is not an array');
    }
    
    selectedConcepts = selectedConcepts.map(item => {
      const conceptId = item.conceptId || '';
      const relevanceScore = item.relevanceScore || 50;
      
      // Ensure each item has the correct properties
      if (!conceptId) {
        return null;
      }
      
      return {
        conceptId: conceptId.trim(),
        relevanceScore: Math.max(0, Math.min(100, relevanceScore)) // Clamp between 0-100
      };
    }).filter(item => item !== null); // Remove any invalid items
    
  } catch (parseError) {
    console.error('Error parsing concept selection JSON:', parseError);
    console.log('Raw response:', responseText);
    return []; // Return empty array if parsing fails
  }
  
  return selectedConcepts;
}

/**
 * Parse the LLM response into a standardized format
 * @param {string} responseText - The raw response from the LLM
 * @returns {Array} - Array of { term, definition } objects
 */
function parseHelperResponse(responseText) {
  let helperItems = [];
  try {
    // Attempt to extract only the JSON array part, being more robust
    let jsonText = responseText.trim();
    const startIndex = jsonText.indexOf('[');
    const endIndex = jsonText.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      jsonText = jsonText.substring(startIndex, endIndex + 1);
    } else {
      // If no clear array structure is found, try to clean common markdown artifacts as a fallback
      jsonText = jsonText.replace(/```json\n|```\n|```|\n```/g, '');
    }
    
    helperItems = JSON.parse(jsonText);
    
    // Validate the structure and standardize to term/definition format
    if (!Array.isArray(helperItems)) {
      throw new Error('Response is not an array');
    }
    
    helperItems = helperItems.map(item => {
      // Handle both original formats (word/definition) and new format (term/definition)
      const term = item.term || item.word || item.concept || '';
      const definition = item.definition || item.explanation || '';
      
      // Ensure each item has the correct properties
      if (!term || !definition) {
        return null;
      }
      
      return {
        term: term.trim(),
        definition: definition.trim()
      };
    }).filter(item => item !== null); // Remove any invalid items
    
  } catch (parseError) {
    console.error('Error parsing helper items JSON:', parseError);
    console.log('Raw response:', responseText);
    return []; // Return empty array if parsing fails
  }
  
  return helperItems;
}
