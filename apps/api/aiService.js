/**
 * AI Service for the API server.
 * Provides functions for the SmartQuiz AI assistant and potentially other AI tasks.
 */

const OpenAI = require('openai');
const {
  resolveModel,
  reasoningConfig,
  outputTokenBudget,
} = require('./config/aiModel');

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Set OPENAI_API_KEY in environment variables.');
  }
  return new OpenAI({ apiKey });
};

// Get OpenAI model for the SmartQuiz assistant (default: gpt-5.6-luna)
const getAssistantModelName = () =>
  resolveModel('OPENAI_ASSISTANT_MODEL', 'COMPANION_MODEL');

// Vocabulary helpers previously ran on Gemini; they now use the same OpenAI
// model as everything else on the site.
const getVocabularyModelName = () =>
  resolveModel('OPENAI_VOCABULARY_MODEL', 'OPENAI_ASSISTANT_MODEL', 'COMPANION_MODEL');

const MAX_OUTPUT_TOKENS = outputTokenBudget(process.env.ASSISTANT_MAX_TOKENS);

const getCoachActionInstruction = (coachAction) => {
  const instructions = {
    mainIdea: 'Return exactly one sentence that states the passage central claim or main idea. Do not mention answer choices and do not reveal the correct answer.',
    lineByLine: 'Break down the passage line by line in concise bullets. For each sentence or logical chunk, explain what it contributes to the author purpose and how it helps answer the question.',
    choiceAnalysis: 'Analyze answer choices A-D one by one. Label each as correct, trap, unsupported, too broad, too narrow, or opposite, then give a concise reason. You may identify the correct answer because the student requested answer-choice analysis.',
    hint: 'Give one strategic hint that points the student toward the right reasoning path without naming, implying, or eliminating the correct answer choice.',
    whyWins: 'Explain why the correct answer wins and why the closest distractors lose. If the student selected an answer, mention whether that selection matches the answer key and what to learn from it.',
  };

  return instructions[coachAction] || instructions.mainIdea;
};

const extractResponseText = (response) => {
  if (response?.output_text) return response.output_text;

  if (Array.isArray(response?.output)) {
    const messageOutput = response.output.find(item => item.type === 'message');
    const textContent = messageOutput?.content?.find(item => item.type === 'output_text');
    if (textContent?.text) return textContent.text;
  }

  return '';
};

const normalizeOpenAIUsage = (usage = {}) => ({
  prompt_tokens: usage.prompt_tokens ?? usage.input_tokens ?? 0,
  completion_tokens: usage.completion_tokens ?? usage.output_tokens ?? 0,
  total_tokens: usage.total_tokens ?? 0,
});

/**
 * Chat with the SmartQuiz AI assistant (OpenAI) about the current question
 * @param {Object} params - Parameters for the assistant
 * @param {Object} params.question - The current question object (text, options, correctAnswer)
 * @param {Array} params.history - The chat history (array of {role: 'user'/'model', parts: [{text: 'message'}]})
 * @param {boolean} params.tipRequested - Whether the user requested a tip
 * @param {boolean} params.summariseRequested - Whether the user requested a text summary
 * @param {string} params.coachAction - Optional typed study coach action
 * @param {boolean} params.primingCall - Whether this is a priming call for context-setting prompts and responses
 * @returns {Promise<Object>} - Object containing the assistant's response { message: '...', usage: {...} }
 */
