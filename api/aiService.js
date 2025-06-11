/**
 * AI Service for the API server using Google Gemini
 * Provides functions for the SmartQuiz AI assistant and potentially other AI tasks.
 */

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const { normalizeSubcategoryName } = require('../src/utils/subcategoryUtils'); // Assuming this is still needed

// Get Gemini API Key from environment variables
const getApiKey = () => {
  return process.env.GEMINI_API_KEY || '';
};

// Get Gemini Model for the assistant
const getAssistantModelName = () => {
  return process.env.GEMINI_ASSISTANT_MODEL || 'gemini-pro'; // Default to gemini-pro
};

const MAX_OUTPUT_TOKENS = parseInt(process.env.ASSISTANT_MAX_TOKENS || '1000', 10);

const genAI = new GoogleGenerativeAI(getApiKey());

const modelConfig = {
  // No specific generationConfig here, can be added if needed (e.g., temperature)
  // safetySettings can be configured here if default blocking is too aggressive
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
};

/**
 * Chat with the SmartQuiz AI assistant (Gemini) about the current question
 * @param {Object} params - Parameters for the assistant
 * @param {Object} params.question - The current question object (text, options, correctAnswer)
 * @param {Array} params.history - The chat history (array of {role: 'user'/'model', parts: [{text: 'message'}]})
 * @param {boolean} params.tipRequested - Whether the user requested a tip
 * @param {boolean} params.summariseRequested - Whether the user requested a text summary
 * @param {boolean} params.primingCall - Whether this is a priming call for context-setting prompts and responses
 * @returns {Promise<Object>} - Object containing the assistant's response { message: '...', usage: {...} }
 */
exports.chatWithAssistant = async ({ question: userQuestion, questionDetails, history = [], tipRequested = false, summariseRequested = false, primingCall = false }) => {
  // Extract question details - might be in question or questionDetails param depending on caller
  const currentQuestion = typeof userQuestion === 'string' ? (questionDetails || {}) : userQuestion;
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is required. Set GEMINI_API_KEY in environment variables.');
  }

  const modelName = getAssistantModelName();
  
  try {
    // Create a direct prompt without chat history for now to get a basic response working
    let prompt = `You are a friendly and helpful SAT tutor AI. A student is working on a quiz and has a question or needs a tip. 
    The current quiz question is: 
    Text: "${currentQuestion.text || 'No question text provided'}"
    Options: ${JSON.stringify(currentQuestion.options || ['No options provided'])}
    The correct answer is: "${currentQuestion.correctAnswer || 'Unknown'}". Do NOT reveal the correct answer unless the student explicitly asks for it or is clearly very stuck and asking for direct help. 
    Focus on providing conceptual understanding and problem-solving strategies.`;

    if (primingCall) {
      prompt += `\n\nSystem: Context has been set for the current question. Acknowledge if necessary.`;
    } else if (tipRequested) {
      prompt += `\nThe student has specifically requested a tip for this question. Provide a concise, actionable tip without giving away the answer directly.`;
    } else if (summariseRequested) {
      prompt += `\nThe student has specifically requested a summary of the text from the question. Provide a concise summary of the main ideas and important details from the passage. Do not include or reference the answer options in your summary.`;
    } else {
      // Add the user's question if it's not a tip request
      // First try to use the direct userQuestion if it's a string
      const userQuestionText = typeof userQuestion === 'string' ? userQuestion : null;
      
      // Then fall back to last message in history if needed
      const lastUserMessage = userQuestionText || (history.length > 0 ? 
        (history[history.length - 1].content || 'Can you help me with this question?') : 
        'Can you help me with this question?');
      
      console.log('Using student question:', lastUserMessage);
      prompt += `\n\nStudent question: "${lastUserMessage}"`;
    }

    // Create a simple generative model call instead of chat
    // This avoids the complex history handling that might be causing issues
    const generativeModel = genAI.getGenerativeModel({ model: modelName });
    
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const assistantMessage = response.text();

    if (primingCall) {
      return {
        message: "Assistant context primed.", // Generic message for priming success
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } // Placeholder, update if actuals are available
      };
    }
    
    return {
      message: assistantMessage,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } // Placeholder
    };
  } catch (error) {
    console.error('Error chatting with Gemini assistant:', error);
    // Provide a more useful error message for debugging
    let errorMessage = 'Sorry, I encountered an error trying to reach the Gemini assistant.';
    
    if (error.message) {
      console.error('Error message:', error.message);
      // Don't expose internal error details to the client
    }
    
    throw new Error(errorMessage);
  }

    // This block has been moved into the main try-catch above
};

