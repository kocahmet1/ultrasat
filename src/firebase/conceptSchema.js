/**
 * Firebase Firestore Database Schema for Concepts
 * This file defines the new concept-based data structures for the integrated adaptive learning system
 */

// Collection: concepts
// Purpose: Stores fine-grained concepts within subcategories identified by AI
/*
{
  id: string,                // Concept ID (camelCase) - primary key
  subcategoryId: string,     // The parent subcategory this concept belongs to (kebab-case)
  name: string,              // Display name of the concept (human-readable)
  explanationHTML: string,   // HTML-formatted explanation of the concept
  createdBy: string,         // Source of the concept ("ai" or "admin")
  createdAt: timestamp,      // When this concept was added
  updatedAt: timestamp       // When this concept was last modified
}
*/

// Collection: conceptDrills
// Purpose: AI-generated practice drills focused on specific concepts
/*
{
  id: string,                // Auto-generated Firestore ID
  conceptId: string,         // Reference to the concept this drill targets
  questions: array,          // Array of 5 questions specifically focused on this concept
  aiModel: string,           // The AI model used to generate these questions (e.g., "o3-2025-04-16")
  difficulty: number,        // Difficulty level (1-3)
  createdAt: timestamp,      // When this drill was created
}
*/

// Collection: adaptiveQuizzes (extended)
// The existing collection now includes these additional fields:
/*
{
  // ...existing fields...
  wrongConcepts: array,      // Array of conceptIds that were incorrectly answered
  analysisComplete: boolean, // Whether AI analysis is complete for this quiz
}
*/

// Subcollection: users/{uid}/progress/{subcategoryId}
// Purpose: Tracks a user's progress through subcategories and concepts
/*
{
  level: number,             // Current level in this subcategory (1-3)
  mastered: boolean,         // Whether the subcategory is mastered
  conceptMastery: {          // Map of concepts to mastery status
    [conceptId]: boolean,    // Whether this specific concept is mastered
  },
  lastUpdated: timestamp     // When this progress was last updated
}
*/