exports.chatWithAssistant = async ({ question: userQuestion, questionDetails = {}, history = [], tipRequested = false, summariseRequested = false, coachAction = null, primingCall = false }) => {
  // Extract question details - might be in question or questionDetails param depending on caller
  const currentQuestion = typeof userQuestion === 'string'
    ? (questionDetails || {})
    : { ...(questionDetails || {}), ...(userQuestion || {}) };

  if (primingCall) {
    return {
      message: 'Assistant context primed.',
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
  }

  const openai = getOpenAIClient();
  const modelName = getAssistantModelName();
  
  try {
    const systemPrompt = `You are a friendly, precise SAT tutor AI.
Help students understand the current SAT question with concise reasoning and useful strategy.
Do not reveal the correct answer unless the student explicitly asks for it, the selected coach action allows it, or the student is clearly asking for direct answer analysis.`;

    let prompt = `Current quiz question:
Passage or stimulus: "${currentQuestion.passage || currentQuestion.stimulus || currentQuestion.text || 'No passage text provided'}"
Question prompt: "${currentQuestion.prompt || currentQuestion.question || currentQuestion.text || 'No question text provided'}"
Options: ${JSON.stringify(currentQuestion.options || ['No options provided'])}
Correct answer: "${currentQuestion.correctAnswer ?? 'Unknown'}"
Explanation from the source, if available: "${currentQuestion.explanation || 'No explanation provided'}"
Student selected: "${currentQuestion.selectedAnswerText || 'No answer selected yet'}"
Skill focus: "${currentQuestion.skillLabel || currentQuestion.subcategory || 'General SAT practice'}"`;

    if (coachAction) {
      prompt += `\n\nCoach action requested: ${coachAction}.\n${getCoachActionInstruction(coachAction)}`;
      if (currentQuestion.coachPrompt) {
        prompt += `\n\nDetailed coach context:\n${currentQuestion.coachPrompt}`;
      }
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

    const response = await openai.responses.create({
      model: modelName,
      reasoning: reasoningConfig(),
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      store: false,
      max_output_tokens: MAX_OUTPUT_TOKENS,
    });

    const assistantMessage = extractResponseText(response);
    if (!assistantMessage) {
      throw new Error('No content returned from OpenAI assistant response.');
    }
    
    return {
      message: assistantMessage,
      usage: normalizeOpenAIUsage(response.usage)
    };
  } catch (error) {
    console.error('Error chatting with OpenAI assistant:', error);
    // Provide a more useful error message for debugging
    const errorMessage = 'Sorry, I encountered an error trying to reach the OpenAI assistant.';
    
    if (error.message) {
      console.error('Error message:', error.message);
      // Don't expose internal error details to the client
    }
    
    throw new Error(errorMessage);
  }

    // This block has been moved into the main try-catch above
};

// --- Legacy placeholder functions ---

exports.generateConceptAnalysis = async (wrongQuestions, subcategory) => {
  console.warn('generateConceptAnalysis placeholder in aiService; the live implementation lives in openaiService.js.');

  return { concepts: [{ name: 'Placeholder Concept', explanation: 'This placeholder is superseded by openaiService.js.' }] };
};

exports.generateConceptDrill = async (conceptId, conceptName, explanation, difficulty, subcategory) => {
  console.warn('generateConceptDrill placeholder in aiService; the live implementation lives in openaiService.js.');

  return { questions: [{ text: 'Placeholder Question', options: ['A', 'B'], correctAnswer: 'A', explanation: 'This placeholder is superseded by openaiService.js.' }] };
};

/**
 * Identify challenging vocabulary words in a quiz question and provide definitions
 * @param {Object} params - Parameters for vocabulary analysis
 * @param {Object} params.questionContent - The question content to analyze (text and options)
 * @returns {Promise<Array>} - Array of word objects { word: string, definition: string }
 */
exports.getVocabularyDefinitions = async ({ questionContent }) => {
  const openai = getOpenAIClient();
  const modelName = getVocabularyModelName();

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

    console.log(`Requesting vocabulary analysis from OpenAI (${modelName})`);

    const response = await openai.responses.create({
      model: modelName,
      reasoning: reasoningConfig(),
      input: [
        {
          role: 'system',
          content: 'You are an SAT vocabulary assistant. Return only a valid JSON array. No markdown fences, no commentary.'
        },
        { role: 'user', content: prompt }
      ],
      store: false,
      max_output_tokens: MAX_OUTPUT_TOKENS,
    });

    const responseText = extractResponseText(response).trim();
    if (!responseText) {
      throw new Error('No content returned from OpenAI vocabulary response.');
    }

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
    console.error('Error getting vocabulary definitions from OpenAI:', error);
    throw new Error('Failed to analyze vocabulary. Please try again.');
  }
};