// --- Stubbed/OpenAI-based functions - these need to be rewritten for Gemini --- 

exports.generateConceptAnalysis = async (wrongQuestions, subcategory) => {
  console.warn('generateConceptAnalysis is not yet implemented for Gemini API. Using placeholder.');
  // TODO: Implement with Gemini, requires careful prompt engineering for JSON output
  return { concepts: [{ name: 'Placeholder Concept (Gemini)', explanation: 'This function needs to be updated for Gemini.' }] };
};

exports.generateConceptDrill = async (conceptId, conceptName, explanation, difficulty, subcategory) => {
  console.warn('generateConceptDrill is not yet implemented for Gemini API. Using placeholder.');
  // TODO: Implement with Gemini, requires careful prompt engineering for JSON output
  return { questions: [{ text: 'Placeholder Question (Gemini)', options: ['A', 'B'], correctAnswer: 'A', explanation: 'This function needs to be updated for Gemini.' }] };
};

/**
 * Identify challenging vocabulary words in a quiz question and provide definitions
 * @param {Object} params - Parameters for vocabulary analysis
 * @param {Object} params.questionContent - The question content to analyze (text and options)
 * @returns {Promise<Array>} - Array of word objects { word: string, definition: string }
 */
exports.getVocabularyDefinitions = async ({ questionContent }) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is required. Set GEMINI_API_KEY in environment variables.');
  }

  const modelName = getAssistantModelName();
  
  try {
    // Extract question text and options
    const questionText = questionContent.text || '';
    const optionsText = questionContent.options ? questionContent.options.join('\n') : '';
    
    // Create the prompt for vocabulary analysis
    const prompt = `You are an SAT vocabulary assistant. Analyze the following text from an SAT question and identify 5-6 of the most challenging vocabulary words that a student might struggle with:

Question text: "${questionText}"

Answer choices: "${optionsText}"

For each challenging word, provide the word and its definition as used in this specific context. Format your response as a valid JSON array with objects that have 'word' and 'definition' properties. For example:
[
  {
    "word": "prodigious",
    "definition": "Remarkably or impressively great in extent, size, or degree."
  },
  {
    "word": "ephemeral",
    "definition": "Lasting for a very short time."
  }
]

VERY IMPORTANT: Only respond with the valid JSON array. Do not include any other text, explanations, or markdown code fences (like those used for 'json' code blocks) before or after the array.`;

    console.log('Requesting vocabulary analysis from Gemini');
    
    // Get the generative model
    const generativeModel = genAI.getGenerativeModel({ model: modelName });
    
    // Generate content
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Extract the JSON array from the response
    let vocabularyWords = [];
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
      
      vocabularyWords = JSON.parse(jsonText);
      
      // Validate the structure
      if (!Array.isArray(vocabularyWords)) {
        throw new Error('Response is not an array');
      }
      
      vocabularyWords = vocabularyWords.map(item => {
        // Ensure each item has the correct properties
        if (!item.word || !item.definition) {
          return null;
        }
        return {
          word: item.word.trim(),
          definition: item.definition.trim()
        };
      }).filter(item => item !== null); // Remove any invalid items
      
    } catch (parseError) {
      console.error('Error parsing vocabulary words JSON:', parseError);
      console.log('Raw response:', responseText);
      return []; // Return empty array if parsing fails
    }
    
    return vocabularyWords;
  } catch (error) {
    console.error('Error getting vocabulary definitions from Gemini:', error);
    throw new Error('Failed to analyze vocabulary. Please try again.');
  }
};
