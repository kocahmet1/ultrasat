/**
 * Concept-related Firebase Services
 * Provides functions for managing concepts, concept drills, and concept mastery
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
  serverTimestamp,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { normalizeSubcategoryName } from '../utils/subcategoryUtils';

/**
 * Creates or updates a concept in the database
 * @param {string} conceptId - The concept ID (camelCase)
 * @param {string} subcategoryId - The parent subcategory (kebab-case)
 * @param {string} name - Human-readable name for the concept
 * @param {string} explanationHTML - HTML-formatted explanation
 * @param {string} createdBy - Source of the concept ("ai" or "admin")
 * @returns {Promise<string>} - The concept ID
 */
export const saveConceptToFirestore = async (conceptId, subcategoryId, name, explanationHTML, createdBy = "ai") => {
  try {
    const normalizedSubcategoryId = normalizeSubcategoryName(subcategoryId);
    const conceptRef = doc(db, 'concepts', conceptId);
    
    // Check if concept already exists
    const conceptDoc = await getDoc(conceptRef);
    
    if (conceptDoc.exists()) {
      // Update existing concept
      await updateDoc(conceptRef, {
        name,
        explanationHTML,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new concept
      await setDoc(conceptRef, {
        subcategoryId: normalizedSubcategoryId,
        name,
        explanationHTML,
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return conceptId;
  } catch (error) {
    console.error('Error saving concept:', error);
    throw error;
  }
};

/**
 * Retrieves a concept by its ID
 * @param {string} conceptId - The concept ID
 * @returns {Promise<Object|null>} - The concept data or null if not found
 */
export const getConceptById = async (conceptId) => {
  try {
    const conceptRef = doc(db, 'concepts', conceptId);
    const conceptDoc = await getDoc(conceptRef);
    
    if (conceptDoc.exists()) {
      return {
        id: conceptDoc.id,
        ...conceptDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting concept:', error);
    throw error;
  }
};

/**
 * Gets all concepts for a specific subcategory
 * @param {string} subcategoryId - The subcategory ID (kebab-case)
 * @returns {Promise<Array>} - Array of concept objects
 */
export const getConceptsBySubcategory = async (subcategoryId) => {
  try {
    const normalizedSubcategoryId = normalizeSubcategoryName(subcategoryId);
    const conceptsRef = collection(db, 'concepts');
    const q = query(
      conceptsRef,
      where('subcategoryId', '==', normalizedSubcategoryId),
      orderBy('name')
    );
    
    const conceptsSnapshot = await getDocs(q);
    const concepts = [];
    
    conceptsSnapshot.forEach(doc => {
      concepts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return concepts;
  } catch (error) {
    console.error('Error getting concepts by subcategory:', error);
    throw error;
  }
};

/**
 * Creates a concept drill in the database
 * @param {string} conceptId - The concept ID
 * @param {Array} questions - Array of question objects
 * @param {number} difficulty - Difficulty level (1-3)
 * @param {string} aiModel - The AI model used for generation
 * @returns {Promise<string>} - The concept drill ID
 */
export const createConceptDrill = async (conceptId, questions, difficulty, aiModel = "o3-2025-04-16") => {
  try {
    const conceptDrillsRef = collection(db, 'conceptDrills');
    
    const drillDoc = await addDoc(conceptDrillsRef, {
      conceptId,
      questions,
      difficulty,
      aiModel,
      createdAt: serverTimestamp()
    });
    
    return drillDoc.id;
  } catch (error) {
    console.error('Error creating concept drill:', error);
    throw error;
  }
};

/**
 * Gets the latest concept drill for a specific concept and difficulty
 * @param {string} conceptId - The concept ID
 * @param {number} difficulty - Difficulty level (1-3)
 * @returns {Promise<Object|null>} - The concept drill or null if not found
 */
export const getLatestConceptDrill = async (conceptId, difficulty) => {
  try {
    const conceptDrillsRef = collection(db, 'conceptDrills');
    const q = query(
      conceptDrillsRef,
      where('conceptId', '==', conceptId),
      where('difficulty', '==', difficulty),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const drillSnapshot = await getDocs(q);
    
    if (!drillSnapshot.empty) {
      const drillDoc = drillSnapshot.docs[0];
      return {
        id: drillDoc.id,
        ...drillDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting latest concept drill:', error);
    throw error;
  }
};

/**
 * Updates the wrongConcepts array for an adaptive quiz
 * @param {string} quizId - The adaptive quiz ID
 * @param {Array} conceptIds - Array of concept IDs identified in wrong answers
 * @returns {Promise<void>}
 */
export const updateQuizWithWrongConcepts = async (quizId, conceptIds) => {
  try {
    const quizRef = doc(db, 'adaptiveQuizzes', quizId);
    
    await updateDoc(quizRef, {
      wrongConcepts: conceptIds,
      analysisComplete: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating quiz with wrong concepts:', error);
    throw error;
  }
};

/**
 * Updates a user's concept mastery status
 * @param {string} userId - The user's ID
 * @param {string} subcategoryId - The subcategory ID
 * @param {string} conceptId - The concept ID
 * @param {boolean} mastered - Whether the concept is mastered
 * @returns {Promise<void>}
 */
export const updateConceptMastery = async (userId, subcategoryId, conceptId, mastered) => {
  try {
    const normalizedSubcategoryId = normalizeSubcategoryName(subcategoryId);
    const progressRef = doc(db, 'users', userId, 'progress', normalizedSubcategoryId);
    
    // Get current progress
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      // Update existing progress
      const progressData = progressDoc.data();
      const conceptMastery = progressData.conceptMastery || {};
      
      // Update the specific concept's mastery status
      conceptMastery[conceptId] = mastered;
      
      await updateDoc(progressRef, {
        conceptMastery,
        lastUpdated: serverTimestamp()
      });
    } else {
      // Create new progress document
      const conceptMastery = {};
      conceptMastery[conceptId] = mastered;
      
      await setDoc(progressRef, {
        level: 1,
        mastered: false,
        conceptMastery,
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating concept mastery:', error);
    throw error;
  }
};

/**
 * Gets all unmastered concepts for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of concept objects that are not mastered
 */
export const getUnmasteredConcepts = async (userId) => {
  try {
    // First get all subcategory progress documents
    const progressRef = collection(db, 'users', userId, 'progress');
    const progressSnapshot = await getDocs(progressRef);
    
    // Build map of concept mastery status
    const conceptMasteryMap = {};
    progressSnapshot.forEach(doc => {
      const progressData = doc.data();
      if (progressData.conceptMastery) {
        Object.entries(progressData.conceptMastery).forEach(([conceptId, mastered]) => {
          conceptMasteryMap[conceptId] = mastered;
        });
      }
    });
    
    // Get all concepts
    const conceptsRef = collection(db, 'concepts');
    const conceptsSnapshot = await getDocs(conceptsRef);
    
    // Filter to unmastered concepts
    const unmasteredConcepts = [];
    conceptsSnapshot.forEach(doc => {
      const conceptId = doc.id;
      // Include concept if not in mastery map or explicitly not mastered
      if (!conceptMasteryMap[conceptId] || conceptMasteryMap[conceptId] === false) {
        unmasteredConcepts.push({
          id: conceptId,
          ...doc.data()
        });
      }
    });
    
    return unmasteredConcepts;
  } catch (error) {
    console.error('Error getting unmastered concepts:', error);
    throw error;
  }
};
