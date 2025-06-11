/**
 * OpenAI API service for the API server
 * Provides functions for analyzing quiz results, generating concept-based questions,
 * and powering the SmartQuiz AI assistant
 */

const fetch = require('node-fetch');
const { normalizeSubcategoryName } = require('../src/utils/subcategoryUtils');

// Default models to use
const DEFAULT_MODEL = 'o4-mini';
const DEFAULT_ASSISTANT_MODEL = process.env.OPENAI_ASSISTANT_MODEL || 'gpt-3.5-turbo';

// Default token limits
const DEFAULT_MAX_TOKENS = parseInt(process.env.OPENAI_ASSISTANT_MAX_TOKENS || '750', 10);

/**
 * Get the OpenAI API key from environment variables
 */
const getApiKey = () => {
  return process.env.OPENAI_API_KEY || '';
};

/**
 * Get the OpenAI model to use
 */
const getModel = () => {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
};

/**
 * Get the OpenAI model to use for the assistant
 */
const getAssistantModel = () => {
  return process.env.OPENAI_ASSISTANT_MODEL || DEFAULT_ASSISTANT_MODEL;
};

/**
 * Analyzes wrong answers and identifies concepts that need improvement
 * @param {Array} wrongQuestions - Array of questions the user got wrong
 * @param {string} subcategory - The subcategory of the quiz
 * @returns {Promise<Object>} - Object containing identified concepts
 */
exports.generateConceptAnalysis = async (wrongQuestions, subcategory) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Set OPENAI_API_KEY in environment variables.');
  }
  
  try {
    const model = getModel();
    const normalizedSubcategory = normalizeSubcategoryName(subcategory);
    
    // Format the wrong questions for the prompt
    const questionsText = wrongQuestions.map((q, index) => {
      return `Question ${index + 1}: ${q.text}
Correct Answer: ${q.correctAnswer}
User's Answer: ${q.userAnswer || 'Not provided'}`;
    }).join('\n\n');
    
    const prompt = `
You are an expert SAT tutor analyzing a student's performance on a quiz about "${normalizedSubcategory}".

Here are the questions the student answered incorrectly:

${questionsText}

I need you to:
1. Identify the specific concepts within "${normalizedSubcategory}" that the student is struggling with based on these wrong answers
2. For each concept, provide a clear name and a detailed explanation that would help the student understand it better
3. Format your explanations with HTML for better readability (use h2, h3, p, ul, li tags)
4. Focus on 1-3 key concepts that would be most helpful for the student to work on

Return your response as a valid JSON object with this exact format:
{
  "concepts": [
    {
      "name": "Clear, concise concept name",
      "explanation": "HTML-formatted explanation of the concept, addressing the specific misunderstandings evident in the student's wrong answers"
    }
  ]
}
`;
    
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        reasoning: {
          effort: "high",
          summary: "auto"
        },
        input: [
          {
            role: 'system',
            content: 'You are an expert SAT tutor analyzing quiz results. Return your response only as a valid JSON object with no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_output_tokens: 100000
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to analyze quiz results');
    }
    
    // Extract content based on the API response structure
    let contentText = '';
    
    if (data.output && Array.isArray(data.output)) {
      const messageOutput = data.output.find(item => item.type === 'message');
      if (messageOutput && messageOutput.content && Array.isArray(messageOutput.content)) {
        const textContent = messageOutput.content.find(item => item.type === 'output_text');
        if (textContent && textContent.text) {
          contentText = textContent.text;
        }
      }
    }
    
    if (!contentText) {
      contentText = data.output_text || 
                   (data.output && data.output.text) || 
                   (data.completion && data.completion.text) || 
                   '';  
    }
    
    if (!contentText) {
      throw new Error('Failed to extract content from API response');
    }
    
    // Extract the JSON response
    const startIndex = contentText.indexOf('{');
    const endIndex = contentText.lastIndexOf('}') + 1;
    const jsonContent = contentText.slice(startIndex, endIndex);
    
    // Parse the JSON response
    const analysisData = JSON.parse(jsonContent);
    
    return analysisData;
  } catch (error) {
    console.error('Error generating concept analysis:', error);
    throw new Error(`Failed to analyze quiz results: ${error.message}`);
  }
};

/**
 * Generates questions for a specific concept
 * @param {string} conceptId - The concept ID
 * @param {string} conceptName - The display name of the concept
 * @param {string} explanation - The explanation of the concept
 * @param {number} difficulty - The difficulty level (1-3)
 * @param {string} subcategory - The parent subcategory
 * @returns {Promise<Object>} - Object containing generated questions
 */
