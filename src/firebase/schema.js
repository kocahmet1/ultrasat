/**
 * Firebase Firestore Database Schema
 * This file outlines the data structure for the adaptive learning system
 */

// Collection: skillTags
// Purpose: Stores all available skill categories for question classification
/*
{
  id: string,            // Auto-generated Firestore ID
  name: string,          // Display name of the skill (e.g., "Algebra", "Vocabulary in Context")
  category: string,      // Higher-level category (e.g., "Math", "Reading")
  description: string,   // Brief description of the skill
  createdAt: timestamp,  // When this skill was added
  updatedAt: timestamp   // When this skill was last modified
}
*/

// Collection: questions
// Purpose: Stores SAT questions with skill classifications
/*
{
  id: string,                // Auto-generated Firestore ID
  text: string,              // The actual question text
  questionType: string,      // "multiple-choice" or "user-input" (default: "multiple-choice")
  options: array,            // Answer choices (only for multiple-choice questions)
  correctAnswer: string,     // The correct answer (for multiple-choice: option text; for user-input: actual answer)
  acceptedAnswers: array,    // Array of acceptable answer variations (for user-input questions)
  skillTags: array,          // Array of skill tag IDs this question relates to
  difficulty: number,        // 1-5 scale of difficulty
  module: string,            // Which exam module this belongs to (e.g., "Module 1", "Algebra Quiz 1")
  moduleType: string,        // "full-exam" or "targeted-quiz"
  explanation: string,       // Explanation of the answer (shown after completion)
  inputType: string,         // For user-input questions: "number", "text", "fraction" (default: "number")
  answerFormat: string,      // For user-input questions: format hint like "Enter as decimal" or "Simplify fraction"
  createdAt: timestamp,      // When this question was added
  updatedAt: timestamp       // When this question was last modified
}
*/

// Collection: userProgress
// Purpose: Tracks a user's performance on questions and skills
/*
{
  id: string,                // Auto-generated Firestore ID
  userId: string,            // Reference to the user
  questionId: string,        // Reference to the question answered
  isCorrect: boolean,        // Whether the user answered correctly
  timeSpent: number,         // Seconds spent on this question
  skillTags: array,          // Copied from question for easier querying
  moduleId: string,          // Which module/quiz this was part of
  attemptedAt: timestamp     // When this question was attempted
}
*/

// Collection: userSkillStats
// Purpose: Aggregated statistics on user performance by skill
/*
{
  id: string,                // Auto-generated Firestore ID
  userId: string,            // Reference to the user
  skillId: string,           // Reference to the skill
  totalAttempts: number,     // Total questions attempted for this skill
  correctAttempts: number,   // Correct answers for this skill
  accuracyRate: number,      // Percentage correct (0-100)
  averageTimeSpent: number,  // Average seconds per question
  lastUpdated: timestamp     // When these stats were last updated
}
*/

// Collection: studyResources
// Purpose: Educational resources categorized by skill
/*
{
  id: string,                // Auto-generated Firestore ID
  title: string,             // Resource title
  description: string,       // Brief description
  url: string,               // Link to the resource
  resourceType: string,      // "video", "article", "practice", etc.
  skillTags: array,          // Array of skill tag IDs this resource relates to
  difficulty: number,        // 1-5 scale of difficulty
  createdAt: timestamp,      // When this resource was added
  updatedAt: timestamp       // When this resource was last modified
}
*/

// Collection: targetedQuizzes
// Purpose: Small quizzes focused on specific skills
/*
{
  id: string,                // Auto-generated Firestore ID
  title: string,             // Quiz title
  description: string,       // Brief description
  skillTags: array,          // Array of skill tag IDs this quiz targets
  questionIds: array,        // Array of question IDs in this quiz
  difficulty: number,        // 1-5 scale of difficulty
  estimatedTime: number,     // Estimated minutes to complete
  createdAt: timestamp,      // When this quiz was added
  updatedAt: timestamp       // When this quiz was last modified
}
*/

// Collection: userRecommendations
// Purpose: AI-generated study recommendations for users
/*
{
  id: string,                // Auto-generated Firestore ID
  userId: string,            // Reference to the user
  weakSkills: array,         // Array of skill IDs the user needs to improve
  recommendedQuizzes: array, // Array of quiz IDs recommended
  recommendedResources: array, // Array of resource IDs recommended
  feedback: string,          // Personalized feedback message
  generatedAt: timestamp     // When these recommendations were generated
}
*/
