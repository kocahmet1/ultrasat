/**
 * Direct OpenAI API service for generating lessons and skill-focused quizzes
 * This bypasses Firebase Functions and makes direct API calls to OpenAI
 */

import { 
  getSubcategoryName, 
  getSubcategoryIdFromString,
  SUBCATEGORY_KEBAB_CASE
} from './subcategoryConstants';

// Default model to use
const DEFAULT_MODEL = 'o4-mini';

/**
 * Get the OpenAI API key from environment variables
 * In development, this should be in a .env file
 * In production on Render.com, set this as an environment variable
 */
const getApiKey = () => {
  return process.env.REACT_APP_OPENAI_API_KEY || '';
};

/**
 * Get the OpenAI model to use
 * In development, this can be in a .env file
 * In production on Render.com, set this as an environment variable
 */
const getModel = () => {
  return process.env.REACT_APP_OPENAI_MODEL || DEFAULT_MODEL;
};

/**
 * Generate a lesson for a specific skill using OpenAI
 * @param {string} skillTag The skill tag to generate a lesson for
 * @returns {Promise<Object>} The generated lesson
 */
export const generateLesson = async (skillTag) => {
  const apiKey = getApiKey();
  
  // If no API key is available, throw an error
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Add REACT_APP_OPENAI_API_KEY to your environment variables.');
  }
  
  try {
    const model = getModel();
    console.log(`Generating lesson for ${skillTag} using model ${model}`);
    
    // Use the Responses API specifically for o4-mini which is a reasoning model
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
            content: 'You are an expert SAT tutor who creates clear, concise, and effective lessons. Format your response in HTML.'
          },
          {
            role: 'user',
            content: `Create a comprehensive lesson about the SAT skill "${skillTag}". Include key concepts, common errors, and practice strategies. Format as HTML with h2, h3, p, ul, and li tags.`
          }
        ],
        max_output_tokens: 100000
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate lesson');
    }
    
    // Log the full response structure for debugging
    console.log('API Response structure:', JSON.stringify(data, null, 2));
    
    // Extract content based on the actual API response structure
    let lessonContent = '';
    
    // New response structure for o4-mini
    if (data.output && Array.isArray(data.output)) {
      // Look for a message type output
      const messageOutput = data.output.find(item => item.type === 'message');
      if (messageOutput && messageOutput.content && Array.isArray(messageOutput.content)) {
        // Get the text from the first content item
        const textContent = messageOutput.content.find(item => item.type === 'output_text');
        if (textContent && textContent.text) {
          lessonContent = textContent.text;
        }
      }
    } 
    // Fallbacks for other response structures
    if (!lessonContent) {
      lessonContent = data.output_text || 
                    (data.output && data.output.text) || 
                    (data.completion && data.completion.text) || 
                    '';  
    }
    
    if (!lessonContent) {
      console.warn('Could not extract lesson content from API response:', data);
    }
    
    // Format the lesson with a proper title
    const humanReadableSkill = skillTag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      title: `Understanding ${humanReadableSkill}`,
      html: `<div class="lesson-content">${lessonContent}</div>`,
      generatedAt: new Date(),
      validated: true,
      tokenCost: data.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error('Error generating lesson:', error);
    throw new Error(`Failed to generate lesson: ${error.message}`);
  }
};

/**
 * Generate a skill-focused quiz using OpenAI
 * @param {Object} params Parameters for generating the quiz
 * @param {string|number} params.subcategory The skill subcategory (can be numeric ID or string name)
 * @param {string} params.questionText Optional question text to base the quiz on
 * @returns {Promise<Object>} The generated quiz
 */