exports.generateConceptDrill = async (conceptId, conceptName, explanation, difficulty, subcategory) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Set OPENAI_API_KEY in environment variables.');
  }
  
  try {
    const model = getModel();
    const normalizedSubcategory = normalizeSubcategoryName(subcategory);
    
    const difficultyDesc = difficulty === 1 ? 'easy' : difficulty === 2 ? 'medium' : 'challenging';
    
    const prompt = `
You are an expert SAT question creator. Create a focused set of 5 practice questions for a student who needs to improve their understanding of the concept "${conceptName}" within the subcategory "${normalizedSubcategory}".

Here's an explanation of the concept the student needs to work on:
${explanation.replace(/<[^>]*>/g, '')}

Create 5 ${difficultyDesc} level SAT-style questions that specifically test this concept. Questions should:
1. Be directly relevant to the concept
2. Progress in difficulty (if appropriate)
3. Include clear explanations addressing common misconceptions
4. Match authentic SAT format and style
5. Be appropriate for high school students

Return your response as a valid JSON object with this exact format:
{
  "questions": [
    {
      "text": "The full question text goes here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation of why A is correct and addressing misconceptions"
    }
  ]
}
`;
    
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        reasoning: {
          effort: "high",
          summary: "auto"
        },
        input: [
          {
            role: 'system',
            content: 'You are an expert SAT question creator. Return your response only as a valid JSON object with no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_output_tokens: 100000
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate concept questions');
    }
    
    // Extract content based on the API response structure
    let contentText = '';
    
    if (data.output && Array.isArray(data.output)) {
      const messageOutput = data.output.find(item => item.type === 'message');
      if (messageOutput && messageOutput.content && Array.isArray(messageOutput.content)) {
        const textContent = messageOutput.content.find(item => item.type === 'output_text');
        if (textContent && textContent.text) {
          contentText = textContent.text;
        }
      }
    }
    
    if (!contentText) {
      contentText = data.output_text || 
                   (data.output && data.output.text) || 
                   (data.completion && data.completion.text) || 
                   '';  
    }
    
    if (!contentText) {
      throw new Error('Failed to extract content from API response');
    }
    
    // Extract the JSON response
    const startIndex = contentText.indexOf('{');
    const endIndex = contentText.lastIndexOf('}') + 1;
    const jsonContent = contentText.slice(startIndex, endIndex);
    
    // Parse the JSON response
    const drillData = JSON.parse(jsonContent);
    
    return {
      ...drillData,
      conceptId,
      conceptName,
      difficulty,
      subcategory: normalizedSubcategory,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating concept drill:', error);
    throw new Error(`Failed to generate concept questions: ${error.message}`);
  }
};

/**
 * Chat with the SmartQuiz AI assistant about the current question
 * @param {Object} params - Parameters for the assistant
 * @param {Object} params.question - The current question object
 * @param {Array} params.history - The chat history
 * @param {boolean} params.tipRequested - Whether the user requested a tip
 * @param {string} params.modelOverride - Optional model override
 * @returns {Promise<Object>} - Object containing the assistant's response
 */
exports.chatWithAssistant = async ({ question, history = [], tipRequested = false, modelOverride = null }) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Set OPENAI_API_KEY in environment variables.');
  }
  
  try {
    const model = modelOverride || getAssistantModel();
    const maxTokens = DEFAULT_MAX_TOKENS;
    
    // Format the question for the prompt
    const questionText = question.text || '';
    const options = question.options || [];
    const optionsText = options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n');
    const correctAnswer = question.correctAnswer !== undefined ? 
      `${String.fromCharCode(65 + question.correctAnswer)}. ${options[question.correctAnswer]}` : 
      'Not provided';
    const explanation = question.explanation || 'Not provided';
    
    // Build system prompt
    let systemPrompt = `You are an expert SAT tutor helping a student with a SmartQuiz question. You provide helpful, concise guidance without revealing the answer directly.\n\nCurrent SAT question:\n---\n${questionText}\n\nOptions:\n${optionsText}\n\nCorrect Answer: ${correctAnswer}\nExplanation: ${explanation}\n---\n\n`;
    
    if (tipRequested) {
      systemPrompt += 'The student has requested a tip. Provide ONE concise, strategic hint that guides them toward figuring out the correct answer. DO NOT reveal the answer directly. Your hint should help develop their problem-solving skills.';
    } else {
      systemPrompt += 'Respond to the student\'s questions about this problem. Be helpful but avoid giving away the answer directly unless they have already attempted the question. If they ask for the answer directly, encourage them to try solving it first and offer a strategic hint instead.';
    }
    
    // Format chat history for the API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }))
    ];
    
    // Add a default user message if tip requested and no history
    if (tipRequested && history.length === 0) {
      messages.push({
        role: 'user',
        content: 'Can you give me a tip for this problem?'
      });
    }
    
    // Updated to use the Responses API which works with Project API keys
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        reasoning: {
          effort: "high",
          summary: "auto"
        },
        input: messages,
        max_output_tokens: maxTokens,
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get assistant response');
    }
    
    // Extract content based on the API response structure
    let contentText = '';
    
    if (data.output && Array.isArray(data.output)) {
      const messageOutput = data.output.find(item => item.type === 'message');
      if (messageOutput && messageOutput.content && Array.isArray(messageOutput.content)) {
        const textContent = messageOutput.content.find(item => item.type === 'output_text');
        if (textContent && textContent.text) {
          contentText = textContent.text;
        }
      }
    }
    
    if (!contentText) {
      contentText = data.output_text || 
                 (data.output && data.output.text) || 
                 (data.completion && data.completion.text) || 
                 "I apologize, but I couldn't generate a response. Please try again.";
    }
    
    // Return the message and usage stats
    return {
      message: contentText,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
  } catch (error) {
    console.error('Error getting assistant response:', error);
    throw new Error(`Failed to get assistant response: ${error.message}`);
  }
};
