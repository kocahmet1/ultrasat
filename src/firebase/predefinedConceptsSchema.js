/**
 * Firebase Firestore Database Schema for Predefined Concepts
 * This defines the standardized concept system where each subcategory has predefined concepts
 * that the LLM selects from instead of generating arbitrary concept names.
 */

// Collection: predefinedConcepts
// Purpose: Stores standardized concepts for each subcategory
/*
{
  id: string,                    // Auto-generated Firestore ID
  subcategoryId: string,         // The subcategory this concept belongs to (kebab-case)
  conceptId: string,             // Unique identifier for this concept (camelCase, e.g., "quadraticFormula")
  name: string,                  // Display name of the concept (e.g., "Quadratic Formula")
  description: string,           // Detailed explanation of the concept
  difficulty: number,            // Difficulty level 1-3 (optional, for future use)
  keywords: array,               // Array of keywords associated with this concept
  createdAt: timestamp,          // When this concept was added
  updatedAt: timestamp,          // When this concept was last modified
  source: string,                // Source of the concept ("collegeboard", "admin", "ai")
  active: boolean                // Whether this concept is currently active
}
*/

// Collection: questionConceptAssociations
// Purpose: Maps questions to their associated predefined concepts (selected by LLM)
/*
{
  id: string,                    // Auto-generated Firestore ID
  questionId: string,            // The question ID
  subcategoryId: string,         // The subcategory of the question
  conceptIds: array,             // Array of conceptId strings selected by LLM for this question
  selectedAt: timestamp,         // When the LLM made this selection
  llmModel: string,              // The LLM model used for selection
  confidence: number,            // LLM confidence score (optional)
  reviewedBy: string,            // If manually reviewed ("admin" or null)
  lastUpdated: timestamp         // When this association was last updated
}
*/

// Subcollection: users/{uid}/conceptMastery/{subcategoryId}
// Purpose: Tracks user's mastery of predefined concepts
/*
{
  conceptId: string,             // The concept ID (document ID)
  subcategoryId: string,         // The subcategory this belongs to
  masteryLevel: number,          // 0 = not attempted, 1 = struggling, 2 = understanding, 3 = mastered
  questionsAttempted: number,    // Number of questions attempted involving this concept
  questionsCorrect: number,      // Number of questions answered correctly involving this concept
  accuracy: number,              // Calculated accuracy (questionsCorrect / questionsAttempted)
  lastEncountered: timestamp,    // When user last encountered this concept
  firstEncountered: timestamp,   // When user first encountered this concept
  strugglingStreak: number,      // Consecutive incorrect answers involving this concept
  masteredAt: timestamp,         // When this concept was marked as mastered (if applicable)
}
*/

export const CONCEPT_MASTERY_LEVELS = {
  NOT_ATTEMPTED: 0,
  STRUGGLING: 1,
  UNDERSTANDING: 2,
  MASTERED: 3
};

export const CONCEPT_DIFFICULTY_LEVELS = {
  BASIC: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3
};

export const CONCEPT_SOURCES = {
  COLLEGEBOARD: 'collegeboard',
  ADMIN: 'admin',
  AI_GENERATED: 'ai'
};

// Thresholds for concept mastery determination
export const MASTERY_THRESHOLDS = {
  MIN_QUESTIONS_FOR_MASTERY: 3,        // Minimum questions needed to be considered for mastery
  ACCURACY_THRESHOLD_MASTERY: 0.8,     // 80% accuracy needed for mastery
  ACCURACY_THRESHOLD_STRUGGLING: 0.4,   // Below 40% accuracy is considered struggling
  STRUGGLING_STREAK_THRESHOLD: 3       // 3 consecutive wrong answers triggers struggling status
}; 