export const generateSkillQuiz = async ({ subcategory, questionText = '' }) => {
  try {
    // Convert to numeric ID if it's not already one
    const subcategoryId = typeof subcategory === 'number' ? 
      subcategory : getSubcategoryIdFromString(subcategory);
      
    // Get the human-readable name for the prompt
    const subcategoryName = getSubcategoryName(subcategoryId);
    
    console.log(`Generating skill quiz for subcategory ID: ${subcategoryId} (${subcategoryName})`);
    
    if (!subcategoryId) {
      throw new Error('Valid subcategory is required to generate a skill quiz');
    }
    
    const apiKey = getApiKey();
    
    // If no API key is available, throw an error
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Add REACT_APP_OPENAI_API_KEY to your environment variables.');
    }
    
    try {
      const model = getModel();
      console.log(`Generating skill quiz for ${subcategory} using model ${model}`);
      
      const prompt = `
You are an SAT tutor creating a short quiz to help students practice ${subcategoryName} skills.

For context, this is from the ${subcategoryName} category of SAT problems.

${questionText ? `Use the following question/text as a reference for generating similar questions: ${questionText}

` : ''}
Create 3 questions that focus on ${subcategoryName} with the following requirements:

1. Include an appropriate difficulty rating (1=easy, 2=medium, 3=hard) for each question
2. Provide 4 answer choices (A, B, C, D) for each question
3. Indicate the correct answer
4. Include a brief explanation for the correct answer
5. Make sure the questions are grade-appropriate for high school students

Return your response as a valid JSON object with this exact format:
{
  "title": "Practice Quiz: ${subcategoryName}",
  "description": "A brief description of the quiz that mentions ${subcategoryName}",
  "questions": [
    {
      "questionText": "The full question text goes here",
      "difficulty": 1,
      "choices": [
        "A. First answer choice",
        "B. Second answer choice",
        "C. Third answer choice",
        "D. Fourth answer choice"
      ],
      "correctAnswer": "A",
      "explanation": "Why A is the correct answer"
    }
  ]
}

Make sure the questions test different aspects of ${subcategoryName} skills.
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
              content: 'You are an expert SAT tutor who creates effective practice questions. Return your response only as a valid JSON object with no additional explanation.'
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
        throw new Error(data.error?.message || 'Failed to generate quiz');
      }
      
      // Log the full response structure for debugging
      console.log('Quiz API Response structure:', JSON.stringify(data, null, 2));
      
      // Extract content based on the actual API response structure
      let contentText = '';
      
      // New response structure for o4-mini
      if (data.output && Array.isArray(data.output)) {
        // Look for a message type output
        const messageOutput = data.output.find(item => item.type === 'message');
        if (messageOutput && messageOutput.content && Array.isArray(messageOutput.content)) {
          // Get the text from the first content item
          const textContent = messageOutput.content.find(item => item.type === 'output_text');
          if (textContent && textContent.text) {
            contentText = textContent.text;
          }
        }
      } 
      // Fallbacks for other response structures
      if (!contentText) {
        contentText = data.output_text || 
                     (data.output && data.output.text) || 
                     (data.completion && data.completion.text) || 
                     '';  
      }
                       
      if (!contentText) {
        console.warn('Could not extract quiz content from API response:', data);
        throw new Error('Failed to extract content from API response');
      }
      
      // Extract the JSON response
      const startIndex = contentText.indexOf('{');
      const endIndex = contentText.lastIndexOf('}') + 1;
      const jsonContent = contentText.slice(startIndex, endIndex);
      
      // Parse the JSON response
      const quizData = JSON.parse(jsonContent);
      
      // Add generated timestamp and other metadata
      return {
        ...quizData,
        // Store both numeric ID and string formats for maximum compatibility
        subcategoryId: subcategoryId,
        subcategory: SUBCATEGORY_KEBAB_CASE[subcategoryId],
        subcategoryName: subcategoryName,
        skillTag: subcategoryId, // Keep legacy field but use numeric ID
        generatedAt: new Date(),
        source: 'openai'
      };
    } catch (error) {
      console.error('Error generating skill quiz:', error);
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  } catch (error) {
    console.error('Error generating skill quiz:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};
