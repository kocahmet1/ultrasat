/**
 * Firebase Services for Predefined Concepts System
 * Provides functions for managing standardized concepts and their associations with questions
 */

import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  CONCEPT_MASTERY_LEVELS, 
  CONCEPT_DIFFICULTY_LEVELS, 
  CONCEPT_SOURCES,
  MASTERY_THRESHOLDS 
} from './predefinedConceptsSchema';

/**
 * Creates or updates a predefined concept
 * @param {string} subcategoryId - The subcategory this concept belongs to
 * @param {string} conceptId - Unique identifier for this concept
 * @param {string} name - Display name of the concept
 * @param {string} description - Detailed explanation
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - The document ID
 */
export const createPredefinedConcept = async (subcategoryId, conceptId, name, description, options = {}) => {
  try {
    const conceptData = {
      subcategoryId,
      conceptId,
      name,
      description,
      difficulty: options.difficulty || CONCEPT_DIFFICULTY_LEVELS.INTERMEDIATE,
      keywords: options.keywords || [],
      source: options.source || CONCEPT_SOURCES.ADMIN,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const conceptRef = await addDoc(collection(db, 'predefinedConcepts'), conceptData);
    return conceptRef.id;
  } catch (error) {
    console.error('Error creating predefined concept:', error);
    throw error;
  }
};

/**
 * Gets all predefined concepts for a specific subcategory
 * @param {string} subcategoryId - The subcategory ID
 * @param {boolean} activeOnly - Whether to return only active concepts
 * @returns {Promise<Array>} - Array of concept objects
 */
export const getPredefinedConceptsBySubcategory = async (subcategoryId, activeOnly = true) => {
  try {
    let q = query(
      collection(db, 'predefinedConcepts'),
      where('subcategoryId', '==', subcategoryId),
      orderBy('name')
    );

    if (activeOnly) {
      q = query(
        collection(db, 'predefinedConcepts'),
        where('subcategoryId', '==', subcategoryId),
        where('active', '==', true),
        orderBy('name')
      );
    }

    const snapshot = await getDocs(q);
    const concepts = [];
    
    snapshot.forEach(doc => {
      concepts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return concepts;
  } catch (error) {
    console.error('Error getting predefined concepts:', error);
    throw error;
  }
};

/**
 * Gets a specific predefined concept by its conceptId
 * @param {string} conceptId - The conceptId to search for
 * @returns {Promise<Object|null>} - The concept object or null
 */
export const getPredefinedConceptByConceptId = async (conceptId) => {
  try {
    const q = query(
      collection(db, 'predefinedConcepts'),
      where('conceptId', '==', conceptId),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting predefined concept by conceptId:', error);
    throw error;
  }
};

/**
 * Associates predefined concepts with a question
 * @param {string} questionId - The question ID
 * @param {string} subcategoryId - The subcategory of the question
 * @param {Array} conceptIds - Array of conceptId strings selected by LLM
 * @param {Object} metadata - Additional metadata (llmModel, confidence, etc.)
 * @returns {Promise<string>} - The association document ID
 */
export const associateConceptsWithQuestion = async (questionId, subcategoryId, conceptIds, metadata = {}) => {
  try {
    const associationData = {
      questionId,
      subcategoryId,
      conceptIds,
      selectedAt: serverTimestamp(),
      llmModel: metadata.llmModel || 'gemini-pro',
      confidence: metadata.confidence || null,
      reviewedBy: metadata.reviewedBy || null,
      lastUpdated: serverTimestamp()
    };

    const associationRef = await addDoc(collection(db, 'questionConceptAssociations'), associationData);
    return associationRef.id;
  } catch (error) {
    console.error('Error associating concepts with question:', error);
    throw error;
  }
};

/**
 * Gets the concept association for a specific question
 * @param {string} questionId - The question ID
 * @returns {Promise<Object|null>} - The association object or null
 */
export const getConceptAssociationForQuestion = async (questionId) => {
  try {
    const q = query(
      collection(db, 'questionConceptAssociations'),
      where('questionId', '==', questionId),
      orderBy('lastUpdated', 'desc')
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0]; // Get the most recent association
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting concept association for question:', error);
    throw error;
  }
};

/**
 * Updates user's concept mastery based on question performance
 * @param {string} userId - The user ID
 * @param {string} subcategoryId - The subcategory
 * @param {Array} conceptIds - Array of conceptId strings involved in the question
 * @param {boolean} isCorrect - Whether the user answered correctly
 * @returns {Promise<void>}
 */
export const updateConceptMastery = async (userId, subcategoryId, conceptIds, isCorrect) => {
  try {
    const batch = writeBatch(db);
    
    for (const conceptId of conceptIds) {
      const masteryRef = doc(db, 'users', userId, 'conceptMastery', `${subcategoryId}_${conceptId}`);
      const masteryDoc = await getDoc(masteryRef);
      
      let masteryData;
      
      if (masteryDoc.exists()) {
        // Update existing mastery record
        const currentData = masteryDoc.data();
        const newQuestionsAttempted = (currentData.questionsAttempted || 0) + 1;
        const newQuestionsCorrect = (currentData.questionsCorrect || 0) + (isCorrect ? 1 : 0);
        const newAccuracy = newQuestionsCorrect / newQuestionsAttempted;
        
        masteryData = {
          ...currentData,
          questionsAttempted: newQuestionsAttempted,
          questionsCorrect: newQuestionsCorrect,
          accuracy: newAccuracy,
          lastEncountered: serverTimestamp()
        };
        
        // Update struggling streak
        if (isCorrect) {
          masteryData.strugglingStreak = 0;
        } else {
          masteryData.strugglingStreak = (currentData.strugglingStreak || 0) + 1;
        }
        
        // Determine mastery level
        masteryData.masteryLevel = determineMasteryLevel(masteryData);
        
        // Set mastered timestamp if just mastered
        if (masteryData.masteryLevel === CONCEPT_MASTERY_LEVELS.MASTERED && 
            currentData.masteryLevel !== CONCEPT_MASTERY_LEVELS.MASTERED) {
          masteryData.masteredAt = serverTimestamp();
        }
        
      } else {
        // Create new mastery record
        masteryData = {
          conceptId,
          subcategoryId,
          questionsAttempted: 1,
          questionsCorrect: isCorrect ? 1 : 0,
          accuracy: isCorrect ? 1.0 : 0.0,
          firstEncountered: serverTimestamp(),
          lastEncountered: serverTimestamp(),
          strugglingStreak: isCorrect ? 0 : 1,
          masteryLevel: isCorrect ? CONCEPT_MASTERY_LEVELS.UNDERSTANDING : CONCEPT_MASTERY_LEVELS.STRUGGLING,
          masteredAt: null
        };
        
        // Check if immediately mastered (unlikely with 1 question, but possible)
        masteryData.masteryLevel = determineMasteryLevel(masteryData);
        if (masteryData.masteryLevel === CONCEPT_MASTERY_LEVELS.MASTERED) {
          masteryData.masteredAt = serverTimestamp();
        }
      }
      
      batch.set(masteryRef, masteryData, { merge: true });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error updating concept mastery:', error);
    throw error;
  }
};

/**
 * Determines mastery level based on performance data
 * @param {Object} masteryData - The mastery data object
 * @returns {number} - The mastery level
 */
function determineMasteryLevel(masteryData) {
  const { questionsAttempted, accuracy, strugglingStreak } = masteryData;
  
  // Not enough data yet
  if (questionsAttempted < MASTERY_THRESHOLDS.MIN_QUESTIONS_FOR_MASTERY) {
    if (accuracy >= MASTERY_THRESHOLDS.ACCURACY_THRESHOLD_MASTERY) {
      return CONCEPT_MASTERY_LEVELS.UNDERSTANDING;
    } else if (accuracy < MASTERY_THRESHOLDS.ACCURACY_THRESHOLD_STRUGGLING) {
      return CONCEPT_MASTERY_LEVELS.STRUGGLING;
    } else {
      return CONCEPT_MASTERY_LEVELS.UNDERSTANDING;
    }
  }
  
  // Check for struggling status
  if (strugglingStreak >= MASTERY_THRESHOLDS.STRUGGLING_STREAK_THRESHOLD || 
      accuracy < MASTERY_THRESHOLDS.ACCURACY_THRESHOLD_STRUGGLING) {
    return CONCEPT_MASTERY_LEVELS.STRUGGLING;
  }
  
  // Check for mastery
  if (accuracy >= MASTERY_THRESHOLDS.ACCURACY_THRESHOLD_MASTERY) {
    return CONCEPT_MASTERY_LEVELS.MASTERED;
  }
  
  // Default to understanding
  return CONCEPT_MASTERY_LEVELS.UNDERSTANDING;
}

/**
 * Gets user's struggling concepts across all subcategories
 * @param {string} userId - The user ID
 * @param {number} limit - Maximum number of concepts to return
 * @returns {Promise<Array>} - Array of struggling concept objects
 */
export const getUserStrugglingConcepts = async (userId, limit = 10) => {
  try {
    const masteryCollection = collection(db, 'users', userId, 'conceptMastery');
    const q = query(
      masteryCollection,
      where('masteryLevel', '==', CONCEPT_MASTERY_LEVELS.STRUGGLING),
      orderBy('lastEncountered', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const strugglingConcepts = [];
    
    for (const doc of snapshot.docs) {
      const masteryData = doc.data();
      
      // Get the full concept details
      const concept = await getPredefinedConceptByConceptId(masteryData.conceptId);
      
      if (concept) {
        strugglingConcepts.push({
          ...masteryData,
          conceptDetails: concept,
          documentId: doc.id
        });
      }
      
      if (strugglingConcepts.length >= limit) break;
    }
    
    return strugglingConcepts;
  } catch (error) {
    console.error('Error getting user struggling concepts:', error);
    throw error;
  }
};

/**
 * Bulk import predefined concepts from an array
 * @param {Array} concepts - Array of concept objects to import
 * @returns {Promise<Array>} - Array of created document IDs
 */
export const bulkImportPredefinedConcepts = async (concepts) => {
  try {
    const batch = writeBatch(db);
    const createdIds = [];
    
    for (const concept of concepts) {
      const conceptRef = doc(collection(db, 'predefinedConcepts'));
      const conceptData = {
        ...concept,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      batch.set(conceptRef, conceptData);
      createdIds.push(conceptRef.id);
    }
    
    await batch.commit();
    return createdIds;
  } catch (error) {
    console.error('Error bulk importing predefined concepts:', error);
    throw error;
  }
}; 